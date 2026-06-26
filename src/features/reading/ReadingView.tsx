// ============================================================================
// MBA Case Study Platform — Reading View Component
// ============================================================================
// Main reading interface with typography-first design, text selection
// handling, highlight overlays, and section navigation.
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CaseChunk } from '../../ingestion/types';
import { useHighlightStore } from './highlightStore';
import { useNoteStore } from './noteStore';
import { HighlightToolbar } from './HighlightToolbar';
import { HighlightsSidebar } from './HighlightsSidebar';
import { TableOfContents } from './TableOfContents';
import { ProgressIndicator } from './ProgressIndicator';
import { serializeRange } from './rangeUtils';
import { Highlight, Note, HighlightColor } from './types';
import { X } from 'lucide-react';

interface ReadingViewProps {
  caseId: string;
  chunks: CaseChunk[];
  showTOC?: boolean;
  showHighlights?: boolean;
  onCloseTOC?: () => void;
  onCloseHighlights?: () => void;
}

export function ReadingView({ caseId, chunks, showTOC, showHighlights, onCloseTOC, onCloseHighlights }: ReadingViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  const highlightStore = useHighlightStore();
  const noteStore = useNoteStore();

  // Extract sections for table of contents
  const sections = React.useMemo(() => {
    const extracted: Array<{ id: string; title: string; level: number; chunkId: string }> = [];
    chunks.forEach((chunk, index) => {
      // Simple heuristic: chunks with short text (< 100 chars) are likely headings
      if (chunk.text.length < 100 && chunk.text.trim().endsWith(':')) {
        extracted.push({
          id: `chunk-${index}`,
          title: chunk.text.replace(/:$/, ''),
          level: chunk.section === 'main' ? 1 : 2,
          chunkId: chunk.id,
        });
      }
    });
    return extracted;
  }, [chunks]);

  // Load highlights and notes on mount
  useEffect(() => {
    highlightStore.loadHighlights(caseId);
    noteStore.loadNotes(caseId);
  }, [caseId]);

  // Handle text selection
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) {
      setSelectedText(null);
      setToolbarPosition(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) {
      setSelectedText(null);
      setToolbarPosition(null);
      return;
    }

    // Check if selection is within our content area
    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      setSelectedText(null);
      setToolbarPosition(null);
      return;
    }

    setSelectedText(selectedText);

    // Calculate toolbar position (above the selection)
    const rect = range.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setToolbarPosition({
      top: rect.top + scrollTop - 50, // 50px above selection
      left: rect.left + rect.width / 2, // Center on selection
    });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Handle adding a highlight
  const handleAddHighlight = async (color: HighlightColor) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const serialized = serializeRange(range);

    // Find which chunk this selection belongs to
    const chunkIndex = Math.floor((chunks.length * 0.5)); // Simplified - would need better logic
    const chunk = chunks[chunkIndex] || chunks[0];

    const highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'current-user', // Would come from auth context
      caseId,
      chunkId: chunk.id,
      textContent: selection.toString(),
      color: color as any,
      anchorStart: serialized.start,
      anchorEnd: serialized.end,
    };

    await highlightStore.addHighlight(highlight);
    setSelectedText(null);
    setToolbarPosition(null);
    selection.removeAllRanges();
  };

  // Handle adding a note
  const handleAddNote = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const serialized = serializeRange(range);

    const chunkIndex = Math.floor((chunks.length * 0.5));
    const chunk = chunks[chunkIndex] || chunks[0];

    const note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      caseId,
      chunkId: chunk.id,
      anchorStart: serialized.start,
      anchorEnd: serialized.end,
      content: '',
      noteType: 'inline',
    };

    await noteStore.addNote(note);
    setSelectedText(null);
    setToolbarPosition(null);
  };

  // Handle scrolling to a highlight
  const handleScrollToHighlight = (highlightId: string) => {
    const highlight = highlightStore.highlights.find(h => h.id === highlightId);
    if (!highlight) return;

    // Find the element containing this highlight and scroll to it
    const highlightEl = contentRef.current?.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightEl) {
      highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Calculate reading progress
  const progress = {
    currentChunkIndex: 0, // Would track based on scroll position
    totalChunks: chunks.length,
    scrollPercentage: 0,
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-cream-50">
      {/* Left Sidebar - Table of Contents */}
      {/* Desktop: always visible on lg+ | Mobile: overlay when showTOC */}
      {showTOC && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => onCloseTOC?.()}>
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      <aside
        className={`
          w-64 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0
          ${showTOC ? 'fixed inset-y-0 left-0 z-50 transform transition-transform lg:translate-x-0 lg:static lg:z-auto' : 'hidden lg:block'}
          ${showTOC ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <h2 className="font-semibold text-slate-900">Contents</h2>
          <button
            onClick={() => onCloseTOC?.()}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close table of contents"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <TableOfContents
          sections={sections}
          activeSection={activeSection}
          onSectionClick={(sectionId) => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              setActiveSection(sectionId);
            }
            // Close TOC on mobile after selection
            if (window.innerWidth < 1024) {
              onCloseTOC?.();
            }
          }}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Progress Indicator */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-8 py-3">
          <ProgressIndicator
            currentChunk={progress.currentChunkIndex + 1}
            totalChunks={progress.totalChunks}
          />
        </div>

        {/* Reading Content */}
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12 prose prose-slate prose-lg
            prose-headings:font-serif prose-headings:font-semibold
            prose-p:font-serif prose-p:text-slate-800 prose-p:leading-relaxed
            prose-a:text-burgundy-700 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-burgundy-500 prose-blockquote:bg-slate-50
            prose-blockquote:py-2 prose-blockquote:px-4"
        >
          {chunks.map((chunk, index) => (
            <div key={chunk.id} id={`chunk-${index}`} className="scroll-mt-24">
              {chunk.visibility === 'instructor' && (
                <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4 text-sm text-amber-800">
                  🔒 Instructor-only content
                </div>
              )}
              <div
                className={`relative ${chunk.visibility === 'instructor' ? 'opacity-60' : ''}`}
                data-chunk-id={chunk.id}
              >
                {chunk.text.split('\n\n').map((paragraph: string, pIndex: number) => (
                  <p key={pIndex} className="mb-4">
                    {paragraph}
                  </p>
                ))}

                {/* Render highlights for this chunk */}
                {highlightStore.getHighlightsForChunk(chunk.id).map((highlight) => (
                  <span
                    key={highlight.id}
                    data-highlight-id={highlight.id}
                    className={`absolute inset-0 pointer-events-none ${
                      highlight.color === 'yellow' ? 'bg-yellow-200/50' :
                      highlight.color === 'green' ? 'bg-green-200/50' :
                      highlight.color === 'blue' ? 'bg-blue-200/50' :
                      highlight.color === 'pink' ? 'bg-pink-200/50' :
                      'bg-orange-200/50'
                    }`}
                    style={{
                      position: 'absolute',
                      // Would need proper positioning logic based on anchor
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right Sidebar - Highlights */}
      {/* Desktop: always visible on xl+ | Mobile: overlay when showHighlights */}
      {showHighlights && (
        <div className="fixed inset-0 z-40 xl:hidden" onClick={() => onCloseHighlights?.()}>
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      <aside
        className={`
          w-80 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0
          ${showHighlights ? 'fixed inset-y-0 right-0 z-50 transform transition-transform xl:translate-x-0 xl:static xl:z-auto' : 'hidden xl:block'}
          ${showHighlights ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 xl:hidden">
          <h2 className="font-semibold text-slate-900">Highlights</h2>
          <button
            onClick={() => onCloseHighlights?.()}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close highlights"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <HighlightsSidebar
          highlights={highlightStore.highlights}
          onHighlightClick={handleScrollToHighlight}
          onHighlightDelete={(id: string) => highlightStore.deleteHighlight(id)}
        />
      </aside>

      {/* Highlight Toolbar (appears on text selection) */}
      {toolbarPosition && selectedText && (
        <HighlightToolbar
          position={toolbarPosition}
          selectedColor={highlightStore.selectedColor}
          onColorChange={highlightStore.setSelectedColor}
          onAddHighlight={handleAddHighlight}
          onAddNote={handleAddNote}
          onClose={() => {
            setSelectedText(null);
            setToolbarPosition(null);
          }}
        />
      )}
    </div>
  );
}
