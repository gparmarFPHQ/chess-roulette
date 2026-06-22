// ============================================================================
// MBA Case Study Platform — Highlight Toolbar
// ============================================================================
// Floating toolbar that appears on text selection with color picker
// and action buttons.
// ============================================================================

import { useRef, useEffect, useCallback } from 'react';
import type { HighlightColor } from './types';
import { HIGHLIGHT_COLORS } from './types';

interface HighlightToolbarProps {
  position: { top: number; left: number };
  selectedColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  onAddHighlight: () => void;
  onAddNote: () => void;
  onClose: () => void;
}

const COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'orange'];

export function HighlightToolbar({
  position,
  selectedColor,
  onColorChange,
  onAddHighlight,
  onAddNote,
  onClose,
}: HighlightToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const previousSelection = useRef<Range | null>(null);

  // Save current selection before toolbar renders
  useEffect(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      previousSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use a delay to avoid closing on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddHighlight = useCallback(() => {
    onAddHighlight();
    onClose();
  }, [onAddHighlight, onClose]);

  const handleAddNote = useCallback(() => {
    onAddNote();
    onClose();
  }, [onAddNote, onClose]);

  // Position the toolbar centered above the selection
  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 50,
  };

  return (
    <div
      ref={toolbarRef}
      className="reading-highlight-toolbar"
      style={style}
      role="toolbar"
      aria-label="Highlight options"
    >
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
        {/* Color picker */}
        <div className="flex items-center gap-1">
          {COLORS.map((color) => {
            const colorStyles = HIGHLIGHT_COLORS[color];
            const isSelected = color === selectedColor;
            return (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`
                  w-5 h-5 rounded-full ${colorStyles.dot}
                  transition-transform duration-150
                  ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-110' : 'hover:scale-110'}
                `}
                aria-label={`Highlight in ${color}`}
                aria-pressed={isSelected}
                title={`Highlight in ${color}`}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-600 mx-0.5" />

        {/* Action buttons */}
        <button
          onClick={handleAddHighlight}
          className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
          title="Add highlight"
        >
          Highlight
        </button>

        <button
          onClick={handleAddNote}
          className="px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          title="Add note"
        >
          Note
        </button>
      </div>

      {/* Small arrow pointing down */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"
      />
    </div>
  );
}
