import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

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
  classname: string;
  attributes: LockboxAttribute[];
  inputs: LockboxNode[];
  outputs: LockboxNode[];
  sequence: LockboxStage[];
  state: { current_state?: string; lock_status?: boolean };
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
}

export class LockboxPanel {
  private schema: LockboxSchema | null = null;
  private inputPlot: uPlot | null = null;
  private outputPlot: uPlot | null = null;

  constructor(private readonly elements: LockboxPanelElements) {
    elements.classSelect.addEventListener("change", () => {
      this.setClass(elements.classSelect.value).catch((error: Error) => {
        this.setStatus(error.message);
      });
    });
    elements.addStage.addEventListener("click", () => {
      this.requestSchema("/api/lockbox/stages", { method: "POST" }).catch((error: Error) => {
        this.setStatus(error.message);
      });
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
    this.schema = schema;
    this.populateClassSelect(schema);
    this.renderLockboxAttributes(schema.attributes);
    this.renderInputs(schema.inputs);
    this.renderOutputs(schema.outputs);
    this.renderStages(schema.sequence);
    this.setStatus(`${schema.classname}: ${schema.state.current_state ?? "ready"}`);
    await Promise.all([this.refreshInputPlot(), this.refreshOutputPlot()]);
  }

  refreshLayout(): void {
    this.inputPlot?.setSize(this.plotSize(this.elements.inputPlot));
    this.outputPlot?.setSize(this.plotSize(this.elements.outputPlot));
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

  private renderActions(actions: Array<{ name: string; label: string }>): void {
    this.elements.actions.textContent = "";
    for (const action of actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label ?? action.name;
      button.addEventListener("click", () => {
        this.requestSchema(`/api/lockbox/actions/${action.name}`, { method: "POST" }).catch((error: Error) => {
          this.setStatus(error.message);
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
        calibration.textContent = Object.entries(input.calibration)
          .filter(([, value]) => typeof value === "number")
          .slice(0, 4)
          .map(([key, value]) => `${key} ${Number(value).toPrecision(3)}`)
          .join(" | ");
        card.appendChild(calibration);
      }
      this.elements.inputs.appendChild(card);
    }
  }

  private renderOutputs(outputs: LockboxNode[]): void {
    this.elements.outputs.textContent = "";
    for (const output of outputs) {
      const card = this.createSectionCard(output.name, output.kind ?? "output");
      const row = document.createElement("div");
      row.className = "lockbox-control-row";
      for (const attribute of output.attributes) {
        row.appendChild(this.createAttributeField(attribute, (value) =>
          this.requestSchema(
            `/api/lockbox/outputs/${encodeURIComponent(output.name)}/attributes/${attribute.name}`,
            this.valueRequest(value),
          ),
        ));
      }
      card.appendChild(row);
      this.elements.outputs.appendChild(card);
    }
  }

  private renderStages(stages: LockboxStage[]): void {
    this.elements.stages.textContent = "";
    stages.forEach((stage, index) => {
      const card = this.createSectionCard(stage.name, `stage ${index}`);
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        this.requestSchema(`/api/lockbox/stages/${index}`, { method: "DELETE" }).catch((error: Error) => {
          this.setStatus(error.message);
        });
      });
      card.querySelector(".lockbox-card-title")?.appendChild(deleteButton);

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
        onChange(value).catch((error: Error) => this.setStatus(error.message));
      });
      input = select;
    } else if (attribute.type === "bool") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(attribute.value);
      checkbox.addEventListener("change", () => {
        onChange(checkbox.checked).catch((error: Error) => this.setStatus(error.message));
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
        onChange(Number(number.value)).catch((error: Error) => this.setStatus(error.message));
      });
      input = number;
    } else {
      const text = document.createElement("input");
      text.type = "text";
      text.value = Array.isArray(attribute.value) ? attribute.value.join(", ") : String(attribute.value ?? "");
      text.addEventListener("change", () => {
        onChange(this.textValue(text.value)).catch((error: Error) => this.setStatus(error.message));
      });
      input = text;
    }
    input.id = `lockbox-${attribute.name.replaceAll("_", "-")}-${crypto.randomUUID()}`;
    label.appendChild(input);
    return label;
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
    const input = this.schema?.inputs[0];
    if (!input) {
      return;
    }
    const response = await fetch(`/api/lockbox/inputs/${encodeURIComponent(input.name)}/plot`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json() as { x: number[]; series: Array<{ label: string; values: number[] }> };
    this.drawPlot(this.elements.inputPlot, "Expected Signal", payload, "input");
  }

  private async refreshOutputPlot(): Promise<void> {
    const output = this.schema?.outputs[0];
    if (!output) {
      return;
    }
    const response = await fetch(`/api/lockbox/outputs/${encodeURIComponent(output.name)}/transfer_function`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json() as { x: number[]; series: Array<{ label: string; values: number[] }> };
    this.drawPlot(this.elements.outputPlot, "Transfer Function", payload, "output");
  }

  private drawPlot(
    host: HTMLElement,
    title: string,
    payload: { x: number[]; series: Array<{ label: string; values: number[] }> },
    kind: "input" | "output",
  ): void {
    const existing = kind === "input" ? this.inputPlot : this.outputPlot;
    existing?.destroy();
    host.textContent = "";
    const size = this.plotSize(host);
    const plot = new uPlot(
      {
        title,
        width: size.width,
        height: size.height,
        scales: kind === "output" ? { x: { time: false, distr: 3 } } : { x: { time: false } },
        series: [
          {},
          ...payload.series.map((series, index) => ({
            label: series.label,
            stroke: index === 0 ? "#4fd17f" : "#72a7ff",
            width: 2,
          })),
        ],
        axes: [
          {
            stroke: "#9aacb6",
            grid: { stroke: "#26333b", width: 1 },
          },
          {
            stroke: "#9aacb6",
            grid: { stroke: "#26333b", width: 1 },
          },
        ],
      },
      [payload.x, ...payload.series.map((series) => series.values)],
      host,
    );
    if (kind === "input") {
      this.inputPlot = plot;
    } else {
      this.outputPlot = plot;
    }
  }

  private plotSize(host: HTMLElement): { width: number; height: number } {
    const rect = host.getBoundingClientRect();
    return {
      width: Math.max(260, Math.floor(rect.width || 420)),
      height: Math.max(180, Math.floor(rect.height || 220)),
    };
  }

  private setStatus(message: string): void {
    this.elements.status.textContent = message;
  }
}
