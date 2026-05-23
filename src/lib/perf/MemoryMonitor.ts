/**
 * Monitors JS heap memory usage.
 * Only works in Chromium (performance.memory).
 * Development utility.
 */
export interface MemorySnapshot {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

type PerformanceWithMemory = Performance & {
  memory?: MemorySnapshot;
};

export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  get isSupported(): boolean {
    return typeof performance !== 'undefined' && 'memory' in performance;
  }

  start(intervalMs = 1000): void {
    if (!this.isSupported) return;
    this.intervalId = setInterval(() => {
      const mem = (performance as PerformanceWithMemory).memory;
      if (!mem) return;
      this.snapshots.push({
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        timestamp: Date.now(),
      });
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  get trend(): 'stable' | 'growing' | 'unknown' {
    if (this.snapshots.length < 3) return 'unknown';
    const recent = this.snapshots.slice(-5);
    const first = recent[0].usedJSHeapSize;
    const last = recent[recent.length - 1].usedJSHeapSize;
    const growth = (last - first) / first;
    return growth > 0.1 ? 'growing' : 'stable';
  }

  get latest(): MemorySnapshot | null {
    return this.snapshots[this.snapshots.length - 1] ?? null;
  }

  reset(): void {
    this.snapshots = [];
  }
}
