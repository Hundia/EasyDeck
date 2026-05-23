import type {
  GenerateOptions,
  GenerateResult,
  HealthCheckResult,
  LLMProvider,
  Message,
} from "../types";
import type { ProviderConfig } from "../config";
import { getApiKey } from "../config";

interface GeminiResponse {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

type GeminiConversationMessage = Message & { role: "user" | "assistant" };

function isGeminiConversationMessage(
  message: Message,
): message is GeminiConversationMessage {
  return message.role !== "system";
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private readonly config: ProviderConfig;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    const key = getApiKey(config);
    if (!key) {
      throw new Error("GeminiProvider: API key required (set GOOGLE_AI_KEY)");
    }

    this.config = config;
    this.apiKey = key;
    this.baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
    this.model = config.model || "gemini-2.0-flash";
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const systemMsg = options.messages.find((message) => message.role === "system");
    const nonSystemMsgs = options.messages.filter(isGeminiConversationMessage);

    const body: {
      contents: Array<{
        role: "user" | "model";
        parts: Array<{ text: string }>;
      }>;
      generationConfig: {
        temperature: number;
        maxOutputTokens: number;
        stopSequences?: string[];
      };
      systemInstruction?: {
        parts: Array<{ text: string }>;
      };
    } = {
      contents: nonSystemMsgs.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
        ...(options.stop ? { stopSequences: options.stop } : {}),
      },
    };

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      throw new Error(`GeminiProvider: ${response.status} ${text}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";

    return {
      content: text,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      meta: { model: this.model, finishReason: candidate?.finishReason },
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
