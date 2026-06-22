// ============================================================================
// MBA Case Study Platform — Workspace Page
// ============================================================================
// Proposal drafting workspace with rich text editor.
// ============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '../features/workspace/Editor';
import { useDraftStore } from '../features/workspace/draftStore';
import { ReferencePanel } from '../features/workspace/ReferencePanel';
import { TemplateSelector } from '../features/workspace/TemplateSelector';
import { ExportMenu } from '../features/workspace/ExportMenu';
import { AutosaveIndicator } from '../features/workspace/AutosaveIndicator';
import { ArrowLeft } from 'lucide-react';

export function WorkspacePage() {
  const navigate = useNavigate();
  const store = useDraftStore();

  useEffect(() => {
    store.loadDraft('coffee-wars-india');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-lg font-serif font-semibold text-slate-900">
                Proposal Workspace
              </h1>
              <p className="text-xs text-slate-500">Draft your recommendations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TemplateSelector
              currentTemplate={store.draft?.template}
              onSelectTemplate={store.setTemplate}
            />
            <ExportMenu draft={store.draft} onExport={store.exportDraft} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar and Status */}
          <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between">
            <AutosaveIndicator
              isSaving={store.isSaving}
              lastSavedAt={store.lastSavedAt}
              hasUnsavedChanges={store.hasUnsavedChanges}
            />
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 min-h-[600px]">
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
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <ReferencePanel
            highlights={[]} // Would connect to highlight store
            notes={[]} // Would connect to note store
            searchQuery=""
            onSearchChange={() => {}}
            onInsertReference={(text, citation) => {
              // Would insert into editor
              console.log('Insert reference:', text, citation);
            }}
          />
        </div>
      </div>
    </div>
  );
}
