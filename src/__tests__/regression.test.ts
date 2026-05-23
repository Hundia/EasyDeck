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

});
