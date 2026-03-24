/**
 * Insight Persistence Layer
 * Handles storage and retrieval of DailyInsight and WhyThisInsight
 * Based on State-Data-Model-v1.1.md
 */

import { logger } from '../../utils/logger';
import {
  deleteLocalTableRows,
  findLocalTableRow,
  getDatabase,
  getLocalTableRows,
  isLocalStorageDatabase,
  upsertLocalTableRow,
} from '../database';
import { InsightResponse, WhyThisInsight, FallbackReason, SCHEMA_VERSION } from './types';

/**
 * Store daily insight in database
 */
export async function storeDailyInsight(
  userId: string,
  insight: InsightResponse
): Promise<void> {
  try {
    const database = getDatabase();
    const id = crypto.randomUUID();
    const date = insight.generated_at.split('T')[0]; // Extract date from timestamp

    if (isLocalStorageDatabase(database)) {
      const existing = findLocalTableRow<Record<string, unknown>>(
        'daily_insights',
        (row) => row.user_id === userId && row.date === date
      );

      upsertLocalTableRow('daily_insights', {
        id: String(existing?.id ?? id),
        user_id: userId,
        date,
        request_id: insight.request_id,
        headline: insight.insight.headline,
        theme: insight.insight.theme,
        personal_day: insight.insight.personal_day || 0,
        personal_month: insight.insight.personal_month || 0,
        personal_year: insight.insight.personal_year || 0,
        layers: JSON.stringify(insight.insight.layers),
        confidence: JSON.stringify(insight.insight.confidence),
        metadata: JSON.stringify(insight.metadata),
        is_fallback: insight.is_fallback ? 1 : 0,
        fallback_reason: insight.fallback_reason || null,
        generated_at: insight.generated_at,
        viewed_at: existing?.viewed_at ?? null,
      });
      return;
    }

    const db = database;

    // Check if insight already exists for this date
    const existing = db
      .prepare('SELECT id FROM daily_insights WHERE user_id = ? AND date = ?')
      .get(userId, date);

    if (existing) {
      // Update existing insight
      db.prepare(
        `UPDATE daily_insights
         SET request_id = ?, headline = ?, theme = ?, layers = ?, confidence = ?,
             metadata = ?, is_fallback = ?, fallback_reason = ?, generated_at = ?
         WHERE user_id = ? AND date = ?`
      ).run(
        insight.request_id,
        insight.insight.headline,
        insight.insight.theme,
        JSON.stringify(insight.insight.layers),
        JSON.stringify(insight.insight.confidence),
        JSON.stringify(insight.metadata),
        insight.is_fallback ? 1 : 0,
        insight.fallback_reason || null,
        insight.generated_at,
        userId,
        date
      );

      logger.debug('Updated existing daily insight', {
        user_id: userId,
        date,
        insight_id: insight.request_id,
      });
    } else {
      // Insert new insight
      db.prepare(
        `INSERT INTO daily_insights
         (id, user_id, date, request_id, headline, theme, personal_day, personal_month,
          personal_year, layers, confidence, metadata, is_fallback, fallback_reason, generated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        userId,
        date,
        insight.request_id,
        insight.insight.headline,
        insight.insight.theme,
        insight.insight.personal_day || 0,
        insight.insight.personal_month || 0,
        insight.insight.personal_year || 0,
        JSON.stringify(insight.insight.layers),
        JSON.stringify(insight.insight.confidence),
        JSON.stringify(insight.metadata),
        insight.is_fallback ? 1 : 0,
        insight.fallback_reason || null,
        insight.generated_at
      );

      logger.debug('Stored new daily insight', {
        user_id: userId,
        date,
        insight_id: insight.request_id,
      });
    }
  } catch (error) {
    logger.error('Error storing daily insight', {
      user_id: userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Retrieve daily insight for a specific date
 */
export async function getDailyInsight(
  userId: string,
  date: string
): Promise<InsightResponse | null> {
  try {
    const database = getDatabase();

    if (isLocalStorageDatabase(database)) {
      const row = getLocalTableRows<Record<string, unknown>>('daily_insights')
        .filter((item) => item.user_id === userId && item.date === date)
        .sort((a, b) => String(b.generated_at ?? '').localeCompare(String(a.generated_at ?? '')))[0];

      if (!row) {
        return null;
      }

      const metadata = typeof row.metadata === 'string'
        ? JSON.parse(row.metadata)
        : row.metadata;

      const insight: InsightResponse = {
        schema_version: SCHEMA_VERSION,
        request_id: row.request_id as string,
        generated_at: row.generated_at as string,
        model: (metadata as { model?: string })?.model || 'unknown',
        insight: {
          headline: row.headline as string,
          theme: row.theme as string,
          layers: JSON.parse(row.layers as string),
          confidence: JSON.parse(row.confidence as string),
          personal_day: row.personal_day as number,
          personal_month: row.personal_month as number,
          personal_year: row.personal_year as number,
        },
        metadata: metadata as InsightResponse['metadata'],
        is_fallback: row.is_fallback === 1,
        fallback_reason: row.fallback_reason as FallbackReason | undefined,
      };

      if (!row.viewed_at) {
        upsertLocalTableRow('daily_insights', {
          ...(row as Record<string, unknown>),
          id: String(row.id),
          viewed_at: new Date().toISOString(),
        } as { id: string });
      }

      return insight;
    }

    const db = database;

    const row = db
      .prepare(
        `SELECT * FROM daily_insights
         WHERE user_id = ? AND date = ?
         ORDER BY generated_at DESC
         LIMIT 1`
      )
      .get(userId, date) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    const metadata = JSON.parse(row.metadata as string);

    // Reconstruct insight response
    const insight: InsightResponse = {
      schema_version: SCHEMA_VERSION,
      request_id: row.request_id as string,
      generated_at: row.generated_at as string,
      model: (metadata as { model?: string })?.model || 'unknown',
      insight: {
        headline: row.headline as string,
        theme: row.theme as string,
        layers: JSON.parse(row.layers as string),
        confidence: JSON.parse(row.confidence as string),
        personal_day: row.personal_day as number,
        personal_month: row.personal_month as number,
        personal_year: row.personal_year as number,
      },
      metadata: metadata as InsightResponse['metadata'],
      is_fallback: row.is_fallback === 1,
      fallback_reason: row.fallback_reason as FallbackReason | undefined,
    };

    // Mark as viewed if not already
    if (!row.viewed_at) {
      db.prepare('UPDATE daily_insights SET viewed_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        row.id
      );
    }

    return insight;
  } catch (error) {
    logger.error('Error retrieving daily insight', {
      user_id: userId,
      date,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Store Why This Insight explanation
 */
export async function storeWhyThisInsight(
  userId: string,
  insightId: string,
  whyThis: WhyThisInsight
): Promise<void> {
  try {
    const database = getDatabase();
    const id = crypto.randomUUID();

    if (isLocalStorageDatabase(database)) {
      const existing = findLocalTableRow<Record<string, unknown>>(
        'why_this_insights',
        (row) => row.insight_id === insightId
      );

      upsertLocalTableRow('why_this_insights', {
        id: String(existing?.id ?? id),
        insight_id: insightId,
        request_id: whyThis.request_id,
        data_sources: JSON.stringify(whyThis.data_sources),
        calculated_claims: JSON.stringify(whyThis.calculated_claims),
        interpretation_basis: JSON.stringify(whyThis.interpretation_basis),
        confidence_breakdown: JSON.stringify(whyThis.confidence_breakdown),
        explanation: whyThis.explanation,
        generated_at: whyThis.generated_at,
      });
      return;
    }

    const db = database;

    db.prepare(
      `INSERT INTO why_this_insights
       (id, insight_id, request_id, data_sources, calculated_claims, interpretation_basis,
        confidence_breakdown, explanation, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      insightId,
      whyThis.request_id,
      JSON.stringify(whyThis.data_sources),
      JSON.stringify(whyThis.calculated_claims),
      JSON.stringify(whyThis.interpretation_basis),
      JSON.stringify(whyThis.confidence_breakdown),
      whyThis.explanation,
      whyThis.generated_at
    );

    logger.debug('Stored Why This Insight', {
      user_id: userId,
      insight_id: insightId,
    });
  } catch (error) {
    logger.error('Error storing Why This Insight', {
      user_id: userId,
      insight_id: insightId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Retrieve Why This Insight explanation
 */
export async function getWhyThisInsight(
  insightId: string
): Promise<WhyThisInsight | null> {
  try {
    const database = getDatabase();

    if (isLocalStorageDatabase(database)) {
      const row = findLocalTableRow<Record<string, unknown>>(
        'why_this_insights',
        (item) => item.insight_id === insightId
      );

      if (!row) {
        return null;
      }

      return {
        id: row.id as string,
        insight_id: row.insight_id as string,
        request_id: row.request_id as string,
        data_sources: JSON.parse(row.data_sources as string),
        calculated_claims: JSON.parse(row.calculated_claims as string),
        interpretation_basis: JSON.parse(row.interpretation_basis as string),
        confidence_breakdown: JSON.parse(row.confidence_breakdown as string),
        explanation: (row.explanation as string) || '',
        generated_at: row.generated_at as string,
      };
    }

    const db = database;

    const row = db
      .prepare('SELECT * FROM why_this_insights WHERE insight_id = ?')
      .get(insightId) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    const whyThis: WhyThisInsight = {
      id: row.id as string,
      insight_id: row.insight_id as string,
      request_id: row.request_id as string,
      data_sources: JSON.parse(row.data_sources as string),
      calculated_claims: JSON.parse(row.calculated_claims as string),
      interpretation_basis: JSON.parse(row.interpretation_basis as string),
      confidence_breakdown: JSON.parse(row.confidence_breakdown as string),
      explanation: row.explanation as string,
      generated_at: row.generated_at as string,
    };

    return whyThis;
  } catch (error) {
    logger.error('Error retrieving Why This Insight', {
      insight_id: insightId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Store insight feedback
 */
export async function storeInsightFeedback(
  userId: string,
  insightId: string,
  rating: number,
  options: {
    was_relevant?: boolean | null;
    was_helpful?: boolean | null;
    most_useful_claim_type?: 'calculated' | 'interpreted' | 'exploratory' | null;
    tags?: string[] | null;
    feedback_text?: string | null;
  } = {}
): Promise<void> {
  try {
    const database = getDatabase();
    const id = crypto.randomUUID();

    if (isLocalStorageDatabase(database)) {
      upsertLocalTableRow('insight_feedback', {
        id,
        insight_id: insightId,
        user_id: userId,
        rating,
        was_relevant: options.was_relevant === true ? 1 : options.was_relevant === false ? 0 : null,
        was_helpful: options.was_helpful === true ? 1 : options.was_helpful === false ? 0 : null,
        most_useful_claim_type: options.most_useful_claim_type || null,
        tags: options.tags ? JSON.stringify(options.tags) : null,
        feedback_text: options.feedback_text || null,
        created_at: new Date().toISOString(),
      });
      return;
    }

    const db = database;

    db.prepare(
      `INSERT INTO insight_feedback
       (id, insight_id, user_id, rating, was_relevant, was_helpful, most_useful_claim_type, tags, feedback_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      insightId,
      userId,
      rating,
      options.was_relevant === true ? 1 : options.was_relevant === false ? 0 : null,
      options.was_helpful === true ? 1 : options.was_helpful === false ? 0 : null,
      options.most_useful_claim_type || null,
      options.tags ? JSON.stringify(options.tags) : null,
      options.feedback_text || null,
      new Date().toISOString()
    );

    logger.debug('Stored insight feedback', {
      user_id: userId,
      insight_id: insightId,
      rating,
    });
  } catch (error) {
    logger.error('Error storing insight feedback', {
      user_id: userId,
      insight_id: insightId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Delete old insights (90+ days)
 */
export function cleanupOldInsights(): number {
  try {
    const database = getDatabase();

    if (isLocalStorageDatabase(database)) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffIso = cutoff.toISOString();
      return deleteLocalTableRows<Record<string, unknown>>(
        'daily_insights',
        (row) => String(row.generated_at ?? '') < cutoffIso
      );
    }

    const db = database;

    // Delete old insights
    const result = db
      .prepare(
        `DELETE FROM daily_insights
         WHERE generated_at < datetime('now', '-90 days')`
      )
      .run();

    // Cascade delete orphans (handled by foreign key constraints)
    logger.info('Cleaned up old insights', { deleted_count: result.changes });

    return result.changes;
  } catch (error) {
    logger.error('Error cleaning up old insights', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

export default {
  storeDailyInsight,
  getDailyInsight,
  storeWhyThisInsight,
  getWhyThisInsight,
  storeInsightFeedback,
  cleanupOldInsights,
};
