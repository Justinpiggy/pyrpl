import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../src/curve-upload.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
vm.runInNewContext(compiled.outputText, { exports, TextEncoder });
const { encodeCurveUpload } = exports;

test("binary curve upload preserves real and complex samples and UTF-8 metadata", () => {
  for (const imaginary of [undefined, [0.5, -0.5]]) {
    const buffer = encodeCurveUpload([0, 1.25], [1e-30, -Math.PI], { name: "µV response" }, imaginary);
    const view = new DataView(buffer);
    assert.equal(new TextDecoder().decode(new Uint8Array(buffer, 0, 4)), "PYC1");
    const length = view.getUint32(4, true);
    assert.deepEqual(JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 8, length))), {
      points: 2, complex: !!imaginary, params: { name: "µV response" },
    });
    const samples = [];
    for (let offset = 8 + length; offset < buffer.byteLength; offset += 8) {
      samples.push(view.getFloat64(offset, true));
    }
    assert.deepEqual(samples, [0, 1.25, 1e-30, -Math.PI, ...(imaginary ?? [])]);
  }
});

test("binary curve upload rejects empty and mismatched arrays", () => {
  for (const [x, y, imag] of [[[], []], [[0], []], [[0], [1], []]]) {
    assert.throws(() => encodeCurveUpload(x, y, {}, imag), /same nonzero length/);
  }
});
