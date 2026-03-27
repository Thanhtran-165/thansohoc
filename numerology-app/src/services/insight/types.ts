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
    recurring_themes: Array<{
      theme: string;
      count: number;
    }>;
    recent_numbers: Array<{
      date: string;
      personal_day: number;
      personal_month: number;
      personal_year: number;
    }>;
    continuity_note: string | null;
    theme_shift: string | null;
  };
}

export interface InterpretationForce {
  source:
    | 'personal_day'
    | 'personal_month'
    | 'personal_year'
    | 'life_path'
    | 'destiny_number'
    | 'soul_urge'
    | 'birthday_number'
    | 'balance_number'
    | 'current_pinnacle'
    | 'current_challenge'
    | 'karmic_debt'
    | 'karmic_lesson'
    | 'hidden_passion';
  number: number;
  label: string;
  role: 'trigger' | 'field' | 'tone' | 'baseline' | 'support' | 'friction';
  meaning: string;
}

export type InterpretationPatternId =
  | 'movement_with_responsibility'
  | 'expression_through_structure'
  | 'reflection_before_action'
  | 'service_with_boundaries'
  | 'completion_before_beginning'
  | 'power_with_balance'
  | 'steady_build'
  | 'intuitive_opening';

export interface InterpretationSectionPlan {
  section:
    | 'headline_frame'
    | 'main_current'
    | 'tension_point'
    | 'applied_direction'
    | 'deepening_arc'
    | 'closing_note';
  objective: string;
  anchors: InterpretationForce['source'][];
  guidance: string;
}

export interface InterpretationConflictGrammar {
  kind:
    | 'push_pull'
    | 'channeling'
    | 'recalibration'
    | 'containment'
    | 'closure_transition'
    | 'amplification';
  summary: string;
  likely_overcorrection: string;
  balancing_move: string;
  naming_rule: string;
}

export interface InterpretationArchetype {
  id:
    | 'threshold_day'
    | 'anchored_change_day'
    | 'structured_expression_day'
    | 'boundary_day'
    | 'closure_day'
    | 'builder_day'
    | 'integration_day';
  label: string;
  narrative_role: string;
  report_emphasis: string;
  closing_tone: string;
}

export interface InterpretationAssemblyParagraph {
  layer: 'quick' | 'standard' | 'deep';
  order: number;
  section: InterpretationSectionPlan['section'];
  intent: string;
  anchors: InterpretationForce['source'][];
  must_include: string[];
  avoid: string[];
}

export interface InterpretationBlueprint {
  hierarchy: Array<{
    source: InterpretationForce['source'];
    number: number;
    weight: number;
    role: InterpretationForce['role'];
  }>;
  primary_force: InterpretationForce;
  supporting_forces: InterpretationForce[];
  friction_forces: InterpretationForce[];
  pattern: {
    id: InterpretationPatternId;
    label: string;
    rationale: string;
  };
  central_dynamic: string;
  tension_line: string | null;
  dominant_axis: {
    name: string;
    description: string;
  };
  conflict_grammar: InterpretationConflictGrammar;
  report_archetype: InterpretationArchetype;
  report_focuses: string[];
  reading_angles: Array<{
    area: 'inner_state' | 'relationships' | 'work' | 'decision_making';
    focus: string;
  }>;
  section_plan: InterpretationSectionPlan[];
  assembly_plan: InterpretationAssemblyParagraph[];
  methodology_trace: {
    ruling_stack: InterpretationForce['source'][];
    emphasis_order: string[];
    do_not_overweight: InterpretationForce['source'][];
  };
  meta_methodology: {
    primary_system: {
      id: 'pythagorean_daily_stack';
      label: string;
      rationale: string;
    };
    supporting_lenses: Array<{
      id: 'essence_transits' | 'lo_shu_birth_chart' | 'name_variants';
      label: string;
      role: 'contextual' | 'tempering' | 'identity';
      include_in_daily_report: boolean;
      rationale: string;
      contribution: string;
      caution: string;
    }>;
    synthesis_rule: string;
    dilution_guardrail: string;
  };
  methodology_notes: string[];
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
  advanced: {
    methodology: {
      school: 'pythagorean';
      reduction_rule: 'preserve_11_22_33';
      modules_used: string[];
    };
    balance_number: number;
    hidden_passion_numbers: number[];
    karmic_lessons: number[];
    karmic_debt_numbers: number[];
    pinnacles: Array<{
      cycle: 1 | 2 | 3 | 4;
      number: number;
      from_age: number;
      to_age: number | null;
    }>;
    challenges: Array<{
      cycle: 1 | 2 | 3 | 4;
      number: number;
      from_age: number;
      to_age: number | null;
    }>;
    current_pinnacle: {
      cycle: 1 | 2 | 3 | 4;
      number: number;
      from_age: number;
      to_age: number | null;
    };
    current_challenge: {
      cycle: 1 | 2 | 3 | 4;
      number: number;
      from_age: number;
      to_age: number | null;
    };
  };
  extended: {
    transits: {
      methodology: 'pythagorean_name_transits';
      current_age: number;
      current_year: number;
      current: {
        year: number;
        age: number;
        letters: Array<{
          source: 'leading_name' | 'middle_name' | 'ending_name';
          label: string;
          letter: string;
          value: number;
          from_age: number;
          to_age: number;
        }>;
        essence_compound: number;
        essence_number: number;
      };
      next_years: Array<{
        year: number;
        age: number;
        letters: Array<{
          source: 'leading_name' | 'middle_name' | 'ending_name';
          label: string;
          letter: string;
          value: number;
          from_age: number;
          to_age: number;
        }>;
        essence_compound: number;
        essence_number: number;
      }>;
    };
    lo_shu: {
      methodology: 'lo_shu';
      grid: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>;
      driver_number: number;
      conductor_number: number;
      present_arrows: Array<{
        id: string;
        numbers: [1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9];
        kind: 'present' | 'missing';
        label: string;
        meaning: string;
      }>;
      missing_arrows: Array<{
        id: string;
        numbers: [1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9];
        kind: 'present' | 'missing';
        label: string;
        meaning: string;
      }>;
      dominant_digits: Array<{ digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; count: number }>;
      absent_digits: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;
    };
    name_variants: {
      birth_name: string;
      current_name: string;
      differs: boolean;
      pythagorean_birth: {
        label: string;
        raw_total: number;
        reduced: number;
      };
      pythagorean_current: {
        label: string;
        raw_total: number;
        reduced: number;
      };
      chaldean_birth: {
        label: string;
        raw_total: number;
        reduced: number;
      };
      chaldean_current: {
        label: string;
        raw_total: number;
        reduced: number;
      };
      dominant_shift: string;
    };
  };
}

// Input payload for insight generation
export interface InsightRequest {
  schema_version: string;
  user: UserContext;
  numerology: NumerologyContext;
  interpretation: InterpretationBlueprint;
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

export interface InsightBlueprintStage {
  headline: string;
  theme: string;
  opening_summary: string;
  narrative_beats: Array<{
    title: string;
    summary: string;
  }>;
}

export interface InsightNarrativeStage {
  layers: InsightLayers;
  confidence: ConfidenceBreakdown;
}

export interface InsightPracticalStage {
  decision_compass: InsightPresentationBlocks['decision_compass'];
  practical_guidance: InsightPresentationBlocks['practical_guidance'];
}

export interface InsightPresentationStage {
  visual_scene: InsightPresentationBlocks['visual_scene'];
  energy_map: InsightPresentationBlocks['energy_map'];
  closing_signal: InsightPresentationBlocks['closing_signal'];
}

export interface InsightDeepExpansionStage {
  layers: {
    standard: string;
    deep: string;
  };
}

export interface InsightVoicePolishStage {
  headline: string;
  theme: string;
  layers: {
    quick: string;
    standard: string;
    deep?: string;
  };
  visual_scene: InsightPresentationBlocks['visual_scene'];
  energy_map: InsightPresentationBlocks['energy_map'];
  decision_compass: InsightPresentationBlocks['decision_compass'];
  practical_guidance: InsightPresentationBlocks['practical_guidance'];
  narrative_beats: InsightPresentationBlocks['narrative_beats'];
  closing_signal: InsightPresentationBlocks['closing_signal'];
}

export interface InsightSpokenVietnameseStage {
  headline: string;
  theme: string;
  layers: {
    quick: string;
    standard: string;
    deep?: string;
  };
  visual_scene: InsightPresentationBlocks['visual_scene'];
  energy_map: InsightPresentationBlocks['energy_map'];
  decision_compass: InsightPresentationBlocks['decision_compass'];
  practical_guidance: InsightPresentationBlocks['practical_guidance'];
  narrative_beats: InsightPresentationBlocks['narrative_beats'];
  closing_signal: InsightPresentationBlocks['closing_signal'];
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
    presentation?: InsightPresentationBlocks;
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
    methodology_school?: string;
    dominant_axis?: string;
    pattern?: string;
    report_archetype?: string;
    conflict_grammar?: string;
    ruling_stack?: InterpretationForce['source'][];
    section_plan?: string[];
    assembly_plan?: string[];
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
  maxTokens: number | null;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelays: number[];
}

// Default configuration
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: 'deepseek-reasoner',
  maxTokens: null,
  temperature: 0.7,
  timeout: 90000, // 90 seconds
  maxRetries: 3,
  retryDelays: [2000, 5000, 10000], // 2s, 5s, 10s backoff
};

// Retry delays for exponential backoff
export const RETRY_DELAYS = [2000, 5000, 10000];

// Default schema version
export const SCHEMA_VERSION = '1.0';
export const PROMPT_VERSION = '2.1.0';
export const FALLBACK_PROMPT_VERSION = 'fallback-1.5.0';

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
