// Master regression runner - grows with each sprint
// Import all sprint test modules to ensure they run together
import { describe, it, expect } from "vitest";

describe("Regression Suite", () => {
  describe("Sprint 1 - Schema Layer", () => {
    it("imports sprint-1 tests successfully", async () => {
      // This ensures the sprint-1 test file is valid and importable
      const mod = await import("./unit/sprint-1/schema-validation.test");
      expect(mod).toBeDefined();
    });
  });
});
