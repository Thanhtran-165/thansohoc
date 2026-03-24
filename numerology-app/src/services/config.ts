/**
 * Configuration Manager
 * Manages application configuration and settings
 */

import { initDatabase, dbQuery } from './database';
import { logger } from '@utils/logger';

// App configuration interface
export interface AppConfig {
  // LLM API settings
  llm: {
    provider: 'deepseek' | 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    baseUrl: string;
    model: string;
    timeout: number; // milliseconds
    maxRetries: number;
  };
  // App settings
  app: {
    language: 'vi' | 'en';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    dataRetentionDays: {
      insights: number;
      journal: number;
      cache: number;
    };
  };
  // Feature flags
  features: {
    enableNotifications: boolean;
    enableDeepLayer: boolean;
    enableExploratoryClaims: boolean;
  };
}

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  llm: {
    provider: 'deepseek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    timeout: 10000, // 10 seconds as per PRD
    maxRetries: 3,
  },
  app: {
    language: 'en',
    logLevel: 'info',
    dataRetentionDays: {
      insights: 90,
      journal: 365,
      cache: 7,
    },
  },
  features: {
    enableNotifications: true,
    enableDeepLayer: false, // Optional in MVP
    enableExploratoryClaims: false, // Optional in MVP
  },
};

// Config keys stored in database
const CONFIG_KEYS = {
  llmProvider: 'llm_provider',
  llmApiKey: 'llm_api_key',
  llmBaseUrl: 'llm_base_url',
  llmModel: 'llm_model',
  llmTimeout: 'llm_timeout',
  llmMaxRetries: 'llm_max_retries',
  appLanguage: 'app_language',
  appLogLevel: 'app_log_level',
  featureNotifications: 'feature_notifications',
  featureDeepLayer: 'feature_deep_layer',
  featureExploratory: 'feature_exploratory',
} as const;

const LLM_KEY_MAP: Record<keyof AppConfig['llm'], string> = {
  provider: CONFIG_KEYS.llmProvider,
  apiKey: CONFIG_KEYS.llmApiKey,
  baseUrl: CONFIG_KEYS.llmBaseUrl,
  model: CONFIG_KEYS.llmModel,
  timeout: CONFIG_KEYS.llmTimeout,
  maxRetries: CONFIG_KEYS.llmMaxRetries,
};

const APP_KEY_MAP: Record<Exclude<keyof AppConfig['app'], 'dataRetentionDays'>, string> = {
  language: CONFIG_KEYS.appLanguage,
  logLevel: CONFIG_KEYS.appLogLevel,
};

const FEATURE_KEY_MAP: Record<keyof AppConfig['features'], string> = {
  enableNotifications: CONFIG_KEYS.featureNotifications,
  enableDeepLayer: CONFIG_KEYS.featureDeepLayer,
  enableExploratoryClaims: CONFIG_KEYS.featureExploratory,
};

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Initialize configuration from database
   */
  async init(): Promise<void> {
    try {
      // Ensure database is ready
      await initDatabase();

      // Load saved settings from database
      const settings = dbQuery.all<{ key: string; value: string }>(
        'SELECT key, value FROM app_settings WHERE key LIKE ?',
        ['config_%']
      );

      // Parse and apply saved settings
      for (const setting of settings) {
        this.applySetting(setting.key, setting.value);
      }

      logger.info('Configuration loaded successfully');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to load configuration, using defaults: ${errorMsg}`);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Apply a setting from the database
   */
  private applySetting(key: string, value: string): void {
    const parsedValue = JSON.parse(value);

    switch (key) {
      case `config_${CONFIG_KEYS.llmProvider}`:
        this.config.llm.provider = parsedValue;
        break;
      case `config_${CONFIG_KEYS.llmApiKey}`:
        this.config.llm.apiKey = parsedValue;
        break;
      case `config_${CONFIG_KEYS.llmBaseUrl}`:
        this.config.llm.baseUrl = parsedValue;
        break;
      case `config_${CONFIG_KEYS.llmModel}`:
        this.config.llm.model = parsedValue;
        break;
      case `config_${CONFIG_KEYS.llmTimeout}`:
        this.config.llm.timeout = parsedValue;
        break;
      case `config_${CONFIG_KEYS.llmMaxRetries}`:
        this.config.llm.maxRetries = parsedValue;
        break;
      case `config_${CONFIG_KEYS.appLanguage}`:
        this.config.app.language = parsedValue;
        break;
      case `config_${CONFIG_KEYS.appLogLevel}`:
        this.config.app.logLevel = parsedValue;
        break;
      case `config_${CONFIG_KEYS.featureNotifications}`:
        this.config.features.enableNotifications = parsedValue;
        break;
      case `config_${CONFIG_KEYS.featureDeepLayer}`:
        this.config.features.enableDeepLayer = parsedValue;
        break;
      case `config_${CONFIG_KEYS.featureExploratory}`:
        this.config.features.enableExploratoryClaims = parsedValue;
        break;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<AppConfig> {
    return { ...this.config };
  }

  /**
   * Update LLM configuration
   */
  async updateLLMConfig(updates: Partial<AppConfig['llm']>): Promise<void> {
    const updateInTx = () => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const mappedKey = LLM_KEY_MAP[key as keyof AppConfig['llm']];
          const configKey = `config_${mappedKey}`;
          dbQuery.run(
            'INSERT OR REPLACE INTO app_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)',
            [configKey, configKey, JSON.stringify(value), new Date().toISOString()]
          );
        }
      }
    };

    dbQuery.transaction(updateInTx);

    // Update local config
    this.config.llm = { ...this.config.llm, ...updates };
    logger.info('LLM configuration updated');
  }

  /**
   * Update app configuration
   */
  async updateAppConfig(updates: Partial<AppConfig['app']>): Promise<void> {
    const updateInTx = () => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const mappedKey = APP_KEY_MAP[key as keyof typeof APP_KEY_MAP];
          if (!mappedKey) continue;

          const configKey = `config_${mappedKey}`;
          dbQuery.run(
            'INSERT OR REPLACE INTO app_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)',
            [configKey, configKey, JSON.stringify(value), new Date().toISOString()]
          );
        }
      }
    };

    dbQuery.transaction(updateInTx);

    // Update local config
    this.config.app = { ...this.config.app, ...updates };
    logger.info('App configuration updated');
  }

  /**
   * Update feature flags
   */
  async updateFeatures(updates: Partial<AppConfig['features']>): Promise<void> {
    const updateInTx = () => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const mappedKey = FEATURE_KEY_MAP[key as keyof AppConfig['features']];
          const configKey = `config_${mappedKey}`;
          dbQuery.run(
            'INSERT OR REPLACE INTO app_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)',
            [configKey, configKey, JSON.stringify(value), new Date().toISOString()]
          );
        }
      }
    };

    dbQuery.transaction(updateInTx);

    // Update local config
    this.config.features = { ...this.config.features, ...updates };
    logger.info('Feature flags updated');
  }

  /**
   * Check if LLM is configured
   */
  isLLMConfigured(): boolean {
    return this.config.llm.apiKey.length > 0;
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };

    // Clear saved config from database
    dbQuery.run('DELETE FROM app_settings WHERE key LIKE ?', ['config_%']);

    logger.info('Configuration reset to defaults');
  }
}

// Singleton instance
export const configManager = new ConfigManager();

export default configManager;
