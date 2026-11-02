import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(
  readFileSync(new URL("../src/plot-format.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, { exports: module.exports, module });
const { trimFixed, frequencyTick } = module.exports;

test("time ticks preserve zero and significant integer zeros at every precision", () => {
  for (const value of [0, 10, 20, 50, 100, -50, 25]) {
    for (const decimals of [0, 1, 3]) assert.equal(trimFixed(value, decimals), String(value));
  }
  assert.equal(trimFixed(1.25, 3), "1.25");
  assert.equal(trimFixed(-0.0001, 3), "0");
  assert.equal(trimFixed(0.001, 3), "0.001");
});

test("frequency ticks use concise engineering units", () => {
  assert.equal(frequencyTick(10), "10 Hz");
  assert.equal(frequencyTick(1584.893192), "1.58 kHz");
  assert.equal(frequencyTick(1e6), "1 MHz");
});
