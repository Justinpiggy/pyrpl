import { chromium } from "playwright";

const baseUrl = process.env.PYRPL_WEB_URL ?? "http://127.0.0.1:8801";
const toneFrequency = Number(process.env.PYRPL_SPECTRUM_TONE_HZ ?? 100_000);
const toneAmplitude = Number(process.env.PYRPL_SPECTRUM_TONE_V ?? 0.2);
const spectrumSpan = Number(process.env.PYRPL_SPECTRUM_SPAN_HZ ?? 976_562.5);

function strongestPeak(curve) {
  const input = curve.series.find((series) => series.label === "Input 1");
  if (!input) throw new Error("Spectrum worker did not produce Input 1");
  let peakIndex = 0;
  let peakValue = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < input.values.length; index += 1) {
    const value = input.values[index];
    if (Number.isFinite(value) && value > peakValue) {
      peakValue = value;
      peakIndex = index;
    }
  }
  return { frequency: curve.x[peakIndex], value: peakValue, index: peakIndex };
}

function strongestBins(curve, count = 5) {
  const input = curve.series.find((series) => series.label === "Input 1");
  if (!input) return [];
  return Array.from(input.values, (value, index) => ({ frequency: curve.x[index], value }))
    .filter((bin) => Number.isFinite(bin.value))
    .sort((left, right) => right.value - left.value)
    .slice(0, count);
}

function strongestPeakNear(curve, expectedFrequency, tolerance) {
  const input = curve.series.find((series) => series.label === "Input 1");
  if (!input) throw new Error("Spectrum worker did not produce Input 1");
  let peakIndex = -1;
  let peakValue = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < input.values.length; index += 1) {
    if (Math.abs(curve.x[index] - expectedFrequency) > tolerance) continue;
    const value = input.values[index];
    if (Number.isFinite(value) && value > peakValue) {
      peakValue = value;
      peakIndex = index;
    }
  }
  if (peakIndex < 0) throw new Error(`Spectrum worker has no bins near ${expectedFrequency} Hz`);
  return { frequency: curve.x[peakIndex], value: peakValue, index: peakIndex };
}

async function setAttribute(page, moduleName, attribute, value) {
  await page.evaluate(async ({ moduleName, attribute, value }) => {
    const response = await fetch(`/api/modules/${moduleName}/attributes/${attribute}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error(`${moduleName}.${attribute}: ${response.status}`);
  }, { moduleName, attribute, value });
}

async function callAction(page, moduleName, action) {
  await page.evaluate(async ({ moduleName, action }) => {
    const response = await fetch(`/api/modules/${moduleName}/actions/${action}`, { method: "POST" });
    if (!response.ok) throw new Error(`${moduleName}.${action}: ${response.status}`);
  }, { moduleName, action });
}

async function samplerStats(page, signal) {
  return page.evaluate(async (signal) => {
    const response = await fetch("/api/sampler/stats", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signal, duration: 0.03 }),
    });
    if (!response.ok) throw new Error(`sampler ${signal}: ${response.status}`);
    return response.json();
  }, signal);
}

async function captureExternalScopeTone(page, frequency, sampleRate) {
  return page.evaluate(async ({ frequency, sampleRate }) => {
    const response = await fetch("/api/scope/frame?samples=16384");
    if (!response.ok) throw new Error(`external scope frame: ${response.status}`);
    const buffer = await response.arrayBuffer();
    const samples = new Float32Array(buffer, 24);
    const count = samples.length / 2;
    let mean = 0;
    for (let index = 0; index < count; index += 1) mean += samples[index * 2];
    mean /= count;
    let variance = 0;
    let cosine = 0;
    let sine = 0;
    for (let index = 0; index < count; index += 1) {
      const sample = samples[index * 2] - mean;
      const phase = 2 * Math.PI * frequency * index / sampleRate;
      variance += sample * sample;
      cosine += sample * Math.cos(phase);
      sine += sample * Math.sin(phase);
    }
    return {
      samples: count,
      mean,
      rms: Math.sqrt(variance / count),
      toneAmplitude: 2 * Math.hypot(cosine, sine) / count,
    };
  }, { frequency, sampleRate });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#control-status");
  if (await page.locator("#take-control").isVisible()) await page.locator("#take-control").click();
  await page.waitForFunction(() => document.querySelector("#control-status")?.textContent === "You have control");

  // PyRPL names the first physical output/input pair out1/in1. The user's
  // cable is Red Pitaya OUT0 -> IN0, so route ASG0 to out1 and sample in1.
  await setAttribute(page, "asg0", "waveform", "sin");
  await setAttribute(page, "asg0", "frequency", toneFrequency);
  await setAttribute(page, "asg0", "amplitude", toneAmplitude);
  await setAttribute(page, "asg0", "offset", 0);
  await setAttribute(page, "asg0", "trigger_source", "high");
  await setAttribute(page, "asg0", "output_direct", "out1");
  await callAction(page, "asg0", "setup");
  const asgStats = await samplerStats(page, "asg0");
  const inputStats = await samplerStats(page, "in1");

  await setAttribute(page, "scope", "input1", "in1");
  await setAttribute(page, "scope", "input2", "in2");
  await setAttribute(page, "scope", "duration", 16_384 / spectrumSpan);
  await setAttribute(page, "scope", "rolling_mode", false);
  await setAttribute(page, "scope", "trigger_source", "immediately");
  await callAction(page, "scope", "single");
  const scopeCapture = await captureExternalScopeTone(page, toneFrequency, spectrumSpan);
  if (scopeCapture.toneAmplitude < toneAmplitude * 0.25) {
    throw new Error(`Scope did not capture the external ${toneFrequency} Hz tone: ${JSON.stringify(scopeCapture)}`);
  }

  await setAttribute(page, "spectrumanalyzer", "baseband", true);
  await setAttribute(page, "spectrumanalyzer", "span", spectrumSpan);
  await setAttribute(page, "spectrumanalyzer", "window", "blackman");
  await setAttribute(page, "spectrumanalyzer", "input1_baseband", "in1");
  await setAttribute(page, "spectrumanalyzer", "input2_baseband", "in2");
  await setAttribute(page, "spectrumanalyzer", "trace_average", 1);

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-spectrumanalyzer-enabled").setChecked(true);
  await page.getByRole("button", { name: "Spectrum Analyzer" }).click();
  await page.locator("#spectrumanalyzer-panel").waitFor({ state: "visible" });
  await page.locator("#spectrum-single").click();
  await page.waitForFunction(
    () => window.pyrplScope?.getSpectrumCurveData()?.series.some((series) => series.label === "Input 1" && series.values.length > 1_000),
    null,
    { timeout: 60_000 },
  );
  const curve = await page.evaluate(() => window.pyrplScope?.getSpectrumCurveData());
  if (!curve) throw new Error("Spectrum worker did not retain a curve");
  const globalPeak = strongestPeak(curve);
  const binWidth = curve.x.length > 1 ? curve.x[1] - curve.x[0] : 0;
  const peakTolerance = Math.max(binWidth * 3, toneFrequency * 0.03);
  const peak = strongestPeakNear(curve, toneFrequency, peakTolerance);
  const measurement = {
    path: "browser-websocket-worker",
    physicalLoop: "OUT0->IN0 (PyRPL out1->in1)",
    tone: { frequency: toneFrequency, amplitude: toneAmplitude },
    span: spectrumSpan,
    bins: curve.x.length,
    unit: curve.unit,
    binWidth,
    peak,
    globalPeak,
    dcValue: curve.series.find((series) => series.label === "Input 1")?.values[0] ?? null,
    sampler: { asg0: asgStats, in1: inputStats },
    scopeCapture,
    strongestBins: strongestBins(curve),
  };
  console.log(JSON.stringify(measurement));
  if (!Number.isFinite(peak.value) || peak.value <= 0) throw new Error(`External IN0 loop produced no positive peak: ${peak.value}`);
  if (Math.abs(peak.frequency - toneFrequency) > peakTolerance) {
    throw new Error(`Peak ${peak.frequency} Hz is not near ${toneFrequency} Hz (bin width ${binWidth} Hz)`);
  }
} finally {
  await callAction(page, "spectrumanalyzer", "stop").catch(() => undefined);
  await callAction(page, "scope", "stop").catch(() => undefined);
  await callAction(page, "asg0", "off").catch(() => undefined);
  await browser.close();
}
