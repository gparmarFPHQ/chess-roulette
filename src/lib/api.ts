// ============================================================================
// MBA Case Study Platform — API Client
// ============================================================================
// Centralized API client for chat and other features.
// ============================================================================

import type { AIConfig } from '../features/chat/aiConfigTypes';

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
// Chat API
// ---------------------------------------------------------------------------

/**
 * Backend session shape (snake_case from DB).
 */
export interface BackendChatSession {
  id: string;
  user_id: string;
  case_id: string;
  persona_id: string;
  created_at: number;
}

/**
 * Backend message shape (snake_case from DB).
 */
export interface BackendChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

export const api = {
  chat: {
    /**
     * Load all chat sessions for a case.
     */
    loadSessions: async (caseId: string): Promise<{ sessions: BackendChatSession[] }> => {
      return apiFetch<{ sessions: BackendChatSession[] }>(
        `${API_BASE}/cases/${caseId}/chat/sessions`
      );
    },

    /**
     * Create a new chat session with a persona.
     */
    createSession: async (
      caseId: string,
      personaId: string
    ): Promise<{ session: BackendChatSession }> => {
      return apiFetch<{ session: BackendChatSession }>(
        `${API_BASE}/cases/${caseId}/chat/sessions`,
        {
          method: 'POST',
          body: JSON.stringify({ persona_id: personaId }),
        }
      );
    },

    /**
     * Load messages for a session.
     */
    loadMessages: async (
      caseId: string,
      sessionId: string
    ): Promise<{ messages: BackendChatMessage[] }> => {
      return apiFetch<{ messages: BackendChatMessage[] }>(
        `${API_BASE}/cases/${caseId}/chat/sessions/${sessionId}/messages`
      );
    },

    /**
     * Send a message in a session.
     * @param sessionId The chat session ID.
     * @param content The user's message content.
     * @param aiConfig The AI configuration (provider, API key, model).
     *   When provided, the backend uses the user's API key for the LLM call.
     */
    sendMessage: async (
      sessionId: string,
      content: string,
      aiConfig?: AIConfig
    ): Promise<{ message: BackendChatMessage }> => {
      const url = `${API_BASE}/cases/chat/sessions/${sessionId}/messages`;
      const body: Record<string, unknown> = { content };

      // Include AI config if provided (for real mode)
      if (aiConfig && !aiConfig.useMockMode && aiConfig.provider !== 'mock') {
        body.provider = aiConfig.provider;
        body.apiKey = aiConfig.apiKey;
        body.model = aiConfig.model;
      }

      return apiFetch<{ message: BackendChatMessage }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },
};
