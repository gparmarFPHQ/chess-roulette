/**
 * Draft store — Zustand store with autosave, word counting, and export.
 * 
 * Features:
 * - Autosave with debouncing (2s after last change)
 * - Track unsaved changes
 * - Show last saved timestamp
 * - Word count calculation
 * - Reading time estimate (~200 words per minute)
 * - Offline save queue
 */

import { create } from 'zustand';
import {
  Draft,
  DraftSettings,
  DraftTemplate,
  ExportFormat,
} from './types';
import { DEFAULT_SETTINGS } from './types';
import { getTemplate } from './templates';
import {
  exportAsMarkdown,
  exportAsHtml,
  exportAsPdf,
} from './exportUtils';

// ─── API Layer ──────────────────────────────────────────────────

const API_BASE = '/api';

async function fetchDraft(caseId: string): Promise<Draft | null> {
  const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/draft`);
  if (!res.ok) return null;
  const data: { draft?: { id: string; user_id: string; case_id: string; content: string; word_count: number; created_at: number; updated_at: number } | null } = await res.json();
  if (!data.draft) return null;

  // Map backend Draft to workspace Draft
  const backend = data.draft;
  return {
    id: backend.id,
    userId: backend.user_id,
    caseId: backend.case_id,
    title: extractTitle(backend.content),
    content: backend.content,
    wordCount: backend.word_count,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

async function saveDraftApi(caseId: string, content: string, wordCount: number): Promise<Draft | null> {
  const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, word_count: wordCount }),
  });
  if (!res.ok) return null;
  const data: { draft?: { id: string; user_id: string; case_id: string; content: string; word_count: number; created_at: number; updated_at: number } | null } = await res.json();
  if (!data.draft) return null;

  const backend = data.draft;
  return {
    id: backend.id,
    userId: backend.user_id,
    caseId: backend.case_id,
    title: extractTitle(backend.content),
    content: backend.content,
    wordCount: backend.word_count,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

/**
 * Extract a title from HTML content (first h1 or h2 text).
 */
function extractTitle(html: string): string {
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1];
  const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (h2Match) return h2Match[1];
  // Fallback: first 50 chars of text
  const textMatch = html.replace(/<[^>]+>/g, '').trim();
  return textMatch.slice(0, 50) || 'Untitled Draft';
}

// ─── Word Count Utilities ───────────────────────────────────────

/**
 * Count words in HTML content by stripping tags and counting whitespace-separated tokens.
 */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

/**
 * Estimate reading time in minutes (~200 words per minute).
 */
export function estimateReadingTime(wordCount: number): number {
  if (wordCount === 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// ─── Store State ────────────────────────────────────────────────

interface DraftState {
  // ── Data ──
  draft: Draft | null;
  currentCaseId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  hasUnsavedChanges: boolean;
  settings: DraftSettings;
  offlineQueue: Array<{ content: string; title: string }>;

  // ── Autosave Timer ──
  autosaveTimer: string | null;

  // ── Actions ──
  loadDraft: (caseId: string) => Promise<void>;
  saveDraft: (content: string, title: string) => Promise<void>;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  setTemplate: (template: DraftTemplate) => void;
  resetDraft: () => void;
  exportDraft: (format: ExportFormat) => Promise<void>;
  getWordCount: () => number;
  getReadingTime: () => number;
  updateSettings: (settings: Partial<DraftSettings>) => void;
  flushOfflineQueue: () => Promise<void>;
}

// ─── Store ──────────────────────────────────────────────────────

export const useDraftStore = create<DraftState>((set, get) => ({
  // ── Initial State ──
  draft: null,
  currentCaseId: null,
  isLoading: false,
  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  settings: DEFAULT_SETTINGS,
  offlineQueue: [],
  autosaveTimer: null,

  // ── Load Draft ──
  loadDraft: async (caseId: string) => {
    set({ isLoading: true, currentCaseId: caseId });
    try {
      const draft = await fetchDraft(caseId);
      set({
        draft,
        isLoading: false,
        lastSavedAt: draft?.updatedAt ?? null,
        hasUnsavedChanges: false,
      });
    } catch {
      set({ isLoading: false, draft: null });
    }
  },

  // ── Save Draft (with autosave debounce) ──
  saveDraft: async (content: string, title: string) => {
    const { currentCaseId, draft, settings } = get();
    if (!currentCaseId || !settings.autoSave) return;

    // If content hasn't changed, skip
    const currentContent = draft?.content ?? '';
    if (currentContent === content) return;

    const wordCount = countWords(content);

    // Mark as saving
    set({ isSaving: true });

    try {
      const saved = await saveDraftApi(currentCaseId, content, wordCount);
      if (saved) {
        set({
          draft: { ...draft!, content, title, wordCount, updatedAt: saved.updatedAt },
          isSaving: false,
          lastSavedAt: Date.now(),
          hasUnsavedChanges: false,
        });
      } else {
        // Save failed — queue for retry
        set((state) => ({
          isSaving: false,
          offlineQueue: [
            ...state.offlineQueue,
            { content, title },
          ],
        }));
      }
    } catch {
      // Network error — queue for retry
      set((state) => ({
        isSaving: false,
        offlineQueue: [
          ...state.offlineQueue,
          { content, title },
        ],
      }));
    }
  },

  // ── Update Content (triggers autosave) ──
  updateContent: (content: string) => {
    const { draft, settings } = get();
    if (!draft) return;

    const wordCount = countWords(content);
    const title = extractTitle(content);

    set({
      draft: {
        ...draft,
        content,
        title,
        wordCount,
      },
      hasUnsavedChanges: true,
    });

    // Debounced autosave
    if (settings.autoSave) {
      const currentTimer = get().autosaveTimer;
      if (currentTimer) {
        clearTimeout(Number(currentTimer));
      }
      const timer = window.setTimeout(() => {
        get().saveDraft(content, title);
      }, settings.autoSaveInterval);
      set({ autosaveTimer: String(timer) });
    }
  },

  // ── Update Title ──
  updateTitle: (title: string) => {
    const { draft } = get();
    if (!draft) return;

    set({
      draft: { ...draft, title },
      hasUnsavedChanges: true,
    });
  },

  // ── Apply Template ──
  setTemplate: (template: DraftTemplate) => {
    const { draft, currentCaseId } = get();
    const templateData = getTemplate(template);
    if (!templateData) return;

    // Convert markdown structure to HTML
    const htmlStructure = markdownToHtml(templateData.structure);

    if (draft) {
      const wordCount = countWords(htmlStructure);
      set({
        draft: {
          ...draft,
          content: htmlStructure,
          title: templateData.title,
          wordCount,
          template,
        },
        hasUnsavedChanges: true,
      });
    } else if (currentCaseId) {
      // Create new draft with template
      const now = Date.now();
      const wordCount = countWords(htmlStructure);
      const newDraft: Draft = {
        id: crypto.randomUUID(),
        userId: '', // Will be set by backend
        caseId: currentCaseId,
        title: templateData.title,
        content: htmlStructure,
        wordCount,
        createdAt: now,
        updatedAt: now,
        template,
      };
      set({
        draft: newDraft,
        hasUnsavedChanges: true,
      });
    }
  },

  // ── Reset Draft ──
  resetDraft: () => {
    set({
      draft: null,
      currentCaseId: null,
      isLoading: false,
      isSaving: false,
      lastSavedAt: null,
      hasUnsavedChanges: false,
      offlineQueue: [],
    });
  },

  // ── Export ──
  exportDraft: async (format: ExportFormat) => {
    const { draft } = get();
    if (!draft) return;

    switch (format) {
      case 'markdown':
        exportAsMarkdown(draft.title, draft.content);
        break;
      case 'html':
        exportAsHtml(draft.title, draft.content, { wordCount: draft.wordCount });
        break;
      case 'pdf':
        exportAsPdf(draft.title, draft.content, { wordCount: draft.wordCount });
        break;
    }
  },

  // ── Word Count ──
  getWordCount: () => {
    const { draft } = get();
    if (!draft) return 0;
    return countWords(draft.content);
  },

  // ── Reading Time ──
  getReadingTime: () => {
    const wordCount = get().getWordCount();
    return estimateReadingTime(wordCount);
  },

  // ── Update Settings ──
  updateSettings: (partial: Partial<DraftSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  // ── Flush Offline Queue ──
  flushOfflineQueue: async () => {
    const { offlineQueue, currentCaseId, draft } = get();
    if (!currentCaseId || offlineQueue.length === 0) return;

    // Save the most recent entry from the queue
    const latest = offlineQueue[offlineQueue.length - 1];
    const wordCount = countWords(latest.content);

    try {
      const saved = await saveDraftApi(currentCaseId, latest.content, wordCount);
      if (saved) {
        set({
          draft: draft ? { ...draft, content: latest.content, title: latest.title, updatedAt: saved.updatedAt } : null,
          lastSavedAt: Date.now(),
          hasUnsavedChanges: false,
          offlineQueue: [],
        });
      }
    } catch {
      // Keep queue for next retry
    }
  },
}));

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Simple markdown-to-HTML converter for template structures.
 * Handles headings, bold, lists, and paragraphs.
 */
function markdownToHtml(markdown: string): string {
  return markdown
    // Headings
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Wrap remaining non-empty lines in paragraphs
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^<h[1-6]>/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');
}
