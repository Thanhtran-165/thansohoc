/**
 * LLM Settings Component
 * User-friendly AI/LLM configuration UI for the Numerology Intelligence MVP - Vietnamese UI
 */

import { useState, useEffect } from 'react';
import { configManager } from '@services/config';
import { LLMClient } from '@services/api/llm';
import { DEFAULT_LLM_CONFIG } from '@services/insight/types';
import { logger } from '@utils/logger';
import messages from '@localization';

// Available models - keep it simple (default + 1 alternative)
const AVAILABLE_MODELS = [
  { value: 'deepseek-chat', label: messages.llmSettings.fields.model.options.deepseekChat },
  { value: 'deepseek-reasoner', label: messages.llmSettings.fields.model.options.deepseekReasoner },
];

// Test connection timeout - longer for reasoning models
const TEST_TIMEOUT_MS = 30000; // 30 seconds

// Configuration status types
type ConfigStatus = 'not_configured' | 'saved_not_tested' | 'connection_successful' | 'last_test_failed';

// Test connection result
type TestResult = 'idle' | 'testing' | 'success' | 'error';

interface LLMSettingsState {
  apiKey: string;
  showApiKey: boolean;
  model: string;
  temperature: number;
  maxTokens: number | null;
  isLoading: boolean;
  isDirty: boolean;
  testResult: TestResult;
  testMessage: string;
  validationErrors: Record<string, string>;
  hasSavedKey: boolean;
}

export default function LLMSettings() {
  const [state, setState] = useState<LLMSettingsState>({
    apiKey: '',
    showApiKey: false,
    model: DEFAULT_LLM_CONFIG.model,
    temperature: DEFAULT_LLM_CONFIG.temperature,
    maxTokens: DEFAULT_LLM_CONFIG.maxTokens,
    isLoading: true,
    isDirty: false,
    testResult: 'idle',
    testMessage: '',
    validationErrors: {},
    hasSavedKey: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      await configManager.init();
      const config = configManager.getConfig();
      const savedKey = config.llm.apiKey || '';

      setState(prev => ({
        ...prev,
        apiKey: savedKey,
        model: config.llm.model || DEFAULT_LLM_CONFIG.model,
        temperature: DEFAULT_LLM_CONFIG.temperature,
        maxTokens: DEFAULT_LLM_CONFIG.maxTokens,
        isLoading: false,
        isDirty: false,
        hasSavedKey: savedKey.length > 0,
        testResult: 'idle',
        testMessage: '',
      }));
    } catch (error) {
      logger.error('Failed to load LLM settings', { error });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Get configuration status for display
  const getConfigStatus = (): ConfigStatus => {
    if (!state.hasSavedKey && !state.apiKey) return 'not_configured';
    if (state.testResult === 'success') return 'connection_successful';
    if (state.testResult === 'error') return 'last_test_failed';
    if (state.hasSavedKey && state.testResult === 'idle') return 'saved_not_tested';
    return 'not_configured';
  };

  // Get status display properties
  const getStatusDisplay = () => {
    const status = getConfigStatus();
    switch (status) {
      case 'not_configured':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          text: messages.llmSettings.status.notConfigured.text,
          subtext: messages.llmSettings.status.notConfigured.subtext,
          bgClass: 'bg-amber-50 border-amber-200 text-amber-800 textIcon-amber-500',
        };
      case 'saved_not_tested':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          ),
          text: messages.llmSettings.status.savedNotTested.text,
          subtext: messages.llmSettings.status.savedNotTested.subtext,
          bgClass: 'bg-blue-50 border-blue-200 text-blue-800 textIcon-blue-500',
        };
      case 'connection_successful':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: messages.llmSettings.status.connectionSuccessful.text,
          subtext: messages.llmSettings.status.connectionSuccessful.subtext,
          bgClass: 'bg-green-50 border-green-200 text-green-800 textIcon-green-500',
        };
      case 'last_test_failed':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: messages.llmSettings.status.lastTestFailed.text,
          subtext: state.testMessage || messages.llmSettings.status.lastTestFailed.subtext,
          bgClass: 'bg-red-50 border-red-200 text-red-800 textIcon-red-500',
        };
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!state.apiKey.trim()) {
      errors.apiKey = messages.llmSettings.validation.apiKeyRequired;
    } else if (!state.apiKey.startsWith('sk-')) {
      errors.apiKey = messages.llmSettings.validation.apiKeyFormat;
    }
    if (state.temperature < 0 || state.temperature > 2) {
      errors.temperature = messages.llmSettings.validation.temperatureRange;
    }
    if (state.maxTokens !== null && (state.maxTokens < 100 || state.maxTokens > 32000)) {
      errors.maxTokens = messages.llmSettings.validation.maxTokensRange;
    }
    setState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  // Handle save settings (does NOT test connection)
  const handleSave = async () => {
    if (!validate()) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await configManager.updateLLMConfig({
        apiKey: state.apiKey,
        model: state.model,
        baseUrl: 'https://api.deepseek.com/v1',
      });
      setState(prev => ({
        ...prev,
        isLoading: false,
        isDirty: false,
        hasSavedKey: true,
        testResult: 'idle',
        testMessage: '',
      }));
      logger.info('LLM settings saved');
    } catch (error) {
      logger.error('Failed to save LLM settings', { error });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle test connection (does NOT save settings - uses current form values)
  const handleTestConnection = async () => {
    // Check for empty API key first
    if (!state.apiKey.trim()) {
      setState(prev => ({
        ...prev,
        testResult: 'error',
        testMessage: messages.llmSettings.testMessages.enterApiKey,
      }));
      return;
    }

    // Set testing state
    setState(prev => ({ ...prev, testResult: 'testing', testMessage: messages.llmSettings.testMessages.testing }));

    // Create timeout promise for UI feedback
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TEST_TIMEOUT_MS);
    });

    try {
      const client = new LLMClient(state.apiKey, 'https://api.deepseek.com/v1', {
        model: state.model,
        maxTokens: 50,
        temperature: 0.7,
        timeout: TEST_TIMEOUT_MS,
        maxRetries: 0, // No retries for test - fail fast
        retryDelays: [],
      });

      // Race between API call and timeout
      await Promise.race([
        client.chatCompletion(
          'You are a helpful assistant. Respond with exactly: "Connection successful"',
          'Say "Connection successful"',
          'test-connection'
        ),
        timeoutPromise
      ]);

      // Connection succeeded - always set success if we got here without error
      setState(prev => ({
        ...prev,
        testResult: 'success',
        testMessage: '',
      }));

      logger.info('LLM connection test successful', { model: state.model });
    } catch (error) {
      // Determine specific error message
      let message = messages.llmSettings.testMessages.connectionFailed;

      // Check for error message - handle both Error instances and plain objects (LLMError)
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message).toLowerCase()
        : String(error).toLowerCase();

      if (errorMessage) {
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
          message = messages.llmSettings.testMessages.invalidApiKey;
        } else if (errorMessage.includes('404') || errorMessage.includes('model') || errorMessage.includes('not found')) {
          message = messages.llmSettings.testMessages.modelNotAvailable;
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || errorMessage.includes('abort') || errorMessage.includes('request timeout')) {
          message = messages.llmSettings.testMessages.timeout;
        } else if (errorMessage.includes('network') || errorMessage.includes('econnrefused') || errorMessage.includes('fetch') || errorMessage.includes('failed to fetch')) {
          message = messages.llmSettings.testMessages.networkError;
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          message = messages.llmSettings.testMessages.rateLimit;
        } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503') || errorMessage.includes('server')) {
          message = messages.llmSettings.testMessages.connectionFailed;
        }
      }

      setState(prev => ({
        ...prev,
        testResult: 'error',
        testMessage: message,
      }));

      logger.warn('LLM connection test failed', { error: errorMessage || 'unknown' });
    }
  };

  // Handle remove API key
  const handleRemoveKey = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await configManager.updateLLMConfig({
        apiKey: '',
        model: DEFAULT_LLM_CONFIG.model,
        baseUrl: 'https://api.deepseek.com/v1',
      });
      setState(prev => ({
        ...prev,
        apiKey: '',
        isLoading: false,
        isDirty: false,
        hasSavedKey: false,
        testResult: 'idle',
        testMessage: '',
      }));
      logger.info('API key removed');
    } catch (error) {
      logger.error('Failed to remove API key', { error });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    setState(prev => ({
      ...prev,
      model: DEFAULT_LLM_CONFIG.model,
      temperature: DEFAULT_LLM_CONFIG.temperature,
      maxTokens: DEFAULT_LLM_CONFIG.maxTokens,
      isDirty: true,
      testResult: 'idle',
      testMessage: '',
      validationErrors: {},
    }));
  };

  // Update field helper
  const updateField = <K extends keyof LLMSettingsState>(field: K, value: LLMSettingsState[K]) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      isDirty: true,
      testResult: 'idle',
      testMessage: '',
      validationErrors: { ...prev.validationErrors, [field]: '' },
    }));
  };

  if (state.isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();
  const statusClasses = statusDisplay.bgClass.split(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {messages.llmSettings.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {messages.llmSettings.subtitle}
        </p>
      </div>

      {/* Status Line */}
      <div className={`mb-6 p-3 ${statusClasses[0]} border ${statusClasses[1]} rounded-lg flex items-center gap-3`}>
        <div className={statusClasses[3]}>{statusDisplay.icon}</div>
        <div>
          <p className={`text-sm font-medium ${statusClasses[2]}`}>{statusDisplay.text}</p>
          <p className={`text-xs ${statusClasses[2]} opacity-80`}>{statusDisplay.subtext}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* API Key Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{messages.llmSettings.fields.apiKey.label}</label>
          <p className="text-xs text-gray-500 mb-2">
            {messages.llmSettings.fields.apiKey.description}{' '}
            <span className="text-primary-600">platform.deepseek.com</span>
          </p>
          <div className="relative">
            <input
              type={state.showApiKey ? 'text' : 'password'}
              value={state.apiKey}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder={messages.llmSettings.fields.apiKey.placeholder}
              className={`w-full px-3 py-2 pr-16 border rounded-lg text-sm font-mono ${
                state.validationErrors.apiKey ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            <button
              type="button"
              onClick={() => updateField('showApiKey', !state.showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {state.showApiKey ? messages.actions.hide : messages.actions.show}
            </button>
          </div>
          {state.validationErrors.apiKey && (
            <p className="text-xs text-red-500 mt-1">{state.validationErrors.apiKey}</p>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{messages.llmSettings.fields.model.label}</label>
          <p className="text-xs text-gray-500 mb-2">{messages.llmSettings.fields.model.description}</p>
          <select
            value={state.model}
            onChange={(e) => updateField('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {messages.llmSettings.fields.temperature.label}: {state.temperature.toFixed(1)}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {messages.llmSettings.fields.temperature.description}
          </p>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={state.temperature}
            onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{messages.llmSettings.fields.temperature.low}</span>
            <span>{messages.llmSettings.fields.temperature.high}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={state.isLoading || !state.isDirty}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              state.isDirty
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {messages.actions.saveSettings}
          </button>

          <button
            onClick={handleTestConnection}
            disabled={state.isLoading || state.testResult === 'testing' || !state.apiKey}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.testResult === 'testing' ? messages.actions.testing : messages.actions.testConnection}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
          >
            {messages.actions.resetToDefault}
          </button>

          {state.hasSavedKey && (
            <button
              onClick={handleRemoveKey}
              className="px-4 py-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
            >
              {messages.actions.removeApiKey}
            </button>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <details className="group">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4 transform group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {messages.llmSettings.help.title}
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2 pl-5">
            <p className="font-medium">{messages.llmSettings.help.gettingKey}</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              {messages.llmSettings.help.gettingKeySteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="font-medium mt-3">{messages.llmSettings.help.troubleshooting}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {messages.llmSettings.help.troubleshootingSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
