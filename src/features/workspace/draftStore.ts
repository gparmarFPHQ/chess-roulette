/**
 * Draft store — Zustand store with autosave, word counting, and export.
 * 
 * Features:
 * - Autosave with debouncing (2s after last change)
 * - Track unsaved changes
 * - Show last saved timestamp
 * - Word count calculation
 * - Reading time estimate (~200 words per minute)
 * - localStorage persistence (fully offline)
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
import { getDefaultStorageProvider, DEMO_USER_ID } from '../../lib/localStorageProvider';
import { generateId } from '../../lib/idUtils';

// ─── Storage Provider (singleton) ─────────────────────────────────

const storage = getDefaultStorageProvider();

// ─── Word Count Utilities ─────────────────────────────────────────

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

// ─── Store State ──────────────────────────────────────────────────

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

// ─── Store ────────────────────────────────────────────────────────

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
      const backendDraft = await storage.getDraft(DEMO_USER_ID, caseId);
      if (!backendDraft) {
        set({ isLoading: false, draft: null });
        return;
      }

      const draft: Draft = {
        id: backendDraft.id,
        userId: backendDraft.user_id,
        caseId: backendDraft.case_id,
        title: extractTitle(backendDraft.content),
        content: backendDraft.content,
        wordCount: backendDraft.word_count,
        createdAt: backendDraft.created_at,
        updatedAt: backendDraft.updated_at,
      };

      set({
        draft,
        isLoading: false,
        lastSavedAt: draft.updatedAt,
        hasUnsavedChanges: false,
      });
    } catch {
      set({ isLoading: false, draft: null });
    }
  },

  // ── Save Draft (with autosave debounce) ──
  saveDraft: async (content: string, title: string) => {
    const { currentCaseId, draft, settings } = get();
    if (!currentCaseId) return;

    // If content hasn't changed, skip
    const currentContent = draft?.content ?? '';
    if (currentContent === content) return;

    const wordCount = countWords(content);
    const now = Date.now();

    // Mark as saving
    set({ isSaving: true });

    try {
      const draftId = draft?.id || generateId();
      const backendDraft = {
        id: draftId,
        user_id: DEMO_USER_ID,
        case_id: currentCaseId,
        content,
        word_count: wordCount,
        created_at: draft?.createdAt ?? now,
        updated_at: now,
      };

      const saved = await storage.saveDraft(backendDraft);

      const updatedDraft: Draft = {
        id: saved.id,
        userId: saved.user_id,
        caseId: saved.case_id,
        title,
        content: saved.content,
        wordCount: saved.word_count,
        createdAt: saved.created_at,
        updatedAt: saved.updated_at,
      };

      set({
        draft: updatedDraft,
        isSaving: false,
        lastSavedAt: updatedDraft.updatedAt,
        hasUnsavedChanges: false,
      });
    } catch {
      // Save failed — queue for retry
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
        id: generateId(),
        userId: DEMO_USER_ID,
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
      const draftId = draft?.id || generateId();
      const backendDraft = {
        id: draftId,
        user_id: DEMO_USER_ID,
        case_id: currentCaseId,
        content: latest.content,
        word_count: wordCount,
        created_at: draft?.createdAt ?? Date.now(),
        updated_at: Date.now(),
      };

      const saved = await storage.saveDraft(backendDraft);

      set({
        draft: draft
          ? {
              ...draft,
              content: latest.content,
              title: latest.title,
              updatedAt: saved.updated_at,
            }
          : null,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
        offlineQueue: [],
      });
    } catch {
      // Keep queue for next retry
    }
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────

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
