// ============================================================================
// MBA Case Study Platform — Reading Page
// ============================================================================
// Main reading interface with case content, highlights, notes, and exhibits navigation.
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ReadingView } from '../features/reading/ReadingView';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';
import { BarChart3, Bookmark, MessageSquare } from 'lucide-react';

export function ReadingPage() {
  const chunks = coffeeWarsCase.chunks;
  const exhibitCount = coffeeWarsCase.exhibits.length;

  return (
    <div className="h-screen flex flex-col pb-16 md:pb-0">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-serif font-semibold text-slate-900">
            Coffee Wars in India
          </h1>
          <p className="text-xs text-slate-500">Café Coffee Day vs. Starbucks</p>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            to="/chat"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <Link
            to="/notes"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </Link>
          <Link
            to="/exhibits"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-burgundy-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Exhibits</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {exhibitCount}
            </span>
          </Link>
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
            Export Notes
          </button>
          <Link
            to="/workspace"
            className="text-sm bg-burgundy-700 text-white px-4 py-1.5 rounded-md hover:bg-burgundy-800 transition-colors"
          >
            Go to Workspace
          </Link>
        </nav>
      </header>

      {/* Main Reading View */}
      <ReadingView 
        caseId="coffee-wars-india"
        chunks={chunks}
      />
    </div>
  );
}
