// ============================================================================
// MBA Case Study Platform — Chat Feature Types
// ============================================================================
// Type definitions for the persona chat interface, including messages,
// sessions, persona cards, and UI state.
// ============================================================================

import type { AdversarialFlag, RiskLevel, PersonaProfile } from '../../personaEngine/types';

// ---------------------------------------------------------------------------
// Chat Message — the atomic unit of conversation
// ---------------------------------------------------------------------------

/**
 * A single message in a chat conversation.
 * Extends the backend ChatMessage with additional UI metadata.
 */
export interface ChatMessage {
  /** Unique message identifier. */
  id: string;
  /** The session this message belongs to. */
  sessionId: string;
  /** Whether this is a user or assistant message. */
  role: 'user' | 'assistant';
  /** The message text content. */
  content: string;
  /** Unix timestamp when the message was created. */
  createdAt: number;
  /** The persona ID for assistant messages. */
  personaId?: string;
  /** Optional metadata about how the response was generated. */
  metadata?: {
    /** Number of context chunks used for grounding. */
    contextUsed?: number;
    /** Any adversarial flags detected in the user's query. */
    adversarialFlags?: AdversarialFlag[];
    /** How well-grounded the response is (0-1). */
    groundingConfidence?: number;
  };
}

// ---------------------------------------------------------------------------
// Chat Session — a conversation with a specific persona
// ---------------------------------------------------------------------------

/**
 * A chat session representing a conversation between a user and a persona.
 */
export interface ChatSession {
  /** Unique session identifier. */
  id: string;
  /** The user who owns this session. */
  userId: string;
  /** The case study this session is for. */
  caseId: string;
  /** The persona being chatted with. */
  personaId: string;
  /** Unix timestamp when the session was created. */
  createdAt: number;
  /** Unix timestamp of the last message (optional). */
  lastMessageAt?: number;
}

// ---------------------------------------------------------------------------
// Persona Card — UI representation of a selectable persona
// ---------------------------------------------------------------------------

/**
 * A persona as displayed in the character selection panel.
 */
export interface PersonaCard {
  /** The underlying persona profile. */
  persona: PersonaProfile;
  /** Whether this persona is currently selected/active. */
  isActive: boolean;
  /** Whether the user has an active session with this persona. */
  hasActiveSession: boolean;
  /** Number of unread messages (optional). */
  unreadCount?: number;
}

// ---------------------------------------------------------------------------
// Grounding Info — metadata about response grounding
// ---------------------------------------------------------------------------

/**
 * Information about how grounded a response is in the case content.
 */
export interface GroundingInfo {
  /** Number of case chunks used for this response. */
  chunksUsed: number;
  /** Confidence score (0-1) of how well the response is grounded. */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Adversarial Warning — UI state for security warnings
// ---------------------------------------------------------------------------

/**
 * Adversarial warning state displayed to the user.
 */
export interface AdversarialWarning {
  /** The specific flags that were triggered. */
  flags: AdversarialFlag[];
  /** The overall risk level. */
  riskLevel: RiskLevel;
  /** Whether the warning banner is currently visible. */
  visible: boolean;
}

// ---------------------------------------------------------------------------
// API Response Types — matching the backend
// ---------------------------------------------------------------------------

/** Response from GET /api/cases/:caseId/chat/sessions */
export interface GetSessionsResponse {
  sessions: BackendChatSession[];
}

/** Response from POST /api/cases/:caseId/chat/sessions */
export interface CreateSessionResponse {
  session: BackendChatSession;
}

/** Response from GET /api/cases/:caseId/chat/sessions/:sessionId/messages */
export interface GetMessagesResponse {
  messages: BackendChatMessage[];
}

/** Response from POST /api/cases/:caseId/chat/sessions/:sessionId/messages */
export interface SendMessageResponse {
  message: BackendChatMessage;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/** Backend session shape (snake_case from DB) */
export interface BackendChatSession {
  id: string;
  user_id: string;
  case_id: string;
  persona_id: string;
  created_at: number;
}

/** Backend message shape (snake_case from DB) */
export interface BackendChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

// ---------------------------------------------------------------------------
// Re-exports from persona engine
// ---------------------------------------------------------------------------

export type {
  PersonaProfile,
  PersonaPersonality,
  AdversarialFlag,
  RiskLevel,
  SuggestedQuestion,
} from '../../personaEngine/types';
