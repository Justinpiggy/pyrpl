import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { parseScopeFrame } from "./scope-frame";

type StatusCallback = (message: string) => void;

export interface SpectrumSeries {
  label: string;
  values: Float32Array;
}

export interface SpectrumFrame {
  sequence: number;
  x: Float64Array;
  series: SpectrumSeries[];
  span: number;
  center: number;
  rbw: number;
  unit: string;
  running_state: string;
}

export interface SpectrumSettings {
  baseband: boolean;
  span: number;
  center: number;
  window: string;
  displayUnit: string;
  displayInput1Baseband: boolean;
  displayInput2Baseband: boolean;
  displayCrossAmplitude: boolean;
  traceAverage: number;
  runningState: string;
}

const EMPTY_DATA: uPlot.AlignedData = [new Float64Array(0), new Float32Array(0)];
const WINDOW_ENBW: Record<string, number> = {
  boxcar: 1.0,
  hamming: 1.36,
  blackman: 1.73,
  flattop: 3.77,
  gaussian: 1.45,
};

export class SpectrumPlot {
  private socket: WebSocket | null = null;
  private intentionalClose = false;
  private plot: uPlot;
  private latestFrame: SpectrumFrame | null = null;
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
  };
  private readonly resizeListener = () => this.scheduleResize();

  constructor(
    private host: HTMLElement,
    private setStatus: StatusCallback,
    private sampleCount = 4096,
  ) {
    this.plot = new uPlot(this.options("", this.labels), EMPTY_DATA, this.host);
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
    };
    if (spectrumAveragingKey(nextSettings) !== spectrumAveragingKey(this.settings)) {
      this.resetAveraging();
    }
    this.settings = nextSettings;
  }

  resetAveraging(): void {
    this.averagedFrame = null;
    this.currentAverage = 0;
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
    this.socket = new WebSocket(`${protocol}://${host}/ws/spectrumanalyzer?samples=${this.sampleCount}`);
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = () => this.setStatus("Spectrum stream connected");
    this.socket.onclose = () => {
      this.socket = null;
      if (!this.intentionalClose) {
        this.setStatus("Spectrum stream closed");
      }
      this.intentionalClose = false;
    };
    this.socket.onerror = () => this.setStatus("Spectrum stream error");
    this.socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.showScopeBuffer(event.data);
      }
    };
  }

  close(): void {
    this.intentionalClose = true;
    this.socket?.close();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState <= WebSocket.OPEN;
  }

  showScopeBuffer(buffer: ArrayBuffer): void {
    let frame: SpectrumFrame;
    try {
      frame = spectrumFromScopeBuffer(buffer, this.settings);
    } catch (error) {
      this.setStatus(error instanceof Error ? error.message : "Invalid spectrum frame");
      return;
    }
    this.pendingFrame = this.averageFrame(frame);
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
    this.plot.destroy();
  }

  getSeriesCount(): number {
    return this.latestFrame?.series.length ?? 0;
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
        { label: "Frequency (Hz)", stroke: "#9aacb6", grid: { stroke: "#1d272e", width: 1 } },
        { label: unit, stroke: "#9aacb6", grid: { stroke: "#1d272e", width: 1 } },
      ],
      series: [
        {},
        ...labels.map((label, index) => ({
          label,
          stroke: index === 0 ? "#4fd17f" : index === 1 ? "#62a8ff" : "#f2c94c",
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
      this.averagedFrame.series.every((series, index) => series.values.length === frame.series[index].values.length);
    if (targetAverage <= 1 || !canReuse) {
      this.averagedFrame = cloneSpectrumFrame(frame);
      this.currentAverage = 1;
      return frame;
    }
    const nextAverage = Math.min(this.currentAverage + 1, targetAverage);
    const priorWeight = nextAverage - 1;
    const averagedSeries = frame.series.map((series, seriesIndex) => {
      const previous = this.averagedFrame!.series[seriesIndex].values;
      const values = new Float32Array(series.values.length);
      for (let index = 0; index < values.length; index += 1) {
        values[index] = (previous[index] * priorWeight + series.values[index]) / nextAverage;
      }
      return { label: series.label, values };
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

function spectrumFromScopeBuffer(buffer: ArrayBuffer, settings: SpectrumSettings): SpectrumFrame {
  const frame = parseScopeFrame(buffer);
  const count = largestPowerOfTwo(frame.sampleCount);
  const window = spectrumWindow(settings.window, count);
  const ch1 = new Float64Array(count);
  const ch2 = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    ch1[index] = (frame.samples[index * frame.channelCount] ?? 0) * window[index];
    ch2[index] = (frame.samples[index * frame.channelCount + 1] ?? 0) * window[index];
  }
  const rbw = (WINDOW_ENBW[settings.window] ?? WINDOW_ENBW.blackman) * settings.span / Math.max(1, count);
  if (settings.baseband) {
    const fft1 = realFft(ch1);
    const fft2 = realFft(ch2);
    const x = new Float64Array(fft1.real.length);
    for (let index = 0; index < x.length; index += 1) {
      x[index] = index * settings.span / count;
    }
    const series: SpectrumSeries[] = [];
    if (settings.displayInput1Baseband) {
      series.push({ label: "Input 1", values: convertPower(powerSpectrum(fft1), settings.displayUnit, rbw) });
    }
    if (settings.displayInput2Baseband) {
      series.push({ label: "Input 2", values: convertPower(powerSpectrum(fft2), settings.displayUnit, rbw) });
    }
    if (settings.displayCrossAmplitude) {
      series.push({ label: "Cross", values: convertPower(crossPower(fft1, fft2), settings.displayUnit, rbw) });
    }
    return {
      sequence: frame.sequence,
      x,
      series,
      span: settings.span,
      center: settings.center,
      rbw,
      unit: settings.displayUnit,
      running_state: settings.runningState,
    };
  }

  const fft = complexFft(ch1, ch2);
  const shifted = fftShiftPower(fft);
  const x = new Float64Array(shifted.length);
  for (let index = 0; index < x.length; index += 1) {
    x[index] = settings.center + (index - shifted.length / 2) * settings.span / count;
  }
  return {
    sequence: frame.sequence,
    x,
    series: [{ label: "IQ", values: convertPower(shifted, settings.displayUnit, rbw) }],
    span: settings.span,
    center: settings.center,
    rbw,
    unit: settings.displayUnit,
    running_state: settings.runningState,
  };
}

function realFft(realInput: Float64Array): { real: Float64Array; imag: Float64Array } {
  const imagInput = new Float64Array(realInput.length);
  const fft = complexFft(realInput, imagInput);
  const half = realInput.length / 2 + 1;
  return {
    real: fft.real.slice(0, half),
    imag: fft.imag.slice(0, half),
  };
}

function complexFft(realInput: Float64Array, imagInput: Float64Array): { real: Float64Array; imag: Float64Array } {
  const n = realInput.length;
  const real = new Float64Array(realInput);
  const imag = new Float64Array(imagInput);
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = -2 * Math.PI / len;
    const wLenR = Math.cos(angle);
    const wLenI = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wr = 1;
      let wi = 0;
      for (let j = 0; j < len / 2; j += 1) {
        const even = i + j;
        const odd = even + len / 2;
        const ur = real[even];
        const ui = imag[even];
        const vr = real[odd] * wr - imag[odd] * wi;
        const vi = real[odd] * wi + imag[odd] * wr;
        real[even] = ur + vr;
        imag[even] = ui + vi;
        real[odd] = ur - vr;
        imag[odd] = ui - vi;
        const nextWr = wr * wLenR - wi * wLenI;
        wi = wr * wLenI + wi * wLenR;
        wr = nextWr;
      }
    }
  }
  return { real, imag };
}

function powerSpectrum(fft: { real: Float64Array; imag: Float64Array }): Float64Array {
  const power = new Float64Array(fft.real.length);
  for (let index = 0; index < power.length; index += 1) {
    power[index] = fft.real[index] * fft.real[index] + fft.imag[index] * fft.imag[index];
  }
  return power;
}

function crossPower(
  left: { real: Float64Array; imag: Float64Array },
  right: { real: Float64Array; imag: Float64Array },
): Float64Array {
  const power = new Float64Array(left.real.length);
  for (let index = 0; index < power.length; index += 1) {
    const real = left.real[index] * right.real[index] + left.imag[index] * right.imag[index];
    const imag = left.real[index] * right.imag[index] - left.imag[index] * right.real[index];
    power[index] = Math.hypot(real, imag);
  }
  return power;
}

function fftShiftPower(fft: { real: Float64Array; imag: Float64Array }): Float64Array {
  const power = powerSpectrum(fft);
  const shifted = new Float64Array(power.length);
  const half = Math.floor(power.length / 2);
  shifted.set(power.slice(half), 0);
  shifted.set(power.slice(0, half), power.length - half);
  return shifted;
}

function convertPower(power: Float64Array, unit: string, rbw: number): Float32Array {
  const values = new Float32Array(power.length);
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
      values[index] = Math.sqrt(safe / 2 / Math.max(rbw, Number.EPSILON));
    } else {
      values[index] = safe;
    }
  }
  return values;
}

function spectrumWindow(name: string, count: number): Float64Array {
  const values = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    const phase = count > 1 ? 2 * Math.PI * index / (count - 1) : 0;
    if (name === "boxcar") {
      values[index] = 1;
    } else if (name === "hamming") {
      values[index] = 0.54 - 0.46 * Math.cos(phase);
    } else if (name === "flattop") {
      values[index] =
        0.21557895 -
        0.41663158 * Math.cos(phase) +
        0.277263158 * Math.cos(2 * phase) -
        0.083578947 * Math.cos(3 * phase) +
        0.006947368 * Math.cos(4 * phase);
    } else if (name === "gaussian") {
      const center = (count - 1) / 2;
      const sigma = Math.max(1, count / 10);
      values[index] = Math.exp(-0.5 * ((index - center) / sigma) ** 2);
    } else {
      values[index] = 0.42 - 0.5 * Math.cos(phase) + 0.08 * Math.cos(2 * phase);
    }
  }
  const sum = values.reduce((total, value) => total + value, 0);
  const scale = sum ? 2 / sum : 1;
  for (let index = 0; index < values.length; index += 1) {
    values[index] *= scale;
  }
  return values;
}

function largestPowerOfTwo(value: number): number {
  return 2 ** Math.floor(Math.log2(Math.max(2, value)));
}

function cloneSpectrumFrame(frame: SpectrumFrame): SpectrumFrame {
  return {
    ...frame,
    x: frame.x,
    series: frame.series.map((series) => ({
      label: series.label,
      values: new Float32Array(series.values),
    })),
  };
}

function spectrumAveragingKey(settings: SpectrumSettings): string {
  return [
    settings.baseband,
    settings.span,
    settings.center,
    settings.window,
    settings.displayUnit,
    settings.displayInput1Baseband,
    settings.displayInput2Baseband,
    settings.displayCrossAmplitude,
  ].join("|");
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.abs(value) >= 1000 ? value.toExponential(3) : value.toFixed(3);
}
