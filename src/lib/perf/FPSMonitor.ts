/**
 * Monitors frame rate using requestAnimationFrame timing.
 * Development utility — tree-shakeable in production.
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = 0;
  private rafId: number | null = null;
  private windowSize: number;

  constructor(windowSize = 60) {
    this.windowSize = windowSize;
  }

  start(): void {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const delta = now - this.lastTime;
      this.lastTime = now;
      if (delta > 0) {
        this.frames.push(1000 / delta);
        if (this.frames.length > this.windowSize) {
          this.frames.shift();
        }
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  get fps(): number {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  get isBelow60(): boolean {
    return this.fps < 58;
  }

  reset(): void {
    this.frames = [];
  }
}
