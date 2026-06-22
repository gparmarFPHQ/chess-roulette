// ============================================================================
// MBA Case Study Platform — Reading Module Exports
// ============================================================================

export { ReadingView } from './ReadingView';
export { HighlightToolbar } from './HighlightToolbar';
export { HighlightsSidebar } from './HighlightsSidebar';
export { NoteEditor } from './NoteEditor';
export { MarginNote } from './MarginNote';
export { TableOfContents } from './TableOfContents';
export { ProgressIndicator } from './ProgressIndicator';

export { useHighlightStore } from './highlightStore';
export { useNoteStore } from './noteStore';

export { serializeRange, deserializeRange } from './rangeUtils';

export { exportToMarkdown, exportToPDF, downloadFile } from './exportUtils';

export type {
  HighlightColor,
  Highlight,
  Note,
  NoteType,
  SerializedRange,
  SerializedSelection,
  TocSection,
  ReadingProgress,
  ApiHighlight,
  ApiNote,
} from './types';

export {
  HIGHLIGHT_COLORS,
  DEFAULT_HIGHLIGHT_COLOR,
  apiHighlightToDomain,
  apiNoteToDomain,
  highlightToApiPayload,
  noteToApiPayload,
} from './types';
