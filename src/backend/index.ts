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
import type { LLMProvider } from './utils/providerDefaults';

// ─── Environment Types ──────────────────────────────────────────

export interface AppBindings {
  DB: D1Database;
  LLM_API_KEY: string;
  LLM_API_URL: string;
  LLM_MODEL: string;
  DEFAULT_LLM_PROVIDER?: string;
}

// ─── App Factory ────────────────────────────────────────────────

/**
 * Create the Hono app with all routes and middleware configured.
 */
export function createApp(env: AppBindings): Hono<BackendEnv> {
  const app = new Hono<BackendEnv>();

  // Initialize shared services
  const storage: StorageProvider = new D1StorageProvider(env.DB);

  // LLM provider settings from env (used as fallbacks when client doesn't provide keys)
  const fabricApiUrl = env.LLM_API_URL;
  const fallbackApiKey = env.LLM_API_KEY;
  const fallbackModel = env.LLM_MODEL;
  const defaultProvider: LLMProvider =
    (env.DEFAULT_LLM_PROVIDER as LLMProvider) ?? 'mock';

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

  const chatRoutes = createChatRoutes({
    fabricApiUrl,
    fallbackProvider: defaultProvider,
    fallbackApiKey,
    fallbackModel,
  });
  app.route('/api/cases/:caseId/chat', chatRoutes);

  // ── LLM Proxy (protected — requires auth) ─────────────────────

  const llmRoutes = createLLMRoutes({ fabricApiUrl });
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

export { D1StorageProvider };
export type { StorageProvider, BackendEnv };
