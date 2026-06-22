/**
 * Editor toolbar component with formatting buttons.
 * 
 * Features:
 * - Formatting buttons (bold, italic, etc.)
 * - Active state for applied formats
 * - Keyboard shortcuts hint
 * - Minimal, non-distracting design
 */

import { useCallback } from 'react';
import type { Editor as TipTapEditor } from '@tiptap/react';

export interface EditorToolbarProps {
  editor: TipTapEditor | null;
}

interface ToolbarButton {
  label: string;
  command: (editor: TipTapEditor) => void;
  isActive: (editor: TipTapEditor) => boolean;
  shortcut?: string;
  icon: string;
}

const BUTTONS: ToolbarButton[] = [
  {
    label: 'Bold',
    icon: 'B',
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
    shortcut: '⌘B',
  },
  {
    label: 'Italic',
    icon: 'I',
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
    shortcut: '⌘I',
  },
  {
    label: 'Underline',
    icon: 'U̳',
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
    shortcut: '⌘U',
  },
  {
    label: 'Strikethrough',
    icon: 'S̶',
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
  },
  {
    label: 'Heading 1',
    icon: 'H1',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    label: 'Heading 2',
    icon: 'H2',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    label: 'Heading 3',
    icon: 'H3',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    label: 'Bullet List',
    icon: '•',
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    label: 'Numbered List',
    icon: '1.',
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    label: 'Blockquote',
    icon: '❝',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    label: 'Code Block',
    icon: '</>',
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive('codeBlock'),
  },
  {
    label: 'Horizontal Rule',
    icon: '—',
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    isActive: () => false,
  },
  {
    label: 'Undo',
    icon: '↩',
    command: (editor) => editor.chain().focus().undo().run(),
    isActive: () => false,
    shortcut: '⌘Z',
  },
  {
    label: 'Redo',
    icon: '↪',
    command: (editor) => editor.chain().focus().redo().run(),
    isActive: () => false,
    shortcut: '⌘⇧Z',
  },
];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const handleButtonClick = useCallback(
    (btn: ToolbarButton) => {
      if (editor) {
        btn.command(editor);
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="workspace-toolbar" role="toolbar" aria-label="Formatting toolbar">
      <div className="workspace-toolbar-group">
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className={`workspace-toolbar-btn ${
              btn.isActive(editor) ? 'active' : ''
            }`}
            onClick={() => handleButtonClick(btn)}
            title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
            aria-label={btn.label}
            aria-pressed={btn.isActive(editor)}
          >
            <span className="workspace-toolbar-icon">{btn.icon}</span>
          </button>
        ))}
      </div>
      <div className="workspace-toolbar-divider" />
      <div className="workspace-toolbar-hint">
        <span>⌘S to save</span>
      </div>
      <style>{toolbarStyles}</style>
    </div>
  );
}

const toolbarStyles = `
.workspace-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  min-height: 40px;
  flex-shrink: 0;
}

.workspace-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.workspace-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}

.workspace-toolbar-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.workspace-toolbar-btn.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.workspace-toolbar-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.workspace-toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.workspace-toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 6px;
}

.workspace-toolbar-hint {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

/* Responsive: hide hint on small screens */
@media (max-width: 640px) {
  .workspace-toolbar-hint {
    display: none;
  }
  
  .workspace-toolbar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .workspace-toolbar::-webkit-scrollbar {
    display: none;
  }
}
`;
