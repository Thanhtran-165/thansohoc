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
