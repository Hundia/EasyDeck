/**
 * Core LLM provider abstraction for EasyDeck.
 * Supports GitHub Copilot, Claude (Anthropic), and Gemini (Google).
 */

/** Message roles in a conversation */
export type MessageRole = "system" | "user" | "assistant";

/** A single message in a conversation */
export interface Message {
  role: MessageRole;
  content: string;
}

/** Options for a generation request */
export interface GenerateOptions {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  /** Optional stop sequences */
  stop?: string[];
}

/** Result from a generation request */
export interface GenerateResult {
  content: string;
  /** Token usage if available */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Provider-specific metadata */
  meta?: Record<string, unknown>;
}

/** Health check result */
export interface HealthCheckResult {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Abstract LLM Provider interface.
 * All vendor adapters (Copilot, Claude, Gemini) implement this.
 */
export interface LLMProvider {
  /** Provider identifier */
  readonly name: string;
  /** Generate a completion from messages */
  generate(options: GenerateOptions): Promise<GenerateResult>;
  /** Check if the provider is reachable and configured */
  healthCheck(): Promise<HealthCheckResult>;
}

/** Supported provider names */
export type ProviderName = "copilot" | "claude" | "gemini";
