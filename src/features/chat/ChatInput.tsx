// ============================================================================
// MBA Case Study Platform — Chat Input
// ============================================================================
// Message input with auto-resize textarea, send button, and suggested
// question chips above the input.
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  suggestedQuestions: string[];
  onSuggestionClick: (question: string) => void;
  disabled: boolean;
  placeholder?: string;
  maxCharacters?: number;
}

const DEFAULT_MAX_CHARACTERS = 4000;

export function ChatInput({
  onSend,
  suggestedQuestions,
  onSuggestionClick,
  disabled,
  placeholder = 'Type your message...',
  maxCharacters = DEFAULT_MAX_CHARACTERS,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const charCount = value.length;
  const isNearLimit = charCount > maxCharacters * 0.9;
  const isOverLimit = charCount >= maxCharacters;
  const canSend = value.trim().length > 0 && !isOverLimit && !disabled;

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160); // Max height 160px
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isOverLimit || disabled) return;

    onSend(trimmed);
    setValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isOverLimit, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send, Shift+Enter for newline
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSuggestionClick = useCallback(
    (question: string) => {
      onSuggestionClick(question);
      // Also focus the textarea after clicking a suggestion
      textareaRef.current?.focus();
    },
    [onSuggestionClick]
  );

  return (
    <div ref={containerRef} className="border-t border-gray-200 bg-white">
      {/* Suggested Questions Chips */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex flex-wrap gap-2" role="list" aria-label="Suggested questions">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <button
                key={`${question}-${index}`}
                role="listitem"
                onClick={() => handleSuggestionClick(question)}
                disabled={disabled}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-full text-xs
                  border border-gray-200 bg-gray-50 text-gray-600
                  hover:bg-gray-100 hover:border-gray-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                `}
              >
                <svg
                  className="w-3 h-3 mr-1.5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                {question.length > 50 ? question.slice(0, 50) + '...' : question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div
          className={`
            flex items-end gap-2 rounded-xl border-2 transition-colors
            ${
              disabled
                ? 'border-gray-100 bg-gray-50'
                : 'border-gray-200 focus-within:border-gray-400 bg-gray-50/50'
            }
          `}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              flex-1 resize-none bg-transparent px-4 py-3 text-sm
              placeholder:text-gray-400
              focus:outline-none disabled:opacity-50
              max-h-40 overflow-y-auto
            `}
            aria-label="Message input"
            aria-describedby="chat-input-help"
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`
              m-1.5 p-2.5 rounded-lg transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${
                canSend
                  ? 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-400'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Send message"
            title="Send message (Enter)"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>

        {/* Character Count & Help */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span
            id="chat-input-help"
            className="text-[10px] text-gray-400"
          >
            Enter to send · Shift+Enter for new line
          </span>
          {charCount > 0 && (
            <span
              className={`text-[10px] tabular-nums ${
                isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-400'
              }`}
            >
              {charCount}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
