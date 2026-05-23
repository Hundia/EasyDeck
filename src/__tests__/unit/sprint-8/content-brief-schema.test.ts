import { describe, expect, it } from "vitest";
import { ContentBrief, SceneBrief } from "@/lib/pipeline";

describe("ContentBrief schema", () => {
  const minimalSceneBrief = {
    label: "Intro",
    description: "Opening sequence",
  } satisfies Pick<SceneBrief, "label" | "description">;

  const validBrief = {
    title: "Product Launch",
    slug: "product-launch",
    scenes: [minimalSceneBrief],
  };

  it("valid brief passes parsing", () => {
    const result = ContentBrief.parse(validBrief);
    expect(result.title).toBe("Product Launch");
    expect(result.slug).toBe("product-launch");
    expect(result.scenes).toHaveLength(1);
  });

  it("missing title rejects", () => {
    expect(() =>
      ContentBrief.parse({ slug: "product-launch", scenes: [minimalSceneBrief] }),
    ).toThrow();
  });

  it("missing scenes rejects", () => {
    expect(() =>
      ContentBrief.parse({ title: "Product Launch", slug: "product-launch" }),
    ).toThrow();
  });

  it("empty scenes array rejects", () => {
    expect(() =>
      ContentBrief.parse({ ...validBrief, scenes: [] }),
    ).toThrow();
  });

  it("default fps is 30", () => {
    const result = ContentBrief.parse(validBrief);
    expect(result.fps).toBe(30);
  });

  it("custom fps is preserved", () => {
    const result = ContentBrief.parse({ ...validBrief, fps: 24 });
    expect(result.fps).toBe(24);
  });

  it("default imagePattern is applied", () => {
    const result = ContentBrief.parse(validBrief);
    expect(result.imagePattern).toBe("/frames/frame-{index}.webp");
  });

  it("custom imagePattern is preserved", () => {
    const pattern = "/assets/frames/{idx:0000}.webp";
    const result = ContentBrief.parse({ ...validBrief, imagePattern: pattern });
    expect(result.imagePattern).toBe(pattern);
  });

  it("optional mode is undefined when not provided", () => {
    const result = ContentBrief.parse(validBrief);
    expect(result.mode).toBeUndefined();
  });

  it("mode is preserved when provided", () => {
    const result = ContentBrief.parse({ ...validBrief, mode: "snap" });
    expect(result.mode).toBe("snap");
  });

  it("SceneBrief with durationHint passes", () => {
    const sceneBriefWithDuration = {
      label: "Hero",
      description: "Hero reveal",
      durationHint: 3,
    };
    const result = ContentBrief.parse({ ...validBrief, scenes: [sceneBriefWithDuration] });
    expect(result.scenes[0].durationHint).toBe(3);
  });

  it("SceneBrief with overlayText passes", () => {
    const sceneBriefWithOverlay = {
      label: "Hero",
      description: "Hero reveal",
      overlayText: "Welcome to the future",
    };
    const result = ContentBrief.parse({ ...validBrief, scenes: [sceneBriefWithOverlay] });
    expect(result.scenes[0].overlayText).toBe("Welcome to the future");
  });
});
