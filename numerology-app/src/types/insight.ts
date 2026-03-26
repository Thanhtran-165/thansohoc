// Insight types

export type ClaimType = 'calculated' | 'interpreted' | 'exploratory';

export interface Claim {
  type: ClaimType;
  text: string;
  confidence: number; // 1.0 for calculated, 0.6-0.8 for interpreted, null for exploratory
  source?: string;
}

export interface InsightLayer {
  content: string;
  claims: Claim[];
}

export interface DeepInsightLayer extends InsightLayer {
  exploratory_questions: string[];
}

export interface InsightLayers {
  quick: InsightLayer;
  standard: InsightLayer;
  deep?: DeepInsightLayer; // Omitted when not generated, never {}
}

export interface InsightConfidence {
  overall: number;
  breakdown: {
    calculated: number;
    interpreted: number;
    exploratory?: number;
  };
}

export interface InsightMetadata {
  schema_version: string;
  prompt_version: string;
  model: string;
  claim_types_used: ClaimType[];
  word_counts: {
    quick: number;
    standard: number;
    deep?: number;
  };
  processing_time_ms: number;
}

export interface InsightPresentationBlocks {
  visual_scene: {
    atmosphere: string;
    movement: string;
    focal_point: string;
  };
  energy_map: Array<{
    label: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
  decision_compass: {
    lean_in: string;
    hold_steady: string;
    avoid_force: string;
  };
  practical_guidance: Array<{
    area: 'micro_action' | 'work' | 'relationships' | 'self_regulation';
    title: string;
    suggestion: string;
    timing: string;
  }>;
  narrative_beats: Array<{
    title: string;
    summary: string;
  }>;
  closing_signal: {
    title: string;
    phrase: string;
  };
}

export type FallbackReason = 'timeout' | 'error' | 'no_cache' | 'invalid_response';

export interface DailyInsight {
  id: string;
  user_id: string;
  date: string; // ISO 8601 date
  request_id: string;
  headline: string;
  theme: string;
  personal_day: number;
  personal_month: number;
  personal_year: number;
  layers: InsightLayers;
  presentation?: InsightPresentationBlocks;
  confidence: InsightConfidence;
  metadata: InsightMetadata;
  is_fallback: boolean;
  fallback_reason: FallbackReason | null;
  generated_at: string;
  viewed_at: string | null;
}

// Why This Insight - explainability
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
    result: number;
  }>;
  interpretation_basis: {
    style: string;
    context: string[];
    numerology_version: string;
    prompt_version: string;
    methodology_school?: string;
    dominant_axis?: string;
    pattern?: string;
    report_archetype?: string;
    conflict_grammar?: string;
    ruling_stack?: string[];
    section_plan?: string[];
  };
  confidence_breakdown: {
    data_quality: number;
    interpretation_confidence: number;
    overall: number;
  };
  generated_at: string;
}

// Insight Feedback
export interface InsightFeedback {
  id: string;
  insight_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  was_relevant: boolean | null;
  was_helpful: boolean | null;
  most_useful_claim_type: ClaimType | null;
  tags: string[] | null;
  feedback_text: string | null;
  created_at: string;
}

export interface CreateInsightFeedbackInput {
  insight_id: string;
  user_id: string;
  rating: number;
  was_relevant?: boolean;
  was_helpful?: boolean;
  most_useful_claim_type?: ClaimType;
  tags?: string[];
  feedback_text?: string;
}
