import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

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
  markers: IirMarker[];
  state: {
    real_poles: number[];
    real_zeros: number[];
    complex_poles: string[];
    complex_zeros: string[];
  };
}

type IirAttributeSetter = (attribute: string, value: string | number[] | string[]) => Promise<void>;

const EMPTY_DATA: uPlot.AlignedData = [new Float64Array(0), new Float32Array(0)];

export class IirPlot {
  private magnitudePlot: uPlot;
  private phasePlot: uPlot;
  private latest: IirPlotPayload | null = null;
  private selectedKey: string | null = null;
  private resizeFrame: number | null = null;
  private markerDrag: { marker: IirMarker; plot: uPlot } | null = null;

  constructor(
    private host: HTMLElement,
    private setAttribute: IirAttributeSetter,
    private setStatus: (message: string) => void,
  ) {
    this.host.innerHTML = `
      <div class="iir-plot-toolbar">
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
    `;
    const magnitudeHost = this.host.querySelector<HTMLElement>('[data-iir-plot="magnitude"]');
    const phaseHost = this.host.querySelector<HTMLElement>('[data-iir-plot="phase"]');
    if (!magnitudeHost || !phaseHost) {
      throw new Error("Missing IIR plot hosts");
    }
    this.magnitudePlot = new uPlot(this.options("Magnitude (dB)", "dB"), EMPTY_DATA, magnitudeHost);
    this.phasePlot = new uPlot(this.options("Phase (deg)", "deg"), EMPTY_DATA, phaseHost);
    this.installPlotEvents(this.magnitudePlot);
    this.installPlotEvents(this.phasePlot);
    window.addEventListener("resize", () => this.scheduleResize());
    this.scheduleResize();
  }

  async refresh(): Promise<void> {
    const response = await fetch("/api/modules/iir/plot");
    if (!response.ok) {
      throw new Error(`IIR plot unavailable: ${response.status}`);
    }
    this.latest = await response.json() as IirPlotPayload;
    const logX = Float64Array.from(this.latest.x, (value) => Math.log10(Math.max(value, Number.MIN_VALUE)));
    const magnitude = Float32Array.from(this.latest.magnitude);
    const phase = Float32Array.from(this.latest.phase);
    this.magnitudePlot.setData([logX, magnitude], false);
    this.phasePlot.setData([logX, phase], false);
    this.magnitudePlot.batch(() => {
      this.magnitudePlot.setScale("x", { min: 1, max: Math.log10(5e6) });
      this.magnitudePlot.setScale("y", this.yScale(magnitude));
    });
    this.phasePlot.batch(() => {
      this.phasePlot.setScale("x", { min: 1, max: Math.log10(5e6) });
      this.phasePlot.setScale("y", this.yScale(phase));
    });
    this.renderMarkers();
    this.plotStatus().textContent = `${this.latest.markers.length} pole/zero marker(s)`;
  }

  destroy(): void {
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
        drag: { x: true, y: false },
      },
      scales: {
        x: { time: false },
        y: { auto: false },
      },
      axes: [
        {
          label: "Frequency",
          values: (_plot, ticks) => (ticks as number[]).map((tick) => formatFrequency(10 ** tick)),
        },
        { label: unit },
      ],
      series: [
        {},
        {
          label: "Filter design",
          stroke: "#d4b10f",
          width: 2,
        },
      ],
      hooks: {
        draw: [() => this.renderMarkers()],
      },
    };
  }

  private installPlotEvents(plot: uPlot): void {
    plot.over.addEventListener("contextmenu", (event) => event.preventDefault());
    plot.over.addEventListener("dblclick", (event) => {
      this.handlePlotClick(plot, event, true).catch((error: Error) => this.setStatus(error.message));
    });
    plot.over.addEventListener("click", (event) => {
      this.handlePlotClick(plot, event, false).catch((error: Error) => this.setStatus(error.message));
    });
    plot.over.addEventListener("mousemove", (event) => {
      if (this.markerDrag) {
        this.moveDraggedMarker(event);
      }
    });
    plot.over.addEventListener("mouseup", (event) => {
      if (this.markerDrag) {
        this.finishDraggedMarker(event).catch((error: Error) => this.setStatus(error.message));
      }
    });
    plot.over.addEventListener("mouseleave", (event) => {
      if (this.markerDrag) {
        this.finishDraggedMarker(event).catch((error: Error) => this.setStatus(error.message));
      }
    });
  }

  private async handlePlotClick(plot: uPlot, event: MouseEvent, doubleClick: boolean): Promise<void> {
    if (!this.latest || event.defaultPrevented) {
      return;
    }
    const frequency = this.frequencyFromEvent(plot, event);
    if (event.ctrlKey || event.metaKey) {
      await this.addMarker("poles", frequency, doubleClick);
    } else if (event.shiftKey) {
      await this.addMarker("zeros", frequency, doubleClick);
    } else {
      const marker = this.nearestMarker(frequency);
      if (marker) {
        this.selectedKey = markerKey(marker);
        this.renderMarkers();
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
        this.selectedKey = markerKey(marker);
        this.markerDrag = { marker, plot };
        element.classList.add("is-dragging");
      });
      plot.over.appendChild(element);
    }
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
      const width = Math.max(280, Math.floor(this.host.clientWidth));
      const height = Math.max(180, Math.floor((this.host.clientHeight - 42) / 2));
      this.magnitudePlot.setSize({ width, height });
      this.phasePlot.setSize({ width, height });
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

function markerKey(marker: IirMarker): string {
  return `${marker.list}:${marker.index}`;
}

function complexValue(real: number, imag: number): string {
  return `${formatNumber(real)}+${formatNumber(Math.abs(imag))}j`;
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
