const MAGIC = "PWS1";
const HEADER_BYTES = 24;

export interface ScopeFrame {
  channelCount: number;
  sampleCount: number;
  sequence: number;
  samples: Float32Array;
}

export interface ScopeFrameData {
  x: Float64Array;
  ch1: Float32Array;
  ch2: Float32Array;
}

export interface ScopeTimeSettings {
  duration: number;
  triggerDelay: number;
  triggerSource: string;
}

export function parseScopeFrame(buffer: ArrayBuffer): ScopeFrame {
  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error("Scope frame too short");
  }
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)));
  if (magic !== MAGIC) {
    throw new Error(`Bad frame magic: ${magic}`);
  }
  const version = view.getUint16(4, true);
  if (version !== 1) {
    throw new Error(`Unsupported scope frame version: ${version}`);
  }
  const channelCount = view.getUint16(6, true);
  const sampleCount = view.getUint32(8, true);
  const samples = new Float32Array(buffer, HEADER_BYTES);
  if (samples.length !== sampleCount * channelCount) {
    throw new Error("Scope frame payload length does not match metadata");
  }
  return {
    channelCount,
    sampleCount,
    sequence: view.getUint32(20, true),
    samples,
  };
}

export function frameToData(frame: ScopeFrame, timeSettings?: ScopeTimeSettings): ScopeFrameData {
  const x = new Float64Array(frame.sampleCount);
  const ch1 = new Float32Array(frame.sampleCount);
  const ch2 = new Float32Array(frame.sampleCount);
  const xMin =
    timeSettings && timeSettings.triggerSource !== "immediately"
      ? timeSettings.triggerDelay - timeSettings.duration / 2
      : 0;
  const xSpan = timeSettings ? timeSettings.duration : Math.max(0, frame.sampleCount - 1);
  const xStep = frame.sampleCount > 0 ? xSpan / frame.sampleCount : 0;

  for (let index = 0; index < frame.sampleCount; index += 1) {
    x[index] = timeSettings ? xMin + index * xStep : index;
    ch1[index] = frame.samples[index * frame.channelCount] ?? 0;
    ch2[index] = frame.channelCount > 1 ? (frame.samples[index * frame.channelCount + 1] ?? 0) : 0;
  }

  return { x, ch1, ch2 };
}

export function averageFrameData(
  next: ScopeFrameData,
  previous: ScopeFrameData | null,
  currentAverage: number,
  traceAverage: number,
): { data: ScopeFrameData; currentAverage: number } {
  const nextAverage = Math.min(currentAverage + 1, Math.max(1, Math.floor(traceAverage)));
  if (nextAverage <= 1 || !previous || previous.ch1.length !== next.ch1.length || previous.ch2.length !== next.ch2.length) {
    return { data: next, currentAverage: 1 };
  }

  const ch1 = new Float32Array(next.ch1.length);
  const ch2 = new Float32Array(next.ch2.length);
  const priorWeight = nextAverage - 1;
  for (let index = 0; index < next.ch1.length; index += 1) {
    ch1[index] = (previous.ch1[index] * priorWeight + next.ch1[index]) / nextAverage;
    ch2[index] = (previous.ch2[index] * priorWeight + next.ch2[index]) / nextAverage;
  }
  return {
    data: { x: next.x, ch1, ch2 },
    currentAverage: nextAverage,
  };
}

export function clampXRange(min: number, max: number, maxX: number, minimumSpan = 4): { min: number; max: number } {
  const boundedMaxX = Math.max(1, maxX);
  const span = Math.min(boundedMaxX, Math.max(minimumSpan, max - min));
  let nextMin = min;
  let nextMax = min + span;

  if (nextMin < 0) {
    nextMax -= nextMin;
    nextMin = 0;
  }
  if (nextMax > boundedMaxX) {
    nextMin -= nextMax - boundedMaxX;
    nextMax = boundedMaxX;
  }

  return {
    min: Math.max(0, nextMin),
    max: Math.min(boundedMaxX, Math.max(span, nextMax)),
  };
}
