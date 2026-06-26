// ============================================================================
// MBA Case Study Platform — Chat Page
// ============================================================================
// Persona chat interface with character selection.
// In mock mode, sessions and messages are persisted to localStorage.
// ============================================================================

import React, { useEffect, useCallback, useState } from 'react';
import { CharacterSelect } from '../features/chat/CharacterSelect';
import { ChatPanel } from '../features/chat/ChatPanel';
import { ChatHistorySidebar } from '../features/chat/ChatHistorySidebar';
import { useChatStore } from '../features/chat/chatStore';
import { useAIConfigStore } from '../features/chat/aiConfigStore';
import type { ChatSession } from '../features/chat/types';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';
import { Users, X } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

const CASE_ID = 'coffee-wars-india';

export function ChatPage() {
  const store = useChatStore();
  const aiConfig = useAIConfigStore((s) => s.config);
  const isMockMode = aiConfig.useMockMode || aiConfig.provider === 'mock';
  const personas = coffeeWarsCase.personaProfiles;
  const [showCharacterDrawer, setShowCharacterDrawer] = useState(false);

  useEffect(() => {
    store.setPersonas(personas);
  }, [personas]);

  // Load sessions from localStorage on mount (works in both mock and real mode)
  useEffect(() => {
    store.loadSessions(CASE_ID);
  }, []);

  // ── Mock Mode Session Management ─────────────────────────────────

  const handleSelectPersona = useCallback(
    (personaId: string) => {
      if (isMockMode) {
        const existingSession = store.sessions.find(
          (s) => s.personaId === personaId
        );
        if (existingSession) {
          store.setActiveSession(existingSession.id);
        } else {
          store.createSession(CASE_ID, personaId);
        }
        if (window.innerWidth < 768) {
          setShowCharacterDrawer(false);
        }
      } else {
        store.createSession(CASE_ID, personaId);
        if (window.innerWidth < 768) {
          setShowCharacterDrawer(false);
        }
      }
    },
    [isMockMode, store]
  );

  const activeSession = store.sessions.find((s) => s.id === store.activeSessionId);
  const activePersona = store.getActivePersona();
  const messages = store.activeSessionId ? (store.messages[store.activeSessionId] || []) : [];

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 pb-16 md:pb-0">
      {/* Mobile: Character drawer overlay backdrop */}
      {showCharacterDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setShowCharacterDrawer(false)}
        />
      )}

      {/* Left: Character Select */}
      <div
        className={`
          w-72 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0
          ${showCharacterDrawer ? 'fixed inset-y-0 left-0 z-50 transform translate-x-0 md:static md:translate-x-0 md:z-auto' : 'hidden md:block'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden">
          <h2 className="font-semibold text-slate-900">Characters</h2>
          <button
            onClick={() => setShowCharacterDrawer(false)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close character list"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <CharacterSelect
          personas={personas}
          activePersonaId={activePersona?.id || null}
          sessions={store.sessions}
          onSelectPersona={handleSelectPersona}
        />
      </div>

      {/* Center: Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile: Top bar with character toggle */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-2.5">
          <button
            onClick={() => setShowCharacterDrawer(true)}
            className="flex items-center gap-2 p-2 -ml-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open character list"
          >
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">
              {activePersona?.name || 'Select a character'}
            </span>
          </button>
        </div>

        <ChatPanel
          session={activeSession || null}
          messages={messages}
          persona={activePersona}
          suggestedQuestions={store.suggestedQuestions[activePersona?.id || ''] || []}
          onSendMessage={(content) => store.sendMessage(store.activeSessionId!, content)}
          onSuggestionClick={(q) => store.sendMessage(store.activeSessionId!, q)}
          onSwitchPersona={() => {
            if (window.innerWidth < 768) {
              setShowCharacterDrawer(true);
            }
          }}
          isLoading={store.isLoading}
          isSending={store.isSending}
        />
      </div>

      {/* Right: Chat History (optional, can be toggled) */}
      <div className="w-64 bg-white border-l border-slate-200 overflow-y-auto hidden lg:block">
        <ChatHistorySidebar
          sessions={store.sessions}
          personas={personas}
          activeSessionId={store.activeSessionId}
          onSelectSession={(sessionId) => store.setActiveSession(sessionId)}
          onDeleteSession={(sessionId) => {
            store.deleteSession(sessionId);
          }}
          onNewSession={() => {}}
        />
      </div>

      {/* Mobile bottom navigation */}
      <Navigation mobileOnly />
    </div>
  );
}
