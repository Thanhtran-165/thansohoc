/**
 * LLM API Client
 * Generic client for DeepSeek API with retry logic and timeout handling
 * Based on Prompt-Output-Contract-v1.2.md
 */

import { logger } from '../../utils/logger';
import { DEFAULT_LLM_CONFIG, LLMConfig, APIErrorType } from '../insight/types';
import { configManager } from '../config';

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  processing_time_ms: number;
}

export interface LLMError {
  type: APIErrorType;
  message: string;
  retryable: boolean;
  originalError?: Error;
}

/**
 * Classify error type for appropriate handling
 */
function classifyError(error: unknown): LLMError {
  if (error instanceof Error) {
    // Timeout error
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timed out',
        retryable: true,
        originalError: error,
      };
    }

    // Network error
    if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      return {
        type: 'network_error',
        message: 'Network error occurred',
        retryable: true,
        originalError: error,
      };
    }

    // Rate limit (429)
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded',
        retryable: true,
        originalError: error,
      };
    }

    // Server error (5xx)
    if (error.message.includes('5') || error.message.includes('server error')) {
      return {
        type: 'server_error',
        message: 'Server error occurred',
        retryable: true,
        originalError: error,
      };
    }
  }

  return {
    type: 'server_error',
    message: 'Unknown error occurred',
    retryable: false,
    originalError: error instanceof Error ? error : new Error(String(error)),
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readEnvironmentApiKey(): string {
  const nodeApiKey = typeof process !== 'undefined' ? process.env?.DEEPSEEK_API_KEY : undefined;
  const viteApiKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_DEEPSEEK_API_KEY : undefined;
  return nodeApiKey || viteApiKey || '';
}

/**
 * LLM API Client with retry logic
 */
export class LLMClient {
  private config: LLMConfig;
  private apiKey: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.deepseek.com/v1',
    config: Partial<LLMConfig> = {}
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.config = { ...DEFAULT_LLM_CONFIG, ...config };
  }

  /**
   * Make a chat completion request to the LLM API
   */
  async chatCompletion(
    systemPrompt: string,
    userMessage: string,
    requestId: string
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    let lastError: LLMError | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.debug(`LLM API attempt ${attempt + 1}/${this.config.maxRetries + 1}`, {
          requestId,
          model: this.config.model,
        });

        const response = await this.makeRequest(systemPrompt, userMessage, requestId);
        const processingTime = Date.now() - startTime;

        logger.info('LLM API request successful', {
          requestId,
          attempt: attempt + 1,
          processing_time_ms: processingTime,
        });

        return {
          ...response,
          processing_time_ms: processingTime,
        };
      } catch (error) {
        lastError = classifyError(error);

        logger.warn(`LLM API attempt ${attempt + 1} failed`, {
          requestId,
          error: lastError.message,
          type: lastError.type,
          retryable: lastError.retryable,
        });

        // Don't retry if not retryable
        if (!lastError.retryable) {
          throw lastError;
        }

        // If we have more retries, wait and try again
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelays[attempt] || 10000;
          logger.debug(`Waiting ${delay}ms before retry`, { requestId, attempt });
          await sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error('All retry attempts exhausted');
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(
    systemPrompt: string,
    userMessage: string,
    _requestId: string
  ): Promise<LLMResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from API');
      }

      return {
        content: data.choices[0].message.content,
        model: data.model || this.config.model,
        usage: data.usage,
        processing_time_ms: 0, // Set by caller
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Create a default LLM client instance
 * Uses config manager if no API key provided
 */
export async function createLLMClientAsync(apiKey?: string): Promise<LLMClient> {
  let key = apiKey;

  await configManager.init();
  const config = configManager.getConfig();
  key = key || config.llm.apiKey || readEnvironmentApiKey();

  if (!key) {
    logger.warn('No DeepSeek API key provided. LLM client will not work.');
  }

  return new LLMClient(key, config.llm.baseUrl, {
    model: config.llm.model,
    timeout: config.llm.timeout,
    maxRetries: config.llm.maxRetries,
  });
}

/**
 * Create a default LLM client instance (synchronous version)
 */
export function createLLMClient(apiKey?: string): LLMClient {
  const config = configManager.getConfig();
  const key = apiKey || config.llm.apiKey || readEnvironmentApiKey();

  if (!key) {
    logger.warn('No DeepSeek API key provided. LLM client will not work.');
  }

  return new LLMClient(key, config.llm.baseUrl, {
    model: config.llm.model,
    timeout: config.llm.timeout,
    maxRetries: config.llm.maxRetries,
  });
}

// Export for convenience
export default LLMClient;
