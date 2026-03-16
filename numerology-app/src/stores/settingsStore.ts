/**
 * Settings Store
 * Manages application settings and preferences
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '@services/database';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '@/types';
import { getCurrentTimestamp } from '@utils/date';

interface SettingsState {
  // State
  notifications: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: (userId: string) => Promise<void>;
  createNotificationPreferences: (userId: string) => Promise<NotificationPreferences>;
  updateNotificationPreferences: (
    updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  notifications: null,
  isLoading: false,
  error: null,

  // Load settings from database
  loadSettings: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const prefs = dbQuery.get<NotificationPreferences>(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [userId]
      );

      set({ notifications: prefs || null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load settings', isLoading: false });
      console.error('Failed to load settings:', error);
    }
  },

  // Create notification preferences
  createNotificationPreferences: async (userId: string) => {
    const now = getCurrentTimestamp();
    const id = uuidv4();

    const prefs: NotificationPreferences = {
      id,
      user_id: userId,
      morning_insight_enabled: DEFAULT_NOTIFICATION_PREFERENCES.morning_insight_enabled ?? true,
      morning_insight_time: DEFAULT_NOTIFICATION_PREFERENCES.morning_insight_time ?? '06:30:00',
      evening_journal_enabled: DEFAULT_NOTIFICATION_PREFERENCES.evening_journal_enabled ?? true,
      evening_journal_time: DEFAULT_NOTIFICATION_PREFERENCES.evening_journal_time ?? '21:00:00',
      quiet_hours_enabled: DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_enabled ?? false,
      quiet_hours_start: DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_start ?? null,
      quiet_hours_end: DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_end ?? null,
      launch_on_startup: DEFAULT_NOTIFICATION_PREFERENCES.launch_on_startup ?? false,
      sound_enabled: DEFAULT_NOTIFICATION_PREFERENCES.sound_enabled ?? true,
      created_at: now,
      updated_at: now,
    };

    dbQuery.run(
      `INSERT INTO notification_preferences (
        id, user_id, morning_insight_enabled, morning_insight_time,
        evening_journal_enabled, evening_journal_time, quiet_hours_enabled,
        quiet_hours_start, quiet_hours_end, launch_on_startup, sound_enabled,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prefs.id,
        prefs.user_id,
        prefs.morning_insight_enabled ? 1 : 0,
        prefs.morning_insight_time,
        prefs.evening_journal_enabled ? 1 : 0,
        prefs.evening_journal_time,
        prefs.quiet_hours_enabled ? 1 : 0,
        prefs.quiet_hours_start,
        prefs.quiet_hours_end,
        prefs.launch_on_startup ? 1 : 0,
        prefs.sound_enabled ? 1 : 0,
        prefs.created_at,
        prefs.updated_at,
      ]
    );

    set({ notifications: prefs });
    return prefs;
  },

  // Update notification preferences
  updateNotificationPreferences: async (updates) => {
    const { notifications } = get();
    if (!notifications) {
      throw new Error('No notification preferences to update');
    }

    const now = getCurrentTimestamp();
    const updateFields: string[] = [];
    const values: (string | number | null)[] = [];

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      updateFields.push(`${key} = ?`);
      if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value as string | null);
      }
    });

    updateFields.push('updated_at = ?');
    values.push(now);
    values.push(notifications.id);

    dbQuery.run(
      `UPDATE notification_preferences SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    set({
      notifications: {
        ...notifications,
        ...updates,
        updated_at: now,
      },
    });
  },
}));
