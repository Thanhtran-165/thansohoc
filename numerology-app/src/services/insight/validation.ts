/**
 * Insight Validation
 * Validates insight responses for schema compliance, claim types, and forbidden language
 * Based on Prompt-Output-Contract-v1.2.md
 */

import { logger } from '../../utils/logger';
import {
  ClaimType,
  FORBIDDEN_PATTERNS,
  InterpretedConfidence,
} from './types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validate confidence value for claim type
 */
export function isValidConfidence(type: ClaimType, confidence: number | null): boolean {
  if (type === 'calculated') {
    return confidence === 1.0;
  }
  if (type === 'interpreted') {
    return [0.6, 0.7, 0.8].includes(confidence as InterpretedConfidence);
  }
  if (type === 'exploratory') {
    return confidence === null;
  }
  return false;
}

/**
 * Check for forbidden language patterns
 */
export function checkForbiddenPatterns(text: string): string[] {
  const matches: string[] = [];

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return matches;
}

/**
 * Check for markdown formatting
 */
export function containsMarkdown(text: string): boolean {
  // Check for bold/italic
  if (/\*\*[^*]+\*\*/.test(text)) return true;
  if (/\*[^*]+\*/.test(text)) return true;
  // Check for headers
  if (/^#{1,6}\s/.test(text)) return true;
  // Check for markdown lists
  if (/^[\-\*]\s/.test(text)) return true;
  if (/^\d+\.\s/.test(text)) return true;
  // Check for emojis
  if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) return true;

  return false;
}

/**
 * Strip markdown formatting from text
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/^#{1,6}\s/gm, '') // Headers
    .replace(/^[\-\*]\s/gm, '') // Unordered lists
    .replace(/^\d+\.\s/gm, '') // Ordered lists
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
}

/**
 * Validate claim types in a layer
 */
function validateClaimsInLayer(
  claims: unknown[],
  layerName: string,
  requireCalculated: boolean,
  requireInterpreted: boolean,
  result: ValidationResult
): void {
  if (!Array.isArray(claims)) {
    result.errors.push({
      field: `layers.${layerName}.claims`,
      message: 'Claims must be an array',
    });
    return;
  }

  let hasCalculated = false;
  let hasInterpreted = false;

  claims.forEach((claim, index) => {
    if (typeof claim !== 'object' || claim === null) {
      result.errors.push({
        field: `layers.${layerName}.claims[${index}]`,
        message: 'Claim must be an object',
      });
      return;
    }

    const c = claim as Record<string, unknown>;

    // Validate type
    const type = c.type as string;
    if (!['calculated', 'interpreted', 'exploratory'].includes(type)) {
      result.errors.push({
        field: `layers.${layerName}.claims[${index}].type`,
        message: 'Invalid claim type',
        value: type,
      });
    } else {
      if (type === 'calculated') hasCalculated = true;
      if (type === 'interpreted') hasInterpreted = true;
    }

    // Validate text
    if (typeof c.text !== 'string' || c.text.trim().length === 0) {
      result.errors.push({
        field: `layers.${layerName}.claims[${index}].text`,
        message: 'Claim text is required',
      });
    } else {
      const claimText = c.text as string;
      // Check for marker
      const validMarkers = ['[Calculated]', '[Interpreted]', '[Exploratory]'];
      const hasMarker = validMarkers.some((m) => claimText.startsWith(m));
      if (!hasMarker) {
        result.errors.push({
          field: `layers.${layerName}.claims[${index}].text`,
          message: 'Claim must start with a marker ([Calculated], [Interpreted], or [Exploratory])',
          value: claimText,
        });
      }

      // Check for forbidden patterns
      const forbidden = checkForbiddenPatterns(claimText);
      if (forbidden.length > 0) {
        result.warnings.push({
          field: `layers.${layerName}.claims[${index}].text`,
          message: 'Contains forbidden language patterns',
          value: forbidden,
        });
      }

      // Check for markdown
      if (containsMarkdown(claimText)) {
        result.warnings.push({
          field: `layers.${layerName}.claims[${index}].text`,
          message: 'Contains markdown formatting',
        });
      }
    }

    // Validate confidence
    const confidence = c.confidence;
    if (!isValidConfidence(type as ClaimType, confidence as number | null)) {
      if (type === 'calculated') {
        result.errors.push({
          field: `layers.${layerName}.claims[${index}].confidence`,
          message: 'Calculated claims must have confidence 1.0',
          value: confidence,
        });
      } else if (type === 'interpreted') {
        result.errors.push({
          field: `layers.${layerName}.claims[${index}].confidence`,
          message: 'Interpreted claims must have confidence 0.6, 0.7, or 0.8',
          value: confidence,
        });
      }
    }
  });

  // Check required claim types
  if (requireCalculated && !hasCalculated) {
    result.errors.push({
      field: `layers.${layerName}.claims`,
      message: `Layer must have at least one [Calculated] claim`,
    });
  }
  if (requireInterpreted && !hasInterpreted) {
    result.errors.push({
      field: `layers.${layerName}.claims`,
      message: `Layer must have at least one [Interpreted] claim`,
    });
  }
}

/**
 * Validate an insight response
 */
export function validateInsight(response: unknown, requestId: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check basic structure
  if (typeof response !== 'object' || response === null) {
    result.errors.push({
      field: 'root',
      message: 'Response must be a non-null object',
    });
    result.valid = false;
    return result;
  }

  const res = response as Record<string, unknown>;

  // Validate schema_version
  if (res.schema_version !== '1.0') {
    result.errors.push({
      field: 'schema_version',
      message: 'Schema version must be "1.0"',
      value: res.schema_version,
    });
  }

  // Validate request_id
  if (res.request_id !== requestId) {
    result.errors.push({
      field: 'request_id',
      message: 'Request ID mismatch',
      value: res.request_id,
    });
  }

  // Validate insight object
  if (typeof res.insight !== 'object' || res.insight === null) {
    result.errors.push({
      field: 'insight',
      message: 'Insight object is required',
    });
    result.valid = false;
    return result;
  }

  const insight = res.insight as Record<string, unknown>;

  // Validate headline
  if (typeof insight.headline !== 'string' || insight.headline.trim().length === 0) {
    result.errors.push({
      field: 'insight.headline',
      message: 'Headline is required',
    });
  } else {
    const wordCount = (insight.headline as string).split(/\s+/).length;
    if (wordCount < 3) {
      result.warnings.push({
        field: 'insight.headline',
        message: 'Headline may be too short to carry enough meaning',
        value: wordCount,
      });
    }

    // Check for forbidden patterns in headline
    const forbidden = checkForbiddenPatterns(insight.headline as string);
    if (forbidden.length > 0) {
      result.warnings.push({
        field: 'insight.headline',
        message: 'Headline contains forbidden language',
        value: forbidden,
      });
    }
  }

  // Validate theme
  if (typeof insight.theme !== 'string' || insight.theme.trim().length === 0) {
    result.errors.push({
      field: 'insight.theme',
      message: 'Theme is required',
    });
  }

  // Validate layers
  if (typeof insight.layers !== 'object' || insight.layers === null) {
    result.errors.push({
      field: 'insight.layers',
      message: 'Layers object is required',
    });
    result.valid = false;
    return result;
  }

  const layers = insight.layers as Record<string, unknown>;

  // Validate quick layer (required)
  if (!layers.quick) {
    result.errors.push({
      field: 'insight.layers.quick',
      message: 'Quick layer is required',
    });
  } else {
    const quick = layers.quick as Record<string, unknown>;
    if (typeof quick.content !== 'string') {
      result.errors.push({
        field: 'insight.layers.quick.content',
        message: 'Quick layer content is required',
      });
    }
    validateClaimsInLayer(
      quick.claims as unknown[],
      'quick',
      true,
      true,
      result
    );
  }

  // Validate standard layer (required)
  if (!layers.standard) {
    result.errors.push({
      field: 'insight.layers.standard',
      message: 'Standard layer is required',
    });
  } else {
    const standard = layers.standard as Record<string, unknown>;
    if (typeof standard.content !== 'string') {
      result.errors.push({
        field: 'insight.layers.standard.content',
        message: 'Standard layer content is required',
      });
    }
    validateClaimsInLayer(
      standard.claims as unknown[],
      'standard',
      true,
      true,
      result
    );
  }

  // Validate deep layer (optional)
  if (layers.deep && typeof layers.deep === 'object') {
    const deep = layers.deep as Record<string, unknown>;
    if (deep.content && typeof deep.content === 'string') {
      if (Array.isArray(deep.claims) && deep.claims.length > 0) {
        validateClaimsInLayer(
          deep.claims as unknown[],
          'deep',
          false,
          false,
          result
        );
      }
    }
  }

  // Validate confidence
  if (typeof insight.confidence !== 'object' || insight.confidence === null) {
    result.errors.push({
      field: 'insight.confidence',
      message: 'Confidence object is required',
    });
  } else {
    const confidence = insight.confidence as Record<string, unknown>;
    if (typeof confidence.overall !== 'number') {
      result.errors.push({
        field: 'insight.confidence.overall',
        message: 'Overall confidence is required',
      });
    }
    if (typeof confidence.breakdown !== 'object' || confidence.breakdown === null) {
      result.errors.push({
        field: 'insight.confidence.breakdown',
        message: 'Confidence breakdown is required',
      });
    }
  }

  // Determine final validity
  result.valid = result.errors.length === 0;

  logger.debug('Validation result', {
    request_id: requestId,
    valid: result.valid,
    error_count: result.errors.length,
    warning_count: result.warnings.length,
  });

  return result;
}

export default { validateInsight, isValidConfidence, checkForbiddenPatterns, containsMarkdown, stripMarkdown };
