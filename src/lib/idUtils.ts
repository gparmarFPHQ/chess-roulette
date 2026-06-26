// ============================================================================
// MBA Case Study Platform — ID Generation Utilities
// ============================================================================
// Centralized ID generation for all client-side persisted entities.
// Uses crypto.randomUUID when available, falls back to a timestamp-based
// UUID v4 for older environments.
// ============================================================================

/**
 * Generate a unique identifier (UUID v4).
 * Uses the native crypto.randomUUID when available.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp-based UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short, readable ID suitable for display.
 * Format: "abc123" (6 random alphanumeric chars).
 */
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
