import { describe, it, expect } from "vitest";
import { TransitionMode, EaseId, TransitionConfig } from "@/lib/schemas/transition";
import { SceneConfig } from "@/lib/schemas/scene";
import { StorySchema } from "@/lib/schemas/story";
import { sampleStory } from "@/lib/schemas/__fixtures__/sample-story";

// ── Task 13: TransitionMode & EaseId ──────────────────────────────────────────

describe("TransitionMode", () => {
  it.each(["scrub", "snap", "section"])("accepts %s", (val) => {
    expect(TransitionMode.parse(val)).toBe(val);
  });

  it.each(["fade", "slide", ""])("rejects %s", (val) => {
    expect(() => TransitionMode.parse(val)).toThrow();
  });
});

describe("EaseId", () => {
  const valid = ["none", "power1.inOut", "power2.inOut", "power2.out", "power3.inOut", "power4.inOut", "expo.inOut", "circ.inOut"];
  it.each(valid)("accepts %s", (val) => {
    expect(EaseId.parse(val)).toBe(val);
  });

  it.each(["linear", "bounce"])("rejects %s", (val) => {
    expect(() => EaseId.parse(val)).toThrow();
  });
});

// ── Task 14: TransitionConfig ─────────────────────────────────────────────────

describe("TransitionConfig", () => {
  it("applies all defaults when given {}", () => {
    const result = TransitionConfig.parse({});
    expect(result.mode).toBe("section");
    expect(result.duration).toBe(1.0);
    expect(result.ease).toBe("power2.inOut");
    expect(result.directional).toBe(true);
    expect(result.inertia).toBe(true);
    expect(result.wrapEnabled).toBe(false);
    expect(result.tolerance).toBe(10);
    expect(result.showPagination).toBe(true);
    expect(result.enableKeyboard).toBe(true);
    expect(result.snapDelay).toBe(0.1);
    expect(result.snapDurationMin).toBe(0.2);
    expect(result.snapDurationMax).toBe(1.5);
  });

  it("rejects duration > 5", () => {
    expect(() => TransitionConfig.parse({ duration: 5.1 })).toThrow();
  });

  it("rejects duration < 0", () => {
    expect(() => TransitionConfig.parse({ duration: -0.1 })).toThrow();
  });

  it("rejects tolerance > 200", () => {
    expect(() => TransitionConfig.parse({ tolerance: 201 })).toThrow();
  });
});

// ── Task 15: SceneConfig ──────────────────────────────────────────────────────

describe("SceneConfig", () => {
  const validScene = {
    id: "scene-1",
    label: "Scene One",
    startFrame: 0,
    endFrame: 30,
    imageSequence: { pattern: "/frames/{idx:0000}.jpg", frameCount: 30 },
  };

  it("requires id, label, startFrame, endFrame, imageSequence", () => {
    expect(SceneConfig.parse(validScene)).toMatchObject({ id: "scene-1" });
  });

  it("rejects endFrame <= startFrame (equal)", () => {
    expect(() => SceneConfig.parse({ ...validScene, endFrame: 0 })).toThrow("endFrame must be greater than startFrame");
  });

  it("rejects endFrame < startFrame", () => {
    expect(() => SceneConfig.parse({ ...validScene, startFrame: 10, endFrame: 5 })).toThrow();
  });

  it("accepts valid overlays array", () => {
    const result = SceneConfig.parse({
      ...validScene,
      overlays: [
        { id: "o1", type: "text", content: "Hello", enterAt: 0.1, exitAt: 0.9, position: "center" },
      ],
    });
    expect(result.overlays).toHaveLength(1);
    expect(result.overlays[0].id).toBe("o1");
  });

  it("defaults overlays to []", () => {
    const result = SceneConfig.parse(validScene);
    expect(result.overlays).toEqual([]);
  });
});

// ── Tasks 16-17: StorySchema ──────────────────────────────────────────────────

describe("StorySchema", () => {
  const baseTransition = {
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
  };

  const makeScene = (id: string, start: number, end: number) => ({
    id,
    label: id,
    startFrame: start,
    endFrame: end,
    imageSequence: { pattern: `/frames/${id}/{idx:0000}.webp`, frameCount: end - start },
  });

  it("validates sample config successfully", () => {
    const result = StorySchema.safeParse(sampleStory);
    expect(result.success).toBe(true);
  });

  it("superRefine: contiguous frames pass (0-30, 30-60, 60-90)", () => {
    const result = StorySchema.safeParse({
      meta: { title: "Test", slug: "test" },
      transition: baseTransition,
      scenes: [makeScene("a", 0, 30), makeScene("b", 30, 60), makeScene("c", 60, 90)],
    });
    expect(result.success).toBe(true);
  });

  it("superRefine: non-contiguous frames fail in section mode (0-30, 35-60)", () => {
    const result = StorySchema.safeParse({
      meta: { title: "Test", slug: "test" },
      transition: baseTransition,
      scenes: [makeScene("a", 0, 30), makeScene("b", 35, 60)],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/frame-contiguous/);
    }
  });

  it("superRefine: non-contiguous frames PASS in scrub mode", () => {
    const result = StorySchema.safeParse({
      meta: { title: "Test", slug: "test" },
      transition: { ...baseTransition, mode: "scrub" as const },
      scenes: [makeScene("a", 0, 30), makeScene("b", 35, 60)],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least 1 scene", () => {
    const result = StorySchema.safeParse({
      meta: { title: "Test", slug: "test" },
      transition: baseTransition,
      scenes: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires meta.title", () => {
    const result = StorySchema.safeParse({
      meta: { title: "", slug: "test" },
      transition: baseTransition,
      scenes: [makeScene("a", 0, 30)],
    });
    expect(result.success).toBe(false);
  });

  it("requires meta.slug", () => {
    const result = StorySchema.safeParse({
      meta: { title: "Test", slug: "" },
      transition: baseTransition,
      scenes: [makeScene("a", 0, 30)],
    });
    expect(result.success).toBe(false);
  });
});
