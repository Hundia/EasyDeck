import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AIConfigSchema,
  DEFAULT_ENV_VARS,
  ProviderConfigSchema,
  getApiKey,
  resolveEnvVars,
} from "@/lib/ai";

describe("ProviderConfigSchema", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("accepts a full provider config", () => {
    const parsed = ProviderConfigSchema.parse({
      provider: "claude",
      apiKey: "$CUSTOM_ANTHROPIC_KEY",
      model: "claude-3-7-sonnet-latest",
      baseUrl: "https://api.anthropic.com",
      timeout: 45000,
      maxRetries: 4,
    });

    expect(parsed).toEqual({
      provider: "claude",
      apiKey: "$CUSTOM_ANTHROPIC_KEY",
      model: "claude-3-7-sonnet-latest",
      baseUrl: "https://api.anthropic.com",
      timeout: 45000,
      maxRetries: 4,
    });
  });

  it("accepts a minimal provider config and applies defaults", () => {
    const parsed = ProviderConfigSchema.parse({ provider: "copilot" });

    expect(parsed).toEqual({
      provider: "copilot",
      timeout: 30000,
      maxRetries: 2,
    });
  });

  it("rejects an unsupported provider name", () => {
    expect(() => ProviderConfigSchema.parse({ provider: "openai" })).toThrow();
  });

  it("resolves apiKey references from environment variables", () => {
    process.env.EASYDECK_AI_KEY = "env-secret";

    const resolved = resolveEnvVars(
      ProviderConfigSchema.parse({
        provider: "gemini",
        apiKey: "$EASYDECK_AI_KEY",
      }),
    );

    expect(resolved.apiKey).toBe("env-secret");
  });

  it("leaves apiKey undefined when the referenced env var is missing", () => {
    const resolved = resolveEnvVars(
      ProviderConfigSchema.parse({
        provider: "copilot",
        apiKey: "$MISSING_KEY",
      }),
    );

    expect(resolved.apiKey).toBeUndefined();
  });

  it("gets apiKey directly from config when provided", () => {
    const config = ProviderConfigSchema.parse({
      provider: "copilot",
      apiKey: "inline-key",
    });

    expect(getApiKey(config)).toBe("inline-key");
  });

  it("gets apiKey from the configured env var reference", () => {
    process.env.CUSTOM_PROVIDER_KEY = "from-custom-env";

    const config = ProviderConfigSchema.parse({
      provider: "claude",
      apiKey: "$CUSTOM_PROVIDER_KEY",
    });

    expect(getApiKey(config)).toBe("from-custom-env");
  });

  it("gets apiKey from the provider default env var when config omits apiKey", () => {
    process.env[DEFAULT_ENV_VARS.gemini] = "from-default-env";

    const config = ProviderConfigSchema.parse({ provider: "gemini" });

    expect(getApiKey(config)).toBe("from-default-env");
  });
});

describe("AIConfigSchema", () => {
  it("accepts top-level AI config and applies enhancement defaults", () => {
    const parsed = AIConfigSchema.parse({
      provider: { provider: "copilot" },
    });

    expect(parsed).toEqual({
      provider: {
        provider: "copilot",
        timeout: 30000,
        maxRetries: 2,
      },
      enabled: true,
      enhancement: {
        enrichDescriptions: true,
        suggestTiming: false,
        generateRationale: true,
      },
    });
  });
});
