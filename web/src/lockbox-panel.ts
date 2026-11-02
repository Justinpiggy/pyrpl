import { fitPlotToFrame } from "./plot-theme";
import { reportError } from "./status-bar";
import type uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { PLOT_COLORS, plotAxis, createThemedPlot } from "./plot-theme";

// Field IDs only need page-local uniqueness. randomUUID requires a secure
// context and is unavailable when opening the board's LAN address over HTTP.
let nextFieldId = 0;

export interface LockboxAttribute {
  name: string;
  label: string;
  type: "select" | "bool" | "number" | "text";
  value: string | number | boolean | number[];
  options?: Array<string | number | boolean>;
  min?: number;
  max?: number;
  step?: number;
}

interface LockboxNode {
  name: string;
  kind?: string;
  class_name?: string;
  attributes: LockboxAttribute[];
  calibration?: Record<string, number>;
}

interface LockboxStage {
  name: string;
  attributes: LockboxAttribute[];
  outputs: Array<{ output: string; attributes: LockboxAttribute[] }>;
}

export interface LockboxSchema {
  schema_epoch?: string;
  revision?: number;
  classname: string;
  attributes: LockboxAttribute[];
  inputs: LockboxNode[];
  outputs: LockboxNode[];
  sequence: LockboxStage[];
  state: { current_state?: string; lock_status?: boolean };
  actions?: Array<{ name: string; label: string }>;
}

interface LockboxPanelElements {
  root: HTMLElement;
  classSelect: HTMLSelectElement;
  status: HTMLOutputElement;
  actions: HTMLElement;
  inputs: HTMLElement;
  outputs: HTMLElement;
  stages: HTMLElement;
  addStage: HTMLButtonElement;
  inputPlot: HTMLElement;
  outputPlot: HTMLElement;
  inputPlotSelect: HTMLSelectElement;
  outputPlotSelect: HTMLSelectElement;
}

export class LockboxPanel {
  private schema: LockboxSchema | null = null;
  private inputPlot: uPlot | null = null;
  private outputMagnitudePlot: uPlot | null = null;
  private outputPhasePlot: uPlot | null = null;
  private readonly resizeObserver: ResizeObserver;
  private resizeFrame: number | null = null;
  private stageLayoutWidth = 0;
  private stageHeight = 0;
  private structureKey = "";
  private plotKey = "";
  private actionKey = "";
  private fields: Array<HTMLInputElement | HTMLSelectElement> = [];
  private inputPlotRequest = 0;
  private outputPlotRequest = 0;

  constructor(private readonly elements: LockboxPanelElements) {
    this.resizeObserver = new ResizeObserver(() => this.scheduleLayoutRefresh());
    this.resizeObserver.observe(elements.inputPlot);
    this.resizeObserver.observe(elements.outputPlot);
    elements.classSelect.addEventListener("change", () => {
      this.setClass(elements.classSelect.value).catch((error: Error) => {
        reportError(this.elements.status, error.message);
      });
    });
    elements.addStage.addEventListener("click", () => {
      this.requestSchema("/api/lockbox/stages", { method: "POST" }).catch((error: Error) => {
        reportError(this.elements.status, error.message);
      });
    });
    elements.inputPlotSelect.addEventListener("change", () => {
      this.refreshInputPlot().catch((error: Error) => reportError(this.elements.status, error.message));
    });
    elements.outputPlotSelect.addEventListener("change", () => {
      this.refreshOutputPlot().catch((error: Error) => reportError(this.elements.status, error.message));
    });
  }

  async load(): Promise<void> {
    const [schemaResponse, actionsResponse] = await Promise.all([
      fetch("/api/lockbox"),
      fetch("/api/lockbox/actions"),
    ]);
    if (!schemaResponse.ok || !actionsResponse.ok) {
      throw new Error("Lockbox controls unavailable");
    }
    const schema = await schemaResponse.json() as LockboxSchema;
    const actionsPayload = await actionsResponse.json() as { actions: Array<{ name: string; label: string }> };
    this.renderActions(actionsPayload.actions ?? []);
    await this.applySchema(schema);
  }

  async applySchema(schema: LockboxSchema): Promise<void> {
    if (schema.schema_epoch && schema.schema_epoch === this.schema?.schema_epoch
      && (schema.revision ?? 0) < (this.schema.revision ?? 0)) return;
    this.schema = schema;
    if (schema.actions) this.renderActions(schema.actions);
    const configuration = {
      classname: schema.classname,
      attributes: schema.attributes,
      inputs: schema.inputs,
      outputs: schema.outputs,
      sequence: schema.sequence,
    };
    const structureKey = JSON.stringify(configuration, (key, value) =>
      ["value", "state", "calibration"].includes(key) ? undefined : value);
    if (structureKey !== this.structureKey) {
      this.structureKey = structureKey;
      this.fields = [];
      this.populateClassSelect(schema);
      this.renderLockboxAttributes(schema.attributes);
      this.renderInputs(schema.inputs);
      this.renderOutputs(schema.outputs);
      this.renderStages(schema.sequence);
      this.populatePlotSelect(this.elements.inputPlotSelect, schema.inputs.map((input) => input.name));
      this.populatePlotSelect(this.elements.outputPlotSelect, schema.outputs.map((output) => output.name));
    } else {
      // Status events and writes from other clients must preserve DOM identity,
      // focus, unfinished edits, scroll positions, and pending button clicks.
      const attributes = [
        ...schema.attributes.filter(attribute => attribute.name !== "classname"),
        ...schema.inputs.flatMap(input => input.attributes),
        ...schema.outputs.flatMap(output => output.attributes),
        ...schema.sequence.flatMap(stage => [...stage.attributes, ...stage.outputs.flatMap(output => output.attributes)]),
      ];
      this.fields.forEach((input, index) => {
        const attribute = attributes[index];
        if (!attribute || input === document.activeElement) return;
        if (input instanceof HTMLInputElement && input.type === "checkbox") input.checked = Boolean(attribute.value);
        else input.value = Array.isArray(attribute.value) ? attribute.value.join(", ") : String(attribute.value ?? "");
      });
      for (const output of schema.outputs) {
        const card = Array.from(this.elements.outputs.querySelectorAll<HTMLElement>("[data-node-name]"))
          .find(element => element.dataset.nodeName === output.name);
        if (!card) continue;
        const assisted = Boolean(output.attributes.find(attribute => attribute.name === "assisted_design")?.value);
        const tfType = output.attributes.find(attribute => attribute.name === "tf_type")?.value;
        for (const field of card.querySelectorAll<HTMLLabelElement>("label[data-attribute]")) {
          const name = field.dataset.attribute;
          if (name === "p" || name === "i") this.setFieldDisabled(field, assisted);
          if (name === "desired_unity_gain_frequency" || name === "analog_filter_cutoff") this.setFieldDisabled(field, !assisted);
          if (name === "tf_curve") this.setFieldDisabled(field, tfType !== "curve");
        }
      }
      for (const input of schema.inputs) {
        const card = Array.from(this.elements.inputs.querySelectorAll<HTMLElement>("[data-node-name]"))
          .find(element => element.dataset.nodeName === input.name);
        const calibration = card?.querySelector("output");
        if (calibration && input.calibration) calibration.textContent = this.calibrationText(input.calibration);
      }
    }
    this.setStatus(
      `${schema.classname}: ${schema.state.current_state ?? "ready"} | ${schema.state.lock_status ? "locked" : "not locked"}`,
    );
    const plotKey = JSON.stringify(configuration, (key, value) => key === "state" ? undefined : value);
    if (plotKey !== this.plotKey) {
      this.plotKey = plotKey;
      await Promise.all([this.refreshInputPlot(), this.refreshOutputPlot()]);
    }
    this.scheduleLayoutRefresh();
  }

  refreshLayout(): void {
    if (this.inputPlot) this.fitPlotToHost(this.inputPlot, this.elements.inputPlot);
    const outputFrames = this.elements.outputPlot.querySelectorAll<HTMLElement>(".lockbox-output-plot-frame");
    if (outputFrames[0] && this.outputMagnitudePlot) this.fitPlotToHost(this.outputMagnitudePlot, outputFrames[0]);
    if (outputFrames[1] && this.outputPhasePlot) this.fitPlotToHost(this.outputPhasePlot, outputFrames[1]);
    this.equalizeStageHeights();
  }

  getStageCount(): number {
    return this.schema?.sequence.length ?? 0;
  }

  getClassname(): string | null {
    return this.schema?.classname ?? null;
  }

  private populateClassSelect(schema: LockboxSchema): void {
    const classAttribute = schema.attributes.find((attribute) => attribute.name === "classname");
    const options = classAttribute?.options ?? [schema.classname];
    this.elements.classSelect.textContent = "";
    for (const option of options) {
      const element = document.createElement("option");
      element.value = String(option);
      element.textContent = String(option);
      this.elements.classSelect.appendChild(element);
    }
    this.elements.classSelect.value = schema.classname;
  }

  private populatePlotSelect(select: HTMLSelectElement, names: string[]): void {
    const previous = select.value;
    select.textContent = "";
    for (const name of names) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }
    select.value = names.includes(previous) ? previous : (names[0] ?? "");
  }

  private renderActions(actions: Array<{ name: string; label: string }>): void {
    const key = JSON.stringify(actions);
    if (key === this.actionKey) return;
    this.actionKey = key;
    this.elements.actions.textContent = "";
    for (const action of actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label ?? action.name;
      button.addEventListener("click", () => {
        this.requestSchema(`/api/lockbox/actions/${action.name}`, { method: "POST" }).catch((error: Error) => {
          reportError(this.elements.status, error.message);
        });
      });
      this.elements.actions.appendChild(button);
    }
  }

  private renderLockboxAttributes(attributes: LockboxAttribute[]): void {
    const container = this.elements.root.querySelector<HTMLElement>("#lockbox-attributes");
    if (!container) {
      return;
    }
    container.textContent = "";
    for (const attribute of attributes) {
      if (attribute.name === "classname") {
        continue;
      }
      container.appendChild(this.createAttributeField(attribute, (value) =>
        this.requestSchema(`/api/lockbox/attributes/${attribute.name}`, this.valueRequest(value)),
      ));
    }
  }

  private renderInputs(inputs: LockboxNode[]): void {
    this.elements.inputs.textContent = "";
    for (const input of inputs) {
      const card = this.createSectionCard(input.name, input.kind ?? "input");
      card.dataset.nodeName = input.name;
      const calibrateButton = document.createElement("button");
      calibrateButton.type = "button";
      calibrateButton.textContent = "Calibrate";
      calibrateButton.addEventListener("click", () => {
        this.requestSchema(
          `/api/lockbox/inputs/${encodeURIComponent(input.name)}/actions/calibrate`,
          { method: "POST" },
        ).catch((error: Error) => reportError(this.elements.status, error.message));
      });
      card.querySelector(".lockbox-card-title")?.appendChild(calibrateButton);
      const row = document.createElement("div");
      row.className = "lockbox-control-row";
      for (const attribute of input.attributes) {
        row.appendChild(this.createAttributeField(attribute, (value) =>
          this.requestSchema(
            `/api/lockbox/inputs/${encodeURIComponent(input.name)}/attributes/${attribute.name}`,
            this.valueRequest(value),
          ),
        ));
      }
      card.appendChild(row);
      if (input.calibration) {
        const calibration = document.createElement("output");
        calibration.textContent = this.calibrationText(input.calibration);
        card.appendChild(calibration);
      }
      this.elements.inputs.appendChild(card);
    }
  }

  private renderOutputs(outputs: LockboxNode[]): void {
    this.elements.outputs.textContent = "";
    for (const output of outputs) {
      const card = this.createSectionCard(output.name, output.kind ?? "output");
      card.dataset.nodeName = output.name;
      const row = document.createElement("div");
      row.className = "lockbox-control-row";
      const assisted = Boolean(output.attributes.find((attribute) => attribute.name === "assisted_design")?.value);
      const tfType = String(output.attributes.find((attribute) => attribute.name === "tf_type")?.value ?? "filter");
      for (const attribute of output.attributes) {
        const field = this.createAttributeField(attribute, (value) =>
          this.requestSchema(
            `/api/lockbox/outputs/${encodeURIComponent(output.name)}/attributes/${attribute.name}`,
            this.valueRequest(value),
          ),
        );
        if (["p", "i"].includes(attribute.name)) this.setFieldDisabled(field, assisted);
        if (["desired_unity_gain_frequency", "analog_filter_cutoff"].includes(attribute.name)) {
          this.setFieldDisabled(field, !assisted);
        }
        if (attribute.name === "tf_curve") this.setFieldDisabled(field, tfType !== "curve");
        row.appendChild(field);
      }
      card.appendChild(row);
      this.elements.outputs.appendChild(card);
    }
  }

  private calibrationText(calibration: Record<string, number>): string {
    return Object.entries(calibration).filter(([, value]) => typeof value === "number")
      .slice(0, 4).map(([key, value]) => `${key} ${Number(value).toPrecision(3)}`).join(" | ");
  }

  private renderStages(stages: LockboxStage[]): void {
    this.elements.stages.textContent = "";
    this.stageLayoutWidth = 0;
    this.stageHeight = 0;
    this.elements.stages.style.removeProperty("--lockbox-stage-height");
    stages.forEach((stage, index) => {
      const card = this.createSectionCard(stage.name, `stage ${index}`);
      card.classList.add("lockbox-stage-card");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        this.requestSchema(`/api/lockbox/stages/${index}`, { method: "DELETE" }).catch((error: Error) => {
          reportError(this.elements.status, error.message);
        });
      });
      const executeButton = document.createElement("button");
      executeButton.type = "button";
      executeButton.textContent = "Go to this stage";
      executeButton.addEventListener("click", () => {
        this.requestSchema(`/api/lockbox/stages/${index}/actions/execute`, { method: "POST" }).catch(
          (error: Error) => reportError(this.elements.status, error.message),
        );
      });
      const titleActions = document.createElement("div");
      titleActions.className = "lockbox-card-actions";
      titleActions.append(executeButton, deleteButton);
      card.querySelector(".lockbox-card-title")?.appendChild(titleActions);

      const row = document.createElement("div");
      row.className = "lockbox-control-row";
      for (const attribute of stage.attributes) {
        row.appendChild(this.createAttributeField(attribute, (value) =>
          this.requestSchema(`/api/lockbox/stages/${index}/attributes/${attribute.name}`, this.valueRequest(value)),
        ));
      }
      card.appendChild(row);

      const outputGrid = document.createElement("div");
      outputGrid.className = "lockbox-stage-output-grid";
      for (const output of stage.outputs) {
        const outputBlock = document.createElement("section");
        outputBlock.className = "lockbox-stage-output";
        const title = document.createElement("h4");
        title.textContent = output.output;
        outputBlock.appendChild(title);
        for (const attribute of output.attributes) {
          outputBlock.appendChild(this.createAttributeField(attribute, (value) =>
            this.requestSchema(
              `/api/lockbox/stages/${index}/outputs/${encodeURIComponent(output.output)}/attributes/${attribute.name}`,
              this.valueRequest(value),
            ),
          ));
        }
        outputGrid.appendChild(outputBlock);
      }
      card.appendChild(outputGrid);
      this.elements.stages.appendChild(card);
    });
  }

  private equalizeStageHeights(): void {
    const cards = Array.from(this.elements.stages.querySelectorAll<HTMLElement>(".lockbox-stage-card"));
    const width = Math.floor(this.elements.stages.getBoundingClientRect().width);
    if (cards.length === 0 || width < 1 || (width === this.stageLayoutWidth && this.stageHeight > 0)) {
      return;
    }
    this.elements.stages.style.removeProperty("--lockbox-stage-height");
    const height = Math.ceil(Math.max(...cards.map((card) => card.getBoundingClientRect().height)));
    if (height < 1) {
      return;
    }
    this.elements.stages.style.setProperty("--lockbox-stage-height", `${height}px`);
    this.stageLayoutWidth = width;
    this.stageHeight = height;
  }

  private createSectionCard(titleText: string, subtitleText: string): HTMLElement {
    const card = document.createElement("section");
    card.className = "lockbox-card";
    const title = document.createElement("header");
    title.className = "lockbox-card-title";
    const heading = document.createElement("h3");
    heading.textContent = titleText;
    const subtitle = document.createElement("span");
    subtitle.textContent = subtitleText;
    title.append(heading, subtitle);
    card.appendChild(title);
    return card;
  }

  private createAttributeField(
    attribute: LockboxAttribute,
    onChange: (value: string | number | boolean | number[]) => Promise<void>,
  ): HTMLLabelElement {
    const label = document.createElement("label");
    label.dataset.attribute = attribute.name;
    const title = document.createElement("span");
    title.textContent = attribute.label;
    label.appendChild(title);
    let input: HTMLInputElement | HTMLSelectElement;
    if (attribute.type === "select") {
      const select = document.createElement("select");
      for (const option of attribute.options ?? []) {
        const element = document.createElement("option");
        element.value = String(option);
        element.textContent = String(option);
        select.appendChild(element);
      }
      select.value = String(attribute.value);
      select.addEventListener("change", () => {
        const value = this.selectValue(select.value, attribute.options ?? []);
        onChange(value).catch((error: Error) => reportError(this.elements.status, error.message));
      });
      input = select;
    } else if (attribute.type === "bool") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(attribute.value);
      checkbox.addEventListener("change", () => {
        onChange(checkbox.checked).catch((error: Error) => reportError(this.elements.status, error.message));
      });
      input = checkbox;
    } else if (attribute.type === "number") {
      const number = document.createElement("input");
      number.type = "number";
      number.value = String(attribute.value);
      if (attribute.min !== undefined) {
        number.min = String(attribute.min);
      }
      if (attribute.max !== undefined) {
        number.max = String(attribute.max);
      }
      if (attribute.step !== undefined) {
        number.step = String(attribute.step);
      }
      number.addEventListener("change", () => {
        if (number.value.trim() === "" || !Number.isFinite(number.valueAsNumber)) return;
        onChange(Number(number.value)).catch((error: Error) => reportError(this.elements.status, error.message));
      });
      input = number;
    } else {
      const text = document.createElement("input");
      text.type = "text";
      text.value = Array.isArray(attribute.value) ? attribute.value.join(", ") : String(attribute.value ?? "");
      text.addEventListener("change", () => {
        onChange(this.textValue(text.value)).catch((error: Error) => reportError(this.elements.status, error.message));
      });
      input = text;
    }
    input.id = `lockbox-${attribute.name.replaceAll("_", "-")}-${++nextFieldId}`;
    this.fields.push(input);
    label.appendChild(input);
    return label;
  }

  private setFieldDisabled(field: HTMLLabelElement, disabled: boolean): void {
    const input = field.querySelector<HTMLInputElement | HTMLSelectElement>("input, select");
    if (input) input.disabled = disabled;
    field.classList.toggle("is-disabled", disabled);
  }

  private selectValue(value: string, options: Array<string | number | boolean>): string | number | boolean {
    const original = options.find((option) => String(option) === value);
    return original ?? value;
  }

  private textValue(value: string): string | number[] {
    const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((part) => Number.isFinite(Number(part)))) {
      return parts.map((part) => Number(part));
    }
    return value;
  }

  private valueRequest(value: string | number | boolean | number[]): RequestInit {
    return {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    };
  }

  private async setClass(classname: string): Promise<void> {
    await this.requestSchema("/api/lockbox/class", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classname }),
    });
  }

  private async requestSchema(path: string, init: RequestInit): Promise<void> {
    const response = await fetch(path, init);
    if (!response.ok) {
      throw new Error(`Lockbox request failed: ${response.status}`);
    }
    await this.applySchema(await response.json() as LockboxSchema);
  }

  private async refreshInputPlot(): Promise<void> {
    const request = ++this.inputPlotRequest;
    const input = this.schema?.inputs.find((candidate) => candidate.name === this.elements.inputPlotSelect.value)
      ?? this.schema?.inputs[0];
    if (!input) {
      return;
    }
    const response = await fetch(`/api/lockbox/inputs/${encodeURIComponent(input.name)}/plot`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json() as { x: number[]; series: Array<{ label: string; values: number[] }> };
    if (request !== this.inputPlotRequest) return;
    this.drawInputPlot(this.elements.inputPlot, "Expected Signal", payload);
  }

  private async refreshOutputPlot(): Promise<void> {
    const request = ++this.outputPlotRequest;
    const output = this.schema?.outputs.find((candidate) => candidate.name === this.elements.outputPlotSelect.value)
      ?? this.schema?.outputs[0];
    if (!output) {
      return;
    }
    const response = await fetch(`/api/lockbox/outputs/${encodeURIComponent(output.name)}/transfer_function`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json() as { x: number[]; series: Array<{ label: string; values: number[] }> };
    if (request !== this.outputPlotRequest) return;
    this.drawOutputPlot(this.elements.outputPlot, payload);
  }

  private drawInputPlot(
    host: HTMLElement,
    title: string,
    payload: { x: number[]; series: Array<{ label: string; values: number[] }> },
  ): void {
    if (this.inputPlot && this.inputPlot.series.length === payload.series.length + 1
      && payload.series.every((series, index) => this.inputPlot!.series[index + 1].label === series.label)) {
      this.inputPlot.setData([payload.x, ...payload.series.map(series => series.values)], false);
      return;
    }
    this.inputPlot?.destroy();
    host.textContent = "";
    const size = this.plotSize(host);
    const plot = createThemedPlot(
      {
        title,
        width: size.width,
        height: size.height,
        scales: { x: { time: false } },
        series: [
          {},
          ...payload.series.map((series, index) => ({
            label: series.label,
            stroke: index === 0 ? PLOT_COLORS.green : PLOT_COLORS.blue,
            width: 2,
          })),
        ],
        axes: [
          plotAxis(),
          plotAxis(),
        ],
      },
      [payload.x, ...payload.series.map((series) => series.values)],
      host,
    );
    this.inputPlot = plot;
  }

  private drawOutputPlot(
    host: HTMLElement,
    payload: { x: number[]; series: Array<{ label: string; values: number[] }> },
  ): void {
    const magnitude = payload.series.find((series) => series.label === "magnitude")?.values ?? [];
    const phase = payload.series.find((series) => series.label === "phase")?.values ?? [];
    if (this.outputMagnitudePlot && this.outputPhasePlot) {
      this.outputMagnitudePlot.setData([payload.x, magnitude.map(value => Math.max(1e-30, value))], false);
      this.outputPhasePlot.setData([payload.x, phase], false);
      return;
    }
    host.textContent = "";
    const magnitudeFrame = document.createElement("div");
    const phaseFrame = document.createElement("div");
    magnitudeFrame.className = "lockbox-output-plot-frame";
    phaseFrame.className = "lockbox-output-plot-frame";
    host.append(magnitudeFrame, phaseFrame);
    this.resizeObserver.observe(magnitudeFrame);
    this.resizeObserver.observe(phaseFrame);
    this.outputMagnitudePlot = createThemedPlot(
      {
        title: "Open-loop magnitude",
        ...this.outputPlotOptions(this.plotSize(magnitudeFrame), true),
        series: [{}, { label: "magnitude", stroke: PLOT_COLORS.green, width: 2 }],
      },
      [payload.x, magnitude.map((value) => Math.max(1e-30, value))],
      magnitudeFrame,
    );
    this.outputPhasePlot = createThemedPlot(
      {
        title: "Open-loop phase",
        ...this.outputPlotOptions(this.plotSize(phaseFrame), false),
        series: [{}, { label: "phase", stroke: PLOT_COLORS.blue, width: 2 }],
      },
      [payload.x, phase],
      phaseFrame,
    );
    this.scheduleLayoutRefresh();
  }

  private outputPlotOptions(
    size: { width: number; height: number },
    logY: boolean,
  ): Pick<uPlot.Options, "width" | "height" | "scales" | "axes"> {
    return {
      width: size.width,
      height: size.height,
      scales: {
        x: { time: false, distr: 3 },
        y: logY ? { distr: 3 } : { auto: true },
      },
      axes: [plotAxis(), plotAxis()],
    };
  }

  private plotSize(host: HTMLElement): { width: number; height: number } {
    const rect = host.getBoundingClientRect();
    return {
      width: Math.floor(rect.width) || 420,
      height: Math.floor(rect.height) || 224,
    };
  }

  private fitPlotToHost(plot: uPlot, host: HTMLElement): void {
    fitPlotToFrame(plot, host);
  }

  private scheduleLayoutRefresh(): void {
    if (this.resizeFrame !== null) {
      return;
    }
    let remainingPasses = 3;
    const refresh = (): void => {
      this.resizeFrame = requestAnimationFrame(() => {
        if (!this.elements.root.hidden) {
          this.refreshLayout();
        }
        remainingPasses -= 1;
        if (remainingPasses > 0) {
          refresh();
        } else {
          this.resizeFrame = null;
        }
      });
    };
    refresh();
  }

  private setStatus(message: string): void {
    this.elements.status.textContent = message;
  }
}
