/**
 * Provider defaults for the multi-provider LLM client.
 * Each provider has a default model and API endpoint.
 */

export type LLMProvider = 'deepseek' | 'openai' | 'anthropic' | 'fabric' | 'mock';

export interface ProviderDefaults {
  defaultModel: string;
  apiUrl: string;
  models: string[];
}

export const PROVIDER_DEFAULTS: Record<LLMProvider, ProviderDefaults> = {
  deepseek: {
    defaultModel: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  openai: {
    defaultModel: 'gpt-4o-mini',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
  },
  anthropic: {
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  },
  fabric: {
    defaultModel: 'xlarge',
    apiUrl: '', // Set via env var LLM_API_URL at runtime
    models: ['xlarge'],
  },
  mock: {
    defaultModel: 'mock',
    apiUrl: '',
    models: ['mock'],
  },
};

/**
 * Resolve the effective API URL for a provider.
 * Fabric uses an env-provided URL; others use hardcoded defaults.
 */
export function resolveProviderUrl(
  provider: LLMProvider,
  envFabricUrl?: string
): string {
  if (provider === 'fabric') {
    return envFabricUrl || PROVIDER_DEFAULTS.fabric.apiUrl;
  }
  return PROVIDER_DEFAULTS[provider].apiUrl;
}

/**
 * Get the default model for a provider.
 */
export function getDefaultModel(provider: LLMProvider): string {
  return PROVIDER_DEFAULTS[provider].defaultModel;
}

/**
 * Validate that a model is supported by the given provider.
 */
export function isValidModel(provider: LLMProvider, model: string): boolean {
  return PROVIDER_DEFAULTS[provider].models.includes(model);
}
