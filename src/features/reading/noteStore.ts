// ============================================================================
// MBA Case Study Platform — Note Store
// ============================================================================
// Zustand store for managing notes with localStorage persistence.
// Handles inline, margin, and freeform notes.
// Data persists across page reloads via localStorage.
// ============================================================================

import { create } from 'zustand';
import type {
  Note,
  NoteType,
  SerializedRange,
} from './types';
import { getDefaultStorageProvider, DEMO_USER_ID } from '../../lib/localStorageProvider';
import { generateId } from '../../lib/idUtils';

// ---------------------------------------------------------------------------
// Backend ↔ Domain Type Mapping
// ---------------------------------------------------------------------------

/**
 * Map backend Note (snake_case) to domain Note (camelCase).
 */
function backendToDomain(n: {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string | null;
  anchor_start: string | null;
  anchor_end: string | null;
  content: string;
  note_type: NoteType;
  created_at: number;
  updated_at: number;
}): Note {
  return {
    id: n.id,
    userId: n.user_id,
    caseId: n.case_id,
    chunkId: n.chunk_id ?? undefined,
    anchorStart: n.anchor_start ? parseSerializedRange(n.anchor_start) : undefined,
    anchorEnd: n.anchor_end ? parseSerializedRange(n.anchor_end) : undefined,
    content: n.content,
    noteType: n.note_type,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  };
}

/**
 * Map domain Note to backend shape for storage.
 */
function domainToBackend(n: Note): {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string | null;
  anchor_start: string | null;
  anchor_end: string | null;
  content: string;
  note_type: NoteType;
  created_at: number;
  updated_at: number;
} {
  return {
    id: n.id,
    user_id: n.userId,
    case_id: n.caseId,
    chunk_id: n.chunkId ?? null,
    anchor_start: n.anchorStart ? JSON.stringify(n.anchorStart) : null,
    anchor_end: n.anchorEnd ? JSON.stringify(n.anchorEnd) : null,
    content: n.content,
    note_type: n.noteType,
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  };
}

function parseSerializedRange(raw: string): SerializedRange {
  try {
    return JSON.parse(raw);
  } catch {
    return { textQuote: '', prefix: '', suffix: '', offset: 0 };
  }
}

// ---------------------------------------------------------------------------
// Store Definition
// ---------------------------------------------------------------------------

interface NoteState {
  // ── Data ──────────────────────────────────────────────────────
  notes: Note[];
  currentCaseId: string | null;
  isLoading: boolean;
  error: string | null;

  // ── Active Editor ─────────────────────────────────────────────
  editingNote: Note | null;
  newNoteAnchor: {
    chunkId: string;
    anchorStart: any;
    anchorEnd: any;
    textContent: string;
  } | null;

  // ── Actions ───────────────────────────────────────────────────
  loadNotes: (caseId: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  clearNotes: () => void;

  // ── Editor Actions ────────────────────────────────────────────
  openNoteEditor: (note: Note) => void;
  openNewNoteEditor: (anchor: {
    chunkId: string;
    anchorStart: any;
    anchorEnd: any;
    textContent: string;
  }) => void;
  closeNoteEditor: () => void;

  // ── Query Helpers ─────────────────────────────────────────────
  getNotesForChunk: (chunkId: string) => Note[];
  getNotesByType: (type: NoteType) => Note[];
  getAnchoredNotes: () => Note[];
  getFreeformNotes: () => Note[];
}

// ---------------------------------------------------------------------------
// Storage Provider (singleton)
// ---------------------------------------------------------------------------

const storage = getDefaultStorageProvider();

// ---------------------------------------------------------------------------
// Store Creation
// ---------------------------------------------------------------------------

export const useNoteStore = create<NoteState>((set, get) => ({
  // ── Initial State ─────────────────────────────────────────────
  notes: [],
  currentCaseId: null,
  isLoading: false,
  error: null,
  editingNote: null,
  newNoteAnchor: null,

  // ── Load Notes ────────────────────────────────────────────────
  loadNotes: async (caseId: string) => {
    set({ isLoading: true, error: null, currentCaseId: caseId });
    try {
      const backendNotes = await storage.getNotes(DEMO_USER_ID, caseId);
      const notes = backendNotes.map(backendToDomain);
      set({ notes, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notes';
      set({ error: message, isLoading: false });
      console.error('Failed to load notes:', err);
    }
  },

  // ── Add Note ──────────────────────────────────────────────────
  addNote: async (note) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded. Call loadNotes first.');
    }

    const now = Date.now();
    const backendNote = domainToBackend({
      id: generateId(),
      userId: DEMO_USER_ID,
      caseId: currentCaseId,
      chunkId: note.chunkId,
      anchorStart: note.anchorStart,
      anchorEnd: note.anchorEnd,
      content: note.content,
      noteType: note.noteType,
      createdAt: now,
      updatedAt: now,
    });

    try {
      const saved = await storage.createNote(backendNote);
      const domainNote = backendToDomain(saved);
      set((state) => ({
        notes: [...state.notes, domainNote],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note';
      set({ error: message });
      console.error('Failed to create note:', err);
      throw err;
    }
  },

  // ── Update Note ───────────────────────────────────────────────
  updateNote: async (id: string, updates: Partial<Note>) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded.');
    }

    // Convert domain updates to backend format
    const backendUpdates: Partial<{
      content: string;
      note_type: NoteType;
      chunk_id: string | null;
      anchor_start: string | null;
      anchor_end: string | null;
    }> = {};
    if (updates.content) backendUpdates.content = updates.content;
    if (updates.noteType) backendUpdates.note_type = updates.noteType;
    if (updates.chunkId !== undefined) backendUpdates.chunk_id = updates.chunkId ?? null;
    if (updates.anchorStart) backendUpdates.anchor_start = JSON.stringify(updates.anchorStart);
    if (updates.anchorEnd) backendUpdates.anchor_end = JSON.stringify(updates.anchorEnd);

    try {
      const updatedBackend = await storage.updateNote(id, DEMO_USER_ID, backendUpdates);
      const domainNote = backendToDomain(updatedBackend);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? domainNote : n)),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note';
      set({ error: message });
      console.error('Failed to update note:', err);
      throw err;
    }
  },

  // ── Delete Note ───────────────────────────────────────────────
  deleteNote: async (id: string) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded.');
    }

    try {
      await storage.deleteNote(id, DEMO_USER_ID);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        editingNote: state.editingNote?.id === id ? null : state.editingNote,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      set({ error: message });
      console.error('Failed to delete note:', err);
      throw err;
    }
  },

  // ── Editor Actions ────────────────────────────────────────────
  openNoteEditor: (note: Note) => {
    set({ editingNote: note, newNoteAnchor: null });
  },

  openNewNoteEditor: (anchor) => {
    set({ newNoteAnchor: anchor, editingNote: null });
  },

  closeNoteEditor: () => {
    set({ editingNote: null, newNoteAnchor: null });
  },

  // ── Query Helpers ─────────────────────────────────────────────
  getNotesForChunk: (chunkId: string): Note[] => {
    return get().notes.filter((n) => n.chunkId === chunkId);
  },

  getNotesByType: (type: NoteType): Note[] => {
    return get().notes.filter((n) => n.noteType === type);
  },

  getAnchoredNotes: (): Note[] => {
    return get().notes.filter((n) => n.anchorStart !== undefined);
  },

  getFreeformNotes: (): Note[] => {
    return get().notes.filter((n) => n.noteType === 'freeform');
  },

  // ── Clear ─────────────────────────────────────────────────────
  clearNotes: () => {
    set({ notes: [], currentCaseId: null, error: null, editingNote: null, newNoteAnchor: null });
  },
}));
