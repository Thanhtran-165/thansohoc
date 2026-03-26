import {
  DailyInsight,
  PracticeSummary,
  RecentPracticeContext,
} from '@/types';
import { dbQuery } from '@services/database';

function parseInsightRecord(insight: DailyInsight): DailyInsight {
  const metadata = typeof insight.metadata === 'string' ? JSON.parse(insight.metadata) : insight.metadata;

  return {
    ...insight,
    layers: typeof insight.layers === 'string' ? JSON.parse(insight.layers) : insight.layers,
    confidence: typeof insight.confidence === 'string' ? JSON.parse(insight.confidence) : insight.confidence,
    metadata,
    presentation: insight.presentation
      ?? (metadata as { presentation?: DailyInsight['presentation'] } | null)?.presentation,
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

function buildReportDates(insights: DailyInsight[]): string[] {
  return Array.from(new Set(insights.map((insight) => insight.date))).sort((a, b) => b.localeCompare(a));
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

export function getPracticeSummary(userId: string): PracticeSummary {
  const insights = getRecentInsights(userId, 30);
  const recentInsights = insights.slice(0, 7);
  const reportDates = buildReportDates(insights);
  const streaks = calculateStreaks(reportDates);
  const last7ReportDays = recentInsights.length;
  const last7ViewedDays = recentInsights.filter((insight) => Boolean(insight.viewed_at)).length;
  const themeCounts = recentInsights
    .map((insight) => insight.theme)
    .filter((theme): theme is string => Boolean(theme))
    .reduce<Record<string, number>>((counts, theme) => {
      counts[theme] = (counts[theme] || 0) + 1;
      return counts;
    }, {});

  return {
    current_streak: streaks.current,
    report_days_last_7: last7ReportDays,
    report_coverage_last_7: Math.round((last7ReportDays / 7) * 100),
    viewed_days_last_7: last7ViewedDays,
    viewed_rate_last_7: Math.round((last7ViewedDays / Math.max(last7ReportDays, 1)) * 100),
    dominant_theme_last_7: Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  };
}

export function getRecentPracticeContext(userId: string): RecentPracticeContext {
  const insights = getRecentInsights(userId, 7);
  const summary = getPracticeSummary(userId);
  const recurringThemeCounts = insights
    .map((insight) => insight.theme)
    .filter((theme): theme is string => Boolean(theme))
    .reduce<Record<string, number>>((counts, theme) => {
      counts[theme] = (counts[theme] || 0) + 1;
      return counts;
    }, {});

  const recurringThemes = Object.entries(recurringThemeCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([theme, count]) => ({ theme, count }));

  const recentNumbers = insights.slice(0, 4).map((insight) => ({
    date: insight.date,
    personal_day: insight.personal_day,
    personal_month: insight.personal_month,
    personal_year: insight.personal_year,
  }));

  const previousInsight = insights[0] ?? null;
  const olderInsight = insights[1] ?? null;
  const themeShift =
    previousInsight && olderInsight && previousInsight.theme && olderInsight.theme && previousInsight.theme !== olderInsight.theme
      ? `Từ "${olderInsight.theme}" sang "${previousInsight.theme}"`
      : null;

  const continuityNote = buildContinuityNote(summary.current_streak, previousInsight?.headline ?? null, recurringThemes);

  return {
    current_streak: summary.current_streak,
    report_days_last_7: summary.report_days_last_7,
    viewed_days_last_7: summary.viewed_days_last_7,
    previous_insight: previousInsight
      ? {
          date: previousInsight.date,
          headline: previousInsight.headline,
          theme: previousInsight.theme,
        }
      : null,
    recent_themes: Array.from(new Set(insights.map((insight) => insight.theme))).slice(0, 3),
    recent_headlines: Array.from(new Set(insights.map((insight) => insight.headline))).slice(0, 3),
    recurring_themes: recurringThemes,
    recent_numbers: recentNumbers,
    continuity_note: continuityNote,
    theme_shift: themeShift,
  };
}

function buildContinuityNote(
  currentStreak: number,
  previousHeadline: string | null,
  recurringThemes: Array<{ theme: string; count: number }>
): string | null {
  const topTheme = recurringThemes[0];

  if (currentStreak >= 4 && topTheme) {
    return `Bạn đã mở báo cáo liên tục ${currentStreak} ngày; chủ đề "${topTheme.theme}" đang trở lại nhiều lần.`;
  }

  if (previousHeadline) {
    return `Bản hôm nay có thể được đọc như phần tiếp theo của nhịp "${previousHeadline}".`;
  }

  if (topTheme) {
    return `Chủ đề "${topTheme.theme}" đang là mạch xuất hiện rõ nhất gần đây.`;
  }

  return null;
}
