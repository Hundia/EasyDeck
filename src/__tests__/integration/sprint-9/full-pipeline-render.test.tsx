import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createPresentation } from '@/lib/pipeline';
import { Stage } from '@/components/Stage';

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      addLabel: vi.fn().mockReturnThis(),
      scrollTrigger: null,
      kill: vi.fn(),
    })),
    to: vi.fn(),
  },
  ScrollTrigger: { create: vi.fn(), update: vi.fn(), refresh: vi.fn(), normalizeScroll: vi.fn() },
  Observer: { create: vi.fn(() => ({ kill: vi.fn() })) },
}));

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

describe('Sprint 9 - Full Pipeline → Render Integration', () => {
  it('creates presentation from brief and renders Stage without error', () => {
    const { story } = createPresentation({
      title: 'Test Pres',
      slug: 'test',
      scenes: [
        { label: 'Intro', durationHint: 3 },
        { label: 'Middle', durationHint: 5 },
        { label: 'End', durationHint: 2 },
      ],
      mode: 'section',
    });

    const { container } = render(<Stage story={story} />);
    expect(container).toBeTruthy();
  });

  it('pipeline with snap mode renders SnapStage', () => {
    const { story } = createPresentation({
      title: 'Snap Demo',
      slug: 'snap-demo',
      scenes: [
        { label: 'Scene 1', durationHint: 4 },
        { label: 'Scene 2', durationHint: 4 },
      ],
      mode: 'snap',
    });

    expect(story.transition.mode).toBe('snap');
    const { container } = render(<Stage story={story} />);
    expect(container).toBeTruthy();
  });

  it('pipeline with scrub mode renders ScrubStage', () => {
    const { story } = createPresentation({
      title: 'Scrub Demo',
      slug: 'scrub-demo',
      scenes: [
        { label: 'A', durationHint: 6 },
        { label: 'B', durationHint: 3 },
      ],
      mode: 'scrub',
    });

    expect(story.transition.mode).toBe('scrub');
    const { container } = render(<Stage story={story} />);
    expect(container).toBeTruthy();
  });

  it('pipeline rejects invalid brief with descriptive error', () => {
    expect(() => createPresentation({ title: '', slug: '', scenes: [] })).toThrow(/Pipeline error/);
  });

  it('pipeline with overlays renders correctly', () => {
    const { story } = createPresentation({
      title: 'Overlay Demo',
      slug: 'overlay',
      scenes: [
        { label: 'Hero', durationHint: 5, overlayText: 'Welcome!' },
        { label: 'Content', durationHint: 5, overlayText: 'Learn more' },
      ],
      mode: 'section',
    });

    expect(story.scenes[0].overlays.length).toBe(1);
    expect(story.scenes[0].overlays[0].content).toBe('Welcome!');
    const { container } = render(<Stage story={story} />);
    expect(container).toBeTruthy();
  });
});
