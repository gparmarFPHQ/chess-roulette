/**
 * Notes routes: CRUD for inline, margin, and freeform notes.
 */

import { Hono } from 'hono';
import type { Note } from '../storageProvider';
import type { BackendEnv } from '../types';

export function createNotesRoutes(): Hono<BackendEnv> {
  const router = new Hono<BackendEnv>();

  // GET /api/cases/:caseId/notes
  router.get('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    const notes = await storage.getNotes(user.id, caseId);

    return c.json({ notes });
  });

  // POST /api/cases/:caseId/notes
  router.post('/', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const caseId = c.req.param('caseId');

    if (!caseId) {
      return c.json({ error: 'Bad Request', message: 'caseId is required' }, 400);
    }

    let body: {
      content: string;
      note_type: 'inline' | 'margin' | 'freeform';
      chunk_id?: string | null;
      anchor_start?: string | null;
      anchor_end?: string | null;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    const { content, note_type, chunk_id, anchor_start, anchor_end } = body;

    // Validate required fields
    if (!content || typeof content !== 'string') {
      return c.json(
        { error: 'Bad Request', message: 'Content is required and must be a string' },
        400
      );
    }

    const validTypes: string[] = ['inline', 'margin', 'freeform'];
    if (!note_type || !validTypes.includes(note_type)) {
      return c.json(
        {
          error: 'Bad Request',
          message: `note_type must be one of: ${validTypes.join(', ')}`,
        },
        400
      );
    }

    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      user_id: user.id,
      case_id: caseId,
      chunk_id: chunk_id ?? null,
      anchor_start: anchor_start ?? null,
      anchor_end: anchor_end ?? null,
      content,
      note_type,
      created_at: now,
      updated_at: now,
    };

    const created = await storage.createNote(note);

    return c.json({ note: created }, 201);
  });

  // PUT /api/cases/:caseId/notes/:id
  router.put('/:id', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const id = c.req.param('id');

    let body: Partial<Note>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Bad Request', message: 'Invalid JSON body' }, 400);
    }

    try {
      const updated = await storage.updateNote(id, user.id, body);
      return c.json({ note: updated });
    } catch (err) {
      if (err instanceof Error && err.message === 'Note not found') {
        return c.json({ error: 'Not Found', message: 'Note not found' }, 404);
      }
      return c.json(
        { error: 'Internal Server Error', message: 'Failed to update note' },
        500
      );
    }
  });

  // DELETE /api/cases/:caseId/notes/:id
  router.delete('/:id', async (c) => {
    const storage = c.get('storage');
    const user = c.get('user');
    const id = c.req.param('id');

    await storage.deleteNote(id, user.id);

    return c.json({ success: true });
  });

  return router;
}
