/** Convert linear Vpk^2 to the requested display quantity. */
export function convertPower(power: Float64Array, unit: string, rbw: number): Float64Array {
  const values = new Float64Array(power.length);
  for (let index = 0; index < power.length; index += 1) {
    const safe = Math.max(power[index], Number.EPSILON);
    if (unit === "dB(Vpk^2)") {
      values[index] = 10 * Math.log10(safe);
    } else if (unit === "Vpk") {
      values[index] = Math.sqrt(safe);
    } else if (unit === "Vrms^2") {
      values[index] = safe / 2;
    } else if (unit === "dB(Vrms^2)") {
      values[index] = 10 * Math.log10(safe / 2 + Number.EPSILON);
    } else if (unit === "Vrms") {
      values[index] = Math.sqrt(safe) / Math.SQRT2;
    } else if (unit === "Vrms^2/Hz") {
      values[index] = safe / 2 / Math.max(rbw, Number.EPSILON);
    } else if (unit === "dB(Vrms^2/Hz)") {
      values[index] = 10 * Math.log10(safe / 2 / Math.max(rbw, Number.EPSILON) + Number.EPSILON);
    } else if (unit === "Vrms/sqrt(Hz)") {
      values[index] = Math.sqrt(safe / 2 / Math.max(rbw, Number.EPSILON));
    } else {
      values[index] = safe;
    }
  }
  return values;
}
