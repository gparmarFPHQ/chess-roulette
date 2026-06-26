// ============================================================================
// MBA Case Study Platform — Reading Page
// ============================================================================
// Main reading interface with case content, highlights, and notes.
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReadingView } from '../features/reading/ReadingView';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';
import { BookOpen, ListTodo, PanelLeftClose, PanelRightClose } from 'lucide-react';

export function ReadingPage() {
  const navigate = useNavigate();
  const chunks = coffeeWarsCase.chunks;
  const [showTOC, setShowTOC] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 flex-shrink-0 p-1"
            aria-label="Back to home"
          >
            <BookOpen className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-serif font-semibold text-slate-900 truncate">
              Coffee Wars in India
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Café Coffee Day vs. Starbucks</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Mobile toggle buttons */}
          <button
            onClick={() => setShowTOC(!showTOC)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label={showTOC ? 'Hide table of contents' : 'Show table of contents'}
          >
            {showTOC ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            className="xl:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label={showHighlights ? 'Hide highlights' : 'Show highlights'}
          >
            {showHighlights ? <PanelRightClose className="h-5 w-5" /> : <ListTodo className="h-5 w-5" />}
          </button>
          <button className="text-sm text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 hidden sm:block">
            Export Notes
          </button>
          <button
            onClick={() => navigate('/workspace')}
            className="text-sm bg-burgundy-700 text-white px-3 py-1.5 rounded-md hover:bg-burgundy-800 whitespace-nowrap"
          >
            Workspace
          </button>
        </div>
      </header>

      {/* Main Reading View */}
      <ReadingView
        caseId="coffee-wars-india"
        chunks={chunks}
        showTOC={showTOC}
        showHighlights={showHighlights}
        onCloseTOC={() => setShowTOC(false)}
        onCloseHighlights={() => setShowHighlights(false)}
      />
    </div>
  );
}
