import type uPlot from "uplot";

export const PLOT_COLORS = {
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

export function plotAxis(options: Partial<uPlot.Axis> = {}): uPlot.Axis {
  return {
    stroke: PLOT_COLORS.axis,
    grid: { stroke: PLOT_COLORS.grid, width: 1 },
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
