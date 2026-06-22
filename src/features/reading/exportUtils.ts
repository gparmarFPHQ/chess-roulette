// ============================================================================
// MBA Case Study Platform — Export Utilities
// ============================================================================
// Export highlights and notes as Markdown or PDF.
// ============================================================================

import type { Highlight, Note, HighlightColor } from './types';
import { HIGHLIGHT_COLORS } from './types';

// ---------------------------------------------------------------------------
// Markdown Export
// ---------------------------------------------------------------------------

/**
 * Export highlights and notes as a formatted Markdown document.
 *
 * The output includes:
 * - Case title as header
 * - Highlights grouped by color with emoji indicators
 * - Notes grouped by type
 * - Cross-references between highlights and notes
 */
export function exportToMarkdown(
  highlights: Highlight[],
  notes: Note[],
  caseTitle: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${caseTitle}`);
  lines.push('');
  lines.push(`*Exported on ${new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Highlights section
  if (highlights.length > 0) {
    lines.push('## Highlights');
    lines.push('');

    // Group by color
    const colorEmojis: Record<HighlightColor, string> = {
      yellow: '🟡',
      green: '🟢',
      blue: '🔵',
      pink: '🩷',
      orange: '🟠',
    };

    const colors = [...new Set(highlights.map((h) => h.color))];
    for (const color of colors) {
      const colorHighlights = highlights.filter((h) => h.color === color);
      const emoji = colorEmojis[color];

      lines.push(`### ${emoji} ${color.charAt(0).toUpperCase() + color.slice(1)}`);
      lines.push('');

      for (const h of colorHighlights) {
        lines.push(`> "${h.textContent}"`);
        lines.push(`> *${h.chunkId} — ${formatTimestamp(h.createdAt)}*`);
        lines.push('');
      }
    }
  }

  // Notes section
  if (notes.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Notes');
    lines.push('');

    // Group by type
    const noteTypeLabels: Record<Note['noteType'], string> = {
      inline: '📌 Inline Notes',
      margin: '📝 Margin Notes',
      freeform: '📋 Freeform Notes',
    };

    const types = [...new Set(notes.map((n) => n.noteType))];
    for (const type of types) {
      const typeNotes = notes.filter((n) => n.noteType === type);
      lines.push(`### ${noteTypeLabels[type]}`);
      lines.push('');

      for (const note of typeNotes) {
        // Include anchor text if available
        if (note.anchorStart?.textQuote) {
          lines.push(`**On:** "${note.anchorStart.textQuote.slice(0, 80)}${note.anchorStart.textQuote.length > 80 ? '...' : ''}"`);
          lines.push('');
        }

        if (note.chunkId) {
          lines.push(`*Chunk: ${note.chunkId}*`);
          lines.push('');
        }

        lines.push(note.content);
        lines.push('');
        lines.push(`*${formatTimestamp(note.createdAt)}*`);
        lines.push('');
        lines.push('---');
        lines.push('');
      }
    }
  }

  // Summary
  lines.push('---');
  lines.push('');
  lines.push(`**Summary:** ${highlights.length} highlight${highlights.length !== 1 ? 's' : ''}, ${notes.length} note${notes.length !== 1 ? 's' : ''}`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// PDF Export (via browser print)
// ---------------------------------------------------------------------------

/**
 * Export highlights and notes as a printable HTML document.
 * Opens a new window with formatted content for printing/PDF save.
 */
export function exportToPDF(
  highlights: Highlight[],
  notes: Note[],
  caseTitle: string
): void {
  const markdown = exportToMarkdown(highlights, notes, caseTitle);

  // Convert markdown to simple HTML for the print view
  const htmlContent = markdownToSimpleHtml(markdown);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(caseTitle)} — Highlights & Notes</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 20px; margin-top: 32px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        h3 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; }
        p { margin-bottom: 12px; }
        blockquote {
          border-left: 4px solid #e5e7eb;
          padding: 12px 16px;
          margin: 12px 0;
          background: #f9fafb;
          border-radius: 4px;
        }
        blockquote p { margin: 0; }
        em { color: #6b7280; font-size: 0.85em; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
        .highlight-yellow { border-left-color: #fbbf24; }
        .highlight-green { border-left-color: #34d399; }
        .highlight-blue { border-left-color: #60a5fa; }
        .highlight-pink { border-left-color: #f472b6; }
        .highlight-orange { border-left-color: #fb923c; }
        @media print {
          body { padding: 20px; }
          h2 { page-break-after: avoid; }
          blockquote { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          // Apply color classes to blockquotes based on section headers
          const sections = document.querySelectorAll('h3');
          sections.forEach(h3 => {
            const color = h3.textContent.match(/(yellow|green|blue|pink|orange)/i);
            if (color) {
              const bq = h3.nextElementSibling;
              if (bq && bq.tagName === 'BLOCKQUOTE') {
                bq.className = 'highlight-' + color[1].toLowerCase();
              }
            }
          });
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Auto-trigger print after a short delay
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// ---------------------------------------------------------------------------
// Download Helper
// ---------------------------------------------------------------------------

/**
 * Download a string or Blob as a file.
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string
): void {
  const blob = typeof content === 'string'
    ? new Blob([content], { type: mimeType })
    : content;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export highlights and notes as a downloadable Markdown file.
 */
export function downloadMarkdown(
  highlights: Highlight[],
  notes: Note[],
  caseTitle: string
): void {
  const markdown = exportToMarkdown(highlights, notes, caseTitle);
  const safeTitle = caseTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  downloadFile(markdown, `${safeTitle}-notes.md`, 'text/markdown');
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Format a timestamp for display. */
function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Escape HTML entities. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Convert simple markdown to HTML (basic conversion for print view). */
function markdownToSimpleHtml(md: string): string {
  let html = escapeHtml(md);

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  return html;
}
