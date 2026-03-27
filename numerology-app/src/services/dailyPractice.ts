import {
  DailyInsight,
  PracticeSummary,
  RecentPracticeContext,
  WeeklyNumerologyArc,
  MonthlyNumerologyArc,
} from '@/types';
import { dbQuery } from '@services/database';
import { calculateNumerologyContext } from '@services/numerology';

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

function getInsightsInRange(userId: string, startDate: string, endDate: string): DailyInsight[] {
  return dbQuery
    .all<DailyInsight>(
      `SELECT * FROM daily_insights
       WHERE user_id = ? AND date >= ? AND date <= ?
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    )
    .map(parseInsightRecord);
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const current = startOfDay(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
}

function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getWindowTheme(number: number): string {
  switch (number) {
    case 1:
      return 'mở lối mới';
    case 2:
      return 'lắng nghe và điều hòa';
    case 3:
      return 'biểu đạt và lan tỏa';
    case 4:
      return 'dựng nền và siết nhịp';
    case 5:
      return 'dịch chuyển và thử nghiệm';
    case 6:
      return 'chăm lo và gắn kết';
    case 7:
      return 'lùi lại để nhìn kỹ';
    case 8:
      return 'thực thi và chốt kết quả';
    case 9:
      return 'khép lại và buông bớt';
    case 11:
      return 'trực giác và độ nhạy cao';
    case 22:
      return 'xây lớn trên nền thực tế';
    case 33:
      return 'nâng đỡ và chữa lành';
    default:
      return 'một nhịp riêng cần đọc theo ngữ cảnh';
  }
}

function getWeekTheme(numbers: number[]): string {
  const counts = numbers.reduce<Record<number, number>>((acc, number) => {
    acc[number] = (acc[number] || 0) + 1;
    return acc;
  }, {});

  return getWindowTheme(
    Number(
      Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? numbers[0] ?? 0
    )
  );
}

function getDateLabel(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatRange(start: Date, end: Date): string {
  return `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
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
  const last30Insights = insights.slice(0, 30);
  const reportDates = buildReportDates(insights);
  const streaks = calculateStreaks(reportDates);
  const last7ReportDays = recentInsights.length;
  const last7ViewedDays = recentInsights.filter((insight) => Boolean(insight.viewed_at)).length;
  const last30ReportDays = last30Insights.length;
  const last30ViewedDays = last30Insights.filter((insight) => Boolean(insight.viewed_at)).length;
  const themeCounts = recentInsights
    .map((insight) => insight.theme)
    .filter((theme): theme is string => Boolean(theme))
    .reduce<Record<string, number>>((counts, theme) => {
      counts[theme] = (counts[theme] || 0) + 1;
      return counts;
    }, {});
  const themeCounts30 = last30Insights
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
    report_days_last_30: last30ReportDays,
    report_coverage_last_30: Math.round((last30ReportDays / 30) * 100),
    viewed_days_last_30: last30ViewedDays,
    viewed_rate_last_30: Math.round((last30ViewedDays / Math.max(last30ReportDays, 1)) * 100),
    dominant_theme_last_30: Object.entries(themeCounts30).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  };
}

export function getRecentPracticeContext(userId: string): RecentPracticeContext {
  const insights = getRecentInsights(userId, 30);
  const last7Insights = insights.slice(0, 7);
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

  const recentNumbers = insights.slice(0, 8).map((insight) => ({
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
    report_days_last_30: summary.report_days_last_30,
    viewed_days_last_30: summary.viewed_days_last_30,
    previous_insight: previousInsight
      ? {
          date: previousInsight.date,
          headline: previousInsight.headline,
          theme: previousInsight.theme,
        }
      : null,
    recent_themes: Array.from(new Set(last7Insights.map((insight) => insight.theme))).slice(0, 3),
    recent_headlines: Array.from(new Set(last7Insights.map((insight) => insight.headline))).slice(0, 3),
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

export function getWeeklyNumerologyArc(
  fullName: string,
  dateOfBirth: string,
  currentName?: string | null,
  targetDate: Date = new Date()
): WeeklyNumerologyArc {
  const start = startOfWeek(targetDate);
  const end = endOfWeek(targetDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index)).map((date) => {
    const context = calculateNumerologyContext(fullName, dateOfBirth, date, currentName);
    return {
      date: toIsoDate(date),
      label: getDateLabel(date),
      personal_day: context.personal_day,
      personal_month: context.personal_month,
      personal_year: context.personal_year,
    };
  });

  const first = days[0];
  const middle = days[3];
  const last = days[6];
  const uniqueDays = Array.from(new Set(days.map((item) => item.personal_day))).slice(0, 3);
  const monthAnchor = middle.personal_month;
  const yearAnchor = middle.personal_year;

  return {
    range_label: formatRange(start, end),
    title: `Tuần này đi qua ${uniqueDays.map((value) => getWindowTheme(value)).join(', ')}`,
    summary: `Tuần hiện tại được đỡ bởi Tháng cá nhân ${monthAnchor} (${getWindowTheme(monthAnchor)}) và Năm cá nhân ${yearAnchor} (${getWindowTheme(yearAnchor)}). Đầu tuần nghiêng về ${getWindowTheme(first.personal_day)}, giữa tuần chạm rõ hơn vào ${getWindowTheme(middle.personal_day)}, và cuối tuần khép lại bằng nhịp ${getWindowTheme(last.personal_day)}. Daily report nên được đọc như từng bước nhỏ đang đi trong mạch lớn này, không tách khỏi nó.`,
    personal_month: monthAnchor,
    personal_year: yearAnchor,
    opening_number: first.personal_day,
    pivot_number: middle.personal_day,
    closing_number: last.personal_day,
    recurring_numbers: uniqueDays,
    daily_numbers: days.map(({ date, label, personal_day }) => ({
      date,
      label,
      personal_day,
    })),
  };
}

export function getMonthlyNumerologyArc(
  fullName: string,
  dateOfBirth: string,
  currentName?: string | null,
  targetDate: Date = new Date()
): MonthlyNumerologyArc {
  const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const end = endOfMonth(targetDate);
  const monthContext = calculateNumerologyContext(fullName, dateOfBirth, start, currentName);
  const weeklyHighlights: MonthlyNumerologyArc['weekly_highlights'] = [];
  let cursor = start;

  while (cursor <= end) {
    const weekStart = cursor;
    const weekEnd = endOfWeek(cursor) > end ? end : endOfWeek(cursor);
    const midPoint = addDays(weekStart, Math.floor((weekEnd.getDate() - weekStart.getDate()) / 2));
    const weekContext = calculateNumerologyContext(fullName, dateOfBirth, midPoint, currentName);
    weeklyHighlights.push({
      label: formatRange(weekStart, weekEnd),
      personal_day: weekContext.personal_day,
      summary: `Nhịp này dễ nổi lên ở hướng ${getWindowTheme(weekContext.personal_day)} nhưng vẫn nằm trên nền tháng ${getWindowTheme(monthContext.personal_month)}.`,
    });
    cursor = addDays(weekEnd, 1);
  }

  const dominantWeekTheme = getWeekTheme(weeklyHighlights.map((item) => item.personal_day));

  return {
    range_label: start.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    title: `Tháng này nghiêng về ${getWindowTheme(monthContext.personal_month)}`,
    summary: `Toàn tháng hiện được đọc qua Tháng cá nhân ${monthContext.personal_month} trên nền Năm cá nhân ${monthContext.personal_year}. Điều đó có nghĩa là daily report trong tháng này không nên được xem như các mảnh rời: mỗi ngày đang thử một biến thể nhỏ của cùng một bài học lớn hơn về ${getWindowTheme(monthContext.personal_month)}.`,
    personal_month: monthContext.personal_month,
    personal_year: monthContext.personal_year,
    month_theme: getWindowTheme(monthContext.personal_month),
    dominant_week_theme: dominantWeekTheme,
    weekly_highlights: weeklyHighlights,
  };
}

export function getRollingThirtyDayInsights(userId: string): DailyInsight[] {
  const today = startOfDay(new Date());
  const start = addDays(today, -29);
  return getInsightsInRange(userId, toIsoDate(start), toIsoDate(today));
}
