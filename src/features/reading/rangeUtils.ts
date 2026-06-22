// ============================================================================
// MBA Case Study Platform — Range Serialization Utilities
// ============================================================================
// Robust text anchoring that survives re-renders and page reloads.
//
// Strategy (in priority order):
// 1. Text quote matching — find the exact selected text in the container
// 2. Prefix/suffix context matching — disambiguate duplicate quotes
// 3. Character offset fallback — last resort for edge cases
//
// Inspired by the Hypothesis / Web Annotation specification.
// ============================================================================

import type { SerializedRange, SerializedSelection } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum characters to capture for prefix/suffix context. */
const CONTEXT_LENGTH = 128;

// ---------------------------------------------------------------------------
// Serialize: DOM Range → SerializedRange
// ---------------------------------------------------------------------------

/**
 * Convert a DOM Range into a serializable format.
 *
 * @param range - The DOM Range to serialize.
 * @returns Serialized start and end ranges.
 */
export function serializeRange(range: Range): SerializedSelection {
  const start = serializePoint(range.startContainer, range.startOffset, range);
  const end = serializePoint(range.endContainer, range.endOffset, range);
  return { start, end };
}

/**
 * Serialize a single point (node + offset) within a range.
 */
function serializePoint(
  node: Node,
  offset: number,
  range: Range
): SerializedRange {
  const container = range.commonAncestorContainer;
  const textContent = getTextContent(container);

  // Get the text content of the range itself
  const selectedText = range.toString();

  // Find the position of this point within the container's text
  const charOffset = getCharacterOffset(node, offset, container);

  // Extract prefix and suffix context
  const prefixStart = Math.max(0, charOffset - CONTEXT_LENGTH);
  const prefix = textContent.slice(prefixStart, charOffset);
  const suffixEnd = Math.min(textContent.length, charOffset + selectedText.length + CONTEXT_LENGTH);
  const suffix = textContent.slice(charOffset + (node === range.startContainer ? 0 : selectedText.length), suffixEnd);

  return {
    textQuote: selectedText,
    prefix: prefix.slice(-CONTEXT_LENGTH), // Keep only the last CONTEXT_LENGTH chars
    suffix: suffix.slice(0, CONTEXT_LENGTH),
    offset: charOffset,
  };
}

// ---------------------------------------------------------------------------
// Deserialize: SerializedRange → DOM Range
// ---------------------------------------------------------------------------

/**
 * Find the DOM Range from a serialized selection.
 * Uses multiple fallback strategies for robustness.
 *
 * @param serialized - The serialized selection.
 * @param container - The HTML element containing the text.
 * @returns The reconstructed DOM Range, or null if anchoring failed.
 */
export function deserializeRange(
  serialized: SerializedSelection,
  container: HTMLElement
): Range | null {
  // Strategy 1: Text quote matching with prefix/suffix context
  const range1 = deserializeByQuote(serialized, container);
  if (range1) return range1;

  // Strategy 2: Character offset fallback
  const range2 = deserializeByOffset(serialized, container);
  if (range2) return range2;

  return null;
}

/**
 * Strategy 1: Find text by matching the quote with prefix/suffix context.
 */
function deserializeByQuote(
  serialized: SerializedSelection,
  container: HTMLElement
): Range | null {
  const { start, end } = serialized;
  const fullText = getTextContent(container);

  // Try to find the start quote with prefix context
  const startMatch = findTextPosition(fullText, start.textQuote, start.prefix, start.suffix);
  if (!startMatch) return null;

  // For the end, if it's the same as start (single-point selection), use the same position
  let endOffset: number;
  if (start.textQuote === end.textQuote && start.prefix === end.prefix) {
    endOffset = startMatch.end;
  } else {
    const endMatch = findTextPosition(fullText, end.textQuote, end.prefix, end.suffix);
    if (!endMatch) return null;
    endOffset = endMatch.end;
  }

  // Convert character offsets to DOM positions
  const startPos = offsetToPosition(container, startMatch.start);
  const endPos = offsetToPosition(container, endOffset);

  if (!startPos || !endPos) return null;

  try {
    const range = new Range();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);
    return range;
  } catch {
    return null;
  }
}

/**
 * Strategy 2: Fallback to character offset within the container.
 */
function deserializeByOffset(
  serialized: SerializedSelection,
  container: HTMLElement
): Range | null {
  const { start, end } = serialized;

  const startPos = offsetToPosition(container, start.offset);
  if (!startPos) return null;

  // Calculate end offset based on quote length
  const endOffset = start.offset + start.textQuote.length + end.offset;
  const endPos = offsetToPosition(container, endOffset);
  if (!endPos) return null;

  try {
    const range = new Range();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);
    return range;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Find a text position in a string using quote + prefix/suffix context.
 * Returns { start, end } character offsets, or null if not found.
 */
function findTextPosition(
  text: string,
  quote: string,
  prefix: string,
  suffix: string
): { start: number; end: number } | null {
  if (!quote) return null;

  // Escape special regex characters in the quote
  const escapedQuote = escapeRegex(quote);

  // Build a regex pattern with optional prefix/suffix context
  let pattern: string;
  if (prefix && suffix) {
    // Both prefix and suffix available — most precise
    const escapedPrefix = escapeRegex(prefix.slice(-64)); // Use last 64 chars of prefix
    const escapedSuffix = escapeRegex(suffix.slice(0, 64));
    pattern = `${escapedPrefix}${escapedQuote}${escapedSuffix}`;
  } else if (prefix) {
    const escapedPrefix = escapeRegex(prefix.slice(-64));
    pattern = `${escapedPrefix}${escapedQuote}`;
  } else if (suffix) {
    const escapedSuffix = escapeRegex(suffix.slice(0, 64));
    pattern = `${escapedQuote}${escapedSuffix}`;
  } else {
    // No context — just match the quote directly
    pattern = escapedQuote;
  }

  try {
    const regex = new RegExp(pattern, 's'); // 's' flag for dotall
    const match = text.match(regex);

    if (match) {
      // Find where the actual quote starts within the match
      const quoteIndex = match[0].indexOf(quote);
      const start = match.index! + quoteIndex;
      const end = start + quote.length;
      return { start, end };
    }
  } catch {
    // Regex construction failed, fall through to simple search
  }

  // Fallback: simple string search for the quote
  const simpleIndex = text.indexOf(quote);
  if (simpleIndex >= 0) {
    return { start: simpleIndex, end: simpleIndex + quote.length };
  }

  return null;
}

/**
 * Convert a character offset to a DOM node + offset position.
 */
function offsetToPosition(
  container: Node,
  charOffset: number
): { node: Node; offset: number } | null {
  if (charOffset < 0) return null;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let currentOffset = 0;
  let textNode: Text | null = walker.nextNode() as Text | null;

  while (textNode) {
    const nodeLength = textNode.textContent!.length;

    if (currentOffset + nodeLength >= charOffset) {
      return {
        node: textNode,
        offset: charOffset - currentOffset,
      };
    }

    currentOffset += nodeLength;
    textNode = walker.nextNode() as Text | null;
  }

  // If we've gone past all text nodes, return the last position
  if (textNode === null && container.childNodes.length > 0) {
    // Return position at the end of the container
    return { node: container, offset: container.childNodes.length };
  }

  return null;
}

/**
 * Get the total character offset of a node+offset within a container.
 */
function getCharacterOffset(
  node: Node,
  offset: number,
  container: Node
): number {
  let charOffset = 0;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let textNode: Text | null = walker.nextNode() as Text | null;

  while (textNode) {
    if (textNode === node) {
      return charOffset + Math.min(offset, textNode.textContent!.length);
    }
    charOffset += textNode.textContent!.length;
    textNode = walker.nextNode() as Text | null;
  }

  return charOffset;
}

/**
 * Get text content of a node, normalizing whitespace.
 */
function getTextContent(node: Node): string {
  return node.textContent || '';
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Utility: Get current selection within a container
// ---------------------------------------------------------------------------

/**
 * Get the current text selection within a specific container element.
 * Returns null if no selection exists or it's outside the container.
 */
export function getSelectionInContainer(container: HTMLElement): {
  range: Range;
  text: string;
  chunkElement: HTMLElement | null;
} | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);

  // Check if the selection is within our container
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return null;
  }

  const text = range.toString().trim();
  if (!text) return null;

  // Find which chunk element contains this selection
  const chunkElement = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? (range.commonAncestorContainer as HTMLElement).closest('[data-chunk-id]')
    : range.commonAncestorContainer.parentElement?.closest('[data-chunk-id]');

  return {
    range,
    text,
    chunkElement: chunkElement ?? null,
  };
}

// ---------------------------------------------------------------------------
// Utility: Highlight a range in the DOM
// ---------------------------------------------------------------------------

/**
 * Apply a visual highlight to a DOM Range by wrapping the selected text
 * in a span with the specified color class.
 */
export function applyHighlightToRange(
  range: Range,
  colorClass: string
): HTMLElement | null {
  try {
    // Extract the contents of the range
    const fragment = range.extractContents();

    // Create the highlight wrapper
    const highlightSpan = document.createElement('span');
    highlightSpan.className = `${colorClass} rounded-sm cursor-pointer transition-opacity hover:opacity-80`;
    highlightSpan.setAttribute('data-highlight', 'true');

    // Wrap the extracted content
    highlightSpan.appendChild(fragment);

    // Insert the highlight at the range's start position
    range.insertNode(highlightSpan);

    return highlightSpan;
  } catch {
    return null;
  }
}

/**
 * Remove all highlights from a container element.
 */
export function removeHighlights(container: HTMLElement): void {
  const highlights = container.querySelectorAll('[data-highlight="true"]');
  highlights.forEach((highlight) => {
    const parent = highlight.parentElement;
    if (parent) {
      // Replace the highlight span with its text content
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
      // Normalize to merge adjacent text nodes
      parent.normalize();
    }
  });
}

// ---------------------------------------------------------------------------
// Utility: Get text before/after a position for context
// ---------------------------------------------------------------------------

/**
 * Get the text content before a given DOM position within a container.
 * Useful for building prefix context.
 */
export function getTextBeforePosition(
  container: HTMLElement,
  node: Node,
  offset: number,
  maxLength: number = CONTEXT_LENGTH
): string {
  let result = '';
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let textNode: Text | null = walker.nextNode() as Text | null;

  while (textNode) {
    if (textNode === node) {
      result += textNode.textContent!.slice(0, offset);
      break;
    }
    result += textNode.textContent;
    textNode = walker.nextNode() as Text | null;
  }

  return result.slice(-maxLength);
}

/**
 * Get the text content after a given DOM position within a container.
 * Useful for building suffix context.
 */
export function getTextAfterPosition(
  container: HTMLElement,
  node: Node,
  offset: number,
  maxLength: number = CONTEXT_LENGTH
): string {
  let result = '';
  let found = false;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let textNode: Text | null = walker.nextNode() as Text | null;

  while (textNode) {
    if (found) {
      result += textNode.textContent;
    } else if (textNode === node) {
      result += textNode.textContent!.slice(offset);
      found = true;
    }
    textNode = walker.nextNode() as Text | null;
  }

  return result.slice(0, maxLength);
}
