/** Trim fractional padding without removing significant zeros from integers. */
export function trimFixed(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "0";
  const fixed = value.toFixed(decimals);
  const text = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  return text === "-0" ? "0" : text;
}

export function frequencyTick(value: number): string {
  const scale = value >= 1e6 ? 1e6 : value >= 1e3 ? 1e3 : 1;
  const suffix = scale === 1e6 ? "MHz" : scale === 1e3 ? "kHz" : "Hz";
  return `${Number((value / scale).toPrecision(3))} ${suffix}`;
}
