/**
 * Multi-provider LLM client (server-side only).
 *
 * Supports DeepSeek, OpenAI, Anthropic, Fabric XLarge, and a mock provider.
 * User-provided API keys are passed per-request and never logged or stored.
 */

import type { LLMProvider } from './providerDefaults';
import {
  PROVIDER_DEFAULTS,
  resolveProviderUrl,
  getDefaultModel,
} from './providerDefaults';

// ─── Public Types ───────────────────────────────────────────────

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  /** Which provider to call. */
  provider: LLMProvider;
  /** User-provided API key — sent server-side only, never logged. */
  apiKey: string;
  /** Model to use (falls back to provider default). */
  model?: string;
  /** System prompt (persona definition). */
  systemPrompt: string;
  /** Conversation messages. */
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Sampling temperature (0–2). */
  temperature?: number;
  /** Maximum tokens to generate. */
  maxTokens?: number;
}

export interface LLMResponse {
  /** The generated response text. */
  content: string;
  /** Usage metadata (tokens, etc.). */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model that generated the response. */
  model: string;
  /** Provider that generated the response. */
  provider: LLMProvider;
}

// ─── Error Classes ──────────────────────────────────────────────

export class LLMProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: LLMProvider,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }
}

export class LLMApiKeyError extends Error {
  constructor(provider: LLMProvider) {
    super(`API key is required for provider: ${provider}`);
    this.name = 'LLMApiKeyError';
  }
}

// ─── Provider Implementations ───────────────────────────────────

/**
 * OpenAI-compatible format (used by DeepSeek, OpenAI, and Fabric).
 */
async function callOpenAICompatible(
  provider: 'deepseek' | 'openai' | 'fabric',
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  temperature: number,
  maxTokens: number,
  envFabricUrl?: string
): Promise<LLMResponse> {
  const url = resolveProviderUrl(provider, envFabricUrl);
  if (!url) {
    throw new LLMProviderError(
      `No API URL configured for provider: ${provider}`,
      provider
    );
  }

  const allMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '(unable to read body)');
    throw new LLMProviderError(
      `${provider.toUpperCase()} API error (${response.status}): ${errorBody}`,
      provider,
      response.status
    );
  }

  const data: {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
  } = await response.json();

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens ?? 0,
          completionTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
        }
      : undefined,
    model: data.model ?? model,
    provider,
  };
}

/**
 * Anthropic Messages API.
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  temperature: number,
  maxTokens: number
): Promise<LLMResponse> {
  const url = PROVIDER_DEFAULTS.anthropic.apiUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '(unable to read body)');
    throw new LLMProviderError(
      `Anthropic API error (${response.status}): ${errorBody}`,
      'anthropic',
      response.status
    );
  }

  const data: {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    model?: string;
  } = await response.json();

  // Anthropic returns content as an array of blocks; extract text.
  const textContent = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n') ?? '';

  const inputTokens = data.usage?.input_tokens ?? 0;
  const outputTokens = data.usage?.output_tokens ?? 0;

  return {
    content: textContent,
    usage: {
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
    model: data.model ?? model,
    provider: 'anthropic',
  };
}

/**
 * Mock provider — returns a deterministic response for testing.
 */
async function callMock(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<LLMResponse> {
  // Simulate network latency for realism
  await new Promise((resolve) => setTimeout(resolve, 300));

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUserMessage?.content ?? '(no message)';

  return {
    content: `[Mock Response]\n\nSystem: "${systemPrompt.slice(0, 80)}…"\n\nYou asked: "${userText}"\n\nThis is a mock response from the mock LLM provider. Configure a real provider and API key to get actual AI responses.`,
    usage: {
      promptTokens: systemPrompt.length + userText.length,
      completionTokens: 42,
      totalTokens: systemPrompt.length + userText.length + 42,
    },
    model: 'mock',
    provider: 'mock',
  };
}

// ─── Main Entry Point ───────────────────────────────────────────

/**
 * Call an LLM provider with the given request.
 *
 * The API key is used server-side only and is never logged or persisted.
 */
export async function callLLM(
  request: LLMRequest,
  envFabricUrl?: string
): Promise<LLMResponse> {
  const { provider, apiKey, model, systemPrompt, messages } = request;
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens ?? 4096;

  // Mock provider never needs an API key
  if (provider === 'mock') {
    return callMock(systemPrompt, messages);
  }

  // All other providers require an API key
  if (!apiKey || apiKey.trim() === '') {
    throw new LLMApiKeyError(provider);
  }

  // Resolve model (fall back to provider default)
  const resolvedModel = model || getDefaultModel(provider);

  switch (provider) {
    case 'deepseek':
    case 'openai':
    case 'fabric':
      return callOpenAICompatible(
        provider,
        apiKey,
        resolvedModel,
        systemPrompt,
        messages,
        temperature,
        maxTokens,
        envFabricUrl
      );

    case 'anthropic':
      return callAnthropic(
        apiKey,
        resolvedModel,
        systemPrompt,
        messages,
        temperature,
        maxTokens
      );

    default:
      throw new LLMProviderError(
        `Unknown provider: ${provider}`,
        provider as LLMProvider
      );
  }
}

// ─── Legacy LLMClient (kept for backward compatibility) ─────────

export interface LLMClientConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

/**
 * Legacy class wrapper around the new callLLM function.
 * Kept so existing code that uses LLMClient.fromEnv() continues to work.
 */
export class LLMClient {
  private config: LLMClientConfig;

  constructor(config: LLMClientConfig) {
    this.config = config;
  }

  static fromEnv(env: {
    LLM_API_KEY: string;
    LLM_API_URL: string;
    LLM_MODEL: string;
  }): LLMClient {
    if (!env.LLM_API_KEY) {
      throw new Error('LLM_API_KEY environment variable is required');
    }

    return new LLMClient({
      apiKey: env.LLM_API_KEY,
      apiUrl: env.LLM_API_URL ?? 'https://api.fabric.io/v1/chat/completions',
      model: env.LLM_MODEL ?? 'xlarge',
    });
  }

  /**
   * Call the LLM with the given request (legacy interface).
   * Uses the Fabric provider by default.
   */
  async chat(
    request: {
      systemPrompt: string;
      userMessage: string;
      contextChunks?: string[];
      history?: LLMMessage[];
    },
    envFabricUrl?: string
  ): Promise<LLMResponse> {
    // Build messages array from legacy format
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (request.history && request.history.length > 0) {
      messages.push(
        ...request.history.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        }))
      );
    }

    // Build the user message with context
    let userContent = request.userMessage;
    if (request.contextChunks && request.contextChunks.length > 0) {
      const context = request.contextChunks
        .map((chunk, i) => `--- Context ${i + 1} ---\n${chunk}`)
        .join('\n\n');
      userContent = `${userContent}\n\n## Retrieved Context\n${context}`;
    }

    messages.push({ role: 'user', content: userContent });

    return callLLM(
      {
        provider: 'fabric',
        apiKey: this.config.apiKey,
        model: this.config.model,
        systemPrompt: request.systemPrompt,
        messages,
      },
      envFabricUrl || this.config.apiUrl
    );
  }
}
