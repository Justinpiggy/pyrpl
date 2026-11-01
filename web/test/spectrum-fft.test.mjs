import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function transpile(url) {
  return ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
  }).outputText;
}

function loadModule(url, imports = {}) {
  const module = { exports: {} };
  vm.runInNewContext(transpile(url), {
    Array,
    ArrayBuffer,
    DataView,
    Error,
    Float32Array,
    Float64Array,
    Math,
    Number,
    String,
    Uint8Array,
    TextDecoder,
    exports: module.exports,
    module,
    require(path) {
      if (path in imports) return imports[path];
      throw new Error(`Unexpected import ${path}`);
    },
  });
  return module.exports;
}

const scopeFrame = loadModule(new URL("../src/scope-frame.ts", import.meta.url));
const spectrumFft = loadModule(new URL("../src/spectrum-fft.ts", import.meta.url), {
  "./scope-frame": scopeFrame,
});

function makeScopeFrame(count = 64, frequencyBin = 8) {
  const buffer = new ArrayBuffer(24 + count * 2 * Float32Array.BYTES_PER_ELEMENT);
  const view = new DataView(buffer);
  for (const [index, value] of Array.from("PWS1").entries()) view.setUint8(index, value.charCodeAt(0));
  view.setUint16(4, 1, true);
  view.setUint16(6, 2, true);
  view.setUint32(8, count, true);
  view.setUint32(20, 11, true);
  const samples = new Float32Array(buffer, 24);
  for (let index = 0; index < count; index += 1) {
    const phase = 2 * Math.PI * frequencyBin * index / count;
    samples[index * 2] = Math.sin(phase);
    samples[index * 2 + 1] = Math.cos(phase);
  }
  return buffer;
}

function settings(overrides = {}) {
  return {
    baseband: true,
    span: 125e6,
    center: 0,
    window: "boxcar",
    displayUnit: "Vpk^2",
    displayInput1Baseband: true,
    displayInput2Baseband: true,
    displayCrossAmplitude: true,
    traceAverage: 1,
    runningState: "running_single",
    iqBandwidth: [125e6, 125e6, 125e6, 125e6],
    ...overrides,
  };
}

test("Spectrum FFT uses PyRPL 16x padding and coherent Vpk normalization", () => {
  const frame = spectrumFft.spectrumFromScopeBuffer(makeScopeFrame(), settings());
  const peak = 8 * spectrumFft.SPECTRUM_PADDING_FACTOR;

  assert.equal(frame.sequence, 11);
  assert.equal(frame.x.length, 64 * 16 / 2 + 1);
  assert.equal(frame.x.at(-1), 62.5e6);
  assert.equal(frame.rbw, 125e6 / 64);
  assert.deepEqual(Array.from(frame.series, (series) => series.label), ["Input 1", "Input 2", "Cross"]);
  assert.ok(Math.abs(frame.series[0].values[peak] - 1) < 1e-6);
  assert.ok(Math.abs(frame.series[1].values[peak] - 1) < 1e-6);
  assert.ok(Math.abs(frame.series[2].values[peak]) < 1e-6);
  assert.ok(Math.abs(frame.series[2].imaginary[peak] - 1) < 1e-6);
});

test("Spectrum IQ mode returns the full shifted padded frequency axis", () => {
  const frame = spectrumFft.spectrumFromScopeBuffer(
    makeScopeFrame(),
    settings({ baseband: false, center: 10e6 }),
  );

  assert.equal(frame.x.length, 64 * 16);
  assert.equal(frame.series.length, 1);
  assert.equal(frame.series[0].label, "IQ");
  assert.ok(Math.abs(frame.x[0] - (10e6 - 62.5e6)) < 1e-6);
  assert.ok(Math.abs(frame.x.at(-1) - (10e6 + 62.5e6 - 125e6 / (64 * 16))) < 1e-6);
});

test("shared correlation frames reproduce raw FFTs for local windows and both acquisition modes", () => {
  for (const baseband of [true, false]) for (const window of ["boxcar", "blackman", "hamming", "flattop", "gaussian"]) {
    const state = settings({ baseband, window, span: 1e6, center: 2e6, iqBandwidth: [1e6, 1e6] });
    const buffer = makeScopeFrame(64, 7);
    const expected = spectrumFft.spectrumFromScopeBuffer(buffer, state);
    const samples = new Float32Array(buffer, 24);
    const weights = spectrumFft.spectrumWindow(window, 64);
    const x = Array.from({ length: 64 }, (_, i) => samples[2*i] * weights[i]);
    const y = Array.from({ length: 64 }, (_, i) => samples[2*i+1] * weights[i]);
    const corr = (a, b, lag) => a.reduce((sum, value, n) => sum + value * (b[n + lag] ?? 0), 0);
    const rows = Array.from({ length: baseband ? 4 : 2 }, () => new Float64Array(128));
    for (let lag = -63; lag < 64; lag++) {
      const i = (lag + 128) % 128;
      if (baseband) {
        rows[0][i] = corr(x, x, lag);
        rows[1][i] = corr(y, y, lag);
        rows[2][i] = (corr(x, y, lag) + corr(x, y, -lag)) / 2;
        rows[3][i] = (corr(x, y, lag) - corr(x, y, -lag)) / 2;
      } else {
        rows[0][i] = corr(x, x, lag) + corr(y, y, lag);
        rows[1][i] = corr(x, y, lag) - corr(y, x, lag);
      }
    }
    const metadata = { samples: 64, sequence: 11, count: 3, ...state };
    const json = JSON.stringify(metadata);
    const size = Math.ceil(json.length / 8) * 8;
    const packet = new ArrayBuffer(8 + size + rows.length * 128 * 8);
    new Uint8Array(packet, 0, 4).set(new TextEncoder().encode("PWA1"));
    new DataView(packet).setUint32(4, size, true);
    new Uint8Array(packet, 8, size).fill(32);
    new Uint8Array(packet, 8, json.length).set(new TextEncoder().encode(json));
    rows.forEach((row, i) => new Float64Array(packet, 8 + size + i * 128 * 8, 128).set(row));
    const actual = spectrumFft.spectrumFromCorrelationBuffer(packet, state);
    assert.equal(actual.currentAverage, 3);
    assert.equal(actual.rbw, expected.rbw);
    for (let series = 0; series < actual.series.length; series++) {
      for (const key of ["values", "imaginary"]) {
        if (!actual.series[series][key]) continue;
        for (let i = 0; i < actual.x.length; i++) {
          assert.ok(Math.abs(actual.series[series][key][i] - expected.series[series][key][i]) < 1e-9, `${baseband} ${window} ${series} ${key} bin ${i}`);
        }
      }
    }
  }
});
