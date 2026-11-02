import { expect, test } from "@playwright/test";

test("all palettes update live plots without rebuilding, changing zoom, or writing hardware", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.waitForFunction(() => (window as any).pyrplScope?.getFrameSequence() > 0);
  await page.locator("#zoom-in").click();
  await page.locator("#zoom-y-in").click();
  await page.locator("#pan-right").click();
  const ranges = await page.evaluate(() => [(window as any).pyrplScope.getXRange(), (window as any).pyrplScope.getYRange()]);
  const canvas = await page.locator("#scope-plot canvas").elementHandle();
  const writes: string[] = [];
  page.on("request", request => {
    if (request.method() !== "GET" && /\/api\/(modules|lockbox|register)\//.test(request.url())) writes.push(request.url());
  });
  for (const theme of ["ocean", "forest", "plum", "paper", "graphite"]) {
    await page.locator("#manage-profiles").click();
    await page.getByLabel("Color theme", { exact: true }).selectOption(theme);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Close profiles" }).click();
    expect(await canvas!.evaluate(element => element.isConnected)).toBe(true);
    expect(await page.evaluate(() => [(window as any).pyrplScope.getXRange(), (window as any).pyrplScope.getYRange()])).toEqual(ranges);
    // The legend and canvas use the same semantic series colors.
    const colors = await page.locator("#scope-plot .u-series").filter({ hasText: "CH1" }).locator(".u-marker").evaluate(marker => {
      const expected = document.createElement("span");
      expected.style.color = "var(--plot-green)";
      document.body.appendChild(expected);
      const result = [getComputedStyle(marker).borderColor, getComputedStyle(expected).color];
      expected.remove();
      return result;
    });
    expect(colors[0]).toBe(colors[1]);
    if (theme === "paper" || theme === "plum") await page.screenshot({ path: `../.cache/theme-${theme}.png` });
  }
  expect(writes).toEqual([]);
});

test("theme follows the working profile on reload and a fresh browser", async ({ page, browser }) => {
  await page.goto("/");
  await page.locator("#manage-profiles").click();
  await page.getByLabel("Color theme", { exact: true }).selectOption("forest");
  await expect.poll(async () => (await (await page.request.get("/api/workspace")).json()).workspace.theme).toBe("forest");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "forest");
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "forest");
  await context.close();
});

test("theme selector remains readable on a small screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto("/");
  await page.locator("#manage-profiles").click();
  const select = page.getByLabel("Color theme", { exact: true });
  await select.selectOption("paper");
  await select.scrollIntoViewIfNeeded();
  await expect(select).toBeInViewport();
  expect((await select.boundingBox())!.width).toBeGreaterThan(200);
  expect(await page.getByRole("dialog").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test.afterAll(async ({ request }) => {
  const { workspace } = await (await request.get("/api/workspace")).json();
  await request.post("/api/workspace", { data: { workspace: { ...workspace, theme: "graphite" } } });
});
