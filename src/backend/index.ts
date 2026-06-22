/**
 * MBA Case Study Platform — Hono API Application
 *
 * Sets up all routes, middleware, and exports the app for Cloudflare Pages Functions.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { D1StorageProvider } from './d1StorageProvider';
import type { StorageProvider } from './storageProvider';
import type { BackendEnv } from './types';
import { authMiddleware } from './middleware/authMiddleware';
import { createAuthRoutes } from './routes/auth';
import { createHighlightsRoutes } from './routes/highlights';
import { createNotesRoutes } from './routes/notes';
import { createDraftsRoutes } from './routes/drafts';
import { createChatRoutes } from './routes/chat';
import { createLLMRoutes } from './routes/llm';
import { LLMClient } from './utils/llmClient';

// ─── Environment Types ──────────────────────────────────────────

export interface AppBindings {
  DB: D1Database;
  LLM_API_KEY: string;
  LLM_API_URL: string;
  LLM_MODEL: string;
}

// ─── App Factory ────────────────────────────────────────────────

/**
 * Create the Hono app with all routes and middleware configured.
 */
export function createApp(env: AppBindings): Hono<BackendEnv> {
  const app = new Hono<BackendEnv>();

  // Initialize shared services
  const storage: StorageProvider = new D1StorageProvider(env.DB);
  const llmClient = LLMClient.fromEnv({
    LLM_API_KEY: env.LLM_API_KEY,
    LLM_API_URL: env.LLM_API_URL,
    LLM_MODEL: env.LLM_MODEL,
  });

  // ── Global Middleware ─────────────────────────────────────────

  // CORS — allow requests from the frontend origin
  app.use('/api/*', cors({
    origin: (origin) => {
      // Allow requests from the deployed frontend and local dev
      const allowedOrigins = [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:8788',  // Wrangler preview
        'https://mba-case-study.pages.dev', // Production
      ];
      return origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-LLM-Error'],
    credentials: true,
  }));

  // Attach storage to all requests (for routes that need it)
  app.use('/api/*', async (c, next) => {
    c.set('storage', storage);
    await next();
  });

  // ── Public Routes (no auth required) ──────────────────────────

  const authRoutes = createAuthRoutes();
  app.route('/api/auth', authRoutes);

  // ── Protected Routes (auth required) ──────────────────────────

  // Apply auth middleware to all protected routes
  app.use('/api/cases/*', authMiddleware(storage));

  const highlightsRoutes = createHighlightsRoutes();
  app.route('/api/cases/:caseId/highlights', highlightsRoutes);

  const notesRoutes = createNotesRoutes();
  app.route('/api/cases/:caseId/notes', notesRoutes);

  const draftsRoutes = createDraftsRoutes();
  app.route('/api/cases/:caseId/draft', draftsRoutes);

  const chatRoutes = createChatRoutes({ llmClient });
  app.route('/api/cases/:caseId/chat', chatRoutes);

  // ── LLM Proxy (protected — requires auth) ─────────────────────

  const llmRoutes = createLLMRoutes({ llmClient });
  app.route('/api/llm', llmRoutes);

  // ── Error Handler ─────────────────────────────────────────────

  app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again.',
      },
      500
    );
  });

  // ── Health Check ──────────────────────────────────────────────

  app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: Date.now() });
  });

  return app;
}

// ─── Exports ─────────────────────────────────────────────────────

export { D1StorageProvider, LLMClient };
export type { StorageProvider, BackendEnv };
