/**
 * Fabric XLarge API client (server-side only).
 * The API key is read from environment variables and never exposed to the client.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  /** System prompt (persona definition). */
  systemPrompt: string;
  /** User's message. */
  userMessage: string;
  /** Retrieved context chunks to include as additional context. */
  contextChunks?: string[];
  /** Optional conversation history for multi-turn. */
  history?: LLMMessage[];
}

export interface LLMResponse {
  /** The generated response text. */
  content: string;
  /** Usage metadata (tokens, etc.). */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface LLMClientConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export class LLMClient {
  private config: LLMClientConfig;

  constructor(config: LLMClientConfig) {
    this.config = config;
  }

  /**
   * Create an LLMClient from environment variables.
   */
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
   * Call the Fabric XLarge API with the given request.
   * This runs server-side only — the API key never leaves the worker.
   */
  async chat(request: LLMRequest): Promise<LLMResponse> {
    const messages: LLMMessage[] = [];

    // System prompt (persona)
    messages.push({
      role: 'system',
      content: request.systemPrompt,
    });

    // Add conversation history if provided
    if (request.history && request.history.length > 0) {
      messages.push(...request.history);
    }

    // Build the user message with context
    let userContent = request.userMessage;
    if (request.contextChunks && request.contextChunks.length > 0) {
      const context = request.contextChunks
        .map((chunk, i) => `--- Context ${i + 1} ---\n${chunk}`)
        .join('\n\n');
      userContent = `${userContent}\n\n## Retrieved Context\n${context}`;
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `LLM API error (${response.status}): ${errorBody}`
      );
    }

    const data: { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } } = await response.json();

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
