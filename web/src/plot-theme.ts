import type uPlot from "uplot";

export const PLOT_COLORS = {
  background: "#05080a",
  text: "#edf4f7",
  axis: "#93a7b3",
  grid: "#1c2a33",
  green: "#4fd17f",
  red: "#ef6461",
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
