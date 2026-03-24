import {
  AnalyticsEventName,
  DailyInsight,
  JournalEntry,
  PracticeHistoryDay,
  PracticeSummary,
  RecentPracticeContext,
} from '@/types';
import { dbQuery } from '@services/database';
import { getAnalyticsCounts } from '@services/analytics';

function parseInsightRecord(insight: DailyInsight): DailyInsight {
  return {
    ...insight,
    layers: typeof insight.layers === 'string' ? JSON.parse(insight.layers) : insight.layers,
    confidence: typeof insight.confidence === 'string' ? JSON.parse(insight.confidence) : insight.confidence,
    metadata: typeof insight.metadata === 'string' ? JSON.parse(insight.metadata) : insight.metadata,
  };
}

function parseJournalRecord(entry: JournalEntry): JournalEntry {
  return {
    ...entry,
    emotions: typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions,
    key_events: typeof entry.key_events === 'string' ? JSON.parse(entry.key_events) : entry.key_events,
  };
}

export function getRecentInsights(userId: string, limit = 30): DailyInsight[] {
  return dbQuery
    .all<DailyInsight>(
      `SELECT * FROM daily_insights WHERE user_id = ? ORDER BY date DESC LIMIT ${limit}`,
      [userId]
    )
    .map(parseInsightRecord);
}

export function getRecentJournalEntries(userId: string, limit = 30): JournalEntry[] {
  return dbQuery
    .all<JournalEntry>(
      `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC LIMIT ${limit}`,
      [userId]
    )
    .map(parseJournalRecord);
}

function buildReportDates(insights: DailyInsight[]): string[] {
  return Array.from(new Set(insights.map((insight) => insight.date))).sort((a, b) => b.localeCompare(a));
}

function stripClaimMarkers(content: string): string {
  return content.replace(/\[(Calculated|Interpreted|Exploratory)\]\s*/g, '').trim();
}

function calculateStreaks(activeDates: string[]): {
  current: number;
  longest: number;
} {
  if (activeDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const ordered = [...activeDates].sort((a, b) => a.localeCompare(b));
  let longest = 1;
  let currentRun = 1;

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = new Date(`${ordered[index - 1]}T00:00:00`);
    const current = new Date(`${ordered[index]}T00:00:00`);
    const diffDays = Math.round((current.getTime() - previous.getTime()) / 86400000);

    if (diffDays === 1) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  let current = 0;
  const activeSet = new Set(activeDates);

  while (activeSet.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

export function getPracticeHistory(
  userId: string,
  limit = 21
): PracticeHistoryDay[] {
  const insights = getRecentInsights(userId, limit);
  const entries = getRecentJournalEntries(userId, limit);
  const insightMap = new Map(insights.map((insight) => [insight.date, insight]));
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]));
  const dates = Array.from(new Set([...insightMap.keys()])).sort((a, b) => b.localeCompare(a)).slice(0, limit);

  return dates.map((date) => {
    const insight = insightMap.get(date);
    const entry = entryMap.get(date);

    return {
      date,
      insight_headline: insight?.headline ?? null,
      insight_theme: insight?.theme ?? null,
      quick_summary: insight ? stripClaimMarkers(insight.layers.quick.content) : null,
      personal_day: insight?.personal_day ?? null,
      personal_month: insight?.personal_month ?? null,
      personal_year: insight?.personal_year ?? null,
      is_read: Boolean(insight?.viewed_at),
      has_private_note: Boolean(entry),
      note_excerpt: entry?.reflection_text ?? null,
      is_fallback: insight?.is_fallback ?? false,
    };
  });
}

export function getPracticeSummary(userId: string): PracticeSummary {
  const insights = getRecentInsights(userId, 30);
  const history = getPracticeHistory(userId, 30);
  const last7Days = history.slice(0, 7);
  const reportDates = buildReportDates(insights);
  const streaks = calculateStreaks(reportDates);
  const last7ReportDays = last7Days.length;
  const last7ViewedDays = last7Days.filter((day) => day.is_read).length;
  const themeCounts = last7Days
    .map((day) => day.insight_theme)
    .filter((theme): theme is string => Boolean(theme))
    .reduce<Record<string, number>>((counts, theme) => {
      counts[theme] = (counts[theme] || 0) + 1;
      return counts;
    }, {});
  const recurringThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 3);

  return {
    current_streak: streaks.current,
    longest_streak: streaks.longest,
    report_days_last_7: last7ReportDays,
    report_coverage_last_7: Math.round((last7ReportDays / 7) * 100),
    viewed_days_last_7: last7ViewedDays,
    viewed_rate_last_7: Math.round((last7ViewedDays / Math.max(last7ReportDays, 1)) * 100),
    weekly_recap: {
      report_days: last7ReportDays,
      viewed_days: last7ViewedDays,
      dominant_theme: Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      latest_headline: last7Days[0]?.insight_headline ?? null,
      recurring_themes: recurringThemes,
    },
  };
}

export function getRecentPracticeContext(userId: string): RecentPracticeContext {
  const insights = getRecentInsights(userId, 7);
  const summary = getPracticeSummary(userId);

  return {
    current_streak: summary.current_streak,
    report_days_last_7: summary.report_days_last_7,
    viewed_days_last_7: summary.viewed_days_last_7,
    previous_insight: insights[0]
      ? {
          date: insights[0].date,
          headline: insights[0].headline,
          theme: insights[0].theme,
        }
      : null,
    recent_themes: Array.from(new Set(insights.map((insight) => insight.theme))).slice(0, 3),
    recent_headlines: Array.from(new Set(insights.map((insight) => insight.headline))).slice(0, 3),
  };
}

export function getEngagementHighlights(userId: string): Array<{
  label: string;
  event: AnalyticsEventName;
  value: number;
}> {
  const counts = getAnalyticsCounts(userId, 7);

  return [
    { label: 'Mở app', event: 'app_opened', value: counts.app_opened },
    { label: 'Mở báo cáo', event: 'insight_viewed', value: counts.insight_viewed },
    { label: 'Báo cáo được tạo', event: 'insight_generated', value: counts.insight_generated },
    { label: 'Nhận thông báo', event: 'notification_sent', value: counts.notification_sent },
  ];
}
