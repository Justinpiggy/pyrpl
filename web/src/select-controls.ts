/** Numeric options need an explicit physical quantity; IDs/counts have no unit. */
const UNITS: Record<string, string> = {
  duration: "s", trigger_delay: "s", span: "Hz", rbw: "Hz",
  frequency: "Hz", center: "Hz", bandwidth: "Hz", acbandwidth: "Hz",
};

export function optionLabel(name: string, value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return String(value);
  const unit = UNITS[name];
  if (!unit) return String(value);
  const magnitude = Math.abs(value);
  const scales: Array<[number, string]> = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"]];
  const [scale, prefix] = value === 0 ? [1, ""] : scales.find(([scale]) => magnitude >= scale) ?? scales[scales.length - 1];
  return `${Number((value / scale).toPrecision(unit === "s" ? 4 : 6))} ${prefix}${unit}`;
}

/** Preserve exact wire values, tolerate float roundoff, and never silently blank a current value. */
export function setSelectValue(select: HTMLSelectElement, value: unknown, name: string): void {
  for (const option of select.querySelectorAll<HTMLOptionElement>("option[data-current-value]")) {
    if (option.value !== String(value)) option.remove();
  }
  let match = [...select.options].find(option => option.value === String(value));
  if (!match && typeof value === "number" && Number.isFinite(value)) {
    match = [...select.options].find(option => option.value.trim() !== "" &&
      Math.abs(Number(option.value) - value) <= Math.max(1e-15, Math.abs(value) * 1e-9));
  }
  if (match) select.value = match.value;
  else {
    const option = new Option(optionLabel(name, value), String(value));
    option.dataset.currentValue = "true";
    select.add(option);
    select.value = option.value;
  }
}
