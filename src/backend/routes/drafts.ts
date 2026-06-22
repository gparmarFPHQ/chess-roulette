/**
 * Drafts routes: get and save user's essay draft per case.
 * Each user has exactly one draft per case (upsert behavior).
 */

import { Hono } from 'hono';
import type { Draft } from '../storageProvider';
import type { BackendEnv } from '../types';

export function createDraftsRoutes(): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // GET /api/cases/:caseId/draft
  router.get('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    const draft = await storage.getDraft(user.id, caseId);

    if (!draft) {
      return c.json({ draft: null });
    }

    return c.json({ draft });
  });

  // PUT /api/cases/:caseId/draft
  router.put('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    let body: { content: string; word_count?: number };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { content, word_count } = body;

    if (typeof content !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'Content is required and must be a string' },
        400
      );
    }

    // Calculate word count if not provided
    const calculatedWordCount = word_count ?? countWords(content);

    const now = Date.now();

    // Check if a draft already exists for this user/case
    const existing = await storage.getDraft(user.id, caseId);

    let draft: Draft;
    if (existing) {
      draft = {
        ...existing,
        content,
        word_count: calculatedWordCount,
        updated_at: now,
      };
    } else {
      draft = {
        id: crypto.randomUUID(),
        user_id: user.id,
        case_id: caseId,
        content,
        word_count: calculatedWordCount,
        created_at: now,
        updated_at: now,
      };
    }

    const saved = await storage.saveDraft(draft);

    return c.json({ draft: saved });
  });

  return router;
}

/**
 * Count words in a string.
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
