/** Only these module attributes describe a browser view, never acquisition. */
export const VIEW_ATTRIBUTES: Record<string, readonly string[]> = {
  scope: ["ch1_active", "ch2_active", "ch_math_active", "math_formula", "xy_mode"],
  spectrumanalyzer: ["display_unit", "display_input1_baseband", "display_input2_baseband", "display_cross_amplitude", "window"],
  iir: ["tf_type", "data_curve", "plot_data", "plot_data_times_filter", "plot_measurement"],
};

export function isViewAttribute(module: string, attribute: string): boolean {
  return VIEW_ATTRIBUTES[module]?.includes(attribute) ?? false;
}

// All unclassified controls remain shared/controller-only. Plot gestures that
// modify hardware (IIR poles/zeros) also enforce this in IirPlot itself.
const LOCAL_CONTROL_IDS = new Set([
  "show-ch1", "show-ch2", "scope-xy-mode", "scope-math-active", "scope-math-formula",
  "zoom-reset", "spectrum-zoom-reset", "iir-zoom-reset", "network-reset",
  "save-curve", "spectrum-save-curve", "network-save",
  "lockbox-input-plot-select", "lockbox-output-plot-select",
  "curve-viewer-select", "curve-viewer-refresh", "curve-viewer-name", "curve-viewer-params",
  "config-module", "config-refresh", "config-text",
  "hk-refresh", "telemetry-refresh", "sampler-stats-signal", "sampler-stats-duration", "sampler-stats-run",
  "register-read-addr", "register-read-length", "register-read", "register-output",
]);

export function isLocalControl(control: HTMLElement): boolean {
  return control.dataset.controlScope === "view" || !!control.closest(".workspace-pane-selector") ||
    LOCAL_CONTROL_IDS.has(control.id) || /^(spectrum-)?(zoom-(in|out|y-in|y-out)|pan-(left|right|up|down))$/.test(control.id);
}

const STORAGE_KEY = "pyrpl-websocket.plot-views.v1";
export class PlotViews {
  private values: Record<string, Record<string, string | number | boolean>> = {};

  constructor() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      for (const [module, attributes] of Object.entries(VIEW_ATTRIBUTES)) {
        for (const attribute of attributes) {
          const value = saved?.[module]?.[attribute];
          if (["string", "number", "boolean"].includes(typeof value)) this.set(module, attribute, value);
        }
      }
    } catch { /* Use server defaults until the user chooses a local view. */ }
  }

  set(module: string, attribute: string, value: string | number | boolean): void {
    if (!isViewAttribute(module, attribute)) throw new Error(`Not a local plot setting: ${module}.${attribute}`);
    (this.values[module] ??= {})[attribute] = value;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values)); } catch { /* Memory-only view. */ }
  }

  get(module: string): Record<string, string | number | boolean> {
    return { ...this.values[module] };
  }

  merge<T extends Record<string, unknown>>(module: string, state: T): T {
    return { ...state, ...this.values[module] };
  }
}
