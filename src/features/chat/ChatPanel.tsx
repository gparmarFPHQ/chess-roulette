// ============================================================================
// MBA Case Study Platform — Chat Panel
// ============================================================================
// Main chat area with message list, typing indicator, and empty state.
// Auto-scrolls to bottom on new messages. Includes AI settings button.
// ============================================================================

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatMessage, ChatSession } from './types';
import type { PersonaProfile, SuggestedQuestion } from '../../personaEngine/types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { PersonaInfoBanner } from './PersonaInfoBanner';
import { SuggestedQuestions } from './SuggestedQuestions';
import { AISettings } from './AISettings';
import { useAIConfigStore } from './aiConfigStore';
import { PROVIDER_LABELS } from './aiConfigTypes';
import { getPersonaColors } from './utils';

interface ChatPanelProps {
  session: ChatSession | null;
  messages: ChatMessage[];
  persona: PersonaProfile | null;
  suggestedQuestions: SuggestedQuestion[];
  onSendMessage: (content: string) => void;
  onSuggestionClick: (question: string) => void;
  onSwitchPersona: () => void;
  isLoading: boolean;
  isSending: boolean;
}

export function ChatPanel({
  session,
  messages,
  persona,
  suggestedQuestions,
  onSendMessage,
  onSuggestionClick,
  onSwitchPersona,
  isLoading,
  isSending,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  // AI config for mode badge
  const { config, openSettings, isConfigured } = useAIConfigStore();
  const isMockMode = config.useMockMode || config.provider === 'mock';
  const isRealConfigured = isConfigured();

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Only scroll when messages are added (not on initial load)
    if (messages.length > previousMessageCount.current) {
      scrollToBottom();
    }
    previousMessageCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [session?.id]); // Re-run when session changes

  // Extract question strings for the input component
  const questionStrings = useMemo(
    () => suggestedQuestions.map((q) => q.question),
    [suggestedQuestions]
  );

  // Get grounding info from the latest assistant message
  const latestAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === 'assistant');
    return assistantMessages[assistantMessages.length - 1] ?? null;
  }, [messages]);

  const groundingInfo = latestAssistantMessage?.metadata
    ? {
        chunksUsed: latestAssistantMessage.metadata.contextUsed ?? 0,
        confidence: latestAssistantMessage.metadata.groundingConfidence ?? 0,
      }
    : undefined;

  const showSuggestedQuestions = messages.length === 0 && persona;

  const personaColors = persona ? getPersonaColors(persona) : null;

  // ── Empty State ─────────────────────────────────────────────────

  if (!session || !persona) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-8 max-w-md">
          {/* Illustration */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Select a Character
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Choose a character from the case to start a conversation. Each character
            responds based on their role, knowledge, and personality in the case study.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>AI-powered conversations grounded in case content</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading State ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading conversation…</p>
        </div>
      </div>
    );
  }

  // ── Chat with Messages ──────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Persona Banner with Settings Button */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        {/* Mode Badge */}
        <div className="flex items-center gap-2">
          {isMockMode ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200"
              role="status"
              aria-label="Mock mode enabled"
              title="Mock mode — responses generated locally without an API key"
            >
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.77 5.27a.75.75 0 00-1.22-.852l-.546.925a6.966 6.966 0 00-1.947 3.188 1 1 0 001.922.559 5.005 5.005 0 011.398-2.312l.4 1.2a1 1 0 001.908-.612l-.813-2.098zM8.25 8.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zM6.5 12.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75z" />
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Mock Mode
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-700 bg-green-50 border border-green-200"
              role="status"
              aria-label={`Live AI mode with ${PROVIDER_LABELS[config.provider]}`}
              title={`Live AI — ${PROVIDER_LABELS[config.provider]} / ${config.model}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {PROVIDER_LABELS[config.provider]}
            </span>
          )}

          {/* Warning if real mode but no API key */}
          {!isMockMode && !isRealConfigured && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-red-700 bg-red-50 border border-red-200"
              role="alert"
              aria-label="API key not configured"
            >
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              No API Key
            </span>
          )}
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={openSettings}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Open AI settings"
          title="AI Settings"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.2-4.36-1.2-4.74 0l-.17.69a1.13 1.13 0 01-.8.72l-.69.18C-4.57 5.57-4.57 9.66.14 10.45l.69.18a1.13 1.13 0 01.8.72l.17.69c.38 1.2 4.36 1.2 4.74 0l.17-.69a1.13 1.13 0 01.8-.72l.69-.18c4.74-.79 4.74-4.87 0-5.66l-.69-.18a1.13 1.13 0 01-.8-.72l-.17-.69zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="Chat messages"
      >
        {showSuggestedQuestions && questionStrings.length > 0 ? (
          /* Empty State with Suggested Questions */
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 shadow-lg"
              style={{ backgroundColor: personaColors?.primary ?? '#4F46E5' }}
            >
              <span className="text-2xl">
                {persona.avatar ?? persona.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-base font-medium text-gray-700 mb-1">
              Start a conversation with {persona.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {persona.role} at {persona.company}
            </p>
            <SuggestedQuestions
              questions={questionStrings}
              onSelect={onSuggestionClick}
              personaName={persona.name.split(' ').pop()!}
            />
          </div>
        ) : (
          /* Messages List */
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <Message
                key={msg.id}
                message={msg}
                persona={persona}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Typing Indicator */}
            {isSending && (
              <div className="flex gap-3 px-4 py-3" aria-label="Persona is typing">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: personaColors?.primary ?? '#4F46E5' }}
                >
                  {persona.avatar ?? persona.name.charAt(0)}
                </div>
                {/* Typing Dots */}
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={onSendMessage}
        suggestedQuestions={showSuggestedQuestions ? [] : questionStrings}
        onSuggestionClick={onSuggestionClick}
        disabled={isSending}
        placeholder={`Message ${persona.name.split(' ').pop()!}...`}
      />

      {/* AI Settings Modal */}
      <AISettings />
    </div>
  );
}
