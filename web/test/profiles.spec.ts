import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const suffix = Date.now();

test.afterAll(async ({ request }) => {
  // Restore demo startup behavior for other tests sharing this fake backend.
  const config = await (await request.get("/api/config?module=pyrpl_websocket")).json();
  const text = config.text.split("\n").filter((line: string) => !/^(active_profile|profile_load_revision):/.test(line)).join("\n");
  await request.post("/api/config/branches/pyrpl_websocket", { data: { text } });
});

test("profiles save, rename, and load settings and update every page title", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator("#manage-profiles")).toBeVisible();
  await page.request.post("/api/modules/scope/attributes/threshold", { data: { value: 0.125 } });
  await page.locator("#manage-profiles").click();
  const dialog = page.getByRole("dialog", { name: "Profiles" });
  await dialog.getByLabel("Profile name", { exact: true }).fill(`Experiment A ${suffix}`);
  await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page).toHaveTitle(`Experiment A ${suffix} — PyRPL`);
  const profiles = await (await page.request.get("/api/profiles")).json();
  const id = profiles.active.id;
  const other = await context.newPage();
  await other.goto("/");
  await expect(other).toHaveTitle(`Experiment A ${suffix} — PyRPL`);

  await dialog.getByLabel("Profile name", { exact: true }).fill(`Renamed λ ${suffix}`);
  await dialog.getByRole("button", { name: "Rename selected", exact: true }).click();
  await expect(page.locator("#active-profile-name")).toHaveText(`Renamed λ ${suffix}`);
  await expect(other).toHaveTitle(`Renamed λ ${suffix} — PyRPL`);
  await dialog.getByRole("button", { name: "Close profiles" }).click();

  await page.request.post("/api/modules/scope/attributes/threshold", { data: { value: 0.5 } });
  await page.locator("#manage-profiles").click();
  await dialog.getByLabel("Saved profile", { exact: true }).selectOption(id);
  await dialog.getByRole("button", { name: "Load selected", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#active-profile-name")).toHaveText(`Renamed λ ${suffix}`);
  await expect.poll(async () => (await (await page.request.get("/api/modules/scope")).json()).state.threshold).toBe(0.125);
  await expect.poll(async () => (await (await page.request.get("/api/modules/scope")).json()).state.running_state).toBe("stopped");
  await expect(other.locator("#scope-threshold")).toHaveValue("0.125");
  await other.close();
});

test("profile dialog fits narrow and short screens and duplicate names are reported", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 420 });
  await page.goto("/");
  await page.locator("#manage-profiles").click();
  const dialog = page.getByRole("dialog", { name: "Profiles" });
  await dialog.getByLabel("Profile name", { exact: true }).fill(`Mobile ${suffix}`);
  await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page).toHaveTitle(`Mobile ${suffix} — PyRPL`);
  for (const button of await dialog.getByRole("button").all()) {
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeInViewport();
  }
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: "../.cache/profile-mobile.png" });
  await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("profile save preserves local channel visibility and workspace selection", async ({ page }) => {
  await page.goto("/");
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-scope-enabled").check();
  await page.locator(".menu-dropdown summary").click();
  await page.getByRole("button", { name: "Scope", exact: true }).click();
  await page.locator("#show-ch1").uncheck();
  await page.locator("#manage-profiles").click();
  const dialog = page.getByRole("dialog", { name: "Profiles" });
  await dialog.getByLabel("Profile name", { exact: true }).fill(`Views ${suffix}`);
  await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page).toHaveTitle(`Views ${suffix} — PyRPL`);
  await dialog.getByRole("button", { name: "Close profiles" }).click();
  await page.locator("#show-ch1").check();
  await page.locator("#manage-profiles").click();
  await dialog.getByRole("button", { name: "Load selected", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#show-ch1")).not.toBeChecked();
});

test("downloaded profiles upload as independent copies without applying settings", async ({ page }) => {
  await page.goto("/");
  await page.request.post("/api/modules/scope/attributes/threshold", { data: { value: 0.125 } });
  await page.locator("#manage-profiles").click();
  const dialog = page.getByRole("dialog", { name: "Profiles" });
  const name = `Portable ${suffix}`;
  await dialog.getByLabel("Color theme", { exact: true }).selectOption("plum");
  await dialog.getByLabel("Profile name", { exact: true }).fill(name);
  await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page.locator("#active-profile-name")).toHaveText(name);
  const downloaded = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download selected", exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe(`${name}.json`);
  const buffer = await readFile((await download.path())!);
  const profile = JSON.parse(buffer.toString("utf8"));
  expect(profile.settings.scope.threshold).toBe(0.125);
  expect(profile.settings.pyrpl_websocket.workspace.theme).toBe("plum");
  await dialog.getByLabel("Color theme", { exact: true }).selectOption("paper");
  await page.request.post("/api/modules/scope/attributes/threshold", { data: { value: 0.5 } });
  await dialog.getByLabel("Profile file (.json)", { exact: true }).setInputFiles({ name: "profile.json", mimeType: "application/json", buffer });
  await expect(dialog.getByRole("button", { name: "Upload file", exact: true })).toBeEnabled();
  await dialog.getByRole("button", { name: "Upload file", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  await dialog.getByLabel("Profile name", { exact: true }).fill(`${name} copy`);
  await dialog.getByRole("button", { name: "Upload file", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Upload file", exact: true })).toBeDisabled();
  await expect(dialog.locator("#profiles-select option:checked")).toHaveText(`${name} copy`);
  await expect(page.locator("#active-profile-name")).toHaveText(name);
  expect((await (await page.request.get("/api/modules/scope")).json()).state.threshold).toBe(0.5);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
  await dialog.getByRole("button", { name: "Load selected", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#active-profile-name")).toHaveText(`${name} copy`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "plum");
  await expect.poll(async () => (await (await page.request.get("/api/modules/scope")).json()).state.threshold).toBe(0.125);
  await page.locator("#manage-profiles").click();
  await dialog.getByLabel("Profile file (.json)", { exact: true }).setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("not JSON") });
  await expect(page.getByRole("alert")).toContainText("Choose a version 1 PyRPL profile JSON file");
  await expect(dialog.getByRole("button", { name: "Upload file", exact: true })).toBeDisabled();
});
