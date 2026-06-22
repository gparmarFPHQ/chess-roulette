/**
 * Authentication routes: register, login, logout, me.
 */

import { Hono } from 'hono';
import type { StorageProvider, User } from '../storageProvider';
import type { BackendEnv } from '../types';
import { hashPasswordWithSalt, verifyPassword } from '../utils/password';
import { generateSessionToken, getSessionExpiry } from '../utils/session';

export function createAuthRoutes(): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // POST /api/auth/register
  router.post('/register', async (c) => {
    const storage = c.get('storage');

    let body: { username: string; password: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { username, password } = body;

    // Validate input
    if (!username || typeof username !== 'string') {
      return c.json({ error: 'Bad Request', message: 'Username is required' }, 400);
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return c.json(
        { error: 'Bad Request', message: 'Password must be at least 6 characters' },
        400
      );
    }
    if (username.length < 3 || username.length > 32) {
      return c.json(
        { error: 'Bad Request', message: 'Username must be 3-32 characters' },
        400
      );
    }

    // Check if username is taken
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return c.json(
        { error: 'Conflict', message: 'Username already taken' },
        409
      );
    }

    // Hash password and create user
    const passwordHash = await hashPasswordWithSalt(password);
    const user = await storage.createUser(username, passwordHash);

    // Create session
    const sessionId = generateSessionToken();
    const expiresAt = getSessionExpiry();
    const session = await storage.createSession(user.id, sessionId, expiresAt);

    return c.json(
      {
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
        },
        session: {
          token: sessionId,
          expires_at: session.expires_at,
        },
      },
      201
    );
  });

  // POST /api/auth/login
  router.post('/login', async (c) => {
    const storage = c.get('storage');

    let body: { username: string; password: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { username, password } = body;

    if (!username || !password) {
      return c.json(
        { error: 'Bad Request', message: 'Username and password are required' },
        400
      );
    }

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return c.json(
        { error: 'Unauthorized', message: 'Invalid credentials' },
        401
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json(
        { error: 'Unauthorized', message: 'Invalid credentials' },
        401
      );
    }

    // Create session
    const sessionId = generateSessionToken();
    const expiresAt = getSessionExpiry();
    const session = await storage.createSession(user.id, sessionId, expiresAt);

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
      session: {
        token: sessionId,
        expires_at: session.expires_at,
      },
    });
  });

  // POST /api/auth/logout
  router.post('/logout', async (c) => {
    const storage = c.get('storage');
    const authHeader = c.req.header('Authorization');

    // Extract token — support both Bearer and raw formats
    let token: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    }

    // Also check for token in body (for convenience)
    if (!token) {
      try {
        const body = await c.req.json();
        token = body.token ?? null;
      } catch {
        // No body, no header — that's fine, just return success
      }
    }

    if (token) {
      await storage.deleteSession(token);
    }

    return c.json({ success: true });
  });

  // GET /api/auth/me
  router.get('/me', async (c) => {
    const user = c.get('user');

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
    });
  });

  return router;
}
