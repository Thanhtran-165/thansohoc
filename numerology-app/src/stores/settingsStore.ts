/**
 * Settings Store
 * Manages application settings and preferences
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@services/database';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '@/types';
import { getCurrentTimestamp } from '@utils/date';
import { trackEvent } from '@services/analytics';

// Helper to check if using localStorage mode
function isLocalStorageMode(): boolean {
  try {
    const db = getDatabase();
    return db?.type === 'localStorage';
  } catch {
    return true;
  }
}

// LocalStorage key
const NOTIFICATIONS_KEY = 'notification_preferences';

// Helper functions for localStorage
function getNotificationsFromStorage(): NotificationPreferences | null {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : null;
}

function saveNotificationsToStorage(prefs: NotificationPreferences): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(prefs));
}

function shouldMigrateLegacyStartupPreference(prefs: NotificationPreferences): boolean {
  return (
    prefs.launch_on_startup === false &&
    prefs.morning_insight_enabled === (DEFAULT_NOTIFICATION_PREFERENCES.morning_insight_enabled ?? true) &&
    prefs.morning_insight_time === (DEFAULT_NOTIFICATION_PREFERENCES.morning_insight_time ?? '06:30:00') &&
    prefs.evening_journal_enabled === (DEFAULT_NOTIFICATION_PREFERENCES.evening_journal_enabled ?? true) &&
    prefs.evening_journal_time === (DEFAULT_NOTIFICATION_PREFERENCES.evening_journal_time ?? '21:00:00') &&
    prefs.quiet_hours_enabled === (DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_enabled ?? false) &&
    (prefs.quiet_hours_start ?? null) === (DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_start ?? null) &&
    (prefs.quiet_hours_end ?? null) === (DEFAULT_NOTIFICATION_PREFERENCES.quiet_hours_end ?? null) &&
    prefs.sound_enabled === (DEFAULT_NOTIFICATION_PREFERENCES.sound_enabled ?? true) &&
    prefs.created_at === prefs.updated_at
  );
}

function normalizeNotificationPreferences(prefs: NotificationPreferences): NotificationPreferences {
  if (!shouldMigrateLegacyStartupPreference(prefs)) {
    return prefs;
  }

  return {
    ...prefs,
    launch_on_startup: true,
    updated_at: getCurrentTimestamp(),
  };
}

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
  loadSettings: async (_userId: string) => {
    set({ isLoading: true, error: null });

    try {
      let prefs: NotificationPreferences | null = null;

      if (isLocalStorageMode()) {
        prefs = getNotificationsFromStorage();
        if (prefs) {
          const normalizedPrefs = normalizeNotificationPreferences(prefs);
          if (normalizedPrefs !== prefs) {
            saveNotificationsToStorage(normalizedPrefs);
          }
          prefs = normalizedPrefs;
        }
      }

      set({ notifications: prefs, isLoading: false });
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
      launch_on_startup: DEFAULT_NOTIFICATION_PREFERENCES.launch_on_startup ?? true,
      sound_enabled: DEFAULT_NOTIFICATION_PREFERENCES.sound_enabled ?? true,
      created_at: now,
      updated_at: now,
    };

    if (isLocalStorageMode()) {
      saveNotificationsToStorage(prefs);
    }

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
    const updatedPrefs = {
      ...notifications,
      ...updates,
      updated_at: now,
    };

    if (isLocalStorageMode()) {
      saveNotificationsToStorage(updatedPrefs);
    }

    set({ notifications: updatedPrefs });
    await trackEvent('settings_updated', {
      userId: updatedPrefs.user_id,
      screen: '/settings',
      payload: { updated_keys: Object.keys(updates) },
    });
  },
}));
