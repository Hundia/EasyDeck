import type {
  GenerateOptions,
  GenerateResult,
  HealthCheckResult,
  LLMProvider,
} from "../types";
import type { ProviderConfig } from "../config";
import { getApiKey } from "../config";

interface OpenAIChatCompletionResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CopilotProvider implements LLMProvider {
  readonly name = "copilot";
  private readonly config: ProviderConfig;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    const key = getApiKey(config);
    if (!key) {
      throw new Error(
        "CopilotProvider: API key required (set OPENAI_API_KEY)",
      );
    }

    this.config = config;
    this.apiKey = key;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
    this.model = config.model || "gpt-4o";
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        ...(options.stop ? { stop: options.stop } : {}),
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      throw new Error(`CopilotProvider: ${response.status} ${text}`);
    }

    const data = (await response.json()) as OpenAIChatCompletionResponse;

    return {
      content: data.choices?.[0]?.message?.content || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      meta: { model: data.model, id: data.id },
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      await this.generate({
        messages: [{ role: "user", content: "ping" }],
        maxTokens: 5,
        temperature: 0,
      });

      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
