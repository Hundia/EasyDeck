import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClaudeProvider,
  CopilotProvider,
  GeminiProvider,
  ProviderConfigSchema,
  ProviderRegistry,
  type GenerateOptions,
  type GenerateResult,
  type HealthCheckResult,
  type LLMProvider,
  type ProviderConfig,
} from "@/lib/ai";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

class CustomProvider implements LLMProvider {
  readonly name = "custom";

  async generate(_options: GenerateOptions): Promise<GenerateResult> {
    return { content: "custom" };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { healthy: true };
  }
}

describe("LLM providers", () => {
  const originalEnv = { ...process.env };
  const fetchMock = vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >();

  beforeEach(() => {
    process.env = { ...originalEnv };
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("CopilotProvider constructor throws without API key", () => {
    delete process.env.OPENAI_API_KEY;

    expect(
      () => new CopilotProvider(ProviderConfigSchema.parse({ provider: "copilot" })),
    ).toThrow("CopilotProvider: API key required (set OPENAI_API_KEY)");
  });

  it("CopilotProvider generate sends OpenAI-compatible request and parses response", async () => {
    process.env.OPENAI_API_KEY = "copilot-key";
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: "chatcmpl-123",
        model: "gpt-4o",
        choices: [{ message: { content: "copilot output" } }],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 7,
          total_tokens: 19,
        },
      }),
    );

    const provider = new CopilotProvider(
      ProviderConfigSchema.parse({ provider: "copilot", timeout: 1234 }),
    );
    const result = await provider.generate({
      messages: [
        { role: "system", content: "be concise" },
        { role: "user", content: "hello" },
      ],
      temperature: 0.2,
      maxTokens: 321,
      stop: ["DONE"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer copilot-key",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "be concise" },
        { role: "user", content: "hello" },
      ],
      temperature: 0.2,
      max_tokens: 321,
      stop: ["DONE"],
    });
    expect(result).toEqual({
      content: "copilot output",
      usage: {
        promptTokens: 12,
        completionTokens: 7,
        totalTokens: 19,
      },
      meta: { model: "gpt-4o", id: "chatcmpl-123" },
    });
  });

  it("CopilotProvider healthCheck reports healthy on success and unhealthy on error", async () => {
    process.env.OPENAI_API_KEY = "copilot-key";
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ choices: [{ message: { content: "pong" } }] }),
    );
    const provider = new CopilotProvider(
      ProviderConfigSchema.parse({ provider: "copilot" }),
    );

    await expect(provider.healthCheck()).resolves.toMatchObject({ healthy: true });

    fetchMock.mockResolvedValueOnce(new Response("bad gateway", { status: 502 }));
    await expect(provider.healthCheck()).resolves.toMatchObject({
      healthy: false,
      error: expect.stringContaining("CopilotProvider: 502 bad gateway"),
    });
  });

  it("ClaudeProvider constructor throws without API key", () => {
    delete process.env.ANTHROPIC_API_KEY;

    expect(
      () => new ClaudeProvider(ProviderConfigSchema.parse({ provider: "claude" })),
    ).toThrow("ClaudeProvider: API key required (set ANTHROPIC_API_KEY)");
  });

  it("ClaudeProvider generate sends Anthropic request and parses response", async () => {
    process.env.ANTHROPIC_API_KEY = "claude-key";
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: "msg_123",
        model: "claude-sonnet-4-20250514",
        stop_reason: "end_turn",
        content: [
          { type: "thinking", thinking: "..." },
          { type: "text", text: "claude output" },
        ],
        usage: {
          input_tokens: 9,
          output_tokens: 4,
        },
      }),
    );

    const provider = new ClaudeProvider(
      ProviderConfigSchema.parse({ provider: "claude", timeout: 5678 }),
    );
    const result = await provider.generate({
      messages: [
        { role: "system", content: "follow instructions" },
        { role: "user", content: "hello" },
        { role: "assistant", content: "previous reply" },
      ],
      temperature: 0.1,
      maxTokens: 111,
      stop: ["STOP"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      "x-api-key": "claude-key",
      "anthropic-version": "2023-06-01",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      model: "claude-sonnet-4-20250514",
      max_tokens: 111,
      messages: [
        { role: "user", content: "hello" },
        { role: "assistant", content: "previous reply" },
      ],
      system: "follow instructions",
      temperature: 0.1,
      stop_sequences: ["STOP"],
    });
    expect(result).toEqual({
      content: "claude output",
      usage: {
        promptTokens: 9,
        completionTokens: 4,
        totalTokens: 13,
      },
      meta: {
        model: "claude-sonnet-4-20250514",
        id: "msg_123",
        stopReason: "end_turn",
      },
    });
  });

  it("ClaudeProvider healthCheck reports healthy on success and unhealthy on error", async () => {
    process.env.ANTHROPIC_API_KEY = "claude-key";
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ content: [{ type: "text", text: "pong" }] }),
    );
    const provider = new ClaudeProvider(
      ProviderConfigSchema.parse({ provider: "claude" }),
    );

    await expect(provider.healthCheck()).resolves.toMatchObject({ healthy: true });

    fetchMock.mockResolvedValueOnce(new Response("invalid", { status: 400 }));
    await expect(provider.healthCheck()).resolves.toMatchObject({
      healthy: false,
      error: expect.stringContaining("ClaudeProvider: 400 invalid"),
    });
  });

  it("GeminiProvider constructor throws without API key", () => {
    delete process.env.GOOGLE_AI_KEY;

    expect(
      () => new GeminiProvider(ProviderConfigSchema.parse({ provider: "gemini" })),
    ).toThrow("GeminiProvider: API key required (set GOOGLE_AI_KEY)");
  });

  it("GeminiProvider generate sends Google request and parses response", async () => {
    process.env.GOOGLE_AI_KEY = "gemini-key";
    fetchMock.mockResolvedValue(
      jsonResponse({
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: "gemini output" }] },
          },
        ],
        usageMetadata: {
          promptTokenCount: 6,
          candidatesTokenCount: 5,
          totalTokenCount: 11,
        },
      }),
    );

    const provider = new GeminiProvider(
      ProviderConfigSchema.parse({ provider: "gemini", timeout: 4321 }),
    );
    const result = await provider.generate({
      messages: [
        { role: "system", content: "system rule" },
        { role: "user", content: "hello" },
        { role: "assistant", content: "previous reply" },
      ],
      temperature: 0.3,
      maxTokens: 222,
      stop: ["HALT"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=gemini-key",
    );
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual({
      contents: [
        { role: "user", parts: [{ text: "hello" }] },
        { role: "model", parts: [{ text: "previous reply" }] },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 222,
        stopSequences: ["HALT"],
      },
      systemInstruction: { parts: [{ text: "system rule" }] },
    });
    expect(result).toEqual({
      content: "gemini output",
      usage: {
        promptTokens: 6,
        completionTokens: 5,
        totalTokens: 11,
      },
      meta: { model: "gemini-2.0-flash", finishReason: "STOP" },
    });
  });

  it("GeminiProvider healthCheck reports healthy on success and unhealthy on error", async () => {
    process.env.GOOGLE_AI_KEY = "gemini-key";
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        candidates: [{ content: { parts: [{ text: "pong" }] } }],
      }),
    );
    const provider = new GeminiProvider(
      ProviderConfigSchema.parse({ provider: "gemini" }),
    );

    await expect(provider.healthCheck()).resolves.toMatchObject({ healthy: true });

    fetchMock.mockResolvedValueOnce(new Response("denied", { status: 403 }));
    await expect(provider.healthCheck()).resolves.toMatchObject({
      healthy: false,
      error: expect.stringContaining("GeminiProvider: 403 denied"),
    });
  });

  it("ProviderRegistry creates providers, caches instances, lists names, and supports custom factories", async () => {
    process.env.OPENAI_API_KEY = "copilot-key";

    const registry = new ProviderRegistry();
    const config = ProviderConfigSchema.parse({
      provider: "copilot",
      model: "gpt-4o-mini",
      baseUrl: "https://proxy.example.com/v1",
    });

    const first = registry.getProvider(config);
    const second = registry.getProvider(config);

    expect(first).toBeInstanceOf(CopilotProvider);
    expect(second).toBe(first);
    expect(registry.listProviders()).toEqual(
      expect.arrayContaining(["copilot", "claude", "gemini"]),
    );

    registry.register("custom", () => new CustomProvider());
    const customConfig = {
      provider: "custom",
      timeout: 30000,
      maxRetries: 2,
    } as unknown as ProviderConfig;
    const custom = registry.getProvider(customConfig);

    expect(custom).toBeInstanceOf(CustomProvider);
    expect(registry.listProviders()).toContain("custom");
    await expect(custom.healthCheck()).resolves.toEqual({ healthy: true });
  });

  it("ProviderRegistry throws a descriptive error for unknown providers", () => {
    const registry = new ProviderRegistry();
    const unknownConfig = {
      provider: "unknown",
      timeout: 30000,
      maxRetries: 2,
    } as unknown as ProviderConfig;

    expect(() => registry.getProvider(unknownConfig)).toThrow(
      'Unknown provider: "unknown". Available: copilot, claude, gemini',
    );
  });
});
