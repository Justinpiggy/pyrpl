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

test("frameToData can use PyRPL scope time settings", () => {
  const data = frameToData(parseScopeFrame(makeFrame()), {
    duration: 0.25,
    triggerDelay: 0.05,
    triggerSource: "ch1_positive_edge",
  });
  assert.deepEqual(Array.from(data.x), [-0.075, 0.05]);
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
