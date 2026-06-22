// ============================================================================
// MBA Case Study Platform — Highlights Sidebar
// ============================================================================
// Right sidebar showing all highlights grouped by color.
// Click to scroll to highlight, hover to preview, delete button per item.
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { Highlight, HighlightColor } from './types';
import { HIGHLIGHT_COLORS } from './types';

interface HighlightsSidebarProps {
  highlights: Highlight[];
  onHighlightClick: (highlightId: string) => void;
  onHighlightDelete: (highlightId: string) => void;
  title?: string;
}

const COLOR_ORDER: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'orange'];

export function HighlightsSidebar({
  highlights,
  onHighlightClick,
  onHighlightDelete,
  title = 'Highlights',
}: HighlightsSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(async (highlightId: string) => {
    setDeletingId(highlightId);
    await onHighlightDelete(highlightId);
    setDeletingId(null);
  }, [onHighlightDelete]);

  const groupedHighlights = useMemo(() => {
    const groups = new Map<HighlightColor, Highlight[]>();
    for (const color of COLOR_ORDER) {
      groups.set(color, []);
    }
    for (const h of highlights) {
      const group = groups.get(h.color) || [];
      group.push(h);
      groups.set(h.color, group);
    }
    return groups;
  }, [highlights]);

  const totalHighlights = highlights.length;

  if (highlights.length === 0) {
    return (
      <aside className="reading-highlights-sidebar" aria-label="Highlights sidebar">
        <div className="flex items-center justify-between mb-3 px-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            0
          </span>
        </div>
        <div className="px-3 py-8 text-center">
          <div className="text-2xl mb-2 opacity-30">📝</div>
          <p className="text-sm text-gray-400">
            Select text and highlight it to see it here
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="reading-highlights-sidebar overflow-y-auto" aria-label="Highlights sidebar">
      <div className="flex items-center justify-between mb-3 px-3 sticky top-0 bg-white py-2 z-10">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {totalHighlights}
        </span>
      </div>

      <div className="space-y-4 pb-4 px-3">
        {COLOR_ORDER.map((color) => {
          const group = groupedHighlights.get(color) || [];
          if (group.length === 0) return null;
          const colorStyles = HIGHLIGHT_COLORS[color];

          return (
            <div key={color}>
              {/* Color header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${colorStyles.dot}`} />
                <span className="text-xs font-medium text-gray-500 capitalize">
                  {color}
                </span>
                <span className="text-xs text-gray-400">({group.length})</span>
              </div>

              {/* Highlights in this color group */}
              <ul className="space-y-1.5">
                {group.map((highlight) => {
                  const isHovered = hoveredId === highlight.id;
                  const isDeleting = deletingId === highlight.id;

                  return (
                    <li key={highlight.id}>
                      <div
                        className={`
                          group rounded-md p-2.5 cursor-pointer transition-all duration-150
                          ${isHovered ? `${colorStyles.bg} shadow-sm` : 'hover:bg-gray-50'}
                          ${isDeleting ? 'opacity-50' : ''}
                        `}
                        onClick={() => onHighlightClick(highlight.id)}
                        onMouseEnter={() => setHoveredId(highlight.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onHighlightClick(highlight.id);
                          }
                        }}
                        aria-label={`Highlight: ${highlight.textContent}`}
                      >
                        {/* Highlight text preview */}
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                          {highlight.textContent}
                        </p>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(highlight.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>

                          {/* Delete button — visible on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(highlight.id);
                            }}
                            className={`
                              opacity-0 group-hover:opacity-100
                              text-gray-400 hover:text-red-500
                              transition-all duration-150
                              p-0.5 rounded hover:bg-red-50
                            `}
                            aria-label="Delete highlight"
                            title="Delete highlight"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
