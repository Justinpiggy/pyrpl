import { chromium } from "playwright";

const baseUrl = process.env.PYRPL_WEB_URL ?? "http://127.0.0.1:8801";
const screenshotPath = process.env.PYRPL_HARDWARE_SCREENSHOT ?? "/tmp/pyrpl-web-hardware.png";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#control-status");
  if (await page.locator("#take-control").isVisible()) {
    await page.locator("#take-control").click();
  }
  await page.waitForFunction(() => document.querySelector("#control-status")?.textContent === "You have control");

  await page.getByRole("button", { name: "Scope" }).click();
  await page.locator("#scope-panel").waitFor({ state: "visible" });

  if ((await page.locator("#connect-scope").textContent())?.includes("Run continuous")) {
    await page.locator("#connect-scope").click();
  }
  await page.waitForFunction(() => window.pyrplScope?.getFrameSequence() >= 2, null, { timeout: 30_000 });
  const initialSequence = await page.evaluate(() => window.pyrplScope?.getFrameSequence() ?? 0);
  await page.locator("#scope-input1").selectOption("asg0");
  await page.waitForFunction((sequence) => (window.pyrplScope?.getFrameSequence() ?? 0) > sequence, initialSequence, { timeout: 30_000 });
  const scopeFingerprint = await page.evaluate(() => window.pyrplScope?.getDisplayedDataFingerprint());
  if (!scopeFingerprint) throw new Error("Scope rendered no live data");

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-spectrumanalyzer-enabled").setChecked(true);
  await page.getByRole("button", { name: "Spectrum Analyzer" }).click();
  await page.locator("#spectrum-run").click();
  await page.waitForFunction(
    () => (window.pyrplScope?.getSpectrumBinCount() ?? 0) > 1_000 && (window.pyrplScope?.getSpectrumSeriesCount() ?? 0) > 0,
    null,
    { timeout: 60_000 },
  );
  await page.waitForFunction(
    () => /Spectrum frame [1-9]\d*,/.test(document.querySelector("#spectrum-status")?.textContent ?? ""),
    null,
    { timeout: 60_000 },
  );
  const spectrum = await page.evaluate(() => ({
    bins: window.pyrplScope?.getSpectrumBinCount() ?? 0,
    series: window.pyrplScope?.getSpectrumSeriesCount() ?? 0,
    status: document.querySelector("#spectrum-status")?.textContent ?? "",
  }));
  if (!spectrum.status.includes("Spectrum frame")) throw new Error(`Spectrum did not report a live frame: ${spectrum.status}`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (browserErrors.length) throw new Error(`Browser errors: ${browserErrors.join(" | ")}`);
  console.log(JSON.stringify({ baseUrl, scopeFingerprint, scopeSequence: initialSequence, spectrum, screenshotPath }));
} finally {
  if (await page.locator("#spectrum-stop").isEnabled().catch(() => false)) {
    await page.locator("#spectrum-stop").click().catch(() => undefined);
  }
  await page.getByRole("button", { name: "Scope" }).click().catch(() => undefined);
  await page.locator("#scope-panel").waitFor({ state: "visible" }).catch(() => undefined);
  await page.waitForFunction(
    () => !document.querySelector("#stop-scope")?.hasAttribute("disabled"),
    null,
    { timeout: 10_000 },
  ).catch(() => undefined);
  if (await page.locator("#stop-scope").isEnabled().catch(() => false)) {
    await page.locator("#stop-scope").click().catch(() => undefined);
  }
  await page.evaluate(async () => {
    const response = await fetch("/api/modules/scope/actions/stop", { method: "POST" });
    if (!response.ok) throw new Error(`Scope cleanup failed: ${response.status}`);
  }).catch(() => undefined);
  await browser.close();
}
