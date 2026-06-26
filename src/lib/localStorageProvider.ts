// ============================================================================
// MBA Case Study Platform — Local Storage Provider
// ============================================================================
// localStorage-backed implementation of the StorageProvider interface.
// All data is scoped by userId and caseId, stored under a single
// `mba-case-study` key as a JSON document.
//
// This enables fully offline operation for the demo without a backend.
// ============================================================================

import type {
  StorageProvider,
  User,
  Session,
  Highlight,
  Note,
  Draft,
  ChatSession,
  ChatMessage,
} from '../backend/storageProvider';
import { generateId } from './idUtils';

// ─── Constants ────────────────────────────────────────────────────

/** The single localStorage key for all app data. */
const STORAGE_KEY = 'mba-case-study';

/** Default demo user ID used throughout the app. */
export const DEMO_USER_ID = 'demo-user';

/** Default case ID for the Coffee Wars case study. */
export const DEFAULT_CASE_ID = 'coffee-wars-india';

// ─── Internal Database Shape ──────────────────────────────────────

interface LocalDb {
  users: Record<string, User>;
  sessions: Record<string, Session>;
  highlights: Record<string, Highlight>;
  notes: Record<string, Note>;
  drafts: Record<string, Draft>;
  chatSessions: Record<string, ChatSession>;
  chatMessages: Record<string, ChatMessage>;
}

/** Default empty database. */
const emptyDb: LocalDb = {
  users: {},
  sessions: {},
  highlights: {},
  notes: {},
  drafts: {},
  chatSessions: {},
  chatMessages: {},
};

// ─── Read / Write Helpers ─────────────────────────────────────────

function readDb(): LocalDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyDb };
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    // Ensure all collections exist
    return {
      users: parsed.users ?? {},
      sessions: parsed.sessions ?? {},
      highlights: parsed.highlights ?? {},
      notes: parsed.notes ?? {},
      drafts: parsed.drafts ?? {},
      chatSessions: parsed.chatSessions ?? {},
      chatMessages: parsed.chatMessages ?? {},
    };
  } catch {
    return { ...emptyDb };
  }
}

function writeDb(db: LocalDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

// ─── Provider Factory ─────────────────────────────────────────────

/**
 * Create a localStorage-backed StorageProvider scoped to a specific user.
 *
 * @param userId - The user ID to scope all data to.
 * @returns A StorageProvider implementation using localStorage.
 */
export function createLocalStorageProvider(userId: string): StorageProvider {
  return {
    // ── Auth (no-op for demo) ────────────────────────────────────

    createUser: async (username: string, passwordHash: string): Promise<User> => {
      const id = generateId();
      const user: User = { id, username, password_hash: passwordHash, created_at: Date.now() };
      const db = readDb();
      db.users[id] = user;
      writeDb(db);
      return user;
    },

    getUserByUsername: async (username: string): Promise<User | null> => {
      const db = readDb();
      return Object.values(db.users).find((u) => u.username === username) ?? null;
    },

    getUserById: async (id: string): Promise<User | null> => {
      const db = readDb();
      return db.users[id] ?? null;
    },

    createSession: async (
      _userId: string,
      sessionId: string,
      expiresAt: number
    ): Promise<Session> => {
      const session: Session = { id: sessionId, user_id: _userId, expires_at: expiresAt, created_at: Date.now() };
      const db = readDb();
      db.sessions[sessionId] = session;
      writeDb(db);
      return session;
    },

    getSession: async (sessionId: string): Promise<Session | null> => {
      const db = readDb();
      return db.sessions[sessionId] ?? null;
    },

    deleteSession: async (sessionId: string): Promise<void> => {
      const db = readDb();
      delete db.sessions[sessionId];
      writeDb(db);
    },

    cleanupExpiredSessions: async (): Promise<void> => {
      const db = readDb();
      const now = Date.now();
      for (const [id, session] of Object.entries(db.sessions)) {
        if (session.expires_at < now) {
          delete db.sessions[id];
        }
      }
      writeDb(db);
    },

    // ── Highlights ───────────────────────────────────────────────

    createHighlight: async (highlight: Highlight): Promise<Highlight> => {
      const db = readDb();
      db.highlights[highlight.id] = highlight;
      writeDb(db);
      return highlight;
    },

    getHighlights: async (_userId: string, caseId: string): Promise<Highlight[]> => {
      const db = readDb();
      return Object.values(db.highlights).filter(
        (h) => h.user_id === _userId && h.case_id === caseId
      );
    },

    getHighlightById: async (id: string, _userId: string): Promise<Highlight | null> => {
      const db = readDb();
      const h = db.highlights[id];
      if (!h || h.user_id !== _userId) return null;
      return h;
    },

    updateHighlight: async (
      id: string,
      _userId: string,
      updates: Partial<Highlight>
    ): Promise<Highlight> => {
      const db = readDb();
      const existing = db.highlights[id];
      if (!existing || existing.user_id !== _userId) {
        throw new Error(`Highlight ${id} not found`);
      }
      const updated: Highlight = { ...existing, ...updates, updated_at: Date.now() };
      db.highlights[id] = updated;
      writeDb(db);
      return updated;
    },

    deleteHighlight: async (id: string, _userId: string): Promise<void> => {
      const db = readDb();
      const existing = db.highlights[id];
      if (existing && existing.user_id === _userId) {
        delete db.highlights[id];
        writeDb(db);
      }
    },

    // ── Notes ────────────────────────────────────────────────────

    createNote: async (note: Note): Promise<Note> => {
      const db = readDb();
      db.notes[note.id] = note;
      writeDb(db);
      return note;
    },

    getNotes: async (_userId: string, caseId: string): Promise<Note[]> => {
      const db = readDb();
      return Object.values(db.notes).filter(
        (n) => n.user_id === _userId && n.case_id === caseId
      );
    },

    getNoteById: async (id: string, _userId: string): Promise<Note | null> => {
      const db = readDb();
      const n = db.notes[id];
      if (!n || n.user_id !== _userId) return null;
      return n;
    },

    updateNote: async (
      id: string,
      _userId: string,
      updates: Partial<Note>
    ): Promise<Note> => {
      const db = readDb();
      const existing = db.notes[id];
      if (!existing || existing.user_id !== _userId) {
        throw new Error(`Note ${id} not found`);
      }
      const updated: Note = { ...existing, ...updates, updated_at: Date.now() };
      db.notes[id] = updated;
      writeDb(db);
      return updated;
    },

    deleteNote: async (id: string, _userId: string): Promise<void> => {
      const db = readDb();
      const existing = db.notes[id];
      if (existing && existing.user_id === _userId) {
        delete db.notes[id];
        writeDb(db);
      }
    },

    // ── Drafts ───────────────────────────────────────────────────

    getDraft: async (_userId: string, caseId: string): Promise<Draft | null> => {
      const db = readDb();
      return (
        Object.values(db.drafts).find(
          (d) => d.user_id === _userId && d.case_id === caseId
        ) ?? null
      );
    },

    saveDraft: async (draft: Draft): Promise<Draft> => {
      const db = readDb();
      db.drafts[draft.id] = draft;
      writeDb(db);
      return draft;
    },

    // ── Chat ─────────────────────────────────────────────────────

    createChatSession: async (session: ChatSession): Promise<ChatSession> => {
      const db = readDb();
      db.chatSessions[session.id] = session;
      writeDb(db);
      return session;
    },

    getChatSessions: async (_userId: string, caseId: string): Promise<ChatSession[]> => {
      const db = readDb();
      return Object.values(db.chatSessions).filter(
        (s) => s.user_id === _userId && s.case_id === caseId
      );
    },

    getChatSessionById: async (
      sessionId: string,
      _userId: string
    ): Promise<ChatSession | null> => {
      const db = readDb();
      const s = db.chatSessions[sessionId];
      if (!s || s.user_id !== _userId) return null;
      return s;
    },

    createChatMessage: async (message: ChatMessage): Promise<ChatMessage> => {
      const db = readDb();
      db.chatMessages[message.id] = message;
      writeDb(db);
      return message;
    },

    getChatMessages: async (sessionId: string): Promise<ChatMessage[]> => {
      const db = readDb();
      return Object.values(db.chatMessages)
        .filter((m) => m.session_id === sessionId)
        .sort((a, b) => a.created_at - b.created_at);
    },
  };
}

// ─── Convenience: Default Provider ────────────────────────────────

/**
 * Get the default localStorage provider for the demo user.
 * Call this once and reuse across stores.
 */
export function getDefaultStorageProvider(): StorageProvider {
  return createLocalStorageProvider(DEMO_USER_ID);
}
