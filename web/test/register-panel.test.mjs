import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadRegisterPanelModule(fetchImpl) {
  const source = readFileSync(new URL("../src/register-panel.ts", import.meta.url), "utf8");
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
    Number,
    Promise,
    String,
    exports: module.exports,
    fetch: fetchImpl,
    module,
  });
  return module.exports;
}

function element(value = "") {
  const listeners = new Map();
  return {
    value,
    textContent: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    click() {
      listeners.get("click")?.();
    },
  };
}

function makeElements() {
  return {
    readAddr: element("0x40100014"),
    readLength: element("999"),
    readButton: element(),
    writeAddr: element("0x40100018"),
    writeValues: element("1, 0x2 3"),
    writeButton: element(),
    status: element(),
    output: element(),
  };
}

test("Register panel reads words and formats address/value output", async () => {
  const requests = [];
  const { createRegisterPanel } = loadRegisterPanelModule(async (url, init) => {
    requests.push({ url, init });
    return {
      ok: true,
      async json() {
        return { length: 2, values: [8192, 8193] };
      },
    };
  });
  const elements = makeElements();
  const panel = createRegisterPanel(elements);

  await panel.read();

  assert.equal(requests[0].url, "/api/register/read");
  assert.equal(requests[0].init.method, "POST");
  assert.deepEqual(JSON.parse(requests[0].init.body), { addr: 0x40100014, length: 64 });
  assert.equal(elements.status.textContent, "read 2 words");
  assert.match(elements.output.value, /0x40100014 \(1074790420\): 0x00002000 \(8192\)/);
  assert.match(elements.output.value, /0x40100018 \(1074790424\): 0x00002001 \(8193\)/);
});

test("Register panel writes decimal and hex values", async () => {
  const requests = [];
  const { createRegisterPanel } = loadRegisterPanelModule(async (url, init) => {
    requests.push({ url, init });
    return {
      ok: true,
      async json() {
        return { count: 3 };
      },
    };
  });
  const elements = makeElements();
  const panel = createRegisterPanel(elements);

  await panel.write();

  assert.equal(requests[0].url, "/api/register/write");
  assert.deepEqual(JSON.parse(requests[0].init.body), { addr: 0x40100018, values: [1, 2, 3] });
  assert.equal(elements.status.textContent, "wrote 3 words");
  assert.match(elements.output.value, /0x40100018 \(1074790424\) <= 0x00000001 \(1\)/);
  assert.match(elements.output.value, /0x40100020 \(1074790432\) <= 0x00000003 \(3\)/);
});

test("Register panel click handlers surface validation errors", async () => {
  const { createRegisterPanel } = loadRegisterPanelModule(async () => {
    throw new Error("fetch should not run");
  });
  const elements = makeElements();
  elements.writeValues.value = " ";
  createRegisterPanel(elements);

  elements.writeButton.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(elements.status.textContent, "At least one register value is required");
});
