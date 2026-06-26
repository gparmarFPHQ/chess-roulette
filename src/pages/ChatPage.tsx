// ============================================================================
// MBA Case Study Platform — Chat Page
// ============================================================================
// Persona chat interface with character selection.
// In mock mode, sessions and messages are persisted to localStorage.
// ============================================================================

import React, { useEffect, useCallback, useMemo } from 'react';
import { CharacterSelect } from '../features/chat/CharacterSelect';
import { ChatPanel } from '../features/chat/ChatPanel';
import { ChatHistorySidebar } from '../features/chat/ChatHistorySidebar';
import { useChatStore } from '../features/chat/chatStore';
import { useAIConfigStore } from '../features/chat/aiConfigStore';
import type { ChatSession } from '../features/chat/types';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';

const CASE_ID = 'coffee-wars-india';

export function ChatPage() {
  const store = useChatStore();
  const aiConfig = useAIConfigStore((s) => s.config);
  const isMockMode = aiConfig.useMockMode || aiConfig.provider === 'mock';
  const personas = coffeeWarsCase.personaProfiles;

  useEffect(() => {
    store.setPersonas(personas);
  }, [personas]);

  // Load sessions from localStorage on mount (works in both mock and real mode)
  useEffect(() => {
    store.loadSessions(CASE_ID);
  }, []);

  // ── Mock Mode Session Management ─────────────────────────────────

  // In mock mode, create sessions client-side and persist to localStorage
  const handleSelectPersona = useCallback(
    (personaId: string) => {
      if (isMockMode) {
        // Check if a session already exists for this persona
        const existingSession = store.sessions.find(
          (s) => s.personaId === personaId
        );
        if (existingSession) {
          store.setActiveSession(existingSession.id);
          return;
        }

        // Create a new session via the store (persists to localStorage)
        store.createSession(CASE_ID, personaId);
      } else {
        store.createSession(CASE_ID, personaId);
      }
    },
    [isMockMode, store]
  );

  const activeSession = store.sessions.find((s) => s.id === store.activeSessionId);
  const activePersona = store.getActivePersona();
  const messages = store.activeSessionId ? (store.messages[store.activeSessionId] || []) : [];

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 pb-16 md:pb-0">
      {/* Left: Character Select */}
      <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto">
        <CharacterSelect
          personas={personas}
          activePersonaId={activePersona?.id || null}
          sessions={store.sessions}
          onSelectPersona={handleSelectPersona}
        />
      </div>

      {/* Center: Chat Panel */}
      <div className="flex-1 flex flex-col">
        <ChatPanel
          session={activeSession || null}
          messages={messages}
          persona={activePersona}
          suggestedQuestions={store.suggestedQuestions[activePersona?.id || ''] || []}
          onSendMessage={(content) => store.sendMessage(store.activeSessionId!, content)}
          onSuggestionClick={(q) => store.sendMessage(store.activeSessionId!, q)}
          onSwitchPersona={() => {}}
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
    </div>
  );
}
