// ============================================================================
// MBA Case Study Platform — Chat Store (Zustand)
// ============================================================================
// Central state management for the chat feature. Handles sessions, messages,
// persona lookups, and API communication. Supports both mock mode (client-side
// with localStorage persistence) and real mode (backend proxy with user API key).
// ============================================================================

import { create } from 'zustand';
import type {
  ChatMessage,
  ChatSession,
  BackendChatSession,
  BackendChatMessage,
} from './types';
import type { PersonaProfile, SuggestedQuestion } from '../../personaEngine/types';
import type { PersonaProfile as IngestionPersonaProfile } from '../../ingestion/types';
import { backendToSession, backendToMessage } from './utils';
import { useAIConfigStore } from './aiConfigStore';
import { generateMockPersonaResponse } from '../../personaEngine/mockEngine';
import { api } from '../../lib/api';
import { coffeeWarsCase } from '../../ingestion/sampleCaseData';
import { analyzeQuery } from '../../personaEngine/adversarialDefense';
import { getDefaultStorageProvider, DEMO_USER_ID } from '../../lib/localStorageProvider';
import { generateId } from '../../lib/idUtils';

// ---------------------------------------------------------------------------
// Storage Provider (singleton)
// ---------------------------------------------------------------------------

const storage = getDefaultStorageProvider();

// ---------------------------------------------------------------------------
// Backend ↔ Domain Mapping
// ---------------------------------------------------------------------------

/**
 * Map backend chat session to domain ChatSession.
 */
function backendSessionToDomain(s: BackendChatSession): ChatSession {
  return {
    id: s.id,
    userId: s.user_id,
    caseId: s.case_id,
    personaId: s.persona_id,
    createdAt: s.created_at,
  };
}

/**
 * Map backend chat message to domain ChatMessage.
 */
function backendMessageToDomain(
  msg: BackendChatMessage,
  metadata?: ChatMessage['metadata']
): ChatMessage {
  return {
    id: msg.id,
    sessionId: msg.session_id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.created_at,
    metadata,
  };
}

/**
 * Map domain ChatSession to backend shape.
 */
function domainToBackendSession(s: ChatSession): {
  id: string;
  user_id: string;
  case_id: string;
  persona_id: string;
  created_at: number;
} {
  return {
    id: s.id,
    user_id: s.userId,
    case_id: s.caseId,
    persona_id: s.personaId,
    created_at: s.createdAt,
  };
}

/**
 * Map domain ChatMessage to backend shape.
 */
function domainToBackendMessage(m: ChatMessage): {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
} {
  return {
    id: m.id,
    session_id: m.sessionId,
    role: m.role,
    content: m.content,
    created_at: m.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Store State & Actions
// ---------------------------------------------------------------------------

interface ChatState {
  // ── Data ────────────────────────────────────────────────────────
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Record<string, ChatMessage[]>; // sessionId -> messages
  personas: PersonaProfile[];
  suggestedQuestions: Record<string, SuggestedQuestion[]>; // personaId -> questions

  // ── Loading States ──────────────────────────────────────────────
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // ── Actions ─────────────────────────────────────────────────────
  setPersonas: (personas: PersonaProfile[]) => void;
  loadSessions: (caseId: string) => Promise<void>;
  createSession: (caseId: string, personaId: string) => Promise<ChatSession>;
  setActiveSession: (sessionId: string | null) => void;
  sendMessage: (sessionId: string, content: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  loadSuggestedQuestions: (personaId: string) => Promise<void>;
  getPersonaForSession: (sessionId: string) => PersonaProfile | null;
  getActivePersona: () => PersonaProfile | null;
  clearError: () => void;
  deleteSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // ── Initial State ───────────────────────────────────────────────
  sessions: [],
  activeSessionId: null,
  messages: {},
  personas: [],
  suggestedQuestions: {},
  isLoading: false,
  isSending: false,
  error: null,

  // ── Actions ─────────────────────────────────────────────────────

  /**
   * Set the available personas (called from parent component).
   */
  setPersonas: (personas) => set({ personas }),

  /**
   * Load all chat sessions for a case from localStorage.
   * Also loads messages for each session.
   */
  loadSessions: async (caseId) => {
    set({ isLoading: true, error: null });
    try {
      // Try localStorage first
      const backendSessions = await storage.getChatSessions(DEMO_USER_ID, caseId);
      const sessions = backendSessions.map(backendSessionToDomain);
      set({ sessions, isLoading: false });

      // Load messages for each session
      for (const session of sessions) {
        const backendMessages = await storage.getChatMessages(session.id);
        const messages = backendMessages.map((m) => backendMessageToDomain(m));
        set((state) => ({
          messages: { ...state.messages, [session.id]: messages },
        }));
      }

      // Restore active session: use current if valid, otherwise most recent
      const { activeSessionId } = get();
      const hasValidActive = activeSessionId && sessions.find((s) => s.id === activeSessionId);
      if (!hasValidActive && sessions.length > 0) {
        // Pick the session with the most recent message, or the last session
        const mostRecent = sessions
          .map((s) => ({ s, lastMsg: get().messages[s.id]?.at(-1)?.createdAt || s.createdAt }))
          .sort((a, b) => b.lastMsg - a.lastMsg)[0];
        set({ activeSessionId: mostRecent.s.id });
      } else if (activeSessionId && !sessions.find((s) => s.id === activeSessionId)) {
        set({ activeSessionId: null });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load sessions',
      });
    }
  },

  /**
   * Create a new chat session with a persona.
   * Persists to localStorage.
   */
  createSession: async (caseId, personaId) => {
    set({ isLoading: true, error: null });
    try {
      const sessionData: ChatSession = {
        id: generateId(),
        userId: DEMO_USER_ID,
        caseId,
        personaId,
        createdAt: Date.now(),
      };

      // Save to localStorage
      const saved = await storage.createChatSession(domainToBackendSession(sessionData));
      const session = backendSessionToDomain(saved);

      set((state) => ({
        sessions: [...state.sessions, session],
        activeSessionId: session.id,
        messages: { ...state.messages, [session.id]: [] },
        isLoading: false,
      }));

      // Load suggested questions for this persona
      await get().loadSuggestedQuestions(personaId);

      return session;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create session',
      });
      throw err;
    }
  },

  /**
   * Set the active session.
   */
  setActiveSession: (sessionId) => {
    set({ activeSessionId: sessionId });

    // Load messages if not already loaded
    if (sessionId) {
      const { messages, loadMessages } = get();
      if (!messages[sessionId]) {
        void loadMessages(sessionId);
      }
    }
  },

  /**
   * Send a message in a session.
   * Routes to mock engine (client-side) or real API based on AI config.
   * In mock mode, messages are persisted to localStorage.
   */
  sendMessage: async (sessionId, content) => {
    if (!content.trim()) return;

    const { sessions } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    set({ isSending: true, error: null });

    // Create optimistic user message
    const optimisticUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), optimisticUserMsg],
      },
    }));

    // Get AI config
    const aiConfig = useAIConfigStore.getState().config;
    const isMockMode = aiConfig.useMockMode || aiConfig.provider === 'mock';

    try {
      if (isMockMode) {
        // ── MOCK MODE: Generate response client-side ──────────────
        const { personas, messages } = get();
        const persona = personas.find((p) => p.id === session.personaId);
        if (!persona) {
          throw new Error('Persona not found for this session');
        }

        // Build context chunks from the knowledge base
        const kb = coffeeWarsCase;
        const accessibleChunks = kb.chunks.filter(
          (chunk) =>
            chunk.visibility === 'student' &&
            (chunk.characterAttribution === 'all' ||
             chunk.characterAttribution === persona.id ||
             chunk.characterAttribution === persona.name)
        );

        // Simple relevance scoring: keyword overlap with user message
        const userTokens = new Set(
          content.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((t) => t.length > 2)
        );

        const scored = accessibleChunks.map((chunk) => {
          const chunkLower = chunk.text.toLowerCase();
          const chunkTopic = (chunk.topic || '').toLowerCase();
          let score = 0;
          for (const token of userTokens) {
            if (chunkLower.includes(token)) score += 1;
            if (chunkTopic.includes(token)) score += 2;
          }
          return { chunk, score };
        });

        scored.sort((a, b) => b.score - a.score);
        const contextChunks = scored.slice(0, 3).map((s) => ({
          id: s.chunk.id,
          text: s.chunk.text,
          topic: s.chunk.topic,
          section: s.chunk.section,
        }));

        // Generate mock response
        const conversationHistory = messages[sessionId] || [];
        const mockPersona = persona as unknown as IngestionPersonaProfile;
        const mockResult = await generateMockPersonaResponse({
          persona: mockPersona,
          contextChunks,
          userMessage: content.trim(),
          conversationHistory,
        });

        // Analyze for adversarial flags
        const adversarialAnalysis = analyzeQuery(content.trim());

        // Persist user message to localStorage
        const userMsgId = generateId();
        await storage.createChatMessage(domainToBackendMessage({
          id: userMsgId,
          sessionId,
          role: 'user',
          content: content.trim(),
          createdAt: Date.now(),
        }));

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: generateId(),
          sessionId,
          role: 'assistant',
          content: mockResult.content,
          createdAt: Date.now(),
          personaId: persona.id,
          metadata: {
            contextUsed: mockResult.contextUsed,
            adversarialFlags: adversarialAnalysis.isAdversarial ? adversarialAnalysis.flags : undefined,
            groundingConfidence: mockResult.groundingConfidence,
          },
        };

        // Persist assistant message to localStorage
        await storage.createChatMessage(domainToBackendMessage(assistantMsg));

        set((state) => ({
          messages: {
            ...state.messages,
            [sessionId]: [...(state.messages[sessionId] || []).filter(
              (m) => m.id !== optimisticUserMsg.id
            ), { ...optimisticUserMsg, id: userMsgId }, assistantMsg],
          },
          isSending: false,
        }));
      } else {
        // ── REAL MODE: Call backend with user's API key ───────────
        const caseId = session.caseId;
        const response = await api.chat.sendMessage(sessionId, content.trim(), aiConfig);

        // Replace optimistic message with real messages from server
        await get().loadMessages(sessionId);

        set({ isSending: false });
      }
    } catch (err) {
      // Remove optimistic message on failure
      set((state) => ({
        isSending: false,
        error: err instanceof Error ? err.message : 'Failed to send message',
        messages: {
          ...state.messages,
          [sessionId]: (state.messages[sessionId] || []).filter(
            (m) => m.id !== optimisticUserMsg.id
          ),
        },
      }));
    }
  },

  /**
   * Load messages for a session.
   * Tries localStorage first, falls back to API.
   */
  loadMessages: async (sessionId) => {
    const { sessions } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      // Try localStorage first
      const backendMessages = await storage.getChatMessages(sessionId);
      if (backendMessages.length > 0) {
        const messages = backendMessages.map((m) => backendMessageToDomain(m));
        set((state) => ({
          messages: { ...state.messages, [sessionId]: messages },
        }));
        return;
      }

      // Fall back to API
      const data = await api.chat.loadMessages(session.caseId, sessionId);
      const messages = data.messages.map((msg) => backendToMessage(msg));

      set((state) => ({
        messages: { ...state.messages, [sessionId]: messages },
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load messages',
      });
    }
  },

  /**
   * Load suggested questions for a persona.
   */
  loadSuggestedQuestions: async (personaId) => {
    const { personas } = get();
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;

    // Use default questions from the persona engine
    const defaultQuestions: SuggestedQuestion[] = [
      { question: `What can you tell me about ${persona.company}?`, relevantChunkIds: [] },
      { question: `What's your role at ${persona.company}?`, relevantChunkIds: [] },
      { question: `What challenges is ${persona.company} facing?`, relevantChunkIds: [] },
      { question: `What's your vision for the company?`, relevantChunkIds: [] },
      { question: `How do you see the competitive landscape?`, relevantChunkIds: [] },
    ];

    set((state) => ({
      suggestedQuestions: { ...state.suggestedQuestions, [personaId]: defaultQuestions },
    }));
  },

  /**
   * Get the persona profile for a session.
   */
  getPersonaForSession: (sessionId) => {
    const { sessions, personas } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    return personas.find((p) => p.id === session.personaId) ?? null;
  },

  /**
   * Get the persona for the currently active session.
   */
  getActivePersona: () => {
    const { activeSessionId, getPersonaForSession } = get();
    if (!activeSessionId) return null;
    return getPersonaForSession(activeSessionId);
  },

  /**
   * Clear the error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Delete a session (removes from localStorage and state).
   */
  deleteSession: (sessionId) => {
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== sessionId);
      const newMessages = { ...state.messages };
      delete newMessages[sessionId];

      return {
        sessions: newSessions,
        messages: newMessages,
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
      };
    });
  },
}));
