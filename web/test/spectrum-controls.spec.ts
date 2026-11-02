import { expect, test } from "@playwright/test";
import { PANEL_DEFINITIONS } from "../src/panel-registry";

test("Spectrum span and RBW use frequency units while idle, running and changing windows", async ({ page }) => {
  await page.route("**/api/workspace", route => route.fulfill({ json: { workspace: {
    activePanelId: "spectrumanalyzer", layoutMode: "tabs",
    panels: Object.fromEntries(PANEL_DEFINITIONS.map(panel => [panel.id, { enabled: true }])),
  } } }));
  await page.goto("/");
  const span = page.locator("#spectrumanalyzer-span");
  const rbw = page.locator("#spectrumanalyzer-rbw");
  await expect(span).toBeVisible();
  await expect.poll(() => span.locator("option").count()).toBeGreaterThan(10);
  for (const selector of [span, rbw]) {
    const labels = await selector.locator("option").allTextContents();
    expect(labels.every(label => /Hz$/.test(label))).toBe(true);
    await expect.poll(() => selector.inputValue()).not.toBe("");
  }
  await expect(span.locator("option").first()).toHaveText("125 MHz");
  const wireSpan = (await span.locator("option").nth(7).getAttribute("value"))!;
  await span.selectOption(wireSpan);
  await expect.poll(async () => (await (await page.request.get("/api/modules/spectrumanalyzer")).json()).state.span).toBe(Number(wireSpan));

  for (const window of ["boxcar", "hamming", "flattop", "gaussian", "blackman"]) {
    await page.locator("#spectrumanalyzer-window").selectOption(window);
    await expect.poll(() => rbw.inputValue()).not.toBe("");
    expect(await rbw.evaluate(el => (el as HTMLSelectElement).selectedOptions[0].dataset.span)).toBe(wireSpan);
    if (window === "boxcar") expect(Number(await rbw.inputValue())).toBeCloseTo(Number(wireSpan) / 16384, 8);
  }
  // A browser-local window must map an RBW choice to the matching hardware span.
  await page.locator("#spectrumanalyzer-window").selectOption("boxcar");
  const target = await rbw.locator("option").nth(9).evaluate(el => ({ value: (el as HTMLOptionElement).value, span: (el as HTMLElement).dataset.span }));
  await rbw.selectOption(target.value);
  await expect.poll(async () => (await (await page.request.get("/api/modules/spectrumanalyzer")).json()).state.span).toBe(Number(target.span));
  await expect(span).toHaveValue(target.span!);
  await expect(rbw).toHaveValue(target.value);
  await page.locator("#spectrum-single").click();
  await expect.poll(async () => (await (await page.request.get("/api/modules/spectrumanalyzer")).json()).state.current_avg).toBeGreaterThan(0);
  await expect(rbw).toHaveValue(target.value);
  await page.screenshot({ path: "../.cache/spectrum-units-fixed.png" });

  // Check numeric toggle IDs, time quantities and nonempty selections elsewhere.
  await page.getByRole("button", { name: "IQ", exact: true }).click();
  const toggle = page.locator("#iq0-modulation-at-2f");
  await expect(toggle).toBeVisible();
  expect(await toggle.locator("option").allTextContents()).toEqual(["off", "on"]);
  await page.getByRole("button", { name: "Scope", exact: true }).click();
  expect((await page.locator("#scope-duration option").allTextContents()).every(label => /s$/.test(label) && !label.includes("Hz"))).toBe(true);
  const blank = await page.locator(".workspace-panel select").evaluateAll(selects => selects.filter(el => {
    const select = el as HTMLSelectElement;
    return select.options.length > 0 && select.selectedIndex < 0;
  }).map(el => el.id));
  expect(blank).toEqual([]);
});
