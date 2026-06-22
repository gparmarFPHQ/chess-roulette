/**
 * D1 implementation of the StorageProvider interface.
 * Uses prepared statements for all queries.
 */

import type {
  StorageProvider,
  User,
  Session,
  Highlight,
  Note,
  Draft,
  ChatSession,
  ChatMessage,
} from './storageProvider';

export interface D1StorageProviderEnv {
  DB: D1Database;
}

export class D1StorageProvider implements StorageProvider {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ─── Auth ─────────────────────────────────────────────────────

  async createUser(username: string, passwordHash: string): Promise<User> {
    const id = crypto.randomUUID();
    const created_at = Date.now();

    await this.db.prepare(
      'INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(id, username, passwordHash, created_at)
      .run();

    return { id, username, password_hash: passwordHash, created_at };
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE username = ?'
    )
      .bind(username)
      .first<User>();

    return result ?? null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    )
      .bind(userId)
      .first<User>();

    return result ?? null;
  }

  async createSession(userId: string, sessionId: string, expiresAt: number): Promise<Session> {
    const created_at = Date.now();

    await this.db.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(sessionId, userId, expiresAt, created_at)
      .run();

    return { id: sessionId, user_id: userId, expires_at: expiresAt, created_at };
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const result = await this.db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > ?'
    )
      .bind(sessionId, Date.now())
      .first<Session>();

    return result ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM sessions WHERE id = ?'
    )
      .bind(sessionId)
      .run();
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db.prepare(
      'DELETE FROM sessions WHERE expires_at <= ?'
    )
      .bind(Date.now())
      .run();
  }

  // ─── Highlights ───────────────────────────────────────────────

  async createHighlight(highlight: Highlight): Promise<Highlight> {
    await this.db.prepare(
      'INSERT INTO highlights (id, user_id, case_id, chunk_id, text_content, color, anchor_start, anchor_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        highlight.id,
        highlight.user_id,
        highlight.case_id,
        highlight.chunk_id,
        highlight.text_content,
        highlight.color,
        highlight.anchor_start,
        highlight.anchor_end,
        highlight.created_at,
        highlight.updated_at
      )
      .run();

    return highlight;
  }

  async getHighlights(userId: string, caseId: string): Promise<Highlight[]> {
    const result = await this.db.prepare(
      'SELECT * FROM highlights WHERE user_id = ? AND case_id = ? ORDER BY created_at ASC'
    )
      .bind(userId, caseId)
      .all<Highlight>();

    return result.results ?? [];
  }

  async getHighlightById(id: string, userId: string): Promise<Highlight | null> {
    const result = await this.db.prepare(
      'SELECT * FROM highlights WHERE id = ? AND user_id = ?'
    )
      .bind(id, userId)
      .first<Highlight>();

    return result ?? null;
  }

  async updateHighlight(id: string, userId: string, updates: Partial<Highlight>): Promise<Highlight> {
    const allowedFields = ['text_content', 'color', 'anchor_start', 'anchor_end'];
    const fieldEntries = Object.entries(updates).filter(([key]) => allowedFields.includes(key));

    if (fieldEntries.length === 0) {
      const existing = await this.getHighlightById(id, userId);
      if (!existing) throw new Error('Highlight not found');
      return existing;
    }

    const setClauses = fieldEntries.map(([key]) => `${key} = ?`);
    const values: (string | number)[] = fieldEntries.map(([, value]) => value as string);
    values.push(Date.now(), id, userId);

    await this.db.prepare(
      `UPDATE highlights SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ? AND user_id = ?`
    )
      .bind(...values)
      .run();

    const updated = await this.getHighlightById(id, userId);
    if (!updated) throw new Error('Highlight not found');
    return updated;
  }

  async deleteHighlight(id: string, userId: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM highlights WHERE id = ? AND user_id = ?'
    )
      .bind(id, userId)
      .run();
  }

  // ─── Notes ────────────────────────────────────────────────────

  async createNote(note: Note): Promise<Note> {
    await this.db.prepare(
      'INSERT INTO notes (id, user_id, case_id, chunk_id, anchor_start, anchor_end, content, note_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        note.id,
        note.user_id,
        note.case_id,
        note.chunk_id ?? null,
        note.anchor_start ?? null,
        note.anchor_end ?? null,
        note.content,
        note.note_type,
        note.created_at,
        note.updated_at
      )
      .run();

    return note;
  }

  async getNotes(userId: string, caseId: string): Promise<Note[]> {
    const result = await this.db.prepare(
      'SELECT * FROM notes WHERE user_id = ? AND case_id = ? ORDER BY created_at ASC'
    )
      .bind(userId, caseId)
      .all<Note>();

    return result.results ?? [];
  }

  async getNoteById(id: string, userId: string): Promise<Note | null> {
    const result = await this.db.prepare(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?'
    )
      .bind(id, userId)
      .first<Note>();

    return result ?? null;
  }

  async updateNote(id: string, userId: string, updates: Partial<Note>): Promise<Note> {
    const allowedFields = ['content', 'chunk_id', 'anchor_start', 'anchor_end', 'note_type'];
    const fieldEntries = Object.entries(updates).filter(([key]) => allowedFields.includes(key));

    if (fieldEntries.length === 0) {
      const existing = await this.getNoteById(id, userId);
      if (!existing) throw new Error('Note not found');
      return existing;
    }

    const setClauses = fieldEntries.map(([key]) => `${key} = ?`);
    const values: (string | number | null)[] = fieldEntries.map(([, value]) => value);
    values.push(Date.now(), id, userId);

    await this.db.prepare(
      `UPDATE notes SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ? AND user_id = ?`
    )
      .bind(...values)
      .run();

    const updated = await this.getNoteById(id, userId);
    if (!updated) throw new Error('Note not found');
    return updated;
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM notes WHERE id = ? AND user_id = ?'
    )
      .bind(id, userId)
      .run();
  }

  // ─── Drafts ───────────────────────────────────────────────────

  async getDraft(userId: string, caseId: string): Promise<Draft | null> {
    const result = await this.db.prepare(
      'SELECT * FROM drafts WHERE user_id = ? AND case_id = ?'
    )
      .bind(userId, caseId)
      .first<Draft>();

    return result ?? null;
  }

  async saveDraft(draft: Draft): Promise<Draft> {
    const existing = await this.getDraft(draft.user_id, draft.case_id);

    if (existing) {
      // Update existing draft
      await this.db.prepare(
        'UPDATE drafts SET content = ?, word_count = ?, updated_at = ? WHERE id = ?'
      )
        .bind(draft.content, draft.word_count, draft.updated_at, existing.id)
        .run();

      return { ...existing, content: draft.content, word_count: draft.word_count, updated_at: draft.updated_at };
    }

    // Create new draft
    await this.db.prepare(
      'INSERT INTO drafts (id, user_id, case_id, content, word_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        draft.id,
        draft.user_id,
        draft.case_id,
        draft.content,
        draft.word_count,
        draft.created_at,
        draft.updated_at
      )
      .run();

    return draft;
  }

  // ─── Chat ─────────────────────────────────────────────────────

  async createChatSession(session: ChatSession): Promise<ChatSession> {
    await this.db.prepare(
      'INSERT INTO chat_sessions (id, user_id, case_id, persona_id, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(
        session.id,
        session.user_id,
        session.case_id,
        session.persona_id,
        session.created_at
      )
      .run();

    return session;
  }

  async getChatSessions(userId: string, caseId: string): Promise<ChatSession[]> {
    const result = await this.db.prepare(
      'SELECT * FROM chat_sessions WHERE user_id = ? AND case_id = ? ORDER BY created_at DESC'
    )
      .bind(userId, caseId)
      .all<ChatSession>();

    return result.results ?? [];
  }

  async getChatSessionById(sessionId: string, userId: string): Promise<ChatSession | null> {
    const result = await this.db.prepare(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?'
    )
      .bind(sessionId, userId)
      .first<ChatSession>();

    return result ?? null;
  }

  async createChatMessage(message: ChatMessage): Promise<ChatMessage> {
    await this.db.prepare(
      'INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(
        message.id,
        message.session_id,
        message.role,
        message.content,
        message.created_at
      )
      .run();

    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const result = await this.db.prepare(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
    )
      .bind(sessionId)
      .all<ChatMessage>();

    return result.results ?? [];
  }
}
