/**
 * Insight Service - Main Orchestrator
 * Coordinates LLM client, prompt builder, parser, validator, fallback, and persistence
 * Based on Prompt-Output-Contract-v1.2.md and Implementation-Plan-v1.1.md
 */

import { logger } from '../../utils/logger';
import { LLMClient, createLLMClient } from '../api/llm';
import { buildPrompt, createInsightRequest } from './prompt';
import { parseInsightResponse } from './parser';
import { validateInsight } from './validation';
import { getFallbackInsight, cacheInsight } from './fallback';
import {
  storeDailyInsight,
  getDailyInsight,
  getWhyThisInsight,
} from './persistence';
import {
  InsightRequest,
  InsightResponse,
  WhyThisInsight,
  NumerologyContext,
  SCHEMA_VERSION,
  PROMPT_VERSION,
} from './types';
import { calculateNumerologyContext } from '../numerology';

export interface GenerateInsightOptions {
  userId: string;
  date?: string;
  force?: boolean; // Force regeneration even if exists
  includeDeep?: boolean; // Request deep layer
  fullName: string;
  dateOfBirth: string;
}

export interface GenerateInsightResult {
  insight: InsightResponse;
  fromCache: boolean;
  isFallback: boolean;
}

/**
 * Insight Service class
 */
export class InsightService {
  private llmClient: LLMClient;

  constructor(apiKey?: string) {
    this.llmClient = createLLMClient(apiKey);
  }

  /**
   * Generate daily insight for a user
   */
  async generateDailyInsight(options: GenerateInsightOptions): Promise<GenerateInsightResult> {
    const { userId, date, force = false, fullName, dateOfBirth } = options;
    const targetDate = date || new Date().toISOString().split('T')[0];

    logger.info('Starting daily insight generation', {
      user_id: userId,
      date: targetDate,
      force,
    });

    // Check for existing insight (unless forced)
    if (!force) {
      const existing = await getDailyInsight(userId, targetDate);
      if (existing && !existing.is_fallback) {
        logger.info('Returning existing insight', {
          user_id: userId,
          date: targetDate,
          request_id: existing.request_id,
        });
        return {
          insight: existing,
          fromCache: true,
          isFallback: false,
        };
      }
    }

    // Get numerology context
    const numerologyContext = this.getNumerologyContext(fullName, dateOfBirth, targetDate);

    // Create insight request
    const request = createInsightRequest(userId, numerologyContext, {
      date: targetDate,
    });

    // Try to generate via LLM
    let insight: InsightResponse;
    let isFallback = false;

    try {
      insight = await this.generateViaLLM(request);
    } catch (error) {
      logger.warn('LLM generation failed, using fallback', {
        user_id: userId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Use fallback pipeline
      insight = await getFallbackInsight(
        userId,
        numerologyContext.personal_day,
        request.request_id,
        'error'
      );
      isFallback = true;
    }

    // Store insight
    await storeDailyInsight(userId, insight);

    // Cache successful insights for future fallback
    if (!isFallback) {
      await cacheInsight(userId, insight);
    }

    logger.info('Daily insight generation complete', {
      user_id: userId,
      date: targetDate,
      request_id: insight.request_id,
      is_fallback: isFallback,
    });

    return {
      insight,
      fromCache: false,
      isFallback,
    };
  }

  /**
   * Generate insight via LLM API
   */
  private async generateViaLLM(request: InsightRequest): Promise<InsightResponse> {
    const startTime = Date.now();

    logger.debug('Building prompt for LLM', {
      request_id: request.request_id,
    });

    // Build prompt
    const { systemPrompt, userMessage } = buildPrompt(request);

    // Call LLM API
    logger.debug('Calling LLM API', {
      request_id: request.request_id,
    });

    const llmResponse = await this.llmClient.chatCompletion(
      systemPrompt,
      userMessage,
      request.request_id
    );

    // Parse response
    logger.debug('Parsing LLM response', {
      request_id: request.request_id,
      response_length: llmResponse.content.length,
    });

    const insight = parseInsightResponse(
      llmResponse.content,
      request.request_id,
      llmResponse.model,
      llmResponse.processing_time_ms
    );

    // Validate response
    const validation = validateInsight(insight, request.request_id);

    if (!validation.valid) {
      logger.error('Insight validation failed', {
        request_id: request.request_id,
        errors: validation.errors,
      });
      throw new Error(`Insight validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn('Insight validation warnings', {
        request_id: request.request_id,
        warnings: validation.warnings,
      });
    }

    logger.info('Successfully generated insight via LLM', {
      request_id: request.request_id,
      processing_time_ms: Date.now() - startTime,
      word_counts: insight.metadata.word_counts,
    });

    return insight;
  }

  /**
   * Get numerology context for a user
   */
  private getNumerologyContext(
    fullName: string,
    dateOfBirth: string,
    targetDate: string
  ): NumerologyContext {
    // Calculate numerology context for the target date
    const numerologyResult = calculateNumerologyContext(fullName, dateOfBirth, targetDate);

    // Map to insight NumerologyContext format
    return {
      personal_day: numerologyResult.personal_day,
      personal_month: numerologyResult.personal_month,
      personal_year: numerologyResult.personal_year,
      life_path: numerologyResult.core.life_path,
      destiny_number: numerologyResult.core.destiny_number,
      soul_urge: numerologyResult.core.soul_urge,
      birthday_number: numerologyResult.core.birthday_number,
    };
  }

  /**
   * Get Why This Insight explanation
   */
  async getWhyThisInsight(insightId: string): Promise<WhyThisInsight | null> {
    logger.debug('Getting Why This Insight', { insight_id: insightId });
    return getWhyThisInsight(insightId);
  }

  /**
   * Get existing daily insight
   */
  async getExistingInsight(
    userId: string,
    date?: string
  ): Promise<InsightResponse | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return getDailyInsight(userId, targetDate);
  }

  /**
   * Submit insight feedback
   */
  async submitFeedback(
    userId: string,
    insightId: string,
    rating: number,
    options?: {
      was_relevant?: boolean;
      was_helpful?: boolean;
      most_useful_claim_type?: 'calculated' | 'interpreted' | 'exploratory';
      feedback_text?: string;
    }
  ): Promise<void> {
    const { storeInsightFeedback } = await import('./persistence');
    await storeInsightFeedback(userId, insightId, rating, options);

    logger.info('Submitted insight feedback', {
      user_id: userId,
      insight_id: insightId,
      rating,
    });
  }
}

/**
 * Create default insight service instance
 */
export function createInsightService(apiKey?: string): InsightService {
  return new InsightService(apiKey);
}

// Re-export types and functions for convenience
export type {
  InsightRequest,
  InsightResponse,
  WhyThisInsight,
  NumerologyContext,
};
export { SCHEMA_VERSION, PROMPT_VERSION };

export default InsightService;
