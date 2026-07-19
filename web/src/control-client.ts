export interface ControlStatus {
  policy: "single-writer" | "shared";
  role: "controller" | "observer" | "shared";
  controller: { id: string; label: string | null } | null;
  lease_seconds: number;
  lease_remaining: number | null;
}

const CLIENT_ID_KEY = "pyrpl-control-client-id";

function makeClientId(): string {
  try {
    const existing = window.sessionStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id = window.crypto.randomUUID();
    window.sessionStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return `browser-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export class ControlClient {
  readonly id = makeClientId();
  readonly label = `Browser ${this.id.slice(0, 8)}`;
  private readonly nativeFetch: typeof window.fetch;
  private heartbeatTimer: number | null = null;

  constructor() {
    this.nativeFetch = window.fetch.bind(window);
  }

  installFetchHeaders(): void {
    const nativeFetch = this.nativeFetch;
    window.fetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
      if (url.origin !== window.location.origin) return nativeFetch(input, init);
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
      headers.set("x-pyrpl-client-id", this.id);
      headers.set("x-pyrpl-client-label", this.label);
      return nativeFetch(input, { ...init, headers });
    }) as typeof window.fetch;
  }

  async initialize(): Promise<ControlStatus> {
    let status = await this.refresh();
    if (status.policy === "single-writer" && status.controller === null) {
      status = await this.claim(false);
    }
    this.startHeartbeat(status.lease_seconds);
    return status;
  }

  async refresh(): Promise<ControlStatus> {
    return this.request("/api/control", { method: "GET" });
  }

  async claim(force: boolean): Promise<ControlStatus> {
    return this.request("/api/control/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: this.label, force }),
    });
  }

  release(): void {
    void window.fetch("/api/control/release", { method: "POST", keepalive: true }).catch(() => undefined);
  }

  private startHeartbeat(leaseSeconds: number): void {
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    const interval = Math.max(2_000, Math.min(10_000, leaseSeconds * 400));
    this.heartbeatTimer = window.setInterval(() => {
      void this.request("/api/control/heartbeat", { method: "POST" }).catch(() => undefined);
    }, interval);
  }

  private async request(path: string, init: RequestInit): Promise<ControlStatus> {
    const response = await window.fetch(path, init);
    if (!response.ok) {
      let detail = `Control request failed: ${response.status}`;
      try {
        const payload = await response.json() as { detail?: string };
        if (payload.detail) detail = payload.detail;
      } catch {
        // Keep the status-based error when the response has no JSON body.
      }
      throw new Error(detail);
    }
    return response.json() as Promise<ControlStatus>;
  }
}
