export type TimerHandle = ReturnType<typeof setTimeout>;

type ScheduleTimer = (callback: () => void, delay: number) => TimerHandle;
type CancelTimer = (handle: TimerHandle) => void;

export function reconnectDelay(attempt: number, baseDelay = 250, maxDelay = 5_000): number {
  const boundedAttempt = Math.max(0, Math.floor(attempt));
  const boundedBase = Math.max(1, Math.floor(baseDelay));
  const boundedMax = Math.max(boundedBase, Math.floor(maxDelay));
  return Math.min(boundedMax, boundedBase * (2 ** Math.min(boundedAttempt, 20)));
}

export class ReconnectScheduler {
  private attempt = 0;
  private timer: TimerHandle | null = null;

  constructor(
    private reconnect: () => void,
    private baseDelay = 250,
    private maxDelay = 5_000,
    private scheduleTimer: ScheduleTimer = (callback, delay) => window.setTimeout(callback, delay),
    private cancelTimer: CancelTimer = (handle) => window.clearTimeout(handle),
  ) {}

  schedule(): number | null {
    if (this.timer !== null) return null;
    const delay = reconnectDelay(this.attempt, this.baseDelay, this.maxDelay);
    this.attempt += 1;
    this.timer = this.scheduleTimer(() => {
      this.timer = null;
      this.reconnect();
    }, delay);
    return delay;
  }

  connected(): void {
    this.cancel();
  }

  cancel(resetAttempts = true): void {
    if (this.timer !== null) {
      this.cancelTimer(this.timer);
      this.timer = null;
    }
    if (resetAttempts) this.attempt = 0;
  }
}
