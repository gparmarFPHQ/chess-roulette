// ============================================================================
// MBA Case Study Platform — Note Editor
// ============================================================================
// Modal editor for creating and editing notes.
// Supports inline, margin, and freeform note types.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Note, NoteType } from './types';

interface NoteEditorProps {
  note?: Note;
  anchorText?: string;
  initialContent?: string;
  initialNoteType?: NoteType;
  onSave: (content: string, noteType: NoteType) => Promise<void>;
  onCancel: () => void;
}

export function NoteEditor({
  note,
  anchorText,
  initialContent = '',
  initialNoteType = 'inline',
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [noteType, setNoteType] = useState<NoteType>(initialNoteType);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (overlayRef.current === e.target) {
      onCancel();
    }
  }, [onCancel]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, content, noteType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Note content cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(trimmed, noteType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [content, noteType, onSave]);

  const noteTypes: { value: NoteType; label: string; description: string }[] = [
    { value: 'inline', label: 'Inline', description: 'Attached to text selection' },
    { value: 'margin', label: 'Margin', description: 'Visible in sidebar' },
    { value: 'freeform', label: 'Freeform', description: 'General case note' },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={note ? 'Edit note' : 'New note'}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
            {anchorText && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                &ldquo;{anchorText}&rdquo;
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Note type selector */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Note Type
            </label>
            <div className="flex gap-2">
              {noteTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setNoteType(type.value)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all
                    ${noteType === type.value
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  aria-pressed={noteType === type.value}
                >
                  <span className="block font-semibold">{type.label}</span>
                  <span className="block text-gray-400 mt-0.5">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content textarea */}
          <div>
            <label htmlFor="note-content" className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Content
            </label>
            <textarea
              ref={textareaRef}
              id="note-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Write your note here..."
              rows={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-y transition-shadow"
              aria-describedby={error ? 'note-error' : undefined}
            />
            {error && (
              <p id="note-error" className="mt-1.5 text-xs text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {content.length} characters &middot; <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-500">⌘S</kbd> to save
          </span>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-lg transition-all
                ${isSaving || !content.trim()
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-sm hover:shadow'
                }
              `}
            >
              {isSaving ? 'Saving...' : note ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
