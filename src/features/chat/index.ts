// ============================================================================
// MBA Case Study Platform — Chat Feature Module
// ============================================================================
// Barrel exports for the chat feature. Import everything from this file.
// ============================================================================

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  ChatMessage,
  ChatSession,
  PersonaCard,
  GroundingInfo,
  GetSessionsResponse,
  CreateSessionResponse,
  GetMessagesResponse,
  SendMessageResponse,
  BackendChatSession,
  BackendChatMessage,
} from './types';

export type {
  PersonaProfile,
  PersonaPersonality,
  AdversarialFlag,
  RiskLevel,
  SuggestedQuestion,
} from './types';

// ── Store ──────────────────────────────────────────────────────────────────
export { useChatStore } from './chatStore';

// ── Components ─────────────────────────────────────────────────────────────
export { CharacterSelect } from './CharacterSelect';
export { ChatPanel } from './ChatPanel';
export { Message } from './Message';
export { ChatInput } from './ChatInput';
export { SuggestedQuestions } from './SuggestedQuestions';
export { PersonaInfoBanner } from './PersonaInfoBanner';
export { ChatHistorySidebar } from './ChatHistorySidebar';
export { AdversarialWarning } from './AdversarialWarning';

// ── Utilities ──────────────────────────────────────────────────────────────
export {
  COMPANY_COLORS,
  getPersonaColors,
  getPersonaAvatarColor,
  getInitials,
  getAvatar,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  backendToSession,
  backendToMessage,
  getGroundingDescription,
  getGroundingColor,
  getFlagDescription,
  getRiskWarningMessage,
  isUserMessage,
  isAssistantMessage,
  truncate,
  getLastMessage,
  sortSessionsByActivity,
  getPersonalityHint,
} from './utils';
