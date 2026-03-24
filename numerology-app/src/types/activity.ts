export type AnalyticsEventName =
  | 'app_opened'
  | 'screen_view'
  | 'onboarding_completed'
  | 'insight_generated'
  | 'insight_viewed'
  | 'journal_saved'
  | 'settings_updated'
  | 'notification_sent';

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  name: AnalyticsEventName;
  screen: string | null;
  payload: Record<string, unknown> | null;
  occurred_on: string;
  created_at: string;
}

export interface WeeklyRecap {
  report_days: number;
  viewed_days: number;
  dominant_theme: string | null;
  latest_headline: string | null;
  recurring_themes: string[];
}

export interface PracticeHistoryDay {
  date: string;
  insight_headline: string | null;
  insight_theme: string | null;
  quick_summary: string | null;
  personal_day: number | null;
  personal_month: number | null;
  personal_year: number | null;
  is_read: boolean;
  has_private_note: boolean;
  note_excerpt: string | null;
  is_fallback: boolean;
}

export interface PracticeSummary {
  current_streak: number;
  longest_streak: number;
  report_days_last_7: number;
  report_coverage_last_7: number;
  viewed_days_last_7: number;
  viewed_rate_last_7: number;
  weekly_recap: WeeklyRecap;
}

export interface RecentPracticeContext {
  current_streak: number;
  report_days_last_7: number;
  viewed_days_last_7: number;
  previous_insight: {
    date: string;
    headline: string;
    theme: string;
  } | null;
  recent_themes: string[];
  recent_headlines: string[];
}
