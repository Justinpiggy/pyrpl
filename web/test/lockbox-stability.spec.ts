import { expect, test, type Page } from "@playwright/test";

async function openLockbox(page: Page): Promise<void> {
  await page.request.post("/api/lockbox/actions/unlock");
  await page.request.post("/api/lockbox/class", { data: { classname: "Linear" } });
  await page.request.post("/api/lockbox/attributes/auto_lock", { data: { value: false } });
  await page.goto("/");
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-lockbox-enabled").setChecked(true);
  await page.locator(".menu-dropdown summary").click();
  await page.getByRole("button", { name: "Lockbox", exact: true }).click();
  await expect(page.locator("#lockbox-output-plot .uplot")).toHaveCount(2);
}

test("lockbox status and configuration updates preserve edits, controls, and plot nodes", async ({ page }) => {
  await openLockbox(page);
  const field = page.locator('#lockbox-stages [data-attribute="gain_factor"] input').first();
  const original = await field.elementHandle();
  const plot = await page.locator("#lockbox-output-plot .uplot").first().elementHandle();
  let plotRequests = 0;
  page.on("request", request => {
    if (/\/api\/lockbox\/.*\/(plot|transfer_function)$/.test(request.url())) plotRequests++;
  });
  await field.fill("12.345");
  for (let index = 0; index < 8; index++) {
    const response = await page.request.post("/api/lockbox/actions/is_locked");
    expect(response.ok()).toBeTruthy();
  }
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("12.345");
  expect(await original!.evaluate(element => element.isConnected)).toBe(true);
  expect(await plot!.evaluate(element => element.isConnected)).toBe(true);
  expect(plotRequests).toBe(0);

  const refreshed = page.waitForResponse(response => response.url().includes("/lockbox/outputs/output1/transfer_function"));
  await page.request.post("/api/lockbox/stages/0/attributes/setpoint", { data: { value: 0.25 } });
  await refreshed;
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("12.345");
  expect(await plot!.evaluate(element => element.isConnected)).toBe(true);
  await field.blur();
  await expect.poll(async () => {
    const schema = await (await page.request.get("/api/lockbox")).json();
    return schema.sequence[0].attributes.find((attribute: { name: string }) => attribute.name === "gain_factor").value;
  }).toBe(12.345);
});

test("unlock remains clickable during lockbox status updates", async ({ page }) => {
  await openLockbox(page);
  await page.locator("#lockbox-actions").getByRole("button", { name: "Lock", exact: true }).click();
  await expect(page.locator("#lockbox-status")).toContainText("lock_on");
  const unlock = page.locator("#lockbox-actions").getByRole("button", { name: "Unlock", exact: true });
  const original = await unlock.elementHandle();
  await unlock.hover();
  await page.mouse.down();
  await page.request.post("/api/lockbox/actions/is_locked");
  expect(await original!.evaluate(element => element.isConnected)).toBe(true);
  await page.mouse.up();
  await expect.poll(async () => (await (await page.request.get("/api/lockbox")).json()).state.current_state).toBe("unlock");
});

test("empty numeric edits do not silently write zero", async ({ page }) => {
  await openLockbox(page);
  const field = page.locator('#lockbox-stages [data-attribute="gain_factor"] input').first();
  const value = await field.inputValue();
  let writes = 0;
  page.on("request", request => {
    if (request.method() === "POST" && request.url().endsWith("/attributes/gain_factor")) writes++;
  });
  await field.fill("");
  await field.blur();
  await page.request.post("/api/lockbox/actions/is_locked");
  await expect(field).toHaveValue(value);
  expect(writes).toBe(0);
});

test("a delayed action response cannot overwrite a newer lockbox state", async ({ page }) => {
  await openLockbox(page);
  const oldSchema = await (await page.request.get("/api/lockbox")).json();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/lockbox/actions/lock", async route => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response, json: oldSchema });
  });
  await page.locator("#lockbox-actions").getByRole("button", { name: "Lock", exact: true }).click();
  try {
    await expect(page.locator("#lockbox-status")).toContainText("lock_on");
  } finally {
    release();
  }
  // A following HTTP status action also flushes the delayed response's UI work.
  await page.locator("#lockbox-actions").getByRole("button", { name: "is_locked?", exact: true }).click();
  await expect(page.locator("#lockbox-status")).toContainText("lock_on");
  await page.locator("#lockbox-actions").getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.locator("#lockbox-status")).toContainText("unlock");
});
