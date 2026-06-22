// ============================================================================
// MBA Case Study Platform — Message Component
// ============================================================================
// Individual message display with distinct styling for user vs assistant.
// Includes persona avatar, timestamp, grounding indicator, and copy button.
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types';
import type { PersonaProfile } from '../../personaEngine/types';
import {
  formatTime,
  getAvatar,
  getPersonaColors,
  getGroundingDescription,
  isUserMessage,
} from './utils';

interface MessageProps {
  message: ChatMessage;
  persona: PersonaProfile | null;
  isLatest: boolean;
}

export function Message({ message, persona, isLatest }: MessageProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = isUserMessage(message);
  const colors = persona ? getPersonaColors(persona) : null;
  const avatar = persona ? getAvatar(persona) : null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = message.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const groundingInfo = message.metadata
    ? {
        chunksUsed: message.metadata.contextUsed ?? 0,
        confidence: message.metadata.groundingConfidence ?? 0,
      }
    : null;

  return (
    <div
      className={`group flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50/50 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
      role="listitem"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      {/* Avatar — only for assistant messages */}
      {!isUser && persona && avatar && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
          style={{ backgroundColor: colors?.primary ?? '#4F46E5' }}
          aria-hidden="true"
        >
          {avatar.type === 'emoji' ? (
            <span className="text-sm">{avatar.value}</span>
          ) : (
            avatar.value
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name Label */}
        {!isUser && persona && (
          <span className="text-[10px] text-gray-400 mb-1 ml-1">
            {persona.name}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${
              isUser
                ? 'bg-gray-900 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
            }
          `}
        >
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words">{message.content}</div>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={`
              absolute opacity-0 group-hover:opacity-100 transition-opacity
              ${isUser ? '-top-3 -left-2' : '-top-3 -right-2'}
              p-1 rounded-md bg-white border border-gray-200 shadow-sm
              text-gray-400 hover:text-gray-600
              focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-gray-300
            `}
            aria-label={copied ? 'Copied!' : 'Copy message'}
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? (
              <svg className="w-3 h-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.5 3.375A1.125 1.125 0 006.375 4.5v1.5H4.875A1.125 1.125 0 003.75 7.125v9.75a1.125 1.125 0 001.125 1.125h9.75a1.125 1.125 0 001.125-1.125V7.125a1.125 1.125 0 00-1.125-1.125h-1.5V4.5a1.125 1.125 0 00-1.125-1.125h-4.5zM6 4.875h7.5v1.5H6v-1.5z" />
                <path d="M4.25 10.5a.75.75 0 00-.75.75v6.5a.75.75 0 00.75.75h6.5a.75.75 0 00.75-.75v-6.5a.75.75 0 00-.75-.75h-6.5z" />
              </svg>
            )}
          </button>
        </div>

        {/* Grounding Indicator — assistant messages only */}
        {!isUser && groundingInfo && groundingInfo.chunksUsed > 0 && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
              <svg
                className="w-3 h-3 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {getGroundingDescription(groundingInfo)}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`
            text-[10px] text-gray-400 mt-1 transition-opacity duration-150
            ${showTimestamp ? 'opacity-100' : 'opacity-0'}
            ${isUser ? 'mr-1' : 'ml-1'}
          `}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>

      {/* Spacer for user messages to align with avatar width */}
      {isUser && <div className="w-8 flex-shrink-0" />}
    </div>
  );
}
