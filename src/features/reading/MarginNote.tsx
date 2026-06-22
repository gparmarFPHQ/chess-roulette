// ============================================================================
// MBA Case Study Platform — Margin Note
// ============================================================================
// Displays a margin note anchored to text in the reading area.
// Shows a subtle indicator in the margin and expands on hover/click.
// ============================================================================

import { useState, useCallback } from 'react';
import type { Note } from './types';

interface MarginNoteProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function MarginNote({ note, onEdit, onDelete }: MarginNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const noteTypeColors: Record<Note['noteType'], string> = {
    inline: 'border-l-blue-400',
    margin: 'border-l-purple-400',
    freeform: 'border-l-gray-400',
  };

  const noteTypeIcons: Record<Note['noteType'], string> = {
    inline: '📌',
    margin: '📝',
    freeform: '📋',
  };

  return (
    <div className="reading-margin-note group">
      {/* Margin indicator — always visible */}
      <div
        className={`
          relative pl-3 border-l-2 ${noteTypeColors[note.noteType]}
          cursor-pointer transition-all duration-200
          ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'}
        `}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Note: ${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        {/* Note content */}
        <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
        </div>

        {/* Action buttons — visible on hover or when expanded */}
        <div className={`
          flex items-center gap-1 mt-2
          transition-opacity duration-150
          ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-50"
            aria-label="Edit note"
            title="Edit note"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors px-1.5 py-0.5 rounded hover:bg-red-50"
            aria-label="Delete note"
            title="Delete note"
          >
            🗑️ Delete
          </button>

          {/* Timestamp */}
          <span className="text-xs text-gray-300 ml-auto">
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
