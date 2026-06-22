/**
 * Reference panel — sidebar showing user's highlights and notes.
 * 
 * Features:
 * - Search/filter highlights and notes
 * - Grouped by color (highlights) or type (notes)
 * - Click to insert as quote/citation
 * - Preview of highlighted text
 * - Collapsible sections
 */

import { useState, useMemo, useCallback } from 'react';
import type React from 'react';
import type { Highlight, Note } from './types';

export interface ReferencePanelProps {
  highlights: Highlight[];
  notes: Note[];
  onInsertReference: (text: string, citation: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface SectionState {
  highlights: boolean;
  notes: boolean;
}

export function ReferencePanel({
  highlights,
  notes,
  onInsertReference,
  searchQuery,
  onSearchChange,
}: ReferencePanelProps) {
  const [sections, setSections] = useState<SectionState>({
    highlights: true,
    notes: true,
  });

  // Filter by search query
  const filteredHighlights = useMemo(() => {
    if (!searchQuery.trim()) return highlights;
    const q = searchQuery.toLowerCase();
    return highlights.filter((h) =>
      h.textContent.toLowerCase().includes(q)
    );
  }, [highlights, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter((n) =>
      n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  // Group highlights by color
  const highlightsByColor = useMemo(() => {
    const groups: Record<string, Highlight[]> = {};
    filteredHighlights.forEach((h) => {
      const color = h.color || 'default';
      if (!groups[color]) groups[color] = [];
      groups[color].push(h);
    });
    return groups;
  }, [filteredHighlights]);

  // Group notes by type
  const notesByType = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    filteredNotes.forEach((n) => {
      const type = n.noteType || 'freeform';
      if (!groups[type]) groups[type] = [];
      groups[type].push(n);
    });
    return groups;
  }, [filteredNotes]);

  const toggleSection = useCallback((key: keyof SectionState) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleInsertHighlight = useCallback(
    (highlight: Highlight) => {
      const citation = `["Case Study", p. ${highlight.anchorStart}]`;
      onInsertReference(highlight.textContent, citation);
    },
    [onInsertReference]
  );

  const handleInsertNote = useCallback(
    (note: Note) => {
      const citation = `[Personal Note, ${new Date(note.createdAt).toLocaleDateString()}]`;
      onInsertReference(note.content, citation);
    },
    [onInsertReference]
  );

  const getColorLabel = (color: string): string => {
    const labels: Record<string, string> = {
      yellow: '🟡 Yellow',
      green: '🟢 Green',
      blue: '🔵 Blue',
      pink: '🩷 Pink',
      default: '⚪ Default',
    };
    return labels[color] || color;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      inline: '📝 Inline',
      margin: '📌 Margin',
      freeform: '💭 Freeform',
    };
    return labels[type] || type;
  };

  return (
    <div className="workspace-reference-panel">
      {/* Search */}
      <div className="workspace-reference-search">
        <input
          type="text"
          placeholder="Search references..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="workspace-reference-input"
          aria-label="Search references"
        />
      </div>

      {/* Highlights Section */}
      <div className="workspace-reference-section">
        <button
          className="workspace-reference-section-header"
          onClick={() => toggleSection('highlights')}
          aria-expanded={sections.highlights}
        >
          <span className="workspace-reference-section-icon">
            {sections.highlights ? '▾' : '▸'}
          </span>
          <span className="workspace-reference-section-title">
            Highlights ({filteredHighlights.length})
          </span>
        </button>

        {sections.highlights && (
          <div className="workspace-reference-section-content">
            {Object.keys(highlightsByColor).length === 0 ? (
              <div className="workspace-reference-empty">
                No highlights found
              </div>
            ) : (
              Object.entries(highlightsByColor).map(([color, items]) => (
                <div key={color} className="workspace-reference-group">
                  <div className="workspace-reference-group-label">
                    {getColorLabel(color)}
                  </div>
                  {items.map((highlight) => (
                    <button
                      key={highlight.id}
                      className="workspace-reference-item"
                      onClick={() => handleInsertHighlight(highlight)}
                      title="Click to insert as citation"
                    >
                      <div
                        className="workspace-reference-highlight-bar"
                        style={{ backgroundColor: `${color}33` }}
                      />
                      <div className="workspace-reference-item-content">
                        <div className="workspace-reference-item-text">
                          {highlight.textContent.length > 120
                            ? highlight.textContent.slice(0, 120) + '...'
                            : highlight.textContent}
                        </div>
                        <div className="workspace-reference-item-meta">
                          Click to cite
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="workspace-reference-section">
        <button
          className="workspace-reference-section-header"
          onClick={() => toggleSection('notes')}
          aria-expanded={sections.notes}
        >
          <span className="workspace-reference-section-icon">
            {sections.notes ? '▾' : '▸'}
          </span>
          <span className="workspace-reference-section-title">
            Notes ({filteredNotes.length})
          </span>
        </button>

        {sections.notes && (
          <div className="workspace-reference-section-content">
            {Object.keys(notesByType).length === 0 ? (
              <div className="workspace-reference-empty">
                No notes found
              </div>
            ) : (
              Object.entries(notesByType).map(([type, items]) => (
                <div key={type} className="workspace-reference-group">
                  <div className="workspace-reference-group-label">
                    {getTypeLabel(type)}
                  </div>
                  {items.map((note) => (
                    <button
                      key={note.id}
                      className="workspace-reference-item"
                      onClick={() => handleInsertNote(note)}
                      title="Click to insert as citation"
                    >
                      <div className="workspace-reference-note-bar" />
                      <div className="workspace-reference-item-content">
                        <div className="workspace-reference-item-text">
                          {note.content.length > 120
                            ? note.content.slice(0, 120) + '...'
                            : note.content}
                        </div>
                        <div className="workspace-reference-item-meta">
                          {new Date(note.createdAt).toLocaleDateString()} · Click to cite
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{referencePanelStyles}</style>
    </div>
  );
}

const referencePanelStyles = `
.workspace-reference-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
}

.workspace-reference-search {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 1;
}

.workspace-reference-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.workspace-reference-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.workspace-reference-section {
  border-bottom: 1px solid #e5e7eb;
}

.workspace-reference-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  transition: background 0.15s ease;
}

.workspace-reference-section-header:hover {
  background: #f3f4f6;
}

.workspace-reference-section-icon {
  font-size: 10px;
  color: #9ca3af;
  width: 14px;
  text-align: center;
}

.workspace-reference-section-content {
  padding: 4px 8px 12px;
}

.workspace-reference-group {
  margin-bottom: 8px;
}

.workspace-reference-group-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  padding: 4px 4px 4px 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workspace-reference-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  margin-bottom: 4px;
}

.workspace-reference-item:hover {
  background: #f0f7ff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.workspace-reference-highlight-bar {
  width: 3px;
  min-height: 100%;
  border-radius: 2px;
  align-self: stretch;
}

.workspace-reference-note-bar {
  width: 3px;
  min-height: 100%;
  border-radius: 2px;
  background: #3b82f6;
  align-self: stretch;
}

.workspace-reference-item-content {
  flex: 1;
  min-width: 0;
}

.workspace-reference-item-text {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.workspace-reference-item-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.workspace-reference-empty {
  padding: 16px 8px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}
`;
