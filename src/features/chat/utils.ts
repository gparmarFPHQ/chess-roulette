// ============================================================================
// MBA Case Study Platform — Chat Utilities
// ============================================================================
// Helper functions for the chat feature: formatting, color coding,
// avatar generation, and data transformation.
// ============================================================================

import type {
  ChatMessage,
  ChatSession,
  BackendChatMessage,
  BackendChatSession,
  GroundingInfo,
} from './types';
import type { PersonaProfile } from '../../personaEngine/types';

// ---------------------------------------------------------------------------
// Color Coding by Company
// ---------------------------------------------------------------------------

/**
 * Company color themes for visual distinction.
 * CCD = warm amber/brown tones
 * Starbucks = green tones
 * Consultant/External = neutral blue/gray
 */
export const COMPANY_COLORS: Record<string, { primary: string; light: string; dark: string; bg: string; border: string }> = {
  'Café Coffee Day': {
    primary: '#B45309',
    light: '#FEF3C7',
    dark: '#78350F',
    bg: '#FFFBEB',
    border: '#F59E0B',
  },
  'Starbucks': {
    primary: '#047857',
    light: '#D1FAE5',
    dark: '#064E3B',
    bg: '#ECFDF5',
    border: '#10B981',
  },
  'Tata Starbucks': {
    primary: '#047857',
    light: '#D1FAE5',
    dark: '#064E3B',
    bg: '#ECFDF5',
    border: '#10B981',
  },
  'default': {
    primary: '#4F46E5',
    light: '#EEF2FF',
    dark: '#3730A3',
    bg: '#F5F3FF',
    border: '#6366F1',
  },
};

/**
 * Get the color theme for a persona based on their company.
 */
export function getPersonaColors(persona: PersonaProfile): typeof COMPANY_COLORS['default'] {
  return COMPANY_COLORS[persona.company] ?? COMPANY_COLORS['default'];
}

/**
 * Get a hex color for a persona's avatar background.
 */
export function getPersonaAvatarColor(persona: PersonaProfile): string {
  return getPersonaColors(persona).primary;
}

// ---------------------------------------------------------------------------
// Avatar / Initials
// ---------------------------------------------------------------------------

/**
 * Extract initials from a persona's name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Get the avatar emoji for a persona, falling back to initials.
 */
export function getAvatar(persona: PersonaProfile): { type: 'emoji' | 'initials'; value: string } {
  if (persona.avatar) {
    return { type: 'emoji', value: persona.avatar };
  }
  return { type: 'initials', value: getInitials(persona.name) };
}

// ---------------------------------------------------------------------------
// Timestamp Formatting
// ---------------------------------------------------------------------------

/**
 * Format a Unix timestamp to a readable time string.
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a Unix timestamp to a full date/time string.
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Backend ↔ Frontend Data Transformation
// ---------------------------------------------------------------------------

/**
 * Transform a backend session to a frontend ChatSession.
 */
export function backendToSession(session: BackendChatSession): ChatSession {
  return {
    id: session.id,
    userId: session.user_id,
    caseId: session.case_id,
    personaId: session.persona_id,
    createdAt: session.created_at,
  };
}

/**
 * Transform a backend message to a frontend ChatMessage.
 */
export function backendToMessage(
  msg: BackendChatMessage,
  metadata?: ChatMessage['metadata']
): ChatMessage {
  return {
    id: msg.id,
    sessionId: msg.session_id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.created_at,
    personaId: msg.role === 'assistant' ? undefined : undefined,
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Grounding Info Helpers
// ---------------------------------------------------------------------------

/**
 * Get a human-readable grounding description.
 */
export function getGroundingDescription(info: GroundingInfo): string {
  if (info.chunksUsed === 0) {
    return 'No case context used';
  }
  const chunks = `${info.chunksUsed} case excerpt${info.chunksUsed > 1 ? 's' : ''}`;
  if (info.confidence >= 0.8) {
    return `Based on ${chunks} — strong grounding`;
  }
  if (info.confidence >= 0.5) {
    return `Based on ${chunks} — moderate grounding`;
  }
  return `Based on ${chunks} — limited context`;
}

/**
 * Get a grounding indicator color class.
 */
export function getGroundingColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-500';
}

// ---------------------------------------------------------------------------
// Adversarial Warning Helpers
// ---------------------------------------------------------------------------

/**
 * Get a human-readable description of an adversarial flag.
 */
export function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    instruction_override: 'Attempted to override system instructions',
    answer_extraction: 'Attempted to extract case solutions',
    roleplay_jailbreak: 'Attempted to change the persona\'s identity',
    instructor_impersonation: 'Attempted to impersonate the instructor',
    teaching_note_probe: 'Attempted to access teaching notes',
    hypothetical_extraction: 'Used hypothetical framing to extract information',
    developer_mode: 'Attempted to enter developer/debug mode',
    authority_override: 'Claimed authority to bypass restrictions',
    context_leak: 'Attempted to reveal system context',
    system_prompt_injection: 'Attempted to inject system instructions',
  };
  return descriptions[flag] ?? 'Unknown pattern detected';
}

/**
 * Get the warning message for a given risk level.
 */
export function getRiskWarningMessage(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'high':
      return 'This query triggered security safeguards. The persona responded with a limited reply.';
    case 'medium':
      return 'This query was flagged for review. The persona may have limited what it can share.';
    case 'low':
      return '';
  }
}

// ---------------------------------------------------------------------------
// Message Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a message is from the user.
 */
export function isUserMessage(msg: ChatMessage): boolean {
  return msg.role === 'user';
}

/**
 * Check if a message is from the assistant/persona.
 */
export function isAssistantMessage(msg: ChatMessage): boolean {
  return msg.role === 'assistant';
}

/**
 * Truncate text for display with ellipsis.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// ---------------------------------------------------------------------------
// Session Helpers
// ---------------------------------------------------------------------------

/**
 * Find the last message in a session's message list.
 */
export function getLastMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return messages[messages.length - 1];
}

/**
 * Sort sessions by last activity (most recent first).
 */
export function sortSessionsByActivity(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt;
    const bTime = b.lastMessageAt ?? b.createdAt;
    return bTime - aTime;
  });
}

// ---------------------------------------------------------------------------
// Persona Personality Summary
// ---------------------------------------------------------------------------

/**
 * Get a short personality hint for hover display.
 */
export function getPersonalityHint(persona: PersonaProfile): string {
  // PersonaProfile from personaEngine has personality as PersonaPersonality object
  const personality = persona.personality as { style?: string; description?: string };
  if (personality.style) {
    return personality.style;
  }
  if (personality.description) {
    const firstSentence = personality.description.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.slice(0, 50) + '...' : firstSentence;
  }
  return '';
}
