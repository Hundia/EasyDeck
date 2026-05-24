import { describe, it, expect } from 'vitest';
import { ContentBrief } from '@/lib/pipeline/schemas';
import * as fs from 'fs';
import * as path from 'path';

describe('Sprint 12: Multi-Agent Chat Support', () => {
  describe('Agent instruction files exist', () => {
    const root = path.resolve(__dirname, '../../../..');

    it('AGENTS.md exists and contains workflow', () => {
      const content = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf-8');
      expect(content).toContain('ContentBrief');
      expect(content).toContain('createPresentation');
      expect(content).toContain('Stage');
      expect(content).toContain('section');
      expect(content).toContain('snap');
      expect(content).toContain('scrub');
    });

    it('.github/copilot-instructions.md exists', () => {
      const content = fs.readFileSync(path.join(root, '.github/copilot-instructions.md'), 'utf-8');
      expect(content).toContain('AGENTS.md');
      expect(content).toContain('createPresentation');
    });

    it('.gemini/styleguide.md exists', () => {
      const content = fs.readFileSync(path.join(root, '.gemini/styleguide.md'), 'utf-8');
      expect(content).toContain('AGENTS.md');
      expect(content).toContain('ContentBrief');
    });

    it('CLAUDE.md references AGENTS.md', () => {
      const content = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('AGENTS.md');
    });
  });

  describe('ContentBrief examples from AGENTS.md validate', () => {
    it('minimal example passes Zod validation', () => {
      const result = ContentBrief.safeParse({
        title: "Quick Demo",
        slug: "quick-demo",
        scenes: [
          { label: "Hello", overlayText: "Welcome!" },
          { label: "World", overlayText: "Let's go." },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('full example passes Zod validation', () => {
      const result = ContentBrief.safeParse({
        title: "Product Launch 2025",
        slug: "product-launch-2025",
        mode: "section",
        fps: 30,
        imagePattern: "/frames/launch/frame-{index}.webp",
        scenes: [
          { label: "Hero", durationHint: 6, overlayText: "Introducing EasyDeck" },
          { label: "Problem", durationHint: 8, overlayText: "Presentations are broken" },
          { label: "Solution", durationHint: 10, overlayText: "Scroll-driven storytelling" },
          { label: "Features", durationHint: 8, overlayText: "Three modes. One component." },
          { label: "Demo", durationHint: 12, description: "Live demo section" },
          { label: "Pricing", durationHint: 5, overlayText: "Free and open source" },
          { label: "CTA", durationHint: 4, overlayText: "Get started now" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('snap mode example passes Zod validation', () => {
      const result = ContentBrief.safeParse({
        title: "Feature Explorer",
        slug: "feature-explorer",
        mode: "snap",
        scenes: [
          { label: "Overview", durationHint: 6 },
          { label: "Feature A", durationHint: 8 },
          { label: "Feature B", durationHint: 8 },
          { label: "Feature C", durationHint: 8 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('scrub mode example passes Zod validation', () => {
      const result = ContentBrief.safeParse({
        title: "Data Story",
        slug: "data-story",
        mode: "scrub",
        scenes: [
          { label: "Chapter 1", durationHint: 15 },
          { label: "Chapter 2", durationHint: 20 },
          { label: "Chapter 3", durationHint: 10 },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});
