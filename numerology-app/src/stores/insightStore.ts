/**
 * Insight Store
 * Manages daily insight state
 *
 * Phase 5: Real feedback persistence implementation
 */

import { create } from 'zustand';
import { DailyInsight, CreateInsightFeedbackInput } from '@/types';
import { dbQuery } from '@services/database';
import { storeInsightFeedback } from '@services/insight/persistence';
import { useUserStore } from './userStore';

interface InsightState {
  // State
  todayInsight: DailyInsight | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayInsight: (userId: string) => Promise<void>;
  submitFeedback: (input: CreateInsightFeedbackInput) => Promise<void>;
  clearError: () => void;
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
      const today = new Date().toISOString().split('T')[0];

      const insight = dbQuery.get<DailyInsight>(
        `SELECT * FROM daily_insights WHERE user_id = ? AND date = ?`,
        [userId, today]
      );

      // Parse JSON fields
      if (insight) {
        insight.layers = typeof insight.layers === 'string'
          ? JSON.parse(insight.layers)
          : insight.layers;
        insight.confidence = typeof insight.confidence === 'string'
          ? JSON.parse(insight.confidence)
          : insight.confidence;
        insight.metadata = typeof insight.metadata === 'string'
          ? JSON.parse(insight.metadata)
          : insight.metadata;
      }

      set({ todayInsight: insight || null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load insight', isLoading: false });
      console.error('Failed to load insight:', error);
    }
  },

  // Submit feedback for an insight - real persistence
  submitFeedback: async (input: CreateInsightFeedbackInput) => {
    try {
      const { profile } = useUserStore();
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
