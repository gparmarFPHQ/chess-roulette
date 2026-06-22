// ============================================================================
// MBA Case Study Platform — Chat Page
// ============================================================================
// Persona chat interface with character selection.
// ============================================================================

import React, { useEffect } from 'react';
import { CharacterSelect } from '../features/chat/CharacterSelect';
import { ChatPanel } from '../features/chat/ChatPanel';
import { ChatHistorySidebar } from '../features/chat/ChatHistorySidebar';
import { useChatStore } from '../features/chat/chatStore';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';

export function ChatPage() {
  const store = useChatStore();
  const personas = coffeeWarsCase.personaProfiles;

  useEffect(() => {
    store.setPersonas(personas);
    store.loadSessions('coffee-wars-india');
  }, []);

  const activeSession = store.sessions.find(s => s.id === store.activeSessionId);
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
          onSelectPersona={(personaId) => {
            store.createSession('coffee-wars-india', personaId);
          }}
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
            // Would implement delete logic
            console.log('Delete session:', sessionId);
          }}
        />
      </div>
    </div>
  );
}
