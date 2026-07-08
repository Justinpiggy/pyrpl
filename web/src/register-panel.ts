export interface RegisterPanelElements {
  readAddr: HTMLInputElement;
  readLength: HTMLInputElement;
  readButton: HTMLButtonElement;
  writeAddr: HTMLInputElement;
  writeValues: HTMLInputElement;
  writeButton: HTMLButtonElement;
  status: HTMLOutputElement;
  output: HTMLTextAreaElement;
}

export interface RegisterPanel {
  read: () => Promise<void>;
  write: () => Promise<void>;
}

interface RegisterReadResponse {
  length: number;
  values: number[];
}

interface RegisterWriteResponse {
  count: number;
}

function parseRegisterInteger(value: string): number {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Register value is empty");
  }
  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid register integer: ${value}`);
  }
  return parsed;
}

function parseRegisterValues(value: string): number[] {
  const values = value
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseRegisterInteger);
  if (values.length === 0) {
    throw new Error("At least one register value is required");
  }
  return values;
}

function formatRegisterValue(value: number): string {
  return `0x${(value >>> 0).toString(16).padStart(8, "0")} (${value >>> 0})`;
}

async function postJson<T>(url: string, body: unknown, errorPrefix: string): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function createRegisterPanel(elements: RegisterPanelElements): RegisterPanel {
  async function read(): Promise<void> {
    const addr = parseRegisterInteger(elements.readAddr.value);
    const length = Math.max(1, Math.min(64, Number(elements.readLength.value)));
    const payload = await postJson<RegisterReadResponse>("/api/register/read", { addr, length }, "Register read failed");
    elements.status.textContent = `read ${payload.length} word${payload.length === 1 ? "" : "s"}`;
    elements.output.value = payload.values
      .map((value, index) => `${formatRegisterValue(addr + index * 4)}: ${formatRegisterValue(value)}`)
      .join("\n");
  }

  async function write(): Promise<void> {
    const addr = parseRegisterInteger(elements.writeAddr.value);
    const values = parseRegisterValues(elements.writeValues.value);
    const payload = await postJson<RegisterWriteResponse>(
      "/api/register/write",
      { addr, values },
      "Register write failed",
    );
    elements.status.textContent = `wrote ${payload.count} word${payload.count === 1 ? "" : "s"}`;
    elements.output.value = values
      .map((value, index) => `${formatRegisterValue(addr + index * 4)} <= ${formatRegisterValue(value)}`)
      .join("\n");
  }

  elements.readButton.addEventListener("click", () => {
    read().catch((error: Error) => {
      elements.status.textContent = error.message;
    });
  });

  elements.writeButton.addEventListener("click", () => {
    write().catch((error: Error) => {
      elements.status.textContent = error.message;
    });
  });

  return { read, write };
}
