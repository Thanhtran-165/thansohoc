import { listen } from '@tauri-apps/api/event';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { NotificationPreferences, UserProfile } from '@/types';
import { trackEvent } from '@services/analytics';

interface NotificationRuntimePayload {
  userId: string;
  userName: string;
  morningInsightEnabled: boolean;
  morningInsightTime: string;
  eveningJournalEnabled: boolean;
  eveningJournalTime: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  soundEnabled: boolean;
}

interface NotificationDispatchedPayload {
  kind: 'morning_insight' | 'evening_journal';
  userId: string;
  title: string;
  body: string;
  sentAt: string;
}

let notificationBridgeReady = false;

function toRuntimePayload(
  profile: UserProfile,
  preferences: NotificationPreferences
): NotificationRuntimePayload {
  return {
    userId: profile.id,
    userName: profile.full_name,
    morningInsightEnabled: preferences.morning_insight_enabled,
    morningInsightTime: preferences.morning_insight_time,
    eveningJournalEnabled: preferences.evening_journal_enabled,
    eveningJournalTime: preferences.evening_journal_time,
    quietHoursEnabled: preferences.quiet_hours_enabled,
    quietHoursStart: preferences.quiet_hours_start ?? null,
    quietHoursEnd: preferences.quiet_hours_end ?? null,
    soundEnabled: preferences.sound_enabled,
  };
}

export async function ensureNotificationBridge(): Promise<void> {
  if (!isTauri() || notificationBridgeReady) {
    return;
  }

  await listen<NotificationDispatchedPayload>('notification-dispatched', (event) => {
    trackEvent('notification_sent', {
      userId: event.payload.userId,
      payload: {
        kind: event.payload.kind,
        title: event.payload.title,
        sentAt: event.payload.sentAt,
      },
    }).catch((error) => {
      console.error('Failed to track notification event:', error);
    });
  });

  notificationBridgeReady = true;
}

export async function syncDesktopNotificationRuntime(
  profile: UserProfile,
  preferences: NotificationPreferences
): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await ensureNotificationBridge();
  await invoke('sync_notification_runtime', {
    payload: toRuntimePayload(profile, preferences),
  });
}

export async function clearDesktopNotificationRuntime(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await invoke('clear_notification_runtime');
}

export async function syncDesktopLaunchOnStartup(enabled: boolean): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await invoke('sync_launch_on_startup', { enabled });
}
