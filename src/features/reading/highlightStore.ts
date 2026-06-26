// ============================================================================
// MBA Case Study Platform — Highlight Store
// ============================================================================
// Zustand store for managing highlights with localStorage persistence.
// Handles loading, creating, updating, and deleting highlights.
// Data persists across page reloads via localStorage.
// ============================================================================

import { create } from 'zustand';
import type {
  Highlight,
  HighlightColor,
  SerializedRange,
} from './types';
import { DEFAULT_HIGHLIGHT_COLOR } from './types';
import { getDefaultStorageProvider, DEMO_USER_ID } from '../../lib/localStorageProvider';
import { generateId } from '../../lib/idUtils';

// ---------------------------------------------------------------------------
// Backend ↔ Domain Type Mapping
// ---------------------------------------------------------------------------

/**
 * Map backend Highlight (snake_case) to domain Highlight (camelCase).
 */
function backendToDomain(h: {
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
}): Highlight {
  return {
    id: h.id,
    userId: h.user_id,
    caseId: h.case_id,
    chunkId: h.chunk_id,
    textContent: h.text_content,
    color: (h.color as HighlightColor) || DEFAULT_HIGHLIGHT_COLOR,
    anchorStart: parseSerializedRange(h.anchor_start),
    anchorEnd: parseSerializedRange(h.anchor_end),
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

/**
 * Map domain Highlight to backend shape for storage.
 */
function domainToBackend(h: Highlight): {
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
} {
  return {
    id: h.id,
    user_id: h.userId,
    case_id: h.caseId,
    chunk_id: h.chunkId,
    text_content: h.textContent,
    color: h.color,
    anchor_start: JSON.stringify(h.anchorStart),
    anchor_end: JSON.stringify(h.anchorEnd),
    created_at: h.createdAt,
    updated_at: h.updatedAt,
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

interface HighlightState {
  // ── Data ──────────────────────────────────────────────────────
  highlights: Highlight[];
  currentCaseId: string | null;
  selectedColor: HighlightColor;
  isLoading: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────
  loadHighlights: (caseId: string) => Promise<void>;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHighlight: (id: string, updates: Partial<Highlight>) => Promise<void>;
  deleteHighlight: (id: string) => Promise<void>;
  setSelectedColor: (color: HighlightColor) => void;
  getHighlightsForChunk: (chunkId: string) => Highlight[];
  getHighlightsByColor: (color: HighlightColor) => Highlight[];
  clearHighlights: () => void;
}

// ---------------------------------------------------------------------------
// Storage Provider (singleton — shared across all store instances)
// ---------------------------------------------------------------------------

const storage = getDefaultStorageProvider();

// ---------------------------------------------------------------------------
// Store Creation
// ---------------------------------------------------------------------------

export const useHighlightStore = create<HighlightState>((set, get) => ({
  // ── Initial State ─────────────────────────────────────────────
  highlights: [],
  currentCaseId: null,
  selectedColor: DEFAULT_HIGHLIGHT_COLOR,
  isLoading: false,
  error: null,

  // ── Load Highlights ───────────────────────────────────────────
  loadHighlights: async (caseId: string) => {
    set({ isLoading: true, error: null, currentCaseId: caseId });
    try {
      const backendHighlights = await storage.getHighlights(DEMO_USER_ID, caseId);
      const highlights = backendHighlights.map(backendToDomain);
      set({ highlights, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load highlights';
      set({ error: message, isLoading: false });
      console.error('Failed to load highlights:', err);
    }
  },

  // ── Add Highlight ─────────────────────────────────────────────
  addHighlight: async (highlight) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded. Call loadHighlights first.');
    }

    const now = Date.now();
    const backendHighlight = domainToBackend({
      id: generateId(),
      userId: DEMO_USER_ID,
      caseId: currentCaseId,
      chunkId: highlight.chunkId,
      textContent: highlight.textContent,
      color: highlight.color,
      anchorStart: highlight.anchorStart,
      anchorEnd: highlight.anchorEnd,
      createdAt: now,
      updatedAt: now,
    });

    try {
      const saved = await storage.createHighlight(backendHighlight);
      const domainHighlight = backendToDomain(saved);
      set((state) => ({
        highlights: [...state.highlights, domainHighlight],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create highlight';
      set({ error: message });
      console.error('Failed to create highlight:', err);
      throw err;
    }
  },

  // ── Update Highlight ──────────────────────────────────────────
  updateHighlight: async (id: string, updates: Partial<Highlight>) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded.');
    }

    // Convert domain updates to backend format
    const backendUpdates: Partial<{
      color: string;
      text_content: string;
      anchor_start: string;
      anchor_end: string;
    }> = {};
    if (updates.color) backendUpdates.color = updates.color;
    if (updates.textContent) backendUpdates.text_content = updates.textContent;
    if (updates.anchorStart) backendUpdates.anchor_start = JSON.stringify(updates.anchorStart);
    if (updates.anchorEnd) backendUpdates.anchor_end = JSON.stringify(updates.anchorEnd);

    try {
      const updatedBackend = await storage.updateHighlight(id, DEMO_USER_ID, backendUpdates);
      const domainHighlight = backendToDomain(updatedBackend);
      set((state) => ({
        highlights: state.highlights.map((h) => (h.id === id ? domainHighlight : h)),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update highlight';
      set({ error: message });
      console.error('Failed to update highlight:', err);
      throw err;
    }
  },

  // ── Delete Highlight ──────────────────────────────────────────
  deleteHighlight: async (id: string) => {
    const { currentCaseId } = get();
    if (!currentCaseId) {
      throw new Error('No case loaded.');
    }

    try {
      await storage.deleteHighlight(id, DEMO_USER_ID);
      set((state) => ({
        highlights: state.highlights.filter((h) => h.id !== id),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete highlight';
      set({ error: message });
      console.error('Failed to delete highlight:', err);
      throw err;
    }
  },

  // ── Color Selection ───────────────────────────────────────────
  setSelectedColor: (color: HighlightColor) => {
    set({ selectedColor: color });
    // Persist the user's preference
    try {
      localStorage.setItem('reading:highlightColor', color);
    } catch {
      // localStorage may not be available
    }
  },

  // ── Query Helpers ─────────────────────────────────────────────
  getHighlightsForChunk: (chunkId: string): Highlight[] => {
    return get().highlights.filter((h) => h.chunkId === chunkId);
  },

  getHighlightsByColor: (color: HighlightColor): Highlight[] => {
    return get().highlights.filter((h) => h.color === color);
  },

  // ── Clear ─────────────────────────────────────────────────────
  clearHighlights: () => {
    set({ highlights: [], currentCaseId: null, error: null });
  },
}));

// ---------------------------------------------------------------------------
// Initialize color preference from localStorage
// ---------------------------------------------------------------------------

(function initColorPreference() {
  try {
    const saved = localStorage.getItem('reading:highlightColor');
    if (saved && ['yellow', 'green', 'blue', 'pink', 'orange'].includes(saved)) {
      useHighlightStore.setState({ selectedColor: saved as HighlightColor });
    }
  } catch {
    // localStorage not available
  }
})();
