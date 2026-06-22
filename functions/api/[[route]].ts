/**
 * Cloudflare Pages Functions entry point.
 * Routes all /api/* requests through the Hono application.
 *
 * File path: functions/api/[[route]].ts
 * The [[route]] pattern is a catch-all that matches any path under /api/.
 */

import { createApp, type AppBindings } from '../../src/backend/index';

export const onRequest: PagesFunction<AppBindings> = async (context) => {
  // Create the Hono app with Cloudflare bindings
  const app = createApp(context.env as unknown as AppBindings);

  // Fetch the request path relative to /api/
  // context.request.url might be: https://example.com/api/auth/login
  // We need to pass: /api/auth/login to Hono
  const url = new URL(context.request.url);

  // Build the path that Hono should handle
  // The function is mounted at /api/ so the path starts from there
  const path = url.pathname;

  // Create a new Request with the correct path for Hono
  const honoRequest = new Request(context.request.url, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== 'GET' ? context.request.body : undefined,
  });

  // Handle the request with Hono
  return app.fetch(honoRequest, {
    DB: context.env.DB,
    LLM_API_KEY: context.env.LLM_API_KEY,
    LLM_API_URL: context.env.LLM_API_URL,
    LLM_MODEL: context.env.LLM_MODEL,
  });
};
