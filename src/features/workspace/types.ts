/**
 * Workspace module types — draft editing, templates, and settings.
 * Aligns with backend Draft/Highlight/Note types from storageProvider.
 */

// ─── Draft Template ─────────────────────────────────────────────

export type DraftTemplate =
  | 'executive-summary'
  | 'proposal'
  | 'analysis'
  | 'recommendation';

// ─── Draft ──────────────────────────────────────────────────────

export interface Draft {
  id: string;
  userId: string;
  caseId: string;
  title: string;
  content: string; // HTML from TipTap
  wordCount: number;
  createdAt: number;
  updatedAt: number;
  template?: DraftTemplate;
}

// ─── Draft Settings ─────────────────────────────────────────────

export interface DraftSettings {
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds — debounce delay
  wordLimit?: number;
  showWordCount: boolean;
  showReadingTime: boolean;
}

// ─── Export Format ──────────────────────────────────────────────

export type ExportFormat = 'markdown' | 'pdf' | 'html';

// ─── Reference Panel Types ──────────────────────────────────────

/**
 * Mirrors backend Highlight type (from storageProvider).
 */
export interface Highlight {
  id: string;
  userId: string;
  caseId: string;
  chunkId: string;
  textContent: string;
  color: string;
  anchorStart: string;
  anchorEnd: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Mirrors backend Note type (from storageProvider).
 */
export interface Note {
  id: string;
  userId: string;
  caseId: string;
  chunkId: string | null;
  anchorStart: string | null;
  anchorEnd: string | null;
  content: string;
  noteType: 'inline' | 'margin' | 'freeform';
  createdAt: number;
  updatedAt: number;
}

// ─── Template Metadata ──────────────────────────────────────────

export interface TemplateMetadata {
  title: string;
  description: string;
  structure: string; // Markdown structure to insert
}

// ─── Default Settings ───────────────────────────────────────────

export const DEFAULT_SETTINGS: DraftSettings = {
  autoSave: true,
  autoSaveInterval: 2000, // 2 second debounce
  showWordCount: true,
  showReadingTime: true,
};
