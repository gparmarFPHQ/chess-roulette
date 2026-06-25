// ============================================================================
// MBA Case Study Platform — AI Configuration Store
// ============================================================================
// Zustand store that persists AI provider, API key, and mock mode settings
// to localStorage.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIConfig, LLMProvider } from './aiConfigTypes';
import { DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE_KEY, PROVIDER_MODELS } from './aiConfigTypes';

interface AIConfigState {
  // ── Data ────────────────────────────────────────────────────────
  config: AIConfig;
  isSettingsOpen: boolean;

  // ── Actions ─────────────────────────────────────────────────────
  setProvider: (provider: LLMProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setMockMode: (useMock: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  isConfigured: () => boolean;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────────────────────────
      config: DEFAULT_AI_CONFIG,
      isSettingsOpen: false,

      // ── Actions ─────────────────────────────────────────────────

      /**
       * Change the LLM provider. When switching to a non-mock provider,
       * automatically select that provider's default model.
       */
      setProvider: (provider) => {
        set((state) => {
          const models = PROVIDER_MODELS[provider];
          const newModel = models[0] || 'mock';
          const useMockMode = provider === 'mock';

          return {
            config: {
              ...state.config,
              provider,
              model: newModel,
              useMockMode,
              // Clear API key when switching to mock mode
              apiKey: useMockMode ? '' : state.config.apiKey,
            },
          };
        });
      },

      /**
       * Update the user's API key. Stored in localStorage (browser only).
       */
      setApiKey: (apiKey) =>
        set((state) => ({
          config: { ...state.config, apiKey },
        })),

      /**
       * Select a specific model within the current provider.
       */
      setModel: (model) =>
        set((state) => ({
          config: { ...state.config, model },
        })),

      /**
       * Toggle mock mode on/off. When enabling mock mode, switch provider
       * to 'mock' and clear the API key. When disabling, switch to the
       * previously selected provider (or deepseek as fallback).
       */
      setMockMode: (useMock) => {
        set((state) => {
          if (useMock) {
            return {
              config: {
                provider: 'mock' as LLMProvider,
                apiKey: '',
                model: 'mock',
                useMockMode: true,
              },
            };
          }
          // When disabling mock mode, keep the current provider unless it's 'mock'
          const provider = state.config.provider === 'mock' ? 'deepseek' : state.config.provider;
          const models = PROVIDER_MODELS[provider];
          return {
            config: {
              ...state.config,
              provider,
              model: models[0] || 'mock',
              useMockMode: false,
            },
          };
        });
      },

      /**
       * Open the AI settings modal.
       */
      openSettings: () => set({ isSettingsOpen: true }),

      /**
       * Close the AI settings modal.
       */
      closeSettings: () => set({ isSettingsOpen: false }),

      /**
       * Check if the current configuration is valid for making API calls.
       * Mock mode is always considered "configured".
       */
      isConfigured: () => {
        const { config } = get();
        if (config.useMockMode || config.provider === 'mock') return true;
        return config.apiKey.trim().length > 0;
      },
    }),

    // ── Persist Middleware ────────────────────────────────────────
    {
      name: AI_CONFIG_STORAGE_KEY,
      version: 1,
      // Only persist the config, not the UI state (isSettingsOpen)
      partialize: (state) => ({ config: state.config }),
      // Migrate from any previous storage format
      migrate: (persisted: unknown) => {
        try {
          if (typeof persisted === 'object' && persisted !== null && 'config' in persisted) {
            return persisted as { config: AIConfig };
          }
        } catch {
          // Migration failed — use defaults
        }
        return { config: DEFAULT_AI_CONFIG };
      },
    }
  )
);
