/**
 * LLM Proxy route — multi-provider endpoint.
 *
 * Accepts a user-provided provider + API key per request.
 * The key is used server-side only and never logged or stored.
 */

import { Hono } from 'hono';
import { callLLM, LLMProviderError, LLMApiKeyError } from '../utils/llmClient';
import type { LLMProvider, ProviderDefaults } from '../utils/providerDefaults';
import { PROVIDER_DEFAULTS, getDefaultModel } from '../utils/providerDefaults';
import type { BackendEnv } from '../types';

// ─── Request / Response Types ───────────────────────────────────

export interface PersonaLLMRequest {
  /** Which LLM provider to use. */
  provider: LLMProvider;
  /** User-provided API key — never logged or stored. */
  apiKey: string;
  /** Model to use (falls back to provider default). */
  model?: string;
  /** Persona profile for system prompt building. */
  personaProfile?: {
    id: string;
    name: string;
    description: string;
    expertise: string[];
    tone: string;
  };
  /** Raw system prompt (used if personaProfile is not provided). */
  systemPrompt?: string;
  /** Retrieved context chunks to include. */
  contextChunks?: Array<{ id: string; content: string }>;
  /** Conversation history for multi-turn. */
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** The user's current message. */
  userMessage: string;
  /** Override provider to mock regardless of provider field. */
  useMock?: boolean;
  /** Sampling temperature (0–2). */
  temperature?: number;
  /** Maximum tokens. */
  maxTokens?: number;
}

export interface LLMProxyDeps {
  // Fabric API URL from env for fabric provider resolution
  fabricApiUrl?: string;
}

// ─── System Prompt Builder ──────────────────────────────────────

/**
 * Build a system prompt from a persona profile.
 * Falls back to a raw systemPrompt if no profile is provided.
 */
function buildSystemPrompt(
  request: PersonaLLMRequest
): string {
  // If a raw system prompt is provided, use it directly
  if (request.systemPrompt) {
    return request.systemPrompt;
  }

  // Build from persona profile
  const profile = request.personaProfile;
  if (profile) {
    const expertise = profile.expertise?.join(', ') || 'general business analysis';
    const tone = profile.tone || 'professional and analytical';

    return [
      `You are ${profile.name}, ${profile.description}`,
      `Your areas of expertise include: ${expertise}.`,
      `Respond in a ${tone} tone.`,
      '',
      'Guidelines:',
      '- Provide thorough, well-structured analysis',
      '- Use frameworks and structured thinking where appropriate',
      '- Reference the provided context when available',
      '- Be specific and actionable in your recommendations',
      '- If you lack information, state what you would need to give a better answer',
    ].join('\n');
  }

  // Default fallback
  return 'You are an expert business analyst helping a student work through an MBA case study. Provide thorough, well-structured analysis with practical insights.';
}

// ─── Route Factory ──────────────────────────────────────────────

export function createLLMRoutes(deps: LLMProxyDeps): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // ── POST /api/llm/persona ─────────────────────────────────────
  // Multi-provider LLM endpoint.
  // Receives: provider, apiKey, persona/message/context.
  // Returns: LLM response with usage metadata.
  router.post('/persona', async (c) => {
    let body: PersonaLLMRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: 'Bad Request', message: 'Invalid JSON body' },
        400
      );
    }

    // ── Validate required fields ────────────────────────────────

    if (!body.provider || typeof body.provider !== 'string') {
      return c.json(
        {
          error: 'Bad Request',
          message: 'provider is required (deepseek, openai, anthropic, fabric, or mock)',
        },
        400
      );
    }

    const provider = body.useMock ? 'mock' : (body.provider as LLMProvider);

    // Validate provider is known
    if (!(provider in PROVIDER_DEFAULTS)) {
      return c.json(
        {
          error: 'Bad Request',
          message: `Unknown provider: ${body.provider}. Supported: ${Object.keys(PROVIDER_DEFAULTS).join(', ')}`,
        },
        400
      );
    }

    // API key required for all non-mock providers
    if (provider !== 'mock' && (!body.apiKey || body.apiKey.trim() === '')) {
      return c.json(
        {
          error: 'Bad Request',
          message: `apiKey is required for provider: ${provider}`,
        },
        400
      );
    }

    if (!body.userMessage || typeof body.userMessage !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'userMessage is required' },
        400
      );
    }

    // ── Build the request ───────────────────────────────────────

    const systemPrompt = buildSystemPrompt(body);

    // Build messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(body.conversationHistory ?? []),
    ];

    // Build the user message with context chunks
    let userContent = body.userMessage;
    if (body.contextChunks && body.contextChunks.length > 0) {
      const context = body.contextChunks
        .map((chunk, i) => `--- Context ${i + 1} (${chunk.id}) ---\n${chunk.content}`)
        .join('\n\n');
      userContent = `${userContent}\n\n## Retrieved Context\n${context}`;
    }

    messages.push({ role: 'user', content: userContent });

    // Resolve model
    const model = body.model || getDefaultModel(provider);

    // ── Call the LLM ────────────────────────────────────────────

    try {
      const response = await callLLM({
        provider,
        apiKey: body.apiKey,
        model,
        systemPrompt,
        messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      }, deps.fabricApiUrl);

      return c.json({
        content: response.content,
        usage: response.usage,
        model: response.model,
        provider: response.provider,
      });
    } catch (err) {
      // Handle known LLM errors with appropriate status codes
      if (err instanceof LLMApiKeyError) {
        return c.json(
          {
            error: 'Unauthorized',
            message: `Invalid or missing API key for provider: ${provider}`,
          },
          401
        );
      }

      if (err instanceof LLMProviderError) {
        const status = err.status ?? 502;

        // Map common HTTP statuses to user-friendly messages
        let message = 'The AI service encountered an error.';
        if (status === 401) {
          message = 'Invalid API key. Please check your key and try again.';
        } else if (status === 403) {
          message = 'API access denied. Your key may not have access to this model.';
        } else if (status === 429) {
          message = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (status >= 500) {
          message = 'The AI service is temporarily unavailable. Please try again later.';
        }

        return c.json({ error: 'LLM Error', message }, status);
      }

      // Unknown error — don't leak internals
      return c.json(
        {
          error: 'Service Unavailable',
          message: 'The AI service is temporarily unavailable. Please try again later.',
        },
        503
      );
    }
  });

  // ── GET /api/llm/providers ────────────────────────────────────
  // Return available providers and their supported models.
  router.get('/providers', (_c) => {
    const providers = Object.entries(PROVIDER_DEFAULTS).map(
      ([key, config]) => ({
        id: key,
        defaultModel: config.defaultModel,
        models: config.models,
      })
    );

    return _c.json({ providers });
  });

  return router;
}
