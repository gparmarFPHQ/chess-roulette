// ============================================================================
// MBA Case Study Platform — Reading + Annotation Module Types
// ============================================================================
// Core data structures for highlights, notes, and text anchoring.
// Uses text-quote matching for robust anchoring that survives re-renders.
// ============================================================================

// ---------------------------------------------------------------------------
// Highlight Colors
// ---------------------------------------------------------------------------

/** Supported highlight color options. */
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

/** Tailwind-compatible background color map for highlights. */
export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; border: string; dot: string }> = {
  yellow: { bg: 'bg-yellow-200/70', border: 'border-yellow-400', dot: 'bg-yellow-400' },
  green:  { bg: 'bg-green-200/70',   border: 'border-green-400',  dot: 'bg-green-400' },
  blue:   { bg: 'bg-blue-200/70',    border: 'border-blue-400',    dot: 'bg-blue-400' },
  pink:   { bg: 'bg-pink-200/70',    border: 'border-pink-400',    dot: 'bg-pink-400' },
  orange: { bg: 'bg-orange-200/70',  border: 'border-orange-400',  dot: 'bg-orange-400' },
};

/** Default highlight color when none is specified. */
export const DEFAULT_HIGHLIGHT_COLOR: HighlightColor = 'yellow';

// ---------------------------------------------------------------------------
// Serialized Range — text-quote based anchoring
// ---------------------------------------------------------------------------

/**
 * A serialized DOM Range that can survive page reloads.
 *
 * Instead of storing DOM indices (which break on re-renders), we store:
 * - `textQuote`: the exact selected text (primary anchor)
 * - `prefix`: text before the selection (for disambiguation)
 * - `suffix`: text after the selection (for disambiguation)
 * - `offset`: character offset from the start of the textQuote
 *
 * This approach matches the Hypothesis / Web Annotation spec.
 */
export interface SerializedRange {
  /** The selected text (used as the primary matching anchor). */
  textQuote: string;
  /** Text immediately before the selection (for context / disambiguation). */
  prefix: string;
  /** Text immediately after the selection (for context / disambiguation). */
  suffix: string;
  /** Character offset from the start of `textQuote` to the actual cursor position. */
  offset: number;
}

/** A pair of serialized ranges representing a full text selection. */
export interface SerializedSelection {
  start: SerializedRange;
  end: SerializedRange;
}

// ---------------------------------------------------------------------------
// Highlight
// ---------------------------------------------------------------------------

/**
 * A text highlight anchored to a specific range within a case chunk.
 *
 * Highlights are stored server-side and synced via the API.
 * The anchor uses text-quote matching so they survive re-renders and reloads.
 */
export interface Highlight {
  id: string;
  userId: string;
  caseId: string;
  chunkId: string;
  textContent: string;
  color: HighlightColor;
  anchorStart: SerializedRange;
  anchorEnd: SerializedRange;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Note
// ---------------------------------------------------------------------------

/** Types of notes supported by the reading module. */
export type NoteType = 'inline' | 'margin' | 'freeform';

/**
 * A note attached to a case study.
 *
 * - `inline` notes are anchored to a specific text selection.
 * - `margin` notes are anchored to text but displayed in the margin/sidebar.
 * - `freeform` notes are not anchored to any text (general case notes).
 */
export interface Note {
  id: string;
  userId: string;
  caseId: string;
  chunkId?: string;
  anchorStart?: SerializedRange;
  anchorEnd?: SerializedRange;
  content: string;
  noteType: NoteType;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Reading View State
// ---------------------------------------------------------------------------

/** A section extracted from case chunks for table of contents. */
export interface TocSection {
  id: string;
  title: string;
  level: number; // 1 = h1, 2 = h2, etc.
  chunkId: string;
}

/** Reading progress state. */
export interface ReadingProgress {
  currentChunkIndex: number;
  totalChunks: number;
  scrollPercentage: number; // 0-100
}

// ---------------------------------------------------------------------------
// API Response Shapes (matching backend routes)
// ---------------------------------------------------------------------------

/** Backend highlight shape (snake_case from DB). */
export interface ApiHighlight {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string;
  text_content: string;
  color: string;
  anchor_start: string; // JSON-encoded SerializedRange
  anchor_end: string;   // JSON-encoded SerializedRange
  created_at: number;
  updated_at: number;
}

/** Backend note shape (snake_case from DB). */
export interface ApiNote {
  id: string;
  user_id: string;
  case_id: string;
  chunk_id: string | null;
  anchor_start: string | null; // JSON-encoded SerializedRange or null
  anchor_end: string | null;   // JSON-encoded SerializedRange or null
  content: string;
  note_type: NoteType;
  created_at: number;
  updated_at: number;
}

// ---------------------------------------------------------------------------
// Conversion helpers (API ↔ domain types)
// ---------------------------------------------------------------------------

/** Convert a backend API highlight to our domain type. */
export function apiHighlightToDomain(api: ApiHighlight): Highlight {
  return {
    id: api.id,
    userId: api.user_id,
    caseId: api.case_id,
    chunkId: api.chunk_id,
    textContent: api.text_content,
    color: (api.color as HighlightColor) || DEFAULT_HIGHLIGHT_COLOR,
    anchorStart: parseSerializedRange(api.anchor_start),
    anchorEnd: parseSerializedRange(api.anchor_end),
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** Convert a backend API note to our domain type. */
export function apiNoteToDomain(api: ApiNote): Note {
  return {
    id: api.id,
    userId: api.user_id,
    caseId: api.case_id,
    chunkId: api.chunk_id ?? undefined,
    anchorStart: api.anchor_start ? parseSerializedRange(api.anchor_start) : undefined,
    anchorEnd: api.anchor_end ? parseSerializedRange(api.anchor_end) : undefined,
    content: api.content,
    noteType: api.note_type,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** Convert a domain highlight to an API payload for creation. */
export function highlightToApiPayload(
  highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>
): {
  chunk_id: string;
  text_content: string;
  color: string;
  anchor_start: string;
  anchor_end: string;
} {
  return {
    chunk_id: highlight.chunkId,
    text_content: highlight.textContent,
    color: highlight.color,
    anchor_start: JSON.stringify(highlight.anchorStart),
    anchor_end: JSON.stringify(highlight.anchorEnd),
  };
}

/** Convert a domain note to an API payload for creation. */
export function noteToApiPayload(
  note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): {
  chunk_id?: string | null;
  anchor_start?: string | null;
  anchor_end?: string | null;
  content: string;
  note_type: NoteType;
} {
  return {
    chunk_id: note.chunkId ?? null,
    anchor_start: note.anchorStart ? JSON.stringify(note.anchorStart) : null,
    anchor_end: note.anchorEnd ? JSON.stringify(note.anchorEnd) : null,
    content: note.content,
    note_type: note.noteType,
  };
}

/** Parse a JSON-encoded SerializedRange string. */
function parseSerializedRange(raw: string): SerializedRange {
  try {
    return JSON.parse(raw);
  } catch {
    // Fallback: return a minimal range if parsing fails
    return { textQuote: '', prefix: '', suffix: '', offset: 0 };
  }
}
