/**
 * StorageProvider interface — the abstraction layer for all data access.
 * All storage operations go through this interface. UI code should never
 * call D1 directly.
 */

// ─── Domain Types ───────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: number;
}

export interface Highlight {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string;
  text_content: string;
  color: string;
  anchor_start: string;
  anchor_end: string;
  created_at: number;
  updated_at: number;
}

export interface Note {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string | null;
  anchor_start: string | null;
  anchor_end: string | null;
  content: string;
  note_type: 'inline' | 'margin' | 'freeform';
  created_at: number;
  updated_at: number;
}

export interface Draft {
  id: string;
  user_id: string;
  case_id: string;
  content: string;
  word_count: number;
  created_at: number;
  updated_at: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  case_id: string;
  persona_id: string;
  created_at: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

// ─── Interface ──────────────────────────────────────────────────

export interface StorageProvider {
  // ── Auth ─────────────────────────────────────────────────────
  createUser(username: string, passwordHash: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  createSession(userId: string, sessionId: string, expiresAt: number): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;

  // ── Highlights ───────────────────────────────────────────────
  createHighlight(highlight: Highlight): Promise<Highlight>;
  getHighlights(userId: string, caseId: string): Promise<Highlight[]>;
  getHighlightById(id: string, userId: string): Promise<Highlight | null>;
  updateHighlight(id: string, userId: string, updates: Partial<Highlight>): Promise<Highlight>;
  deleteHighlight(id: string, userId: string): Promise<void>;

  // ── Notes ────────────────────────────────────────────────────
  createNote(note: Note): Promise<Note>;
  getNotes(userId: string, caseId: string): Promise<Note[]>;
  getNoteById(id: string, userId: string): Promise<Note | null>;
  updateNote(id: string, userId: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string, userId: string): Promise<void>;

  // ── Drafts ───────────────────────────────────────────────────
  getDraft(userId: string, caseId: string): Promise<Draft | null>;
  saveDraft(draft: Draft): Promise<Draft>;

  // ── Chat ─────────────────────────────────────────────────────
  createChatSession(session: ChatSession): Promise<ChatSession>;
  getChatSessions(userId: string, caseId: string): Promise<ChatSession[]>;
  getChatSessionById(sessionId: string, userId: string): Promise<ChatSession | null>;
  createChatMessage(message: ChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}
