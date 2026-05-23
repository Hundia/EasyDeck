import type {
  GenerateOptions,
  GenerateResult,
  HealthCheckResult,
  LLMProvider,
  Message,
} from "../types";
import type { ProviderConfig } from "../config";
import { getApiKey } from "../config";

interface ClaudeTextBlock {
  type: "text";
  text: string;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  id?: string;
  model?: string;
  stop_reason?: string;
  content?: ClaudeContentBlock[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

type ClaudeMessage = Message & { role: "user" | "assistant" };

function isClaudeMessage(message: Message): message is ClaudeMessage {
  return message.role !== "system";
}

function isTextBlock(block: ClaudeContentBlock): block is ClaudeTextBlock {
  return block.type === "text" && typeof block.text === "string";
}

export class ClaudeProvider implements LLMProvider {
  readonly name = "claude";
  private readonly config: ProviderConfig;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    const key = getApiKey(config);
    if (!key) {
      throw new Error(
        "ClaudeProvider: API key required (set ANTHROPIC_API_KEY)",
      );
    }

    this.config = config;
    this.apiKey = key;
    this.baseUrl = config.baseUrl || "https://api.anthropic.com";
    this.model = config.model || "claude-sonnet-4-20250514";
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const systemMsg = options.messages.find((message) => message.role === "system");
    const nonSystemMsgs = options.messages.filter(isClaudeMessage);

    const body: {
      model: string;
      max_tokens: number;
      messages: Array<{ role: ClaudeMessage["role"]; content: string }>;
      system?: string;
      temperature?: number;
      stop_sequences?: string[];
    } = {
      model: this.model,
      max_tokens: options.maxTokens ?? 2048,
      messages: nonSystemMsgs.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }
    if (options.temperature !== undefined) {
      body.temperature = options.temperature;
    }
    if (options.stop) {
      body.stop_sequences = options.stop;
    }

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      throw new Error(`ClaudeProvider: ${response.status} ${text}`);
    }

    const data = (await response.json()) as ClaudeResponse;
    const textBlock = data.content?.find(isTextBlock);

    return {
      content: textBlock?.text || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      meta: { model: data.model, id: data.id, stopReason: data.stop_reason },
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
