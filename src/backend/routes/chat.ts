/**
 * Chat routes: manage chat sessions and messages with personas.
 *
 * Updated to support multi-provider LLM calls with user-provided API keys.
 */

import { Hono } from 'hono';
import type { ChatSession, ChatMessage } from '../storageProvider';
import type { BackendEnv } from '../types';
import { callLLM, LLMProviderError, LLMApiKeyError } from '../utils/llmClient';
import type { LLMProvider } from '../utils/providerDefaults';
import { getDefaultModel } from '../utils/providerDefaults';

// ─── Request Types ──────────────────────────────────────────────

export interface SendMessageRequest {
  /** The user's message content. */
  content: string;
  /** Retrieved context chunks to include. */
  context_chunks?: string[];
  /** LLM provider to use (defaults to server config). */
  provider?: LLMProvider;
  /** User-provided API key for the chosen provider. */
  apiKey?: string;
  /** Model to use (falls back to provider default). */
  model?: string;
  /** Override to use mock provider. */
  useMock?: boolean;
  /** Sampling temperature. */
  temperature?: number;
  /** Maximum tokens. */
  maxTokens?: number;
}

export interface ChatRoutesDeps {
  /** Fabric API URL from env (for fabric provider resolution). */
  fabricApiUrl?: string;
  /** Fallback provider when client doesn't specify one. */
  fallbackProvider?: LLMProvider;
  /** Fallback API key from env when client doesn't provide one. */
  fallbackApiKey?: string;
  /** Fallback model from env. */
  fallbackModel?: string;
}

// ─── Route Factory ──────────────────────────────────────────────

export function createChatRoutes(deps: ChatRoutesDeps): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // ── GET /api/cases/:caseId/chat/sessions ──────────────────────
  router.get('/sessions', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    const sessions = await storage.getChatSessions(user.id, caseId);

    return c.json({ sessions });
  });

  // ── POST /api/cases/:caseId/chat/sessions ─────────────────────
  router.post('/sessions', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    let body: { persona_id: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { persona_id } = body;

    if (!persona_id || typeof persona_id !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'persona_id is required' },
        400
      );
    }

    const session: ChatSession = {
      id: crypto.randomUUID(),
      user_id: user.id,
      case_id: caseId,
      persona_id,
      created_at: Date.now(),
    };

    const created = await storage.createChatSession(session);

    return c.json({ session: created }, 201);
  });

  // ── GET /api/cases/:caseId/chat/sessions/:sessionId/messages ──
  router.get('/sessions/:sessionId/messages', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const sessionId = c.req.param('sessionId');

    if (!sessionId) {
      return c.json({ error: 'Bad Request', message: 'sessionId is required' }, 400);
    }

    // Verify session ownership
    const session = await storage.getChatSessionById(sessionId, user.id);
    if (!session) {
      return c.json(
        { error: 'Not Found', message: 'Chat session not found' },
        404
      );
    }

    const messages = await storage.getChatMessages(sessionId);

    return c.json({ messages });
  });

  // ── POST /api/cases/:caseId/chat/sessions/:sessionId/messages ─
  router.post('/sessions/:sessionId/messages', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const sessionId = c.req.param('sessionId');

    if (!sessionId) {
      return c.json({ error: 'Bad Request', message: 'sessionId is required' }, 400);
    }

    // Verify session ownership
    const session = await storage.getChatSessionById(sessionId, user.id);
    if (!session) {
      return c.json(
        { error: 'Not Found', message: 'Chat session not found' },
        404
      );
    }

    let body: SendMessageRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { content, context_chunks } = body;

    if (!content || typeof content !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'Content is required' },
        400
      );
    }

    const now = Date.now();

    // Save user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content,
      created_at: now,
    };
    await storage.createChatMessage(userMessage);

    // Get conversation history for context
    const history = await storage.getChatMessages(sessionId);

    // Build system prompt from persona
    const systemPrompt = buildPersonaSystemPrompt(session.persona_id);

    // ── Resolve provider settings ───────────────────────────────

    const useMock = body.useMock === true;
    const provider: LLMProvider = useMock
      ? 'mock'
      : (body.provider ?? deps.fallbackProvider ?? 'mock');

    const apiKey = body.apiKey ?? deps.fallbackApiKey ?? '';
    const model = body.model ?? getDefaultModel(provider);

    // Build messages array from history
    const messages = history
      .filter((m: ChatMessage) => m.id !== userMessage.id) // Exclude the message we just saved
      .map((m: ChatMessage) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Append context chunks to the last user message
    if (context_chunks && context_chunks.length > 0) {
      const context = context_chunks
        .map((chunk, i) => `--- Context ${i + 1} ---\n${chunk}`)
        .join('\n\n');
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        lastUserMsg.content = `${lastUserMsg.content}\n\n## Retrieved Context\n${context}`;
      } else {
        messages.push({ role: 'user', content: `${content}\n\n## Retrieved Context\n${context}` });
      }
    } else {
      // Ensure the current user message is in the messages array
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (!lastUserMsg) {
        messages.push({ role: 'user', content });
      }
    }

    // ── Call LLM ────────────────────────────────────────────────

    try {
      const llmResponse = await callLLM({
        provider,
        apiKey,
        model,
        systemPrompt,
        messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      }, deps.fabricApiUrl);

      // Save assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: llmResponse.content,
        created_at: Date.now(),
      };
      await storage.createChatMessage(assistantMessage);

      return c.json({
        message: assistantMessage,
        usage: llmResponse.usage,
        model: llmResponse.model,
        provider: llmResponse.provider,
      });
    } catch (err) {
      // Handle known LLM errors
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
        let message = 'Failed to get a response from the AI.';
        if (status === 401) {
          message = 'Invalid API key. Please check your key and try again.';
        } else if (status === 429) {
          message = 'Rate limit exceeded. Please wait and try again.';
        } else if (status >= 500) {
          message = 'The AI service is temporarily unavailable. Please try again later.';
        }
        return c.json({ error: 'LLM Error', message }, status);
      }

      // Unknown error
      c.header('X-LLM-Error', 'true');
      return c.json(
        {
          error: 'LLM Error',
          message: 'Failed to get a response from the AI. Please try again.',
        },
        503
      );
    }
  });

  return router;
}

// ─── Persona System Prompt Builder ──────────────────────────────

/**
 * Build a system prompt based on the persona ID.
 * In production, this would load from a persona definitions file or database.
 */
function buildPersonaSystemPrompt(personaId: string): string {
  const personas: Record<string, string> = {
    professor:
      'You are a seasoned MBA professor with 20+ years of teaching experience at top business schools. You explain concepts clearly, use real-world examples, and challenge students to think critically. You are patient but rigorous in your analysis.',
    consultant:
      'You are a senior management consultant from a top-tier firm (McKinsey, BCG, or Bain). You think in frameworks, structure your analysis logically, and focus on actionable recommendations. You use MECE principles and data-driven reasoning.',
    ceo:
      'You are a Fortune 500 CEO who has led companies through major transformations. You think strategically about market positioning, competitive advantage, and long-term value creation. You balance analytical rigor with practical business sense.',
    investor:
      'You are a venture capitalist or private equity partner who evaluates business opportunities. You focus on financial metrics, market sizing, competitive moats, and ROI. You are skeptical but open to compelling arguments backed by data.',
  };

  return (
    personas[personaId] ??
    'You are an expert business analyst helping a student work through an MBA case study. Provide thorough, well-structured analysis with practical insights.'
  );
}
