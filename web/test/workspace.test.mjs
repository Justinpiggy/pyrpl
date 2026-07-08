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

function loadPanelRegistryModule() {
  const module = { exports: {} };
  vm.runInNewContext(transpile(new URL("../src/panel-registry.ts", import.meta.url)), {
    Error,
    exports: module.exports,
    module,
  });
  return module.exports;
}

function memoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    clear() {
      store.clear();
    },
  };
}

function loadWorkspaceModule() {
  const panelRegistry = loadPanelRegistryModule();
  const localStorage = memoryStorage();
  const module = { exports: {} };
  vm.runInNewContext(transpile(new URL("../src/workspace.ts", import.meta.url)), {
    Array,
    Error,
    JSON,
    Math,
    Number,
    Object,
    exports: module.exports,
    module,
    require(path) {
      if (path === "./panel-registry") {
        return panelRegistry;
      }
      throw new Error(`Unexpected import ${path}`);
    },
    window: { localStorage },
  });
  return { ...module.exports, localStorage };
}

test("workspace defaults to Scope enabled and Register Debug disabled", () => {
  const { defaultWorkspaceState } = loadWorkspaceModule();
  const state = defaultWorkspaceState();

  assert.equal(state.activePanelId, "scope");
  assert.equal(state.layoutMode, "tabs");
  assert.deepEqual(Array.from(state.workspaceSplitSizes), [50, 50]);
  assert.equal(state.panels.scope.enabled, true);
  assert.equal(state.panels.registers.enabled, false);
  assert.deepEqual(Array.from(state.panels.scope.splitSizes), [28, 72]);
});

test("workspace load recovers from invalid local storage", () => {
  const { loadWorkspaceState, localStorage } = loadWorkspaceModule();
  localStorage.setItem("pyrpl-websocket.workspace.v1", "{");

  const state = loadWorkspaceState();

  assert.equal(state.activePanelId, "scope");
  assert.equal(state.layoutMode, "tabs");
  assert.equal(state.panels.scope.enabled, true);
  assert.equal(state.panels.registers.enabled, false);
});

test("workspace preserves active enabled panel, layout mode, and split sizes", () => {
  const { loadWorkspaceState, saveWorkspaceState } = loadWorkspaceModule();
  saveWorkspaceState({
    activePanelId: "registers",
    layoutMode: "split-horizontal",
    workspaceSplitSizes: [35, 65],
    panels: {
      scope: { enabled: true, splitSizes: [30, 70] },
      registers: { enabled: true },
    },
  });

  const state = loadWorkspaceState();

  assert.equal(state.activePanelId, "registers");
  assert.equal(state.layoutMode, "split-horizontal");
  assert.deepEqual(Array.from(state.workspaceSplitSizes), [35, 65]);
  assert.equal(state.panels.registers.enabled, true);
  assert.deepEqual(Array.from(state.panels.scope.splitSizes), [30, 70]);
});

test("workspace falls back when saved active panel is disabled", () => {
  const { loadWorkspaceState, saveWorkspaceState } = loadWorkspaceModule();
  saveWorkspaceState({
    activePanelId: "registers",
    layoutMode: "unknown",
    workspaceSplitSizes: [2, 98],
    panels: {
      scope: { enabled: true, splitSizes: [1, 99] },
      registers: { enabled: false },
    },
  });

  const state = loadWorkspaceState();

  assert.equal(state.activePanelId, "scope");
  assert.equal(state.layoutMode, "tabs");
  assert.deepEqual(Array.from(state.workspaceSplitSizes), [50, 50]);
  assert.deepEqual(Array.from(state.panels.scope.splitSizes), [28, 72]);
});

test("workspace can represent no enabled panels", () => {
  const { firstEnabledPanel } = loadWorkspaceModule();

  assert.equal(
    firstEnabledPanel({
      scope: { enabled: false },
      registers: { enabled: false },
    }),
    null,
  );
});
