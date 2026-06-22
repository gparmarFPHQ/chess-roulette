/**
 * Workspace module — public exports.
 * 
 * This is the entry point for the proposal drafting workspace.
 * Import from 'src/features/workspace' to access all components and utilities.
 */

// ─── Types ──────────────────────────────────────────────────────
export type {
  Draft,
  DraftTemplate,
  DraftSettings,
  ExportFormat,
  Highlight,
  Note,
  TemplateMetadata,
} from './types';
export { DEFAULT_SETTINGS } from './types';

// ─── Store ──────────────────────────────────────────────────────
export { useDraftStore, countWords, estimateReadingTime } from './draftStore';

// ─── Templates ──────────────────────────────────────────────────
export { templates, getAvailableTemplates, getTemplate } from './templates';

// ─── Export Utilities ───────────────────────────────────────────
export {
  htmlToMarkdown,
  generateHtmlDocument,
  generatePdf,
  downloadFile,
  exportAsMarkdown,
  exportAsHtml,
  exportAsPdf,
} from './exportUtils';

// ─── Components ─────────────────────────────────────────────────
export { Editor } from './Editor';
export type { EditorProps, EditorInstance } from './Editor';

export { EditorToolbar } from './EditorToolbar';
export type { EditorToolbarProps } from './EditorToolbar';

export { ReferencePanel } from './ReferencePanel';
export type { ReferencePanelProps } from './ReferencePanel';

export { WordCountDisplay } from './WordCountDisplay';
export type { WordCountDisplayProps } from './WordCountDisplay';

export { TemplateSelector } from './TemplateSelector';
export type { TemplateSelectorProps } from './TemplateSelector';

export { ExportMenu } from './ExportMenu';
export type { ExportMenuProps } from './ExportMenu';

export { AutosaveIndicator } from './AutosaveIndicator';
export type { AutosaveIndicatorProps } from './AutosaveIndicator';

export { DraftHeader } from './DraftHeader';
export type { DraftHeaderProps } from './DraftHeader';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
