import { fitPlotToFrame } from "./plot-theme";
import { accessibleSplit } from "./split-layout";
import { reportError } from "./status-bar";
import type uPlot from "uplot";
import { optionLabel, setSelectValue } from "./select-controls";
import Split from "split.js";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis, createThemedPlot } from "./plot-theme";
import { ReconnectScheduler } from "./websocket-reconnect";

interface AttributeSchema {
  name: string;
  label: string;
  type: "select" | "bool" | "number" | "text";
  value: string | number | boolean;
  options?: Array<string | number>;
  min?: number;
  max?: number;
  step?: number;
}

interface PointMessage {
  settings?: Record<string, unknown>;
  run_id: number;
  index: number;
  x: number;
  real: number;
  imag: number;
  points: number;
  current_avg: number;
  scan_complete: boolean;
  logscale: boolean;
  zero_span: boolean;
  running_state: string;
  time_per_point: number;
}

export class NetworkAnalyzerPanel {
  private state: Record<string, unknown> = {};
  private subscriptionEnabled = false;
  private readOnly = false;
  private magnitudePlot: uPlot;
  private phasePlot: uPlot;
  private socket: WebSocket | null = null;
  private wantsConnection = false;
  private reconnectScheduler: ReconnectScheduler;
  private runId = -1;
  private x: number[] = [];
  private magnitude: number[] = [];
  private phase: number[] = [];
  private real: number[] = [];
  private imaginary: number[] = [];
  private redrawFrame: number | null = null;
  private resizeFrame: number | null = null;
  private manualX = false;
  private manualY = new Set<uPlot>();
  private updatingPlots = false;
  private zeroSpan = false;
  private actionPending = false;
  private savePending = false;
  private captureParameters: Record<string, unknown> = {};
  private logscale = true;
  private lastProgress = "";
  private resizeObserver: ResizeObserver;
  private split: Split.Instance | null = null;
  private controlsPane: HTMLElement;
  private plotsPane: HTMLElement;

  constructor(
    private controlsHost: HTMLElement,
    private magnitudeHost: HTMLElement,
    private phaseHost: HTMLElement,
    private status: HTMLOutputElement,
    private singleButton: HTMLButtonElement,
    private runButton: HTMLButtonElement,
    private stopButton: HTMLButtonElement,
    private saveButton: HTMLButtonElement,
    private resetButton: HTMLButtonElement,
  ) {
    this.reconnectScheduler = new ReconnectScheduler(() => this.openSocket());
    this.magnitudePlot = this.createPlot(this.magnitudeHost, "Magnitude (dB)", "dB");
    this.phasePlot = this.createPlot(this.phaseHost, "Phase (deg)", "deg");
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(this.magnitudeHost.parentElement ?? this.magnitudeHost);
    this.resizeObserver.observe(this.phaseHost.parentElement ?? this.phaseHost);
    const controlsPane = this.controlsHost.parentElement;
    const plotsPane = this.magnitudeHost.closest<HTMLElement>(".network-plots");
    if (!controlsPane || !plotsPane) throw new Error("Network analyzer split panes are missing");
    this.controlsPane = controlsPane;
    this.plotsPane = plotsPane;
    this.bindActions();
    this.scheduleResize();
  }

  async initialize(): Promise<void> {
    const [attributesResponse, stateResponse] = await Promise.all([
      fetch("/api/modules/networkanalyzer/attributes"),
      fetch("/api/modules/networkanalyzer"),
    ]);
    if (!attributesResponse.ok || !stateResponse.ok) {
      throw new Error("Network analyzer controls failed to load");
    }
    const attributesPayload = await attributesResponse.json();
    const statePayload = await stateResponse.json();
    this.renderControls(attributesPayload.attributes ?? []);
    this.applyState(statePayload.state ?? statePayload);
  }

  applyState(state: Record<string, unknown>): void {
    this.state = { ...this.state, ...state };
    for (const [name, value] of Object.entries(state)) {
      const input = this.controlsHost.querySelector<HTMLInputElement | HTMLSelectElement>(`#networkanalyzer-${name.replaceAll("_", "-")}`);
      if (!input || document.activeElement === input) continue;
      if (input instanceof HTMLInputElement && input.type === "checkbox") input.checked = Boolean(value);
      else if (input instanceof HTMLSelectElement) setSelectValue(input, value, name);
      else input.value = String(value);
    }
    this.updateButtons();
    const iq = typeof this.state.iq_module === "string" ? ` on ${this.state.iq_module}` : "";
    const stateLabel = `${String(this.state.running_state ?? "stopped")}${iq}`;
    this.status.textContent = this.lastProgress ? `${this.lastProgress}, ${stateLabel}` : stateLabel;
    if (this.subscriptionEnabled) this.connectSocket();
    else this.closeSocket();
  }

  setSubscriptionEnabled(enabled: boolean): void {
    this.subscriptionEnabled = enabled;
    this.applyState({});
  }

  setReadOnly(readOnly: boolean): void {
    this.readOnly = readOnly;
    this.saveButton.textContent = readOnly ? "Download CSV" : "Save Curve";
    this.updateButtons();
  }

  private updateButtons(): void {
    const mode = String(this.state.running_state ?? "stopped");
    const running = mode.startsWith("running_"), paused = mode.startsWith("paused_");
    this.runButton.textContent = running ? "Pause" : paused ? "Resume" : "Continuous";
    this.singleButton.disabled = this.readOnly || this.actionPending;
    this.runButton.disabled = this.readOnly || this.actionPending;
    this.stopButton.disabled = this.readOnly || this.actionPending || (!running && !paused);
    this.saveButton.disabled = this.savePending || !Number.isFinite(this.x[0]);
  }

  getViewState() {
    const ranges = (plot: uPlot) => ({ x: { min: plot.scales.x.min, max: plot.scales.x.max }, y: { min: plot.scales.y.min, max: plot.scales.y.max } });
    return { magnitude: ranges(this.magnitudePlot), phase: ranges(this.phasePlot), zeroSpan: this.zeroSpan, logscale: this.logscale };
  }

  refreshLayout(): void {
    this.ensureSplit();
    this.scheduleResize();
  }

  getCurveData(): { x: number[]; real: number[]; imaginary: number[] } | null {
    const count = contiguousFiniteCount(this.x);
    if (!count) return null;
    return {
      x: this.x.slice(0, count),
      real: this.real.slice(0, count),
      imaginary: this.imaginary.slice(0, count),
    };
  }

  destroy(): void {
    if (this.redrawFrame !== null) cancelAnimationFrame(this.redrawFrame);
    if (this.resizeFrame !== null) cancelAnimationFrame(this.resizeFrame);
    this.closeSocket();
    this.resizeObserver.disconnect();
    this.split?.destroy();
    this.magnitudePlot.destroy();
    this.phasePlot.destroy();
  }

  private bindActions(): void {
    this.singleButton.addEventListener("click", () => void this.start("single"));
    this.runButton.addEventListener("click", () => {
      const state = String(this.state.running_state);
      void this.start(state.startsWith("running_") ? "pause" : state.startsWith("paused_") ? "resume" : "continuous");
    });
    this.stopButton.addEventListener("click", () => void this.stop());
    this.saveButton.addEventListener("click", () => {
      if (this.readOnly) {
        this.downloadCsv();
        return;
      }
      this.savePending = true;
      this.updateButtons();
      void this.persistCurve()
        .then(csv => {
          this.downloadCsv(csv);
          this.status.textContent = "Curve saved";
        })
        .catch((error: Error) => { reportError(this.status, error.message); })
        .finally(() => { this.savePending = false; this.updateButtons(); });
    });
    this.resetButton.addEventListener("click", () => this.resetZoom());
  }

  private ensureSplit(): void {
    if (this.split || this.controlsPane.closest<HTMLElement>(".workspace-panel")?.hidden) return;
    this.split = accessibleSplit([this.controlsPane, this.plotsPane], {
      direction: "vertical",
      sizes: [34, 66],
      minSize: [100, 240],
      gutterSize: 8,
      onDrag: () => this.scheduleResize(),
      onDragEnd: () => this.scheduleResize(),
    });
  }

  private async start(action: "single" | "continuous" | "pause" | "resume" | "stop"): Promise<void> {
    if (this.readOnly || this.actionPending) return;
    this.actionPending = true;
    this.updateButtons();
    try {
      await requestJson(`/api/modules/networkanalyzer/actions/${action}`, { method: "POST" });
      // A short sweep can finish before the action response arrives. Its state
      // describes the start of the action and can overwrite a newer stop event.
      const payload = await requestJson("/api/modules/networkanalyzer", { method: "GET" });
      this.applyState(payload.state ?? {});
    } catch (error) {
      reportError(this.status, String((error as Error).message ?? error));
    } finally {
      this.actionPending = false;
      this.updateButtons();
    }
  }

  private async stop(): Promise<void> {
    await this.start("stop"); // Keep the visible subscription, including on failure.
  }

  private connectSocket(): void {
    this.wantsConnection = true;
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;
    this.reconnectScheduler.cancel(false);
    this.openSocket();
  }

  private openSocket(): void {
    if (!this.wantsConnection || (this.socket && this.socket.readyState <= WebSocket.OPEN)) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/networkanalyzer`);
    this.socket = socket;
    socket.addEventListener("open", () => {
      if (this.socket === socket) this.reconnectScheduler.connected();
    });
    socket.addEventListener("message", (event) => {
      if (this.socket !== socket) return;
      try {
        const message = JSON.parse(String(event.data));
        if (message.error) throw new Error(String(message.error));
        if (Array.isArray(message.snapshot)) {
          // A replay is authoritative, including after a server restart or lost points.
          this.x = []; this.runId = -1;
          for (const point of message.snapshot) this.showPoint(point as PointMessage);
          this.scheduleRedraw();
          this.updateButtons();
        } else this.showPoint(message as PointMessage);
      } catch (error) { reportError(this.status, String((error as Error).message ?? error)); }
    });
    socket.addEventListener("close", (event) => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (this.wantsConnection) {
        if (event.code === 1011) reportError(this.status, event.reason || "Network Analyzer acquisition failed");
        const delay = this.reconnectScheduler.schedule();
        this.status.textContent = `Network Analyzer stream closed; reconnecting${delay === null ? "" : ` in ${delay} ms`}`;
      }
    });
  }

  private closeSocket(): void {
    this.wantsConnection = false;
    this.reconnectScheduler.cancel();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
  }

  private showPoint(point: PointMessage): void {
    if (!Number.isInteger(point.points) || point.points < 1 || !Number.isInteger(point.index) || point.index < 0 || point.index >= point.points) return;
    if (point.run_id !== this.runId || this.x.length !== point.points) {
      this.runId = point.run_id;
      this.x = new Array(point.points).fill(Number.NaN);
      this.magnitude = new Array(point.points).fill(Number.NaN);
      this.phase = new Array(point.points).fill(Number.NaN);
      this.real = new Array(point.points).fill(Number.NaN);
      this.imaginary = new Array(point.points).fill(Number.NaN);
      this.captureParameters = { ...this.state };
    }
    this.x[point.index] = point.x;
    const value = Math.hypot(point.real, point.imag);
    this.magnitude[point.index] = 20 * Math.log10(Math.max(value, 1e-20));
    this.phase[point.index] = Math.atan2(point.imag, point.real) * 180 / Math.PI;
    this.real[point.index] = point.real;
    this.imaginary[point.index] = point.imag;
    if (point.settings) this.captureParameters = { ...point.settings };
    const logscale = Boolean(point.logscale && !point.zero_span);
    if (this.logscale !== logscale || this.zeroSpan !== Boolean(point.zero_span)) {
      this.logscale = logscale;
      this.zeroSpan = Boolean(point.zero_span);
      this.recreatePlots();
    }
    this.scheduleRedraw();
    this.updateButtons();
    const rate = point.time_per_point > 0 ? `${formatNumber(point.time_per_point * 1e3)} ms/point` : "";
    this.lastProgress = `${point.index + 1}/${point.points}, average ${point.current_avg}${rate ? `, ${rate}` : ""}`;
    this.status.textContent = this.lastProgress;
  }

  private renderControls(attributes: AttributeSchema[]): void {
    this.controlsHost.textContent = "";
    const groups: Array<[string, string[]]> = [
      ["Channels", ["input", "output_direct"]],
      ["Frequency", ["start_freq", "stop_freq", "points", "logscale"]],
      ["Setup", ["amplitude", "acbandwidth"]],
      ["Averaging", ["average_per_point", "rbw", "trace_average", "curve_name"]],
      ["Auto Bandwidth", ["auto_bandwidth", "q_factor_min"]],
      ["Auto Amplitude", ["auto_amplitude", "target_dbv", "auto_amp_min", "auto_amp_max"]],
    ];
    const byName = new Map(attributes.map((attribute) => [attribute.name, attribute]));
    for (const [title, names] of groups) {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "network-control-group";
      const legend = document.createElement("legend");
      legend.textContent = title;
      fieldset.appendChild(legend);
      for (const name of names) {
        const attribute = byName.get(name);
        if (attribute) fieldset.appendChild(this.createControl(attribute));
      }
      this.controlsHost.appendChild(fieldset);
    }
  }

  private createControl(attribute: AttributeSchema): HTMLElement {
    const label = document.createElement("label");
    const title = document.createElement("span");
    const unit = ({ start_freq: "Hz", stop_freq: "Hz", rbw: "Hz", acbandwidth: "Hz", amplitude: "Vpk", auto_amp_min: "Vpk", auto_amp_max: "Vpk" } as Record<string, string>)[attribute.name];
    title.textContent = attribute.label + (unit ? ` (${unit})` : "");
    label.appendChild(title);
    let input: HTMLInputElement | HTMLSelectElement;
    if (attribute.type === "select") {
      const select = document.createElement("select");
      for (const value of attribute.options ?? []) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = optionLabel(attribute.name, value);
        select.appendChild(option);
      }
      setSelectValue(select, attribute.value, attribute.name);
      input = select;
    } else {
      const field = document.createElement("input");
      field.type = attribute.type === "bool" ? "checkbox" : attribute.type;
      if (field.type === "checkbox") field.checked = Boolean(attribute.value);
      else field.value = String(attribute.value);
      if (attribute.min !== undefined) field.min = String(attribute.min);
      if (attribute.max !== undefined) field.max = String(attribute.max);
      if (attribute.type === "number") field.step = attribute.step === undefined ? "any" : String(attribute.step);
      input = field;
    }
    input.id = `networkanalyzer-${attribute.name.replaceAll("_", "-")}`;
    input.addEventListener("change", () => {
      void this.writeAttribute(attribute, input).catch(error => reportError(this.status, String(error.message ?? error)));
    });
    label.appendChild(input);
    return label;
  }

  private async writeAttribute(attribute: AttributeSchema, input: HTMLInputElement | HTMLSelectElement): Promise<void> {
    if (this.readOnly) return;
    if (!input.checkValidity() || (attribute.type === "number" && (input.value.trim() === "" || !Number.isFinite(Number(input.value))))) {
      throw new Error(`Enter a valid ${attribute.label}`);
    }
    const submitted = input instanceof HTMLInputElement && input.type === "checkbox" ? input.checked : input.value;
    const value = input instanceof HTMLInputElement && input.type === "checkbox"
      ? input.checked
      : attribute.type === "number" ? Number(input.value) : input.value;
    const payload = await requestJson(`/api/modules/networkanalyzer/attributes/${attribute.name}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    });
    this.state[attribute.name] = payload.value;
    const current = input instanceof HTMLInputElement && input.type === "checkbox" ? input.checked : input.value;
    if (current === submitted && payload.value !== undefined) {
      if (input instanceof HTMLInputElement && input.type === "checkbox") input.checked = Boolean(payload.value);
      else if (input instanceof HTMLSelectElement) setSelectValue(input, payload.value, attribute.name);
      else input.value = String(payload.value);
    }
    this.status.textContent = `${attribute.label} updated`;
  }

  private createPlot(host: HTMLElement, title: string, unit: string): uPlot {
    return createThemedPlot({
      width: 800,
      height: 260,
      title,
      scales: { x: { time: false, distr: this.logscale ? 3 : 1 }, y: { auto: true } },
      axes: [plotAxis({ label: this.zeroSpan ? "Elapsed time (s)" : "Frequency (Hz)" }), plotAxis({ label: unit })],
      series: [{}, { label: title, stroke: PLOT_COLORS.yellow, width: 1.5 }],
      cursor: { drag: { x: true, y: true, setScale: true } },
      hooks: { setScale: [(plot, key) => {
        if (this.updatingPlots || !plot.data[0]?.length) return;
        if (key === "y") this.manualY.add(plot);
        if (key === "x") {
          this.manualX = true;
          const other = plot === this.magnitudePlot ? this.phasePlot : this.magnitudePlot;
          if (other) {
            this.updatingPlots = true;
            try { other.batch(() => other.setScale("x", { min: plot.scales.x.min!, max: plot.scales.x.max! })); }
            finally { this.updatingPlots = false; }
          }
        }
      }] },
    }, [[], []], host);
  }

  private recreatePlots(): void {
    const savedY = [this.magnitudePlot, this.phasePlot].map(plot => this.manualY.has(plot) ? { min: plot.scales.y.min!, max: plot.scales.y.max! } : null);
    this.magnitudePlot.destroy();
    this.phasePlot.destroy();
    this.magnitudePlot = this.createPlot(this.magnitudeHost, "Magnitude (dB)", "dB");
    this.phasePlot = this.createPlot(this.phaseHost, "Phase (deg)", "deg");
    this.manualX = false; // Switching between time/frequency or linear/log requires a new X domain.
    this.manualY.clear();
    [this.magnitudePlot, this.phasePlot].forEach((plot, index) => {
      if (savedY[index]) { plot.setScale("y", savedY[index]!); this.manualY.add(plot); }
    });
    this.scheduleResize();
  }

  private scheduleRedraw(): void {
    if (this.redrawFrame !== null) return;
    this.redrawFrame = requestAnimationFrame(() => {
      this.redrawFrame = null;
      const count = contiguousFiniteCount(this.x);
      const indices = Array.from({ length: count }, (_, index) => index).sort((a, b) => this.x[a] - this.x[b]);
      const x = indices.map(index => this.x[index]); // uPlot requires ascending X, including descending sweeps.
      this.updatingPlots = true;
      try {
        for (const [plot, values] of [[this.magnitudePlot, this.magnitude], [this.phasePlot, this.phase]] as const) {
          plot.batch(() => {
            const y = indices.map(index => values[index]);
            plot.setData([x, y], false);
            if (!this.manualX) plot.setScale("x", finiteRange(x, this.logscale ? 0.03 : 0, 1, this.logscale));
            if (!this.manualY.has(plot)) plot.setScale("y", finiteRange(y, plot === this.phasePlot ? -180 : -120, plot === this.phasePlot ? 180 : 20));
          });
        }
      } finally { this.updatingPlots = false; }
    });
  }

  private scheduleResize(): void {
    if (this.resizeFrame !== null) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.resizePlot(this.magnitudePlot, this.magnitudeHost);
      this.resizePlot(this.phasePlot, this.phaseHost);
    });
  }

  private resizePlot(plot: uPlot, host: HTMLElement): void {
    if (host.parentElement) fitPlotToFrame(plot, host.parentElement);
  }

  private resetZoom(): void {
    this.manualX = false;
    this.manualY.clear();
    this.scheduleRedraw();
  }

  private exportCsv(): string {
    const lines = [`${this.zeroSpan ? "elapsed_time_s" : "frequency_Hz"},magnitude_db,phase_deg,real,imaginary`];
    for (let index = 0; index < this.x.length; index += 1) {
      if (Number.isFinite(this.x[index])) lines.push(`${this.x[index]},${this.magnitude[index]},${this.phase[index]},${this.real[index]},${this.imaginary[index]}`);
    }
    return `${lines.join("\n")}\n`;
  }

  private downloadCsv(csv?: string): void {
    if (!csv && !contiguousFiniteCount(this.x)) { reportError(this.status, "No network analyzer curve to download"); return; }
    const url = URL.createObjectURL(new Blob([csv ?? this.exportCsv()], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `network-analyzer-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async persistCurve(): Promise<string> {
    const count = contiguousFiniteCount(this.x);
    if (count === 0) throw new Error("No network analyzer curve to save");
    const nameInput = this.controlsHost.querySelector<HTMLInputElement>("#networkanalyzer-curve-name");
    const csv = this.exportCsv();
    await requestJson("/api/curves", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        x: this.x.slice(0, count),
        y: this.real.slice(0, count),
        y_imag: this.imaginary.slice(0, count),
        params: {
          ...this.captureParameters,
          zero_span: this.zeroSpan,
          x_unit: this.zeroSpan ? "s" : "Hz",
          name: nameInput?.value || "networkanalyzer curve",
          module: "networkanalyzer",
        },
      }),
    });
    return csv;
  }

}

async function requestJson(url: string, options: RequestInit): Promise<Record<string, any>> {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Network analyzer request failed (${response.status})`);
  return payload;
}

function formatNumber(value: number): string {
  return value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);
}

function finiteRange(values: number[], fallbackMin: number, fallbackMax: number, logarithmic = false): { min: number; max: number } {
  let min = Infinity, max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value) || (logarithmic && value <= 0)) continue;
    min = Math.min(min, value); max = Math.max(max, value);
  }
  if (!Number.isFinite(min)) return { min: fallbackMin, max: fallbackMax };
  if (logarithmic) return { min: min / 1.1, max: max * 1.1 };
  if (min === max) return { min: min - 1, max: max + 1 };
  const padding = (max - min) * 0.04;
  return { min: min - padding, max: max + padding };
}

function contiguousFiniteCount(values: number[]): number {
  let count = 0;
  while (count < values.length && Number.isFinite(values[count])) count += 1;
  return count;
}
