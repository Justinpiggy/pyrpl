/** PYC1: magic, uint32 LE header length, JSON metadata, float64 LE x/y[/imag]. */
export function encodeCurveUpload(
  x: number[], y: number[], params: Record<string, unknown>, yImag?: number[],
): ArrayBuffer {
  if (!x.length || y.length !== x.length || (yImag && yImag.length !== x.length)) {
    throw new Error("Curve arrays must have the same nonzero length");
  }
  const header = new TextEncoder().encode(JSON.stringify({ points: x.length, complex: !!yImag, params }));
  const columns = yImag ? [x, y, yImag] : [x, y];
  const buffer = new ArrayBuffer(8 + header.length + columns.length * x.length * 8);
  const bytes = new Uint8Array(buffer);
  bytes.set([0x50, 0x59, 0x43, 0x31]);
  const view = new DataView(buffer);
  view.setUint32(4, header.length, true);
  bytes.set(header, 8);
  let offset = 8 + header.length;
  for (const column of columns) {
    for (const value of column) {
      view.setFloat64(offset, value, true);
      offset += 8;
    }
  }
  return buffer;
}
