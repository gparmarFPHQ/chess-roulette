/**
 * Highlights routes: CRUD for text highlights within case studies.
 */

import { Hono } from 'hono';
import type { Highlight } from '../storageProvider';
import type { BackendEnv } from '../types';

export function createHighlightsRoutes(): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // GET /api/cases/:caseId/highlights
  router.get('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    const highlights = await storage.getHighlights(user.id, caseId);

    return c.json({ highlights });
  });

  // POST /api/cases/:caseId/highlights
  router.post('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    let body: Omit<Highlight, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { chunk_id, text_content, color, anchor_start, anchor_end } = body;

    // Validate required fields
    if (!chunk_id || !text_content || !color || !anchor_start || !anchor_end) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'chunk_id, text_content, color, anchor_start, and anchor_end are required',
        },
        400
      );
    }

    const now = Date.now();
    const highlight: Highlight = {
      id: crypto.randomUUID(),
      user_id: user.id,
      case_id: caseId,
      chunk_id,
      text_content,
      color,
      anchor_start,
      anchor_end,
      created_at: now,
      updated_at: now,
    };

    const created = await storage.createHighlight(highlight);

    return c.json({ highlight: created }, 201);
  });

  // PUT /api/cases/:caseId/highlights/:id
  router.put('/:id', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const id = c.req.param('id');

    let body: Partial<Highlight>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    try {
      const updated = await storage.updateHighlight(id, user.id, body);
      return c.json({ highlight: updated });
    } catch (err) {
      if (err instanceof Error && err.message === 'Highlight not found') {
        return c.json({ error: 'Not Found', message: 'Highlight not found' }, 404);
      }
      return c.json(
        { error: 'Internal Server Error', message: 'Failed to update highlight' },
        500
      );
    }
  });

  // DELETE /api/cases/:caseId/highlights/:id
  router.delete('/:id', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const id = c.req.param('id');

    await storage.deleteHighlight(id, user.id);

    return c.json({ success: true });
  });

  return router;
}
