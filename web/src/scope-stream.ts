import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis } from "./plot-theme";
import { evaluateScopeMath } from "./scope-math";
import { ReconnectScheduler } from "./websocket-reconnect";
import {
  averageFrameData,
  clampXRange,
  frameToData,
  parseScopeFrame,
  type ScopeFrame,
  type ScopeFrameData,
  type ScopeTimeSettings,
} from "./scope-frame";

const DEFAULT_SAMPLES = 2 ** 14;
const DEFAULT_Y_MIN = -1.1;
const DEFAULT_Y_MAX = 1.1;

type StatusCallback = (message: string) => void;
type AverageCallback = (current: number) => void;

export class ScopeStream {
  private socket: WebSocket | null = null;
  private wantsConnection = false;
  private reconnectScheduler: ReconnectScheduler;
  private plot: uPlot;
  private latestFrame: ScopeFrame | null = null;
  private receivedFrameCount = 0;
  private panState:
    | { startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number }
    | null = null;
  private zoomState:
    | { startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number }
    | null = null;
  private plotSize = { width: 0, height: 0 };
  private resizeFrame: number | null = null;
  private renderFrame: number | null = null;
  private pendingFrame: ScopeFrame | null = null;
  private averagedData: ScopeFrameData | null = null;
  private displayedData: ScopeFrameData | null = null;
  private currentAverage = 0;
  private traceAverage = 1;
  private timeSettings: ScopeTimeSettings | null = null;
  private channelVisible: [boolean, boolean] = [true, true];
  private xyMode = false;
  private mathActive = false;
  private mathFormula = "ch1 * ch2";
  private readonly resizeListener = () => this.scheduleResize();

  constructor(
    private plotHost: HTMLElement,
    private setStatus: StatusCallback,
    private setCurrentAverage: AverageCallback = () => undefined,
    private sampleCount = DEFAULT_SAMPLES,
  ) {
    this.reconnectScheduler = new ReconnectScheduler(() => this.openSocket());
    this.plot = new uPlot(this.options(), this.emptyData(), this.plotHost);
    window.addEventListener("resize", this.resizeListener);
    this.bindInteractions();
    this.scheduleResize();
  }

  connect(): void {
    this.wantsConnection = true;
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }
    this.reconnectScheduler.cancel(false);
    this.openSocket();
  }

  private openSocket(): void {
    if (!this.wantsConnection || (this.socket && this.socket.readyState <= WebSocket.OPEN)) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host || "127.0.0.1:8000";
    const socket = new WebSocket(`${protocol}://${host}/ws/scope?samples=${this.sampleCount}`);
    this.socket = socket;
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
      if (this.socket === socket) {
        this.reconnectScheduler.connected();
        this.setStatus("Scope stream connected");
      }
    };
    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
        if (this.wantsConnection) {
          const delay = this.reconnectScheduler.schedule();
          this.setStatus(`Scope stream closed; reconnecting${delay === null ? "" : ` in ${delay} ms`}`);
        } else {
          this.setStatus("Scope stream closed");
        }
      }
    };
    socket.onerror = () => {
      if (this.socket === socket) {
        this.setStatus("Scope stream error");
      }
    };
    socket.onmessage = (event) => {
      if (this.socket === socket && event.data instanceof ArrayBuffer) {
        this.handleFrame(event.data);
      }
    };
  }

  close(): void {
    this.wantsConnection = false;
    this.reconnectScheduler.cancel();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
  }

  reconnect(): void {
    if (!this.wantsConnection) return;
    this.reconnectScheduler.cancel();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.resetTraceAveraging();
    this.openSocket();
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState <= WebSocket.OPEN;
  }

  setSampleCount(sampleCount: number): void {
    this.sampleCount = Math.max(1, Math.floor(sampleCount));
    this.resetAveraging();
  }

  getSampleCount(): number {
    return this.sampleCount;
  }

  setTraceAverage(traceAverage: number): void {
    this.traceAverage = Math.max(1, Math.floor(traceAverage));
    this.resetAveraging();
  }

  resetTraceAveraging(): void {
    this.pendingFrame = null;
    this.resetAveraging();
  }

  getTraceAverage(): number {
    return this.traceAverage;
  }

  setTimeSettings(timeSettings: ScopeTimeSettings): void {
    this.timeSettings = timeSettings;
    this.resetAveraging();
    if (this.latestFrame && this.displayedData) {
      const frame = this.latestFrame;
      this.plot.setData(this.plotData(this.displayedData), false);
      this.plot.batch(() => {
        this.plot.setScale("x", this.defaultXScale(frame));
        this.resetYScale();
      });
      this.plot.redraw(true, true);
    }
  }

  setChannelVisible(channel: 1 | 2, visible: boolean): void {
    this.channelVisible[channel - 1] = visible;
    this.applySeriesVisibility();
  }

  getChannelVisible(channel: 1 | 2): boolean {
    return this.channelVisible[channel - 1];
  }

  setDisplaySettings(settings: { xyMode: boolean; mathActive: boolean; mathFormula: string }): void {
    const modeChanged = this.xyMode !== settings.xyMode;
    this.xyMode = settings.xyMode;
    this.mathActive = settings.mathActive;
    this.mathFormula = settings.mathFormula;
    this.applySeriesVisibility();
    if (this.latestFrame && this.displayedData) {
      const frame = this.latestFrame;
      this.plot.setData(this.plotData(this.displayedData), false);
      if (modeChanged) {
        this.plot.batch(() => {
          this.plot.setScale("x", this.defaultXScale(frame));
          this.resetYScale();
        });
      }
      this.plot.redraw(true, true);
    }
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

  showFrame(buffer: ArrayBuffer): void {
    this.handleFrame(buffer);
  }

  resetZoom(): void {
    if (!this.latestFrame) {
      return;
    }
    const frame = this.latestFrame;
    this.plot.batch(() => {
      this.plot.setScale("x", this.defaultXScale(frame));
      this.resetYScale();
    });
  }

  zoom(factor: number): void {
    const xScale = this.plot.scales.x;
    const min = Number(xScale.min ?? 0);
    const max = Number(xScale.max ?? this.currentMaxX());
    const center = (min + max) / 2;
    const span = Math.max(this.minimumXSpan(), (max - min) * factor);
    this.setXScale(center - span / 2, center + span / 2);
  }

  zoomY(factor: number): void {
    const { min, max } = this.getYRange();
    const center = (min + max) / 2;
    const span = Math.max(1e-6, (max - min) * factor);
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
      min: Number(yScale.min ?? DEFAULT_Y_MIN),
      max: Number(yScale.max ?? DEFAULT_Y_MAX),
    };
  }

  getFormattedTimeLabelsForCurrentRange(count = 6): string[] {
    const { min, max } = this.getXRange();
    const labelCount = Math.max(2, Math.floor(count));
    const step = (max - min) / (labelCount - 1);
    const ticks = Array.from({ length: labelCount }, (_value, index) => min + step * index);
    return this.formatTimeTicks(this.plot, ticks);
  }

  getFrameSequence(): number | null {
    return this.receivedFrameCount > 0 ? this.receivedFrameCount : null;
  }

  exportCsv(): string {
    if (!this.displayedData) {
      return "time,ch1,ch2\n";
    }
    const lines = ["time,ch1,ch2"];
    for (let index = 0; index < this.displayedData.x.length; index += 1) {
      lines.push(
        `${this.displayedData.x[index]},${this.displayedData.ch1[index]},${this.displayedData.ch2[index]}`,
      );
    }
    return `${lines.join("\n")}\n`;
  }

  getDisplayedStats(): { ch1Min: number; ch1Max: number; ch2Min: number; ch2Max: number } | null {
    if (!this.displayedData) {
      return null;
    }
    return {
      ...minMax(this.displayedData.ch1, "ch1"),
      ...minMax(this.displayedData.ch2, "ch2"),
    };
  }

  getDisplayedDataFingerprint(): number | null {
    if (!this.displayedData) {
      return null;
    }
    let hash = 2166136261;
    const step = Math.max(1, Math.floor(this.displayedData.x.length / 512));
    for (let index = 0; index < this.displayedData.x.length; index += step) {
      hash = fnvNumber(hash, this.displayedData.x[index]);
      hash = fnvNumber(hash, this.displayedData.ch1[index]);
      hash = fnvNumber(hash, this.displayedData.ch2[index]);
    }
    return hash >>> 0;
  }

  getMathStats(): { min: number; max: number } | null {
    if (this.xyMode || !this.mathActive) return null;
    return facetStats(this.plot.data, 3, 1);
  }

  getXyStats(): { xMin: number; xMax: number; yMin: number; yMax: number; maxDelta: number } | null {
    if (!this.xyMode) return null;
    const x = facetValues(this.plot.data, 1, 0);
    const y = facetValues(this.plot.data, 1, 1);
    if (!x || !y || x.length === 0 || x.length !== y.length) return null;
    let xMin = Number.POSITIVE_INFINITY;
    let xMax = Number.NEGATIVE_INFINITY;
    let yMin = Number.POSITIVE_INFINITY;
    let yMax = Number.NEGATIVE_INFINITY;
    let maxDelta = 0;
    for (let index = 0; index < x.length; index += 1) {
      xMin = Math.min(xMin, x[index]);
      xMax = Math.max(xMax, x[index]);
      yMin = Math.min(yMin, y[index]);
      yMax = Math.max(yMax, y[index]);
      maxDelta = Math.max(maxDelta, Math.abs(x[index] - y[index]));
    }
    return { xMin, xMax, yMin, yMax, maxDelta };
  }

  getCurveData(): { x: number[]; channels: [number[], number[]] } | null {
    if (!this.displayedData) return null;
    return {
      x: Array.from(this.displayedData.x),
      channels: [Array.from(this.displayedData.ch1), Array.from(this.displayedData.ch2)],
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

  private options(): uPlot.Options {
    return {
      mode: 2,
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
        x: { time: false, auto: false, min: 0, max: this.sampleCount - 1 },
        y: { auto: false, min: DEFAULT_Y_MIN, max: DEFAULT_Y_MAX },
      },
      axes: [
        plotAxis({
          label: "Time / CH1",
          values: (plot, ticks) => this.formatTimeTicks(plot, ticks as number[]),
        }),
        plotAxis({
          label: "Amplitude / CH2",
        }),
      ],
      series: [
        {},
        {
          label: "CH1 / XY",
          stroke: PLOT_COLORS.green,
          width: 1.5,
          points: { show: false },
        },
        {
          label: "CH2",
          stroke: PLOT_COLORS.red,
          width: 1.5,
          points: { show: false },
        },
        {
          label: "Math",
          stroke: PLOT_COLORS.blue,
          width: 1.5,
          points: { show: false },
        },
      ],
    };
  }

  private emptyData(): uPlot.AlignedData {
    return [
      [],
      [new Float64Array(0), new Float32Array(0)],
      [new Float64Array(0), new Float32Array(0)],
      [new Float64Array(0), new Float32Array(0)],
    ] as unknown as uPlot.AlignedData;
  }

  private handleFrame(buffer: ArrayBuffer): void {
    let frame: ScopeFrame;
    try {
      frame = parseScopeFrame(buffer);
    } catch (error) {
      this.setStatus(error instanceof Error ? error.message : "Invalid scope frame");
      return;
    }

    this.receivedFrameCount += 1;
    this.pendingFrame = frame;
    this.scheduleRender();
    this.setStatus(`Frame ${frame.sequence}, ${frame.sampleCount} samples, ${frame.channelCount} channels`);
  }

  private frameData(frame: ScopeFrame): uPlot.AlignedData {
    const next = frameToData(frame, this.timeSettings ?? undefined);
    if (this.timeSettings?.rollingMode) {
      this.averagedData = null;
      this.displayedData = next;
      this.currentAverage = 0;
      this.setCurrentAverage(0);
      return this.plotData(next);
    }
    const averaged = averageFrameData(next, this.averagedData, this.currentAverage, this.traceAverage);
    this.averagedData = averaged.data;
    this.displayedData = averaged.data;
    this.currentAverage = averaged.currentAverage;
    this.setCurrentAverage(this.currentAverage);
    return this.plotData(averaged.data);
  }

  private plotData(data: ScopeFrameData): uPlot.AlignedData {
    if (this.xyMode) {
      const empty = new Float32Array(0);
      return [
        [],
        [data.ch1, data.ch2],
        [empty, empty],
        [empty, empty],
      ] as unknown as uPlot.AlignedData;
    }
    let math: Float32Array = new Float32Array(data.x.length).fill(Number.NaN);
    if (this.mathActive) {
      try {
        math = evaluateScopeMath(
          this.mathFormula,
          data.ch1,
          data.ch2,
          data.x,
        );
      } catch (error) {
        this.setStatus(`Math formula error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return [
      [],
      [data.x, data.ch1],
      [data.x, data.ch2],
      [data.x, math],
    ] as unknown as uPlot.AlignedData;
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
    const firstFrame = this.latestFrame === null;
    const sampleCountChanged = this.latestFrame !== null && this.latestFrame.sampleCount !== frame.sampleCount;
    if (sampleCountChanged) {
      this.resetAveraging();
    }
    this.latestFrame = frame;
    this.plot.setData(this.frameData(frame), false);
    if (firstFrame || sampleCountChanged) {
      this.resetZoom();
    }
    this.plot.redraw(true, true);
  }

  private scheduleResize(): void {
    if (this.resizeFrame !== null) {
      return;
    }
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.resize();
    });
  }

  private resize(): void {
    const width = Math.max(320, Math.floor(this.plotHost.clientWidth));
    const height = Math.max(240, Math.floor(this.plotHost.clientHeight));
    if (width === this.plotSize.width && height === this.plotSize.height) {
      return;
    }
    this.plotSize = { width, height };
    this.plot.setSize({ width, height });
  }

  private bindInteractions(): void {
    const over = this.plot.over;
    over.addEventListener("contextmenu", (event) => event.preventDefault());
    over.addEventListener("pointerdown", (event) => {
      const { min: xMin, max: xMax } = this.getXRange();
      const { min: yMin, max: yMax } = this.getYRange();
      if (event.button === 0) {
        this.panState = {
          startX: event.clientX,
          startY: event.clientY,
          xMin,
          xMax,
          yMin,
          yMax,
        };
        over.setPointerCapture(event.pointerId);
        over.classList.add("is-panning");
        return;
      }
      if (event.button !== 1 && event.button !== 2) {
        return;
      }
      this.zoomState = {
        startX: event.clientX,
        startY: event.clientY,
        xMin,
        xMax,
        yMin,
        yMax,
      };
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
    if (this.timeSettings && !this.xyMode) {
      const defaultMin = this.defaultXMin();
      const defaultMax = defaultMin + this.timeSettings.duration;
      const minimumSpan = Math.max(Number.EPSILON, this.timeSettings.duration / 1024);
      const span = Math.min(defaultMax - defaultMin, Math.max(minimumSpan, max - min));
      let nextMin = min;
      let nextMax = min + span;
      if (nextMin < defaultMin) {
        nextMax += defaultMin - nextMin;
        nextMin = defaultMin;
      }
      if (nextMax > defaultMax) {
        nextMin -= nextMax - defaultMax;
        nextMax = defaultMax;
      }
      this.plot.setScale("x", { min: Math.max(defaultMin, nextMin), max: Math.min(defaultMax, nextMax) });
      return;
    }
    this.plot.setScale("x", clampXRange(min, max, this.currentMaxX()));
  }

  private setYScale(min: number, max: number): void {
    const span = Math.max(1e-6, max - min);
    this.plot.setScale("y", { min, max: min + span });
  }

  private resetYScale(): void {
    this.plot.setScale("y", { min: DEFAULT_Y_MIN, max: DEFAULT_Y_MAX });
  }

  private minimumXSpan(): number {
    if (this.timeSettings && !this.xyMode) {
      return Math.max(Number.EPSILON, this.timeSettings.duration / 1024);
    }
    return 4;
  }

  private zoomAroundStartScale(
    start: { xMin: number; xMax: number; yMin: number; yMax: number },
    xFactor: number,
    yFactor: number,
  ): void {
    const xCenter = (start.xMin + start.xMax) / 2;
    const yCenter = (start.yMin + start.yMax) / 2;
    const xSpan = Math.max(this.minimumXSpan(), (start.xMax - start.xMin) * xFactor);
    const ySpan = Math.max(1e-6, (start.yMax - start.yMin) * yFactor);
    this.setXScale(xCenter - xSpan / 2, xCenter + xSpan / 2);
    this.setYScale(yCenter - ySpan / 2, yCenter + ySpan / 2);
  }

  private currentMaxX(): number {
    if (this.xyMode) {
      return DEFAULT_Y_MAX;
    }
    if (this.timeSettings) {
      const min = this.defaultXMin();
      return Math.max(min + Number.EPSILON, min + this.timeSettings.duration);
    }
    return Math.max(1, (this.latestFrame?.sampleCount ?? this.sampleCount) - 1);
  }

  private defaultXScale(frame: ScopeFrame): { min: number; max: number } {
    if (this.xyMode) {
      return { min: DEFAULT_Y_MIN, max: DEFAULT_Y_MAX };
    }
    if (this.timeSettings) {
      const min = this.defaultXMin();
      return { min, max: min + this.timeSettings.duration };
    }
    return { min: 0, max: Math.max(1, frame.sampleCount - 1) };
  }

  private defaultXMin(): number {
    if (!this.timeSettings) {
      return 0;
    }
    if (this.timeSettings.rollingMode) {
      return -this.timeSettings.duration;
    }
    if (this.timeSettings.triggerSource === "immediately") {
      return 0;
    }
    return this.timeSettings.triggerDelay - this.timeSettings.duration / 2;
  }

  private resetAveraging(): void {
    this.averagedData = null;
    this.currentAverage = 0;
    this.setCurrentAverage(0);
  }

  private formatTimeTicks(plot: uPlot, ticks: number[]): string[] {
    if (this.xyMode) {
      return ticks.map((tick) => trimFixed(tick, 3));
    }
    const min = Number(plot.scales.x.min ?? ticks[0] ?? 0);
    const max = Number(plot.scales.x.max ?? ticks[ticks.length - 1] ?? min);
    const span = Math.max(Number.EPSILON, Math.abs(max - min));
    const unit = timeDisplayUnit(Math.max(Number.EPSILON, this.timeSettings?.duration ?? span));
    const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) * unit.scale : span * unit.scale;
    const decimals = Math.max(0, Math.min(9, Math.ceil(-Math.log10(Math.max(step, Number.EPSILON))) + 1));
    return ticks.map((tick) => `${trimFixed(tick * unit.scale, decimals)} ${unit.suffix}`);
  }

  private applySeriesVisibility(): void {
    this.plot.setSeries(1, { show: this.xyMode || this.channelVisible[0] });
    this.plot.setSeries(2, { show: !this.xyMode && this.channelVisible[1] });
    this.plot.setSeries(3, { show: !this.xyMode && this.mathActive });
  }

}

function facetValues(data: uPlot.AlignedData, series: number, facet: number): ArrayLike<number> | null {
  const faceted = data as unknown as Array<Array<ArrayLike<number>>>;
  return faceted[series]?.[facet] ?? null;
}

function facetStats(data: uPlot.AlignedData, series: number, facet: number): { min: number; max: number } | null {
  const values = facetValues(data, series, facet);
  if (!values || values.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  return min === Number.POSITIVE_INFINITY ? null : { min, max };
}

function timeDisplayUnit(spanSeconds: number): { scale: number; suffix: string } {
  if (spanSeconds < 1e-6) {
    return { scale: 1e9, suffix: "ns" };
  }
  if (spanSeconds < 1e-3) {
    return { scale: 1e6, suffix: "us" };
  }
  if (spanSeconds < 1) {
    return { scale: 1e3, suffix: "ms" };
  }
  return { scale: 1, suffix: "s" };
}

function trimFixed(value: number, decimals: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

function minMax(data: Float32Array, prefix: "ch1" | "ch2"): Record<`${typeof prefix}Min` | `${typeof prefix}Max`, number> {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of data) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return {
    [`${prefix}Min`]: min === Number.POSITIVE_INFINITY ? 0 : min,
    [`${prefix}Max`]: max === Number.NEGATIVE_INFINITY ? 0 : max,
  } as Record<`${typeof prefix}Min` | `${typeof prefix}Max`, number>;
}

function fnvNumber(hash: number, value: number): number {
  const normalized = Math.round(Number.isFinite(value) ? value * 1_000_000 : 0);
  hash ^= normalized & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (normalized >> 8) & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (normalized >> 16) & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (normalized >> 24) & 0xff;
  hash = Math.imul(hash, 16777619);
  return hash;
}
