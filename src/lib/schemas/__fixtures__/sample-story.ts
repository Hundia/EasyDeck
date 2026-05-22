import type { StorySchema } from "../story";

export const sampleStory = {
  meta: { title: "Product Launch", slug: "product-launch" },
  transition: {
    mode: "section" as const,
    duration: 1.0,
    ease: "power2.inOut" as const,
    directional: true,
    inertia: true,
    wrapEnabled: false,
    tolerance: 10,
    showPagination: true,
    enableKeyboard: true,
    snapDelay: 0.1,
    snapDurationMin: 0.2,
    snapDurationMax: 1.5,
  },
  scenes: [
    {
      id: "hero",
      label: "Hero Reveal",
      startFrame: 0,
      endFrame: 30,
      imageSequence: { pattern: "/frames/hero/{idx:0000}.webp", frameCount: 30 },
      overlays: [
        { id: "title", type: "text" as const, content: "Welcome", enterAt: 0.2, exitAt: 0.8, position: "center" as const },
      ],
    },
    {
      id: "features",
      label: "Feature Breakdown",
      startFrame: 30,
      endFrame: 60,
      imageSequence: { pattern: "/frames/features/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
    {
      id: "cta",
      label: "Call to Action",
      startFrame: 60,
      endFrame: 90,
      imageSequence: { pattern: "/frames/cta/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant" as const,
} satisfies Record<string, unknown> as unknown as StorySchema;
