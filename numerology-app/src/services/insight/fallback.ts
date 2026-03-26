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
  InsightPresentationBlocks,
} from './types';
import {
  deleteLocalTableRows,
  getDatabase,
  getLocalTableRows,
  isLocalStorageDatabase,
  replaceLocalTableRows,
  upsertLocalTableRow,
} from '../database';
import { getCurrentDateISO } from '@utils/date';

const PERSONAL_DAY_MEANINGS_VI: Record<number, string> = {
  1: 'khởi đầu mới và chủ động mở đường',
  2: 'hợp tác, lắng nghe và giữ cân bằng',
  3: 'biểu đạt, sáng tạo và giao tiếp',
  4: 'xây nền, tổ chức và đi từng bước vững vàng',
  5: 'linh hoạt, thay đổi và dịch chuyển',
  6: 'trách nhiệm, chăm sóc và gắn kết',
  7: 'chiêm nghiệm, quan sát và lùi lại để hiểu sâu hơn',
  8: 'tham vọng, hiệu quả và năng lực thực thi',
  9: 'khép lại, hoàn thiện và buông điều không còn phù hợp',
  11: 'trực giác, cảm hứng và nhận biết tinh tế',
  22: 'xây dựng dài hạn và biến ý tưởng lớn thành cấu trúc thực tế',
  33: 'cho đi, dẫn dắt và nâng đỡ người khác',
};

const PERSONAL_DAY_THEMES_VI: Record<number, string> = {
  1: 'Mở đường mới',
  2: 'Giữ nhịp hài hòa',
  3: 'Nói ra điều mình nghĩ',
  4: 'Giữ nền cho vững',
  5: 'Đổi nhịp linh hoạt',
  6: 'Nghiêng về chăm sóc',
  7: 'Lùi lại để nhìn rõ',
  8: 'Đẩy việc cho ra kết quả',
  9: 'Khép lại điều đã đủ',
  11: 'Lắng nghe trực giác',
  22: 'Biến ý tưởng thành hình',
  33: 'Dẫn dắt bằng sự nâng đỡ',
};

function createFallbackPresentation(
  personalDay: number,
  isVietnamese: boolean,
  themeMeaningVi: string,
  themeLabelVi: string,
  themeMeaningEn: string,
  themeLabelEn: string
): InsightPresentationBlocks {
  const label = isVietnamese ? themeLabelVi : themeLabelEn;
  const meaning = isVietnamese ? themeMeaningVi : themeMeaningEn;

  return {
    visual_scene: {
      atmosphere: isVietnamese
        ? `Nhịp ${label.toLowerCase()} mở ra`
        : `${label} sets the tone`,
      movement: isVietnamese
        ? `dịch chuyển quanh ${meaning}`
        : `movement around ${meaning.toLowerCase()}`,
      focal_point: isVietnamese
        ? `giữ mắt ở ${meaning}`
        : `keep the focus on ${meaning.toLowerCase()}`,
    },
    energy_map: [
      {
        label: isVietnamese ? 'Nhịp chính' : 'Primary current',
        intensity: 4,
        meaning: isVietnamese
          ? `Ngày ${personalDay} thường nhấn vào ${themeMeaningVi}.`
          : `Personal Day ${personalDay} usually emphasizes ${themeMeaningEn.toLowerCase()}.`,
      },
      {
        label: isVietnamese ? 'Độ mở' : 'Openness',
        intensity: personalDay === 4 || personalDay === 7 ? 2 : 3,
        meaning: isVietnamese
          ? 'Hãy xem đây là một gợi ý để quan sát nhịp của ngày, không phải một kết luận cứng.'
          : 'Treat this as a directional reading rather than a rigid conclusion.',
      },
      {
        label: isVietnamese ? 'Điểm tựa' : 'Anchor',
        intensity: 3,
        meaning: isVietnamese
          ? 'Giữ một điểm tựa thực tế sẽ giúp bản đọc fallback vẫn hữu ích hơn.'
          : 'A practical anchor will make this fallback reading more useful.',
      },
    ],
    decision_compass: {
      lean_in: isVietnamese ? `nghiêng về ${themeMeaningVi}` : `lean toward ${themeMeaningEn.toLowerCase()}`,
      hold_steady: isVietnamese ? 'giữ kỳ vọng vừa phải' : 'keep expectations measured',
      avoid_force: isVietnamese ? 'đừng ép mọi thứ thành kết luận lớn' : 'do not force a grand conclusion',
    },
    practical_guidance: [
      {
        area: 'micro_action',
        title: isVietnamese ? 'Một việc nhỏ' : 'Small move',
        suggestion: isVietnamese
          ? `Chọn một việc rất nhỏ phản ánh nhịp ${themeLabelVi.toLowerCase()} và làm nó ngay đầu ngày.`
          : `Pick one small action that reflects the ${themeLabelEn.toLowerCase()} tone and do it early.`,
        timing: isVietnamese ? 'ngay đầu ngày' : 'early in the day',
      },
      {
        area: 'work',
        title: isVietnamese ? 'Trong công việc' : 'At work',
        suggestion: isVietnamese
          ? 'Ưu tiên một đầu việc hợp với nhịp của ngày thay vì dàn trải quá nhiều hướng cùng lúc.'
          : 'Prioritize one task that fits the day instead of scattering energy across too many directions.',
        timing: isVietnamese ? 'khi bắt đầu guồng việc' : 'when work begins',
      },
      {
        area: 'relationships',
        title: isVietnamese ? 'Trong quan hệ' : 'In relationships',
        suggestion: isVietnamese
          ? 'Nếu cần trao đổi, hãy nói ngắn gọn điều bạn đang cần thay vì đợi người khác tự đoán.'
          : 'If a conversation matters today, state what you need plainly instead of waiting to be guessed.',
        timing: isVietnamese ? 'trong một cuộc trao đổi ngắn' : 'in a short conversation',
      },
      {
        area: 'self_regulation',
        title: isVietnamese ? 'Giữ nhịp cho mình' : 'Regulate yourself',
        suggestion: isVietnamese
          ? 'Trước khi kết luận quá nhanh, dừng lại một nhịp để xem cảm giác hiện tại có đang đẩy bạn đi quá xa không.'
          : 'Before drawing a big conclusion, pause long enough to see whether the current mood is pushing too far.',
        timing: isVietnamese ? 'khi thấy mình bắt đầu vội' : 'when you start to rush',
      },
    ],
    narrative_beats: [
      {
        title: isVietnamese ? 'Nhịp chính' : 'Primary rhythm',
        summary: isVietnamese
          ? `Ngày ${personalDay} đang gợi một nhịp xoay quanh ${themeMeaningVi}.`
          : `Personal Day ${personalDay} points toward ${themeMeaningEn.toLowerCase()}.`,
      },
      {
        title: isVietnamese ? 'Cách dùng' : 'How to use it',
        summary: isVietnamese
          ? 'Hãy dùng bản fallback này như một điểm soi nhanh trước khi có bản luận giải đầy đủ hơn.'
          : 'Use this fallback as a quick orienting note until a fuller reading is available.',
      },
    ],
    closing_signal: {
      title: isVietnamese ? 'Điểm mang theo' : 'Carry this',
      phrase: isVietnamese
        ? `Giữ nhịp ${label.toLowerCase()} vừa đủ để quan sát ngày hôm nay rõ hơn.`
        : `Carry the ${label.toLowerCase()} tone lightly through today.`,
    },
  };
}

/**
 * Retrieve cached insight from fallback cache
 */
export async function getCachedInsight(
  userId: string,
  currentDate: string
): Promise<InsightResponse | null> {
  try {
    const database = getDatabase();

    if (isLocalStorageDatabase(database)) {
      const cached = getLocalTableRows<Record<string, unknown>>('fallback_cache')
        .filter((row) => row.user_id === userId && String(row.original_date ?? '') < currentDate)
        .sort((a, b) => String(b.original_date ?? '').localeCompare(String(a.original_date ?? '')))[0];

      if (!cached) {
        logger.debug('No cached insight available', { user_id: userId });
        return null;
      }

      const insight = JSON.parse(cached.insight_json as string) as InsightResponse;
      insight.is_fallback = true;
      insight.fallback_reason = 'no_cache';

      const updatedRows = getLocalTableRows<Record<string, unknown>>('fallback_cache').map((row) => (
        row.user_id === userId && row.original_date === cached.original_date
          ? {
              ...row,
              times_used: Number(row.times_used ?? 0) + 1,
              last_used_at: new Date().toISOString(),
            }
          : row
      ));
      replaceLocalTableRows('fallback_cache', updatedRows);

      logger.info('Retrieved cached insight for fallback', {
        user_id: userId,
        original_date: cached.original_date,
        times_used: Number(cached.times_used ?? 0) + 1,
      });

      return insight;
    }

    const db = database;

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
    const database = getDatabase();
    const insightId = crypto.randomUUID();

    if (isLocalStorageDatabase(database)) {
      upsertLocalTableRow('fallback_cache', {
        id: insightId,
        user_id: userId,
        insight_id: insight.request_id,
        original_date: insight.generated_at.split('T')[0],
        insight_json: JSON.stringify(insight),
        personal_day: insight.insight.personal_day,
        times_used: 0,
        created_at: new Date().toISOString(),
        last_used_at: null,
      });
      return;
    }

    const db = database;

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
  reason: FallbackReason,
  language: 'vi' | 'en' = 'en'
): InsightResponse {
  const theme = PERSONAL_DAY_THEMES[personalDay] || PERSONAL_DAY_THEMES[9];
  const themeMeaningVi = PERSONAL_DAY_MEANINGS_VI[personalDay] || PERSONAL_DAY_MEANINGS_VI[9];
  const themeVi = PERSONAL_DAY_THEMES_VI[personalDay] || PERSONAL_DAY_THEMES_VI[9];
  const isVietnamese = language === 'vi';

  const calculatedClaim: Claim = {
    type: 'calculated',
    text: isVietnamese
      ? `[Calculated] Hôm nay là Ngày cá nhân ${personalDay}.`
      : `[Calculated] Today is Personal Day ${personalDay}.`,
    confidence: 1.0,
    source: 'numerology_calculation',
  };

  const interpretedClaim: Claim = {
    type: 'interpreted',
    text: isVietnamese
      ? `[Interpreted] Năng lượng hôm nay thường gợi ý ${themeMeaningVi}.`
      : `[Interpreted] ${theme.meaning}.`,
    confidence: 0.6,
    source: 'fallback_template',
  };

  const now = new Date().toISOString();
  const presentation = createFallbackPresentation(
    personalDay,
    isVietnamese,
    themeMeaningVi,
    themeVi,
    theme.meaning,
    theme.theme
  );

  const response: InsightResponse = {
    schema_version: SCHEMA_VERSION,
    request_id: requestId,
    generated_at: now,
    model: 'fallback',
    insight: {
      headline: isVietnamese
        ? `Ngày ${personalDay} gợi nhắc bạn ${themeMeaningVi}`
        : `Your Personal Day ${personalDay} Theme`,
      theme: isVietnamese ? themeVi : theme.theme,
      layers: {
        quick: {
          content: isVietnamese
            ? `[Calculated] Hôm nay là Ngày cá nhân ${personalDay}. [Interpreted] Nhịp ngày này thường gợi bạn ${themeMeaningVi}.`
            : `[Calculated] Today is Personal Day ${personalDay}. [Interpreted] This day often supports ${theme.meaning.toLowerCase()}.`,
          claims: [calculatedClaim, interpretedClaim],
        },
        standard: {
          content: isVietnamese
            ? `[Calculated] Hôm nay là Ngày cá nhân ${personalDay}.\n\n[Interpreted] Nhịp ngày này thường gắn với ${themeMeaningVi}. Bạn có thể ưu tiên những việc hợp với nhịp đó, đồng thời giữ kỳ vọng vừa phải để quan sát xem ngày hôm nay mở ra theo hướng nào.\n\nLưu ý: Khi kết nối AI sẵn sàng, app sẽ tạo bản luận giải cá nhân hóa đầy đủ hơn cho bạn.`
            : `[Calculated] Today is Personal Day ${personalDay}.\n\n[Interpreted] Personal Day ${personalDay} is associated with ${theme.meaning.toLowerCase()}. You might consider reviewing any relevant activities or projects today.\n\nNote: A more personalized insight will be available tomorrow.`,
          claims: [calculatedClaim, interpretedClaim],
        },
      },
      presentation,
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
  reason: FallbackReason,
  language: 'vi' | 'en' = 'en'
): Promise<InsightResponse> {
  logger.info('Initiating fallback pipeline', {
    user_id: userId,
    request_id: requestId,
    reason,
    personal_day: personalDay,
  });

  // Try cached insight first (primary fallback)
  const cached = await getCachedInsight(userId, getCurrentDateISO());

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

  return generateGenericFallback(personalDay, requestId, reason, language);
}

/**
 * Clean up old fallback cache entries (7+ days)
 */
export function cleanupFallbackCache(): number {
  try {
    const database = getDatabase();

    if (isLocalStorageDatabase(database)) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffIso = cutoff.toISOString();
      return deleteLocalTableRows<Record<string, unknown>>(
        'fallback_cache',
        (row) => String(row.created_at ?? '') < cutoffIso
      );
    }

    const db = database;
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
