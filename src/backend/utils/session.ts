/**
 * Session token generation and validation utilities.
 * Uses Web Crypto API for cryptographically secure random tokens.
 */

const TOKEN_LENGTH = 32; // 256 bits of entropy
const DEFAULT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionConfig {
  /** Session time-to-live in milliseconds. Default: 30 days. */
  ttlMs?: number;
}

/**
 * Generate a cryptographically secure session token.
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calculate the expiry timestamp (in milliseconds since epoch) for a session.
 */
export function getSessionExpiry(config?: SessionConfig): number {
  const ttl = config?.ttlMs ?? DEFAULT_SESSION_TTL_MS;
  return Date.now() + ttl;
}

/**
 * Check if a session has expired based on its expiry timestamp.
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Extract the session token from an Authorization header.
 * Supports both "Bearer <token>" and raw token formats.
 */
export function extractSessionToken(authorization: string | null | undefined): string | null {
  if (!authorization) return null;

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim() || null;
  }

  return authorization.trim() || null;
}
