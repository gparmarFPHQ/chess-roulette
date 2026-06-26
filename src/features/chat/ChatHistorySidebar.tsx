// ============================================================================
// MBA Case Study Platform — Chat History Sidebar
// ============================================================================
// Shows past conversations with different personas. Allows switching
// between sessions and deleting old ones.
// ============================================================================

import { useMemo } from 'react';
import type { ChatSession } from './types';
import type { PersonaProfile } from '../../personaEngine/types';
import { getAvatar, getPersonaColors, formatRelativeTime } from './utils';
import { sortSessionsByActivity } from './utils';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  personas: PersonaProfile[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewSession: (personaId: string) => void;
}

export function ChatHistorySidebar({
  sessions,
  personas,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
}: ChatHistorySidebarProps) {
  const sortedSessions = useMemo(
    () => sortSessionsByActivity(sessions),
    [sessions]
  );

  // Group sessions by persona
  const sessionsByPersona = useMemo(() => {
    const grouped = new Map<string, ChatSession[]>();
    for (const session of sortedSessions) {
      const existing = grouped.get(session.personaId) ?? [];
      existing.push(session);
      grouped.set(session.personaId, existing);
    }
    return grouped;
  }, [sortedSessions]);

  if (sessions.length === 0) {
    return (
      <aside
        className="w-64 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col"
        aria-label="Chat history"
      >
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Chat History
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-400 text-center">
            No conversations yet.
            <br />
            Select a character to start.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-64 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col"
      aria-label="Chat history"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Conversations
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Chat sessions">
        {Array.from(sessionsByPersona.entries()).map(([personaId, personaSessions]) => {
          const persona = personas?.find((p) => p.id === personaId);
          if (!persona) return null;

          const colors = getPersonaColors(persona);
          const avatar = getAvatar(persona);

          return (
            <div key={personaId} className="border-b border-gray-100 last:border-0">
              {/* Persona Group Header */}
              <div className="px-4 py-3 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {avatar.type === 'emoji' ? (
                    <span className="text-xs">{avatar.value}</span>
                  ) : (
                    avatar.value
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {persona.name}
                </span>
                <button
                  type="button"
                  onClick={() => onNewSession(personaId)}
                  className="ml-auto p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label={`New conversation with ${persona.name}`}
                  title="New conversation"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </button>
              </div>

              {/* Sessions for this persona */}
              {personaSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const lastMessageAt = session.lastMessageAt ?? session.createdAt;

                return (
                  <div
                    key={session.id}
                    role="listitem"
                    tabIndex={0}
                    aria-selected={isActive}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSession(session.id);
                      }
                    }}
                    className={`
                      w-full text-left px-4 py-2.5 flex items-center gap-2
                      transition-colors cursor-pointer group
                      ${
                        isActive
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      }
                    `}
                    style={isActive ? { borderLeft: `3px solid ${colors.primary}`, paddingLeft: '13px' } : {}}
                  >
                    {/* Session Preview */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">
                        Session {session.id.slice(0, 8)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatRelativeTime(lastMessageAt)}
                      </p>
                    </div>

                    {/* Delete Button — sibling, not nested */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Delete conversation ${session.id.slice(0, 8)}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.75 1.25a.75.75 0 00-.376.105l-4.25 2.5a.75.75 0 00-.374.652v11.679c0 .412.335.75.75.75h7.5a.75.75 0 00.75-.75V4.507a.75.75 0 00-.374-.652l-4.25-2.5a.75.75 0 00-.376-.105zM8.375 3.3l3.025 1.776H5.35L8.375 3.3zm-3 2.95h7.5v10.5h-7.5v-10.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
