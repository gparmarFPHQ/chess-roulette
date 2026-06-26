// ============================================================================
// MBA Case Study Platform — AI Settings Modal
// ============================================================================
// Modal dialog for configuring the AI provider, API key, model, and mock mode.
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAIConfigStore } from './aiConfigStore';
import type { LLMProvider } from './aiConfigTypes';
import { PROVIDER_MODELS, PROVIDER_LABELS } from './aiConfigTypes';

interface AISettingsProps {
  onClose?: () => void;
}

export function AISettings({ onClose }: AISettingsProps) {
  const store = useAIConfigStore();
  const { config, isSettingsOpen, closeSettings, setProvider, setApiKey, setModel, setMockMode } = store;

  // Local state for form inputs (not committed until save)
  const [localMockMode, setLocalMockMode] = useState(config.useMockMode);
  const [localProvider, setLocalProvider] = useState<LLMProvider>(config.provider);
  const [localApiKey, setLocalApiKey] = useState(config.apiKey);
  const [localModel, setLocalModel] = useState(config.model);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Sync local state when config changes externally
  useEffect(() => {
    setLocalMockMode(config.useMockMode);
    setLocalProvider(config.provider);
    setLocalApiKey(config.apiKey);
    setLocalModel(config.model);
    setError(null);
    setSaved(false);
  }, [config, isSettingsOpen]);

  // Focus trap and close on Escape
  useEffect(() => {
    if (!isSettingsOpen) return;

    firstFocusRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  const handleClose = useCallback(() => {
    closeSettings();
    onClose?.();
  }, [closeSettings, onClose]);

  const handleSave = useCallback(() => {
    // Validate
    if (!localMockMode && !localApiKey.trim()) {
      setError('API key is required when using live AI mode.');
      return;
    }

    // Commit to store
    setMockMode(localMockMode);
    if (!localMockMode) {
      setProvider(localProvider);
      setApiKey(localApiKey);
      setModel(localModel);
    }

    setSaved(true);
    setTimeout(() => {
      handleClose();
    }, 600);
  }, [localMockMode, localProvider, localApiKey, localModel, setMockMode, setProvider, setApiKey, setModel, handleClose]);

  const handleDiscard = useCallback(() => {
    // Reset local state to match store
    setLocalMockMode(config.useMockMode);
    setLocalProvider(config.provider);
    setLocalApiKey(config.apiKey);
    setLocalModel(config.model);
    setError(null);
    setSaved(false);
  }, [config]);

  // Don't render if not open
  if (!isSettingsOpen) return null;

  const availableModels = localMockMode ? [] : PROVIDER_MODELS[localProvider] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 id="ai-settings-title" className="text-base sm:text-lg font-semibold text-gray-900">
              AI Configuration
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Choose how the persona responds to your questions
            </p>
          </div>
          <button
            ref={firstFocusRef}
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Body - scrollable on mobile */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Mock Mode Option */}
              <button
                type="button"
                onClick={() => setLocalMockMode(true)}
                className={`
                  relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
                  ${
                    localMockMode
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                aria-pressed={localMockMode}
              >
                {localMockMode && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-900">Mock Mode</div>
                <div className="text-xs text-gray-500 mt-1">
                  No API key needed. Runs locally in your browser.
                </div>
              </button>

              {/* Live AI Option */}
              <button
                type="button"
                onClick={() => setLocalMockMode(false)}
                className={`
                  relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
                  ${
                    !localMockMode
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                aria-pressed={!localMockMode}
              >
                {!localMockMode && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-900">Live AI</div>
                <div className="text-xs text-gray-500 mt-1">
                  Use your own API key for real AI responses.
                </div>
              </button>
            </div>
          </div>

          {/* Live AI Configuration */}
          {!localMockMode && (
            <>
              {/* Provider */}
              <div>
                <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Provider
                </label>
                <select
                  id="ai-provider"
                  value={localProvider}
                  onChange={(e) => {
                    const newProvider = e.target.value as LLMProvider;
                    setLocalProvider(newProvider);
                    // Reset model to provider default
                    setLocalModel(PROVIDER_MODELS[newProvider]?.[0] || '');
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {Object.entries(PROVIDER_LABELS)
                    .filter(([key]) => key !== 'mock')
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label htmlFor="ai-apikey" className="block text-sm font-medium text-gray-700 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="ai-apikey"
                    type={showApiKey ? 'text' : 'password'}
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 010-1.186A10.201 10.201 0 0110.243 2h.514C15.382 2 18.025 5.02 19.536 8.024a1.651 1.651 0 010 1.186A10.201 10.201 0 019.757 18h-.514C4.618 18 1.976 14.98.464 11.976a1.651 1.651 0 01-.8-.386zM13.25 12.5a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-14.5-14.5zM17.18 12.07a.75.75 0 00-1.06-1.06L10 17.22l-3.72-3.72a.75.75 0 00-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l6.65-6.68z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 inline mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stored in your browser only. Sent to our backend proxy for API calls. Never shared with other users.
                </p>
              </div>

              {/* Model */}
              <div>
                <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Model
                </label>
                <select
                  id="ai-model"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Saved Confirmation */}
          {saved && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200" role="status">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-green-700">Settings saved successfully!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
