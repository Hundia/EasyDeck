import type {
  LLMProvider,
  GenerateOptions,
  GenerateResult,
  HealthCheckResult,
} from "./types";

/**
 * Wraps a primary provider with a fallback.
 * If primary fails, automatically tries fallback provider.
 */
export class FallbackProvider implements LLMProvider {
  readonly name: string;

  constructor(
    private readonly primary: LLMProvider,
    private readonly fallback: LLMProvider,
  ) {
    this.name = `${primary.name}→${fallback.name}`;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    try {
      return await this.primary.generate(options);
    } catch (primaryError) {
      try {
        const result = await this.fallback.generate(options);
        return {
          ...result,
          meta: {
            ...result.meta,
            fallbackUsed: true,
            primaryError: String(primaryError),
          },
        };
      } catch (fallbackError) {
        throw new Error(
          `Both providers failed. Primary (${this.primary.name}): ${String(primaryError)}. Fallback (${this.fallback.name}): ${String(fallbackError)}`,
        );
      }
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const primaryHealth = await this.primary.healthCheck();
    if (primaryHealth.healthy) {
      return primaryHealth;
    }

    const fallbackHealth = await this.fallback.healthCheck();
    return {
      ...fallbackHealth,
      error: `Primary unhealthy: ${primaryHealth.error}. Fallback: ${fallbackHealth.healthy ? "OK" : fallbackHealth.error}`,
    };
  }
}

/**
 * Create a provider with optional fallback from AIConfig.
 */
export function createProviderWithFallback(
  primary: LLMProvider,
  fallback?: LLMProvider,
): LLMProvider {
  if (!fallback) {
    return primary;
  }

  return new FallbackProvider(primary, fallback);
}
