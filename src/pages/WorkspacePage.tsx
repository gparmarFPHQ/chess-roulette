// ============================================================================
// MBA Case Study Platform — Workspace Page
// ============================================================================
// Proposal drafting workspace with rich text editor.
// Loads draft from localStorage on mount.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '../features/workspace/Editor';
import { useDraftStore } from '../features/workspace/draftStore';
import { ReferencePanel } from '../features/workspace/ReferencePanel';
import { TemplateSelector } from '../features/workspace/TemplateSelector';
import { ExportMenu } from '../features/workspace/ExportMenu';
import { AutosaveIndicator } from '../features/workspace/AutosaveIndicator';
import { ArrowLeft, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

const CASE_ID = 'coffee-wars-india';

export function WorkspacePage() {
  const navigate = useNavigate();
  const store = useDraftStore();
  const [showReference, setShowReference] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    store.loadDraft(CASE_ID);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-slate-600 hover:text-slate-900 flex-shrink-0 p-1"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-serif font-semibold text-slate-900 truncate">
                Proposal Workspace
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Draft your recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Mobile reference panel toggle */}
            <button
              onClick={() => setShowReference(!showReference)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label={showReference ? 'Hide reference panel' : 'Show reference panel'}
            >
              {showReference ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            </button>
            <TemplateSelector
              currentTemplate={store.draft?.template}
              onSelectTemplate={store.setTemplate}
            />
            <ExportMenu draft={store.draft} onExport={store.exportDraft} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar and Status */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between">
            <AutosaveIndicator
              isSaving={store.isSaving}
              lastSavedAt={store.lastSavedAt}
              hasUnsavedChanges={store.hasUnsavedChanges}
            />
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 min-h-[400px] sm:min-h-[600px]">
              {store.draft ? (
                <Editor
                  content={store.draft.content}
                  onChange={(content) => store.updateContent(content)}
                  placeholder="Start writing your proposal..."
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">Loading draft...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Reference Panel */}
        {showReference && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowReference(false)}>
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        <div
          className={`
            w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto flex-shrink-0
            ${showReference ? 'fixed inset-y-0 right-0 z-50 w-80 transform translate-x-0 lg:static lg:translate-x-0 lg:z-auto' : 'hidden lg:block'}
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
            <h2 className="font-semibold text-slate-900">References</h2>
            <button
              onClick={() => setShowReference(false)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close reference panel"
            >
              <PanelRightClose className="h-5 w-5" />
            </button>
          </div>
          <ReferencePanel
            highlights={[]}
            notes={[]}
            searchQuery=""
            onSearchChange={() => {}}
            onInsertReference={(text, citation) => {
              console.log('Insert reference:', text, citation);
            }}
          />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <Navigation mobileOnly />
    </div>
  );
}
