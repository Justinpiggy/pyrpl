import uPlot from "uplot";
import Split from "split.js";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis } from "./plot-theme";
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
  private userScaled = false;
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
    this.magnitudePlot = this.createPlot(this.magnitudeHost, "Magnitude (dB)", "dB", true);
    this.phasePlot = this.createPlot(this.phaseHost, "Phase (deg)", "deg", false);
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
    const running = String(state.running_state ?? "stopped") !== "stopped";
    this.runButton.textContent = running ? "Running" : "Continuous";
    this.runButton.disabled = running;
    this.stopButton.disabled = !running;
    const iq = typeof state.iq_module === "string" ? ` on ${state.iq_module}` : "";
    const stateLabel = `${String(state.running_state ?? "stopped")}${iq}`;
    this.status.textContent = !running && this.lastProgress ? `${this.lastProgress}, ${stateLabel}` : stateLabel;
  }

  refreshLayout(): void {
    this.ensureSplit();
    this.scheduleResize();
  }

  destroy(): void {
    this.closeSocket();
    this.resizeObserver.disconnect();
    this.split?.destroy();
    this.magnitudePlot.destroy();
    this.phasePlot.destroy();
  }

  private bindActions(): void {
    this.singleButton.addEventListener("click", () => void this.start("single"));
    this.runButton.addEventListener("click", () => void this.start("continuous"));
    this.stopButton.addEventListener("click", () => void this.stop());
    this.saveButton.addEventListener("click", () => {
      void this.persistCurve()
        .then(() => {
          this.downloadCsv();
          this.status.textContent = "Curve saved";
        })
        .catch((error: Error) => { this.status.textContent = error.message; });
    });
    this.resetButton.addEventListener("click", () => this.resetZoom());
  }

  private ensureSplit(): void {
    if (this.split || this.controlsPane.closest<HTMLElement>(".workspace-panel")?.hidden) return;
    this.split = Split([this.controlsPane, this.plotsPane], {
      direction: "vertical",
      sizes: [34, 66],
      minSize: [100, 240],
      gutterSize: 8,
      onDrag: () => this.scheduleResize(),
      onDragEnd: () => this.scheduleResize(),
    });
  }

  private async start(action: "single" | "continuous"): Promise<void> {
    const response = await fetch(`/api/modules/networkanalyzer/actions/${action}`, { method: "POST" });
    if (!response.ok) {
      this.status.textContent = `Network analyzer ${action} failed: ${response.status}`;
      return;
    }
    const payload = await response.json();
    this.applyState(payload.state ?? {});
    this.connectSocket();
  }

  private async stop(): Promise<void> {
    const response = await fetch("/api/modules/networkanalyzer/actions/stop", { method: "POST" });
    if (response.ok) {
      const payload = await response.json();
      this.applyState(payload.state ?? {});
    }
    this.closeSocket();
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
      if (this.socket === socket) this.showPoint(JSON.parse(String(event.data)) as PointMessage);
    });
    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (this.wantsConnection) {
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
    if (point.run_id !== this.runId) {
      this.runId = point.run_id;
      this.x = new Array(point.points).fill(Number.NaN);
      this.magnitude = new Array(point.points).fill(Number.NaN);
      this.phase = new Array(point.points).fill(Number.NaN);
      this.real = new Array(point.points).fill(Number.NaN);
      this.imaginary = new Array(point.points).fill(Number.NaN);
      this.userScaled = false;
    }
    this.x[point.index] = point.x;
    const value = Math.hypot(point.real, point.imag);
    this.magnitude[point.index] = 20 * Math.log10(Math.max(value, 1e-20));
    this.phase[point.index] = Math.atan2(point.imag, point.real) * 180 / Math.PI;
    this.real[point.index] = point.real;
    this.imaginary[point.index] = point.imag;
    if (this.logscale !== point.logscale) {
      this.logscale = point.logscale;
      this.recreatePlots();
    }
    this.scheduleRedraw();
    const rate = point.time_per_point > 0 ? `${formatNumber(point.time_per_point * 1e3)} ms/point` : "";
    this.lastProgress = `${point.index + 1}/${point.points}, average ${point.current_avg}${rate ? `, ${rate}` : ""}`;
    this.status.textContent = this.lastProgress;
    if (point.running_state === "stopped") {
      this.closeSocket();
      this.runButton.disabled = false;
      this.stopButton.disabled = true;
    }
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
    title.textContent = attribute.label;
    label.appendChild(title);
    let input: HTMLInputElement | HTMLSelectElement;
    if (attribute.type === "select") {
      const select = document.createElement("select");
      for (const value of attribute.options ?? []) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value);
        select.appendChild(option);
      }
      select.value = String(attribute.value);
      input = select;
    } else {
      const field = document.createElement("input");
      field.type = attribute.type === "bool" ? "checkbox" : attribute.type;
      if (field.type === "checkbox") field.checked = Boolean(attribute.value);
      else field.value = String(attribute.value);
      if (attribute.min !== undefined) field.min = String(attribute.min);
      if (attribute.max !== undefined) field.max = String(attribute.max);
      if (attribute.step !== undefined) field.step = String(attribute.step);
      input = field;
    }
    input.id = `networkanalyzer-${attribute.name.replaceAll("_", "-")}`;
    input.addEventListener("change", () => void this.writeAttribute(attribute, input));
    label.appendChild(input);
    return label;
  }

  private async writeAttribute(attribute: AttributeSchema, input: HTMLInputElement | HTMLSelectElement): Promise<void> {
    const value = input instanceof HTMLInputElement && input.type === "checkbox"
      ? input.checked
      : attribute.type === "number" ? Number(input.value) : input.value;
    const response = await fetch(`/api/modules/networkanalyzer/attributes/${attribute.name}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      this.status.textContent = `${attribute.label} update failed: ${response.status}`;
      return;
    }
    this.closeSocket();
    this.runButton.disabled = false;
    this.stopButton.disabled = true;
    this.status.textContent = `${attribute.label} updated`;
  }

  private createPlot(host: HTMLElement, title: string, unit: string, showXAxis: boolean): uPlot {
    return new uPlot({
      width: 800,
      height: 260,
      title,
      scales: { x: { time: false, distr: this.logscale ? 3 : 1 }, y: { auto: true } },
      axes: [plotAxis({ label: showXAxis ? "Frequency (Hz)" : "" }), plotAxis({ label: unit })],
      series: [{}, { label: title, stroke: PLOT_COLORS.yellow, width: 1.5 }],
      cursor: { drag: { x: true, y: true, setScale: true } },
      hooks: { setScale: [(_plot, key) => { if (key === "x" || key === "y") this.userScaled = true; }] },
    }, [[], []], host);
  }

  private recreatePlots(): void {
    this.magnitudePlot.destroy();
    this.phasePlot.destroy();
    this.magnitudePlot = this.createPlot(this.magnitudeHost, "Magnitude (dB)", "dB", true);
    this.phasePlot = this.createPlot(this.phaseHost, "Phase (deg)", "deg", false);
    this.scheduleResize();
  }

  private scheduleRedraw(): void {
    if (this.redrawFrame !== null) return;
    this.redrawFrame = requestAnimationFrame(() => {
      this.redrawFrame = null;
      const count = contiguousFiniteCount(this.x);
      this.magnitudePlot.setData([this.x.slice(0, count), this.magnitude.slice(0, count)]);
      this.phasePlot.setData([this.x.slice(0, count), this.phase.slice(0, count)]);
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
    const frame = host.parentElement?.getBoundingClientRect();
    if (!frame || frame.width < 100 || frame.height < 100) return;
    plot.setSize({ width: Math.floor(frame.width), height: Math.floor(frame.height) });
  }

  private resetZoom(): void {
    this.userScaled = false;
    const x = finiteRange(this.x, 0, 1);
    const magnitude = finiteRange(this.magnitude, -120, 20);
    const phase = finiteRange(this.phase, -180, 180);
    this.magnitudePlot.setScale("x", x);
    this.magnitudePlot.setScale("y", magnitude);
    this.phasePlot.setScale("x", x);
    this.phasePlot.setScale("y", phase);
  }

  private downloadCsv(): void {
    const lines = ["x,magnitude_db,phase_deg"];
    for (let index = 0; index < this.x.length; index += 1) {
      if (Number.isFinite(this.x[index])) lines.push(`${this.x[index]},${this.magnitude[index]},${this.phase[index]}`);
    }
    const url = URL.createObjectURL(new Blob([`${lines.join("\n")}\n`], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `network-analyzer-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async persistCurve(): Promise<void> {
    const count = contiguousFiniteCount(this.x);
    if (count === 0) throw new Error("No network analyzer curve to save");
    const nameInput = this.controlsHost.querySelector<HTMLInputElement>("#networkanalyzer-curve-name");
    const response = await fetch("/api/curves", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        x: this.x.slice(0, count),
        y: this.real.slice(0, count),
        y_imag: this.imaginary.slice(0, count),
        params: {
          ...this.currentControlParameters(),
          name: nameInput?.value || "networkanalyzer curve",
          module: "networkanalyzer",
        },
      }),
    });
    if (!response.ok) throw new Error(`Save curve failed: ${response.status}`);
  }

  private currentControlParameters(): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    for (const input of this.controlsHost.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")) {
      const name = input.id.replace(/^networkanalyzer-/, "").replaceAll("-", "_");
      params[name] = input instanceof HTMLInputElement && input.type === "checkbox"
        ? input.checked
        : input instanceof HTMLInputElement && input.type === "number"
          ? Number(input.value)
          : input.value;
    }
    return params;
  }
}

function formatNumber(value: number): string {
  return value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);
}

function finiteRange(values: number[], fallbackMin: number, fallbackMax: number): { min: number; max: number } {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return { min: fallbackMin, max: fallbackMax };
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) return { min: min - 1, max: max + 1 };
  const padding = (max - min) * 0.04;
  return { min: min - padding, max: max + padding };
}

function contiguousFiniteCount(values: number[]): number {
  let count = 0;
  while (count < values.length && Number.isFinite(values[count])) count += 1;
  return count;
}
