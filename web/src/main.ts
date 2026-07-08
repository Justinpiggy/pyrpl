import { ScopeStream } from "./scope-stream";
import Split from "split.js";
import { PANEL_DEFINITIONS, type PanelId } from "./panel-registry";
import { createRegisterPanel } from "./register-panel";
import {
  firstEnabledPanel,
  loadWorkspaceState,
  normalizeLayoutMode,
  normalizeSplitSizes,
  normalizeWorkspaceSplitSizes,
  saveWorkspaceState,
  type WorkspaceState,
  type WorkspaceLayoutMode,
} from "./workspace";

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing UI element ${selector}`);
  }
  return element;
}

const app = requireElement<HTMLDivElement>("#app");

app.innerHTML = `
  <section class="shell">
    <header class="topbar">
      <div>
        <h1>PyRPL WebSocket</h1>
        <p id="session-line">TypeScript oscilloscope frontend</p>
      </div>
      <nav class="menubar" aria-label="Workspace menu">
        <details class="menu-dropdown">
          <summary>Panels</summary>
          <div class="menu-content" id="panel-menu"></div>
        </details>
      </nav>
	    </header>

    <main class="workspace" id="workspace">
      <div class="workspace-tabs" id="workspace-tabs"></div>
      <div class="workspace-panels" id="workspace-panels">
        <section class="workspace-panel" id="scope-panel" data-panel-id="scope">
        <header class="panel-header">
          <div>
            <h2>Scope</h2>
            <p>Oscilloscope controls and live waveform</p>
          </div>
          <div class="actions">
            <div class="action-row">
              <button id="single-frame" type="button">Single</button>
              <button id="connect-scope" type="button">Run</button>
              <button id="pause-scope" type="button">Pause</button>
            </div>
            <div class="action-row">
              <button id="save-curve" type="button">Save Curve</button>
              <button id="zoom-out" class="plot-button" type="button" title="Zoom X out">X-</button>
              <button id="zoom-in" class="plot-button" type="button" title="Zoom X in">X+</button>
              <button id="zoom-y-out" class="plot-button" type="button" title="Zoom Y out">Y-</button>
              <button id="zoom-y-in" class="plot-button" type="button" title="Zoom Y in">Y+</button>
              <button id="pan-left" class="plot-button" type="button" title="Move view left">&lt;</button>
              <button id="pan-right" class="plot-button" type="button" title="Move view right">&gt;</button>
              <button id="pan-up" class="plot-button" type="button" title="Move trace up">^</button>
              <button id="pan-down" class="plot-button" type="button" title="Move trace down">v</button>
              <button id="zoom-reset" type="button">Reset</button>
            </div>
          </div>
        </header>
        <div class="panel-content" id="scope-panel-content">
          <section class="module-panel split-pane" id="scope-controls-pane">
            <div class="control-row signal-row">
              <div class="channel-control">
                <label class="toggle-control">
                  <input id="show-ch1" type="checkbox" checked />
                  <span>CH1</span>
                </label>
                <label>
                  <span>Input 1</span>
                  <select id="scope-input1"></select>
                </label>
              </div>
              <div class="channel-control">
                <label class="toggle-control">
                  <input id="show-ch2" type="checkbox" checked />
                  <span>CH2</span>
                </label>
                <label>
                  <span>Input 2</span>
                  <select id="scope-input2"></select>
                </label>
              </div>
              <label>
                <span>Trigger</span>
                <select id="scope-trigger"></select>
              </label>
              <label>
                <span>Run Mode</span>
                <select id="scope-run-mode"></select>
              </label>
              <label>
                <span>Duration</span>
                <select id="scope-duration"></select>
              </label>
              <label class="toggle-control">
                <input id="scope-average" type="checkbox" />
                <span>FPGA Avg</span>
              </label>
            </div>
            <div class="control-row tune-row">
              <label>
                <span>Trace Avg</span>
                <input id="scope-trace-average" type="number" min="1" max="1024" step="1" />
              </label>
              <label>
                <span>Trig Delay</span>
                <input id="scope-trigger-delay" type="number" step="0.000001" />
              </label>
              <label>
                <span>Threshold</span>
                <input id="scope-threshold" type="number" min="-1" max="1" step="0.0001220703125" />
              </label>
              <label>
                <span>Hysteresis</span>
                <input id="scope-hysteresis" type="number" min="0" max="1" step="0.0001220703125" />
              </label>
              <label>
                <span>Saved State</span>
                <select id="scope-state-select"></select>
              </label>
              <label>
                <span>State Name</span>
                <input id="scope-state-name" type="text" value="default" />
              </label>
              <button id="scope-state-save" type="button">Save</button>
              <button id="scope-state-load" type="button">Load</button>
              <button id="scope-state-delete" type="button">Delete</button>
            </div>
            <output id="module-status">Scope controls loading...</output>
          </section>

          <section class="plot-panel split-pane" id="scope-plot-pane">
            <div class="plot-toolbar">
              <output id="plot-hint">Drag pans. Right-drag zooms X/Y. Use header controls for touch-friendly zoom and offsets.</output>
            </div>
            <div id="scope-plot"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="asg-panel" data-panel-id="asg" hidden>
        <header class="panel-header">
          <div>
            <h2>ASG</h2>
            <p>Arbitrary signal generators</p>
          </div>
        </header>
        <div class="panel-content instrument-grid">
          ${["asg0", "asg1"].map((moduleName, index) => `
          <section class="module-panel instrument-card" data-asg-module="${moduleName}">
            <header class="instrument-card-header">
              <h3>ASG ${index}</h3>
              <output id="${moduleName}-status">${moduleName} ready</output>
            </header>
            <div class="control-row asg-row">
              <label>
                <span>Waveform</span>
                <select id="${moduleName}-waveform"></select>
              </label>
              <label>
                <span>Frequency</span>
                <input id="${moduleName}-frequency" type="number" min="0" step="1" />
              </label>
              <label>
                <span>Amplitude</span>
                <input id="${moduleName}-amplitude" type="number" min="0" max="1" step="0.001" />
              </label>
              <label>
                <span>Offset</span>
                <input id="${moduleName}-offset" type="number" min="-1" max="1" step="0.001" />
              </label>
              <label>
                <span>Trigger</span>
                <select id="${moduleName}-trigger-source"></select>
              </label>
              <label>
                <span>Output</span>
                <select id="${moduleName}-output-direct"></select>
              </label>
              <label>
                <span>Start Phase</span>
                <input id="${moduleName}-start-phase" type="number" min="0" max="360" step="0.1" />
              </label>
              <label>
                <span>Cycles/Burst</span>
                <input id="${moduleName}-cycles-per-burst" type="number" min="0" step="1" />
              </label>
              <button id="${moduleName}-setup" type="button">Setup</button>
              <button id="${moduleName}-trigger" type="button">Trigger</button>
              <button id="${moduleName}-off" type="button">Off</button>
            </div>
          </section>`).join("")}
        </div>
        </section>
        <section class="workspace-panel" id="housekeeping-panel" data-panel-id="housekeeping" hidden>
        <header class="panel-header">
          <div>
            <h2>Housekeeping</h2>
            <p>LED and expansion I/O</p>
          </div>
        </header>
        <div class="panel-content">
          <section class="module-panel housekeeping-panel">
            <div class="control-row housekeeping-top-row">
              <label>
                <span>LED</span>
                <input id="hk-led" type="number" min="0" max="255" step="1" />
              </label>
              <button id="hk-refresh" type="button">Refresh</button>
              <output id="hk-status">Housekeeping ready</output>
            </div>
            <div class="housekeeping-grid" id="hk-expansion-grid"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="registers-panel" data-panel-id="registers" hidden>
        <header class="panel-header">
          <div>
            <h2>Register Debug</h2>
            <p>Raw monitor_server register read/write</p>
          </div>
        </header>
        <div class="panel-content register-panel-content">
          <section class="module-panel register-panel">
            <div class="control-row register-row">
              <label>
                <span>Read Addr</span>
                <input id="register-read-addr" type="text" value="0x40100014" />
              </label>
              <label>
                <span>Length</span>
                <input id="register-read-length" type="number" min="1" max="64" step="1" value="1" />
              </label>
              <button id="register-read" type="button">Read</button>
              <label>
                <span>Write Addr</span>
                <input id="register-write-addr" type="text" value="0x40100014" />
              </label>
              <label>
                <span>Values</span>
                <input id="register-write-values" type="text" value="8192" />
              </label>
              <button id="register-write" type="button">Write</button>
            </div>
            <output id="register-status">Register debug ready</output>
            <textarea id="register-output" readonly spellcheck="false"></textarea>
          </section>
        </div>
        </section>
        <section class="empty-workspace" id="empty-workspace" hidden>
          <h2>No Panels Enabled</h2>
          <p>Use Panels to enable an instrument.</p>
        </section>
      </div>
    </main>

    <footer class="statusbar">
      <span id="status">Idle</span>
    </footer>
  </section>
`;

const style = document.createElement("style");
style.textContent = `
  :root {
    color-scheme: dark;
    --bg: #0d1114;
    --panel: #12191e;
    --panel-border: #27343d;
    --text: #edf4f7;
    --muted: #9aacb6;
    --button: #1d272e;
    --button-hover: #283640;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  #app {
    height: 100%;
    min-height: 0;
  }

  .shell {
	    display: grid;
	    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
    min-height: 0;
    gap: 8px;
    padding: 8px;
    overflow: hidden;
  }

	  .topbar,
    .workspace-panel,
	  .module-panel,
	  .plot-panel,
    .empty-workspace,
  .statusbar {
    border: 1px solid var(--panel-border);
    background: var(--panel);
  }

  .topbar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 6px 10px;
  }

  h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 680;
    letter-spacing: 0;
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 0;
  }

  p {
    margin: 2px 0 0;
    color: var(--muted);
    font-size: 11px;
  }

  .menubar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .menu-dropdown {
    position: relative;
  }

  .menu-dropdown summary {
    display: inline-flex;
    align-items: center;
    height: 28px;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: var(--button);
    color: var(--text);
    cursor: pointer;
    font-size: 13px;
    list-style: none;
    padding: 0 10px;
  }

  .menu-dropdown summary::-webkit-details-marker {
    display: none;
  }

  .menu-content {
    position: absolute;
    right: 0;
    z-index: 5;
    min-width: 160px;
    margin-top: 6px;
    border: 1px solid var(--panel-border);
    background: #090d10;
    box-shadow: 0 12px 30px rgb(0 0 0 / 0.35);
    padding: 8px;
  }

  .menu-check {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    color: var(--text);
    font-size: 13px;
    white-space: nowrap;
  }

  .menu-field {
    display: grid;
    gap: 4px;
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--panel-border);
    color: var(--muted);
    font-size: 12px;
  }

  .menu-field select {
    height: 30px;
  }

  .actions,
  .action-row,
  .zoom-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions {
    flex-direction: column;
    align-items: flex-end;
  }

  button {
    min-width: 0;
    height: 28px;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: var(--button);
    color: var(--text);
    font: inherit;
    font-size: 12px;
    padding: 0 8px;
  }

  .plot-button {
    width: 34px;
    padding: 0 4px;
  }

  select {
    height: 36px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 13px;
    padding: 0 10px;
  }

  input[type="number"],
  input[type="text"] {
    height: 36px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 13px;
    padding: 0 10px;
  }

  .select-control,
  .toggle-control {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .select-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .toggle-control {
    height: 36px;
    white-space: nowrap;
  }

  .toggle-control input {
    accent-color: #4fd17f;
  }

  button:hover {
    background: var(--button-hover);
  }

	  .plot-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 8px;
    min-height: 0;
    padding: 8px;
    overflow: hidden;
	  }

  .workspace {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    overflow: hidden;
  }

  .workspace-tabs:empty {
    display: none;
  }

  .workspace-tab {
    height: 28px;
    border-color: var(--panel-border);
    background: #0f1519;
    color: var(--muted);
  }

  .workspace-tab.is-active {
    border-color: #71828e;
    background: var(--panel);
    color: var(--text);
  }

  .workspace-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-panel[hidden],
  .empty-workspace[hidden] {
    display: none;
  }

  .workspace-panels {
    min-height: 0;
    overflow: hidden;
  }

  .workspace-panels.is-tabs {
    display: block;
  }

  .workspace-panels.is-split {
    display: flex;
  }

  .workspace-panels.is-horizontal {
    flex-direction: row;
  }

  .workspace-panels.is-vertical {
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    border-bottom: 1px solid var(--panel-border);
    padding: 7px 10px;
  }

  .panel-header p {
    margin-top: 2px;
    font-size: 12px;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 8px;
    padding: 8px;
    overflow: hidden;
  }

  .split-pane {
    min-height: 0;
    overflow: hidden;
  }

  .gutter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    background: #27343d;
  }

  .gutter.gutter-vertical {
    height: 8px;
    cursor: row-resize;
  }

  .gutter.gutter-horizontal {
    width: 8px;
    cursor: col-resize;
  }

  .gutter.gutter-vertical::before {
    display: block;
    width: 44px;
    height: 2px;
    background: #71828e;
    content: "";
  }

  .gutter.gutter-horizontal::before {
    display: block;
    width: 2px;
    height: 44px;
    background: #71828e;
    content: "";
  }

  .gutter:hover,
  .gutter:active {
    background: #344550;
  }

  .empty-workspace {
    display: grid;
    height: 100%;
    place-content: center;
    gap: 6px;
    color: var(--muted);
    text-align: center;
  }

  .register-panel-content {
    display: block;
  }

  .register-panel {
    height: 100%;
    align-content: start;
  }

  .register-row {
    grid-template-columns: minmax(130px, 1fr) minmax(80px, 0.4fr) auto minmax(130px, 1fr) minmax(160px, 1fr) auto;
  }

  .instrument-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    align-items: start;
    overflow: auto;
  }

  .instrument-card {
    align-content: start;
  }

  .instrument-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .instrument-card-header h3 {
    margin: 0;
    font-size: 14px;
  }

  .instrument-card-header output {
    min-height: 24px;
    text-align: right;
  }

  .asg-row {
    grid-template-columns: repeat(4, minmax(92px, 1fr)) repeat(3, auto);
  }

  .housekeeping-panel {
    align-content: start;
    overflow: auto;
  }

  .housekeeping-top-row {
    grid-template-columns: minmax(110px, 180px) auto minmax(180px, 1fr);
  }

  .housekeeping-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 8px;
  }

  .housekeeping-bank {
    display: grid;
    gap: 6px;
    padding: 8px;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
  }

  .housekeeping-bank h3 {
    margin: 0;
    font-size: 13px;
  }

  .housekeeping-pin {
    display: grid;
    grid-template-columns: 36px minmax(80px, 1fr) minmax(96px, 1fr);
    align-items: center;
    gap: 8px;
  }

  #register-output {
    width: 100%;
    min-height: 260px;
    resize: none;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #05080a;
    color: var(--text);
    font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    padding: 10px;
  }
	
	  .module-panel {
	    display: grid;
	    grid-template-columns: 1fr;
	    align-items: end;
	    gap: 8px;
	    min-height: 0;
	    padding: 10px;
	    overflow: hidden;
	  }

    .control-row {
      display: grid;
      align-items: end;
      gap: 8px;
    }

    .signal-row {
      grid-template-columns: minmax(180px, 1.4fr) minmax(180px, 1.4fr) repeat(3, minmax(120px, 1fr)) minmax(92px, auto);
    }

    .tune-row {
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    }

    .channel-control {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: end;
      gap: 8px;
    }
	
	  .module-panel label,
    .control-row label {
	    display: grid;
	    gap: 3px;
	  }
	
	  .module-panel label span {
	    color: var(--muted);
	    font-size: 11px;
	  }

  .plot-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  output {
    min-height: 36px;
    align-content: center;
    overflow: hidden;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #scope-plot {
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    background: #05080a;
  }

  #scope-plot > .uplot {
    max-width: 100%;
    max-height: 100%;
  }

  .uplot {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .uplot .u-title,
  .uplot .u-legend {
    color: var(--text);
  }

  .uplot .u-over {
    cursor: crosshair;
    touch-action: none;
  }

  .uplot .u-over.is-panning {
    cursor: grabbing;
  }

  .uplot .u-over.is-zooming {
    cursor: ew-resize;
  }

  .statusbar {
    min-height: 36px;
    max-height: 36px;
    padding: 9px 12px;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
  }

	  @media (max-width: 680px) {
	    .topbar,
      .menubar,
	    .module-panel,
	    .plot-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .actions button,
    .zoom-actions button {
      flex: 1 1 120px;
    }

    .menubar {
      margin-left: 0;
    }

    .menu-content {
      left: 0;
      right: auto;
    }

	    .zoom-actions {
	      width: 100%;
	    }
	
	    .module-panel {
	      display: grid;
	      grid-template-columns: 1fr;
	    }

      .signal-row,
      .tune-row,
      .register-row {
        grid-template-columns: 1fr 1fr;
      }
	
	    .module-panel output {
	      grid-column: 1 / -1;
	    }
	  }
`;
document.head.appendChild(style);

const plotHost = requireElement<HTMLDivElement>("#scope-plot");
const scopePanelContent = requireElement<HTMLDivElement>("#scope-panel-content");
const scopeControlsPane = requireElement<HTMLElement>("#scope-controls-pane");
const scopePlotPane = requireElement<HTMLElement>("#scope-plot-pane");
const panelMenu = requireElement<HTMLDivElement>("#panel-menu");
const workspaceTabs = requireElement<HTMLDivElement>("#workspace-tabs");
const workspacePanels = requireElement<HTMLDivElement>("#workspace-panels");
const scopePanel = requireElement<HTMLElement>("#scope-panel");
const asgPanel = requireElement<HTMLElement>("#asg-panel");
const housekeepingPanel = requireElement<HTMLElement>("#housekeeping-panel");
const registersPanel = requireElement<HTMLElement>("#registers-panel");
const panelElements: Record<PanelId, HTMLElement> = {
  scope: scopePanel,
  asg: asgPanel,
  housekeeping: housekeepingPanel,
  registers: registersPanel,
};
const emptyWorkspace = requireElement<HTMLElement>("#empty-workspace");
const status = requireElement<HTMLSpanElement>("#status");
const connectButton = requireElement<HTMLButtonElement>("#connect-scope");
const singleFrameButton = requireElement<HTMLButtonElement>("#single-frame");
const pauseButton = requireElement<HTMLButtonElement>("#pause-scope");
const saveCurveButton = requireElement<HTMLButtonElement>("#save-curve");
const zoomOutButton = requireElement<HTMLButtonElement>("#zoom-out");
const zoomInButton = requireElement<HTMLButtonElement>("#zoom-in");
const zoomYOutButton = requireElement<HTMLButtonElement>("#zoom-y-out");
const zoomYInButton = requireElement<HTMLButtonElement>("#zoom-y-in");
const panLeftButton = requireElement<HTMLButtonElement>("#pan-left");
const panRightButton = requireElement<HTMLButtonElement>("#pan-right");
const panUpButton = requireElement<HTMLButtonElement>("#pan-up");
const panDownButton = requireElement<HTMLButtonElement>("#pan-down");
const zoomResetButton = requireElement<HTMLButtonElement>("#zoom-reset");
const showCh1Toggle = requireElement<HTMLInputElement>("#show-ch1");
const showCh2Toggle = requireElement<HTMLInputElement>("#show-ch2");
const scopeInput1 = requireElement<HTMLSelectElement>("#scope-input1");
const scopeInput2 = requireElement<HTMLSelectElement>("#scope-input2");
const scopeTrigger = requireElement<HTMLSelectElement>("#scope-trigger");
const scopeRunMode = requireElement<HTMLSelectElement>("#scope-run-mode");
const scopeDuration = requireElement<HTMLSelectElement>("#scope-duration");
const scopeAverage = requireElement<HTMLInputElement>("#scope-average");
const scopeTraceAverage = requireElement<HTMLInputElement>("#scope-trace-average");
const scopeTriggerDelay = requireElement<HTMLInputElement>("#scope-trigger-delay");
const scopeThreshold = requireElement<HTMLInputElement>("#scope-threshold");
const scopeHysteresis = requireElement<HTMLInputElement>("#scope-hysteresis");
const scopeStateSelect = requireElement<HTMLSelectElement>("#scope-state-select");
const scopeStateName = requireElement<HTMLInputElement>("#scope-state-name");
const scopeStateSave = requireElement<HTMLButtonElement>("#scope-state-save");
const scopeStateLoad = requireElement<HTMLButtonElement>("#scope-state-load");
const scopeStateDelete = requireElement<HTMLButtonElement>("#scope-state-delete");
const registerStatus = requireElement<HTMLOutputElement>("#register-status");
const moduleStatus = requireElement<HTMLOutputElement>("#module-status");
const hkStatus = requireElement<HTMLOutputElement>("#hk-status");
const hkLed = requireElement<HTMLInputElement>("#hk-led");
const hkRefresh = requireElement<HTMLButtonElement>("#hk-refresh");
const hkExpansionGrid = requireElement<HTMLDivElement>("#hk-expansion-grid");
const sessionLine = requireElement<HTMLParagraphElement>("#session-line");
createRegisterPanel({
  readAddr: requireElement<HTMLInputElement>("#register-read-addr"),
  readLength: requireElement<HTMLInputElement>("#register-read-length"),
  readButton: requireElement<HTMLButtonElement>("#register-read"),
  writeAddr: requireElement<HTMLInputElement>("#register-write-addr"),
  writeValues: requireElement<HTMLInputElement>("#register-write-values"),
  writeButton: requireElement<HTMLButtonElement>("#register-write"),
  status: registerStatus,
  output: requireElement<HTMLTextAreaElement>("#register-output"),
});

interface ModuleAttribute {
  name: string;
  label: string;
  type: "select" | "bool" | "number";
  value: string | number | boolean;
  options?: Array<string | number>;
  min?: number;
  max?: number;
  step?: number;
}

interface ScopeState {
  input1?: string;
  input2?: string;
  trigger_source?: string;
  run_mode?: string;
  duration?: number;
  average?: boolean;
  trace_average?: number;
  trigger_delay?: number;
  threshold?: number;
  hysteresis?: number;
  running_state?: string;
}

interface SavedScopeState {
  name: string;
  state: ScopeState;
}

type ModuleState = Record<string, string | number | boolean | null | undefined>;
type AsgModuleId = "asg0" | "asg1";

interface AsgControls {
  status: HTMLOutputElement;
  waveform: HTMLSelectElement;
  frequency: HTMLInputElement;
  amplitude: HTMLInputElement;
  offset: HTMLInputElement;
  triggerSource: HTMLSelectElement;
  outputDirect: HTMLSelectElement;
  startPhase: HTMLInputElement;
  cyclesPerBurst: HTMLInputElement;
  setup: HTMLButtonElement;
  trigger: HTMLButtonElement;
  off: HTMLButtonElement;
}

const asgModules: AsgModuleId[] = ["asg0", "asg1"];
const asgControls: Record<AsgModuleId, AsgControls> = {
  asg0: createAsgControls("asg0"),
  asg1: createAsgControls("asg1"),
};

let stream = new ScopeStream(plotHost, (message) => {
  status.textContent = message;
});
let eventSocket: WebSocket | null = null;
let eventCount = 0;
let runningState = "stopped";
let workspaceState = loadWorkspaceState();
let currentSession: { fake: boolean } | null = null;
let scopeSplit: Split.Instance | null = null;
let workspaceSplit: Split.Instance | null = null;
let workspaceSplitMode: WorkspaceLayoutMode | null = null;
let workspaceSplitPanelSignature = "";

function exposeDebugState(): void {
  window.pyrplScope = {
    getFrameSequence: () => stream.getFrameSequence(),
    getSampleCount: () => stream.getSampleCount(),
    getXRange: () => stream.getXRange(),
    getYRange: () => stream.getYRange(),
    isChannelVisible: (channel: 1 | 2) => stream.getChannelVisible(channel),
    getEventCount: () => eventCount,
    getTraceAverage: () => stream.getTraceAverage(),
    getRunningState: () => runningState,
    isPanelEnabled: (panelId: PanelId) => workspaceState.panels[panelId]?.enabled ?? false,
    getScopeSplitSizes: () => workspaceState.panels.scope.splitSizes ?? [28, 72],
    getWorkspaceLayoutMode: () => workspaceState.layoutMode,
    getWorkspaceSplitSizes: () => workspaceState.workspaceSplitSizes,
    getActivePanelId: () => workspaceState.activePanelId,
    getCsvLineCount: () => stream.exportCsv().trimEnd().split("\n").length,
    getDisplayedStats: () => stream.getDisplayedStats(),
    moduleStatusText: () => moduleStatus.textContent ?? "",
    statusText: () => status.textContent ?? "",
  };
}

function controlId(moduleName: AsgModuleId, attribute: string): string {
  return `#${moduleName}-${attribute.replaceAll("_", "-")}`;
}

function createAsgControls(moduleName: AsgModuleId): AsgControls {
  return {
    status: requireElement<HTMLOutputElement>(`#${moduleName}-status`),
    waveform: requireElement<HTMLSelectElement>(controlId(moduleName, "waveform")),
    frequency: requireElement<HTMLInputElement>(controlId(moduleName, "frequency")),
    amplitude: requireElement<HTMLInputElement>(controlId(moduleName, "amplitude")),
    offset: requireElement<HTMLInputElement>(controlId(moduleName, "offset")),
    triggerSource: requireElement<HTMLSelectElement>(controlId(moduleName, "trigger_source")),
    outputDirect: requireElement<HTMLSelectElement>(controlId(moduleName, "output_direct")),
    startPhase: requireElement<HTMLInputElement>(controlId(moduleName, "start_phase")),
    cyclesPerBurst: requireElement<HTMLInputElement>(controlId(moduleName, "cycles_per_burst")),
    setup: requireElement<HTMLButtonElement>(`#${moduleName}-setup`),
    trigger: requireElement<HTMLButtonElement>(`#${moduleName}-trigger`),
    off: requireElement<HTMLButtonElement>(`#${moduleName}-off`),
  };
}

function applyWorkspaceState(): void {
  renderPanelMenu();
  renderWorkspaceTabs();
  const enabledPanels = enabledPanelIds();
  const useWorkspaceSplit = workspaceState.layoutMode !== "tabs" && enabledPanels.length > 1;
  const visiblePanelIds = useWorkspaceSplit
    ? enabledPanels
    : workspaceState.activePanelId
      ? [workspaceState.activePanelId]
      : [];
  const visiblePanels = new Set<PanelId>(visiblePanelIds);
  const hasEnabledPanels = enabledPanels.length > 0;

  workspacePanels.className = `workspace-panels ${
    useWorkspaceSplit
      ? `is-split ${workspaceState.layoutMode === "split-horizontal" ? "is-horizontal" : "is-vertical"}`
      : "is-tabs"
  }`;
  for (const [panelId, panel] of Object.entries(panelElements) as Array<[PanelId, HTMLElement]>) {
    panel.hidden = !visiblePanels.has(panelId);
  }
  emptyWorkspace.hidden = hasEnabledPanels;
  if (useWorkspaceSplit) {
    ensureWorkspaceSplit(visiblePanelIds);
  } else {
    destroyWorkspaceSplit();
  }
  if (visiblePanels.has("scope")) {
    ensureScopeSplit();
    window.requestAnimationFrame(() => stream.refreshLayout());
  } else {
    destroyScopeSplit();
  }
}

function enabledPanelIds(): PanelId[] {
  return PANEL_DEFINITIONS.filter((panel) => workspaceState.panels[panel.id]?.enabled).map((panel) => panel.id);
}

function renderPanelMenu(): void {
  panelMenu.textContent = "";
  for (const panel of PANEL_DEFINITIONS) {
    const label = document.createElement("label");
    label.className = "menu-check";
    const input = document.createElement("input");
    input.id = `panel-${panel.id}-enabled`;
    input.type = "checkbox";
    input.checked = workspaceState.panels[panel.id]?.enabled ?? false;
    input.addEventListener("change", () => {
      input.closest("details")?.removeAttribute("open");
      setPanelEnabled(panel.id, input.checked).catch((error: Error) => {
        moduleStatus.textContent = error.message;
        registerStatus.textContent = error.message;
      });
    });
    const title = document.createElement("span");
    title.textContent = panel.title;
    label.append(input, title);
    panelMenu.appendChild(label);
  }

  const layoutLabel = document.createElement("label");
  layoutLabel.className = "menu-field";
  const layoutText = document.createElement("span");
  layoutText.textContent = "Layout";
  const layoutSelect = document.createElement("select");
  layoutSelect.id = "workspace-layout-mode";
  const layoutOptions: Array<[WorkspaceLayoutMode, string]> = [
    ["tabs", "Tabs"],
    ["split-horizontal", "Side by Side"],
    ["split-vertical", "Stacked"],
  ];
  for (const [value, label] of layoutOptions) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    layoutSelect.appendChild(option);
  }
  layoutSelect.value = workspaceState.layoutMode;
  layoutSelect.addEventListener("change", () => {
    setWorkspaceLayoutMode(normalizeLayoutMode(layoutSelect.value)).catch((error: Error) => {
      moduleStatus.textContent = error.message;
      registerStatus.textContent = error.message;
    });
  });
  layoutLabel.append(layoutText, layoutSelect);
  panelMenu.appendChild(layoutLabel);
}

function renderWorkspaceTabs(): void {
  workspaceTabs.textContent = "";
  for (const panel of PANEL_DEFINITIONS) {
    if (!workspaceState.panels[panel.id]?.enabled) {
      continue;
    }
    const button = document.createElement("button");
    button.className = `workspace-tab${workspaceState.activePanelId === panel.id ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = panel.title;
    button.addEventListener("click", () => {
      setActivePanel(panel.id).catch((error: Error) => {
        moduleStatus.textContent = error.message;
      });
    });
    workspaceTabs.appendChild(button);
  }
}

function ensureScopeSplit(): void {
  if (scopeSplit || scopePanel.hidden) {
    return;
  }
  scopeSplit = Split([scopeControlsPane, scopePlotPane], {
    direction: "vertical",
    sizes: workspaceState.panels.scope.splitSizes,
    minSize: [132, 260],
    gutterSize: 8,
    snapOffset: 24,
    onDrag: () => stream.refreshLayout(),
    onDragEnd: (sizes) => {
      workspaceState = {
        ...workspaceState,
        panels: {
          ...workspaceState.panels,
          scope: {
            ...workspaceState.panels.scope,
            splitSizes: normalizeSplitSizes(sizes),
          },
        },
      };
      saveWorkspaceState(workspaceState);
      stream.refreshLayout();
    },
  });
}

function destroyScopeSplit(): void {
  scopeSplit?.destroy();
  scopeSplit = null;
  scopeControlsPane.removeAttribute("style");
  scopePlotPane.removeAttribute("style");
}

function ensureWorkspaceSplit(panelIds: PanelId[]): void {
  const panelSignature = panelIds.join("|");
  if (workspaceSplit && workspaceSplitMode === workspaceState.layoutMode && workspaceSplitPanelSignature === panelSignature) {
    return;
  }
  destroyWorkspaceSplit();
  workspaceSplitMode = workspaceState.layoutMode;
  workspaceSplitPanelSignature = panelSignature;
  workspaceSplit = Split(
    panelIds.map((panelId) => panelElements[panelId]),
    {
      direction: workspaceState.layoutMode === "split-horizontal" ? "horizontal" : "vertical",
      sizes: normalizeWorkspaceSplitSizes(workspaceState.workspaceSplitSizes, panelIds.length),
      minSize: 220,
      gutterSize: 8,
      snapOffset: 24,
      onDrag: () => stream.refreshLayout(),
      onDragEnd: (sizes) => {
        workspaceState = {
          ...workspaceState,
          workspaceSplitSizes: normalizeWorkspaceSplitSizes(sizes, panelIds.length),
        };
        saveWorkspaceState(workspaceState);
        stream.refreshLayout();
      },
    },
  );
}

function destroyWorkspaceSplit(): void {
  workspaceSplit?.destroy();
  workspaceSplit = null;
  workspaceSplitMode = null;
  workspaceSplitPanelSignature = "";
  for (const panel of Object.values(panelElements)) {
    panel.removeAttribute("style");
  }
}

async function setPanelEnabled(panelId: PanelId, enabled: boolean): Promise<void> {
  const currentPanelState = workspaceState.panels[panelId];
  const nextPanels = {
    ...workspaceState.panels,
    [panelId]: { ...currentPanelState, enabled },
  };
  const activePanelId =
    enabled && workspaceState.activePanelId === null
      ? panelId
      : !enabled && workspaceState.activePanelId === panelId
        ? firstEnabledPanel(nextPanels)
        : workspaceState.activePanelId;
  workspaceState = {
    ...workspaceState,
    activePanelId,
    panels: nextPanels,
  };
  saveWorkspaceState(workspaceState);
  applyWorkspaceState();
  if (panelId === "scope" && !enabled) {
    stopStream("Scope panel disabled");
    await callScopeAction("stop");
    return;
  }
  if (panelId === "scope" && enabled && workspaceState.activePanelId === "scope") {
    await activateScopePanel();
  }
}

async function setActivePanel(panelId: PanelId): Promise<void> {
  if (!workspaceState.panels[panelId]?.enabled) {
    return;
  }
  workspaceState = { ...workspaceState, activePanelId: panelId };
  saveWorkspaceState(workspaceState);
  applyWorkspaceState();
  if (panelId === "scope") {
    await activateScopePanel();
  }
}

async function setWorkspaceLayoutMode(layoutMode: WorkspaceLayoutMode): Promise<void> {
  workspaceState = { ...workspaceState, layoutMode };
  saveWorkspaceState(workspaceState);
  applyWorkspaceState();
  if (workspaceState.panels.scope.enabled && layoutMode !== "tabs") {
    window.requestAnimationFrame(() => stream.refreshLayout());
  }
}

async function activateScopePanel(): Promise<void> {
  await fetchSingleFrame();
  if (currentSession?.fake) {
    await callScopeAction("continuous");
    startStream();
  }
}

function setRunningState(state: string): void {
  runningState = state;
  pauseButton.disabled = !state.startsWith("running_");
}

function startStream(): void {
  if (connectButton.dataset.connected === "true") {
    return;
  }
  stream.connect();
  connectButton.dataset.connected = "true";
  connectButton.textContent = "Stop";
}

function stopStream(message = "Disconnected"): void {
  stream.close();
  connectButton.dataset.connected = "false";
  connectButton.textContent = "Run";
  status.textContent = message;
}

async function callScopeAction(action: string): Promise<Record<string, unknown>> {
  const response = await fetch(`/api/modules/scope/actions/${action}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Scope action ${action} failed: ${response.status}`);
  }
  const payload = await response.json();
  const state = payload.state as { running_state?: string; last_action?: string };
  if (state.running_state) {
    setRunningState(state.running_state);
  }
  moduleStatus.textContent = `${action}: ${state.running_state ?? "ok"}`;
  return payload;
}

async function refreshSession(): Promise<{ fake: boolean } | null> {
  try {
    const response = await fetch("/api/session");
    const session = await response.json();
    const mode = session.fake ? "fake hardware" : session.settings.hostname;
    sessionLine.textContent = `Session: ${mode} | reads ${session.reads} | writes ${session.writes}`;
    if (session.scope?.running_state) {
      setRunningState(session.scope.running_state);
    }
    return { fake: Boolean(session.fake) };
  } catch {
    sessionLine.textContent = "Session unavailable";
    return null;
  }
}

function optionLabel(value: string | number): string {
  if (typeof value === "number") {
    if (value < 1e-3) {
      return `${(value * 1e6).toPrecision(4)} us`;
    }
    if (value < 1) {
      return `${(value * 1e3).toPrecision(4)} ms`;
    }
    return `${value.toPrecision(4)} s`;
  }
  return value;
}

function attributeValueLabel(attribute: string, value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "number" && (attribute === "duration" || attribute === "trigger_delay")) {
    return optionLabel(value);
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(6)));
  }
  return value;
}

function populateSelect(select: HTMLSelectElement, attribute: ModuleAttribute): void {
  select.textContent = "";
  for (const option of attribute.options ?? []) {
    const element = document.createElement("option");
    element.value = String(option);
    element.textContent = optionLabel(option);
    select.appendChild(element);
  }
  select.value = String(attribute.value);
}

function applyScopeControlValue(attribute: string, value: string | number | boolean): void {
  if (attribute === "input1") {
    scopeInput1.value = String(value);
  } else if (attribute === "input2") {
    scopeInput2.value = String(value);
  } else if (attribute === "trigger_source") {
    scopeTrigger.value = String(value);
    updatePlotTimeSettings();
  } else if (attribute === "run_mode") {
    scopeRunMode.value = String(value);
  } else if (attribute === "duration") {
    scopeDuration.value = String(value);
    updatePlotTimeSettings();
  } else if (attribute === "average") {
    scopeAverage.checked = Boolean(value);
  } else if (attribute === "trace_average") {
    scopeTraceAverage.value = String(value);
    stream.setTraceAverage(Number(value));
  } else if (attribute === "trigger_delay") {
    scopeTriggerDelay.value = String(value);
    updatePlotTimeSettings();
  } else if (attribute === "threshold") {
    scopeThreshold.value = String(value);
  } else if (attribute === "hysteresis") {
    scopeHysteresis.value = String(value);
  }
}

function updatePlotTimeSettings(): void {
  stream.setTimeSettings({
    duration: Number(scopeDuration.value),
    triggerDelay: Number(scopeTriggerDelay.value || 0),
    triggerSource: scopeTrigger.value,
  });
}

function populateNumber(input: HTMLInputElement, attribute: ModuleAttribute): void {
  input.value = String(attribute.value);
  if (attribute.min !== undefined) {
    input.min = String(attribute.min);
  }
  if (attribute.max !== undefined) {
    input.max = String(attribute.max);
  }
  if (attribute.step !== undefined) {
    input.step = String(attribute.step);
  }
}

function applyScopeState(state: ScopeState): void {
  for (const [attribute, value] of Object.entries(state)) {
    if (value !== null && value !== undefined) {
      applyScopeControlValue(attribute, value as string | number | boolean);
    }
  }
  if (state.running_state) {
    setRunningState(state.running_state);
  }
}

async function setScopeAttribute(attribute: string, value: string | number | boolean): Promise<void> {
  const result = await setModuleAttributeValue("scope", attribute, value);
  applyScopeControlValue(attribute, result.value);
  moduleStatus.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
}

async function setModuleAttributeValue(
  moduleName: string,
  attribute: string,
  value: string | number | boolean,
): Promise<{ value: string | number | boolean }> {
  const response = await fetch(`/api/modules/${moduleName}/attributes/${attribute}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    throw new Error(`Failed to set ${moduleName}.${attribute}: ${response.status}`);
  }
  return response.json();
}

async function loadScopeControls(): Promise<void> {
  const response = await fetch("/api/modules/scope/attributes");
  if (!response.ok) {
    throw new Error(`Scope controls unavailable: ${response.status}`);
  }
  const payload = await response.json();
  const attributes = new Map<string, ModuleAttribute>(
    payload.attributes.map((attribute: ModuleAttribute) => [attribute.name, attribute]),
  );
  populateSelect(scopeInput1, attributes.get("input1")!);
  populateSelect(scopeInput2, attributes.get("input2")!);
  populateSelect(scopeTrigger, attributes.get("trigger_source")!);
  populateSelect(scopeRunMode, attributes.get("run_mode")!);
  populateSelect(scopeDuration, attributes.get("duration")!);
  scopeAverage.checked = Boolean(attributes.get("average")?.value);
  populateNumber(scopeTraceAverage, attributes.get("trace_average")!);
  populateNumber(scopeTriggerDelay, attributes.get("trigger_delay")!);
  populateNumber(scopeThreshold, attributes.get("threshold")!);
  populateNumber(scopeHysteresis, attributes.get("hysteresis")!);
  stream.setTraceAverage(Number(scopeTraceAverage.value));
  updatePlotTimeSettings();
  moduleStatus.textContent = "Scope controls ready";
}

async function loadAsgControls(): Promise<void> {
  await Promise.all(asgModules.map((moduleName) => loadOneAsgControls(moduleName)));
}

async function loadOneAsgControls(moduleName: AsgModuleId): Promise<void> {
  const response = await fetch(`/api/modules/${moduleName}/attributes`);
  if (!response.ok) {
    throw new Error(`${moduleName} controls unavailable: ${response.status}`);
  }
  const payload = await response.json();
  const attributes = new Map<string, ModuleAttribute>(
    payload.attributes.map((attribute: ModuleAttribute) => [attribute.name, attribute]),
  );
  const controls = asgControls[moduleName];
  populateSelect(controls.waveform, attributes.get("waveform")!);
  populateNumber(controls.frequency, attributes.get("frequency")!);
  populateNumber(controls.amplitude, attributes.get("amplitude")!);
  populateNumber(controls.offset, attributes.get("offset")!);
  populateSelect(controls.triggerSource, attributes.get("trigger_source")!);
  populateSelect(controls.outputDirect, attributes.get("output_direct")!);
  populateNumber(controls.startPhase, attributes.get("start_phase")!);
  populateNumber(controls.cyclesPerBurst, attributes.get("cycles_per_burst")!);
  controls.status.textContent = `${moduleName} controls ready`;
}

function applyAsgState(moduleName: AsgModuleId, state: ModuleState): void {
  for (const [attribute, value] of Object.entries(state)) {
    if (value !== null && value !== undefined) {
      applyAsgControlValue(moduleName, attribute, value);
    }
  }
}

function applyAsgControlValue(moduleName: AsgModuleId, attribute: string, value: string | number | boolean): void {
  const controls = asgControls[moduleName];
  if (attribute === "waveform") {
    controls.waveform.value = String(value);
  } else if (attribute === "frequency") {
    controls.frequency.value = String(value);
  } else if (attribute === "amplitude") {
    controls.amplitude.value = String(value);
  } else if (attribute === "offset") {
    controls.offset.value = String(value);
  } else if (attribute === "trigger_source") {
    controls.triggerSource.value = String(value);
  } else if (attribute === "output_direct") {
    controls.outputDirect.value = String(value);
  } else if (attribute === "start_phase") {
    controls.startPhase.value = String(value);
  } else if (attribute === "cycles_per_burst") {
    controls.cyclesPerBurst.value = String(value);
  }
}

async function setAsgAttribute(
  moduleName: AsgModuleId,
  attribute: string,
  value: string | number | boolean,
): Promise<void> {
  const result = await setModuleAttributeValue(moduleName, attribute, value);
  applyAsgControlValue(moduleName, attribute, result.value);
  asgControls[moduleName].status.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
}

async function callAsgAction(moduleName: AsgModuleId, action: string): Promise<void> {
  const response = await fetch(`/api/modules/${moduleName}/actions/${action}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`${moduleName} action ${action} failed: ${response.status}`);
  }
  const payload = await response.json();
  applyAsgState(moduleName, payload.state ?? {});
  asgControls[moduleName].status.textContent = `${action}: ok`;
}

function buildHkExpansionGrid(): void {
  hkExpansionGrid.textContent = "";
  for (const sign of ["P", "N"] as const) {
    const bank = document.createElement("section");
    bank.className = "housekeeping-bank";
    const title = document.createElement("h3");
    title.textContent = `Expansion ${sign}`;
    bank.appendChild(title);
    for (let index = 0; index < 8; index += 1) {
      const pin = document.createElement("div");
      pin.className = "housekeeping-pin";
      const name = `expansion_${sign}${index}`;
      const direction = `${name}_output`;
      const label = document.createElement("span");
      label.textContent = `${sign}${index}`;
      const valueLabel = document.createElement("label");
      const value = document.createElement("input");
      value.type = "checkbox";
      value.id = `hk-${name.replaceAll("_", "-")}`;
      value.addEventListener("change", () => {
        setHkAttribute(name, value.checked).catch((error: Error) => {
          hkStatus.textContent = error.message;
        });
      });
      valueLabel.append(value, document.createTextNode(" Value"));
      const directionLabel = document.createElement("label");
      const directionInput = document.createElement("input");
      directionInput.type = "checkbox";
      directionInput.id = `hk-${direction.replaceAll("_", "-")}`;
      directionInput.addEventListener("change", () => {
        setHkAttribute(direction, directionInput.checked).catch((error: Error) => {
          hkStatus.textContent = error.message;
        });
      });
      directionLabel.append(directionInput, document.createTextNode(" Output"));
      pin.append(label, valueLabel, directionLabel);
      bank.appendChild(pin);
    }
    hkExpansionGrid.appendChild(bank);
  }
}

async function loadHkControls(): Promise<void> {
  const attributesResponse = await fetch("/api/modules/hk/attributes");
  if (attributesResponse.ok) {
    const payload = await attributesResponse.json();
    const attributes = new Map<string, ModuleAttribute>(
      payload.attributes.map((attribute: ModuleAttribute) => [attribute.name, attribute]),
    );
    const led = attributes.get("led");
    if (led) {
      populateNumber(hkLed, led);
    }
  }
  const stateResponse = await fetch("/api/modules/hk");
  if (!stateResponse.ok) {
    throw new Error(`Housekeeping controls unavailable: ${stateResponse.status}`);
  }
  const payload = await stateResponse.json();
  applyHkState(payload.state ?? {});
  hkStatus.textContent = "Housekeeping controls ready";
}

function applyHkState(state: ModuleState): void {
  for (const [attribute, value] of Object.entries(state)) {
    if (value !== null && value !== undefined) {
      applyHkControlValue(attribute, value);
    }
  }
}

function applyHkControlValue(attribute: string, value: string | number | boolean): void {
  if (attribute === "led") {
    hkLed.value = String(value);
    return;
  }
  const input = document.querySelector<HTMLInputElement>(`#hk-${attribute.replaceAll("_", "-")}`);
  if (input) {
    input.checked = Boolean(value);
  }
}

async function setHkAttribute(attribute: string, value: string | number | boolean): Promise<void> {
  const result = await setModuleAttributeValue("hk", attribute, value);
  applyHkControlValue(attribute, result.value);
  hkStatus.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
}

async function loadScopeStates(): Promise<void> {
  const response = await fetch("/api/modules/scope/states");
  if (!response.ok) {
    return;
  }
  const payload = await response.json();
  populateStateSelect(payload.states ?? []);
}

function populateStateSelect(states: SavedScopeState[]): void {
  const previous = scopeStateSelect.value;
  scopeStateSelect.textContent = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = states.length ? "Choose state" : "No saved states";
  scopeStateSelect.appendChild(empty);
  for (const state of states) {
    const option = document.createElement("option");
    option.value = state.name;
    option.textContent = state.name;
    scopeStateSelect.appendChild(option);
  }
  if (states.some((state) => state.name === previous)) {
    scopeStateSelect.value = previous;
  } else if (states[0]) {
    scopeStateSelect.value = states[0].name;
    scopeStateName.value = states[0].name;
  }
}

function isAsgModule(moduleName: unknown): moduleName is AsgModuleId {
  return moduleName === "asg0" || moduleName === "asg1";
}

function connectEvents(): void {
  if (eventSocket && eventSocket.readyState !== WebSocket.CLOSED) {
    return;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  eventSocket = new WebSocket(`${protocol}//${window.location.host}/ws/events`);
  eventSocket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "module.attribute.changed") {
      eventCount += 1;
      if (message.module === "scope") {
        applyScopeControlValue(message.attribute, message.value);
        moduleStatus.textContent = `${message.attribute} = ${attributeValueLabel(message.attribute, message.value)}`;
      } else if (isAsgModule(message.module)) {
        const moduleName: AsgModuleId = message.module;
        applyAsgControlValue(moduleName, message.attribute, message.value);
        asgControls[moduleName].status.textContent =
          `${message.attribute} = ${attributeValueLabel(message.attribute, message.value)}`;
      } else if (message.module === "hk") {
        applyHkControlValue(message.attribute, message.value);
        hkStatus.textContent = `${message.attribute} = ${attributeValueLabel(message.attribute, message.value)}`;
      }
      return;
    }
    if (message.type !== "module.attribute.changed" || message.module !== "scope") {
      if (message.type === "module.state.changed" && message.module === "scope") {
        applyScopeState(message.state);
        setRunningState(message.state.running_state);
        if (message.state.trigger_test) {
          moduleStatus.textContent = formatTriggerResult(message.state.trigger_test);
        } else {
          moduleStatus.textContent = `${message.state.last_action}: ${message.state.running_state}`;
        }
      } else if (message.type === "module.state.changed" && isAsgModule(message.module)) {
        const moduleName: AsgModuleId = message.module;
        applyAsgState(moduleName, message.state ?? {});
        asgControls[moduleName].status.textContent = `${moduleName} state updated`;
      } else if (message.type === "module.state.changed" && message.module === "hk") {
        applyHkState(message.state ?? {});
        hkStatus.textContent = "Housekeeping state updated";
      } else if (message.type === "module.states.changed" && message.module === "scope") {
        populateStateSelect(message.states ?? []);
        moduleStatus.textContent = `${message.states.length} saved state${message.states.length === 1 ? "" : "s"}`;
      }
      return;
    }
  });
  eventSocket.addEventListener("close", () => {
    eventSocket = null;
  });
}

async function fetchSingleFrame(): Promise<void> {
  status.textContent = "Loading one scope frame...";
  const response = await fetch(`/api/scope/frame?samples=${stream.getSampleCount()}`);
  if (response.status === 204) {
    status.textContent = "No trigger captured";
    return;
  }
  if (!response.ok) {
    throw new Error(`Scope frame request failed: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  stream.close();
  stream.showFrame(buffer);
  connectButton.dataset.connected = "false";
  connectButton.textContent = "Run";
}

async function runSingleFrame(): Promise<void> {
  await callScopeAction("single");
  await fetchSingleFrame();
}

function normalizedStateName(): string {
  return encodeURIComponent(currentStateName());
}

function currentStateName(): string {
  return (scopeStateName.value.trim() || scopeStateSelect.value || "default").trim();
}

function selectedStateName(): string {
  return (scopeStateSelect.value || scopeStateName.value.trim() || "default").trim();
}

function formatTriggerResult(result: Record<string, unknown>): string {
  const source = String(result.source ?? "unknown");
  const condition = String(result.condition ?? "condition");
  const hysteresis = Number(result.hysteresis ?? 0);
  if (result.triggered) {
    return `triggered ${source} ${condition} at sample ${result.index} (hys ${hysteresis})`;
  }
  return `no trigger: ${source} ${condition} (hys ${hysteresis})`;
}

async function saveScopeState(): Promise<void> {
  const response = await fetch(`/api/modules/scope/states/${normalizedStateName()}/save`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Save state failed: ${response.status}`);
  }
  await loadScopeStates();
  scopeStateSelect.value = currentStateName();
  moduleStatus.textContent = `saved state ${currentStateName()}`;
}

async function loadScopeState(): Promise<void> {
  const name = selectedStateName();
  const response = await fetch(`/api/modules/scope/states/${encodeURIComponent(name)}/load`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Load state failed: ${response.status}`);
  }
  const payload = await response.json();
  applyScopeState(payload.state);
  scopeStateName.value = name;
  moduleStatus.textContent = `loaded state ${name}`;
}

async function deleteScopeState(): Promise<void> {
  const name = selectedStateName();
  const response = await fetch(`/api/modules/scope/states/${encodeURIComponent(name)}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Delete state failed: ${response.status}`);
  }
  await loadScopeStates();
  moduleStatus.textContent = `deleted state ${name}`;
}

connectButton.addEventListener("click", () => {
  if (connectButton.dataset.connected === "true") {
    callScopeAction("stop").catch((error: Error) => {
      moduleStatus.textContent = error.message;
    });
    stopStream();
    return;
  }
  callScopeAction("continuous")
    .then(() => startStream())
    .catch((error: Error) => {
      moduleStatus.textContent = error.message;
    });
});

singleFrameButton.addEventListener("click", () => {
  runSingleFrame().catch((error: Error) => {
    status.textContent = error.message;
  });
});

pauseButton.addEventListener("click", () => {
  callScopeAction("pause")
    .then(() => stopStream("Paused"))
    .catch((error: Error) => {
      moduleStatus.textContent = error.message;
    });
});

saveCurveButton.addEventListener("click", () => {
  callScopeAction("save_curve")
    .then(() => {
      stream.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);
      moduleStatus.textContent = "saved browser curve";
    })
    .catch((error: Error) => {
      moduleStatus.textContent = error.message;
    });
});

zoomOutButton.addEventListener("click", () => stream.zoom(1.8));
zoomInButton.addEventListener("click", () => stream.zoom(0.55));
zoomYOutButton.addEventListener("click", () => stream.zoomY(1.8));
zoomYInButton.addEventListener("click", () => stream.zoomY(0.55));
panLeftButton.addEventListener("click", () => stream.panX(-0.2));
panRightButton.addEventListener("click", () => stream.panX(0.2));
panUpButton.addEventListener("click", () => stream.panY(-0.2));
panDownButton.addEventListener("click", () => stream.panY(0.2));
zoomResetButton.addEventListener("click", () => stream.resetZoom());

showCh1Toggle.addEventListener("change", () => {
  stream.setChannelVisible(1, showCh1Toggle.checked);
});

showCh2Toggle.addEventListener("change", () => {
  stream.setChannelVisible(2, showCh2Toggle.checked);
});

scopeInput1.addEventListener("change", () => {
  setScopeAttribute("input1", scopeInput1.value).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeInput2.addEventListener("change", () => {
  setScopeAttribute("input2", scopeInput2.value).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeTrigger.addEventListener("change", () => {
  setScopeAttribute("trigger_source", scopeTrigger.value).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeRunMode.addEventListener("change", () => {
  setScopeAttribute("run_mode", scopeRunMode.value).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeDuration.addEventListener("change", () => {
  setScopeAttribute("duration", Number(scopeDuration.value)).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeAverage.addEventListener("change", () => {
  setScopeAttribute("average", scopeAverage.checked).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeTraceAverage.addEventListener("change", () => {
  setScopeAttribute("trace_average", Number(scopeTraceAverage.value)).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeTriggerDelay.addEventListener("change", () => {
  setScopeAttribute("trigger_delay", Number(scopeTriggerDelay.value)).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeThreshold.addEventListener("change", () => {
  setScopeAttribute("threshold", Number(scopeThreshold.value)).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeHysteresis.addEventListener("change", () => {
  setScopeAttribute("hysteresis", Number(scopeHysteresis.value)).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeStateSave.addEventListener("click", () => {
  saveScopeState().catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeStateSelect.addEventListener("change", () => {
  if (scopeStateSelect.value) {
    scopeStateName.value = scopeStateSelect.value;
  }
});

scopeStateLoad.addEventListener("click", () => {
  loadScopeState().catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeStateDelete.addEventListener("click", () => {
  deleteScopeState().catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

for (const moduleName of asgModules) {
  const controls = asgControls[moduleName];
  controls.waveform.addEventListener("change", () => {
    setAsgAttribute(moduleName, "waveform", controls.waveform.value).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.frequency.addEventListener("change", () => {
    setAsgAttribute(moduleName, "frequency", Number(controls.frequency.value)).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.amplitude.addEventListener("change", () => {
    setAsgAttribute(moduleName, "amplitude", Number(controls.amplitude.value)).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.offset.addEventListener("change", () => {
    setAsgAttribute(moduleName, "offset", Number(controls.offset.value)).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.triggerSource.addEventListener("change", () => {
    setAsgAttribute(moduleName, "trigger_source", controls.triggerSource.value).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.outputDirect.addEventListener("change", () => {
    setAsgAttribute(moduleName, "output_direct", controls.outputDirect.value).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.startPhase.addEventListener("change", () => {
    setAsgAttribute(moduleName, "start_phase", Number(controls.startPhase.value)).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.cyclesPerBurst.addEventListener("change", () => {
    setAsgAttribute(moduleName, "cycles_per_burst", Number(controls.cyclesPerBurst.value)).catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.setup.addEventListener("click", () => {
    callAsgAction(moduleName, "setup").catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.trigger.addEventListener("click", () => {
    callAsgAction(moduleName, "trigger").catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
  controls.off.addEventListener("click", () => {
    callAsgAction(moduleName, "off").catch((error: Error) => {
      controls.status.textContent = error.message;
    });
  });
}

hkLed.addEventListener("change", () => {
  setHkAttribute("led", Number(hkLed.value)).catch((error: Error) => {
    hkStatus.textContent = error.message;
  });
});

hkRefresh.addEventListener("click", () => {
  loadHkControls().catch((error: Error) => {
    hkStatus.textContent = error.message;
  });
});

async function startup(): Promise<void> {
  currentSession = await refreshSession();
  buildHkExpansionGrid();
  await loadScopeControls();
  await loadScopeStates();
  await loadAsgControls();
  await loadHkControls();
  connectEvents();
  applyWorkspaceState();
  if (!workspaceState.activePanelId) {
    status.textContent = "No panel enabled";
    return;
  }
  if (workspaceState.activePanelId !== "scope") {
    status.textContent = `${PANEL_DEFINITIONS.find((panel) => panel.id === workspaceState.activePanelId)?.title} panel ready`;
    return;
  }
  if (!workspaceState.panels.scope.enabled) {
    status.textContent = "Scope panel disabled";
    return;
  }
  await activateScopePanel();
}

exposeDebugState();
startup().catch((error: Error) => {
  status.textContent = error.message;
});
