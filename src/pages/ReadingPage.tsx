// ============================================================================
// MBA Case Study Platform — Reading Page
// ============================================================================
// Main reading interface with case content, highlights, and notes.
// Initializes highlight and note stores from localStorage on mount.
// ============================================================================

import React, { useEffect } from 'react';
import { ReadingView } from '../features/reading/ReadingView';
import { useHighlightStore } from '../features/reading/highlightStore';
import { useNoteStore } from '../features/reading/noteStore';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';

const CASE_ID = 'coffee-wars-india';

export function ReadingPage() {
  const chunks = coffeeWarsCase.chunks;
  const highlightStore = useHighlightStore();
  const noteStore = useNoteStore();

  // Load highlights and notes from localStorage on mount
  useEffect(() => {
    highlightStore.loadHighlights(CASE_ID);
    noteStore.loadNotes(CASE_ID);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-serif font-semibold text-slate-900">
            Coffee Wars in India
          </h1>
          <p className="text-xs text-slate-500">Café Coffee Day vs. Starbucks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100">
            Export Notes
          </button>
          <button className="text-sm bg-burgundy-700 text-white px-4 py-1.5 rounded-md hover:bg-burgundy-800">
            Go to Workspace
          </button>
        </div>
      </header>

      {/* Main Reading View */}
      <ReadingView 
        caseId={CASE_ID}
        chunks={chunks}
      />
    </div>
  );
}
