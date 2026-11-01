/// <reference lib="webworker" />

import { spectrumFromCorrelationBuffer, spectrumFromScopeBuffer, type SpectrumFrame, type SpectrumSettings } from "./spectrum-fft";

interface SpectrumWorkerRequest {
  id: number;
  generation: number;
  buffer: ArrayBuffer;
  settings: SpectrumSettings;
}

interface SpectrumWorkerResponse {
  id: number;
  generation: number;
  frame?: SpectrumFrame;
  error?: string;
}

const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = (event: MessageEvent<SpectrumWorkerRequest>) => {
  const { id, generation, buffer, settings } = event.data;
  try {
    const averaged = new DataView(buffer).getUint32(0, true) === 0x31415750;
    const frame = averaged ? spectrumFromCorrelationBuffer(buffer, settings) : spectrumFromScopeBuffer(buffer, settings);
    const transfers: Transferable[] = [frame.x.buffer];
    for (const series of frame.series) {
      transfers.push(series.values.buffer);
      if (series.imaginary) transfers.push(series.imaginary.buffer);
    }
    const response: SpectrumWorkerResponse = { id, generation, frame };
    worker.postMessage(response, transfers);
  } catch (error) {
    const response: SpectrumWorkerResponse = {
      id,
      generation,
      error: error instanceof Error ? error.message : String(error),
    };
    worker.postMessage(response);
  }
};
