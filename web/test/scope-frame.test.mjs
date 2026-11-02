import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadScopeFrameModule() {
  const source = readFileSync(new URL("../src/scope-frame.ts", import.meta.url), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    ArrayBuffer,
    DataView,
    Error,
    Float32Array,
    Float64Array,
    Math,
    Number,
    String,
    Uint8Array,
    exports: module.exports,
    module,
  });
  return module.exports;
}

function makeFrame({ sequence = 7, channelCount = 2, samples = [0, 0.5, -0.25, 1] } = {}) {
  const sampleCount = samples.length / channelCount;
  const buffer = new ArrayBuffer(24 + samples.length * Float32Array.BYTES_PER_ELEMENT);
  const view = new DataView(buffer);
  view.setUint8(0, "P".charCodeAt(0));
  view.setUint8(1, "W".charCodeAt(0));
  view.setUint8(2, "S".charCodeAt(0));
  view.setUint8(3, "1".charCodeAt(0));
  view.setUint16(4, 1, true);
  view.setUint16(6, channelCount, true);
  view.setUint32(8, sampleCount, true);
  view.setBigUint64(12, 1234n, true);
  view.setUint32(20, sequence, true);
  new Float32Array(buffer, 24).set(samples);
  return buffer;
}

const { averageFrameData, clampXRange, frameToData, parseScopeFrame } = loadScopeFrameModule();

test("parseScopeFrame decodes PyRPL websocket scope frames", () => {
  const frame = parseScopeFrame(makeFrame());
  assert.equal(frame.sequence, 7);
  assert.equal(frame.channelCount, 2);
  assert.equal(frame.sampleCount, 2);
  assert.deepEqual(Array.from(frame.samples), [0, 0.5, -0.25, 1]);
});

test("frameToData splits interleaved channel samples", () => {
  const data = frameToData(parseScopeFrame(makeFrame()));
  assert.deepEqual(Array.from(data.x), [0, 1]);
  assert.deepEqual(Array.from(data.ch1), [0, -0.25]);
  assert.deepEqual(Array.from(data.ch2), [0.5, 1]);
});

test("frame decoding and channel splitting handles 65,536 samples", () => {
  const sampleCount = 65_536;
  const samples = new Float32Array(sampleCount * 2);
  for (let index = 0; index < sampleCount; index += 1) {
    samples[index * 2] = index / sampleCount;
    samples[index * 2 + 1] = -index / sampleCount;
  }
  const frame = parseScopeFrame(makeFrame({ sequence: 19, samples }));
  const data = frameToData(frame);
  assert.equal(frame.sequence, 19);
  assert.equal(frame.sampleCount, sampleCount);
  assert.equal(data.x.length, sampleCount);
  assert.equal(data.ch1.length, sampleCount);
  assert.equal(data.ch2.length, sampleCount);
  assert.equal(data.ch1[sampleCount - 1], samples[samples.length - 2]);
  assert.equal(data.ch2[sampleCount - 1], samples[samples.length - 1]);
});

test("frameToData can use PyRPL scope time settings", () => {
  const data = frameToData(parseScopeFrame(makeFrame()), {
    duration: 0.25,
    triggerDelay: 0.05,
    triggerSource: "ch1_positive_edge",
    rollingMode: false,
  });
  assert.deepEqual(Array.from(data.x), [-0.075, 0.05]);
});

test("frameToData uses PyRPL's negative rolling time axis", () => {
  const data = frameToData(parseScopeFrame(makeFrame()), {
    duration: 0.25,
    triggerDelay: 0,
    triggerSource: "immediately",
    rollingMode: true,
  });
  assert.deepEqual(Array.from(data.x), [-0.25, -0.125]);
});

test("hardware channel triggers align the measured crossing without changing either channel", () => {
  for (const [decimation, latency] of [[1, 3], [2, 2], [4, 1], [8, 1], [64, 1]]) {
    for (const channel of [1, 2]) {
      for (const edge of ["positive", "negative"]) {
        const samples = new Float32Array(16384 * 2);
        const crossing = 8192 - latency - 17;
        const sign = edge === "positive" ? 1 : -1;
        for (let i = 0; i < 16384; i++) {
          samples[2 * i] = (i % 93) / 100;
          samples[2 * i + 1] = (i % 107) / 120;
          samples[2 * i + channel - 1] = 0.125 + sign * (i - crossing + 0.25) / 32768;
        }
        const frame = parseScopeFrame(makeFrame({ samples }));
        const dt = 8e-9 * decimation;
        const data = frameToData(frame, {
          duration: dt * 16384, triggerDelay: 17.25 * dt,
          triggerSource: `ch${channel}_${edge}_edge`, rollingMode: false,
          hardware: true, threshold: 0.125,
        });
        const y = channel === 1 ? data.ch1 : data.ch2;
        const fraction = (0.125 - y[crossing - 1]) / (y[crossing] - y[crossing - 1]);
        const crossingTime = data.x[crossing - 1] + fraction * (data.x[crossing] - data.x[crossing - 1]);
        assert.ok(Math.abs(crossingTime) < 1e-16, `${decimation}/${channel}/${edge}: ${crossingTime}`);
        for (let i = 0; i < 16384; i++) {
          assert.equal(data.ch1[i], samples[2 * i]);
          assert.equal(data.ch2[i], samples[2 * i + 1]);
        }
        assert.ok(Math.abs(data.x[1] - data.x[0] - dt) < 1e-16);
      }
    }
  }
});

test("trigger correction leaves fake, rolling and non-channel trigger timing alone", () => {
  const frame = parseScopeFrame(makeFrame());
  const settings = {duration: 0.25, triggerDelay: 0.05, triggerSource: "ch2_positive_edge", rollingMode: false};
  assert.deepEqual(Array.from(frameToData(frame, { ...settings, hardware: false }).x), [-0.075, 0.05]);
  for (const triggerSource of ["ext_positive_edge", "ext_negative_edge", "asg0", "asg1", "dsp", "off"]) {
    assert.deepEqual(Array.from(frameToData(frame, { ...settings, hardware: true, triggerSource }).x), [-0.075, 0.05]);
  }
  assert.deepEqual(Array.from(frameToData(frame, { ...settings, hardware: true, triggerSource: "immediately" }).x), [0, 0.125]);
  assert.deepEqual(Array.from(frameToData(frame, { ...settings, hardware: true, rollingMode: true }).x), [-0.25, -0.125]);
});

test("missing trigger crossing uses clock correction without snapping to another cycle", () => {
  const samples = new Float32Array(16384 * 2).fill(0.5);
  // An unrelated rising edge is deliberately close to the real trigger slot.
  samples[2 * 8191 + 1] = -0.5;
  const frame = parseScopeFrame(makeFrame({ samples }));
  const settings = {duration: 16384 * 8e-9, triggerDelay: 0, triggerSource: "ch2_positive_edge", rollingMode: false, hardware: true};
  const data = frameToData(frame, settings);
  assert.ok(Math.abs(data.x[8189]) < 1e-16);
  assert.ok(data.x[8192] > 0);
  const outside = frameToData(frame, { ...settings, triggerDelay: 0.001 });
  assert.ok(outside.x[0] > 0);
  const short = frameToData(parseScopeFrame(makeFrame()), settings);
  assert.equal(short.x[0], data.x[0]);
});

test("averageFrameData performs browser-side trace averaging", () => {
  const first = frameToData(parseScopeFrame(makeFrame({ samples: [0, 1, 0, 1] })));
  const second = frameToData(parseScopeFrame(makeFrame({ samples: [1, 0, 1, 0] })));
  const firstAverage = averageFrameData(first, null, 0, 4);
  const secondAverage = averageFrameData(second, firstAverage.data, firstAverage.currentAverage, 4);
  assert.equal(secondAverage.currentAverage, 2);
  assert.deepEqual(Array.from(secondAverage.data.ch1), [0.5, 0.5]);
  assert.deepEqual(Array.from(secondAverage.data.ch2), [0.5, 0.5]);
});

test("clampXRange keeps zoom bounds finite and inside the data range", () => {
  const tooWide = clampXRange(-100, 20, 99);
  assert.equal(tooWide.min, 0);
  assert.equal(tooWide.max, 99);

  const tooFarRight = clampXRange(95, 150, 99);
  assert.equal(tooFarRight.min, 44);
  assert.equal(tooFarRight.max, 99);

  const tooNarrow = clampXRange(10, 11, 99);
  assert.equal(tooNarrow.min, 10);
  assert.equal(tooNarrow.max, 14);
});
