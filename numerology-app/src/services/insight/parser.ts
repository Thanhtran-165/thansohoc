/**
 * Response Parser
 * Parses and validates LLM responses for daily insights
 * Based on Prompt-Output-Contract-v1.2.md
 */

import { logger } from '../../utils/logger';
import {
  InsightResponse,
  Claim,
  ClaimType,
  InsightLayer,
  DeepInsightLayer,
  InsightPresentationBlocks,
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

/**
 * Parse error class for structured error handling
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Extract JSON from LLM response content
 * Handles cases where LLM might include extra text before/after JSON
 */
export function extractJSON(content: string): string {
  // Try to find JSON object in the content
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  throw new ParseError('No JSON object found in response', 'content');
}

/**
 * Parse and validate a claim object
 */
function parseClaim(claim: unknown, index: number): Claim {
  if (typeof claim !== 'object' || claim === null) {
    throw new ParseError(`Claim at index ${index} is not an object`, `claims[${index}]`);
  }

  const c = claim as Record<string, unknown>;

  // Validate type
  const type = c.type as string;
  if (!['calculated', 'interpreted', 'exploratory'].includes(type)) {
    throw new ParseError(
      `Invalid claim type: ${type}`,
      `claims[${index}].type`,
      type
    );
  }

  // Validate text
  if (typeof c.text !== 'string' || c.text.trim().length === 0) {
    throw new ParseError(`Claim at index ${index} has invalid text`, `claims[${index}].text`);
  }

  // Validate text starts with marker
  const validMarkers = ['[Calculated]', '[Interpreted]', '[Exploratory]'];
  const claimText = c.text as string;
  const hasMarker = validMarkers.some((marker) => claimText.startsWith(marker));
  if (!hasMarker) {
    throw new ParseError(
      `Claim text must start with a claim marker`,
      `claims[${index}].text`,
      claimText
    );
  }

  // Validate confidence based on claim type
  let confidence: number | null = null;
  if (type === 'calculated') {
    confidence = 1.0;
  } else if (type === 'interpreted') {
    const conf = c.confidence;
    if (typeof conf !== 'number' || ![0.6, 0.7, 0.8].includes(conf)) {
      // Default to 0.7 if invalid
      confidence = 0.7;
      logger.warn(`Interpreted claim confidence normalized to 0.7`, {
        original: conf,
        claim_index: index,
      });
    } else {
      confidence = conf;
    }
  }
  // Exploratory claims have null confidence

  return {
    type: type as ClaimType,
    text: c.text as string,
    confidence,
    source: c.source as string | undefined,
  };
}

/**
 * Parse and validate a layer (quick/standard)
 */
function parseLayer(layer: unknown, layerName: string): InsightLayer {
  if (typeof layer !== 'object' || layer === null) {
    throw new ParseError(`Layer ${layerName} is not an object`, `layers.${layerName}`);
  }

  const l = layer as Record<string, unknown>;

  // Validate content
  if (typeof l.content !== 'string' || l.content.trim().length === 0) {
    throw new ParseError(`Layer ${layerName} has invalid content`, `layers.${layerName}.content`);
  }

  // Validate claims array
  if (!Array.isArray(l.claims)) {
    throw new ParseError(`Layer ${layerName} claims is not an array`, `layers.${layerName}.claims`);
  }

  const claims = l.claims.map((c, i) => parseClaim(c, i));

  // Validate at least one calculated claim
  if (!claims.some((c) => c.type === 'calculated')) {
    throw new ParseError(
      `Layer ${layerName} must have at least one [Calculated] claim`,
      `layers.${layerName}.claims`
    );
  }

  // Validate at least one interpreted claim
  if (!claims.some((c) => c.type === 'interpreted')) {
    throw new ParseError(
      `Layer ${layerName} must have at least one [Interpreted] claim`,
      `layers.${layerName}.claims`
    );
  }

  return {
    content: l.content as string,
    claims,
  };
}

/**
 * Parse and validate deep layer (optional)
 */
function parseDeepLayer(layer: unknown): DeepInsightLayer | undefined {
  if (!layer || typeof layer !== 'object') {
    return undefined;
  }

  const l = layer as Record<string, unknown>;

  // If deep layer exists but is empty, return undefined
  if (Object.keys(l).length === 0) {
    return undefined;
  }

  const parsedLayer = parseLayer(layer, 'deep');

  // Parse exploratory questions if present
  let exploratoryQuestions: string[] | undefined;
  if (Array.isArray(l.exploratory_questions)) {
    exploratoryQuestions = l.exploratory_questions.filter(
      (q) => typeof q === 'string' && q.trim().length > 0
    ) as string[];
  }

  return {
    ...parsedLayer,
    exploratory_questions: exploratoryQuestions,
  };
}

function isIntensity(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value);
}

function parseVisualScene(
  value: unknown
): InsightPresentationBlocks['visual_scene'] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const visualScene = value as Record<string, unknown>;
  if (
    typeof visualScene.atmosphere !== 'string' ||
    typeof visualScene.movement !== 'string' ||
    typeof visualScene.focal_point !== 'string'
  ) {
    return undefined;
  }

  return {
    atmosphere: stripMarkdown(visualScene.atmosphere).trim(),
    movement: stripMarkdown(visualScene.movement).trim(),
    focal_point: stripMarkdown(visualScene.focal_point).trim(),
  };
}

function parseDecisionCompass(
  value: unknown
): InsightPresentationBlocks['decision_compass'] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const decisionCompass = value as Record<string, unknown>;
  if (
    typeof decisionCompass.lean_in !== 'string' ||
    typeof decisionCompass.hold_steady !== 'string' ||
    typeof decisionCompass.avoid_force !== 'string'
  ) {
    return undefined;
  }

  return {
    lean_in: stripMarkdown(decisionCompass.lean_in).trim(),
    hold_steady: stripMarkdown(decisionCompass.hold_steady).trim(),
    avoid_force: stripMarkdown(decisionCompass.avoid_force).trim(),
  };
}

function parseClosingSignal(
  value: unknown
): InsightPresentationBlocks['closing_signal'] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const closingSignal = value as Record<string, unknown>;
  if (
    typeof closingSignal.title !== 'string' ||
    typeof closingSignal.phrase !== 'string'
  ) {
    return undefined;
  }

  return {
    title: stripMarkdown(closingSignal.title).trim(),
    phrase: stripMarkdown(closingSignal.phrase).trim(),
  };
}

function parseEnergyMap(
  value: unknown,
  minimum = 0,
  maximum = 4
): InsightPresentationBlocks['energy_map'] {
  const energyMapRaw = Array.isArray(value) ? value : [];

  const energyMap = energyMapRaw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      label: typeof item.label === 'string' ? stripMarkdown(item.label).trim() : '',
      intensity: isIntensity(item.intensity) ? item.intensity : 3,
      meaning: typeof item.meaning === 'string' ? stripMarkdown(item.meaning).trim() : '',
    }))
    .filter((item) => item.label && item.meaning)
    .slice(0, maximum);

  if (energyMap.length < minimum) {
    return [];
  }

  return energyMap;
}

function parseNarrativeBeats(
  value: unknown,
  minimum = 0,
  maximum = 5
): InsightPresentationBlocks['narrative_beats'] {
  const narrativeBeatsRaw = Array.isArray(value) ? value : [];

  const narrativeBeats = narrativeBeatsRaw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      title: typeof item.title === 'string' ? stripMarkdown(item.title).trim() : '',
      summary: typeof item.summary === 'string' ? stripMarkdown(item.summary).trim() : '',
    }))
    .filter((item) => item.title && item.summary)
    .slice(0, maximum);

  if (narrativeBeats.length < minimum) {
    return [];
  }

  return narrativeBeats;
}

function parsePracticalGuidance(
  value: unknown,
  minimum = 0,
  maximum = 4
): InsightPresentationBlocks['practical_guidance'] {
  const practicalGuidanceRaw = Array.isArray(value) ? value : [];

  const practicalGuidance = practicalGuidanceRaw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      area: (
        typeof item.area === 'string' &&
        ['micro_action', 'work', 'relationships', 'self_regulation'].includes(item.area)
      ) ? item.area as 'micro_action' | 'work' | 'relationships' | 'self_regulation' : 'micro_action',
      title: typeof item.title === 'string' ? stripMarkdown(item.title).trim() : '',
      suggestion: typeof item.suggestion === 'string' ? stripMarkdown(item.suggestion).trim() : '',
      timing: typeof item.timing === 'string' ? stripMarkdown(item.timing).trim() : '',
    }))
    .filter((item) => item.title && item.suggestion && item.timing)
    .slice(0, maximum);

  if (practicalGuidance.length < minimum) {
    return [];
  }

  return practicalGuidance;
}

function parsePresentation(presentation: unknown): InsightPresentationBlocks | undefined {
  if (!presentation || typeof presentation !== 'object') {
    return undefined;
  }

  const block = presentation as Record<string, unknown>;
  const visualScene = parseVisualScene(block.visual_scene);
  const decisionCompass = parseDecisionCompass(block.decision_compass);
  const closingSignal = parseClosingSignal(block.closing_signal);

  if (!visualScene || !decisionCompass || !closingSignal) {
    return undefined;
  }

  return {
    visual_scene: visualScene,
    energy_map: parseEnergyMap(block.energy_map),
    decision_compass: decisionCompass,
    practical_guidance: parsePracticalGuidance(block.practical_guidance),
    narrative_beats: parseNarrativeBeats(block.narrative_beats),
    closing_signal: closingSignal,
  };
}

/**
 * Strip markdown formatting from content
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/^[-*+]\s+/gm, '') // Lists
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .replace(/<[^>]+>/g, '') // HTML tags
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Remove emojis but keep normal unicode
      const codePoint = char.codePointAt(0);
      if (codePoint && codePoint > 0xffff) {
        return '';
      }
      return char;
    });
}

function parseStageJSON(content: string, field: string): Record<string, unknown> {
  try {
    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch (error) {
    throw new ParseError(
      `Failed to parse stage JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      field
    );
  }
}

export function parseBlueprintStageResponse(content: string): InsightBlueprintStage {
  const json = parseStageJSON(content, 'blueprint');
  const headline = typeof json.headline === 'string' ? stripMarkdown(json.headline).trim() : '';
  const theme = typeof json.theme === 'string' ? stripMarkdown(json.theme).trim() : '';
  const openingSummary = typeof json.opening_summary === 'string'
    ? stripMarkdown(json.opening_summary).trim()
    : '';
  const beats = Array.isArray(json.narrative_beats)
    ? json.narrative_beats
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => ({
          title: typeof item.title === 'string' ? stripMarkdown(item.title).trim() : '',
          summary: typeof item.summary === 'string' ? stripMarkdown(item.summary).trim() : '',
        }))
        .filter((item) => item.title && item.summary)
        .slice(0, 5)
    : [];

  if (!headline || !theme || !openingSummary || beats.length === 0) {
    throw new ParseError('Blueprint stage is missing required fields', 'blueprint');
  }

  return {
    headline,
    theme,
    opening_summary: openingSummary,
    narrative_beats: beats,
  };
}

export function parseNarrativeStageResponse(content: string): InsightNarrativeStage {
  const json = parseStageJSON(content, 'narrative');
  if (!json.layers || typeof json.layers !== 'object') {
    throw new ParseError('Narrative stage is missing layers', 'narrative.layers');
  }

  const layers = json.layers as Record<string, unknown>;
  const quickLayer = parseLayer(layers.quick, 'quick');
  const standardLayer = parseLayer(layers.standard, 'standard');
  const deepLayer = parseDeepLayer(layers.deep);
  quickLayer.content = stripMarkdown(quickLayer.content);
  standardLayer.content = stripMarkdown(standardLayer.content);
  if (deepLayer) {
    deepLayer.content = stripMarkdown(deepLayer.content);
  }

  const confidence = json.confidence as Record<string, unknown> | undefined;
  return {
    layers: {
      quick: quickLayer,
      standard: standardLayer,
      ...(deepLayer && { deep: deepLayer }),
    },
    confidence: {
      overall: typeof confidence?.overall === 'number' ? confidence.overall : 0.78,
      breakdown: {
        calculated: (confidence?.breakdown as Record<string, number> | undefined)?.calculated ?? 1.0,
        interpreted: (confidence?.breakdown as Record<string, number> | undefined)?.interpreted ?? 0.7,
      },
    },
  };
}

export function parsePracticalStageResponse(content: string): InsightPracticalStage {
  const json = parseStageJSON(content, 'practical');
  const decisionCompass = parseDecisionCompass(json.decision_compass);
  const practicalGuidance = parsePracticalGuidance(json.practical_guidance, 4, 4);

  if (!decisionCompass || practicalGuidance.length !== 4) {
    throw new ParseError('Practical stage is missing required fields', 'practical');
  }

  return {
    decision_compass: decisionCompass,
    practical_guidance: practicalGuidance,
  };
}

export function parsePresentationStageResponse(content: string): InsightPresentationStage {
  const json = parseStageJSON(content, 'presentation');
  const visualScene = parseVisualScene(json.visual_scene);
  const energyMap = parseEnergyMap(json.energy_map, 3, 4);
  const closingSignal = parseClosingSignal(json.closing_signal);

  if (!visualScene || energyMap.length < 3 || !closingSignal) {
    throw new ParseError('Presentation stage is missing required fields', 'presentation');
  }

  return {
    visual_scene: visualScene,
    energy_map: energyMap,
    closing_signal: closingSignal,
  };
}

export function parseDeepExpansionStageResponse(content: string): InsightDeepExpansionStage {
  const json = parseStageJSON(content, 'deep_expansion');
  const layers = json.layers as Record<string, unknown> | undefined;
  const standard = typeof layers?.standard === 'string' ? stripMarkdown(layers.standard).trim() : '';
  const deep = typeof layers?.deep === 'string' ? stripMarkdown(layers.deep).trim() : '';

  if (!standard || !deep) {
    throw new ParseError('Deep expansion stage is missing required fields', 'deep_expansion');
  }

  return {
    layers: {
      standard,
      deep,
    },
  };
}

export function parseVoicePolishStageResponse(content: string): InsightVoicePolishStage {
  const json = parseStageJSON(content, 'voice_polish');
  const headline = typeof json.headline === 'string' ? stripMarkdown(json.headline).trim() : '';
  const theme = typeof json.theme === 'string' ? stripMarkdown(json.theme).trim() : '';
  const layers = json.layers as Record<string, unknown> | undefined;
  const quick = typeof layers?.quick === 'string' ? stripMarkdown(layers.quick).trim() : '';
  const standard = typeof layers?.standard === 'string' ? stripMarkdown(layers.standard).trim() : '';
  const deep = typeof layers?.deep === 'string' ? stripMarkdown(layers.deep).trim() : undefined;
  const visualScene = parseVisualScene(json.visual_scene);
  const energyMap = parseEnergyMap(json.energy_map, 3, 4);
  const decisionCompass = parseDecisionCompass(json.decision_compass);
  const practicalGuidance = parsePracticalGuidance(json.practical_guidance, 4, 4);
  const narrativeBeats = parseNarrativeBeats(json.narrative_beats, 3, 5);
  const closingSignal = parseClosingSignal(json.closing_signal);

  if (
    !headline ||
    !theme ||
    !quick ||
    !standard ||
    !visualScene ||
    !decisionCompass ||
    practicalGuidance.length !== 4 ||
    narrativeBeats.length < 3 ||
    energyMap.length < 3 ||
    !closingSignal
  ) {
    throw new ParseError('Voice polish stage is missing required fields', 'voice_polish');
  }

  return {
    headline,
    theme,
    layers: {
      quick,
      standard,
      ...(deep ? { deep } : {}),
    },
    visual_scene: visualScene,
    energy_map: energyMap,
    decision_compass: decisionCompass,
    practical_guidance: practicalGuidance,
    narrative_beats: narrativeBeats,
    closing_signal: closingSignal,
  };
}

export function parseSpokenVietnameseStageResponse(content: string): InsightSpokenVietnameseStage {
  const json = parseStageJSON(content, 'spoken_vietnamese');
  const headline = typeof json.headline === 'string' ? stripMarkdown(json.headline).trim() : '';
  const theme = typeof json.theme === 'string' ? stripMarkdown(json.theme).trim() : '';
  const layers = json.layers as Record<string, unknown> | undefined;
  const quick = typeof layers?.quick === 'string' ? stripMarkdown(layers.quick).trim() : '';
  const standard = typeof layers?.standard === 'string' ? stripMarkdown(layers.standard).trim() : '';
  const deep = typeof layers?.deep === 'string' ? stripMarkdown(layers.deep).trim() : undefined;
  const visualScene = parseVisualScene(json.visual_scene);
  const energyMap = parseEnergyMap(json.energy_map, 3, 4);
  const decisionCompass = parseDecisionCompass(json.decision_compass);
  const practicalGuidance = parsePracticalGuidance(json.practical_guidance, 4, 4);
  const narrativeBeats = parseNarrativeBeats(json.narrative_beats, 3, 5);
  const closingSignal = parseClosingSignal(json.closing_signal);

  if (
    !headline ||
    !theme ||
    !quick ||
    !standard ||
    !visualScene ||
    !decisionCompass ||
    practicalGuidance.length !== 4 ||
    narrativeBeats.length < 3 ||
    energyMap.length < 3 ||
    !closingSignal
  ) {
    throw new ParseError('Spoken Vietnamese stage is missing required fields', 'spoken_vietnamese');
  }

  return {
    headline,
    theme,
    layers: {
      quick,
      standard,
      ...(deep ? { deep } : {}),
    },
    visual_scene: visualScene,
    energy_map: energyMap,
    decision_compass: decisionCompass,
    practical_guidance: practicalGuidance,
    narrative_beats: narrativeBeats,
    closing_signal: closingSignal,
  };
}

/**
 * Main parser function - parses LLM response into InsightResponse
 */
export function parseInsightResponse(
  content: string,
  requestId: string,
  model: string,
  processingTimeMs: number
): InsightResponse {
  logger.debug('Parsing insight response', { request_id: requestId });

  let json: Record<string, unknown>;

  try {
    const jsonStr = extractJSON(content);
    json = JSON.parse(jsonStr);
  } catch (error) {
    throw new ParseError(
      `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'content'
    );
  }

  // Validate schema version
  if (json.schema_version !== SCHEMA_VERSION) {
    logger.warn('Schema version mismatch', {
      expected: SCHEMA_VERSION,
      received: json.schema_version,
    });
  }

  // Validate insight object
  if (!json.insight || typeof json.insight !== 'object') {
    throw new ParseError('Missing or invalid insight object', 'insight');
  }

  const insight = json.insight as Record<string, unknown>;

  // Validate headline
  if (typeof insight.headline !== 'string' || insight.headline.trim().length === 0) {
    throw new ParseError('Missing or invalid headline', 'insight.headline');
  }

  // Validate theme
  if (typeof insight.theme !== 'string' || insight.theme.trim().length === 0) {
    throw new ParseError('Missing or invalid theme', 'insight.theme');
  }

  // Validate layers
  if (!insight.layers || typeof insight.layers !== 'object') {
    throw new ParseError('Missing or invalid layers', 'insight.layers');
  }

  const layers = insight.layers as Record<string, unknown>;

  // Parse required layers
  const quickLayer = parseLayer(layers.quick, 'quick');
  const standardLayer = parseLayer(layers.standard, 'standard');

  // Parse optional deep layer
  const deepLayer = parseDeepLayer(layers.deep);

  // Strip markdown from content
  quickLayer.content = stripMarkdown(quickLayer.content);
  standardLayer.content = stripMarkdown(standardLayer.content);
  if (deepLayer) {
    deepLayer.content = stripMarkdown(deepLayer.content);
  }

  // Validate confidence
  if (!insight.confidence || typeof insight.confidence !== 'object') {
    throw new ParseError('Missing or invalid confidence', 'insight.confidence');
  }

  const confidence = insight.confidence as Record<string, unknown>;
  const presentation = parsePresentation(insight.presentation);

  // Build response
  const response: InsightResponse = {
    schema_version: SCHEMA_VERSION,
    request_id: requestId,
    generated_at: new Date().toISOString(),
    model,
    insight: {
      headline: insight.headline as string,
      theme: insight.theme as string,
      layers: {
        quick: quickLayer,
        standard: standardLayer,
        ...(deepLayer && { deep: deepLayer }),
      },
      ...(presentation && { presentation }),
      confidence: {
        overall: confidence.overall as number,
        breakdown: {
          calculated: (confidence.breakdown as Record<string, number>)?.calculated ?? 1.0,
          interpreted: (confidence.breakdown as Record<string, number>)?.interpreted ?? 0.7,
        },
      },
    },
    metadata: {
      schema_version: SCHEMA_VERSION,
      prompt_version: PROMPT_VERSION,
      model,
      claim_types_used: (json.metadata as Record<string, unknown>)?.claim_types_used as
        | ClaimType[]
        | undefined || ['calculated', 'interpreted'],
      word_counts: {
        quick: quickLayer.content.split(/\s+/).length,
        standard: standardLayer.content.split(/\s+/).length,
        ...(deepLayer && { deep: deepLayer.content.split(/\s+/).length }),
      },
      processing_time_ms: processingTimeMs,
    },
  };

  logger.info('Successfully parsed insight response', {
    request_id: requestId,
    headline: response.insight.headline,
    layers: Object.keys(response.insight.layers),
    word_counts: response.metadata.word_counts,
  });

  return response;
}

export default { parseInsightResponse, extractJSON, ParseError };
