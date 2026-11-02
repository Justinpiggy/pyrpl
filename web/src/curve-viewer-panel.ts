import { reportError } from "./status-bar";
import Split from "split.js";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis } from "./plot-theme";

interface CurveSummary {
  pk: number;
  name: string;
  points: number;
  complex: boolean;
}

interface CurveRecord extends CurveSummary {
  params: Record<string, unknown>;
  params_yaml: string;
  x: number[];
  y: number[];
  y_imag?: number[];
}

export class CurveViewerPanel {
  private magnitudePlot: uPlot;
  private phasePlot: uPlot;
  private split: Split.Instance | null = null;
  private resizeObserver: ResizeObserver;
  private resizeFrame: number | null = null;
  private selected: CurveRecord | null = null;
  private loaded = false;
  private loading: Promise<void> | null = null;

  constructor(
    private root: HTMLElement,
    private listPane: HTMLElement,
    private plotPane: HTMLElement,
    private paramsPane: HTMLElement,
    private select: HTMLSelectElement,
    private name: HTMLInputElement,
    private params: HTMLTextAreaElement,
    private status: HTMLOutputElement,
    private saveParamsButton: HTMLButtonElement,
    private deleteButton: HTMLButtonElement,
    private refreshButton: HTMLButtonElement,
  ) {
    const magnitudeHost = this.requireHost("#curve-viewer-magnitude");
    const phaseHost = this.requireHost("#curve-viewer-phase");
    this.magnitudePlot = this.createPlot(magnitudeHost, "Curve", "Value");
    this.phasePlot = this.createPlot(phaseHost, "Phase", "deg");
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(this.plotPane);
    this.bindActions();
  }

  async load(): Promise<void> {
    if (!this.loading) {
      // A refresh must finish before edits, or its late response can overwrite
      // newly typed parameters with the previously saved values.
      this.params.disabled = true;
      this.saveParamsButton.disabled = true;
      this.deleteButton.disabled = true;
      this.loading = this.refreshList().then(() => { this.loaded = true; })
        .finally(() => {
          this.loading = null;
          this.params.disabled = false;
          this.saveParamsButton.disabled = !this.selected;
          this.deleteButton.disabled = !this.selected;
        });
    }
    await this.loading;
  }

  refreshLayout(): void {
    this.ensureSplit();
    this.scheduleResize();
    // A large saved spectrum must not delay Scope or the module menu at startup.
    if (!this.root.hidden && !this.loaded) {
      void this.load().catch((error: Error) => { reportError(this.status, error.message); });
    }
  }

  private bindActions(): void {
    const report = (error: Error) => { reportError(this.status, error.message); };
    this.select.addEventListener("change", () => void this.loadSelected().catch(report));
    this.refreshButton.addEventListener("click", () => void this.load().catch(report));
    this.saveParamsButton.addEventListener("click", () => void this.saveParams().catch(report));
    this.deleteButton.addEventListener("click", () => void this.deleteSelected().catch(report));
  }

  private async refreshList(): Promise<void> {
    const previous = this.select.value;
    const response = await fetch("/api/curves?limit=100");
    if (!response.ok) throw new Error(`Curve list failed: ${response.status}`);
    const payload = await response.json();
    const curves = (payload.curves ?? []) as CurveSummary[];
    this.select.textContent = "";
    for (const curve of curves) {
      const option = document.createElement("option");
      option.value = String(curve.pk);
      option.textContent = `${curve.pk}: ${curve.name}`;
      this.select.appendChild(option);
    }
    if (curves.some((curve) => String(curve.pk) === previous)) this.select.value = previous;
    else if (curves[0]) this.select.value = String(curves[0].pk);
    this.status.textContent = `${curves.length} curve${curves.length === 1 ? "" : "s"}`;
    if (curves.length) await this.loadSelected();
    else this.clear();
  }

  private async loadSelected(): Promise<void> {
    if (!this.select.value) return this.clear();
    const response = await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);
    if (!response.ok) throw new Error(`Curve load failed: ${response.status}`);
    const payload = await response.json();
    this.selected = payload.curve as CurveRecord;
    this.name.value = this.selected.name;
    this.params.value = this.selected.params_yaml;
    this.saveParamsButton.disabled = false;
    this.deleteButton.disabled = false;
    const isComplex = Array.isArray(this.selected.y_imag);
    const magnitude = isComplex
      ? this.selected.y.map((real, index) => 20 * Math.log10(Math.max(Math.hypot(real, this.selected!.y_imag![index]), 1e-20)))
      : this.selected.y;
    const phase = isComplex
      ? this.selected.y.map((real, index) => Math.atan2(this.selected!.y_imag![index], real) * 180 / Math.PI)
      : [];
    this.magnitudePlot.setData([this.selected.x, magnitude]);
    this.phasePlot.setData([isComplex ? this.selected.x : [], phase]);
    const phaseFrame = this.phasePlot.root.closest<HTMLElement>(".curve-viewer-plot-frame");
    if (phaseFrame) phaseFrame.hidden = !isComplex;
    this.plotPane.classList.toggle("is-complex", isComplex);
    this.status.textContent = `curve ${this.selected.pk}, ${this.selected.points} points`;
    this.scheduleResize();
  }

  private async saveParams(): Promise<void> {
    if (!this.selected) return;
    const response = await fetch(`/api/curves/${this.selected.pk}/params`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ params_yaml: this.params.value }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      reportError(this.status, payload.detail ?? `Save parameters failed: ${response.status}`);
      return;
    }
    const payload = await response.json();
    this.selected = payload.curve as CurveRecord;
    this.name.value = this.selected.name;
    this.params.value = this.selected.params_yaml;
    this.status.textContent = `curve ${this.selected.pk} parameters saved`;
    await this.refreshList();
  }

  private async deleteSelected(): Promise<void> {
    if (!this.selected) return;
    const deletedPk = this.selected.pk;
    const response = await fetch(`/api/curves/${deletedPk}`, { method: "DELETE" });
    if (!response.ok) {
      reportError(this.status, `Delete curve failed: ${response.status}`);
      return;
    }
    this.selected = null;
    await this.refreshList();
    this.status.textContent = `curve ${deletedPk} deleted`;
  }

  private clear(): void {
    this.selected = null;
    this.name.value = "";
    this.params.value = "";
    this.magnitudePlot.setData([[], []]);
    this.phasePlot.setData([[], []]);
    this.saveParamsButton.disabled = true;
    this.deleteButton.disabled = true;
  }

  private ensureSplit(): void {
    if (this.split || this.root.hidden) return;
    this.split = Split([this.listPane, this.plotPane, this.paramsPane], {
      direction: "horizontal",
      sizes: [18, 57, 25],
      minSize: [140, 300, 200],
      gutterSize: 8,
      onDrag: () => this.scheduleResize(),
      onDragEnd: () => this.scheduleResize(),
    });
  }

  private createPlot(host: HTMLElement, title: string, unit: string): uPlot {
    return new uPlot({
      width: 700,
      height: 260,
      title,
      scales: { x: { time: false }, y: { auto: true } },
      axes: [plotAxis({ label: "X" }), plotAxis({ label: unit })],
      series: [{}, { label: title, stroke: PLOT_COLORS.green, width: 1.5 }],
      cursor: { drag: { x: true, y: true, setScale: true } },
    }, [[], []], host);
  }

  private scheduleResize(): void {
    if (this.resizeFrame !== null) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      const frames = this.plotPane.querySelectorAll<HTMLElement>(".curve-viewer-plot-frame:not([hidden])");
      const plots = [this.magnitudePlot, this.phasePlot];
      frames.forEach((frame, index) => {
        const bounds = frame.getBoundingClientRect();
        if (bounds.width > 100 && bounds.height > 80) {
          plots[index].setSize({ width: Math.floor(bounds.width), height: Math.floor(bounds.height) });
        }
      });
    });
  }

  private requireHost(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing curve viewer element ${selector}`);
    return element;
  }
}
