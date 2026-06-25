// ============================================================================
// MBA Case Study Platform — Chat Page
// ============================================================================
// Persona chat interface with character selection.
// In mock mode, sessions are managed client-side without a backend.
// ============================================================================

import React, { useEffect, useCallback, useMemo } from 'react';
import { CharacterSelect } from '../features/chat/CharacterSelect';
import { ChatPanel } from '../features/chat/ChatPanel';
import { ChatHistorySidebar } from '../features/chat/ChatHistorySidebar';
import { useChatStore } from '../features/chat/chatStore';
import { useAIConfigStore } from '../features/chat/aiConfigStore';
import type { ChatSession } from '../features/chat/types';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';

export function ChatPage() {
  const store = useChatStore();
  const aiConfig = useAIConfigStore((s) => s.config);
  const isMockMode = aiConfig.useMockMode || aiConfig.provider === 'mock';
  const personas = coffeeWarsCase.personaProfiles;

  useEffect(() => {
    store.setPersonas(personas);
  }, [personas]);

  // Load sessions from backend only in real mode
  useEffect(() => {
    if (!isMockMode) {
      store.loadSessions('coffee-wars-india');
    }
  }, [isMockMode]);

  // ── Mock Mode Session Management ─────────────────────────────────

  // In mock mode, create sessions client-side
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

        // Create a client-side session
        const mockSession: ChatSession = {
          id: `mock-${personaId}-${Date.now()}`,
          userId: 'mock-user',
          caseId: 'coffee-wars-india',
          personaId,
          createdAt: Date.now(),
        };

        set((state) => ({
          sessions: [...state.sessions, mockSession],
          activeSessionId: mockSession.id,
          messages: { ...state.messages, [mockSession.id]: [] },
        }));

        // Load suggested questions
        store.loadSuggestedQuestions(personaId);
      } else {
        store.createSession('coffee-wars-india', personaId);
      }
    },
    [isMockMode, store]
  );

  // We need to use the Zustand set pattern directly for mock sessions
  // Re-implementing handleSelectPersona properly
  const handleSelectPersonaFixed = useCallback(
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

        // Create a client-side session
        const mockSession: ChatSession = {
          id: `mock-${personaId}-${Date.now()}`,
          userId: 'mock-user',
          caseId: 'coffee-wars-india',
          personaId,
          createdAt: Date.now(),
        };

        // Use Zustand's batched update
        useChatStore.setState((state) => ({
          sessions: [...state.sessions, mockSession],
          activeSessionId: mockSession.id,
          messages: { ...state.messages, [mockSession.id]: [] },
        }));

        // Load suggested questions
        store.loadSuggestedQuestions(personaId);
      } else {
        store.createSession('coffee-wars-india', personaId);
      }
    },
    [isMockMode, store]
  );

  const activeSession = store.sessions.find((s) => s.id === store.activeSessionId);
  const activePersona = store.getActivePersona();
  const messages = store.activeSessionId ? (store.messages[store.activeSessionId] || []) : [];

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left: Character Select */}
      <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto">
        <CharacterSelect
          personas={personas}
          activePersonaId={activePersona?.id || null}
          sessions={store.sessions}
          onSelectPersona={handleSelectPersonaFixed}
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
          activeSessionId={store.activeSessionId}
          onSelectSession={(sessionId) => store.setActiveSession(sessionId)}
          onDeleteSession={(sessionId) => {
            store.deleteSession(sessionId);
          }}
        />
      </div>
    </div>
  );
}
