// ============================================================================
// MBA Case Study Platform — Note Store
// ============================================================================
// Zustand store for managing notes with server sync.
// Handles inline, margin, and freeform notes.
// ============================================================================

import { create } from 'zustand';
import type {
  Note,
  NoteType,
  ApiNote,
} from './types';
import { noteToApiPayload, apiNoteToDomain } from './types';

// ---------------------------------------------------------------------------
// API Client (abstracted for testability)
// ---------------------------------------------------------------------------

/**
 * API client interface for note operations.
 */
interface NoteApiClient {
  getNotes(caseId: string): Promise<ApiNote[]>;
  createNote(caseId: string, payload: {
    chunk_id?: string | null;
    anchor_start?: string | null;
    anchor_end?: string | null;
    content: string;
    note_type: NoteType;
  }): Promise<ApiNote>;
  updateNote(caseId: string, id: string, updates: Partial<ApiNote>): Promise<ApiNote>;
  deleteNote(caseId: string, id: string): Promise<void>;
}

/**
 * Default API client using fetch.
 */
const BASE_URL = '/api';

const defaultApiClient: NoteApiClient = {
  async getNotes(caseId: string): Promise<ApiNote[]> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/notes`);
    if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`);
    const data = await res.json();
    return data.notes || [];
  },

  async createNote(caseId: string, payload: {
    chunk_id?: string | null;
    anchor_start?: string | null;
    anchor_end?: string | null;
    content: string;
    note_type: NoteType;
  }): Promise<ApiNote> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create note: ${res.status}`);
    const data = await res.json();
    return data.note;
  },

  async updateNote(caseId: string, id: string, updates: Partial<ApiNote>): Promise<ApiNote> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/notes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update note: ${res.status}`);
    const data = await res.json();
    return data.note;
  },

  async deleteNote(caseId: string, id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/notes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete note: ${res.status}`);
  },
};

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

  // ── Internal ──────────────────────────────────────────────────
  _setApiClient: (client: NoteApiClient) => void;
}

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

  // ── API Client (mutable for testing) ──────────────────────────
  _setApiClient: (client: NoteApiClient) => {
    Object.assign(get(), { _apiClient: client });
  },

  // ── Load Notes ────────────────────────────────────────────────
  loadNotes: async (caseId: string) => {
    set({ isLoading: true, error: null, currentCaseId: caseId });
    try {
      const api = (get() as NoteState & { _apiClient?: NoteApiClient })._apiClient ?? defaultApiClient;
      const apiNotes = await api.getNotes(caseId);
      const notes = apiNotes.map(apiNoteToDomain);
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

    const api = (get() as NoteState & { _apiClient?: NoteApiClient })._apiClient ?? defaultApiClient;
    const payload = noteToApiPayload(note);

    try {
      const apiNote = await api.createNote(currentCaseId, payload);
      const domainNote = apiNoteToDomain(apiNote);
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

    const api = (get() as NoteState & { _apiClient?: NoteApiClient })._apiClient ?? defaultApiClient;

    // Convert domain updates to API format
    const apiUpdates: Partial<ApiNote> = {};
    if (updates.content) apiUpdates.content = updates.content;
    if (updates.noteType) apiUpdates.note_type = updates.noteType;
    if (updates.chunkId !== undefined) apiUpdates.chunk_id = updates.chunkId ?? null;
    if (updates.anchorStart) apiUpdates.anchor_start = JSON.stringify(updates.anchorStart);
    if (updates.anchorEnd) apiUpdates.anchor_end = JSON.stringify(updates.anchorEnd);

    try {
      const apiNote = await api.updateNote(currentCaseId, id, apiUpdates);
      const domainNote = apiNoteToDomain(apiNote);
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

    const api = (get() as NoteState & { _apiClient?: NoteApiClient })._apiClient ?? defaultApiClient;

    try {
      await api.deleteNote(currentCaseId, id);
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
