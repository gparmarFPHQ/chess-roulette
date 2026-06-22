/**
 * Rich text editor component using TipTap.
 * 
 * Features:
 * - Bold, italic, underline
 * - Headings (H1, H2, H3)
 * - Bullet and numbered lists
 * - Blockquotes
 * - Code blocks
 * - Horizontal rule
 * - Undo/redo
 * - Placeholder text
 * - Clean, minimal styling
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent, type Editor as TipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { EditorProps } from './Editor';

// Re-export for the type declaration file
export { type EditorProps };
export type { TipTapEditor as Editor };

export function Editor({ content, onChange, placeholder, readOnly = false }: EditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        placeholder: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your proposal...',
        includeChildren: true,
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'workspace-editor-content',
        placeholder: placeholder || 'Start writing your proposal...',
      },
    },
  });

  // Sync external content changes into the editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentSelection = editor.state.selection;
      editor.commands.setContent(content, false);
      // Restore selection if possible
      if (currentSelection) {
        editor.commands.setTextSelection(currentSelection);
      }
    }
  }, [content, editor]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save via custom event (parent handles this)
        window.dispatchEvent(new CustomEvent('draft-save'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  return (
    <div className="workspace-editor" data-editor="true">
      <EditorContent editor={editor} />
      <style>{editorStyles}</style>
    </div>
  );
}

const editorStyles = `
.workspace-editor {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.workspace-editor-content {
  outline: none;
  padding: 2rem 2.5rem;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: #1a1a1a;
}

.workspace-editor-content:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.workspace-editor-content p {
  margin: 0 0 1em;
}

.workspace-editor-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 1.5em 0 0.5em;
  color: #111827;
}

.workspace-editor-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 1.5em 0 0.5em;
  color: #1f2937;
}

.workspace-editor-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1.25em 0 0.5em;
  color: #374151;
}

.workspace-editor-content strong {
  font-weight: 600;
}

.workspace-editor-content em {
  font-style: italic;
}

.workspace-editor-content ul,
.workspace-editor-content ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.workspace-editor-content li {
  margin: 0.25em 0;
}

.workspace-editor-content blockquote {
  border-left: 3px solid #3b82f6;
  padding: 0.5em 1em;
  margin: 1em 0;
  background: #f8fafc;
  color: #475569;
  font-style: italic;
}

.workspace-editor-content pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 1em 0;
}

.workspace-editor-content code {
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
  font-size: 0.875em;
}

.workspace-editor-content :not(pre) > code {
  background: #f1f5f9;
  padding: 0.15em 0.35em;
  border-radius: 3px;
  color: #be185d;
}

.workspace-editor-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}

/* Focus ring */
.workspace-editor-content:focus {
  outline: none;
}

/* Responsive */
@media (max-width: 768px) {
  .workspace-editor-content {
    padding: 1.5rem 1rem;
  }
}
`;
