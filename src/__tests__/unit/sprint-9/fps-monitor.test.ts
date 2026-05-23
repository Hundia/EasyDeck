import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FPSMonitor } from '@/lib/perf/FPSMonitor';

describe('FPSMonitor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('starts and stops without error', () => {
    const callbacks: Array<(time: number) => void> = [];
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: (time: number) => void) => {
      callbacks.push(cb);
      return callbacks.length;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(performance, 'now').mockReturnValue(0);

    const monitor = new FPSMonitor();
    expect(() => monitor.start()).not.toThrow();
    expect(() => monitor.stop()).not.toThrow();
  });

  it('fps returns 0 when no frames recorded', () => {
    const monitor = new FPSMonitor();
    expect(monitor.fps).toBe(0);
  });

  it('isBelow60 returns correct value', () => {
    let frame = 0;
    const callbacks = new Map<number, (time: number) => void>();
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: (time: number) => void) => {
      frame += 1;
      callbacks.set(frame, cb);
      return frame;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
      callbacks.delete(id);
    }));
    vi.spyOn(performance, 'now').mockReturnValue(0);

    const monitor = new FPSMonitor();
    monitor.start();
    callbacks.get(1)?.(20);
    callbacks.get(2)?.(40);
    callbacks.get(3)?.(60);
    expect(monitor.isBelow60).toBe(true);
    monitor.stop();
  });

  it('reset clears frames', () => {
    let frame = 0;
    const callbacks = new Map<number, (time: number) => void>();
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: (time: number) => void) => {
      frame += 1;
      callbacks.set(frame, cb);
      return frame;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
      callbacks.delete(id);
    }));
    vi.spyOn(performance, 'now').mockReturnValue(0);

    const monitor = new FPSMonitor();
    monitor.start();
    callbacks.get(1)?.(16);
    callbacks.get(2)?.(32);
    expect(monitor.fps).toBeGreaterThan(0);
    monitor.reset();
    expect(monitor.fps).toBe(0);
    monitor.stop();
  });
});
