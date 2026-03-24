import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, AnalyticsEventName } from '@/types';
import { dbQuery } from '@services/database';
import { getCurrentDateISO, getCurrentTimestamp } from '@utils/date';

function parseAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  return {
    ...event,
    payload: typeof event.payload === 'string'
      ? JSON.parse(event.payload)
      : event.payload,
  };
}

export async function trackEvent(
  name: AnalyticsEventName,
  options: {
    userId?: string | null;
    screen?: string | null;
    payload?: Record<string, unknown> | null;
  } = {}
): Promise<void> {
  const event: AnalyticsEvent = {
    id: uuidv4(),
    user_id: options.userId ?? null,
    name,
    screen: options.screen ?? null,
    payload: options.payload ?? null,
    occurred_on: getCurrentDateISO(),
    created_at: getCurrentTimestamp(),
  };

  dbQuery.run(
    `INSERT INTO analytics_events (
      id, user_id, name, screen, payload, occurred_on, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.user_id,
      event.name,
      event.screen,
      JSON.stringify(event.payload),
      event.occurred_on,
      event.created_at,
    ]
  );
}

export function getRecentAnalyticsEvents(
  userId?: string,
  limit = 100
): AnalyticsEvent[] {
  const query = userId
    ? `SELECT * FROM analytics_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limit}`
    : `SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT ${limit}`;
  const params = userId ? [userId] : [];

  return dbQuery
    .all<AnalyticsEvent>(query, params)
    .map(parseAnalyticsEvent);
}

export function getAnalyticsCounts(
  userId: string,
  dayCount = 7
): Record<AnalyticsEventName, number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (dayCount - 1));
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const events = getRecentAnalyticsEvents(userId, 500).filter(
    (event) => event.occurred_on >= cutoffDate
  );

  return events.reduce<Record<AnalyticsEventName, number>>(
    (counts, event) => ({
      ...counts,
      [event.name]: (counts[event.name] || 0) + 1,
    }),
    {
      app_opened: 0,
      screen_view: 0,
      onboarding_completed: 0,
      insight_generated: 0,
      insight_viewed: 0,
      journal_saved: 0,
      settings_updated: 0,
      notification_sent: 0,
    }
  );
}
