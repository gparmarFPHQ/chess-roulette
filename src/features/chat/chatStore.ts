// ============================================================================
// MBA Case Study Platform — Chat Store (Zustand)
// ============================================================================
// Central state management for the chat feature. Handles sessions, messages,
// persona lookups, and API communication.
// ============================================================================

import { create } from 'zustand';
import type {
  ChatMessage,
  ChatSession,
  BackendChatSession,
  BackendChatMessage,
} from './types';
import type { PersonaProfile, SuggestedQuestion } from '../../personaEngine/types';
import { backendToSession, backendToMessage } from './utils';

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------

const API_BASE = '/api';

/**
 * Fetch wrapper with auth cookie support.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API error (${response.status}): ${errorBody || response.statusText}`);
  }

  return response.json();
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
   * Load all chat sessions for a case.
   */
  loadSessions: async (caseId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<{ sessions: BackendChatSession[] }>(
        `${API_BASE}/cases/${caseId}/chat/sessions`
      );
      const sessions = data.sessions.map(backendToSession);
      set({ sessions, isLoading: false });

      // If we have an active session, ensure its messages are loaded
      const { activeSessionId, loadMessages } = get();
      if (activeSessionId && sessions.find(s => s.id === activeSessionId)) {
        await loadMessages(activeSessionId);
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
   */
  createSession: async (caseId, personaId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<{ session: BackendChatSession }>(
        `${API_BASE}/cases/${caseId}/chat/sessions`,
        {
          method: 'POST',
          body: JSON.stringify({ persona_id: personaId }),
        }
      );
      const session = backendToSession(data.session);

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
   */
  sendMessage: async (sessionId, content) => {
    if (!content.trim()) return;

    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
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

    try {
      const caseId = session.caseId;
      const response = await apiFetch<{ message: BackendChatMessage }>(
        `${API_BASE}/cases/${caseId}/chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      // Replace optimistic message with real messages from server
      const realUserMsg = backendToMessage(response.message);
      // The backend saves user message then returns assistant message
      // We need to fetch all messages to get the complete picture
      await get().loadMessages(sessionId);

      set({ isSending: false });
    } catch (err) {
      // Remove optimistic message on failure
      set((state) => ({
        isSending: false,
        error: err instanceof Error ? err.message : 'Failed to send message',
        messages: {
          ...state.messages,
          [sessionId]: (state.messages[sessionId] || []).filter(
            m => m.id !== optimisticUserMsg.id
          ),
        },
      }));
    }
  },

  /**
   * Load messages for a session.
   */
  loadMessages: async (sessionId) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const data = await apiFetch<{ messages: BackendChatMessage[] }>(
        `${API_BASE}/cases/${session.caseId}/chat/sessions/${sessionId}/messages`
      );
      const messages = data.messages.map(msg => backendToMessage(msg));

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
    const persona = personas.find(p => p.id === personaId);
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
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;
    return personas.find(p => p.id === session.personaId) ?? null;
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
   * Delete a session locally (UI-only, no backend call).
   */
  deleteSession: (sessionId) => {
    set((state) => {
      const newSessions = state.sessions.filter(s => s.id !== sessionId);
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
