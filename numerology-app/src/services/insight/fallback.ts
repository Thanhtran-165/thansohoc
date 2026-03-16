/**
 * Fallback Pipeline
 * Two-tier fallback system: cached insight → generic numerology-only
 * Based on Prompt-Output-Contract-v1.2.md
 */

import { logger } from '../../utils/logger';
import {
  InsightResponse,
  FallbackReason,
  PERSONAL_DAY_THEMES,
  FALLBACK_PROMPT_VERSION,
  SCHEMA_VERSION,
  Claim,
} from './types';
import { getDatabase } from '../database';

/**
 * Retrieve cached insight from fallback cache
 */
export async function getCachedInsight(
  userId: string,
  currentDate: string
): Promise<InsightResponse | null> {
  try {
    const db = getDatabase();

    // Try to get the most recent cached insight (not from today)
    const cached = db
      .prepare(
        `SELECT insight_json, original_date, personal_day, times_used
         FROM fallback_cache
         WHERE user_id = ? AND original_date < ?
         ORDER BY original_date DESC
         LIMIT 1`
      )
      .get(userId, currentDate) as {
        insight_json: string;
        original_date: string;
        personal_day: number;
        times_used: number;
      } | undefined;

    if (!cached) {
      logger.debug('No cached insight available', { user_id: userId });
      return null;
    }

    // Parse cached insight
    const insight = JSON.parse(cached.insight_json) as InsightResponse;

    // Mark as fallback
    insight.is_fallback = true;
    insight.fallback_reason = 'no_cache';

    // Update usage count
    db.prepare(
      `UPDATE fallback_cache
       SET times_used = times_used + 1, last_used_at = ?
       WHERE user_id = ? AND original_date = ?`
    ).run(new Date().toISOString(), userId, cached.original_date);

    logger.info('Retrieved cached insight for fallback', {
      user_id: userId,
      original_date: cached.original_date,
      times_used: cached.times_used + 1,
    });

    return insight;
  } catch (error) {
    logger.error('Error retrieving cached insight', {
      user_id: userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Store insight in fallback cache
 */
export async function cacheInsight(
  userId: string,
  insight: InsightResponse
): Promise<void> {
  try {
    const db = getDatabase();
    const insightId = crypto.randomUUID();

    db.prepare(
      `INSERT INTO fallback_cache
       (id, user_id, insight_id, original_date, insight_json, personal_day, times_used, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(
      insightId,
      userId,
      insight.request_id,
      insight.generated_at.split('T')[0], // Extract date from timestamp
      JSON.stringify(insight),
      insight.insight.personal_day,
      new Date().toISOString()
    );

    logger.debug('Cached insight for fallback', {
      user_id: userId,
      insight_id: insight.request_id,
    });
  } catch (error) {
    logger.error('Error caching insight', {
      user_id: userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Generate generic fallback insight
 * Used when no cached insight is available
 */
export function generateGenericFallback(
  personalDay: number,
  requestId: string,
  reason: FallbackReason
): InsightResponse {
  const theme = PERSONAL_DAY_THEMES[personalDay] || PERSONAL_DAY_THEMES[9];

  const calculatedClaim: Claim = {
    type: 'calculated',
    text: `[Calculated] Today is Personal Day ${personalDay}.`,
    confidence: 1.0,
    source: 'numerology_calculation',
  };

  const interpretedClaim: Claim = {
    type: 'interpreted',
    text: `[Interpreted] ${theme.meaning}.`,
    confidence: 0.6,
    source: 'fallback_template',
  };

  const now = new Date().toISOString();

  const response: InsightResponse = {
    schema_version: SCHEMA_VERSION,
    request_id: requestId,
    generated_at: now,
    model: 'fallback',
    insight: {
      headline: `Your Personal Day ${personalDay} Theme`,
      theme: theme.theme,
      layers: {
        quick: {
          content: `[Calculated] Today is Personal Day ${personalDay}. [Interpreted] This day often supports ${theme.meaning.toLowerCase()}.`,
          claims: [calculatedClaim, interpretedClaim],
        },
        standard: {
          content: `[Calculated] Today is Personal Day ${personalDay}.\n\n[Interpreted] Personal Day ${personalDay} is associated with ${theme.meaning.toLowerCase()}. You might consider reviewing any relevant activities or projects today.\n\nNote: A more personalized insight will be available tomorrow.`,
          claims: [calculatedClaim, interpretedClaim],
        },
      },
      confidence: {
        overall: 0.7,
        breakdown: {
          calculated: 1.0,
          interpreted: 0.6,
        },
      },
    },
    metadata: {
      schema_version: SCHEMA_VERSION,
      prompt_version: FALLBACK_PROMPT_VERSION,
      model: 'fallback',
      claim_types_used: ['calculated', 'interpreted'],
      word_counts: {
        quick: 20,
        standard: 65,
      },
      processing_time_ms: 0,
    },
    is_fallback: true,
    fallback_reason: reason,
  };

  logger.info('Generated generic fallback insight', {
    request_id: requestId,
    personal_day: personalDay,
    fallback_reason: reason,
  });

  return response;
}

/**
 * Two-tier fallback pipeline
 * 1. Try cached insight
 * 2. Fall back to generic template
 */
export async function getFallbackInsight(
  userId: string,
  personalDay: number,
  requestId: string,
  reason: FallbackReason
): Promise<InsightResponse> {
  logger.info('Initiating fallback pipeline', {
    user_id: userId,
    request_id: requestId,
    reason,
    personal_day: personalDay,
  });

  // Try cached insight first (primary fallback)
  const cached = await getCachedInsight(userId, new Date().toISOString().split('T')[0]);

  if (cached) {
    logger.info('Using cached insight as fallback', {
      user_id: userId,
      request_id: requestId,
      cached_date: cached.generated_at,
    });
    return cached;
  }

  // Fall back to generic template (secondary fallback)
  logger.info('No cached insight, using generic fallback', {
    user_id: userId,
    request_id: requestId,
    personal_day: personalDay,
  });

  return generateGenericFallback(personalDay, requestId, reason);
}

/**
 * Clean up old fallback cache entries (7+ days)
 */
export function cleanupFallbackCache(): number {
  try {
    const db = getDatabase();
    const result = db
      .prepare(
        `DELETE FROM fallback_cache
         WHERE created_at < datetime('now', '-7 days')`
      )
      .run();

    if (result.changes > 0) {
      logger.info('Cleaned up fallback cache', { deleted_count: result.changes });
    }

    return result.changes;
  } catch (error) {
    logger.error('Error cleaning up fallback cache', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

export default {
  getCachedInsight,
  cacheInsight,
  generateGenericFallback,
  getFallbackInsight,
  cleanupFallbackCache,
};
