// ============================================================================
// MBA Case Study Platform — Character Select Panel
// ============================================================================
// Left panel showing all available personas as selectable cards.
// Each card shows the persona's avatar, name, role, company, and session status.
// ============================================================================

import { useMemo } from 'react';
import type { PersonaProfile } from '../../personaEngine/types';
import type { ChatSession } from './types';
import { getAvatar, getPersonaColors, getPersonalityHint, formatRelativeTime } from './utils';

interface CharacterSelectProps {
  personas: PersonaProfile[];
  activePersonaId: string | null;
  sessions: ChatSession[];
  onSelectPersona: (personaId: string) => void;
}

export function CharacterSelect({
  personas,
  activePersonaId,
  sessions,
  onSelectPersona,
}: CharacterSelectProps) {
  const personaCards = useMemo(() => {
    return personas.map((persona) => {
      const session = sessions.find((s) => s.personaId === persona.id);
      return {
        persona,
        isActive: activePersonaId === persona.id,
        hasActiveSession: !!session,
        session,
      };
    });
  }, [personas, sessions, activePersonaId]);

  return (
    <nav
      className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden"
      role="navigation"
      aria-label="Persona selection"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Case Characters
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Select a character to start chatting
        </p>
      </div>

      {/* Persona List */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        role="listbox"
        aria-label="Available personas"
      >
        {personaCards.map(({ persona, isActive, hasActiveSession, session }) => {
          const colors = getPersonaColors(persona);
          const avatar = getAvatar(persona);
          const personalityHint = getPersonalityHint(persona);

          return (
            <button
              key={persona.id}
              role="option"
              aria-selected={isActive}
              onClick={() => onSelectPersona(persona.id)}
              className={`
                w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${
                  isActive
                    ? 'border-gray-900 bg-white shadow-md'
                    : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                }
              `}
            >
              {/* Card Header: Avatar + Name + Badge */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: colors.primary }}
                  aria-hidden="true"
                >
                  {avatar.type === 'emoji' ? (
                    <span className="text-lg">{avatar.value}</span>
                  ) : (
                    avatar.value
                  )}
                </div>

                {/* Name & Role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {persona.name}
                    </h3>
                    {hasActiveSession && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors.border }}
                        aria-label="Active session"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{persona.role}</p>
                  <p className="text-xs text-gray-400 truncate">{persona.company}</p>
                </div>

                {/* Session Activity Badge */}
                {session?.lastMessageAt && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0 tabular-nums">
                    {formatRelativeTime(session.lastMessageAt)}
                  </span>
                )}
              </div>

              {/* Personality Hint on Hover */}
              {personalityHint && (
                <div className="mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs text-gray-400 italic">
                    "{personalityHint}"
                  </p>
                </div>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                  style={{ backgroundColor: colors.primary }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <p className="text-[10px] text-gray-400 text-center">
          Responses are grounded in case content
        </p>
      </div>
    </nav>
  );
}
