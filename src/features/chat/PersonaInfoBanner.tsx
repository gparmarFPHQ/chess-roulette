// ============================================================================
// MBA Case Study Platform — Persona Info Banner
// ============================================================================
// Header component showing who you're talking to, with grounding info
// and a switch persona button.
// ============================================================================

import type { PersonaProfile } from '../../personaEngine/types';
import type { GroundingInfo } from './types';
import { getAvatar, getPersonaColors, getGroundingDescription } from './utils';

interface PersonaInfoBannerProps {
  persona: PersonaProfile;
  groundingInfo?: GroundingInfo;
  onSwitchPersona: () => void;
}

export function PersonaInfoBanner({
  persona,
  groundingInfo,
  onSwitchPersona,
}: PersonaInfoBannerProps) {
  const colors = getPersonaColors(persona);
  const avatar = getAvatar(persona);

  return (
    <header
      className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3"
      role="banner"
      aria-label={`Chatting with ${persona.name}`}
    >
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

      {/* Persona Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">{persona.name}</h2>
          {/* Grounded in Case Badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-700 bg-green-50 border border-green-200"
            role="status"
            aria-label="Responses grounded in case content"
          >
            <svg
              className="w-3 h-3"
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
            Grounded in case
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {persona.role} at {persona.company}
        </p>
      </div>

      {/* Grounding Info */}
      {groundingInfo && groundingInfo.chunksUsed > 0 && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-500">
              {getGroundingDescription(groundingInfo)}
            </span>
          </div>
        </div>
      )}

      {/* Switch Persona Button */}
      <button
        onClick={onSwitchPersona}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Switch to a different persona"
        title="Switch persona"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </header>
  );
}
