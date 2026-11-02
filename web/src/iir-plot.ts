import { fitPlotToFrame } from "./plot-theme";
import { frequencyTick } from "./plot-format";
import { reportError } from "./status-bar";
import type uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis, createThemedPlot } from "./plot-theme";

export interface IirMarker {
  list: "real_poles" | "real_zeros" | "complex_poles" | "complex_zeros";
  kind: "pole" | "zero";
  shape: "real" | "complex";
  index: number;
  value: number | string;
  frequency: number;
  magnitude: number;
  phase: number;
}

interface IirPlotPayload {
  x: number[];
  magnitude: number[];
  phase: number[];
  data_magnitude: Array<number | null>;
  data_phase: Array<number | null>;
  product_magnitude: Array<number | null>;
  product_phase: Array<number | null>;
  measurement_magnitude: Array<number | null>;
  measurement_phase: Array<number | null>;
  tf_type: string;
  data_curve_name: string;
  markers: IirMarker[];
  state: {
    real_poles: number[];
    real_zeros: number[];
    complex_poles: string[];
    complex_zeros: string[];
  };
}

type IirAttributeSetter = (attribute: string, value: string | number[] | string[]) => Promise<void>;
type IirListName = "real_poles" | "real_zeros" | "complex_poles" | "complex_zeros";

const EMPTY_DATA = [
  new Float64Array(0),
  new Float32Array(0),
  new Float32Array(0),
  new Float32Array(0),
  new Float32Array(0),
] as unknown as uPlot.AlignedData;
const IIR_LISTS: Array<{ name: IirListName; label: string; kind: "pole" | "zero"; complex: boolean }> = [
  { name: "complex_poles", label: "Complex Poles", kind: "pole", complex: true },
  { name: "complex_zeros", label: "Complex Zeros", kind: "zero", complex: true },
  { name: "real_poles", label: "Real Poles", kind: "pole", complex: false },
  { name: "real_zeros", label: "Real Zeros", kind: "zero", complex: false },
];

export class IirPlot {
  private magnitudePlot: uPlot;
  private phasePlot: uPlot;
  private magnitudeHost: HTMLElement;
  private phaseHost: HTMLElement;
  private latest: IirPlotPayload | null = null;
  private refreshRevision = 0;
  private selectedKey: string | null = null;
  private resizeFrame: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private clickTimer: number | null = null;
  private markerDrag: { marker: IirMarker; plot: uPlot } | null = null;
  private panState:
    | { plot: uPlot; startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number; moved: boolean }
    | null = null;
  private zoomState:
    | { plot: uPlot; startX: number; startY: number; xMin: number; xMax: number; yMin: number; yMax: number; moved: boolean }
    | null = null;
  private userView = false;
  private suppressNextClick = false;
  private readonly windowMouseMove = (event: MouseEvent) => {
    const activePlot = this.panState?.plot ?? this.zoomState?.plot;
    if (activePlot) {
      this.handlePointerMove(activePlot, event);
    }
  };
  private readonly windowMouseUp = () => {
    const activePlot = this.panState?.plot ?? this.zoomState?.plot;
    if (activePlot) {
      this.endMouseInteraction(activePlot);
    }
  };

  constructor(
    private host: HTMLElement,
    private setAttribute: IirAttributeSetter,
    private setStatus: (message: string) => void,
    private canEditHardware: () => boolean = () => true,
    private viewSettings: () => Record<string, string | number | boolean> = () => ({}),
  ) {
    this.host.innerHTML = `
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;
    const magnitudeHost = this.host.querySelector<HTMLElement>('[data-iir-plot="magnitude"]');
    const phaseHost = this.host.querySelector<HTMLElement>('[data-iir-plot="phase"]');
    if (!magnitudeHost || !phaseHost) {
      throw new Error("Missing IIR plot hosts");
    }
    this.magnitudeHost = magnitudeHost;
    this.phaseHost = phaseHost;
    this.magnitudePlot = createThemedPlot(this.options("Magnitude (dB)", "dB"), EMPTY_DATA, magnitudeHost);
    this.phasePlot = createThemedPlot(this.options("Phase (deg)", "deg"), EMPTY_DATA, phaseHost);
    this.installPlotEvents(this.magnitudePlot);
    this.installPlotEvents(this.phasePlot);
    this.host.querySelector<HTMLButtonElement>("#iir-zoom-reset")?.addEventListener("click", () => this.resetZoom());
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(this.host);
    this.scheduleResize();
  }

  async refresh(): Promise<void> {
    const revision = ++this.refreshRevision;
    const query = new URLSearchParams(Object.entries(this.viewSettings()).map(([key, value]) => [key, String(value)]));
    const response = await fetch(`/api/modules/iir/plot?${query}`);
    if (!response.ok) {
      throw new Error(`IIR plot unavailable: ${response.status}`);
    }
    const payload = await response.json() as IirPlotPayload;
    if (revision !== this.refreshRevision) return;
    this.latest = payload;
    const logX = Float64Array.from(this.latest.x, (value) => Math.log10(Math.max(value, Number.MIN_VALUE)));
    const magnitude = Float32Array.from(this.latest.magnitude);
    const phase = Float32Array.from(this.latest.phase);
    const dataMagnitude = plotArray(this.latest.data_magnitude);
    const dataPhase = plotArray(this.latest.data_phase);
    const productMagnitude = plotArray(this.latest.product_magnitude);
    const productPhase = plotArray(this.latest.product_phase);
    const measurementMagnitude = plotArray(this.latest.measurement_magnitude);
    const measurementPhase = plotArray(this.latest.measurement_phase);
    const shouldResetView = !this.userView || this.magnitudePlot.data[0].length === 0;
    this.magnitudePlot.setData(
      [logX, magnitude, dataMagnitude, productMagnitude, measurementMagnitude],
      false,
    );
    this.phasePlot.setData([logX, phase, dataPhase, productPhase, measurementPhase], false);
    if (shouldResetView) {
      this.applyDefaultScales();
    } else {
      this.linkXScale(this.getXRange());
    }
    this.renderMarkers();
    this.renderListEditors();
    const curveName = this.host.closest(".module-panel")?.querySelector<HTMLInputElement>("#iir-data-curve-name");
    if (curveName) curveName.value = this.latest.data_curve_name;
    const curve = this.latest.data_curve_name ? ` | ${this.latest.data_curve_name}` : "";
    this.plotStatus().textContent =
      `${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${curve}`;
  }

  destroy(): void {
    if (this.clickTimer !== null) {
      window.clearTimeout(this.clickTimer);
    }
    this.removeWindowMouseCapture();
    this.resizeObserver?.disconnect();
    this.magnitudePlot.destroy();
    this.phasePlot.destroy();
    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
    }
  }

  private options(title: string, unit: string): uPlot.Options {
    return {
      width: 360,
      height: 220,
      title,
      cursor: {
        drag: { x: false, y: false, setScale: false },
      },
      scales: {
        x: { time: false },
        y: { auto: false },
      },
      axes: [
        plotAxis({
          label: "Frequency",
          space: 90,
          values: (_plot, ticks) => (ticks as number[]).map((tick) => frequencyTick(10 ** tick)),
        }),
        plotAxis({ label: unit }),
      ],
      series: [
        {},
        {
          label: "Filter design",
          stroke: PLOT_COLORS.yellow,
          width: 2,
        },
        {
          label: "Data curve",
          stroke: PLOT_COLORS.green,
          width: 1.5,
        },
        {
          label: "Data x filter",
          stroke: PLOT_COLORS.red,
          width: 1.5,
        },
        {
          label: "Measurement",
          stroke: PLOT_COLORS.orange,
          width: 0,
          points: { show: true, size: 4, width: 1, stroke: PLOT_COLORS.orange },
        },
      ],
      hooks: {
        draw: [() => this.renderMarkers()],
      },
    };
  }

  private installPlotEvents(plot: uPlot): void {
    const surface = plot.root;
    surface.addEventListener("contextmenu", (event) => event.preventDefault(), { capture: true });
    surface.addEventListener("wheel", (event) => {
      event.preventDefault();
      const factor = Math.exp(event.deltaY / 500);
      this.zoomAroundPointer(plot, event, factor, factor);
    }, { passive: false });
    surface.addEventListener("pointerdown", (event) => {
      if (this.startMouseNavigation(plot, event)) {
        surface.setPointerCapture(event.pointerId);
      }
    }, { capture: true });
    surface.addEventListener("pointermove", (event) => this.handlePointerMove(plot, event), { capture: true });
    const endInteraction = (event: PointerEvent) => this.endPointerInteraction(plot, event);
    surface.addEventListener("pointerup", endInteraction, { capture: true });
    surface.addEventListener("pointercancel", endInteraction, { capture: true });
    surface.addEventListener("mousedown", (event) => {
      if (!this.panState && !this.zoomState) {
        this.startMouseNavigation(plot, event);
      }
    }, { capture: true });
    surface.addEventListener("dblclick", (event) => {
      if (this.clickTimer !== null) {
        window.clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
      this.handlePlotClick(plot, event, true).catch((error: Error) => reportError(this.plotStatus(), error.message));
    });
    surface.addEventListener("click", (event) => {
      if (this.suppressNextClick) {
        this.suppressNextClick = false;
        return;
      }
      if (event.detail > 1) {
        return;
      }
      if (this.clickTimer !== null) {
        window.clearTimeout(this.clickTimer);
      }
      this.clickTimer = window.setTimeout(() => {
        this.clickTimer = null;
        this.handlePlotClick(plot, event, false).catch((error: Error) => reportError(this.plotStatus(), error.message));
      }, 220);
    });
    surface.addEventListener("mousemove", (event) => {
      if (this.markerDrag) {
        this.moveDraggedMarker(event);
      } else {
        if (!this.panState && !this.zoomState && event.buttons) {
          this.startMouseMoveNavigation(plot, event);
        }
        this.handlePointerMove(plot, event);
      }
    }, { capture: true });
    surface.addEventListener("mouseup", (event) => {
      if (this.markerDrag) {
        this.finishDraggedMarker(event).catch((error: Error) => reportError(this.plotStatus(), error.message));
      } else {
        this.endMouseInteraction(plot);
      }
    }, { capture: true });
    surface.addEventListener("mouseleave", (event) => {
      if (this.markerDrag) {
        this.finishDraggedMarker(event).catch((error: Error) => reportError(this.plotStatus(), error.message));
      } else {
        this.endMouseInteraction(plot);
      }
    });
  }

  private async handlePlotClick(plot: uPlot, event: MouseEvent, doubleClick: boolean): Promise<void> {
    if (!this.latest || event.defaultPrevented) {
      return;
    }
    const frequency = this.frequencyFromEvent(plot, event);
    if (!this.canEditHardware() && (event.ctrlKey || event.metaKey || event.shiftKey)) return;
    if (event.ctrlKey || event.metaKey) {
      await this.addMarker("poles", frequency, doubleClick);
    } else if (event.shiftKey) {
      await this.addMarker("zeros", frequency, doubleClick);
    } else {
      const marker = this.nearestMarker(frequency);
      if (marker) {
        this.selectedKey = markerKey(marker);
        this.renderMarkers();
        this.renderListEditors();
      }
    }
  }

  private async addMarker(kind: "poles" | "zeros", frequency: number, complexMarker: boolean): Promise<void> {
    if (!this.latest) {
      return;
    }
    if (complexMarker) {
      const list = kind === "poles" ? "complex_poles" : "complex_zeros";
      const values = [...this.latest.state[list], complexValue(-frequency / 10, frequency)];
      await this.setAttribute(list, values);
    } else {
      const list = kind === "poles" ? "real_poles" : "real_zeros";
      const values = [...this.latest.state[list], -frequency];
      await this.setAttribute(list, values);
    }
    await this.refresh();
  }

  private renderMarkers(): void {
    if (!this.latest) {
      return;
    }
    this.renderMarkersForPlot(this.magnitudePlot, "magnitude");
    this.renderMarkersForPlot(this.phasePlot, "phase");
  }

  private renderMarkersForPlot(plot: uPlot, axis: "magnitude" | "phase"): void {
    const existing = Array.from(plot.over.querySelectorAll<HTMLElement>(".iir-marker"));
    for (const marker of existing) {
      marker.remove();
    }
    for (const marker of this.latest?.markers ?? []) {
      const frequency = Math.max(marker.frequency, Number.MIN_VALUE);
      const left = plot.valToPos(Math.log10(frequency), "x");
      const top = plot.valToPos(axis === "magnitude" ? marker.magnitude : marker.phase, "y");
      if (!Number.isFinite(left) || !Number.isFinite(top)) {
        continue;
      }
      const element = document.createElement("button");
      element.type = "button";
      element.className = `iir-marker is-${marker.kind} is-${marker.shape}`;
      element.classList.toggle("is-selected", this.selectedKey === markerKey(marker));
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.title = `${marker.list}[${marker.index}] ${formatFrequency(marker.frequency)}`;
      element.textContent = marker.kind === "pole" ? "x" : "o";
      element.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.canEditHardware()) return;
        this.selectedKey = markerKey(marker);
        this.markerDrag = { marker, plot };
        element.classList.add("is-dragging");
        this.renderListEditors();
      });
      element.addEventListener("pointerdown", (event) => event.stopPropagation());
      plot.over.appendChild(element);
    }
  }

  private renderListEditors(): void {
    const grid = this.host.querySelector<HTMLElement>(".iir-list-grid");
    if (!grid || !this.latest) {
      return;
    }
    grid.textContent = "";
    for (const config of IIR_LISTS) {
      const values = [...this.latest.state[config.name]];
      const panel = document.createElement("section");
      panel.className = "iir-list-editor";
      panel.dataset.list = config.name;

      const header = document.createElement("header");
      const title = document.createElement("span");
      title.textContent = config.label;
      const count = document.createElement("input");
      count.type = "number";
      count.min = "0";
      count.max = "64";
      count.step = "1";
      count.value = String(values.length);
      count.id = `iir-${config.name.replaceAll("_", "-")}-count`;
      count.setAttribute("aria-label", `${config.label} count`);
      count.addEventListener("change", () => {
        this.setListCount(config.name, Number(count.value)).catch((error: Error) => reportError(this.plotStatus(), error.message));
      });
      const add = document.createElement("button");
      add.type = "button";
      add.textContent = "+";
      add.title = `Add ${config.label.slice(0, -1).toLowerCase()}`;
      add.addEventListener("click", () => {
        this.appendListValue(config.name).catch((error: Error) => reportError(this.plotStatus(), error.message));
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "-";
      remove.title = `Remove selected ${config.label.slice(0, -1).toLowerCase()}`;
      remove.disabled = values.length === 0;
      remove.addEventListener("click", () => {
        this.removeListValue(config.name).catch((error: Error) => reportError(this.plotStatus(), error.message));
      });
      header.append(title, count, add, remove);
      panel.appendChild(header);

      const raw = document.createElement("input");
      raw.type = "text";
      raw.id = `iir-${config.name.replaceAll("_", "-")}`;
      raw.value = values.join(", ");
      raw.setAttribute("aria-label", `${config.label} values`);
      raw.addEventListener("change", () => {
        const parsed = config.complex ? splitList(raw.value) : splitList(raw.value).map(Number);
        this.setList(config.name, parsed).catch((error: Error) => reportError(this.plotStatus(), error.message));
      });
      panel.appendChild(raw);

      const rows = document.createElement("div");
      rows.className = "iir-list-values";
      values.forEach((value, index) => {
        const row = document.createElement("label");
        row.className = "iir-list-value";
        const key = `${config.name}:${index}`;
        row.classList.toggle("is-selected", this.selectedKey === key);
        const indexLabel = document.createElement("span");
        indexLabel.textContent = String(index);
        const input = document.createElement("input");
        input.type = config.complex ? "text" : "number";
        input.step = "any";
        input.value = String(value);
        input.addEventListener("focus", () => {
          this.selectedKey = key;
          this.renderMarkers();
          this.renderListEditors();
        });
        input.addEventListener("change", () => {
          const next = [...this.latest!.state[config.name]];
          next[index] = config.complex ? input.value : Number(input.value);
          this.setList(config.name, next).catch((error: Error) => reportError(this.plotStatus(), error.message));
        });
        row.append(indexLabel, input);
        rows.appendChild(row);
      });
      panel.appendChild(rows);
      grid.appendChild(panel);
    }
  }

  private async appendListValue(list: IirListName): Promise<void> {
    if (!this.latest) {
      return;
    }
    const values = [...this.latest.state[list], defaultListValue(list)];
    await this.setList(list, values);
  }

  private async removeListValue(list: IirListName): Promise<void> {
    if (!this.latest) {
      return;
    }
    const values = [...this.latest.state[list]];
    const selected = this.selectedKey?.startsWith(`${list}:`) ? Number(this.selectedKey.split(":")[1]) : values.length - 1;
    if (selected >= 0 && selected < values.length) {
      values.splice(selected, 1);
      this.selectedKey = null;
      await this.setList(list, values);
    }
  }

  private async setListCount(list: IirListName, count: number): Promise<void> {
    if (!this.latest) {
      return;
    }
    const target = Math.max(0, Math.min(64, Math.round(Number.isFinite(count) ? count : 0)));
    const values = [...this.latest.state[list]];
    while (values.length < target) {
      values.push(defaultListValue(list));
    }
    values.length = target;
    await this.setList(list, values);
  }

  private async setList(list: IirListName, values: Array<number | string>): Promise<void> {
    if (!this.canEditHardware()) return;
    await this.setAttribute(list, values as number[] | string[]);
    await this.refresh();
  }

  private moveDraggedMarker(event: MouseEvent): void {
    const marker = this.markerDrag;
    if (!marker) {
      return;
    }
    const frequency = this.frequencyFromEvent(marker.plot, event);
    this.plotStatus().textContent = `drag ${marker.marker.list}[${marker.marker.index}] to ${formatFrequency(frequency)}`;
  }

  private async finishDraggedMarker(event: MouseEvent): Promise<void> {
    const drag = this.markerDrag;
    this.markerDrag = null;
    if (!drag || !this.latest) {
      return;
    }
    const frequency = this.frequencyFromEvent(drag.plot, event);
    const marker = drag.marker;
    if (marker.list === "real_poles" || marker.list === "real_zeros") {
      const values = [...this.latest.state[marker.list]];
      values[marker.index] = -frequency;
      await this.setAttribute(marker.list, values);
    } else {
      const values = [...this.latest.state[marker.list]];
      const previous = parseComplex(String(values[marker.index]));
      values[marker.index] = complexValue(previous.real, frequency);
      await this.setAttribute(marker.list, values);
    }
    await this.refresh();
  }

  private nearestMarker(frequency: number): IirMarker | null {
    if (!this.latest?.markers.length) {
      return null;
    }
    let best = this.latest.markers[0];
    let bestDistance = Infinity;
    for (const marker of this.latest.markers) {
      const ratio = Math.max(marker.frequency, frequency) / Math.max(Number.MIN_VALUE, Math.min(marker.frequency, frequency));
      if (ratio < bestDistance) {
        best = marker;
        bestDistance = ratio;
      }
    }
    return best;
  }

  private frequencyFromEvent(plot: uPlot, event: MouseEvent): number {
    const rect = plot.over.getBoundingClientRect();
    const left = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    return 10 ** Number(plot.posToVal(left, "x"));
  }

  resetZoom(): void {
    if (!this.latest) {
      return;
    }
    this.userView = false;
    this.applyDefaultScales();
    this.renderMarkers();
  }

  getXRange(): { min: number; max: number } {
    const xScale = this.magnitudePlot.scales.x;
    return {
      min: Number(xScale.min ?? this.defaultXScale().min),
      max: Number(xScale.max ?? this.defaultXScale().max),
    };
  }

  getMagnitudeYRange(): { min: number; max: number } {
    return this.getYRange(this.magnitudePlot);
  }

  getPhaseYRange(): { min: number; max: number } {
    return this.getYRange(this.phasePlot);
  }

  private handlePointerMove(plot: uPlot, event: PointerEvent | MouseEvent): void {
    if (this.panState?.plot === plot) {
      const width = Math.max(1, plot.bbox.width / (devicePixelRatio || 1));
      const height = Math.max(1, plot.bbox.height / (devicePixelRatio || 1));
      const deltaPixelsX = event.clientX - this.panState.startX;
      const deltaPixelsY = event.clientY - this.panState.startY;
      this.panState.moved ||= Math.abs(deltaPixelsX) > 3 || Math.abs(deltaPixelsY) > 3;
      const xSpan = this.panState.xMax - this.panState.xMin;
      const ySpan = this.panState.yMax - this.panState.yMin;
      const deltaX = (deltaPixelsX / width) * xSpan;
      const deltaY = (deltaPixelsY / height) * ySpan;
      this.setXScale(this.panState.xMin - deltaX, this.panState.xMax - deltaX);
      this.setYScale(plot, this.panState.yMin + deltaY, this.panState.yMax + deltaY);
    } else if (this.zoomState?.plot === plot) {
      const deltaPixelsX = event.clientX - this.zoomState.startX;
      const deltaPixelsY = event.clientY - this.zoomState.startY;
      this.zoomState.moved ||= Math.abs(deltaPixelsX) > 3 || Math.abs(deltaPixelsY) > 3;
      const xFactor = Math.exp(-deltaPixelsX / 260);
      const yFactor = Math.exp(deltaPixelsY / 260);
      this.zoomAroundStartScale(plot, this.zoomState, xFactor, yFactor);
    }
  }

  private startMouseNavigation(plot: uPlot, event: PointerEvent | MouseEvent): boolean {
    if ((event.target as HTMLElement).closest(".iir-marker") || event.ctrlKey || event.metaKey || event.shiftKey) {
      return false;
    }
    const { min: xMin, max: xMax } = this.getXRange();
    const { min: yMin, max: yMax } = this.getYRange(plot);
    if (event.button === 0) {
      this.panState = { plot, startX: event.clientX, startY: event.clientY, xMin, xMax, yMin, yMax, moved: false };
      plot.over.classList.add("is-panning");
      this.addWindowMouseCapture();
      return true;
    }
    if (event.button === 1 || event.button === 2) {
      this.zoomState = { plot, startX: event.clientX, startY: event.clientY, xMin, xMax, yMin, yMax, moved: false };
      plot.over.classList.add("is-zooming");
      this.addWindowMouseCapture();
      return true;
    }
    return false;
  }

  private startMouseMoveNavigation(plot: uPlot, event: MouseEvent): void {
    if ((event.buttons & 1) === 1) {
      this.panState = {
        plot,
        startX: event.clientX,
        startY: event.clientY,
        ...this.getXRangeAsStart(plot),
        moved: false,
      };
      plot.over.classList.add("is-panning");
      this.addWindowMouseCapture();
    } else if ((event.buttons & 2) === 2 || (event.buttons & 4) === 4) {
      this.zoomState = {
        plot,
        startX: event.clientX,
        startY: event.clientY,
        ...this.getXRangeAsStart(plot),
        moved: false,
      };
      plot.over.classList.add("is-zooming");
      this.addWindowMouseCapture();
    }
  }

  private getXRangeAsStart(plot: uPlot): { xMin: number; xMax: number; yMin: number; yMax: number } {
    const { min: xMin, max: xMax } = this.getXRange();
    const { min: yMin, max: yMax } = this.getYRange(plot);
    return { xMin, xMax, yMin, yMax };
  }

  private endPointerInteraction(plot: uPlot, event: PointerEvent): void {
    const moved = (this.panState?.plot === plot && this.panState.moved) || (this.zoomState?.plot === plot && this.zoomState.moved);
    if (this.panState?.plot === plot || this.zoomState?.plot === plot) {
      try {
        plot.root.releasePointerCapture(event.pointerId);
      } catch {
        // Browser may release capture before pointercancel reaches this handler.
      }
      this.userView ||= Boolean(moved);
      this.suppressNextClick ||= Boolean(moved);
    }
    if (this.panState?.plot === plot) {
      this.panState = null;
    }
    if (this.zoomState?.plot === plot) {
      this.zoomState = null;
    }
    plot.over.classList.remove("is-panning");
    plot.over.classList.remove("is-zooming");
    this.removeWindowMouseCapture();
  }

  private endMouseInteraction(plot: uPlot): void {
    const moved = (this.panState?.plot === plot && this.panState.moved) || (this.zoomState?.plot === plot && this.zoomState.moved);
    this.userView ||= Boolean(moved);
    this.suppressNextClick ||= Boolean(moved);
    if (this.panState?.plot === plot) {
      this.panState = null;
    }
    if (this.zoomState?.plot === plot) {
      this.zoomState = null;
    }
    plot.over.classList.remove("is-panning");
    plot.over.classList.remove("is-zooming");
    this.removeWindowMouseCapture();
  }

  private addWindowMouseCapture(): void {
    window.addEventListener("mousemove", this.windowMouseMove);
    window.addEventListener("mouseup", this.windowMouseUp);
  }

  private removeWindowMouseCapture(): void {
    window.removeEventListener("mousemove", this.windowMouseMove);
    window.removeEventListener("mouseup", this.windowMouseUp);
  }

  private zoomAroundPointer(plot: uPlot, event: WheelEvent, xFactor: number, yFactor: number): void {
    const rect = plot.over.getBoundingClientRect();
    const left = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const top = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const xCenter = Number(plot.posToVal(left, "x"));
    const yCenter = Number(plot.posToVal(top, "y"));
    const { min: xMin, max: xMax } = this.getXRange();
    const { min: yMin, max: yMax } = this.getYRange(plot);
    const xRatio = (xCenter - xMin) / Math.max(Number.EPSILON, xMax - xMin);
    const yRatio = (yCenter - yMin) / Math.max(Number.EPSILON, yMax - yMin);
    const xSpan = Math.max(this.minimumXSpan(), (xMax - xMin) * xFactor);
    const ySpan = Math.max(1e-12, (yMax - yMin) * yFactor);
    this.setXScale(xCenter - xSpan * xRatio, xCenter + xSpan * (1 - xRatio));
    this.setYScale(plot, yCenter - ySpan * yRatio, yCenter + ySpan * (1 - yRatio));
    this.userView = true;
  }

  private zoomAroundStartScale(
    plot: uPlot,
    start: { xMin: number; xMax: number; yMin: number; yMax: number },
    xFactor: number,
    yFactor: number,
  ): void {
    const xCenter = (start.xMin + start.xMax) / 2;
    const yCenter = (start.yMin + start.yMax) / 2;
    const xSpan = Math.max(this.minimumXSpan(), (start.xMax - start.xMin) * xFactor);
    const ySpan = Math.max(1e-12, (start.yMax - start.yMin) * yFactor);
    this.setXScale(xCenter - xSpan / 2, xCenter + xSpan / 2);
    this.setYScale(plot, yCenter - ySpan / 2, yCenter + ySpan / 2);
  }

  private setXScale(min: number, max: number): void {
    const defaultScale = this.defaultXScale();
    const span = Math.min(defaultScale.max - defaultScale.min, Math.max(this.minimumXSpan(), max - min));
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
    this.linkXScale({
      min: Math.max(defaultScale.min, nextMin),
      max: Math.min(defaultScale.max, nextMax),
    });
  }

  private setYScale(plot: uPlot, min: number, max: number): void {
    const span = Math.max(1e-12, max - min);
    plot.setScale("y", { min, max: min + span });
    this.renderMarkers();
  }

  private linkXScale(range: { min: number; max: number }): void {
    this.magnitudePlot.setScale("x", range);
    this.phasePlot.setScale("x", range);
    this.renderMarkers();
  }

  private getYRange(plot: uPlot): { min: number; max: number } {
    const yScale = plot.scales.y;
    const fallback = plot === this.magnitudePlot
      ? this.yScale(Float32Array.from(this.latest?.magnitude ?? []))
      : this.yScale(Float32Array.from(this.latest?.phase ?? []));
    return {
      min: Number(yScale.min ?? fallback.min),
      max: Number(yScale.max ?? fallback.max),
    };
  }

  private applyDefaultScales(): void {
    if (!this.latest) {
      return;
    }
    const xScale = this.defaultXScale();
    this.magnitudePlot.batch(() => {
      this.magnitudePlot.setScale("x", xScale);
      this.magnitudePlot.setScale("y", this.yScale(Float32Array.from(this.latest!.magnitude)));
    });
    this.phasePlot.batch(() => {
      this.phasePlot.setScale("x", xScale);
      this.phasePlot.setScale("y", this.yScale(Float32Array.from(this.latest!.phase)));
    });
  }

  private defaultXScale(): { min: number; max: number } {
    const values = this.latest?.x ?? [];
    const minValue = values.length ? Math.max(Number.MIN_VALUE, values[0]) : 10;
    const maxValue = values.length ? Math.max(minValue * 1.000001, values[values.length - 1]) : 5e6;
    return { min: Math.log10(minValue), max: Math.log10(maxValue) };
  }

  private minimumXSpan(): number {
    const { min, max } = this.defaultXScale();
    return Math.max(Number.EPSILON, (max - min) / 1024);
  }

  private yScale(values: Float32Array): { min: number; max: number } {
    if (!values.length) {
      return { min: -260, max: 20 };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const value of values) {
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: -260, max: 20 };
    }
    if (Math.abs(max - min) < 1e-9) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.1;
    return { min: min - pad, max: max + pad };
  }

  private scheduleResize(): void {
    if (this.resizeFrame !== null) {
      return;
    }
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      fitPlotToFrame(this.magnitudePlot, this.magnitudeHost);
      fitPlotToFrame(this.phasePlot, this.phaseHost);
      this.renderMarkers();
    });
  }

  private plotStatus(): HTMLOutputElement {
    const element = this.host.querySelector<HTMLOutputElement>(".iir-plot-status");
    if (!element) {
      throw new Error("Missing IIR plot status");
    }
    return element;
  }
}


function plotArray(values: Array<number | null>): Float32Array {
  return Float32Array.from(values, (value) => value === null ? Number.NaN : value);
}

function markerKey(marker: IirMarker): string {
  return `${marker.list}:${marker.index}`;
}

function complexValue(real: number, imag: number): string {
  return `${formatNumber(real)}+${formatNumber(Math.abs(imag))}j`;
}

function defaultListValue(list: IirListName): string | number {
  return list.startsWith("complex") ? "-1000+10000j" : -10000;
}

function splitList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseComplex(value: string): { real: number; imag: number } {
  const normalized = value.trim().replace("i", "j");
  const match = normalized.match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);
  if (!match) {
    return { real: -1, imag: 1 };
  }
  return { real: Number(match[1] ?? 0), imag: Number(match[2]) };
}

function formatNumber(value: number): string {
  return Number(value.toPrecision(8)).toString();
}

function formatFrequency(value: number): string {
  if (value >= 1e6) {
    return `${formatNumber(value / 1e6)} MHz`;
  }
  if (value >= 1e3) {
    return `${formatNumber(value / 1e3)} kHz`;
  }
  return `${formatNumber(value)} Hz`;
}
