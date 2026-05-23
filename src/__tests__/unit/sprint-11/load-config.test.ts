import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AIConfigSchema, loadConfig, loadConfigFromEnv } from "@/lib/ai";

describe("AI config loaders", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("loadConfigFromEnv returns a valid config for claude", () => {
    process.env.EASYDECK_AI_PROVIDER = "claude";
    process.env.EASYDECK_AI_MODEL = "claude-3-7-sonnet-latest";
    process.env.EASYDECK_AI_ENABLED = "true";
    process.env.EASYDECK_AI_ENRICH = "false";
    process.env.EASYDECK_AI_TIMING = "true";
    process.env.EASYDECK_AI_RATIONALE = "true";

    const result = loadConfigFromEnv();

    expect(result).toEqual(
      AIConfigSchema.parse({
        provider: {
          provider: "claude",
          model: "claude-3-7-sonnet-latest",
        },
        enabled: true,
        enhancement: {
          enrichDescriptions: false,
          suggestTiming: true,
          generateRationale: true,
        },
      }),
    );
  });

  it("loadConfigFromEnv returns undefined when provider env var is missing", () => {
    delete process.env.EASYDECK_AI_PROVIDER;

    expect(loadConfigFromEnv()).toBeUndefined();
  });

  it("loadConfigFromEnv returns undefined for an invalid provider", () => {
    process.env.EASYDECK_AI_PROVIDER = "openai";

    expect(loadConfigFromEnv()).toBeUndefined();
  });

  it("loadConfig returns parsed AIConfig for a valid object", () => {
    const result = loadConfig({
      provider: { provider: "gemini", model: "gemini-2.0-flash" },
      fallback: { provider: "copilot" },
      enabled: true,
      enhancement: {
        enrichDescriptions: true,
        suggestTiming: false,
        generateRationale: true,
      },
    });

    expect(result).toEqual(
      AIConfigSchema.parse({
        provider: { provider: "gemini", model: "gemini-2.0-flash" },
        fallback: { provider: "copilot" },
        enabled: true,
        enhancement: {
          enrichDescriptions: true,
          suggestTiming: false,
          generateRationale: true,
        },
      }),
    );
  });

  it("loadConfig returns undefined for an invalid object", () => {
    const result = loadConfig({
      provider: { provider: "invalid-provider" },
      enhancement: { enrichDescriptions: "yes" },
    });

    expect(result).toBeUndefined();
  });
});
