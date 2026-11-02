import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function set(page: Page, attribute: string, value: unknown) {
  const response = await page.request.post(`/api/modules/networkanalyzer/attributes/${attribute}`, { data: { value } });
  expect(response.ok()).toBeTruthy();
}
async function open(page: Page, observer = false) {
  await page.request.post("/api/modules/networkanalyzer/actions/stop");
  for (const [key, value] of Object.entries({ points: 32, trace_average: 1, start_freq: 1000, stop_freq: 100000, logscale: true, amplitude: 0.1 })) await set(page, key, value);
  await page.route("**/api/workspace", route => route.fulfill({ json: { workspace: {
    activePanelId: "networkanalyzer", layoutMode: "tabs", panels: { scope: { enabled: false }, networkanalyzer: { enabled: true } },
  } } }));
  await page.goto("/");
  if (observer) {
    // Observer workspaces are local, independent of the controller workspace.
    await page.locator(".menu-dropdown summary").click();
    await page.locator("#panel-networkanalyzer-enabled").check();
    await page.getByRole("button", { name: "Network Analyzer", exact: true }).click();
  }
  await expect(page.locator("#networkanalyzer-start-freq")).toBeVisible();
}

const snapshot = (run = 900) => ({ snapshot: Array.from({ length: 100 }, (_, index) => ({
  run_id: run, index, points: 100, x: 1000 + index * 1000,
  real: 1 / (1 + index / 20), imag: index / 100,
  logscale: false, zero_span: false, scan_complete: index === 99, current_avg: 1,
  running_state: "running_continuous", time_per_point: 0.01,
})) });

test("incoming sweeps preserve zoom and both frequency axes stay linked", async ({ page }) => {
  let stream: any;
  await page.routeWebSocket("**/ws/networkanalyzer", ws => { stream = ws; ws.send(JSON.stringify(snapshot())); });
  await open(page);
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getNetworkAnalyzerCurveData()?.x.length)).toBe(100);
  const before = await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView());
  const box = (await page.locator("#network-magnitude-plot .u-over").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.7, { steps: 10 });
  await page.mouse.up();
  const zoom = await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView());
  expect(zoom.magnitude.x.max! - zoom.magnitude.x.min!).toBeLessThan(before.magnitude.x.max! - before.magnitude.x.min!);
  expect(zoom.phase.x).toEqual(zoom.magnitude.x);
  stream.send(JSON.stringify(snapshot(901)));
  await expect.poll(() => page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView().magnitude)).toEqual(zoom.magnitude);
  stream.send(JSON.stringify({ snapshot: [] }));
  await expect.poll(() => page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerCurveData())).toBeNull();
  await expect(page.locator("#network-save")).toBeDisabled();
  stream.send(JSON.stringify(snapshot(902)));
  await expect.poll(() => page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerCurveData()?.x.length)).toBe(100);
  expect((await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView())).magnitude).toEqual(zoom.magnitude);
  await page.locator("#network-reset").click();
  await expect.poll(() => page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView().magnitude.x)).toEqual(before.magnitude.x);
  stream.close({ code: 1011, reason: "Network Analyzer acquisition failed" });
  await expect(page.getByRole("alert")).toContainText("Network Analyzer acquisition failed");
});

test("descending and zero-span sweeps plot correctly and save captured metadata and CSV units", async ({ page }) => {
  await open(page);
  await set(page, "start_freq", 1000000);
  await set(page, "stop_freq", 1000);
  await page.locator("#network-single").click();
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getNetworkAnalyzerCurveData()?.x[0] ?? 0)).toBeGreaterThan(999999);
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getNetworkAnalyzerCurveData()?.x.length)).toBe(32);
  const data = await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerCurveData()!);
  expect(data.x[0]).toBeGreaterThan(data.x[31]);
  const range = (await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView())).magnitude.x;
  expect(range.min!).toBeLessThan(data.x[31]);
  expect(range.max!).toBeGreaterThan(data.x[0]);
  await expect(page.locator("#network-stop")).toBeDisabled();

  await set(page, "start_freq", 10000);
  await set(page, "stop_freq", 10000);
  await page.locator("#network-single").click();
  await expect.poll(() => page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView().zeroSpan)).toBe(true);
  await expect(page.locator("#network-single")).toBeEnabled();
  await expect(page.locator("#network-run")).toHaveText("Continuous");
  await expect(page.locator("#network-stop")).toBeDisabled();
  expect((await page.evaluate(() => window.pyrplScope!.getNetworkAnalyzerView())).logscale).toBe(false);
  await set(page, "start_freq", 20000); // Changes form/settings, not the captured trace metadata.
  const saved = page.waitForRequest(request => request.url().endsWith("/api/curves") && request.method() === "POST");
  const download = page.waitForEvent("download");
  await page.locator("#network-save").click();
  const payload = (await saved).postDataJSON();
  expect(payload.params.start_freq).toBe(10000);
  expect(payload.params.x_unit).toBe("s");
  expect(payload.x[0]).toBe(0);
  const csv = await readFile((await (await download).path())!, "utf8");
  expect(csv.split("\n")[0]).toBe("elapsed_time_s,magnitude_db,phase_deg,real,imaginary");
  await page.screenshot({ path: "../.cache/network-zero-span.png" });
});

test("failed stop and settings writes show useful errors and accepted values update the field", async ({ page }) => {
  await open(page);
  const amplitude = page.locator("#networkanalyzer-amplitude");
  expect(await amplitude.getAttribute("step")).toBe("any");
  await page.route("**/api/modules/networkanalyzer/attributes/amplitude", route => route.fulfill({ json: { value: 0.125 } }));
  await amplitude.fill("0.123");
  await amplitude.dispatchEvent("change"); // Remains focused while the normalized response arrives.
  await expect(amplitude).toHaveValue("0.125");
  await page.unroute("**/api/modules/networkanalyzer/attributes/amplitude");
  await page.route("**/api/modules/networkanalyzer/attributes/amplitude", route => route.abort());
  await amplitude.fill("0.2");
  await amplitude.blur();
  await expect(page.getByRole("alert")).toContainText(/fetch|network/i);
  await page.locator("#network-run").click();
  await expect(page.locator("#network-run")).toHaveText("Pause");
  await page.route("**/api/modules/networkanalyzer/actions/stop", route => route.fulfill({ status: 503, json: { detail: "Simulated monitor unavailable" } }));
  await page.locator("#network-stop").click();
  await expect(page.getByRole("alert")).toContainText("Simulated monitor unavailable");
  await expect(page.locator("#network-stop")).toBeEnabled();
  await expect(page.locator("#network-run")).toHaveText("Pause");
  await page.unroute("**/api/modules/networkanalyzer/actions/stop");
  await page.locator("#network-stop").click();
  await expect(page.locator("#network-stop")).toBeDisabled();
});

test("a late Single response cannot leave a completed sweep showing Pause", async ({ page }) => {
  await open(page);
  await page.route("**/api/modules/networkanalyzer/actions/single", async route => {
    const response = await route.fetch();
    await expect.poll(async () => (await (await page.request.get("/api/modules/networkanalyzer")).json()).state.running_state).toBe("stopped");
    // Deliver the old running_single action response after completion events.
    await expect.poll(() => page.evaluate(() => window.pyrplScope?.getNetworkAnalyzerCurveData()?.x.length)).toBe(32);
    await route.fulfill({ response });
  });
  await page.locator("#network-single").click();
  await expect(page.locator("#network-single")).toBeEnabled();
  await expect(page.locator("#network-run")).toHaveText("Continuous");
  await expect(page.locator("#network-stop")).toBeDisabled();
});

test("observer acquisition actions are disabled while CSV download remains available", async ({ page }) => {
  await page.route("**/api/control**", route => route.fulfill({ json: {
    policy: "single-writer", role: "observer", controller: { id: "another-client", label: "Other" }, lease_seconds: 30, lease_remaining: 29,
  } }));
  await page.routeWebSocket("**/ws/networkanalyzer", ws => ws.send(JSON.stringify(snapshot())));
  await open(page, true);
  for (const id of ["network-single", "network-run", "network-stop"]) await expect(page.locator(`#${id}`)).toBeDisabled();
  await expect(page.locator("#network-save")).toHaveText("Download CSV");
  await expect(page.locator("#network-save")).toBeEnabled();
  const download = page.waitForEvent("download");
  await page.locator("#network-save").click();
  const csv = await readFile((await (await download).path())!, "utf8");
  expect(csv.startsWith("frequency_Hz,magnitude_db,phase_deg,real,imaginary\n")).toBe(true);
});

test.afterEach(async ({ request }) => { await request.post("/api/modules/networkanalyzer/actions/stop"); });
