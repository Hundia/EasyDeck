import type { LLMProvider, ProviderName } from "../types";
import type { ProviderConfig } from "../config";
import { resolveEnvVars } from "../config";
import { ClaudeProvider } from "./claude";
import { CopilotProvider } from "./copilot";
import { GeminiProvider } from "./gemini";

type ProviderFactory = (config: ProviderConfig) => LLMProvider;

const builtinFactories: Record<ProviderName, ProviderFactory> = {
  copilot: (config) => new CopilotProvider(config),
  claude: (config) => new ClaudeProvider(config),
  gemini: (config) => new GeminiProvider(config),
};

export class ProviderRegistry {
  private readonly factories = new Map<string, ProviderFactory>(
    Object.entries(builtinFactories),
  );

  private readonly instances = new Map<string, LLMProvider>();

  register(name: string, factory: ProviderFactory): void {
    this.factories.set(name, factory);
  }

  getProvider(config: ProviderConfig): LLMProvider {
    const resolved = resolveEnvVars(config);
    const key = `${resolved.provider}:${resolved.model || "default"}:${resolved.baseUrl || "default"}`;

    const cached = this.instances.get(key);
    if (cached) {
      return cached;
    }

    const factory = this.factories.get(resolved.provider);
    if (!factory) {
      throw new Error(
        `Unknown provider: "${resolved.provider}". Available: ${[...this.factories.keys()].join(", ")}`,
      );
    }

    const instance = factory(resolved);
    this.instances.set(key, instance);
    return instance;
  }

  listProviders(): string[] {
    return [...this.factories.keys()];
  }

  clearInstances(): void {
    this.instances.clear();
  }
}

export const registry = new ProviderRegistry();
