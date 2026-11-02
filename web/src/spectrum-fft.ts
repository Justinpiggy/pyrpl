import { parseScopeFrame } from "./scope-frame";

export const SPECTRUM_PADDING_FACTOR = 16;
const enbwCache = new Map<string, number>();

export function spectrumResolutionBandwidth(span: number, window: string, count = 16384): number {
  const key = `${window}:${count}`;
  let enbw = enbwCache.get(key);
  if (enbw === undefined) {
    const weights = spectrumWindow(window, count);
    const sum = weights.reduce((total, value) => total + value, 0);
    enbw = sum === 0 ? 0 : weights.reduce((total, value) => total + value * value, 0) / (sum * sum);
    enbwCache.set(key, enbw);
  }
  return span * enbw;
}
const ADC_SAMPLE_RATE = 125e6;

export interface SpectrumSeries {
  label: string;
  values: Float64Array;
  imaginary?: Float64Array;
}

export interface SpectrumFrame {
  sequence: number;
  currentAverage?: number;
  x: Float64Array;
  series: SpectrumSeries[];
  span: number;
  center: number;
  rbw: number;
  unit: string;
  running_state: string;
}

export interface SpectrumSettings {
  baseband: boolean;
  span: number;
  center: number;
  window: string;
  displayUnit: string;
  displayInput1Baseband: boolean;
  displayInput2Baseband: boolean;
  displayCrossAmplitude: boolean;
  traceAverage: number;
  runningState: string;
  iqBandwidth: number[];
}

export function spectrumFromScopeBuffer(
  buffer: ArrayBuffer,
  settings: SpectrumSettings,
  paddingFactor = SPECTRUM_PADDING_FACTOR,
): SpectrumFrame {
  const frame = parseScopeFrame(buffer);
  const count = largestPowerOfTwo(frame.sampleCount);
  const fftCount = count * normalizedPaddingFactor(paddingFactor);
  const window = spectrumWindow(settings.window, count);
  const ch1 = new Float64Array(fftCount);
  const ch2 = new Float64Array(fftCount);
  for (let index = 0; index < count; index += 1) {
    ch1[index] = (frame.samples[index * frame.channelCount] ?? 0) * window[index];
    ch2[index] = (frame.samples[index * frame.channelCount + 1] ?? 0) * window[index];
  }
  const windowSum = window.reduce((total, value) => total + value, 0);
  const windowSquareSum = window.reduce((total, value) => total + value * value, 0);
  const rbw = windowSum === 0 ? 0 : settings.span * windowSquareSum / (windowSum * windowSum);
  if (settings.baseband) {
    return basebandSpectrum(frame.sequence, ch1, ch2, fftCount, rbw, settings);
  }
  return iqSpectrum(frame.sequence, ch1, ch2, fftCount, rbw, settings);
}

function basebandSpectrum(
  sequence: number,
  ch1: Float64Array,
  ch2: Float64Array,
  fftCount: number,
  rbw: number,
  settings: SpectrumSettings,
): SpectrumFrame {
  const fft1 = realFft(ch1);
  const fft2 = realFft(ch2);
  const x = new Float64Array(fft1.real.length);
  const correction = new Float64Array(x.length);
  for (let index = 0; index < x.length; index += 1) {
    x[index] = index * settings.span / fftCount;
    correction[index] = scopePowerCorrection(x[index], settings.span);
  }
  const series: SpectrumSeries[] = [];
  series.push({ label: "Input 1", values: powerSpectrum(fft1, correction) });
  series.push({ label: "Input 2", values: powerSpectrum(fft2, correction) });
  const cross = crossSpectrum(fft1, fft2, correction);
  series.push({ label: "Cross", values: cross.real, imaginary: cross.imag });
  return spectrumFrame(sequence, x, series, rbw, settings);
}

function iqSpectrum(
  sequence: number,
  ch1: Float64Array,
  ch2: Float64Array,
  fftCount: number,
  rbw: number,
  settings: SpectrumSettings,
): SpectrumFrame {
  const fft = complexFft(ch1, ch2);
  const shifted = fftShiftPower(fft);
  const x = new Float64Array(shifted.length);
  for (let index = 0; index < x.length; index += 1) {
    const offset = (index - shifted.length / 2) * settings.span / fftCount;
    x[index] = settings.center + offset;
    shifted[index] *= iqPowerCorrection(offset, settings);
  }
  return spectrumFrame(sequence, x, [{ label: "IQ", values: shifted }], rbw, settings);
}

function spectrumFrame(
  sequence: number,
  x: Float64Array,
  series: SpectrumSeries[],
  rbw: number,
  settings: SpectrumSettings,
): SpectrumFrame {
  return {
    sequence,
    x,
    series,
    span: settings.span,
    center: settings.center,
    rbw,
    unit: settings.displayUnit,
    running_state: settings.runningState,
  };
}

function realFft(realInput: Float64Array): { real: Float64Array; imag: Float64Array } {
  const fft = complexFft(realInput, new Float64Array(realInput.length));
  const half = realInput.length / 2 + 1;
  return { real: fft.real.slice(0, half), imag: fft.imag.slice(0, half) };
}

function complexFft(realInput: Float64Array, imagInput: Float64Array): { real: Float64Array; imag: Float64Array } {
  const n = realInput.length;
  const real = new Float64Array(realInput);
  const imag = new Float64Array(imagInput);
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }
  for (let length = 2; length <= n; length <<= 1) {
    const angle = -2 * Math.PI / length;
    const stepReal = Math.cos(angle);
    const stepImag = Math.sin(angle);
    for (let start = 0; start < n; start += length) {
      let weightReal = 1;
      let weightImag = 0;
      for (let offset = 0; offset < length / 2; offset += 1) {
        const even = start + offset;
        const odd = even + length / 2;
        const oddReal = real[odd] * weightReal - imag[odd] * weightImag;
        const oddImag = real[odd] * weightImag + imag[odd] * weightReal;
        const evenReal = real[even];
        const evenImag = imag[even];
        real[even] = evenReal + oddReal;
        imag[even] = evenImag + oddImag;
        real[odd] = evenReal - oddReal;
        imag[odd] = evenImag - oddImag;
        const nextReal = weightReal * stepReal - weightImag * stepImag;
        weightImag = weightReal * stepImag + weightImag * stepReal;
        weightReal = nextReal;
      }
    }
  }
  return { real, imag };
}

function powerSpectrum(
  fft: { real: Float64Array; imag: Float64Array },
  correction?: Float64Array,
): Float64Array {
  const power = new Float64Array(fft.real.length);
  for (let index = 0; index < power.length; index += 1) {
    power[index] = (fft.real[index] ** 2 + fft.imag[index] ** 2) * (correction?.[index] ?? 1);
  }
  return power;
}

function crossSpectrum(
  left: { real: Float64Array; imag: Float64Array },
  right: { real: Float64Array; imag: Float64Array },
  correction: Float64Array,
): { real: Float64Array; imag: Float64Array } {
  const real = new Float64Array(left.real.length);
  const imag = new Float64Array(left.real.length);
  for (let index = 0; index < real.length; index += 1) {
    const scale = correction[index];
    real[index] = (left.real[index] * right.real[index] + left.imag[index] * right.imag[index]) * scale;
    imag[index] = (left.real[index] * right.imag[index] - left.imag[index] * right.real[index]) * scale;
  }
  return { real, imag };
}

function fftShiftPower(fft: { real: Float64Array; imag: Float64Array }): Float64Array {
  const power = powerSpectrum(fft);
  const shifted = new Float64Array(power.length);
  const half = Math.floor(power.length / 2);
  shifted.set(power.slice(half), 0);
  shifted.set(power.slice(0, half), power.length - half);
  return shifted;
}

function scopePowerCorrection(frequency: number, span: number): number {
  if (Math.round(ADC_SAMPLE_RATE / span) <= 1) return 1;
  const normalized = frequency / span;
  const transfer = normalized === 0 ? 1 : Math.sin(Math.PI * normalized) / (Math.PI * normalized);
  return 1 / Math.max(transfer * transfer, Number.EPSILON);
}

function iqPowerCorrection(offset: number, settings: SpectrumSettings): number {
  let correction = scopePowerCorrection(offset, settings.span);
  const bandwidths = settings.iqBandwidth.length ? settings.iqBandwidth : [settings.span, settings.span, settings.span, settings.span];
  for (const bandwidth of bandwidths) {
    if (bandwidth > 0) correction *= 1 + (offset / bandwidth) ** 2;
    else if (bandwidth < 0 && offset !== 0) correction *= 1 + (bandwidth / offset) ** 2;
  }
  return correction;
}

export function spectrumWindow(name: string, count: number): Float64Array {
  const values = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    const phase = count > 1 ? 2 * Math.PI * index / (count - 1) : 0;
    if (name === "boxcar") values[index] = 1;
    else if (name === "hamming") values[index] = 0.54 - 0.46 * Math.cos(phase);
    else if (name === "flattop") {
      values[index] = 1 - 1.93 * Math.cos(phase) + 1.29 * Math.cos(2 * phase) - 0.388 * Math.cos(3 * phase) + 0.032 * Math.cos(4 * phase);
    } else if (name === "gaussian") {
      const center = (count - 1) / 2;
      values[index] = Math.exp(-0.5 * ((index - center) / Math.max(1, count / 10)) ** 2);
    } else values[index] = 0.42 - 0.5 * Math.cos(phase) + 0.08 * Math.cos(2 * phase);
  }
  const sum = values.reduce((total, value) => total + value, 0);
  const scale = sum ? 2 / sum : 1;
  for (let index = 0; index < values.length; index += 1) values[index] *= scale;
  return values;
}

function largestPowerOfTwo(value: number): number {
  return 2 ** Math.floor(Math.log2(Math.max(2, value)));
}

function normalizedPaddingFactor(value: number): number {
  return 2 ** Math.floor(Math.log2(Math.max(1, value)));
}


export function spectrumFromCorrelationBuffer(buffer: ArrayBuffer, settings: SpectrumSettings): SpectrumFrame {
  const size = new DataView(buffer).getUint32(4, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 8, size)));
  const count = Number(meta.samples);
  const correlations = new Float64Array(buffer, 8 + size);
  const length = count * 2;
  const fftCount = count * SPECTRUM_PADDING_FACTOR;
  const padded = (row: number): Float64Array => {
    const data = correlations.subarray(row * length, (row + 1) * length);
    const result = new Float64Array(fftCount);
    result.set(data.subarray(0, count));
    result.set(data.subarray(count), fftCount - count);
    return result;
  };
  const state = { ...settings, baseband: meta.baseband, span: meta.span, center: meta.center, window: meta.window, iqBandwidth: meta.iqBandwidth };
  const window = spectrumWindow(state.window, count);
  const sum = window.reduce((a, b) => a + b, 0);
  const rbw = state.span * window.reduce((a, b) => a + b * b, 0) / (sum * sum);
  const bins = state.baseband ? fftCount / 2 + 1 : fftCount;
  const x = new Float64Array(bins);
  const series: SpectrumSeries[] = [];
  if (state.baseband) {
    for (let row = 0; row < 3; row += 1) {
      const transform = complexFft(padded(row), new Float64Array(fftCount));
      const values = transform.real.slice(0, bins);
      let imaginary: Float64Array | undefined;
      if (row === 2) imaginary = complexFft(padded(3), new Float64Array(fftCount)).imag.slice(0, bins);
      for (let index = 0; index < bins; index += 1) {
        x[index] = index * state.span / fftCount;
        const correction = scopePowerCorrection(x[index], state.span);
        values[index] *= correction;
        if (row < 2) values[index] = Math.max(0, values[index]);
        if (imaginary) imaginary[index] *= correction;
      }
      series.push({ label: ["Input 1", "Input 2", "Cross"][row], values, ...(imaginary ? { imaginary } : {}) });
    }
  } else {
    const transform = complexFft(padded(0), padded(1));
    const values = new Float64Array(bins);
    for (let index = 0; index < bins; index += 1) {
      const offset = (index - bins / 2) * state.span / bins;
      x[index] = state.center + offset;
      values[index] = Math.max(0, transform.real[(index + bins / 2) % bins]) * iqPowerCorrection(offset, state);
    }
    series.push({ label: "IQ", values });
  }
  return { ...spectrumFrame(meta.sequence, x, series, rbw, state), currentAverage: meta.count };
}
