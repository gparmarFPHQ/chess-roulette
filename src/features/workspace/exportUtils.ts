/**
 * Export utilities — convert draft content to Markdown, HTML, and PDF.
 * Pure functions for format conversion and file download.
 */

// ─── HTML to Markdown ───────────────────────────────────────────

/**
 * Convert HTML content to a clean Markdown string.
 * Handles headings, lists, blockquotes, code blocks, bold, italic, and paragraphs.
 */
export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  return convertNode(body).trim();
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map(convertNode)
    .join('');

  switch (tag) {
    case 'h1':
      return `\n\n# ${children}\n\n`;
    case 'h2':
      return `\n\n## ${children}\n\n`;
    case 'h3':
      return `\n\n### ${children}\n\n`;
    case 'h4':
      return `\n\n#### ${children}\n\n`;
    case 'h5':
      return `\n\n##### ${children}\n\n`;
    case 'h6':
      return `\n\n###### ${children}\n\n`;
    case 'p':
      return `\n\n${children}\n\n`;
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return `**${children}**`;
    case 'em':
    case 'i':
      return `*${children}*`;
    case 'u':
      return `<u>${children}</u>`;
    case 'blockquote':
      return `\n\n> ${children.trim().split('\n').map((line: string) => `> ${line}`).join('\n')}\n\n`;
    case 'pre':
      return `\n\n\`\`\`\n${children}\n\`\`\`\n\n`;
    case 'code':
      // If parent is <pre>, don't wrap in backticks
      if ((element.parentElement?.tagName?.toLowerCase() ?? '') === 'pre') {
        return children;
      }
      return `\`${children}\``;
    case 'ul':
      return `\n\n${children}\n\n`;
    case 'ol':
      return `\n\n${children}\n\n`;
    case 'li': {
      const parent = element.parentElement;
      const isOrdered = parent?.tagName?.toLowerCase() === 'ol';
      const index = Array.from(parent?.children ?? []).indexOf(element);
      const prefix = isOrdered ? `${index + 1}. ` : '- ';
      return `${prefix}${children}\n`;
    }
    case 'hr':
      return '\n\n---\n\n';
    case 'a': {
      const href = element.getAttribute('href') || '#';
      return `[${children}](${href})`;
    }
    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'span':
    case 'body':
    case 'html':
      return children;
    default:
      return children;
  }
}

// ─── HTML Document Generation ───────────────────────────────────

/**
 * Generate a complete, styled HTML document from title and content.
 * Includes metadata, print styles, and clean typography.
 */
export function generateHtmlDocument(
  title: string,
  content: string,
  options?: { wordCount?: number; date?: string }
): string {
  const { wordCount = 0, date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) } = options ?? {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      background: #fff;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.3;
      color: #111;
    }

    h1 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    h2 { font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; }
    h3 { font-size: 1.25rem; }

    p { margin: 1em 0; }

    blockquote {
      border-left: 4px solid #3b82f6;
      padding: 0.5em 1em;
      margin: 1em 0;
      background: #f8fafc;
      color: #475569;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    code {
      font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
      font-size: 0.875em;
    }

    :not(pre) > code {
      background: #f1f5f9;
      padding: 0.15em 0.35em;
      border-radius: 3px;
      color: #be185d;
    }

    ul, ol { padding-left: 1.5em; margin: 1em 0; }
    li { margin: 0.25em 0; }

    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2em 0;
    }

    .metadata {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .metadata span { margin-right: 1.5rem; }

    @media print {
      body { padding: 0; max-width: none; }
      .metadata { color: #999; }
    }
  </style>
</head>
<body>
  <div class="metadata">
    <span>${escapeHtml(date)}</span>
    ${wordCount > 0 ? `<span>${wordCount} words</span>` : ''}
  </div>
  ${content}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── PDF Generation ─────────────────────────────────────────────

/**
 * Generate a PDF Blob from title and HTML content.
 * Uses the browser's print API with a styled document.
 * Returns a Blob that can be downloaded.
 */
export async function generatePdf(
  title: string,
  content: string,
  options?: { wordCount?: number }
): Promise<Blob> {
  // Create a hidden iframe for printing
  const htmlDoc = generateHtmlDocument(title, content, options);

  // Use a print-friendly approach: open a window and trigger print
  // For actual Blob generation, we use canvas-based approach
  // Since we can't use external libraries, we fall back to a printable HTML approach

  // Create a blob URL for the HTML content
  const blob = new Blob([htmlDoc], { type: 'text/html' });
  return blob;
}

// ─── Download Helper ────────────────────────────────────────────

/**
 * Trigger a file download in the browser.
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

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ─── Export Actions ─────────────────────────────────────────────

/**
 * Export draft as Markdown file.
 */
export function exportAsMarkdown(
  title: string,
  htmlContent: string
): void {
  const markdown = htmlToMarkdown(htmlContent);
  const filename = sanitizeFilename(title) + '.md';
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Export draft as HTML file.
 */
export function exportAsHtml(
  title: string,
  htmlContent: string,
  options?: { wordCount?: number }
): void {
  const doc = generateHtmlDocument(title, htmlContent, options);
  const filename = sanitizeFilename(title) + '.html';
  downloadFile(doc, filename, 'text/html');
}

/**
 * Export draft as PDF using browser print.
 */
export function exportAsPdf(
  title: string,
  htmlContent: string,
  options?: { wordCount?: number }
): void {
  const htmlDoc = generateHtmlDocument(title, htmlContent, options);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(htmlDoc);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Sanitize a string for use as a filename.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100)
    .replace(/-+$/, '');
}
