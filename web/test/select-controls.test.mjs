import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function load(name) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports: module.exports, module });
  return module.exports;
}
const { optionLabel } = load("select-controls");
const { convertPower } = load("spectrum-units");

test("numeric selectors use the attribute's quantity, never infer seconds from magnitude", () => {
  assert.equal(optionLabel("span", 124999999.99999999), "125 MHz");
  assert.equal(optionLabel("span", 976562.4999999999), "976.562 kHz");
  assert.equal(optionLabel("rbw", 0.20103328499866943), "201.033 mHz");
  assert.equal(optionLabel("duration", 0.001048576), "1.049 ms");
  assert.equal(optionLabel("trigger_delay", -0.0001), "-100 µs");
  for (const name of ["data_curve", "modulation_at_2f", "demodulation_at_2f", "gain_factor"]) {
    assert.equal(optionLabel(name, 1), "1");
    assert.equal(optionLabel(name, 0), "0");
  }
  assert.equal(optionLabel("display_unit", "Vrms^2/Hz"), "Vrms^2/Hz");
});

test("amplitude spectral density squared equals power spectral density", () => {
  for (const rbw of [0.25, 1, 100, 10000]) {
    const power = new Float64Array([0.02, 2, 8]);
    const psd = convertPower(power, "Vrms^2/Hz", rbw);
    const asd = convertPower(power, "Vrms/sqrt(Hz)", rbw);
    for (let i = 0; i < power.length; i++) {
      assert.ok(Math.abs(asd[i] ** 2 - psd[i]) < 1e-12);
      assert.equal(psd[i], power[i] / 2 / rbw);
    }
  }
  assert.equal(convertPower(new Float64Array([2]), "Vrms", 100)[0], 1);
});
