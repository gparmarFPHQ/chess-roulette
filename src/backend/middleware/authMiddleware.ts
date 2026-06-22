/**
 * Authentication middleware for Hono routes.
 * Validates session tokens and attaches user info to request context.
 */

import type { Context, MiddlewareHandler } from 'hono';
import type { StorageProvider, User } from '../storageProvider';
import type { BackendEnv } from '../types';
import { extractSessionToken } from '../utils/session';

/**
 * Create an auth middleware that validates session tokens.
 * Returns 401 if the session is missing, invalid, or expired.
 * Attaches the authenticated user to c.set('user', user).
 */
export function authMiddleware(
  storage: StorageProvider
): MiddlewareHandler<BackendEnv> {
  return async (c: Context<BackendEnv>, next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractSessionToken(authHeader);

    if (!token) {
      return c.json(
        { error: 'Unauthorized', message: 'No session token provided' },
        401
      );
    }

    // Look up the session
    const session = await storage.getSession(token);

    if (!session) {
      return c.json(
        { error: 'Unauthorized', message: 'Invalid or expired session' },
        401
      );
    }

    // Look up the user
    const user = await storage.getUserById(session.user_id);

    if (!user) {
      // Session exists but user is gone — clean up orphaned session
      await storage.deleteSession(token);
      return c.json(
        { error: 'Unauthorized', message: 'User not found' },
        401
      );
    }

    // Attach user to context
    c.set('user', user);
    c.set('storage', storage);

    await next();
  };
}

/**
 * Optional auth middleware — attaches user if a valid token is present,
 * but doesn't reject the request if no token is provided.
 */
export function optionalAuthMiddleware(
  storage: StorageProvider
): MiddlewareHandler<BackendEnv> {
  return async (c: Context<BackendEnv>, next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractSessionToken(authHeader);

    if (token) {
      const session = await storage.getSession(token);
      if (session) {
        const user = await storage.getUserById(session.user_id);
        if (user) {
          c.set('user', user);
        }
      }
    }

    c.set('storage', storage);
    await next();
  };
}
