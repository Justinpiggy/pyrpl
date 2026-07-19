import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadReconnectModule() {
  const source = readFileSync(new URL("../src/websocket-reconnect.ts", import.meta.url), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    Math,
    exports: module.exports,
    module,
  });
  return module.exports;
}

const { ReconnectScheduler, reconnectDelay } = loadReconnectModule();

test("reconnect delay uses bounded exponential backoff", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6].map((attempt) => reconnectDelay(attempt, 250, 5000)),
    [250, 500, 1000, 2000, 4000, 5000, 5000],
  );
});

test("reconnect scheduler deduplicates, retries, and resets after connection", () => {
  const pending = new Map();
  const cancelled = [];
  const delays = [];
  let nextHandle = 1;
  let reconnects = 0;
  const scheduler = new ReconnectScheduler(
    () => { reconnects += 1; },
    100,
    400,
    (callback, delay) => {
      const handle = nextHandle;
      nextHandle += 1;
      pending.set(handle, callback);
      delays.push(delay);
      return handle;
    },
    (handle) => {
      cancelled.push(handle);
      pending.delete(handle);
    },
  );

  assert.equal(scheduler.schedule(), 100);
  assert.equal(scheduler.schedule(), null);
  pending.get(1)();
  assert.equal(reconnects, 1);
  assert.equal(scheduler.schedule(), 200);
  scheduler.connected();
  assert.deepEqual(cancelled, [2]);
  assert.equal(scheduler.schedule(), 100);
  scheduler.cancel();
  assert.deepEqual(delays, [100, 200, 100]);
  assert.deepEqual(cancelled, [2, 3]);
});
