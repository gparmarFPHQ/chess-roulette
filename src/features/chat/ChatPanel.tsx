// ============================================================================
// MBA Case Study Platform — Chat Panel
// ============================================================================
// Main chat area with message list, typing indicator, and empty state.
// Auto-scrolls to bottom on new messages.
// ============================================================================

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatMessage, ChatSession } from './types';
import type { PersonaProfile, SuggestedQuestion } from '../../personaEngine/types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { PersonaInfoBanner } from './PersonaInfoBanner';
import { SuggestedQuestions } from './SuggestedQuestions';

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

  // ── Empty State ─────────────────────────────────────────────────

  if (!session || !persona) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-8 max-w-md">
          {/* Illustration */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
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
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Select a Character
          </h2>
          <p className="text-sm text-gray-500">
            Choose a character from the case to start a conversation. Each character
            responds based on their role, knowledge, and personality in the case study.
          </p>
        </div>
      </div>
    );
  }

  // ── Chat with Messages ──────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Persona Banner */}
      <PersonaInfoBanner
        persona={persona}
        groundingInfo={groundingInfo}
        onSwitchPersona={onSwitchPersona}
      />

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
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-4">
              <span className="text-3xl">
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
          <div>
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
                  style={{
                    backgroundColor:
                      persona.avatar ? '#4F46E5' : '#4F46E5',
                  }}
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
    </div>
  );
}
