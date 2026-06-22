// ============================================================================
// MBA Case Study Platform — Highlight Store
// ============================================================================
// Zustand store for managing highlights with server sync.
// Handles loading, creating, updating, and deleting highlights.
// ============================================================================

import { create } from 'zustand';
import type {
  Highlight,
  HighlightColor,
  ApiHighlight,
  highlightToApiPayload,
} from './types';
import { DEFAULT_HIGHLIGHT_COLOR, apiHighlightToDomain } from './types';

// ---------------------------------------------------------------------------
// API Client (abstracted for testability)
// ---------------------------------------------------------------------------

/**
 * API client interface for highlight operations.
 * Replace the implementation with your actual API calls.
 */
interface HighlightApiClient {
  getHighlights(caseId: string): Promise<ApiHighlight[]>;
  createHighlight(caseId: string, payload: {
    chunk_id: string;
    text_content: string;
    color: string;
    anchor_start: string;
    anchor_end: string;
  }): Promise<ApiHighlight>;
  updateHighlight(caseId: string, id: string, updates: Partial<ApiHighlight>): Promise<ApiHighlight>;
  deleteHighlight(caseId: string, id: string): Promise<void>;
}

/**
 * Default API client using fetch.
 * Replace BASE_URL with your actual API endpoint.
 */
const BASE_URL = '/api';

const defaultApiClient: HighlightApiClient = {
  async getHighlights(caseId: string): Promise<ApiHighlight[]> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/highlights`);
    if (!res.ok) throw new Error(`Failed to fetch highlights: ${res.status}`);
    const data = await res.json();
    return data.highlights || [];
  },

  async createHighlight(caseId: string, payload: {
    chunk_id: string;
    text_content: string;
    color: string;
    anchor_start: string;
    anchor_end: string;
  }): Promise<ApiHighlight> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/highlights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create highlight: ${res.status}`);
    const data = await res.json();
    return data.highlight;
  },

  async updateHighlight(caseId: string, id: string, updates: Partial<ApiHighlight>): Promise<ApiHighlight> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/highlights/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update highlight: ${res.status}`);
    const data = await res.json();
    return data.highlight;
  },

  async deleteHighlight(caseId: string, id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/highlights/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete highlight: ${res.status}`);
  },
};

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

  // ── Internal ──────────────────────────────────────────────────
  _setApiClient: (client: HighlightApiClient) => void;
}

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

  // ── API Client (mutable for testing) ──────────────────────────
  _setApiClient: (client: HighlightApiClient) => {
    // Store client on the state object for use in actions
    Object.assign(get(), { _apiClient: client });
  },

  // ── Load Highlights ───────────────────────────────────────────
  loadHighlights: async (caseId: string) => {
    set({ isLoading: true, error: null, currentCaseId: caseId });
    try {
      const api = (get() as HighlightState & { _apiClient?: HighlightApiClient })._apiClient ?? defaultApiClient;
      const apiHighlights = await api.getHighlights(caseId);
      const highlights = apiHighlights.map(apiHighlightToDomain);
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

    const api = (get() as HighlightState & { _apiClient?: HighlightApiClient })._apiClient ?? defaultApiClient;
    const payload = highlightToApiPayload(highlight);

    try {
      const apiHighlight = await api.createHighlight(currentCaseId, payload);
      const domainHighlight = apiHighlightToDomain(apiHighlight);
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

    const api = (get() as HighlightState & { _apiClient?: HighlightApiClient })._apiClient ?? defaultApiClient;

    // Convert domain updates to API format
    const apiUpdates: Partial<ApiHighlight> = {};
    if (updates.color) apiUpdates.color = updates.color;
    if (updates.textContent) apiUpdates.text_content = updates.textContent;
    if (updates.anchorStart) apiUpdates.anchor_start = JSON.stringify(updates.anchorStart);
    if (updates.anchorEnd) apiUpdates.anchor_end = JSON.stringify(updates.anchorEnd);

    try {
      const apiHighlight = await api.updateHighlight(currentCaseId, id, apiUpdates);
      const domainHighlight = apiHighlightToDomain(apiHighlight);
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

    const api = (get() as HighlightState & { _apiClient?: HighlightApiClient })._apiClient ?? defaultApiClient;

    try {
      await api.deleteHighlight(currentCaseId, id);
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
