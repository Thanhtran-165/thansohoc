// Notification types

export interface NotificationPreferences {
  id: string;
  user_id: string;
  morning_insight_enabled: boolean;
  morning_insight_time: string; // HH:MM:SS format
  evening_journal_enabled: boolean;
  evening_journal_time: string; // HH:MM:SS format
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null | undefined; // HH:MM:SS format
  quiet_hours_end: string | null | undefined; // HH:MM:SS format
  launch_on_startup: boolean;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationPreferencesInput {
  user_id: string;
  morning_insight_enabled?: boolean;
  morning_insight_time?: string;
  evening_journal_enabled?: boolean;
  evening_journal_time?: string;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  launch_on_startup?: boolean;
  sound_enabled?: boolean;
}

export interface UpdateNotificationPreferencesInput {
  morning_insight_enabled?: boolean;
  morning_insight_time?: string;
  evening_journal_enabled?: boolean;
  evening_journal_time?: string;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  launch_on_startup?: boolean;
  sound_enabled?: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<CreateNotificationPreferencesInput, 'user_id'> = {
  morning_insight_enabled: true,
  morning_insight_time: '06:30:00',
  evening_journal_enabled: true,
  evening_journal_time: '21:00:00',
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
  launch_on_startup: true,
  sound_enabled: true,
};
