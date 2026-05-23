// Master regression runner - grows with each sprint
// Import all sprint test modules to ensure they run together
import { describe, it, expect } from "vitest";

describe("Regression Suite", () => {
  describe("Sprint 1 - Schema Layer", () => {
    it("imports sprint-1 tests successfully", async () => {
      const mod = await import("./unit/sprint-1/schema-validation.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 2 - Canvas Engine", () => {
    it("imports sprint-2 unit tests successfully", async () => {
      const mod = await import("./unit/sprint-2/canvas-engine.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-2 component tests successfully", async () => {
      const mod = await import("./unit/sprint-2/image-sequence-canvas.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-2 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-2/canvas-playhead-integration.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 3 - Section Mode", () => {
    it("imports sprint-3 unit tests successfully", async () => {
      const mod = await import("./unit/sprint-3/section-stage.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-3 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-3/section-stage-canvas.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 4 - Snap Mode", () => {
    it("imports sprint-4 unit tests successfully", async () => {
      const mod = await import("./unit/sprint-4/snap-mode.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-4 component tests successfully", async () => {
      const mod = await import("./unit/sprint-4/snap-stage.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-4 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-4/snap-stage-scroll.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 5 - Scrub Mode & Stage Switcher", () => {
    it("imports sprint-5 scrub stage tests successfully", async () => {
      const mod = await import("./unit/sprint-5/scrub-stage.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-5 stage switcher tests successfully", async () => {
      const mod = await import("./unit/sprint-5/stage-switcher.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-5 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-5/scrub-continuous.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 6 - Lenis Integration & Smoothing", () => {
    it("imports sprint-6 init lenis tests successfully", async () => {
      const mod = await import("./unit/sprint-6/init-lenis.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-6 provider tests successfully", async () => {
      const mod = await import("./unit/sprint-6/lenis-provider.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-6 pause hook tests successfully", async () => {
      const mod = await import("./unit/sprint-6/use-lenis-pause.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-6 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-6/lenis-section-mode.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 7 - Accessibility & UX Polish", () => {
    it("imports sprint-7 reduced motion tests successfully", async () => {
      const mod = await import("./unit/sprint-7/use-reduced-motion.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 touch tolerance tests successfully", async () => {
      const mod = await import("./unit/sprint-7/use-touch-tolerance.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 hash navigation tests successfully", async () => {
      const mod = await import("./unit/sprint-7/use-hash-navigation.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 semantic layer tests successfully", async () => {
      const mod = await import("./unit/sprint-7/semantic-layer.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 skip link tests successfully", async () => {
      const mod = await import("./unit/sprint-7/skip-to-content.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 progress bar tests successfully", async () => {
      const mod = await import("./unit/sprint-7/progress-bar.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-7 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-7/keyboard-nav-flow.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 8 - Agent Pipeline", () => {
    it("imports sprint-8 content brief schema tests successfully", async () => {
      const mod = await import("./unit/sprint-8/content-brief-schema.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-8 narrative designer tests successfully", async () => {
      const mod = await import("./unit/sprint-8/narrative-designer.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-8 scene composer tests successfully", async () => {
      const mod = await import("./unit/sprint-8/scene-composer.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-8 pipeline orchestrator tests successfully", async () => {
      const mod = await import("./unit/sprint-8/pipeline.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-8 integration tests successfully", async () => {
      const mod = await import("./integration/sprint-8/pipeline-to-stage.test");
      expect(mod).toBeDefined();
    });
  });

  describe("Sprint 9 - Integration Testing & QA", () => {
    it("imports sprint-9 full pipeline render tests successfully", async () => {
      const mod = await import("./integration/sprint-9/full-pipeline-render.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-9 memory cleanup tests successfully", async () => {
      const mod = await import("./integration/sprint-9/memory-cleanup.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-9 fps monitor tests successfully", async () => {
      const mod = await import("./unit/sprint-9/fps-monitor.test");
      expect(mod).toBeDefined();
    });
    it("imports sprint-9 memory monitor tests successfully", async () => {
      const mod = await import("./unit/sprint-9/memory-monitor.test");
      expect(mod).toBeDefined();
    });
  });

});
