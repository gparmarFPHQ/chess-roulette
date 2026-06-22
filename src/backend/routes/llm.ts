/**
 * LLM Proxy route — internal endpoint for calling Fabric XLarge.
 * The API key is held server-side and never exposed to the client.
 */

import { Hono } from 'hono';
import type { LLMClient, LLMRequest } from '../utils/llmClient';
import type { BackendEnv } from '../types';

export interface LLMProxyDeps {
  llmClient: LLMClient;
}

export function createLLMRoutes(deps: LLMProxyDeps): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // POST /api/llm/persona
  // Internal endpoint that calls Fabric XLarge API.
  // Receives: persona system prompt, user message, retrieved context chunks.
  // Returns: persona response.
  router.post('/persona', async (c) => {
    let body: LLMRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: 'Bad Request', message: 'Invalid JSON body' },
        400
      );
    }

    const { systemPrompt, userMessage, contextChunks, history } = body;

    // Validate required fields
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'systemPrompt is required' },
        400
      );
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'userMessage is required' },
        400
      );
    }

    try {
      const response = await deps.llmClient.chat({
        systemPrompt,
        userMessage,
        contextChunks,
        history,
      });

      return c.json({
        content: response.content,
        usage: response.usage,
      });
    } catch {
      // Never leak internal error details or API key info to the client
      c.status(503);
      return c.json({
        error: 'Service Unavailable',
        message: 'The AI service is temporarily unavailable. Please try again later.',
      });
    }
  });

  return router;
}
