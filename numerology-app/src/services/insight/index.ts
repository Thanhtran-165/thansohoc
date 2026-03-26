/**
 * Insight Service - Main Orchestrator
 * Coordinates LLM client, prompt builder, parser, validator, fallback, and persistence
 * Based on Prompt-Output-Contract-v1.2.md and Implementation-Plan-v1.1.md
 */

import { logger } from '../../utils/logger';
import { LLMClient, createLLMClientAsync } from '../api/llm';
import {
  createInsightRequest,
  buildBlueprintStagePrompt,
  buildNarrativeStagePrompt,
  buildPracticalStagePrompt,
  buildPresentationStagePrompt,
  buildDeepExpansionStagePrompt,
  buildVoicePolishStagePrompt,
  buildSpokenVietnameseStagePrompt,
} from './prompt';
import { createInterpretationBlueprint } from './interpretationEngine';
import {
  parseBlueprintStageResponse,
  parseNarrativeStageResponse,
  parsePracticalStageResponse,
  parsePresentationStageResponse,
  parseDeepExpansionStageResponse,
  parseVoicePolishStageResponse,
  parseSpokenVietnameseStageResponse,
  ParseError,
} from './parser';
import { validateInsight } from './validation';
import { getFallbackInsight, cacheInsight } from './fallback';
import {
  storeDailyInsight,
  getDailyInsight,
  getWhyThisInsight,
  storeInsightFeedback,
} from './persistence';
import {
  InsightRequest,
  InsightResponse,
  WhyThisInsight,
  NumerologyContext,
  InsightBlueprintStage,
  InsightNarrativeStage,
  InsightPracticalStage,
  InsightPresentationStage,
  InsightDeepExpansionStage,
  InsightVoicePolishStage,
  InsightSpokenVietnameseStage,
  SCHEMA_VERSION,
  PROMPT_VERSION,
} from './types';
import { calculateNumerologyContext } from '../numerology';
import { getCurrentDateISO } from '@utils/date';
import { getRecentPracticeContext } from '@services/dailyPractice';
import { trackEvent } from '@services/analytics';
import { humanizePresentationBlocks, humanizeVietnameseText } from './humanize';

export interface GenerateInsightOptions {
  userId: string;
  date?: string;
  force?: boolean; // Force regeneration even if exists
  includeDeep?: boolean; // Request deep layer
  fullName: string;
  dateOfBirth: string;
  stylePreference?: 'gentle' | 'direct' | 'practical' | 'spiritual';
  insightLength?: 'brief' | 'detailed';
  language?: 'vi' | 'en';
}

export interface GenerateInsightResult {
  insight: InsightResponse;
  fromCache: boolean;
  isFallback: boolean;
}

interface StageLLMResult<T> {
  data: T;
  model: string;
}

interface StageModelSelection {
  reasoningModel: string;
  voiceModel: string;
}

function countWords(text: string | undefined): number {
  if (!text) {
    return 0;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function preferFinalSpokenLayer(finalLayer: string | undefined, draftLayer: string | undefined): string | undefined {
  if (!finalLayer) {
    return draftLayer;
  }
  if (!draftLayer) {
    return finalLayer;
  }

  const finalWords = countWords(finalLayer);
  const draftWords = countWords(draftLayer);

  if (draftWords === 0) {
    return finalLayer;
  }

  // Trust the final spoken rewrite unless it collapsed too far and likely lost substance.
  if (finalWords >= Math.floor(draftWords * 0.55)) {
    return finalLayer;
  }

  return draftLayer;
}

function resolveStageModels(baseModel: string): StageModelSelection {
  if (baseModel.startsWith('deepseek-')) {
    return {
      reasoningModel: 'deepseek-reasoner',
      voiceModel: 'deepseek-chat',
    };
  }

  return {
    reasoningModel: baseModel,
    voiceModel: baseModel,
  };
}

type StageParser<T> = (content: string) => T;

/**
 * Insight Service class
 */
export class InsightService {
  private llmClientPromise: Promise<LLMClient>;
  private readonly stageParseRepairRetries = 1;

  constructor(apiKey?: string) {
    this.llmClientPromise = createLLMClientAsync(apiKey);
  }

  /**
   * Generate daily insight for a user
   */
  async generateDailyInsight(options: GenerateInsightOptions): Promise<GenerateInsightResult> {
    const {
      userId,
      date,
      force = false,
      fullName,
      dateOfBirth,
      stylePreference,
      insightLength,
      language,
    } = options;
    const targetDate = date || getCurrentDateISO();

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
    const interpretationBlueprint = createInterpretationBlueprint(numerologyContext);
    const recentContext = getRecentPracticeContext(userId);

    // Create insight request
    const request = createInsightRequest(userId, numerologyContext, {
      name: fullName,
      style_preference: stylePreference,
      insight_length: insightLength,
      language,
      date: targetDate,
      recent_context: recentContext,
      interpretation: interpretationBlueprint,
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
        'error',
        request.user.language
      );
      isFallback = true;
    }

    insight.insight.personal_day = numerologyContext.personal_day;
    insight.insight.personal_month = numerologyContext.personal_month;
    insight.insight.personal_year = numerologyContext.personal_year;

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

    await trackEvent('insight_generated', {
      userId,
      payload: {
        date: targetDate,
        request_id: insight.request_id,
        theme: insight.insight.theme,
        is_fallback: isFallback,
      },
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
    const llmClient = await this.llmClientPromise;
    const { reasoningModel, voiceModel } = resolveStageModels(llmClient.getModelName());
    const reasoningClient = llmClient.withModel(reasoningModel);
    const voiceClient = llmClient.withModel(voiceModel);

    logger.info('Using hybrid model pipeline for insight generation', {
      request_id: request.request_id,
      reasoning_model: reasoningModel,
      voice_model: voiceModel,
    });

    const blueprintStage = await this.runBlueprintStage(reasoningClient, request);
    const narrativeStage = await this.runNarrativeStage(reasoningClient, request, blueprintStage.data);
    const practicalStage = await this.runPracticalStage(reasoningClient, request, blueprintStage.data, narrativeStage.data);
    const presentationStage = await this.runPresentationStage(voiceClient, request, blueprintStage.data, practicalStage.data);
    const deepExpansionStage = await this.runDeepExpansionStage(
      reasoningClient,
      request,
      blueprintStage.data,
      narrativeStage.data,
      practicalStage.data
    );
    const expandedNarrativeStage: InsightNarrativeStage = {
      ...narrativeStage.data,
      layers: {
        ...narrativeStage.data.layers,
        standard: {
          ...narrativeStage.data.layers.standard,
          content: deepExpansionStage.data.layers.standard,
        },
        ...(narrativeStage.data.layers.deep
          ? {
              deep: {
                ...narrativeStage.data.layers.deep,
                content: deepExpansionStage.data.layers.deep,
              },
            }
          : {}),
      },
    };
    const voicePolishStage = await this.runVoicePolishStage(
      voiceClient,
      request,
      blueprintStage.data,
      expandedNarrativeStage,
      practicalStage.data,
      presentationStage.data
    );
    const spokenVietnameseStage = await this.runSpokenVietnameseStage(
      voiceClient,
      request,
      voicePolishStage.data
    );

    const totalProcessingTime = Date.now() - startTime;
    const primaryModel =
      spokenVietnameseStage.model ||
      voicePolishStage.model ||
      deepExpansionStage.model ||
      blueprintStage.model ||
      narrativeStage.model ||
      practicalStage.model ||
      presentationStage.model;

    const insight = this.assembleInsightResponse(
      request,
      primaryModel,
      totalProcessingTime,
      expandedNarrativeStage,
      spokenVietnameseStage.data
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

  private async runBlueprintStage(
    llmClient: LLMClient,
    request: InsightRequest
  ): Promise<StageLLMResult<InsightBlueprintStage>> {
    const { systemPrompt, userMessage } = buildBlueprintStagePrompt(request);
    return this.completeStage(
      llmClient,
      `${request.request_id}:blueprint`,
      'blueprint',
      systemPrompt,
      userMessage,
      parseBlueprintStageResponse
    );
  }

  private async runNarrativeStage(
    llmClient: LLMClient,
    request: InsightRequest,
    blueprint: InsightBlueprintStage
  ): Promise<StageLLMResult<InsightNarrativeStage>> {
    const { systemPrompt, userMessage } = buildNarrativeStagePrompt(request, blueprint);
    return this.completeStage(
      llmClient,
      `${request.request_id}:narrative`,
      'narrative',
      systemPrompt,
      userMessage,
      parseNarrativeStageResponse
    );
  }

  private async runPracticalStage(
    llmClient: LLMClient,
    request: InsightRequest,
    blueprint: InsightBlueprintStage,
    narrative: InsightNarrativeStage
  ): Promise<StageLLMResult<InsightPracticalStage>> {
    const { systemPrompt, userMessage } = buildPracticalStagePrompt(request, blueprint, narrative);
    return this.completeStage(
      llmClient,
      `${request.request_id}:practical`,
      'practical',
      systemPrompt,
      userMessage,
      parsePracticalStageResponse
    );
  }

  private async runPresentationStage(
    llmClient: LLMClient,
    request: InsightRequest,
    blueprint: InsightBlueprintStage,
    practical: InsightPracticalStage
  ): Promise<StageLLMResult<InsightPresentationStage>> {
    const { systemPrompt, userMessage } = buildPresentationStagePrompt(request, blueprint, practical);
    return this.completeStage(
      llmClient,
      `${request.request_id}:presentation`,
      'presentation',
      systemPrompt,
      userMessage,
      parsePresentationStageResponse
    );
  }

  private async runDeepExpansionStage(
    llmClient: LLMClient,
    request: InsightRequest,
    blueprint: InsightBlueprintStage,
    narrative: InsightNarrativeStage,
    practical: InsightPracticalStage
  ): Promise<StageLLMResult<InsightDeepExpansionStage>> {
    const { systemPrompt, userMessage } = buildDeepExpansionStagePrompt(
      request,
      blueprint,
      narrative,
      practical
    );
    return this.completeStage(
      llmClient,
      `${request.request_id}:deep_expansion`,
      'deep_expansion',
      systemPrompt,
      userMessage,
      parseDeepExpansionStageResponse
    );
  }

  private async runVoicePolishStage(
    llmClient: LLMClient,
    request: InsightRequest,
    blueprint: InsightBlueprintStage,
    narrative: InsightNarrativeStage,
    practical: InsightPracticalStage,
    presentation: InsightPresentationStage
  ): Promise<StageLLMResult<InsightVoicePolishStage>> {
    const { systemPrompt, userMessage } = buildVoicePolishStagePrompt(
      request,
      blueprint,
      narrative,
      practical,
      presentation
    );
    return this.completeStage(
      llmClient,
      `${request.request_id}:voice_polish`,
      'voice_polish',
      systemPrompt,
      userMessage,
      parseVoicePolishStageResponse
    );
  }

  private async runSpokenVietnameseStage(
    llmClient: LLMClient,
    request: InsightRequest,
    spokenDraft: InsightVoicePolishStage
  ): Promise<StageLLMResult<InsightSpokenVietnameseStage>> {
    const { systemPrompt, userMessage } = buildSpokenVietnameseStagePrompt(request, spokenDraft);
    return this.completeStage(
      llmClient,
      `${request.request_id}:spoken_vietnamese`,
      'spoken_vietnamese',
      systemPrompt,
      userMessage,
      parseSpokenVietnameseStageResponse
    );
  }

  private async completeStage<T>(
    llmClient: LLMClient,
    requestId: string,
    stageName: string,
    systemPrompt: string,
    userMessage: string,
    parser: StageParser<T>
  ): Promise<StageLLMResult<T>> {
    let currentUserMessage = userMessage;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.stageParseRepairRetries; attempt++) {
      const response = await llmClient.chatCompletion(systemPrompt, currentUserMessage, requestId);

      try {
        return {
          data: parser(response.content),
          model: response.model,
        };
      } catch (error) {
        lastError = error;

        if (!(error instanceof ParseError) || attempt >= this.stageParseRepairRetries) {
          throw error;
        }

        logger.warn('Stage response failed schema parse, retrying with repair hint', {
          request_id: requestId,
          stage: stageName,
          error: error.message,
          attempt: attempt + 1,
        });

        currentUserMessage = `${userMessage}\n\nIMPORTANT REPAIR:\nYour previous response for stage "${stageName}" did not match the required JSON schema. Return the same substance again, but this time obey the schema exactly. Do not omit any required field. Output only valid JSON.`;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(`Stage ${stageName} failed`);
  }

  private assembleInsightResponse(
    request: InsightRequest,
    model: string,
    processingTimeMs: number,
    narrative: InsightNarrativeStage,
    voicePolish: InsightSpokenVietnameseStage
  ): InsightResponse {
    const polishedStandard = preferFinalSpokenLayer(voicePolish.layers.standard, narrative.layers.standard.content);
    const polishedDeep = preferFinalSpokenLayer(voicePolish.layers.deep, narrative.layers.deep?.content);
    const polishedPresentation = humanizePresentationBlocks({
      visual_scene: voicePolish.visual_scene,
      energy_map: voicePolish.energy_map,
      decision_compass: voicePolish.decision_compass,
      practical_guidance: voicePolish.practical_guidance,
      narrative_beats: voicePolish.narrative_beats,
      closing_signal: voicePolish.closing_signal,
    });

    return {
      schema_version: SCHEMA_VERSION,
      request_id: request.request_id,
      generated_at: new Date().toISOString(),
      model,
      insight: {
        headline: humanizeVietnameseText(voicePolish.headline),
        theme: humanizeVietnameseText(voicePolish.theme),
        layers: {
          quick: {
            ...narrative.layers.quick,
            content: humanizeVietnameseText(
              preferFinalSpokenLayer(voicePolish.layers.quick, narrative.layers.quick.content) ?? voicePolish.layers.quick
            ),
          },
          standard: {
            ...narrative.layers.standard,
            content: humanizeVietnameseText(polishedStandard ?? voicePolish.layers.standard),
          },
          ...(narrative.layers.deep
            ? {
                deep: {
                  ...narrative.layers.deep,
                  content: humanizeVietnameseText(polishedDeep ?? narrative.layers.deep.content),
                },
              }
            : {}),
        },
        confidence: narrative.confidence,
        presentation: polishedPresentation,
        personal_day: request.numerology.personal_day,
        personal_month: request.numerology.personal_month,
        personal_year: request.numerology.personal_year,
      },
      metadata: {
        schema_version: SCHEMA_VERSION,
        prompt_version: PROMPT_VERSION,
        model,
        claim_types_used: ['calculated', 'interpreted', 'exploratory'],
        word_counts: {
          quick: voicePolish.layers.quick.split(/\s+/).length,
          standard: countWords(polishedStandard ?? voicePolish.layers.standard),
          ...(polishedDeep ? { deep: countWords(polishedDeep) } : {}),
        },
        processing_time_ms: processingTimeMs,
      },
    };
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
      advanced: numerologyResult.advanced,
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
    const targetDate = date || getCurrentDateISO();
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
      tags?: string[];
      feedback_text?: string;
    }
  ): Promise<void> {
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
