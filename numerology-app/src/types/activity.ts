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

export interface PracticeSummary {
  current_streak: number;
  report_days_last_7: number;
  report_coverage_last_7: number;
  viewed_days_last_7: number;
  viewed_rate_last_7: number;
  dominant_theme_last_7: string | null;
  report_days_last_30: number;
  report_coverage_last_30: number;
  viewed_days_last_30: number;
  viewed_rate_last_30: number;
  dominant_theme_last_30: string | null;
}

export interface WeeklyNumerologyArc {
  range_label: string;
  title: string;
  summary: string;
  personal_month: number;
  personal_year: number;
  opening_number: number;
  pivot_number: number;
  closing_number: number;
  recurring_numbers: number[];
  daily_numbers: Array<{
    date: string;
    label: string;
    personal_day: number;
  }>;
}

export interface MonthlyNumerologyArc {
  range_label: string;
  title: string;
  summary: string;
  personal_month: number;
  personal_year: number;
  month_theme: string;
  dominant_week_theme: string;
  weekly_highlights: Array<{
    label: string;
    personal_day: number;
    summary: string;
  }>;
}

export interface RecentPracticeContext {
  current_streak: number;
  report_days_last_7: number;
  viewed_days_last_7: number;
  report_days_last_30: number;
  viewed_days_last_30: number;
  previous_insight: {
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
}
