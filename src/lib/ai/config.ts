import { z } from "zod";
import type { ProviderName } from "./types";

const providerNames = ["copilot", "claude", "gemini"] as const;

/** Configuration for a single AI provider */
export const ProviderConfigSchema = z.object({
  /** Which provider to use */
  provider: z.enum(providerNames),
  /** API key (resolved from env if starts with $) */
  apiKey: z.string().optional(),
  /** Model identifier override */
  model: z.string().optional(),
  /** Base URL override (for proxies, local models) */
  baseUrl: z.string().url().optional(),
  /** Request timeout in ms */
  timeout: z.number().int().positive().default(30000),
  /** Max retries on transient failure */
  maxRetries: z.number().int().min(0).max(5).default(2),
});
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

const EnhancementConfigSchema = z
  .object({
    /** Enrich scene descriptions */
    enrichDescriptions: z.boolean().default(true),
    /** Suggest timing adjustments */
    suggestTiming: z.boolean().default(false),
    /** Generate transition rationale */
    generateRationale: z.boolean().default(true),
  })
  .default({});

/** Top-level EasyDeck AI configuration */
export const AIConfigSchema = z.object({
  /** Primary provider config */
  provider: ProviderConfigSchema,
  /** Fallback provider (optional) */
  fallback: ProviderConfigSchema.optional(),
  /** Whether to enable AI enhancement in the pipeline */
  enabled: z.boolean().default(true),
  /** Enhancement settings */
  enhancement: EnhancementConfigSchema,
});
export type AIConfig = z.infer<typeof AIConfigSchema>;

/**
 * Resolve environment variable references in config.
 * If apiKey starts with '$', resolve from process.env.
 */
export function resolveEnvVars(config: ProviderConfig): ProviderConfig {
  let apiKey = config.apiKey;

  if (apiKey?.startsWith("$")) {
    const envVar = apiKey.slice(1);
    apiKey = process.env[envVar] || undefined;
  }

  return { ...config, apiKey };
}

/** Default env var names per provider */
export const DEFAULT_ENV_VARS: Record<ProviderName, string> = {
  copilot: "OPENAI_API_KEY",
  claude: "ANTHROPIC_API_KEY",
  gemini: "GOOGLE_AI_KEY",
};

/**
 * Get API key for a provider from environment.
 * Checks provider-specific env var, then falls back to config.
 */
export function getApiKey(config: ProviderConfig): string | undefined {
  if (config.apiKey && !config.apiKey.startsWith("$")) {
    return config.apiKey;
  }

  const envVar = config.apiKey?.startsWith("$")
    ? config.apiKey.slice(1)
    : DEFAULT_ENV_VARS[config.provider];

  return envVar ? process.env[envVar] : undefined;
}
