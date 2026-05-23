import { AIConfigSchema, type AIConfig } from "./config";

const supportedProviders = ["copilot", "claude", "gemini"] as const;

/**
 * Load AI configuration from environment variables.
 * Provider selection: EASYDECK_AI_PROVIDER (copilot|claude|gemini)
 * API Keys: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_KEY
 * Options: EASYDECK_AI_MODEL, EASYDECK_AI_ENABLED
 */
export function loadConfigFromEnv(): AIConfig | undefined {
  const providerName = process.env.EASYDECK_AI_PROVIDER;
  if (!providerName) {
    return undefined;
  }

  if (!supportedProviders.includes(providerName as (typeof supportedProviders)[number])) {
    return undefined;
  }

  const config = {
    provider: {
      provider: providerName as (typeof supportedProviders)[number],
      model: process.env.EASYDECK_AI_MODEL || undefined,
      baseUrl: process.env.EASYDECK_AI_BASE_URL || undefined,
    },
    enabled: process.env.EASYDECK_AI_ENABLED !== "false",
    enhancement: {
      enrichDescriptions: process.env.EASYDECK_AI_ENRICH !== "false",
      suggestTiming: process.env.EASYDECK_AI_TIMING === "true",
      generateRationale: process.env.EASYDECK_AI_RATIONALE !== "false",
    },
  };

  const result = AIConfigSchema.safeParse(config);
  return result.success ? result.data : undefined;
}

/**
 * Load config from a plain object (e.g., from easydeck.config.ts).
 * Returns undefined if validation fails.
 */
export function loadConfig(raw: unknown): AIConfig | undefined {
  const result = AIConfigSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}
