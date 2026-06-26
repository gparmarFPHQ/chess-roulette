// ============================================================================
// MBA Case Study Platform — Reading Page
// ============================================================================
// Main reading interface with case content, highlights, notes, and exhibits navigation.
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReadingView } from '../features/reading/ReadingView';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';
import { BarChart3, Bookmark, MessageSquare, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

export function ReadingPage() {
  const chunks = coffeeWarsCase.chunks;
  const exhibitCount = coffeeWarsCase.exhibits.length;
  const [showTOC, setShowTOC] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="h-screen flex flex-col pb-16 md:pb-0">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-serif font-semibold text-slate-900 truncate">
            Coffee Wars in India
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">Café Coffee Day vs. Starbucks</p>
        </div>
        <nav className="flex items-center gap-1">
          {/* Mobile toggle buttons */}
          <button
            onClick={() => setShowTOC(!showTOC)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label={showTOC ? 'Hide table of contents' : 'Show table of contents'}
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            className="xl:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label={showHighlights ? 'Hide highlights' : 'Show highlights'}
          >
            <PanelRightClose className="h-5 w-5" />
          </button>
          <Link
            to="/chat"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-2 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <Link
            to="/notes"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-2 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </Link>
          <Link
            to="/exhibits"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-2 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Exhibits</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {exhibitCount}
            </span>
          </Link>
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
          <button className="text-sm text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors hidden sm:block">
            Export
          </button>
          <Link
            to="/workspace"
            className="text-sm bg-burgundy-700 text-white px-3 py-1.5 rounded-md hover:bg-burgundy-800 transition-colors whitespace-nowrap"
          >
            Workspace
          </Link>
        </nav>
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

      {/* Mobile bottom navigation */}
      <Navigation mobileOnly />
    </div>
  );
}
