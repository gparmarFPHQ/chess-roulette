// ============================================================================
// MBA Case Study Platform — Notes Page
// ============================================================================
// Overview of all highlights and notes with search and filter.
// ============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHighlightStore } from '../features/reading/highlightStore';
import { useNoteStore } from '../features/reading/noteStore';
import { HighlightColor, HIGHLIGHT_COLORS } from '../features/reading/types';
import { Search, Filter, ArrowLeft } from 'lucide-react';

export function NotesPage() {
  const navigate = useNavigate();
  const highlightStore = useHighlightStore();
  const noteStore = useNoteStore();

  useEffect(() => {
    highlightStore.loadHighlights('coffee-wars-india');
    noteStore.loadNotes('coffee-wars-india');
  }, []);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState<HighlightColor | 'all'>('all');

  const filteredHighlights = highlightStore.highlights.filter(h => {
    const matchesSearch = h.textContent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColor === 'all' || h.color === selectedColor;
    return matchesSearch && matchesColor;
  });

  const filteredNotes = noteStore.notes.filter(n => {
    const matchesSearch = n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 p-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm hidden sm:inline">Back to Home</span>
            <span className="text-sm sm:hidden">Home</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-serif font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
            My Notes
          </h1>
          <div className="w-10 sm:w-32" /> {/* Spacer for alignment */}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search highlights and notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-700 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value as HighlightColor | 'all')}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none flex-1 sm:flex-none"
            >
              <option value="all">All Colors</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
              <option value="orange">Orange</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {/* Highlights Section */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-yellow-400 mr-2" />
              Highlights ({filteredHighlights.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {filteredHighlights.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No highlights yet. Start reading and highlight text!</p>
              ) : (
                filteredHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className={`p-3 sm:p-4 rounded-md border-l-4 ${HIGHLIGHT_COLORS[highlight.color].bg} ${HIGHLIGHT_COLORS[highlight.color].border}`}
                  >
                    <p className="text-sm text-slate-800 mb-2 line-clamp-3">
                      "{highlight.textContent}"
                    </p>
                    <p className="text-xs text-slate-500">
                      Chunk: {highlight.chunkId}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-400 mr-2" />
              Notes ({filteredNotes.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {filteredNotes.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No notes yet. Add notes while reading!</p>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 sm:p-4 rounded-md border border-slate-200 bg-white"
                  >
                    <p className="text-sm text-slate-800 mb-2">
                      {note.content || <span className="text-slate-400 italic">Empty note</span>}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Type: {note.noteType}</span>
                      <span>Chunk: {note.chunkId || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
