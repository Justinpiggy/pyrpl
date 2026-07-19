import { ScopeStream } from "./scope-stream";
import { SpectrumPlot } from "./spectrum-plot";
import { IirPlot } from "./iir-plot";
import { LockboxPanel, type LockboxSchema } from "./lockbox-panel";
import { NetworkAnalyzerPanel } from "./network-analyzer-panel";
import { CurveViewerPanel } from "./curve-viewer-panel";
import { ConfigPanel } from "./config-panel";
import { ControlClient, type ControlStatus } from "./control-client";
import { ReconnectScheduler } from "./websocket-reconnect";
import Split from "split.js";
import { PANEL_DEFINITIONS, type PanelId } from "./panel-registry";
import { createRegisterPanel } from "./register-panel";
import {
  firstEnabledPanel,
  loadWorkspaceState,
  normalizeLayoutMode,
  normalizeSplitSizes,
  normalizeWorkspaceState,
  normalizeWorkspaceSplitSizes,
  saveWorkspaceState as saveWorkspaceStateLocal,
  type WorkspaceState,
  type WorkspaceLayoutMode,
} from "./workspace";

const controlClient = new ControlClient();
controlClient.installFetchHeaders();

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
        <div class="control-strip">
          <output id="control-status">Control connecting...</output>
          <button id="take-control" type="button" hidden>Take Control</button>
        </div>
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
              <output id="scope-current-average">0 / 1</output>
              <button id="single-frame" type="button">Run single</button>
              <button id="connect-scope" type="button">Run continuous</button>
              <button id="stop-scope" type="button" disabled>Stop</button>
              <input id="scope-curve-name" class="curve-name-input" type="text" value="scope curve" aria-label="Curve Name" />
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
              <fieldset class="segmented-control" id="scope-trigger-mode">
                <legend>Trigger mode</legend>
                <label><input id="scope-trigger-normal" name="scope-trigger-mode" type="radio" value="normal" /><span>Normal</span></label>
                <label><input id="scope-trigger-rolling" name="scope-trigger-mode" type="radio" value="rolling" checked /><span>Untriggered (rolling)</span></label>
              </fieldset>
              <label>
                <span>Duration</span>
                <select id="scope-duration"></select>
              </label>
              <label class="toggle-control">
                <input id="scope-average" type="checkbox" />
                <span>FPGA Avg</span>
              </label>
              <label class="toggle-control">
                <input id="scope-xy-mode" type="checkbox" />
                <span>XY</span>
              </label>
            </div>
            <div class="control-row tune-row">
              <div class="channel-control math-control">
                <label class="toggle-control">
                  <input id="scope-math-active" type="checkbox" />
                  <span>Math</span>
                </label>
                <label>
                  <span>Formula</span>
                  <input id="scope-math-formula" type="text" value="ch1 * ch2" />
                </label>
              </div>
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
              <output id="status">Idle</output>
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
        ${[
          ["pid", "PID", "PID controllers", "pid-modules"],
          ["iq", "IQ", "IQ modulators and demodulators", "iq-modules"],
          ["iir", "IIR", "Infinite impulse response filter", "iir-modules"],
          ["trig", "Trigger", "DSP trigger", "trig-modules"],
          ["pwm", "PWM", "Auxiliary PWM routing", "pwm-modules"],
        ].map(([panelId, title, description, containerId]) => `
        <section class="workspace-panel" id="${panelId}-panel" data-panel-id="${panelId}" hidden>
        <header class="panel-header">
          <div>
            <h2>${title}</h2>
            <p>${description}</p>
          </div>
        </header>
        <div class="panel-content instrument-grid" id="${containerId}"></div>
        </section>`).join("")}
        <section class="workspace-panel" id="spectrumanalyzer-panel" data-panel-id="spectrumanalyzer" hidden>
        <header class="panel-header spectrum-header">
          <div>
            <h2>Spectrum Analyzer</h2>
          </div>
          <div class="actions">
            <div class="action-row">
              <button id="spectrum-single" type="button">Run single</button>
              <button id="spectrum-run" type="button">Run continuous</button>
              <button id="spectrum-stop" type="button" disabled>Stop</button>
              <input id="spectrum-curve-name" class="curve-name-input" type="text" value="pyrpl spectrum" aria-label="Curve Name" />
              <button id="spectrum-save-curve" type="button">Save Curve</button>
            </div>
            <div class="action-row">
              <button id="spectrum-zoom-out" class="plot-button" type="button" title="Zoom X out">X-</button>
              <button id="spectrum-zoom-in" class="plot-button" type="button" title="Zoom X in">X+</button>
              <button id="spectrum-zoom-y-out" class="plot-button" type="button" title="Zoom Y out">Y-</button>
              <button id="spectrum-zoom-y-in" class="plot-button" type="button" title="Zoom Y in">Y+</button>
              <button id="spectrum-pan-left" class="plot-button" type="button" title="Move view left">&lt;</button>
              <button id="spectrum-pan-right" class="plot-button" type="button" title="Move view right">&gt;</button>
              <button id="spectrum-pan-up" class="plot-button" type="button" title="Move trace up">^</button>
              <button id="spectrum-pan-down" class="plot-button" type="button" title="Move trace down">v</button>
              <button id="spectrum-zoom-reset" type="button">Reset</button>
            </div>
          </div>
        </header>
        <div class="panel-content spectrum-content" id="spectrum-panel-content">
          <section class="spectrum-controls split-pane" id="spectrum-controls-pane">
            <div id="spectrum-modules"></div>
          </section>
          <section class="plot-panel spectrum-plot-panel split-pane" id="spectrum-plot-pane">
            <div class="plot-toolbar">
              <output id="spectrum-plot-hint">Drag pans. Right-drag zooms X/Y.</output>
              <output id="spectrum-current-average">0 / 1</output>
              <output id="spectrum-status">Spectrum analyzer ready</output>
            </div>
            <div id="spectrum-plot"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="networkanalyzer-panel" data-panel-id="networkanalyzer" hidden>
          <header class="panel-header">
            <div><h2>Network Analyzer</h2></div>
            <div class="action-row">
              <button id="network-single" type="button">Single</button>
              <button id="network-run" type="button">Continuous</button>
              <button id="network-stop" type="button" disabled>Stop</button>
              <button id="network-save" type="button">Save Curve</button>
              <button id="network-reset" type="button">Reset Zoom</button>
            </div>
          </header>
          <div class="panel-content network-content">
            <section class="module-panel network-controls-pane split-pane">
              <div id="network-controls" class="network-controls"></div>
              <output id="network-status">Network analyzer ready</output>
            </section>
            <section class="network-plots split-pane">
              <div class="network-plot-frame"><div id="network-magnitude-plot"></div></div>
              <div class="network-plot-frame"><div id="network-phase-plot"></div></div>
            </section>
          </div>
        </section>
        <section class="workspace-panel" id="curveviewer-panel" data-panel-id="curveviewer" hidden>
          <header class="panel-header">
            <div><h2>Curve Viewer</h2></div>
            <div class="action-row">
              <button id="curve-viewer-save-params" type="button" disabled>Save Params</button>
              <button id="curve-viewer-delete" type="button" disabled>Delete Curve</button>
              <button id="curve-viewer-refresh" type="button">Refresh</button>
            </div>
          </header>
          <div class="panel-content curve-viewer-content">
            <section class="curve-viewer-list-pane split-pane">
              <label><span>Curve</span><select id="curve-viewer-select" size="12"></select></label>
            </section>
            <section class="curve-viewer-plot-pane split-pane">
              <div class="curve-viewer-plot-frame"><div id="curve-viewer-magnitude"></div></div>
              <div class="curve-viewer-plot-frame"><div id="curve-viewer-phase"></div></div>
            </section>
            <section class="curve-viewer-params-pane split-pane">
              <label><span>Name</span><input id="curve-viewer-name" type="text" readonly /></label>
              <label><span>Parameters</span><textarea id="curve-viewer-params" spellcheck="false"></textarea></label>
              <output id="curve-viewer-status">Curve viewer ready</output>
            </section>
          </div>
        </section>
        <section class="workspace-panel" id="pyrplconfig-panel" data-panel-id="pyrplconfig" hidden>
          <header class="panel-header">
            <div><h2>Configuration</h2></div>
            <div class="action-row">
              <button id="config-refresh" type="button">Refresh</button>
              <button id="config-save" type="button">Save</button>
            </div>
          </header>
          <div class="panel-content config-content">
            <div class="config-toolbar">
              <label><span>Config file</span><output id="config-file"></output></label>
              <label><span>Module</span><select id="config-module"></select></label>
              <output id="config-status">Configuration loading...</output>
            </div>
            <textarea id="config-text" class="config-editor" spellcheck="false" aria-label="Configuration YAML"></textarea>
          </div>
        </section>
        <section class="workspace-panel" id="lockbox-panel" data-panel-id="lockbox" hidden>
        <header class="panel-header">
          <div>
            <h2>Lockbox</h2>
            <p>Model-based feedback sequence</p>
          </div>
          <div class="lockbox-header-controls">
            <label>
              <span>Class</span>
              <select id="lockbox-class"></select>
            </label>
            <div class="actions" id="lockbox-actions"></div>
          </div>
        </header>
        <div class="panel-content lockbox-content">
          <section class="module-panel lockbox-overview">
            <div class="control-row lockbox-attributes" id="lockbox-attributes"></div>
            <output id="lockbox-status">Lockbox loading...</output>
          </section>
          <section class="lockbox-grid">
            <div class="lockbox-column">
              <header class="lockbox-section-header">
                <h3>Inputs</h3>
                <label><span>Plot</span><select id="lockbox-input-plot-select"></select></label>
              </header>
              <div id="lockbox-inputs"></div>
              <div class="lockbox-plot" id="lockbox-input-plot"></div>
            </div>
            <div class="lockbox-column">
              <header class="lockbox-section-header">
                <h3>Outputs</h3>
                <label><span>Plot</span><select id="lockbox-output-plot-select"></select></label>
              </header>
              <div id="lockbox-outputs"></div>
              <div class="lockbox-plot" id="lockbox-output-plot"></div>
            </div>
            <div class="lockbox-column lockbox-sequence-column">
              <header class="lockbox-section-header">
                <h3>Sequence</h3>
                <button id="lockbox-add-stage" type="button">Add Stage</button>
              </header>
              <div id="lockbox-stages"></div>
            </div>
          </section>
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
        <section class="workspace-panel" id="telemetry-panel" data-panel-id="telemetry" hidden>
        <header class="panel-header">
          <div>
            <h2>Sampler &amp; AMS</h2>
            <p>FPGA signal readback and auxiliary analog outputs</p>
          </div>
          <button id="telemetry-refresh" type="button">Refresh</button>
        </header>
        <div class="panel-content telemetry-layout">
          <section class="module-panel telemetry-section">
            <header class="instrument-card-header">
              <h3>Sampler</h3>
              <output id="sampler-status">Sampler ready</output>
            </header>
            <div class="sampler-grid" id="sampler-grid"></div>
            <div class="control-row sampler-stats-controls">
              <label><span>Signal</span><select id="sampler-stats-signal"></select></label>
              <label><span>Duration</span><input id="sampler-stats-duration" type="number" min="0" max="10" step="0.001" value="0.01" /></label>
              <button id="sampler-stats-run" type="button">Statistics</button>
              <output id="sampler-stats-output">No statistics acquired</output>
            </div>
          </section>
          <section class="module-panel telemetry-section">
            <header class="instrument-card-header">
              <h3>AMS</h3>
              <output id="ams-status">AMS ready</output>
            </header>
            <div class="control-row ams-controls">
              ${[0, 1, 2, 3].map((index) => `
                <label>
                  <span>DAC${index}</span>
                  <input id="ams-dac${index}" type="number" min="0" max="1.8" step="0.0002197265625" ${index < 2 ? "readonly" : ""} />
                </label>
              `).join("")}
            </div>
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
    --plot-bg: #05080a;
    --plot-text: #edf4f7;
    --plot-axis: #93a7b3;
    --plot-grid: #1c2a33;
    --plot-yellow: #f2c94c;
    --plot-magenta: #f05bd7;
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
	    grid-template-rows: auto minmax(0, 1fr);
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
    .empty-workspace {
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

  .control-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .control-strip output {
    max-width: 260px;
    overflow: hidden;
    color: var(--muted);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .control-strip.is-controller output,
  .control-strip.is-shared output {
    color: #63d98d;
  }

  .control-strip.is-observer output {
    color: #f0c15a;
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
    height: 24px;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: var(--button);
    color: var(--text);
    font: inherit;
    font-size: 11px;
    padding: 0 7px;
  }

  .plot-button {
    width: 30px;
    padding: 0 4px;
  }

  .curve-name-input {
    width: 130px !important;
    height: 24px !important;
  }

  select {
    height: 28px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 12px;
    padding: 0 8px;
  }

  input[type="number"],
  input[type="text"] {
    height: 28px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 12px;
    padding: 0 8px;
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
    height: 28px;
    white-space: nowrap;
  }

  .toggle-control input {
    accent-color: #4fd17f;
  }

  .segmented-control {
    position: relative;
    display: flex;
    align-items: end;
    height: 45px;
    min-width: 230px;
    margin: 0;
    padding: 16px 0 0;
    border: 0;
  }

  .segmented-control legend {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--muted);
    font-size: 11px;
  }

  .segmented-control label {
    position: relative;
    display: block;
  }

  .segmented-control input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .segmented-control span {
    display: grid;
    height: 28px;
    padding: 0 8px;
    place-items: center;
    border: 1px solid #53616b;
    color: var(--muted);
    cursor: pointer;
    pointer-events: none;
  }

  .segmented-control label:first-of-type span {
    border-radius: 6px 0 0 6px;
  }

  .segmented-control label:last-of-type span {
    border-left: 0;
    border-radius: 0 6px 6px 0;
  }

  .segmented-control input:checked + span {
    background: #344550;
    color: var(--text);
  }

  .segmented-control:disabled span {
    cursor: not-allowed;
    opacity: 0.45;
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
    min-height: 42px;
    border-bottom: 1px solid var(--panel-border);
    padding: 5px 8px;
  }

  .spectrum-header {
    min-height: 42px;
    padding-block: 5px;
  }

  .network-content {
    display: flex;
  }

  .network-controls-pane {
    padding: 6px;
    overflow: auto;
  }

  .network-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 6px;
  }

  .network-control-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-width: 0;
    margin: 0;
    border: 1px solid var(--panel-border);
    padding: 5px;
  }

  .network-control-group legend {
    color: var(--muted);
    font-size: 11px;
  }

  .network-control-group label {
    display: grid;
    min-width: 0;
    gap: 2px;
    color: var(--muted);
    font-size: 10px;
  }

  .network-plots {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    min-height: 240px;
    gap: 6px;
    overflow: hidden;
  }

  .network-plot-frame {
    position: relative;
    min-height: 0;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .curve-viewer-content {
    display: flex;
    flex-direction: row;
  }

  .curve-viewer-list-pane,
  .curve-viewer-params-pane {
    display: grid;
    min-width: 0;
    gap: 6px;
    padding: 6px;
    overflow: hidden;
  }

  .curve-viewer-list-pane label,
  .curve-viewer-params-pane label {
    display: grid;
    min-height: 0;
    gap: 3px;
    color: var(--muted);
    font-size: 11px;
  }

  #curve-viewer-select {
    height: 100%;
  }

  #curve-viewer-params {
    width: 100%;
    min-height: 0;
    resize: none;
    border: 1px solid #53616b;
    background: #090d10;
    color: var(--text);
    font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    padding: 6px;
  }

  .curve-viewer-params-pane {
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  .curve-viewer-plot-pane {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    min-height: 0;
    gap: 6px;
    overflow: hidden;
  }

  .curve-viewer-plot-pane.is-complex {
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .curve-viewer-plot-frame {
    min-height: 0;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .panel-header p {
    margin-top: 2px;
    font-size: 12px;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 6px;
    padding: 6px;
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

  .generic-module-row {
    grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  }

  .spectrum-module-row {
    grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
  }

  .spectrum-module-row label {
    min-width: 0;
  }

  .spectrum-module-row label[hidden] {
    display: grid;
    visibility: hidden;
    pointer-events: none;
  }

  .iir-card {
    grid-column: 1 / -1;
    min-height: 0;
    display: grid;
    grid-template-rows: auto auto auto;
  }

  .iir-card .generic-module-row {
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  }

  .iir-plot {
    min-height: 0;
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 8px;
  }

  .iir-plot-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: var(--muted);
    font-size: 11px;
  }

  .iir-plot-toolbar button {
    padding: 4px 10px;
    min-height: 26px;
  }

  .iir-plot-grid {
    display: grid;
    grid-template-rows: repeat(2, clamp(360px, 40vh, 520px));
    gap: 8px;
    min-height: 0;
    overflow: hidden;
  }

  .iir-plot-frame {
    min-width: 0;
    min-height: 0;
    position: relative;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .iir-list-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(170px, 1fr));
    gap: 8px;
    min-height: 0;
  }

  .iir-list-editor {
    display: grid;
    gap: 5px;
    min-width: 0;
    border: 1px solid var(--border);
    padding: 6px;
  }

  .iir-list-editor header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 48px 26px 26px;
    align-items: center;
    gap: 4px;
  }

  .iir-list-editor header span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    color: var(--muted);
  }

  .iir-list-editor button {
    min-width: 0;
    padding: 3px 0;
  }

  .iir-list-values {
    display: grid;
    gap: 3px;
    max-height: 116px;
    overflow: auto;
  }

  .iir-list-value {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    padding: 2px;
  }

  .iir-list-value.is-selected {
    outline: 1px solid var(--plot-yellow);
    background: rgba(242, 201, 76, 0.08);
  }

  .iir-marker {
    position: absolute;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    margin-top: -9px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--plot-yellow);
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    cursor: grab;
    z-index: 4;
  }

  .iir-marker.is-zero {
    color: var(--plot-magenta);
  }

  .iir-marker.is-complex {
    font-size: 16px;
  }

  .iir-marker.is-selected,
  .iir-marker.is-dragging {
    outline: 2px solid var(--plot-yellow);
    background: rgba(242, 201, 76, 0.14);
  }

  .module-panel.is-owned {
    opacity: 0.62;
  }

  .spectrum-content {
    min-height: 0;
    padding: 8px;
  }

  .spectrum-controls {
    min-height: 0;
    align-content: start;
    overflow: auto;
  }

  .spectrum-controls .module-panel {
    border: 0;
    padding: 0;
  }

  .spectrum-plot-panel {
    min-height: 0;
  }

  .housekeeping-panel {
    align-content: start;
    overflow: auto;
  }

  .telemetry-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
    gap: 8px;
    align-content: start;
  }

  .telemetry-section {
    min-width: 0;
  }

  .sampler-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 4px 8px;
    margin-bottom: 8px;
  }

  .sampler-reading {
    display: grid;
    grid-template-columns: minmax(38px, auto) minmax(0, 1fr);
    gap: 5px;
    align-items: baseline;
    padding: 3px 5px;
    border-bottom: 1px solid var(--panel-border);
  }

  .sampler-reading span {
    color: var(--muted);
  }

  .sampler-reading output {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .sampler-stats-controls output {
    min-width: min(100%, 360px);
    font-variant-numeric: tabular-nums;
  }

  .ams-controls input[readonly] {
    color: var(--muted);
    cursor: default;
  }

  @media (max-width: 760px) {
    .telemetry-layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .lockbox-header-controls {
    display: grid;
    grid-template-columns: minmax(150px, 220px) auto;
    align-items: end;
    gap: 8px;
  }

  .config-content {
    display: grid;
    grid-template-rows: auto minmax(360px, 1fr);
    gap: 8px;
    padding: 8px;
    min-height: 0;
  }

  .config-toolbar {
    display: flex;
    align-items: end;
    gap: 10px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .config-toolbar label {
    display: grid;
    gap: 3px;
    min-width: 160px;
  }

  .config-toolbar label:first-child {
    flex: 1 1 360px;
  }

  #config-file {
    overflow-wrap: anywhere;
  }

  .config-editor {
    box-sizing: border-box;
    width: 100%;
    min-height: 360px;
    resize: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: #11161c;
    color: var(--text);
    padding: 10px;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  #lockbox-actions {
    display: flex;
    flex-flow: row nowrap;
    align-items: end;
    justify-content: flex-end;
    gap: 6px;
  }

  #lockbox-actions button {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .lockbox-header-controls label {
    display: grid;
    gap: 3px;
  }

  .lockbox-header-controls label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-content {
    overflow: auto;
  }

  .lockbox-overview {
    flex: 0 0 auto;
  }

  .lockbox-attributes {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }

  .lockbox-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    gap: 6px;
    min-height: 0;
  }

  .lockbox-column {
    display: grid;
    grid-template-rows: auto max-content auto;
    align-content: start;
    gap: 6px;
    min-width: 0;
    min-height: 0;
  }

  .lockbox-sequence-column {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .lockbox-section-header,
  .lockbox-card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .lockbox-section-header h3,
  .lockbox-card-title h3 {
    margin: 0;
    font-size: 13px;
  }

  .lockbox-section-header label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .lockbox-section-header label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-section-header select {
    min-width: 110px;
  }

  .lockbox-card-title span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-card-actions {
    display: flex;
    gap: 4px;
  }

  #lockbox-inputs,
  #lockbox-outputs,
  #lockbox-stages {
    display: grid;
    gap: 6px;
  }

  #lockbox-stages {
    min-height: 0;
  }

  #lockbox-stages {
    overflow: auto;
  }

  .lockbox-card {
    display: grid;
    gap: 8px;
    min-width: 0;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 6px;
  }

  .lockbox-control-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
    gap: 6px;
    align-items: end;
  }

  .lockbox-card label {
    display: grid;
    gap: 3px;
  }

  .lockbox-card label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-card label.is-disabled {
    opacity: 0.5;
  }

  .lockbox-stage-output-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 6px;
  }

  .lockbox-stage-output {
    display: grid;
    gap: 6px;
    min-width: 0;
    border: 1px solid #1e2a31;
    border-radius: 6px;
    padding: 6px;
  }

  .lockbox-stage-output h4 {
    margin: 0;
    font-size: 12px;
  }

  .lockbox-stage-output label {
    display: grid;
    gap: 3px;
  }

  .lockbox-plot {
    min-width: 0;
    min-height: 220px;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .lockbox-plot,
  .lockbox-plot * {
    pointer-events: none;
  }

  .lockbox-plot > .uplot {
    max-width: 100%;
    max-height: 100%;
  }

  #lockbox-output-plot {
    display: grid;
    grid-template-rows: repeat(2, minmax(160px, 1fr));
    gap: 6px;
    min-height: 340px;
  }

  .lockbox-output-plot-frame {
    min-width: 0;
    min-height: 0;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
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
	    gap: 6px;
	    min-height: 0;
	    padding: 8px;
	    overflow: hidden;
	  }

    .control-row {
      display: grid;
      align-items: end;
      gap: 6px;
    }

    .signal-row {
      grid-template-columns: minmax(170px, 1.3fr) minmax(170px, 1.3fr) minmax(110px, 0.8fr) minmax(150px, auto) minmax(110px, 0.8fr) repeat(2, minmax(58px, auto));
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

    .module-panel label[hidden],
    .control-row label[hidden] {
      display: none;
    }

    .module-panel .spectrum-module-row label[hidden] {
      display: grid;
      visibility: hidden;
      pointer-events: none;
    }
	
	  .module-panel label span {
	    color: var(--muted);
	    font-size: 11px;
	  }

  .control-row label.toggle-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
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

  #scope-plot,
  #spectrum-plot {
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    background: var(--plot-bg);
  }

  #scope-plot > .uplot,
  #spectrum-plot > .uplot,
  .iir-plot-frame > .uplot,
  .lockbox-plot > .uplot {
    max-width: 100%;
    max-height: 100%;
  }

  .uplot {
    color: var(--plot-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .uplot .u-title,
  .uplot .u-legend,
  .uplot .u-legend th,
  .uplot .u-legend td {
    color: var(--plot-text);
  }

  .uplot .u-cursor-x,
  .uplot .u-cursor-y {
    border-color: var(--plot-axis);
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

  @media (max-width: 680px) {
    body {
      height: auto;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
    }

    #app,
    .shell {
      height: auto;
      min-height: 100dvh;
    }

    .shell {
      grid-template-rows: auto auto;
      width: 100%;
      max-width: 100vw;
      overflow: visible;
    }

    .topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 6px;
    }

    .topbar > div:first-child {
      min-width: 0;
    }

    #session-line {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menubar {
      flex-direction: row;
      align-items: center;
      gap: 6px;
      margin-left: 0;
    }

    .control-strip output {
      max-width: 110px;
    }

    .menu-content {
      left: auto;
      right: 0;
      max-height: min(70dvh, 520px);
      overflow: auto;
    }

    .workspace {
      grid-template-rows: auto auto;
      overflow: visible;
    }

    .workspace-tabs {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
    }

    .workspace-tab {
      flex: 0 0 auto;
    }

    .workspace-panels,
    .workspace-panel,
    .panel-content,
    .split-pane,
    .module-panel,
    .plot-panel,
    .lockbox-content,
    #lockbox-stages {
      min-width: 0;
      max-width: 100%;
      height: auto;
      min-height: 0;
      overflow: visible;
    }

    .workspace-panel {
      grid-template-rows: auto auto;
    }

    .panel-header {
      align-items: stretch;
      flex-direction: column;
      gap: 6px;
    }

    .actions {
      align-items: flex-start;
      gap: 4px;
      min-width: 0;
      max-width: 100%;
    }

    .action-row,
    .zoom-actions,
    #lockbox-actions {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .actions button,
    .zoom-actions button {
      flex: 0 0 auto;
    }

    .module-panel,
    .plot-toolbar {
      align-items: stretch;
      min-width: 0;
      max-width: 100%;
    }

    .plot-toolbar output {
      min-width: 0;
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .panel-content > .split-pane,
    .network-content > .split-pane,
    .curve-viewer-content > .split-pane {
      width: auto !important;
      height: auto !important;
      flex-basis: auto !important;
    }

    .panel-content > .gutter,
    .network-content > .gutter,
    .curve-viewer-content > .gutter {
      display: none;
    }

    #scope-plot-pane,
    .spectrum-plot-panel {
      height: 360px !important;
      min-height: 360px;
    }

    .spectrum-content,
    .network-content,
    .curve-viewer-content {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr);
      height: auto !important;
      overflow: visible;
    }

    .network-plots {
      height: 520px !important;
      min-height: 520px;
    }

    .lockbox-grid,
    .lockbox-header-controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .lockbox-column,
    .lockbox-sequence-column {
      grid-template-rows: auto;
    }

    .signal-row,
    .tune-row,
    .register-row {
      grid-template-columns: minmax(0, 1fr);
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
const spectrumPanelContent = requireElement<HTMLDivElement>("#spectrum-panel-content");
const spectrumControlsPane = requireElement<HTMLElement>("#spectrum-controls-pane");
const spectrumPlotPane = requireElement<HTMLElement>("#spectrum-plot-pane");
const panelMenu = requireElement<HTMLDivElement>("#panel-menu");
const workspaceTabs = requireElement<HTMLDivElement>("#workspace-tabs");
const workspacePanels = requireElement<HTMLDivElement>("#workspace-panels");
const scopePanel = requireElement<HTMLElement>("#scope-panel");
const asgPanel = requireElement<HTMLElement>("#asg-panel");
const pidPanel = requireElement<HTMLElement>("#pid-panel");
const iqPanel = requireElement<HTMLElement>("#iq-panel");
const iirPanel = requireElement<HTMLElement>("#iir-panel");
const trigPanel = requireElement<HTMLElement>("#trig-panel");
const pwmPanel = requireElement<HTMLElement>("#pwm-panel");
const spectrumPanel = requireElement<HTMLElement>("#spectrumanalyzer-panel");
const networkAnalyzerPanelElement = requireElement<HTMLElement>("#networkanalyzer-panel");
const curveViewerPanelElement = requireElement<HTMLElement>("#curveviewer-panel");
const configPanelElement = requireElement<HTMLElement>("#pyrplconfig-panel");
const lockboxPanelElement = requireElement<HTMLElement>("#lockbox-panel");
const housekeepingPanel = requireElement<HTMLElement>("#housekeeping-panel");
const telemetryPanel = requireElement<HTMLElement>("#telemetry-panel");
const registersPanel = requireElement<HTMLElement>("#registers-panel");
const panelElements: Record<PanelId, HTMLElement> = {
  scope: scopePanel,
  asg: asgPanel,
  pid: pidPanel,
  iq: iqPanel,
  iir: iirPanel,
  trig: trigPanel,
  pwm: pwmPanel,
  spectrumanalyzer: spectrumPanel,
  networkanalyzer: networkAnalyzerPanelElement,
  curveviewer: curveViewerPanelElement,
  pyrplconfig: configPanelElement,
  lockbox: lockboxPanelElement,
  housekeeping: housekeepingPanel,
  telemetry: telemetryPanel,
  registers: registersPanel,
};
const emptyWorkspace = requireElement<HTMLElement>("#empty-workspace");
const status = requireElement<HTMLSpanElement>("#status");
const connectButton = requireElement<HTMLButtonElement>("#connect-scope");
const singleFrameButton = requireElement<HTMLButtonElement>("#single-frame");
const stopScopeButton = requireElement<HTMLButtonElement>("#stop-scope");
const scopeCurrentAverage = requireElement<HTMLOutputElement>("#scope-current-average");
const saveCurveButton = requireElement<HTMLButtonElement>("#save-curve");
const scopeCurveName = requireElement<HTMLInputElement>("#scope-curve-name");
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
const scopeTriggerMode = requireElement<HTMLFieldSetElement>("#scope-trigger-mode");
const scopeTriggerNormal = requireElement<HTMLInputElement>("#scope-trigger-normal");
const scopeTriggerRolling = requireElement<HTMLInputElement>("#scope-trigger-rolling");
const scopeDuration = requireElement<HTMLSelectElement>("#scope-duration");
const scopeAverage = requireElement<HTMLInputElement>("#scope-average");
const scopeXyMode = requireElement<HTMLInputElement>("#scope-xy-mode");
const scopeMathActive = requireElement<HTMLInputElement>("#scope-math-active");
const scopeMathFormula = requireElement<HTMLInputElement>("#scope-math-formula");
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
const telemetryRefresh = requireElement<HTMLButtonElement>("#telemetry-refresh");
const samplerGrid = requireElement<HTMLDivElement>("#sampler-grid");
const samplerStatus = requireElement<HTMLOutputElement>("#sampler-status");
const samplerStatsSignal = requireElement<HTMLSelectElement>("#sampler-stats-signal");
const samplerStatsDuration = requireElement<HTMLInputElement>("#sampler-stats-duration");
const samplerStatsRun = requireElement<HTMLButtonElement>("#sampler-stats-run");
const samplerStatsOutput = requireElement<HTMLOutputElement>("#sampler-stats-output");
const amsStatus = requireElement<HTMLOutputElement>("#ams-status");
const amsInputs = [0, 1, 2, 3].map((index) =>
  requireElement<HTMLInputElement>(`#ams-dac${index}`)
);
const samplerOutputs = new Map<string, HTMLOutputElement>();
const hkLed = requireElement<HTMLInputElement>("#hk-led");
const hkRefresh = requireElement<HTMLButtonElement>("#hk-refresh");
const hkExpansionGrid = requireElement<HTMLDivElement>("#hk-expansion-grid");
const pidModules = requireElement<HTMLDivElement>("#pid-modules");
const iqModules = requireElement<HTMLDivElement>("#iq-modules");
const iirModules = requireElement<HTMLDivElement>("#iir-modules");
const trigModules = requireElement<HTMLDivElement>("#trig-modules");
const pwmModules = requireElement<HTMLDivElement>("#pwm-modules");
const spectrumModules = requireElement<HTMLElement>("#spectrum-modules");
const spectrumPlotHost = requireElement<HTMLDivElement>("#spectrum-plot");
const spectrumStatus = requireElement<HTMLOutputElement>("#spectrum-status");
const spectrumSingleButton = requireElement<HTMLButtonElement>("#spectrum-single");
const spectrumRunButton = requireElement<HTMLButtonElement>("#spectrum-run");
const spectrumStopButton = requireElement<HTMLButtonElement>("#spectrum-stop");
const spectrumCurrentAverage = requireElement<HTMLOutputElement>("#spectrum-current-average");
const spectrumSaveCurveButton = requireElement<HTMLButtonElement>("#spectrum-save-curve");
const spectrumCurveName = requireElement<HTMLInputElement>("#spectrum-curve-name");
const spectrumZoomOutButton = requireElement<HTMLButtonElement>("#spectrum-zoom-out");
const spectrumZoomInButton = requireElement<HTMLButtonElement>("#spectrum-zoom-in");
const spectrumZoomYOutButton = requireElement<HTMLButtonElement>("#spectrum-zoom-y-out");
const spectrumZoomYInButton = requireElement<HTMLButtonElement>("#spectrum-zoom-y-in");
const spectrumPanLeftButton = requireElement<HTMLButtonElement>("#spectrum-pan-left");
const spectrumPanRightButton = requireElement<HTMLButtonElement>("#spectrum-pan-right");
const spectrumPanUpButton = requireElement<HTMLButtonElement>("#spectrum-pan-up");
const spectrumPanDownButton = requireElement<HTMLButtonElement>("#spectrum-pan-down");
const spectrumZoomResetButton = requireElement<HTMLButtonElement>("#spectrum-zoom-reset");
const networkAnalyzerPanel = new NetworkAnalyzerPanel(
  requireElement<HTMLElement>("#network-controls"),
  requireElement<HTMLElement>("#network-magnitude-plot"),
  requireElement<HTMLElement>("#network-phase-plot"),
  requireElement<HTMLOutputElement>("#network-status"),
  requireElement<HTMLButtonElement>("#network-single"),
  requireElement<HTMLButtonElement>("#network-run"),
  requireElement<HTMLButtonElement>("#network-stop"),
  requireElement<HTMLButtonElement>("#network-save"),
  requireElement<HTMLButtonElement>("#network-reset"),
);
const curveViewerPanel = new CurveViewerPanel(
  curveViewerPanelElement,
  requireElement<HTMLElement>(".curve-viewer-list-pane"),
  requireElement<HTMLElement>(".curve-viewer-plot-pane"),
  requireElement<HTMLElement>(".curve-viewer-params-pane"),
  requireElement<HTMLSelectElement>("#curve-viewer-select"),
  requireElement<HTMLInputElement>("#curve-viewer-name"),
  requireElement<HTMLTextAreaElement>("#curve-viewer-params"),
  requireElement<HTMLOutputElement>("#curve-viewer-status"),
  requireElement<HTMLButtonElement>("#curve-viewer-save-params"),
  requireElement<HTMLButtonElement>("#curve-viewer-delete"),
  requireElement<HTMLButtonElement>("#curve-viewer-refresh"),
);
const lockboxPanel = new LockboxPanel({
  root: lockboxPanelElement,
  classSelect: requireElement<HTMLSelectElement>("#lockbox-class"),
  status: requireElement<HTMLOutputElement>("#lockbox-status"),
  actions: requireElement<HTMLElement>("#lockbox-actions"),
  inputs: requireElement<HTMLElement>("#lockbox-inputs"),
  outputs: requireElement<HTMLElement>("#lockbox-outputs"),
  stages: requireElement<HTMLElement>("#lockbox-stages"),
  addStage: requireElement<HTMLButtonElement>("#lockbox-add-stage"),
  inputPlot: requireElement<HTMLElement>("#lockbox-input-plot"),
  outputPlot: requireElement<HTMLElement>("#lockbox-output-plot"),
  inputPlotSelect: requireElement<HTMLSelectElement>("#lockbox-input-plot-select"),
  outputPlotSelect: requireElement<HTMLSelectElement>("#lockbox-output-plot-select"),
});
const configPanel = new ConfigPanel({
  file: requireElement<HTMLOutputElement>("#config-file"),
  module: requireElement<HTMLSelectElement>("#config-module"),
  text: requireElement<HTMLTextAreaElement>("#config-text"),
  refresh: requireElement<HTMLButtonElement>("#config-refresh"),
  save: requireElement<HTMLButtonElement>("#config-save"),
  status: requireElement<HTMLOutputElement>("#config-status"),
});
const sessionLine = requireElement<HTMLParagraphElement>("#session-line");
const controlStatus = requireElement<HTMLOutputElement>("#control-status");
const takeControlButton = requireElement<HTMLButtonElement>("#take-control");
const controlStrip = controlStatus.parentElement as HTMLElement;
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
  type: "select" | "bool" | "number" | "text";
  value: string | number | boolean | number[] | string[];
  options?: Array<string | number>;
  option_labels?: Record<string, string>;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface ScopeState {
  input1?: string;
  input2?: string;
  trigger_source?: string;
  duration?: number;
  average?: boolean;
  ch1_active?: boolean;
  ch2_active?: boolean;
  ch_math_active?: boolean;
  math_formula?: string;
  xy_mode?: boolean;
  rolling_mode?: boolean;
  run_continuous?: boolean;
  current_avg?: number;
  trace_average?: number;
  trigger_delay?: number;
  threshold?: number;
  hysteresis?: number;
  running_state?: string;
  owner?: string | null;
}

interface SavedScopeState {
  name: string;
  state: ScopeState;
}

type ModulePrimitive = string | number | boolean | number[] | string[];
type ModuleState = Record<string, unknown>;
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

const genericPanelModules: Record<"pid" | "iq" | "iir" | "trig" | "pwm" | "spectrumanalyzer", string[]> = {
  pid: ["pid0", "pid1", "pid2"],
  iq: ["iq0", "iq1", "iq2"],
  iir: ["iir"],
  trig: ["trig"],
  pwm: ["pwm0", "pwm1"],
  spectrumanalyzer: ["spectrumanalyzer"],
};

const genericPanelContainers: Record<keyof typeof genericPanelModules, HTMLDivElement> = {
  pid: pidModules,
  iq: iqModules,
  iir: iirModules,
  trig: trigModules,
  pwm: pwmModules,
  spectrumanalyzer: spectrumModules as HTMLDivElement,
};

interface GenericModuleControls {
  status: HTMLOutputElement;
  inputs: Map<string, HTMLInputElement | HTMLSelectElement>;
  fields: Map<string, HTMLLabelElement>;
  actions: HTMLButtonElement[];
  card: HTMLElement;
  owner: string | null;
}

const genericModuleControls = new Map<string, GenericModuleControls>();
const scopeParameterControls: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [
  scopeInput1,
  scopeInput2,
  scopeTrigger,
  scopeTriggerNormal,
  scopeTriggerRolling,
  scopeDuration,
  scopeAverage,
  scopeXyMode,
  scopeMathActive,
  scopeMathFormula,
  scopeTraceAverage,
  scopeTriggerDelay,
  scopeThreshold,
  scopeHysteresis,
  scopeStateSelect,
  scopeStateName,
  scopeStateSave,
  scopeStateLoad,
  scopeStateDelete,
  scopeCurveName,
];

let stream = new ScopeStream(
  plotHost,
  (message) => {
    status.textContent = message;
  },
  (currentAverage) => {
    scopeCurrentAverage.textContent = `${currentAverage} / ${scopeTraceAverage.value || "1"}`;
  },
);
let spectrumPlot = new SpectrumPlot(spectrumPlotHost, (message) => {
  spectrumStatus.textContent = message;
}, (currentAverage) => {
  const traceAverage = genericModuleControls.get("spectrumanalyzer")?.inputs.get("trace_average");
  spectrumCurrentAverage.textContent = `${currentAverage} / ${traceAverage?.value || "1"}`;
});
let iirPlot: IirPlot | null = null;
let eventSocket: WebSocket | null = null;
const eventReconnect = new ReconnectScheduler(() => connectEvents());
let eventCount = 0;
let runningState = "stopped";
let spectrumRunningState = "stopped";
let workspaceState = loadWorkspaceState();
let currentSession: { fake: boolean } | null = null;
let scopeSplit: Split.Instance | null = null;
let spectrumSplit: Split.Instance | null = null;
let workspaceSplit: Split.Instance | null = null;
let workspaceSplitMode: WorkspaceLayoutMode | null = null;
let workspaceSplitPanelSignature = "";

function saveWorkspaceState(state: WorkspaceState): void {
  saveWorkspaceStateLocal(state);
  void fetch("/api/workspace", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workspace: state }),
  }).catch(() => {
    /* Local storage remains the fallback if the server is unavailable. */
  });
}

async function loadWorkspaceStateFromConfig(): Promise<void> {
  const response = await fetch("/api/workspace");
  if (!response.ok) {
    return;
  }
  const payload = await response.json();
  if (payload.workspace && typeof payload.workspace === "object") {
    workspaceState = normalizeWorkspaceState(payload.workspace);
    saveWorkspaceStateLocal(workspaceState);
  } else {
    saveWorkspaceState(workspaceState);
  }
}

function exposeDebugState(): void {
  window.pyrplScope = {
    getFrameSequence: () => stream.getFrameSequence(),
    getSampleCount: () => stream.getSampleCount(),
    getXRange: () => stream.getXRange(),
    getYRange: () => stream.getYRange(),
    getScopeTimeLabels: () => stream.getFormattedTimeLabelsForCurrentRange(),
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
    getDisplayedDataFingerprint: () => stream.getDisplayedDataFingerprint(),
    getScopeMathStats: () => stream.getMathStats(),
    getScopeXyStats: () => stream.getXyStats(),
    moduleStatusText: () => moduleStatus.textContent ?? "",
    statusText: () => status.textContent ?? "",
    getSpectrumSeriesCount: () => spectrumPlot.getSeriesCount(),
    getSpectrumBinCount: () => spectrumPlot.getBinCount(),
    getSpectrumAverageCount: () => spectrumPlot.getAverageCount(),
    getSpectrumXRange: () => spectrumPlot.getXRange(),
    getSpectrumYRange: () => spectrumPlot.getYRange(),
    getIirXRange: () => iirPlot?.getXRange() ?? null,
    getIirMagnitudeYRange: () => iirPlot?.getMagnitudeYRange() ?? null,
    getIirPhaseYRange: () => iirPlot?.getPhaseYRange() ?? null,
    getLockboxClassname: () => lockboxPanel.getClassname(),
    getLockboxStageCount: () => lockboxPanel.getStageCount(),
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
  if (visiblePanels.has("spectrumanalyzer")) {
    ensureSpectrumSplit();
    window.requestAnimationFrame(() => spectrumPlot.refreshLayout());
  } else {
    destroySpectrumSplit();
  }
  if (visiblePanels.has("lockbox")) {
    window.requestAnimationFrame(() => lockboxPanel.refreshLayout());
  }
  if (visiblePanels.has("networkanalyzer")) {
    window.requestAnimationFrame(() => networkAnalyzerPanel.refreshLayout());
  }
  if (visiblePanels.has("curveviewer")) {
    window.requestAnimationFrame(() => curveViewerPanel.refreshLayout());
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

function ensureSpectrumSplit(): void {
  if (spectrumSplit || spectrumPanel.hidden) {
    return;
  }
  spectrumSplit = Split([spectrumControlsPane, spectrumPlotPane], {
    direction: "vertical",
    sizes: [32, 68],
    minSize: [96, 220],
    gutterSize: 8,
    snapOffset: 16,
    elementStyle: (_dimension, size) => ({
      height: `calc(${size}% - 4px)`,
    }),
    gutterStyle: () => ({
      height: "8px",
    }),
    onDrag: () => spectrumPlot.refreshLayout(),
    onDragEnd: () => spectrumPlot.refreshLayout(),
  });
}

function destroySpectrumSplit(): void {
  spectrumSplit?.destroy();
  spectrumSplit = null;
  spectrumControlsPane.removeAttribute("style");
  spectrumPlotPane.removeAttribute("style");
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
      onDrag: () => {
        stream.refreshLayout();
        spectrumPlot.refreshLayout();
        lockboxPanel.refreshLayout();
        networkAnalyzerPanel.refreshLayout();
        curveViewerPanel.refreshLayout();
      },
      onDragEnd: (sizes) => {
        workspaceState = {
          ...workspaceState,
          workspaceSplitSizes: normalizeWorkspaceSplitSizes(sizes, panelIds.length),
        };
        saveWorkspaceState(workspaceState);
        stream.refreshLayout();
        spectrumPlot.refreshLayout();
        lockboxPanel.refreshLayout();
        networkAnalyzerPanel.refreshLayout();
        curveViewerPanel.refreshLayout();
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
    callScopeAction("stop").catch((error: Error) => {
      moduleStatus.textContent = error.message;
    });
    return;
  }
  if (panelId === "scope" && enabled && workspaceState.activePanelId === "scope") {
    await activateScopePanel();
  }
  if (panelId === "spectrumanalyzer" && !enabled) {
    stopSpectrumStream("Spectrum panel disabled");
    callSpectrumAction("stop").catch((error: Error) => {
      spectrumStatus.textContent = error.message;
    });
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
    window.requestAnimationFrame(() => stream.refreshLayout());
  }
  if (panelId === "spectrumanalyzer") {
    window.requestAnimationFrame(() => spectrumPlot.refreshLayout());
  }
  if (panelId === "lockbox") {
    window.requestAnimationFrame(() => lockboxPanel.refreshLayout());
  }
  if (panelId === "networkanalyzer") {
    window.requestAnimationFrame(() => networkAnalyzerPanel.refreshLayout());
  }
  if (panelId === "curveviewer") {
    window.requestAnimationFrame(() => curveViewerPanel.refreshLayout());
  }
}

async function setWorkspaceLayoutMode(layoutMode: WorkspaceLayoutMode): Promise<void> {
  workspaceState = { ...workspaceState, layoutMode };
  saveWorkspaceState(workspaceState);
  applyWorkspaceState();
  if (workspaceState.panels.scope.enabled && layoutMode !== "tabs") {
    window.requestAnimationFrame(() => stream.refreshLayout());
  }
  if (workspaceState.panels.lockbox.enabled && layoutMode !== "tabs") {
    window.requestAnimationFrame(() => lockboxPanel.refreshLayout());
  }
  if (workspaceState.panels.networkanalyzer.enabled && layoutMode !== "tabs") {
    window.requestAnimationFrame(() => networkAnalyzerPanel.refreshLayout());
  }
  if (workspaceState.panels.curveviewer.enabled && layoutMode !== "tabs") {
    window.requestAnimationFrame(() => curveViewerPanel.refreshLayout());
  }
}

async function activateScopePanel(): Promise<void> {
  await fetchSingleFrame();
  if (!workspaceState.panels.scope.enabled || workspaceState.activePanelId !== "scope") {
    stopStream("Scope panel disabled");
    return;
  }
  if (currentSession?.fake) {
    await callScopeAction("continuous");
    startStream();
  }
}

function setRunningState(state: string): void {
  runningState = state;
  updateScopeAcquisitionButtons(state);
}

function updateScopeAcquisitionButtons(state: string): void {
  const rolling = rollingModeActive();
  if (state === "running_continuous") {
    connectButton.textContent = "Pause";
    connectButton.disabled = false;
    singleFrameButton.textContent = "Run single";
    singleFrameButton.disabled = true;
    stopScopeButton.disabled = false;
  } else if (state === "running_single") {
    connectButton.textContent = "Run continuous";
    connectButton.disabled = true;
    singleFrameButton.textContent = "Pause";
    singleFrameButton.disabled = false;
    stopScopeButton.disabled = false;
  } else if (state === "paused_single" || state === "paused_continuous") {
    connectButton.textContent = "Resume continuous";
    connectButton.disabled = false;
    singleFrameButton.textContent = "Resume single";
    singleFrameButton.disabled = rolling;
    stopScopeButton.disabled = false;
  } else {
    connectButton.textContent = "Run continuous";
    connectButton.disabled = false;
    singleFrameButton.textContent = "Run single";
    singleFrameButton.disabled = rolling;
    stopScopeButton.disabled = true;
  }
}

function setSpectrumRunningState(state: string): void {
  spectrumRunningState = state;
  if (state === "running_continuous") {
    spectrumRunButton.textContent = "Pause";
    spectrumRunButton.disabled = false;
    spectrumSingleButton.textContent = "Run single";
    spectrumSingleButton.disabled = true;
    spectrumStopButton.disabled = false;
  } else if (state === "running_single") {
    spectrumRunButton.textContent = "Run continuous";
    spectrumRunButton.disabled = true;
    spectrumSingleButton.textContent = "Pause";
    spectrumSingleButton.disabled = false;
    spectrumStopButton.disabled = false;
  } else if (state === "paused_single" || state === "paused_continuous") {
    spectrumRunButton.textContent = "Resume continuous";
    spectrumRunButton.disabled = false;
    spectrumSingleButton.textContent = "Resume single";
    spectrumSingleButton.disabled = false;
    spectrumStopButton.disabled = false;
  } else {
    spectrumRunButton.textContent = "Run continuous";
    spectrumRunButton.disabled = false;
    spectrumSingleButton.textContent = "Run single";
    spectrumSingleButton.disabled = false;
    spectrumStopButton.disabled = true;
  }
}

function startStream(): void {
  if (connectButton.dataset.connected === "true") {
    return;
  }
  stream.connect();
  connectButton.dataset.connected = "true";
}

function stopStream(message = "Disconnected"): void {
  stream.close();
  connectButton.dataset.connected = "false";
  status.textContent = message;
}

async function stopScopeForSpectrum(): Promise<void> {
  if (connectButton.dataset.connected !== "true") {
    return;
  }
  await callScopeAction("stop");
  stopStream("Scope stopped: Spectrum owns the scope resource");
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
  if (["single", "continuous", "resume_single", "resume_continuous"].includes(action)) {
    stream.reconnect();
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

function attributeValueLabel(attribute: string, value: ModulePrimitive): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
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
    element.textContent = attribute.option_labels?.[String(option)] ?? optionLabel(option);
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
  } else if (attribute === "duration") {
    scopeDuration.value = String(value);
    updatePlotTimeSettings();
    updateRollingControls();
  } else if (attribute === "average") {
    scopeAverage.checked = Boolean(value);
  } else if (attribute === "ch1_active") {
    showCh1Toggle.checked = Boolean(value);
    stream.setChannelVisible(1, showCh1Toggle.checked);
  } else if (attribute === "ch2_active") {
    showCh2Toggle.checked = Boolean(value);
    stream.setChannelVisible(2, showCh2Toggle.checked);
  } else if (attribute === "ch_math_active") {
    scopeMathActive.checked = Boolean(value);
    updateScopeDisplaySettings();
  } else if (attribute === "math_formula") {
    if (document.activeElement !== scopeMathFormula) scopeMathFormula.value = String(value);
    updateScopeDisplaySettings();
  } else if (attribute === "xy_mode") {
    scopeXyMode.checked = Boolean(value);
    updateScopeDisplaySettings();
  } else if (attribute === "rolling_mode") {
    scopeTriggerRolling.checked = Boolean(value);
    scopeTriggerNormal.checked = !Boolean(value);
    updatePlotTimeSettings();
    updateRollingControls();
  } else if (attribute === "trace_average") {
    scopeTraceAverage.value = String(value);
    stream.setTraceAverage(Number(value));
    scopeCurrentAverage.textContent = `0 / ${value}`;
  } else if (attribute === "trigger_delay") {
    if (document.activeElement !== scopeTriggerDelay) scopeTriggerDelay.value = String(value);
    updatePlotTimeSettings();
  } else if (attribute === "threshold") {
    if (document.activeElement !== scopeThreshold) scopeThreshold.value = String(value);
  } else if (attribute === "hysteresis") {
    if (document.activeElement !== scopeHysteresis) scopeHysteresis.value = String(value);
  } else if (attribute === "curve_name") {
    if (document.activeElement !== scopeCurveName) scopeCurveName.value = String(value);
  }
}

function updateScopeDisplaySettings(): void {
  stream.setDisplaySettings({
    xyMode: scopeXyMode.checked,
    mathActive: scopeMathActive.checked,
    mathFormula: scopeMathFormula.value,
  });
}

function rollingModeActive(): boolean {
  return scopeTriggerRolling.checked && Number(scopeDuration.value) > 0.1;
}

function updateRollingControls(): void {
  const allowed = Number(scopeDuration.value) > 0.1;
  scopeTriggerMode.disabled = !allowed;
  const active = rollingModeActive();
  scopeTrigger.disabled = active;
  scopeThreshold.disabled = active;
  scopeHysteresis.disabled = active;
  updateScopeAcquisitionButtons(runningState);
}

function updatePlotTimeSettings(): void {
  stream.setTimeSettings({
    duration: Number(scopeDuration.value),
    triggerDelay: Number(scopeTriggerDelay.value || 0),
    triggerSource: scopeTrigger.value,
    rollingMode: rollingModeActive(),
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
  applyScopeRuntimeState(state);
}

function applyScopeRuntimeState(state: ScopeState): void {
  if (state.running_state) {
    setRunningState(state.running_state);
  }
  if (state.current_avg !== undefined) {
    scopeCurrentAverage.textContent = `${state.current_avg} / ${scopeTraceAverage.value || "1"}`;
  }
  if ("owner" in state) {
    setScopeOwner(typeof state.owner === "string" ? state.owner : null);
  }
}

function setScopeOwner(owner: string | null): void {
  scopeControlsPane.classList.toggle("is-owned", owner !== null);
  for (const control of scopeParameterControls) {
    control.disabled = owner !== null;
  }
  if (owner === null) {
    updateRollingControls();
  }
  if (owner) {
    moduleStatus.textContent = `scope occupied by ${owner}`;
  }
}

async function setScopeAttribute(attribute: string, value: string | number | boolean): Promise<void> {
  const result = await setModuleAttributeValue("scope", attribute, value);
  if (
    [
      "input1",
      "input2",
      "duration",
      "average",
      "trigger_source",
      "trigger_delay",
      "threshold",
      "hysteresis",
      "rolling_mode",
    ].includes(attribute)
  ) {
    stream.reconnect();
  }
  applyScopeControlValue(attribute, result.value as string | number | boolean);
  moduleStatus.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
}

async function setModuleAttributeValue(
  moduleName: string,
  attribute: string,
  value: ModulePrimitive,
): Promise<{ value: ModulePrimitive }> {
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
  populateSelect(scopeDuration, attributes.get("duration")!);
  scopeAverage.checked = Boolean(attributes.get("average")?.value);
  showCh1Toggle.checked = Boolean(attributes.get("ch1_active")?.value ?? true);
  stream.setChannelVisible(1, showCh1Toggle.checked);
  showCh2Toggle.checked = Boolean(attributes.get("ch2_active")?.value ?? true);
  stream.setChannelVisible(2, showCh2Toggle.checked);
  scopeMathActive.checked = Boolean(attributes.get("ch_math_active")?.value ?? false);
  scopeMathFormula.value = String(attributes.get("math_formula")?.value ?? "ch1 * ch2");
  scopeXyMode.checked = Boolean(attributes.get("xy_mode")?.value ?? false);
  scopeTriggerRolling.checked = Boolean(attributes.get("rolling_mode")?.value ?? true);
  scopeTriggerNormal.checked = !scopeTriggerRolling.checked;
  populateNumber(scopeTraceAverage, attributes.get("trace_average")!);
  populateNumber(scopeTriggerDelay, attributes.get("trigger_delay")!);
  populateNumber(scopeThreshold, attributes.get("threshold")!);
  populateNumber(scopeHysteresis, attributes.get("hysteresis")!);
  scopeCurveName.value = String(attributes.get("curve_name")?.value ?? "scope curve");
  stream.setTraceAverage(Number(scopeTraceAverage.value));
  updateScopeDisplaySettings();
  updatePlotTimeSettings();
  updateRollingControls();
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
    if (isScalarModulePrimitive(value)) {
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
  applyAsgControlValue(moduleName, attribute, result.value as string | number | boolean);
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
    if (isScalarModulePrimitive(value)) {
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
  applyHkControlValue(attribute, result.value as string | number | boolean);
  hkStatus.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
}

async function loadTelemetry(): Promise<void> {
  const [samplerResponse, amsResponse] = await Promise.all([
    fetch("/api/modules/sampler"),
    fetch("/api/modules/ams"),
  ]);
  if (!samplerResponse.ok || !amsResponse.ok) {
    throw new Error("Sampler or AMS readback unavailable");
  }
  const samplerPayload = await samplerResponse.json();
  const amsPayload = await amsResponse.json();
  applySamplerState(samplerPayload.state ?? {});
  applyAmsState(amsPayload.state ?? {});
  samplerStatus.textContent = "Sampler refreshed";
  amsStatus.textContent = "AMS refreshed";
}

function applySamplerState(state: ModuleState): void {
  if (samplerOutputs.size === 0) {
    samplerGrid.textContent = "";
    samplerStatsSignal.textContent = "";
    for (const signal of Object.keys(state)) {
      const reading = document.createElement("div");
      reading.className = "sampler-reading";
      const label = document.createElement("span");
      label.textContent = signal;
      const output = document.createElement("output");
      output.dataset.signal = signal;
      reading.append(label, output);
      samplerGrid.appendChild(reading);
      samplerOutputs.set(signal, output);
      samplerStatsSignal.add(new Option(signal, signal));
    }
  }
  for (const [signal, value] of Object.entries(state)) {
    if (typeof value === "number") {
      const output = samplerOutputs.get(signal);
      if (output) output.value = formatTelemetryValue(value);
    }
  }
}

function applyAmsState(state: ModuleState): void {
  amsInputs.forEach((input, index) => {
    const value = state[`dac${index}`];
    if (typeof value === "number") input.value = value.toFixed(6);
  });
}

async function runSamplerStats(): Promise<void> {
  samplerStatsRun.disabled = true;
  samplerStatsOutput.value = "Acquiring...";
  try {
    const response = await fetch("/api/sampler/stats", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        signal: samplerStatsSignal.value,
        duration: Number(samplerStatsDuration.value),
      }),
    });
    if (!response.ok) throw new Error(`Sampler statistics failed: ${response.status}`);
    const result = await response.json();
    samplerStatsOutput.value =
      `mean ${formatTelemetryValue(result.mean)} | std ${formatTelemetryValue(result.stddev)} | ` +
      `min ${formatTelemetryValue(result.min)} | max ${formatTelemetryValue(result.max)} | n ${result.count}`;
  } finally {
    samplerStatsRun.disabled = false;
  }
}

async function setAmsDac(index: 2 | 3): Promise<void> {
  const result = await setModuleAttributeValue("ams", `dac${index}`, Number(amsInputs[index].value));
  amsInputs[index].value = Number(result.value).toFixed(6);
  amsStatus.textContent = `DAC${index} = ${amsInputs[index].value} V`;
}

function formatTelemetryValue(value: number): string {
  if (!Number.isFinite(value)) return "--";
  const magnitude = Math.abs(value);
  return magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e4)
    ? value.toExponential(5)
    : value.toFixed(6);
}

async function loadGenericPanels(): Promise<void> {
  for (const [panelId, moduleNames] of Object.entries(genericPanelModules) as Array<
    [keyof typeof genericPanelModules, string[]]
  >) {
    const container = genericPanelContainers[panelId];
    if (panelId === "iir" && iirPlot) {
      iirPlot.destroy();
      iirPlot = null;
    }
    container.textContent = "";
    await Promise.all(moduleNames.map((moduleName) => buildGenericModuleCard(container, moduleName)));
  }
}

async function buildGenericModuleCard(container: HTMLElement, moduleName: string): Promise<void> {
  const [attributesResponse, actionsResponse, stateResponse] = await Promise.all([
    fetch(`/api/modules/${moduleName}/attributes`),
    fetch(`/api/modules/${moduleName}/actions`),
    fetch(`/api/modules/${moduleName}`),
  ]);
  if (!attributesResponse.ok || !actionsResponse.ok || !stateResponse.ok) {
    throw new Error(`${moduleName} controls unavailable`);
  }
  const attributesPayload = await attributesResponse.json();
  const actionsPayload = await actionsResponse.json();
  const statePayload = await stateResponse.json();
  const card = document.createElement("section");
  card.className = "module-panel instrument-card";
  if (moduleName === "iir") {
    card.classList.add("iir-card");
  }
  card.dataset.module = moduleName;

  const header = document.createElement("header");
  header.className = "instrument-card-header";
  const title = document.createElement("h3");
  title.textContent = moduleName.toUpperCase();
  const statusOutput = document.createElement("output");
  statusOutput.id = `${moduleName}-status`;
  statusOutput.textContent = `${moduleName} ready`;
  header.append(title, statusOutput);

  const row = document.createElement("div");
  row.className =
    moduleName === "spectrumanalyzer"
      ? "control-row generic-module-row spectrum-module-row"
      : "control-row generic-module-row";
  const controls: GenericModuleControls = {
    status: statusOutput,
    inputs: new Map(),
    fields: new Map(),
    actions: [],
    card,
    owner: null,
  };
  const attributes = moduleName === "spectrumanalyzer"
    ? orderSpectrumAttributes(attributesPayload.attributes as ModuleAttribute[])
    : (attributesPayload.attributes as ModuleAttribute[]);
  for (const attribute of attributes) {
    if (moduleName === "iir" && isIirPoleZeroList(attribute.name)) {
      continue;
    }
    const field = createGenericAttributeField(moduleName, attribute, statusOutput);
    controls.inputs.set(attribute.name, field.input);
    controls.fields.set(attribute.name, field.label);
    row.appendChild(field.label);
  }
  const visibleActions =
    moduleName === "spectrumanalyzer"
      ? []
      : (actionsPayload.actions ?? []);
  for (const action of visibleActions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label ?? action.name;
    button.addEventListener("click", () => {
      callGenericModuleAction(moduleName, action.name, statusOutput).catch((error: Error) => {
        statusOutput.textContent = error.message;
      });
    });
    controls.actions.push(button);
    row.appendChild(button);
  }
  genericModuleControls.set(moduleName, controls);
  card.append(header, row);
  if (moduleName === "iir") {
    const plotHost = document.createElement("section");
    plotHost.className = "iir-plot";
    card.appendChild(plotHost);
    iirPlot = new IirPlot(
      plotHost,
      async (attribute, value) => {
        await setGenericModuleAttribute("iir", attribute, value, statusOutput);
      },
      (message) => {
        statusOutput.textContent = message;
      },
    );
    iirPlot.refresh().catch((error: Error) => {
      statusOutput.textContent = error.message;
    });
  }
  container.appendChild(card);
  applyGenericModuleState(moduleName, statePayload.state ?? {});
}

function isIirPoleZeroList(attribute: string): boolean {
  return attribute === "real_poles" ||
    attribute === "real_zeros" ||
    attribute === "complex_poles" ||
    attribute === "complex_zeros";
}

function createGenericAttributeField(
  moduleName: string,
  attribute: ModuleAttribute,
  statusOutput: HTMLOutputElement,
): { label: HTMLLabelElement; input: HTMLInputElement | HTMLSelectElement } {
  const label = document.createElement("label");
  label.dataset.attribute = attribute.name;
  const title = document.createElement("span");
  title.textContent = moduleName === "spectrumanalyzer" ? spectrumAttributeLabel(attribute) : attribute.label;
  label.appendChild(title);
  let input: HTMLInputElement | HTMLSelectElement;
  if (attribute.type === "select") {
    const select = document.createElement("select");
    populateSelect(select, attribute);
    select.addEventListener("change", () => {
      setGenericModuleAttribute(moduleName, attribute.name, select.value, statusOutput).catch((error: Error) => {
        statusOutput.textContent = error.message;
      });
    });
    input = select;
  } else if (attribute.type === "bool") {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(attribute.value);
    checkbox.addEventListener("change", () => {
      setGenericModuleAttribute(moduleName, attribute.name, checkbox.checked, statusOutput).catch((error: Error) => {
        statusOutput.textContent = error.message;
      });
    });
    input = checkbox;
  } else if (attribute.type === "number") {
    const number = document.createElement("input");
    number.type = "number";
    populateNumber(number, attribute);
    number.addEventListener("change", () => {
      setGenericModuleAttribute(moduleName, attribute.name, Number(number.value), statusOutput).catch((error: Error) => {
        statusOutput.textContent = error.message;
      });
    });
    input = number;
  } else {
    const text = document.createElement("input");
    text.type = "text";
    text.value = formatModuleValue(attribute.value);
    text.addEventListener("change", () => {
      setGenericModuleAttribute(moduleName, attribute.name, text.value, statusOutput).catch((error: Error) => {
        statusOutput.textContent = error.message;
      });
    });
    input = text;
  }
  if (attribute.readonly) {
    if (input instanceof HTMLSelectElement) {
      input.disabled = true;
    } else {
      input.readOnly = true;
    }
  }
  input.id = `${moduleName}-${attribute.name.replaceAll("_", "-")}`;
  label.appendChild(input);
  return { label, input };
}

function spectrumAttributeLabel(attribute: ModuleAttribute): string {
  if (attribute.name === "input") {
    return "IQ Input";
  }
  if (attribute.name === "center") {
    return "IQ Center";
  }
  if (attribute.name === "input1_baseband") {
    return "BB Input 1";
  }
  if (attribute.name === "input2_baseband") {
    return "BB Input 2";
  }
  if (attribute.name === "display_input1_baseband" || attribute.name === "display_input2_baseband") {
    return "Show";
  }
  if (attribute.name === "display_cross_amplitude") {
    return "Cross";
  }
  return attribute.label;
}

function orderSpectrumAttributes(attributes: ModuleAttribute[]): ModuleAttribute[] {
  const order = [
    "baseband",
    "display_input1_baseband",
    "input1_baseband",
    "display_input2_baseband",
    "input2_baseband",
    "input",
    "center",
    "acbandwidth",
    "display_cross_amplitude",
    "span",
    "rbw",
    "window",
    "display_unit",
    "trace_average",
  ];
  return [...attributes].sort((left, right) => {
    const leftIndex = order.indexOf(left.name);
    const rightIndex = order.indexOf(right.name);
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
}

async function setGenericModuleAttribute(
  moduleName: string,
  attribute: string,
  value: ModulePrimitive,
  statusOutput: HTMLOutputElement,
): Promise<void> {
  const result = await setModuleAttributeValue(moduleName, attribute, value);
  applyGenericModuleValue(moduleName, attribute, result.value);
  statusOutput.textContent = `${attribute} = ${attributeValueLabel(attribute, result.value)}`;
  if (moduleName === "iir" && iirPlot) {
    await iirPlot.refresh();
    if (attribute === "data_curve") {
      const response = await fetch("/api/modules/iir");
      if (response.ok) {
        const payload = await response.json();
        applyGenericModuleState("iir", payload.state ?? {});
      }
    }
  }
}

async function callGenericModuleAction(moduleName: string, action: string, statusOutput: HTMLOutputElement): Promise<void> {
  const response = await fetch(`/api/modules/${moduleName}/actions/${action}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`${moduleName} action ${action} failed: ${response.status}`);
  }
  const payload = await response.json();
  applyGenericModuleState(moduleName, payload.state ?? {});
  if (moduleName === "iir" && iirPlot) {
    await iirPlot.refresh();
  }
  statusOutput.textContent = `${action}: ok`;
}

function applyGenericModuleState(moduleName: string, state: ModuleState): void {
  if (moduleName === "spectrumanalyzer") {
    spectrumPlot.setSettings(state);
    applySpectrumFieldVisibility(state);
    if (typeof state.running_state === "string") {
      setSpectrumRunningState(state.running_state);
    }
    if (typeof state.current_avg === "number") {
      const traceAverage = genericModuleControls.get("spectrumanalyzer")?.inputs.get("trace_average");
      spectrumCurrentAverage.textContent = `${state.current_avg} / ${traceAverage?.value || "1"}`;
    }
    if (document.activeElement !== spectrumCurveName && typeof state.curve_name === "string") {
      spectrumCurveName.value = state.curve_name;
    }
  }
  for (const [attribute, value] of Object.entries(state)) {
    if (attribute === "owner") {
      setGenericModuleOwner(moduleName, typeof value === "string" ? value : null);
    } else if (isModulePrimitive(value)) {
      applyGenericModuleValue(moduleName, attribute, value);
    }
  }
}

function applySpectrumFieldVisibility(state: ModuleState): void {
  const controls = genericModuleControls.get("spectrumanalyzer");
  if (!controls) {
    return;
  }
  const baseband = Boolean(state.baseband ?? true);
  const iqOnly = new Set(["input", "center", "acbandwidth"]);
  const basebandOnly = new Set([
    "input1_baseband",
    "input2_baseband",
    "display_input1_baseband",
    "display_input2_baseband",
    "display_cross_amplitude",
  ]);
  for (const [attribute, field] of controls.fields) {
    field.hidden = (baseband && iqOnly.has(attribute)) || (!baseband && basebandOnly.has(attribute));
  }
}

function applyGenericModuleValue(moduleName: string, attribute: string, value: ModulePrimitive): void {
  const input = genericModuleControls.get(moduleName)?.inputs.get(attribute);
  if (!input) {
    return;
  }
  if (input instanceof HTMLInputElement && input.type === "checkbox") {
    input.checked = Boolean(value);
  } else {
    input.value = formatModuleValue(value);
  }
}

function setGenericModuleOwner(moduleName: string, owner: string | null): void {
  const controls = genericModuleControls.get(moduleName);
  if (!controls) {
    return;
  }
  controls.owner = owner;
  controls.card.classList.toggle("is-owned", owner !== null);
  for (const input of controls.inputs.values()) {
    input.disabled = owner !== null;
  }
  for (const button of controls.actions) {
    button.disabled = owner !== null;
  }
  if (owner) {
    controls.status.textContent = `occupied by ${owner}`;
  }
}

function isModulePrimitive(value: unknown): value is ModulePrimitive {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ||
    (Array.isArray(value) && value.every((item) => typeof item === "number" || typeof item === "string"));
}

function formatModuleValue(value: ModulePrimitive): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function isScalarModulePrimitive(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isGenericModule(moduleName: unknown): moduleName is string {
  return typeof moduleName === "string" && genericModuleControls.has(moduleName);
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
  const socket = new WebSocket(`${protocol}//${window.location.host}/ws/events`);
  eventSocket = socket;
  socket.addEventListener("open", () => {
    if (eventSocket === socket) eventReconnect.connected();
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "control.changed") {
      void refreshControlStatus();
      return;
    }
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
      } else if (isGenericModule(message.module)) {
        applyGenericModuleValue(message.module, message.attribute, message.value);
        const controls = genericModuleControls.get(message.module);
        if (controls) {
          controls.status.textContent = `${message.attribute} = ${attributeValueLabel(message.attribute, message.value)}`;
        }
      }
      return;
    }
    if (message.type !== "module.attribute.changed" || message.module !== "scope") {
      if (message.type === "module.state.changed" && message.module === "scope") {
        applyScopeRuntimeState(message.state);
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
      } else if (message.type === "module.state.changed" && isGenericModule(message.module)) {
        applyGenericModuleState(message.module, message.state ?? {});
        const controls = genericModuleControls.get(message.module);
        if (controls && !controls.owner && message.module !== "spectrumanalyzer") {
          controls.status.textContent = `${message.module} state updated`;
        }
      } else if (message.type === "module.state.changed" && message.module === "lockbox") {
        lockboxPanel.applySchema(message.state as LockboxSchema).catch((error: Error) => {
          moduleStatus.textContent = error.message;
        });
      } else if (message.type === "module.state.changed" && message.module === "networkanalyzer") {
        networkAnalyzerPanel.applyState(message.state ?? {});
      } else if (message.type === "module.states.changed" && message.module === "scope") {
        populateStateSelect(message.states ?? []);
        moduleStatus.textContent = `${message.states.length} saved state${message.states.length === 1 ? "" : "s"}`;
      }
      return;
    }
  });
  socket.addEventListener("close", () => {
    if (eventSocket !== socket) return;
    eventSocket = null;
    eventReconnect.schedule();
  });
}

function applyControlStatus(control: ControlStatus): void {
  controlStrip.classList.remove("is-controller", "is-observer", "is-shared");
  controlStrip.classList.add(`is-${control.role}`);
  if (control.role === "shared") {
    controlStatus.value = "Shared control";
    takeControlButton.hidden = true;
  } else if (control.role === "controller") {
    controlStatus.value = "You have control";
    takeControlButton.hidden = true;
  } else {
    controlStatus.value = control.controller?.label
      ? `Observer: ${control.controller.label} has control`
      : "Observer: control is available";
    takeControlButton.hidden = false;
  }
}

async function refreshControlStatus(): Promise<void> {
  try {
    applyControlStatus(await controlClient.refresh());
  } catch (error) {
    controlStatus.value = error instanceof Error ? error.message : "Control unavailable";
  }
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
}

async function callSpectrumAction(action: string): Promise<Record<string, unknown>> {
  const response = await fetch(`/api/modules/spectrumanalyzer/actions/${action}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Spectrum action ${action} failed: ${response.status}`);
  }
  const payload = await response.json();
  const state = payload.state as { running_state?: string; last_action?: string };
  applyGenericModuleState("spectrumanalyzer", (payload.state ?? {}) as ModuleState);
  spectrumStatus.textContent = `${action}: ${state.running_state ?? "ok"}`;
  return payload;
}

async function createStoredCurve(
  x: number[],
  y: number[],
  params: Record<string, unknown>,
  yImag?: number[],
): Promise<void> {
  const response = await fetch("/api/curves", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ x, y, y_imag: yImag, params }),
  });
  if (!response.ok) throw new Error(`Save curve failed: ${response.status}`);
}

async function persistScopeCurves(): Promise<number> {
  const data = stream.getCurveData();
  if (!data) throw new Error("No scope curve to save");
  const channels: Array<[number, boolean]> = [
    [0, showCh1Toggle.checked],
    [1, showCh2Toggle.checked],
  ];
  const active = channels.filter(([, enabled]) => enabled);
  const setup = {
    input1: scopeInput1.value,
    input2: scopeInput2.value,
    duration: Number(scopeDuration.value),
    average: scopeAverage.checked,
    trigger_source: scopeTrigger.value,
    trigger_delay: Number(scopeTriggerDelay.value),
    threshold: Number(scopeThreshold.value),
    hysteresis: Number(scopeHysteresis.value),
    ch1_active: showCh1Toggle.checked,
    ch2_active: showCh2Toggle.checked,
    ch_math_active: scopeMathActive.checked,
    math_formula: scopeMathFormula.value,
    xy_mode: scopeXyMode.checked,
    rolling_mode: scopeTriggerRolling.checked,
    trace_average: Number(scopeTraceAverage.value),
  };
  await Promise.all(active.map(([channel]) => createStoredCurve(data.x, data.channels[channel], {
    ...setup,
    name: `${scopeCurveName.value || "scope curve"} ch${channel + 1}`,
    module: "scope",
    ch: channel,
    curve_unit: "V",
  })));
  return active.length;
}

async function persistSpectrumCurves(): Promise<number> {
  const data = spectrumPlot.getCurveData();
  if (!data) throw new Error("No spectrum curve to save");
  await Promise.all(data.series.map((series, index) => createStoredCurve(data.x, series.values, {
    ...spectrumPlot.getCurveParameters(),
    name: `${spectrumCurveName.value || "pyrpl spectrum"} ${series.label.toLowerCase()}`,
    module: "spectrumanalyzer",
    ch: series.label === "Cross" ? "cross" : index,
    curve_unit: data.unit,
  }, series.imaginary)));
  return data.series.length;
}

function startSpectrumStream(): void {
  if (spectrumRunButton.dataset.connected === "true") {
    return;
  }
  spectrumPlot.connect();
  spectrumRunButton.dataset.connected = "true";
}

function stopSpectrumStream(message = "Spectrum stopped"): void {
  spectrumPlot.close();
  spectrumRunButton.dataset.connected = "false";
  spectrumStatus.textContent = message;
}

async function stopSpectrumForScope(): Promise<void> {
  await callSpectrumAction("stop");
  if (spectrumRunButton.dataset.connected === "true" || spectrumPlot.isConnected()) {
    stopSpectrumStream("Spectrum stopped: Scope owns the scope resource");
  }
}

async function runSingleFrame(): Promise<void> {
  await stopSpectrumForScope();
  await callScopeAction("single");
  stream.resetTraceAveraging();
  startStream();
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
  void (async () => {
    try {
      if (runningState === "running_continuous") {
        await callScopeAction("pause");
      } else if (runningState === "paused_single" || runningState === "paused_continuous") {
        await callScopeAction("resume_continuous");
        startStream();
      } else {
        await stopSpectrumForScope();
        await callScopeAction("continuous");
        stream.resetTraceAveraging();
        startStream();
      }
    } catch (error) {
      moduleStatus.textContent = error instanceof Error ? error.message : String(error);
    }
  })();
});

singleFrameButton.addEventListener("click", () => {
  const action = runningState === "running_single"
    ? callScopeAction("pause")
    : runningState === "paused_single" || runningState === "paused_continuous"
      ? callScopeAction("resume_single").then(() => startStream())
      : runSingleFrame();
  action.catch((error: Error) => {
    status.textContent = error.message;
  });
});

stopScopeButton.addEventListener("click", () => {
  callScopeAction("stop")
    .then(() => {
      stream.resetTraceAveraging();
      stopStream();
    })
    .catch((error: Error) => {
      status.textContent = error.message;
    });
});

saveCurveButton.addEventListener("click", () => {
  Promise.all([callScopeAction("save_curve"), persistScopeCurves()])
    .then(([, curves]) => {
      stream.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);
      moduleStatus.textContent = `saved ${curves} curve${curves === 1 ? "" : "s"}`;
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

spectrumSingleButton.addEventListener("click", () => {
  void (async () => {
    try {
      if (spectrumRunningState === "running_single") {
        await callSpectrumAction("pause");
        stopSpectrumStream("Spectrum paused");
      } else if (spectrumRunningState === "paused_single" || spectrumRunningState === "paused_continuous") {
        stopSpectrumStream("Reconnecting spectrum stream");
        await callSpectrumAction("resume_single");
        startSpectrumStream();
      } else {
        await stopScopeForSpectrum();
        stopSpectrumStream("Starting spectrum acquisition");
        spectrumPlot.resetAveraging();
        await callSpectrumAction("single");
        startSpectrumStream();
      }
    } catch (error) {
      spectrumStatus.textContent = error instanceof Error ? error.message : String(error);
    }
  })();
});

spectrumRunButton.addEventListener("click", () => {
  void (async () => {
    try {
      if (spectrumRunningState === "running_continuous") {
        await callSpectrumAction("pause");
        stopSpectrumStream("Spectrum paused");
      } else if (spectrumRunningState === "paused_single" || spectrumRunningState === "paused_continuous") {
        stopSpectrumStream("Reconnecting spectrum stream");
        await callSpectrumAction("resume_continuous");
        startSpectrumStream();
      } else {
        await stopScopeForSpectrum();
        stopSpectrumStream("Starting spectrum acquisition");
        spectrumPlot.resetAveraging();
        await callSpectrumAction("continuous");
        startSpectrumStream();
      }
    } catch (error) {
      spectrumStatus.textContent = error instanceof Error ? error.message : String(error);
    }
  })();
});

spectrumStopButton.addEventListener("click", () => {
  callSpectrumAction("stop")
    .then(() => stopSpectrumStream())
    .catch((error: Error) => {
      spectrumStatus.textContent = error.message;
    });
});

spectrumSaveCurveButton.addEventListener("click", () => {
  persistSpectrumCurves()
    .then((curves) => {
      spectrumPlot.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);
      spectrumStatus.textContent = `saved ${curves} curve${curves === 1 ? "" : "s"}`;
    })
    .catch((error: Error) => { spectrumStatus.textContent = error.message; });
});

scopeCurveName.addEventListener("change", () => {
  setScopeAttribute("curve_name", scopeCurveName.value).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

spectrumCurveName.addEventListener("change", () => {
  setGenericModuleAttribute("spectrumanalyzer", "curve_name", spectrumCurveName.value, spectrumStatus)
    .catch((error: Error) => { spectrumStatus.textContent = error.message; });
});

spectrumZoomOutButton.addEventListener("click", () => spectrumPlot.zoom(1.8));
spectrumZoomInButton.addEventListener("click", () => spectrumPlot.zoom(0.55));
spectrumZoomYOutButton.addEventListener("click", () => spectrumPlot.zoomY(1.8));
spectrumZoomYInButton.addEventListener("click", () => spectrumPlot.zoomY(0.55));
spectrumPanLeftButton.addEventListener("click", () => spectrumPlot.panX(-0.2));
spectrumPanRightButton.addEventListener("click", () => spectrumPlot.panX(0.2));
spectrumPanUpButton.addEventListener("click", () => spectrumPlot.panY(-0.2));
spectrumPanDownButton.addEventListener("click", () => spectrumPlot.panY(0.2));
spectrumZoomResetButton.addEventListener("click", () => spectrumPlot.resetZoom());

showCh1Toggle.addEventListener("change", () => {
  stream.setChannelVisible(1, showCh1Toggle.checked);
  setScopeAttribute("ch1_active", showCh1Toggle.checked).catch((error: Error) => {
    moduleStatus.textContent = error.message;
    showCh1Toggle.checked = stream.getChannelVisible(1);
  });
});

showCh2Toggle.addEventListener("change", () => {
  stream.setChannelVisible(2, showCh2Toggle.checked);
  setScopeAttribute("ch2_active", showCh2Toggle.checked).catch((error: Error) => {
    moduleStatus.textContent = error.message;
    showCh2Toggle.checked = stream.getChannelVisible(2);
  });
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

scopeTriggerNormal.addEventListener("change", () => {
  if (!scopeTriggerNormal.checked) return;
  setScopeAttribute("rolling_mode", false).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeTriggerRolling.addEventListener("change", () => {
  if (!scopeTriggerRolling.checked) return;
  setScopeAttribute("rolling_mode", true).catch((error: Error) => {
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

scopeXyMode.addEventListener("change", () => {
  updateScopeDisplaySettings();
  setScopeAttribute("xy_mode", scopeXyMode.checked).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeMathActive.addEventListener("change", () => {
  updateScopeDisplaySettings();
  setScopeAttribute("ch_math_active", scopeMathActive.checked).catch((error: Error) => {
    moduleStatus.textContent = error.message;
  });
});

scopeMathFormula.addEventListener("change", () => {
  updateScopeDisplaySettings();
  setScopeAttribute("math_formula", scopeMathFormula.value).catch((error: Error) => {
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

telemetryRefresh.addEventListener("click", () => {
  loadTelemetry().catch((error: Error) => {
    samplerStatus.textContent = error.message;
  });
});

samplerStatsRun.addEventListener("click", () => {
  runSamplerStats().catch((error: Error) => {
    samplerStatsOutput.value = error.message;
  });
});

amsInputs[2].addEventListener("change", () => {
  setAmsDac(2).catch((error: Error) => { amsStatus.textContent = error.message; });
});

amsInputs[3].addEventListener("change", () => {
  setAmsDac(3).catch((error: Error) => { amsStatus.textContent = error.message; });
});

async function startup(): Promise<void> {
  try {
    applyControlStatus(await controlClient.initialize());
  } catch {
    await refreshControlStatus();
  }
  currentSession = await refreshSession();
  buildHkExpansionGrid();
  await loadScopeControls();
  await loadScopeStates();
  await loadAsgControls();
  await loadHkControls();
  await loadTelemetry();
  await loadGenericPanels();
  await networkAnalyzerPanel.initialize();
  await curveViewerPanel.load();
  await configPanel.load().catch((error: Error) => {
    requireElement<HTMLOutputElement>("#config-status").textContent = error.message;
  });
  await lockboxPanel.load();
  connectEvents();
  await loadWorkspaceStateFromConfig();
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

takeControlButton.addEventListener("click", () => {
  controlClient.claim(true).then(applyControlStatus).catch((error: Error) => {
    controlStatus.value = error.message;
  });
});

window.addEventListener("pagehide", () => controlClient.release());

exposeDebugState();
startup().catch((error: Error) => {
  status.textContent = error.message;
});
