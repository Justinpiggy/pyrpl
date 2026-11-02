import { reportError } from "./status-bar";
export interface ConfigEditorSchema {
  configfile: string;
  module: string;
  modules: string[];
  text: string;
}

interface ConfigPanelElements {
  file: HTMLOutputElement;
  module: HTMLSelectElement;
  text: HTMLTextAreaElement;
  refresh: HTMLButtonElement;
  save: HTMLButtonElement;
  status: HTMLOutputElement;
}

export class ConfigPanel {
  private schema: ConfigEditorSchema | null = null;

  constructor(private elements: ConfigPanelElements) {
    elements.module.addEventListener("change", () => {
      this.load(elements.module.value).catch((error: Error) => reportError(this.elements.status, error.message));
    });
    elements.refresh.addEventListener("click", () => {
      this.load(elements.module.value).catch((error: Error) => reportError(this.elements.status, error.message));
    });
    elements.save.addEventListener("click", () => {
      this.save().catch((error: Error) => reportError(this.elements.status, error.message));
    });
  }

  async load(module = this.schema?.module ?? "pyrpl"): Promise<void> {
    const response = await fetch(`/api/config?module=${encodeURIComponent(module)}`);
    if (!response.ok) {
      throw new Error(await responseDetail(response, "Configuration unavailable"));
    }
    this.apply(await response.json() as ConfigEditorSchema);
    this.setStatus(`Loaded ${this.schema?.module}`);
  }

  async save(): Promise<void> {
    const module = this.elements.module.value;
    const response = await fetch(`/api/config/branches/${encodeURIComponent(module)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: this.elements.text.value }),
    });
    if (!response.ok) {
      throw new Error(await responseDetail(response, "Configuration save failed"));
    }
    this.apply(await response.json() as ConfigEditorSchema);
    this.setStatus(`Saved ${module}`);
  }

  getModule(): string {
    return this.elements.module.value;
  }

  getText(): string {
    return this.elements.text.value;
  }

  private apply(schema: ConfigEditorSchema): void {
    this.schema = schema;
    this.elements.file.textContent = schema.configfile;
    this.elements.module.textContent = "";
    for (const module of schema.modules) {
      const option = document.createElement("option");
      option.value = module;
      option.textContent = module;
      this.elements.module.appendChild(option);
    }
    this.elements.module.value = schema.module;
    this.elements.text.value = schema.text;
    this.elements.module.disabled = false;
    this.elements.text.disabled = false;
    this.elements.refresh.disabled = false;
    this.elements.save.disabled = false;
  }

  private setStatus(message: string): void {
    this.elements.status.textContent = message;
  }
}

async function responseDetail(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json() as { detail?: string };
    return payload.detail ?? `${fallback}: ${response.status}`;
  } catch {
    return `${fallback}: ${response.status}`;
  }
}
