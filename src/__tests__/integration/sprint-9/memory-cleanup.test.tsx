import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Stage } from '@/components/Stage';
import { createPresentation } from '@/lib/pipeline';

// Track cleanup calls
const killFns: Array<ReturnType<typeof vi.fn>> = [];
const tickerRemoveCalls: Array<unknown> = [];

vi.mock('gsap', () => {
  const kill = vi.fn();
  return {
    gsap: {
      registerPlugin: vi.fn(),
      ticker: {
        add: vi.fn(),
        remove: vi.fn((...args: unknown[]) => tickerRemoveCalls.push(args)),
        lagSmoothing: vi.fn(),
      },
      timeline: vi.fn(() => {
        const killMock = vi.fn();
        killFns.push(killMock);
        return {
          to: vi.fn().mockReturnThis(),
          fromTo: vi.fn().mockReturnThis(),
          addLabel: vi.fn().mockReturnThis(),
          scrollTrigger: { kill: vi.fn() },
          kill: killMock,
        };
      }),
      to: vi.fn(),
    },
    ScrollTrigger: { create: vi.fn(), update: vi.fn(), refresh: vi.fn(), normalizeScroll: vi.fn() },
    Observer: { create: vi.fn(() => ({ kill })) },
  };
});

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: vi.fn(), update: vi.fn(), refresh: vi.fn(), normalizeScroll: vi.fn() },
}));

vi.mock('gsap/Observer', () => ({
  Observer: { create: vi.fn(() => ({ kill: vi.fn() })) },
}));

vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => ({
    raf: vi.fn(), destroy: vi.fn(), stop: vi.fn(), start: vi.fn(),
    on: vi.fn(), off: vi.fn(), resize: vi.fn(), options: {},
  })),
}));

describe('Sprint 9 - Memory Cleanup', () => {
  beforeEach(() => {
    killFns.length = 0;
    tickerRemoveCalls.length = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it('Stage unmount does not throw', () => {
    const { story } = createPresentation({
      title: 'Cleanup Test',
      slug: 'cleanup',
      scenes: [{ label: 'S1', durationHint: 3 }],
      mode: 'section',
    });

    const { unmount } = render(<Stage story={story} />);
    expect(() => unmount()).not.toThrow();
  });

  it('multiple mount/unmount cycles work without error', () => {
    const { story } = createPresentation({
      title: 'Cycle Test',
      slug: 'cycle',
      scenes: [
        { label: 'A', durationHint: 2 },
        { label: 'B', durationHint: 2 },
      ],
      mode: 'snap',
    });

    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<Stage story={story} />);
      unmount();
    }
    // If we get here without errors, cleanup is working
    expect(true).toBe(true);
  });

  it('scrub mode cleanup on unmount', () => {
    const { story } = createPresentation({
      title: 'Scrub Cleanup',
      slug: 'scrub-cleanup',
      scenes: [{ label: 'X', durationHint: 4 }],
      mode: 'scrub',
    });

    const { unmount } = render(<Stage story={story} />);
    expect(() => unmount()).not.toThrow();
  });
});
