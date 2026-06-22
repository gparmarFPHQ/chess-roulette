/**
 * Shared Hono types for the MBA Case Study backend.
 * Defines the Env type with Variables that all routes and middleware use.
 */

import type { User, StorageProvider } from './storageProvider';

/**
 * Hono environment type with our custom variables.
 * All route handlers and middleware should use this type.
 */
export interface BackendEnv {
  Variables: {
    user: User;
    storage: StorageProvider;
  };
  Bindings: {
    DB: D1Database;
    LLM_API_KEY: string;
    LLM_API_URL: string;
    LLM_MODEL: string;
  };
}
