// ============================================================================
// MBA Case Study Platform — AI Configuration Types
// ============================================================================
// Types for configuring the AI provider, API keys, and mock mode.
// ============================================================================

/**
 * Supported LLM providers.
 * 'mock' requires no API key and runs entirely client-side.
 */
export type LLMProvider = 'mock' | 'deepseek' | 'openai' | 'anthropic' | 'fabric';

/**
 * User-facing AI configuration persisted in localStorage.
 */
export interface AIConfig {
  /** Which provider to use for LLM calls. */
  provider: LLMProvider;
  /** User's API key (empty string for mock mode). */
  apiKey: string;
  /** Specific model within the provider. */
  model: string;
  /** Whether mock mode is enabled (bypasses all API calls). */
  useMockMode: boolean;
}

/**
 * Available models per provider.
 */
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  mock: ['mock'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ],
  fabric: ['xlarge', 'large'],
};

/**
 * Human-readable labels for each provider.
 */
export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  mock: 'Mock Mode (No API Key)',
  deepseek: 'DeepSeek',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  fabric: 'Fabric',
};

/**
 * Default AI configuration — mock mode enabled out of the box.
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'mock',
  apiKey: '',
  model: 'mock',
  useMockMode: true,
};

/**
 * localStorage key for persisted AI config.
 */
export const AI_CONFIG_STORAGE_KEY = 'mba-case-platform-ai-config';
