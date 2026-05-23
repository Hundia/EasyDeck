import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryMonitor } from '@/lib/perf/MemoryMonitor';

describe('MemoryMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports isSupported correctly', () => {
    vi.stubGlobal('performance', {
      memory: {
        usedJSHeapSize: 100,
        totalJSHeapSize: 200,
        jsHeapSizeLimit: 300,
      },
    });

    expect(new MemoryMonitor().isSupported).toBe(true);
  });

  it('start/stop without error even when unsupported', () => {
    vi.stubGlobal('performance', {});

    const monitor = new MemoryMonitor();
    expect(() => monitor.start()).not.toThrow();
    expect(() => monitor.stop()).not.toThrow();
    expect(monitor.latest).toBeNull();
  });

  it("trend returns 'unknown' with insufficient data", () => {
    vi.stubGlobal('performance', {
      memory: {
        usedJSHeapSize: 100,
        totalJSHeapSize: 200,
        jsHeapSizeLimit: 300,
      },
    });

    const monitor = new MemoryMonitor();
    monitor.start(1000);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);
    expect(monitor.trend).toBe('unknown');
    monitor.stop();
  });

  it('reset clears snapshots', () => {
    vi.stubGlobal('performance', {
      memory: {
        usedJSHeapSize: 100,
        totalJSHeapSize: 200,
        jsHeapSizeLimit: 300,
      },
    });

    const monitor = new MemoryMonitor();
    monitor.start(10);
    vi.advanceTimersByTime(30);
    expect(monitor.latest).not.toBeNull();
    monitor.reset();
    expect(monitor.latest).toBeNull();
    expect(monitor.trend).toBe('unknown');
    monitor.stop();
  });
});
