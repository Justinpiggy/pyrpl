import uPlot from "uplot";

const DEFAULT_COLORS = {
  background: "#05080a",
  text: "#edf4f7",
  axis: "#93a7b3",
  grid: "#1c2a33",
  green: "#4fd17f",
  red: "#ef6461",
  orange: "#ff9f43",
  blue: "#62a8ff",
  yellow: "#f2c94c",
  magenta: "#f05bd7",
};
type PlotColor = keyof typeof DEFAULT_COLORS;
let palette = { ...DEFAULT_COLORS };
const plots = new Set<uPlot>();

function readPalette(): void {
  const style = getComputedStyle(document.documentElement);
  for (const name of Object.keys(palette) as PlotColor[]) {
    palette[name] = style.getPropertyValue(`--plot-${name === "background" ? "bg" : name}`).trim() || DEFAULT_COLORS[name];
  }
}

// uPlot evaluates color callbacks on redraw, including already constructed plots.
export const PLOT_COLORS = Object.fromEntries(
  (Object.keys(DEFAULT_COLORS) as PlotColor[]).map(name => [name, () => palette[name]]),
) as Record<PlotColor, () => string>;

function refreshPlotColors(plot: uPlot): void {
  plot.redraw(false, true); // Preserve data, scales, zoom, visibility and interaction state.
  const rows = plot.root.querySelectorAll<HTMLElement>(".u-legend .u-series");
  const offset = plot.series.length - rows.length; // Non-live/XY legends omit X.
  rows.forEach((row, index) => {
    const seriesIndex = index + offset;
    if (seriesIndex === 0) return;
    const stroke = plot.series[seriesIndex]?.stroke;
    const color = typeof stroke === "function" ? stroke(plot, seriesIndex) : stroke;
    const marker = row.querySelector<HTMLElement>(".u-marker");
    if (marker && typeof color === "string") {
      marker.style.borderColor = color;
      marker.style.backgroundColor = color;
    }
  });
}

window.addEventListener("pyrpl-theme-change", () => {
  readPalette();
  for (const plot of plots) refreshPlotColors(plot);
});

export function createThemedPlot(options: uPlot.Options, data: uPlot.AlignedData, target: HTMLElement): uPlot {
  readPalette();
  return new uPlot({
    ...options,
    hooks: {
      ...options.hooks,
      init: [...(options.hooks?.init ?? []), plot => { plots.add(plot); }],
      destroy: [...(options.hooks?.destroy ?? []), plot => { plots.delete(plot); }],
    },
  }, data, target);
}

export function plotAxis(options: Partial<uPlot.Axis> = {}): uPlot.Axis {
  return {
    stroke: PLOT_COLORS.axis,
    grid: { stroke: PLOT_COLORS.grid, width: 1 },
    ticks: { stroke: PLOT_COLORS.grid, width: 1 },
    ...options,
  };
}

/** uPlot's height sizes its canvas/axes, excluding title and legend. */
export function fitPlotToFrame(plot: uPlot, frame: HTMLElement): boolean {
  const bounds = frame.getBoundingClientRect();
  if (bounds.width < 40 || bounds.height < 80) return false;
  const chromeHeight = () => [...plot.root.children].reduce((height, child) => {
    if (!child.matches(".u-title,.u-legend")) return height;
    const style = getComputedStyle(child);
    if (style.display === "none") return height;
    return height + child.getBoundingClientRect().height
      + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
  }, 0);
  // A width change can wrap the legend. Measure again after the first layout.
  for (let pass = 0; pass < 2; pass++) {
    // uPlot normally defers DOM sizing to a microtask. Commit synchronously so
    // the next pass measures the legend at the new width, not the old width.
    plot.batch(() => plot.setSize({ width: Math.floor(bounds.width), height: Math.max(80, Math.floor(bounds.height - chromeHeight())) }));
  }
  return true;
}
