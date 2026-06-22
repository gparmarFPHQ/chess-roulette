/**
 * Password hashing utilities using Web Crypto API (PBKDF2 + SHA-256).
 * Compatible with Cloudflare Workers — no external crypto libraries needed.
 */

const SALT_LENGTH = 16;
const ITERATIONS = 100_000;
const HASH_LENGTH = 32; // 256 bits

/**
 * Generate a cryptographically secure random salt.
 */
export async function generateSalt(): Promise<string> {
  const array = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a given salt using PBKDF2.
 * Returns a hex-encoded string: "<salt>:<hash>".
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const saltBuffer = hexToBuffer(salt);
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${salt}:${hashHex}`;
}

/**
 * Hash a password with a freshly generated salt.
 * Returns the full stored hash string: "<salt>:<hash>".
 */
export async function hashPasswordWithSalt(password: string): Promise<string> {
  const salt = await generateSalt();
  return hashPassword(password, salt);
}

/**
 * Verify a password against a stored hash.
 * The stored hash format is "<salt>:<hash>".
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid hash format');
  }

  const [salt, expectedHash] = parts;
  const computedHash = await hashPassword(password, salt);
  const [, computedHashValue] = computedHash.split(':');

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(expectedHash, computedHashValue);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Convert a hex string to an ArrayBuffer.
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}
