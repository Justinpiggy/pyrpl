import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const requireFromTest = createRequire(import.meta.url);

function loadScopeMathModule() {
  const source = readFileSync(new URL("../src/scope-math.ts", import.meta.url), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    Error,
    Float32Array,
    Float64Array,
    Math,
    Number,
    Set,
    String,
    exports: module.exports,
    module,
    require(path) {
      if (path === "expr-eval-fork") return requireFromTest(path);
      throw new Error(`Unexpected import ${path}`);
    },
  });
  return module.exports;
}

const { evaluateScopeMath } = loadScopeMathModule();
const ch1 = new Float32Array([-2, -0.5, 0.25, 2]);
const ch2 = new Float32Array([1, -1, 0.75, 0.1]);
const times = new Float64Array([0, 0.25, 0.5, 0.75]);

test("Scope math keeps PyRPL's element-wise NumPy spellings", () => {
  const values = evaluateScopeMath(
    "np.maximum(np.square(ch1), np.clip(ch2, -0.25, 0.5))",
    ch1,
    ch2,
    times,
  );

  assert.deepEqual(Array.from(values), [4, 0.25, 0.5, 4]);
});

test("Scope math supports NumPy conditionals and constants per sample", () => {
  const values = evaluateScopeMath(
    "np.where(ch1 >= 0, np.sin(np.pi / 2), np.heaviside(ch1, 0.25))",
    ch1,
    ch2,
    times,
  );

  assert.deepEqual(Array.from(values), [0, 0, 1, 1]);
});

test("Scope math keeps unsupported array APIs and unsafe expressions out", () => {
  assert.throws(
    () => evaluateScopeMath("np.mean(ch1)", ch1, ch2, times),
    /unknown variable mean/,
  );
  assert.throws(() => evaluateScopeMath("ch1 = 1", ch1, ch2, times));
  assert.throws(() => evaluateScopeMath("", ch1, ch2, times), /formula is empty/);
});
