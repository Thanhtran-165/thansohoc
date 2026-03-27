/**
 * Insight Store
 * Manages daily insight state
 *
 * Phase 5: Real feedback persistence implementation
 */

import { create } from 'zustand';
import { DailyInsight, CreateInsightFeedbackInput, UserProfile } from '@/types';
import { dbQuery } from '@services/database';
import { storeInsightFeedback } from '@services/insight/persistence';
import { InsightService } from '@services/insight';
import { PROMPT_VERSION } from '@services/insight/types';
import { useUserStore } from './userStore';
import { getCurrentDateISO } from '@utils/date';

interface InsightState {
  // State
  todayInsight: DailyInsight | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayInsight: (userId: string) => Promise<void>;
  ensureTodayInsight: (profile: UserProfile) => Promise<void>;
  regenerateTodayInsight: (profile: UserProfile) => Promise<void>;
  submitFeedback: (input: CreateInsightFeedbackInput) => Promise<void>;
  clearError: () => void;
}

function shouldRegenerateExistingInsight(
  insight: DailyInsight,
  profile: UserProfile
): boolean {
  const quickContent = typeof insight.layers === 'string'
    ? JSON.parse(insight.layers).quick?.content ?? ''
    : insight.layers.quick?.content ?? '';

  const hasLegacyEnglishFallback =
    profile.language === 'vi' &&
    (
      insight.headline.startsWith('Your Personal Day') ||
      String(quickContent).includes('Today is Personal Day')
    );

  const hasInvalidCycleNumbers =
    insight.personal_day === 0 || insight.personal_month === 0 || insight.personal_year === 0;

  const hasMissingDeepLayer =
    !(typeof insight.layers === 'string'
      ? JSON.parse(insight.layers).deep
      : insight.layers.deep);

  const metadata = typeof insight.metadata === 'string'
    ? JSON.parse(insight.metadata)
    : insight.metadata;

  const hasOutdatedMethodology =
    (metadata as { prompt_version?: string } | null)?.prompt_version !== PROMPT_VERSION;

  return Boolean(
    hasInvalidCycleNumbers ||
    (insight.is_fallback && hasLegacyEnglishFallback) ||
    hasMissingDeepLayer ||
    hasOutdatedMethodology
  );
}

function parseInsightRecord(insight: DailyInsight | null): DailyInsight | null {
  if (!insight) return null;

  const metadata = typeof insight.metadata === 'string'
    ? JSON.parse(insight.metadata)
    : insight.metadata;

  insight.layers = typeof insight.layers === 'string'
    ? JSON.parse(insight.layers)
    : insight.layers;
  insight.confidence = typeof insight.confidence === 'string'
    ? JSON.parse(insight.confidence)
    : insight.confidence;
  insight.metadata = metadata;
  const fallbackValue = insight.is_fallback as unknown;
  insight.is_fallback =
    fallbackValue === true ||
    fallbackValue === 1 ||
    fallbackValue === '1';
  insight.presentation = insight.presentation
    ?? (metadata as { presentation?: DailyInsight['presentation'] } | null)?.presentation;

  return insight;
}

async function generateAndLoadInsight(
  profile: UserProfile,
  force: boolean
): Promise<DailyInsight | null> {
  const service = new InsightService();
  await service.generateDailyInsight({
    userId: profile.id,
    fullName: profile.full_name,
    currentName: profile.current_name,
    dateOfBirth: profile.date_of_birth,
    stylePreference: profile.style_preference,
    insightLength: 'detailed',
    language: profile.language === 'en' ? 'vi' : profile.language,
    force,
    date: getCurrentDateISO(),
  });

  const insight = dbQuery.get<DailyInsight>(
    `SELECT * FROM daily_insights WHERE user_id = ? AND date = ?`,
    [profile.id, getCurrentDateISO()]
  );

  return parseInsightRecord(insight || null);
}

export const useInsightStore = create<InsightState>((set, get) => ({
  // Initial state
  todayInsight: null,
  isLoading: false,
  error: null,

  // Load today's insight
  loadTodayInsight: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const today = getCurrentDateISO();

      const insight = dbQuery.get<DailyInsight>(
        `SELECT * FROM daily_insights WHERE user_id = ? AND date = ?`,
        [userId, today]
      );
      const parsedInsight = parseInsightRecord(insight || null);

      if (parsedInsight && !parsedInsight.viewed_at) {
        const viewedAt = new Date().toISOString();
        dbQuery.run(
          `UPDATE daily_insights SET viewed_at = ? WHERE id = ?`,
          [viewedAt, parsedInsight.id]
        );
        parsedInsight.viewed_at = viewedAt;
      }

      set({ todayInsight: parsedInsight, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load insight', isLoading: false });
      console.error('Failed to load insight:', error);
    }
  },

  ensureTodayInsight: async (profile: UserProfile) => {
    set({ isLoading: true, error: null });

    try {
      await get().loadTodayInsight(profile.id);
      const existingInsight = get().todayInsight;
      if (existingInsight && !shouldRegenerateExistingInsight(existingInsight, profile)) {
        return;
      }

      const generatedInsight = await generateAndLoadInsight(profile, Boolean(existingInsight));
      set({ todayInsight: generatedInsight, isLoading: false });
    } catch (error) {
      console.error('Failed to ensure today insight:', error);
      set({
        error: 'Failed to generate daily insight',
        isLoading: false,
      });
    }
  },

  regenerateTodayInsight: async (profile: UserProfile) => {
    set({ isLoading: true, error: null });

    try {
      const generatedInsight = await generateAndLoadInsight(profile, true);
      set({ todayInsight: generatedInsight, isLoading: false });
    } catch (error) {
      console.error('Failed to regenerate today insight:', error);
      set({
        error: 'Failed to regenerate daily insight',
        isLoading: false,
      });
    }
  },

  // Submit feedback for an insight - real persistence
  submitFeedback: async (input: CreateInsightFeedbackInput) => {
    try {
      const { profile } = useUserStore.getState();
      if (!profile?.id) {
        throw new Error('Cannot submit feedback - no user profile');
      }

      // Get the insight to verify it exists
      const insight = get().todayInsight;
      if (!insight) {
        throw new Error('Cannot submit feedback - no insight loaded');
      }

      // Store feedback using the persistence layer
      await storeInsightFeedback(profile.id, input.insight_id, input.rating, {
        was_relevant: input.was_relevant ?? null,
        was_helpful: input.was_helpful ?? null,
        most_useful_claim_type: input.most_useful_claim_type ?? null,
        tags: input.tags ?? null,
        feedback_text: input.feedback_text || null,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
