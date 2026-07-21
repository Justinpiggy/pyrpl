import { readFile } from "node:fs/promises";

import { chromium } from "playwright";

const baseUrl = process.env.PYRPL_WEB_URL ?? "http://127.0.0.1:8801";
const referencePath = process.env.PYRPL_NETWORK_REFERENCE_FILE;
const settings = {
  startHz: Number(process.env.PYRPL_NETWORK_START_HZ ?? 10_000),
  stopHz: Number(process.env.PYRPL_NETWORK_STOP_HZ ?? 100_000),
  points: Number(process.env.PYRPL_NETWORK_POINTS ?? 9),
  rbwHz: Number(process.env.PYRPL_NETWORK_RBW_HZ ?? 10_000),
  amplitudeV: Number(process.env.PYRPL_NETWORK_AMPLITUDE_V ?? 0.1),
};

async function setAttribute(page, attribute, value) {
  await page.evaluate(async ({ attribute, value }) => {
    const response = await fetch(`/api/modules/networkanalyzer/attributes/${attribute}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error(`networkanalyzer.${attribute}: ${response.status}`);
  }, { attribute, value });
}

function compare(reference, actual) {
  if (reference.x.length !== actual.x.length) throw new Error("Legacy and browser point counts differ");
  let largestMagnitudeError = 0;
  let largestPhaseErrorDegrees = 0;
  for (let index = 0; index < actual.x.length; index += 1) {
    if (Math.abs(reference.x[index] - actual.x[index]) > 1e-3) {
      throw new Error(`Frequency differs at point ${index}: ${reference.x[index]} vs ${actual.x[index]}`);
    }
    const expected = { real: reference.real[index], imaginary: reference.imaginary[index] };
    const measured = { real: actual.real[index], imaginary: actual.imaginary[index] };
    const expectedMagnitude = Math.hypot(expected.real, expected.imaginary);
    const measuredMagnitude = Math.hypot(measured.real, measured.imaginary);
    largestMagnitudeError = Math.max(
      largestMagnitudeError,
      Math.abs(measuredMagnitude - expectedMagnitude) / Math.max(expectedMagnitude, 1e-6),
    );
    const phaseError = Math.atan2(
      expected.real * measured.imaginary - expected.imaginary * measured.real,
      expected.real * measured.real + expected.imaginary * measured.imaginary,
    ) * 180 / Math.PI;
    largestPhaseErrorDegrees = Math.max(largestPhaseErrorDegrees, Math.abs(phaseError));
  }
  if (largestMagnitudeError > 0.25) throw new Error(`Magnitude drift ${largestMagnitudeError} exceeds 25%`);
  if (largestPhaseErrorDegrees > 20) throw new Error(`Phase drift ${largestPhaseErrorDegrees} degrees exceeds 20 degrees`);
  return { largestMagnitudeError, largestPhaseErrorDegrees };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#control-status");
  if (await page.locator("#take-control").isVisible()) await page.locator("#take-control").click();
  await page.waitForFunction(() => document.querySelector("#control-status")?.textContent === "You have control");

  for (const [attribute, value] of Object.entries({
    input: "in1",
    output_direct: "out1",
    acbandwidth: 0,
    start_freq: settings.startHz,
    stop_freq: settings.stopHz,
    points: settings.points,
    rbw: settings.rbwHz,
    average_per_point: 1,
    trace_average: 1,
    amplitude: settings.amplitudeV,
    logscale: false,
    auto_bandwidth: false,
    auto_amplitude: false,
  })) await setAttribute(page, attribute, value);

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-networkanalyzer-enabled").setChecked(true);
  await page.getByRole("button", { name: "Network Analyzer", exact: true }).click();
  await page.locator("#networkanalyzer-panel").waitFor({ state: "visible" });
  await page.locator("#network-single").click();
  await page.waitForFunction(
    (points) => window.pyrplScope?.getNetworkAnalyzerCurveData()?.x.length === points,
    settings.points,
    { timeout: 60_000 },
  );
  const curve = await page.evaluate(() => window.pyrplScope?.getNetworkAnalyzerCurveData());
  if (!curve) throw new Error("Browser Network Analyzer did not retain a curve");
  if (curve.real.some((value) => !Number.isFinite(value)) || curve.imaginary.some((value) => !Number.isFinite(value))) {
    throw new Error("Browser Network Analyzer returned non-finite points");
  }
  const magnitudes = curve.real.map((real, index) => Math.hypot(real, curve.imaginary[index])).sort((a, b) => a - b);
  const result = {
    path: "browser-networkanalyzer-websocket",
    physicalLoop: "OUT0->IN0 (PyRPL out1->in1)",
    settings,
    ...curve,
    medianMagnitude: magnitudes[Math.floor(magnitudes.length / 2)],
  };
  if (referencePath) {
    try {
      result.comparison = compare(JSON.parse(await readFile(referencePath, "utf8")), curve);
    } catch (error) {
      result.comparisonError = error instanceof Error ? error.message : String(error);
      console.log(JSON.stringify(result));
      throw error;
    }
  }
  console.log(JSON.stringify(result));
} finally {
  await page.evaluate(async () => {
    await fetch("/api/modules/networkanalyzer/actions/stop", { method: "POST" }).catch(() => undefined);
  }).catch(() => undefined);
  await browser.close();
}
