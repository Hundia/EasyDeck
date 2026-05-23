import { describe, it, expect } from "vitest";
import { buildSnapConfig, progressToFrame } from "@/lib/snap/buildSnapConfig";

describe("buildSnapConfig", () => {
  const baseTransition = {
    mode: "snap" as const,
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

  it("returns labelsDirectional snap config", () => {
    const config = buildSnapConfig(baseTransition);
    expect(config).toBeDefined();
    expect(config!.snapTo).toBe("labelsDirectional");
  });

  it("maps duration min/max from transition config", () => {
    const config = buildSnapConfig(baseTransition);
    expect(config!.duration).toEqual({ min: 0.2, max: 1.5 });
  });

  it("maps delay from snapDelay", () => {
    const config = buildSnapConfig(baseTransition);
    expect(config!.delay).toBe(0.1);
  });

  it("maps directional and inertia flags", () => {
    const config = buildSnapConfig(baseTransition);
    expect(config!.directional).toBe(true);
    expect(config!.inertia).toBe(true);
  });

  it("returns undefined when reduced motion is active", () => {
    const config = buildSnapConfig(baseTransition, true);
    expect(config).toBeUndefined();
  });

  it("respects non-directional config", () => {
    const config = buildSnapConfig({ ...baseTransition, directional: false });
    expect(config!.directional).toBe(false);
  });
});

describe("progressToFrame", () => {
  const scenes = [
    { startFrame: 0, endFrame: 30 },
    { startFrame: 30, endFrame: 60 },
    { startFrame: 60, endFrame: 90 },
  ];

  it("returns startFrame at progress 0", () => {
    expect(progressToFrame(0, scenes)).toBe(0);
  });

  it("returns last endFrame at progress 1", () => {
    expect(progressToFrame(1, scenes)).toBe(90);
  });

  it("returns mid-scene frame at progress 0.5", () => {
    expect(progressToFrame(0.5, scenes)).toBe(45);
  });

  it("returns correct frame at scene boundary", () => {
    expect(progressToFrame(1 / 3, scenes)).toBeCloseTo(30, 0);
  });

  it("handles empty scenes array", () => {
    expect(progressToFrame(0.5, [])).toBe(0);
  });

  it("handles single scene", () => {
    const single = [{ startFrame: 0, endFrame: 100 }];
    expect(progressToFrame(0.5, single)).toBe(50);
  });
});
