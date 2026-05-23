import { describe, expect, it, vi } from "vitest";
import {
  FallbackProvider,
  createProviderWithFallback,
  type GenerateOptions,
  type GenerateResult,
  type HealthCheckResult,
  type LLMProvider,
} from "@/lib/ai";

class StubProvider implements LLMProvider {
  constructor(
    readonly name: string,
    private readonly generateImpl: (options: GenerateOptions) => Promise<GenerateResult>,
    private readonly healthImpl: () => Promise<HealthCheckResult>,
  ) {}

  generate = vi.fn((options: GenerateOptions) => this.generateImpl(options));

  healthCheck = vi.fn(() => this.healthImpl());
}

describe("FallbackProvider", () => {
  const options: GenerateOptions = {
    messages: [{ role: "user", content: "Hello" }],
  };

  it("uses the primary provider when generation succeeds", async () => {
    const primary = new StubProvider(
      "primary",
      async () => ({ content: "primary result" }),
      async () => ({ healthy: true, latencyMs: 10 }),
    );
    const fallback = new StubProvider(
      "fallback",
      async () => ({ content: "fallback result" }),
      async () => ({ healthy: true, latencyMs: 15 }),
    );

    const provider = new FallbackProvider(primary, fallback);
    const result = await provider.generate(options);

    expect(result).toEqual({ content: "primary result" });
    expect(primary.generate).toHaveBeenCalledTimes(1);
    expect(fallback.generate).not.toHaveBeenCalled();
  });

  it("uses the fallback provider when primary generation fails", async () => {
    const primary = new StubProvider(
      "primary",
      async () => {
        throw new Error("primary down");
      },
      async () => ({ healthy: false, error: "primary down" }),
    );
    const fallback = new StubProvider(
      "fallback",
      async () => ({ content: "fallback result", meta: { model: "backup" } }),
      async () => ({ healthy: true, latencyMs: 20 }),
    );

    const provider = createProviderWithFallback(primary, fallback);
    const result = await provider.generate(options);

    expect(result).toEqual({
      content: "fallback result",
      meta: {
        model: "backup",
        fallbackUsed: true,
        primaryError: "Error: primary down",
      },
    });
    expect(primary.generate).toHaveBeenCalledTimes(1);
    expect(fallback.generate).toHaveBeenCalledTimes(1);
  });

  it("throws when both primary and fallback generation fail", async () => {
    const primary = new StubProvider(
      "primary",
      async () => {
        throw new Error("primary down");
      },
      async () => ({ healthy: false, error: "primary down" }),
    );
    const fallback = new StubProvider(
      "fallback",
      async () => {
        throw new Error("fallback down");
      },
      async () => ({ healthy: false, error: "fallback down" }),
    );

    const provider = new FallbackProvider(primary, fallback);

    await expect(provider.generate(options)).rejects.toThrow(
      "Both providers failed. Primary (primary): Error: primary down. Fallback (fallback): Error: fallback down",
    );
  });

  it("reports health from the primary when healthy and fallback details when primary is unhealthy", async () => {
    const healthyPrimary = new StubProvider(
      "primary",
      async () => ({ content: "ok" }),
      async () => ({ healthy: true, latencyMs: 12 }),
    );
    const healthyFallback = new StubProvider(
      "fallback",
      async () => ({ content: "ok" }),
      async () => ({ healthy: true, latencyMs: 18 }),
    );
    const healthyProvider = new FallbackProvider(healthyPrimary, healthyFallback);

    await expect(healthyProvider.healthCheck()).resolves.toEqual({
      healthy: true,
      latencyMs: 12,
    });

    const unhealthyPrimary = new StubProvider(
      "primary",
      async () => ({ content: "ok" }),
      async () => ({ healthy: false, error: "primary outage" }),
    );
    const unhealthyFallback = new StubProvider(
      "fallback",
      async () => ({ content: "ok" }),
      async () => ({ healthy: true, latencyMs: 22 }),
    );
    const degradedProvider = new FallbackProvider(unhealthyPrimary, unhealthyFallback);

    await expect(degradedProvider.healthCheck()).resolves.toEqual({
      healthy: true,
      latencyMs: 22,
      error: "Primary unhealthy: primary outage. Fallback: OK",
    });
  });
});
