import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis } from "./plot-theme";
import type { SpectrumFrame, SpectrumSeries, SpectrumSettings } from "./spectrum-fft";

type StatusCallback = (message: string) => void;

export type { SpectrumFrame, SpectrumSeries, SpectrumSettings } from "./spectrum-fft";

interface SpectrumWorkerResponse {
  id: number;
  generation: number;
  frame?: SpectrumFrame;
  error?: string;
}

const EMPTY_DATA: uPlot.AlignedData = [new Float64Array(0), new Float32Array(0)];
export class SpectrumPlot {
  private socket: WebSocket | null = null;
  private retiredSockets = new WeakSet<WebSocket>();
  private plot: uPlot;
  private latestFrame: SpectrumFrame | null = null;
  private latestCurveFrame: SpectrumFrame | null = null;
  private pendingFrame: SpectrumFrame | null = null;
  private panState:
    | { startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number }
    | null = null;
  private zoomState:
    | { startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number }
    | null = null;
  private plotSize = { width: 0, height: 0 };
  private resizeFrame: number | null = null;
  private renderFrame: number | null = null;
  private labels: string[] = ["Spectrum"];
  private unit = "";
  private averagedFrame: SpectrumFrame | null = null;
  private currentAverage = 0;
  private readonly fftWorker = new Worker(new URL("./spectrum-worker.ts", import.meta.url), { type: "module" });
  private workerRequestId = 0;
  private workerGeneration = 0;
  private settings: SpectrumSettings = {
    baseband: true,
    span: 976562.5,
    center: 0,
    window: "blackman",
    displayUnit: "dB(Vpk^2)",
    displayInput1Baseband: true,
    displayInput2Baseband: true,
    displayCrossAmplitude: true,
    traceAverage: 1,
    runningState: "stopped",
    iqBandwidth: [],
  };
  private readonly resizeListener = () => this.scheduleResize();

  constructor(
    private host: HTMLElement,
    private setStatus: StatusCallback,
    private setCurrentAverage: (currentAverage: number) => void = () => undefined,
    private sampleCount = 16_384,
  ) {
    this.plot = new uPlot(this.options("", this.labels), EMPTY_DATA, this.host);
    this.fftWorker.onmessage = (event: MessageEvent<SpectrumWorkerResponse>) => this.handleWorkerResponse(event.data);
    this.fftWorker.onerror = () => this.setStatus("Spectrum FFT worker error");
    window.addEventListener("resize", this.resizeListener);
    this.bindInteractions();
    this.scheduleResize();
  }

  setSettings(state: Record<string, unknown>): void {
    const nextSettings = {
      ...this.settings,
      baseband: Boolean(state.baseband ?? this.settings.baseband),
      span: Number(state.span ?? this.settings.span),
      center: Number(state.center ?? this.settings.center),
      window: String(state.window ?? this.settings.window),
      displayUnit: String(state.display_unit ?? this.settings.displayUnit),
      displayInput1Baseband: Boolean(state.display_input1_baseband ?? this.settings.displayInput1Baseband),
      displayInput2Baseband: Boolean(state.display_input2_baseband ?? this.settings.displayInput2Baseband),
      displayCrossAmplitude: Boolean(state.display_cross_amplitude ?? this.settings.displayCrossAmplitude),
      traceAverage: Math.max(1, Math.floor(Number(state.trace_average ?? this.settings.traceAverage))),
      runningState: String(state.running_state ?? this.settings.runningState),
      iqBandwidth: Array.isArray(state.iq_bandwidth)
        ? state.iq_bandwidth.map(Number).filter(Number.isFinite)
        : this.settings.iqBandwidth,
    };
    const displayUnitChanged = nextSettings.displayUnit !== this.settings.displayUnit;
    const visibilityChanged =
      nextSettings.displayInput1Baseband !== this.settings.displayInput1Baseband ||
      nextSettings.displayInput2Baseband !== this.settings.displayInput2Baseband ||
      nextSettings.displayCrossAmplitude !== this.settings.displayCrossAmplitude;
    const completingSingle = this.settings.runningState === "running_single" && nextSettings.runningState === "stopped";
    if (!completingSingle && spectrumAveragingKey(nextSettings) !== spectrumAveragingKey(this.settings)) {
      this.resetAveraging();
    }
    this.settings = nextSettings;
    if ((displayUnitChanged || visibilityChanged) && this.averagedFrame) {
      this.pendingFrame = displaySpectrumFrame(this.averagedFrame, this.settings);
      this.scheduleRender();
    }
  }

  resetAveraging(): void {
    this.workerGeneration += 1;
    this.averagedFrame = null;
    this.pendingFrame = null;
    this.currentAverage = 0;
    this.setCurrentAverage(0);
  }

  getAverageCount(): number {
    return this.currentAverage;
  }

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host || "127.0.0.1:8000";
    const socket = new WebSocket(`${protocol}://${host}/ws/spectrumanalyzer?samples=${this.sampleCount}`);
    this.socket = socket;
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
      if (this.socket === socket) this.setStatus("Spectrum stream connected");
    };
    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      if (!this.retiredSockets.has(socket)) {
        this.setStatus("Spectrum stream closed");
      }
    };
    socket.onerror = () => {
      if (this.socket === socket) this.setStatus("Spectrum stream error");
    };
    socket.onmessage = (event) => {
      if (this.socket !== socket) return;
      if (event.data instanceof ArrayBuffer) {
        this.showScopeBuffer(event.data);
      }
    };
  }

  close(): void {
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      this.retiredSockets.add(socket);
      socket.close();
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState <= WebSocket.OPEN;
  }

  showScopeBuffer(buffer: ArrayBuffer): void {
    this.workerRequestId += 1;
    this.fftWorker.postMessage(
      {
        id: this.workerRequestId,
        generation: this.workerGeneration,
        buffer,
        settings: { ...this.settings, iqBandwidth: [...this.settings.iqBandwidth] },
      },
      [buffer],
    );
  }

  private handleWorkerResponse(response: SpectrumWorkerResponse): void {
    if (response.generation !== this.workerGeneration) return;
    if (response.error || !response.frame) {
      this.setStatus(response.error ?? "Invalid spectrum frame");
      return;
    }
    const frame = response.frame;
    const averaged = this.averageFrame(frame);
    this.setCurrentAverage(this.currentAverage);
    this.latestCurveFrame = averaged;
    this.pendingFrame = displaySpectrumFrame(averaged, this.settings);
    this.scheduleRender();
    this.setStatus(`Spectrum frame ${frame.sequence}, ${frame.x.length} bins, RBW ${formatCompactNumber(frame.rbw)} Hz`);
  }

  refreshLayout(): void {
    this.scheduleResize();
    this.plot.redraw(true, true);
  }

  destroy(): void {
    this.close();
    window.removeEventListener("resize", this.resizeListener);
    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }
    if (this.renderFrame !== null) {
      cancelAnimationFrame(this.renderFrame);
      this.renderFrame = null;
    }
    this.workerGeneration += 1;
    this.fftWorker.terminate();
    this.plot.destroy();
  }

  getSeriesCount(): number {
    return this.latestFrame?.series.length ?? 0;
  }

  getBinCount(): number {
    return this.latestFrame?.x.length ?? 0;
  }

  exportCsv(): string {
    if (!this.latestFrame) {
      return "frequency\n";
    }
    const labels = this.latestFrame.series.map((series) => series.label);
    const lines = [`frequency,${labels.join(",")}`];
    for (let index = 0; index < this.latestFrame.x.length; index += 1) {
      lines.push(
        [
          this.latestFrame.x[index],
          ...this.latestFrame.series.map((series) => series.values[index] ?? ""),
        ].join(","),
      );
    }
    return `${lines.join("\n")}\n`;
  }

  getCurveData(): {
    x: number[];
    series: Array<{ label: string; values: number[]; imaginary?: number[] }>;
    unit: string;
  } | null {
    if (!this.latestCurveFrame) return null;
    const selectedSeries = displayedBasebandSeries(this.latestCurveFrame.series, this.settings);
    return {
      x: Array.from(this.latestCurveFrame.x),
      series: selectedSeries.map((series) => ({
        label: series.label,
        values: Array.from(series.values),
        ...(series.imaginary ? { imaginary: Array.from(series.imaginary) } : {}),
      })),
      unit: "Vpk^2",
    };
  }

  getCurveParameters(): Record<string, unknown> {
    return {
      baseband: this.settings.baseband,
      span: this.settings.span,
      center: this.settings.center,
      window: this.settings.window,
      display_unit: this.settings.displayUnit,
      trace_average: this.settings.traceAverage,
      display_input1_baseband: this.settings.displayInput1Baseband,
      display_input2_baseband: this.settings.displayInput2Baseband,
      display_cross_amplitude: this.settings.displayCrossAmplitude,
    };
  }

  downloadCsv(filename: string): void {
    const blob = new Blob([this.exportCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  resetZoom(): void {
    if (!this.latestFrame) {
      return;
    }
    this.plot.batch(() => {
      this.plot.setScale("x", this.defaultXScale(this.latestFrame!));
      this.plot.setScale("y", this.defaultYScale(this.latestFrame!));
    });
  }

  zoom(factor: number): void {
    const { min, max } = this.getXRange();
    const center = (min + max) / 2;
    const span = Math.max(this.minimumXSpan(), (max - min) * factor);
    this.setXScale(center - span / 2, center + span / 2);
  }

  zoomY(factor: number): void {
    const { min, max } = this.getYRange();
    const center = (min + max) / 2;
    const span = Math.max(1e-12, (max - min) * factor);
    this.setYScale(center - span / 2, center + span / 2);
  }

  panX(fraction: number): void {
    const { min, max } = this.getXRange();
    const shift = (max - min) * fraction;
    this.setXScale(min + shift, max + shift);
  }

  panY(fraction: number): void {
    const { min, max } = this.getYRange();
    const shift = (max - min) * fraction;
    this.setYScale(min + shift, max + shift);
  }

  getXRange(): { min: number; max: number } {
    const xScale = this.plot.scales.x;
    return {
      min: Number(xScale.min ?? 0),
      max: Number(xScale.max ?? this.currentMaxX()),
    };
  }

  getYRange(): { min: number; max: number } {
    const yScale = this.plot.scales.y;
    return {
      min: Number(yScale.min ?? -120),
      max: Number(yScale.max ?? 20),
    };
  }

  private options(unit: string, labels: string[]): uPlot.Options {
    return {
      width: 900,
      height: 420,
      padding: [8, 10, 0, 0],
      legend: { show: true, live: true },
      cursor: {
        drag: { x: false, y: false, setScale: false },
        focus: { prox: 24 },
        points: { size: 5 },
      },
      scales: {
        x: { time: false, auto: false },
        y: { auto: false },
      },
      axes: [
        plotAxis({ label: "Frequency (Hz)" }),
        plotAxis({ label: unit }),
      ],
      series: [
        {},
        ...labels.map((label, index) => ({
          label,
          stroke: index === 0 ? PLOT_COLORS.green : index === 1 ? PLOT_COLORS.blue : PLOT_COLORS.yellow,
          width: 1.4,
          points: { show: false },
        })),
      ],
    };
  }

  private scheduleRender(): void {
    if (this.renderFrame !== null) {
      return;
    }
    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = null;
      this.renderPendingFrame();
    });
  }

  private renderPendingFrame(): void {
    if (!this.pendingFrame) {
      return;
    }
    const frame = this.pendingFrame;
    this.pendingFrame = null;
    const labels = frame.series.map((series) => series.label);
    const labelsChanged = labels.join("\0") !== this.labels.join("\0");
    const unitChanged = frame.unit !== this.unit;
    const firstFrame = this.latestFrame === null;
    this.latestFrame = frame;
    if (labelsChanged || unitChanged) {
      this.labels = labels.length ? labels : ["Spectrum"];
      this.unit = frame.unit;
      this.plot.destroy();
      this.plot = new uPlot(this.options(frame.unit, this.labels), this.frameData(frame), this.host);
      this.bindInteractions();
      this.scheduleResize();
    } else {
      this.plot.setData(this.frameData(frame), false);
    }
    if (firstFrame || labelsChanged || unitChanged) {
      this.resetZoom();
    }
    this.plot.redraw(true, true);
  }

  private frameData(frame: SpectrumFrame): uPlot.AlignedData {
    return frame.x.length && frame.series.length
      ? [frame.x, ...frame.series.map((series) => series.values)]
      : EMPTY_DATA;
  }

  private averageFrame(frame: SpectrumFrame): SpectrumFrame {
    const targetAverage = Math.max(1, this.settings.traceAverage);
    const canReuse =
      this.averagedFrame &&
      this.averagedFrame.x.length === frame.x.length &&
      this.averagedFrame.series.length === frame.series.length &&
      this.averagedFrame.series.every((series, index) =>
        series.values.length === frame.series[index].values.length &&
        Boolean(series.imaginary) === Boolean(frame.series[index].imaginary) &&
        (!series.imaginary || series.imaginary.length === frame.series[index].imaginary!.length),
      );
    if (targetAverage <= 1 || !canReuse) {
      this.averagedFrame = cloneSpectrumFrame(frame);
      this.currentAverage = 1;
      return frame;
    }
    const nextAverage = Math.min(this.currentAverage + 1, targetAverage);
    const priorWeight = nextAverage - 1;
    const averagedSeries = frame.series.map((series, seriesIndex) => {
      const previous = this.averagedFrame!.series[seriesIndex].values;
      const values = new Float64Array(series.values.length);
      for (let index = 0; index < values.length; index += 1) {
        values[index] = (previous[index] * priorWeight + series.values[index]) / nextAverage;
      }
      let imaginary: Float64Array | undefined;
      if (series.imaginary) {
        const previousImaginary = this.averagedFrame!.series[seriesIndex].imaginary!;
        imaginary = new Float64Array(series.imaginary.length);
        for (let index = 0; index < imaginary.length; index += 1) {
          imaginary[index] = (previousImaginary[index] * priorWeight + series.imaginary[index]) / nextAverage;
        }
      }
      return { label: series.label, values, ...(imaginary ? { imaginary } : {}) };
    });
    this.averagedFrame = {
      ...frame,
      x: frame.x,
      series: averagedSeries,
    };
    this.currentAverage = nextAverage;
    return this.averagedFrame;
  }

  private scheduleResize(): void {
    if (this.resizeFrame !== null) {
      return;
    }
    this.resizeFrame = window.requestAnimationFrame(() => {
      this.resizeFrame = null;
      const width = Math.max(320, Math.floor(this.host.clientWidth));
      const height = Math.max(240, Math.floor(this.host.clientHeight));
      if (width === this.plotSize.width && height === this.plotSize.height) {
        return;
      }
      this.plotSize = { width, height };
      this.plot.setSize({ width, height });
    });
  }

  private bindInteractions(): void {
    const over = this.plot.over;
    over.addEventListener("contextmenu", (event) => event.preventDefault());
    over.addEventListener("pointerdown", (event) => {
      const { min: xMin, max: xMax } = this.getXRange();
      const { min: yMin, max: yMax } = this.getYRange();
      if (event.button === 0) {
        this.panState = { startX: event.clientX, startY: event.clientY, xMin, xMax, yMin, yMax };
        over.setPointerCapture(event.pointerId);
        over.classList.add("is-panning");
        return;
      }
      if (event.button !== 1 && event.button !== 2) {
        return;
      }
      this.zoomState = { startX: event.clientX, startY: event.clientY, xMin, xMax, yMin, yMax };
      over.setPointerCapture(event.pointerId);
      over.classList.add("is-zooming");
    });
    over.addEventListener("pointermove", (event) => {
      if (this.panState) {
        const width = Math.max(1, this.plot.bbox.width / (devicePixelRatio || 1));
        const height = Math.max(1, this.plot.bbox.height / (devicePixelRatio || 1));
        const xSpan = this.panState.xMax - this.panState.xMin;
        const ySpan = this.panState.yMax - this.panState.yMin;
        const deltaX = ((event.clientX - this.panState.startX) / width) * xSpan;
        const deltaY = ((event.clientY - this.panState.startY) / height) * ySpan;
        this.setXScale(this.panState.xMin - deltaX, this.panState.xMax - deltaX);
        this.setYScale(this.panState.yMin + deltaY, this.panState.yMax + deltaY);
      } else if (this.zoomState) {
        const deltaX = event.clientX - this.zoomState.startX;
        const deltaY = event.clientY - this.zoomState.startY;
        const xFactor = Math.exp(-deltaX / 260);
        const yFactor = Math.exp(deltaY / 260);
        this.zoomAroundStartScale(this.zoomState, xFactor, yFactor);
      }
    });
    const endInteraction = (event: PointerEvent) => {
      if (this.panState || this.zoomState) {
        try {
          over.releasePointerCapture(event.pointerId);
        } catch {
          // The pointer may already be released by the browser on cancel.
        }
      }
      this.panState = null;
      this.zoomState = null;
      over.classList.remove("is-panning");
      over.classList.remove("is-zooming");
    };
    over.addEventListener("pointerup", endInteraction);
    over.addEventListener("pointercancel", endInteraction);
    over.addEventListener("dblclick", () => this.resetZoom());
  }

  private setXScale(min: number, max: number): void {
    if (!this.latestFrame) {
      return;
    }
    const defaultScale = this.defaultXScale(this.latestFrame);
    const minimumSpan = this.minimumXSpan();
    const span = Math.min(defaultScale.max - defaultScale.min, Math.max(minimumSpan, max - min));
    let nextMin = min;
    let nextMax = min + span;
    if (nextMin < defaultScale.min) {
      nextMax += defaultScale.min - nextMin;
      nextMin = defaultScale.min;
    }
    if (nextMax > defaultScale.max) {
      nextMin -= nextMax - defaultScale.max;
      nextMax = defaultScale.max;
    }
    this.plot.setScale("x", { min: Math.max(defaultScale.min, nextMin), max: Math.min(defaultScale.max, nextMax) });
  }

  private setYScale(min: number, max: number): void {
    const span = Math.max(1e-12, max - min);
    this.plot.setScale("y", { min, max: min + span });
  }

  private minimumXSpan(): number {
    if (!this.latestFrame || this.latestFrame.x.length < 2) {
      return Number.EPSILON;
    }
    return Math.max(Number.EPSILON, Math.abs(this.latestFrame.x[this.latestFrame.x.length - 1] - this.latestFrame.x[0]) / 1024);
  }

  private zoomAroundStartScale(
    start: { xMin: number; xMax: number; yMin: number; yMax: number },
    xFactor: number,
    yFactor: number,
  ): void {
    const xCenter = (start.xMin + start.xMax) / 2;
    const yCenter = (start.yMin + start.yMax) / 2;
    const xSpan = Math.max(this.minimumXSpan(), (start.xMax - start.xMin) * xFactor);
    const ySpan = Math.max(1e-12, (start.yMax - start.yMin) * yFactor);
    this.setXScale(xCenter - xSpan / 2, xCenter + xSpan / 2);
    this.setYScale(yCenter - ySpan / 2, yCenter + ySpan / 2);
  }

  private currentMaxX(): number {
    return this.latestFrame && this.latestFrame.x.length ? this.latestFrame.x[this.latestFrame.x.length - 1] : 1;
  }

  private defaultXScale(frame: SpectrumFrame): { min: number; max: number } {
    if (!frame.x.length) {
      return { min: 0, max: 1 };
    }
    return { min: frame.x[0], max: frame.x[frame.x.length - 1] };
  }

  private defaultYScale(frame: SpectrumFrame): { min: number; max: number } {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const series of frame.series) {
      for (const value of series.values) {
        if (!Number.isFinite(value)) {
          continue;
        }
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    if (min === Number.POSITIVE_INFINITY || max === Number.NEGATIVE_INFINITY) {
      return { min: -120, max: 20 };
    }
    const pad = Math.max(1e-9, (max - min) * 0.08);
    return { min: min - pad, max: max + pad };
  }
}

function convertPower(power: Float64Array, unit: string, rbw: number): Float64Array {
  const values = new Float64Array(power.length);
  for (let index = 0; index < power.length; index += 1) {
    const safe = Math.max(power[index], Number.EPSILON);
    if (unit === "dB(Vpk^2)") {
      values[index] = 10 * Math.log10(safe);
    } else if (unit === "Vpk") {
      values[index] = Math.sqrt(safe);
    } else if (unit === "Vrms^2") {
      values[index] = safe / 2;
    } else if (unit === "dB(Vrms^2)") {
      values[index] = 10 * Math.log10(safe / 2 + Number.EPSILON);
    } else if (unit === "Vrms") {
      values[index] = Math.sqrt(safe) / Math.SQRT2;
    } else if (unit === "Vrms^2/Hz") {
      values[index] = safe / 2 / Math.max(rbw, Number.EPSILON);
    } else if (unit === "dB(Vrms^2/Hz)") {
      values[index] = 10 * Math.log10(safe / 2 / Math.max(rbw, Number.EPSILON) + Number.EPSILON);
    } else if (unit === "Vrms/sqrt(Hz)") {
      values[index] = Math.sqrt(safe) / Math.SQRT2 / Math.max(rbw, Number.EPSILON);
    } else {
      values[index] = safe;
    }
  }
  return values;
}

function cloneSpectrumFrame(frame: SpectrumFrame): SpectrumFrame {
  return {
    ...frame,
    x: frame.x,
    series: frame.series.map((series) => ({
      label: series.label,
      values: new Float64Array(series.values),
      ...(series.imaginary ? { imaginary: new Float64Array(series.imaginary) } : {}),
    })),
  };
}

function displaySpectrumFrame(frame: SpectrumFrame, settings: SpectrumSettings): SpectrumFrame {
  const series = displayedBasebandSeries(frame.series, settings);
  return {
    ...frame,
    unit: settings.displayUnit,
    series: series.map((series) => ({
      label: series.label,
      values: convertPower(
        series.imaginary ? complexMagnitude(series.values, series.imaginary) : series.values,
        settings.displayUnit,
        frame.rbw,
      ),
    })),
  };
}

function spectrumAveragingKey(settings: SpectrumSettings): string {
  return [
    settings.baseband,
    settings.span,
    settings.center,
    settings.window,
    settings.iqBandwidth.join(","),
  ].join("|");
}

function displayedBasebandSeries(series: SpectrumSeries[], settings: SpectrumSettings): SpectrumSeries[] {
  if (!settings.baseband) return series;
  return series.filter((item) =>
    item.label === "Input 1" ? settings.displayInput1Baseband
      : item.label === "Input 2" ? settings.displayInput2Baseband
        : item.label === "Cross" ? settings.displayCrossAmplitude
          : true,
  );
}

function complexMagnitude(real: Float64Array, imaginary: Float64Array): Float64Array {
  const magnitude = new Float64Array(real.length);
  for (let index = 0; index < magnitude.length; index += 1) {
    magnitude[index] = Math.hypot(real[index], imaginary[index]);
  }
  return magnitude;
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.abs(value) >= 1000 ? value.toExponential(3) : value.toFixed(3);
}
