/**
 * Insight Service Types
 * Based on Prompt-Output-Contract-v1.2.md and State-Data-Model-v1.1.md
 */

// Claim types for MVP
export type ClaimType = 'calculated' | 'interpreted' | 'exploratory';

// Confidence bucket values
export type InterpretedConfidence = 0.6 | 0.7 | 0.8;

// User context for insight generation
export interface UserContext {
  id: string;
  name?: string;
  style_preference: 'gentle' | 'direct' | 'practical' | 'spiritual';
  insight_length: 'brief' | 'detailed';
  language: 'vi' | 'en';
  recent_context?: {
    current_streak: number;
    report_days_last_7: number;
    viewed_days_last_7: number;
    previous_insight?: {
      date: string;
      headline: string;
      theme: string;
    } | null;
    recent_themes: string[];
    recent_headlines: string[];
  };
}

// Numerology context for insight generation
export interface NumerologyContext {
  personal_day: number;
  personal_month: number;
  personal_year: number;
  life_path: number;
  destiny_number: number;
  soul_urge: number;
  birthday_number: number;
}

// Input payload for insight generation
export interface InsightRequest {
  schema_version: string;
  user: UserContext;
  numerology: NumerologyContext;
  date: string;
  request_id: string;
}

// Individual claim object
export interface Claim {
  type: ClaimType;
  text: string;
  confidence: number | null;
  source?: string;
}

// Insight layer content
export interface InsightLayer {
  content: string;
  claims: Claim[];
}

// Deep layer extends base layer with exploratory questions
export interface DeepInsightLayer extends InsightLayer {
  exploratory_questions?: string[];
}

// All insight layers
export interface InsightLayers {
  quick: InsightLayer;
  standard: InsightLayer;
  deep?: DeepInsightLayer; // Optional in MVP
}

// Confidence breakdown
export interface ConfidenceBreakdown {
  overall: number;
  breakdown: {
    calculated: number;
    interpreted: number;
  };
}

// Word count metadata
export interface WordCounts {
  quick: number;
  standard: number;
  deep?: number;
}

// Insight metadata
export interface InsightMetadata {
  schema_version: string;
  prompt_version: string;
  model: string;
  claim_types_used: ClaimType[];
  word_counts: WordCounts;
  processing_time_ms: number;
}

// Complete insight response
export interface InsightResponse {
  schema_version: string;
  request_id: string;
  generated_at: string;
  model: string;
  insight: {
    headline: string;
    theme: string;
    layers: InsightLayers;
    confidence: ConfidenceBreakdown;
    personal_day?: number;
    personal_month?: number;
    personal_year?: number;
  };
  metadata: InsightMetadata;
  is_fallback?: boolean;
  fallback_reason?: FallbackReason;
}

// Why This Insight explanation
export interface WhyThisInsight {
  id: string;
  insight_id: string;
  request_id: string;
  data_sources: {
    profile_completeness: number;
    data_available: string[];
  };
  calculated_claims: Array<{
    claim: string;
    formula: string;
    inputs: Record<string, number>;
  }>;
  interpretation_basis: {
    style_preference: string;
    numerology_context: string[];
    model_version: string;
    prompt_version: string;
  };
  confidence_breakdown: {
    data: number;
    interpretation: number;
    overall: number;
  };
  explanation: string;
  generated_at: string;
}

// Fallback reasons
export type FallbackReason = 'timeout' | 'error' | 'no_cache' | 'invalid_response';

// API error classification
export type APIErrorType = 'timeout' | 'rate_limit' | 'server_error' | 'invalid_response' | 'network_error';

// LLM API configuration
export interface LLMConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelays: number[];
}

// Default configuration
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: 'deepseek-reasoner',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelays: [2000, 5000, 10000], // 2s, 5s, 10s backoff
};

// Retry delays for exponential backoff
export const RETRY_DELAYS = [2000, 5000, 10000];

// Default schema version
export const SCHEMA_VERSION = '1.0';
export const PROMPT_VERSION = '1.0.0';
export const FALLBACK_PROMPT_VERSION = 'fallback-1.0.0';

// Fallback templates for Personal Day themes
export const PERSONAL_DAY_THEMES: Record<number, { theme: string; meaning: string }> = {
  1: { theme: 'New Beginnings', meaning: 'A day for fresh starts and initiative' },
  2: { theme: 'Cooperation', meaning: 'A day for partnership and diplomacy' },
  3: { theme: 'Expression', meaning: 'A day for creativity and communication' },
  4: { theme: 'Foundation', meaning: 'A day for building and organizing' },
  5: { theme: 'Change', meaning: 'A day for adaptability and movement' },
  6: { theme: 'Responsibility', meaning: 'A day for family and service' },
  7: { theme: 'Reflection', meaning: 'A day for introspection and inner work' },
  8: { theme: 'Power', meaning: 'A day for ambition and achievement' },
  9: { theme: 'Completion', meaning: 'A day for endings and humanitarian focus' },
  11: { theme: 'Master', meaning: 'A day for illumination and inspiration' },
  22: { theme: 'Master Builder', meaning: 'A day for large-scale manifestation' },
  33: { theme: 'Master Teacher', meaning: 'A day for spiritual service' },
};

// Forbidden language patterns for validation
export const FORBIDDEN_PATTERNS = [
  /you will\s+\w+/gi,
  /this (will|is going to)\s/gi,
  /you are\s+(a|an|the)\s/gi,
  /your personality\s+is/gi,
  /this (means|proves|shows)\s+you/gi,
];
