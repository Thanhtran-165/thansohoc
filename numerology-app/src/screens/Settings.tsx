/**
 * Settings Screen
 * Application and notification settings - Vietnamese UI
 *
 * Phase 5: Full implementation with LLM settings UI
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@stores/settingsStore';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { useJournalStore } from '@stores/journalStore';
import { LLMSettings } from '@components/settings';
import messages from '@localization';
import { clearLocalAppData, getLocalAppDataSnapshot } from '@services/database';
import { configManager } from '@services/config';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const {
    notifications,
    isLoading,
    loadSettings,
    createNotificationPreferences,
    updateNotificationPreferences,
  } = useSettingsStore();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadSettings(profile.id);
    }
  }, [profile?.id, loadSettings]);

  useEffect(() => {
    if (profile?.id && !isLoading && !notifications) {
      createNotificationPreferences(profile.id).catch((error) => {
        console.error('Failed to create default notification preferences:', error);
      });
    }
  }, [profile?.id, notifications, isLoading, createNotificationPreferences]);

  const effectiveNotifications = useMemo(() => ({
    morning_insight_enabled: notifications?.morning_insight_enabled ?? true,
    morning_insight_time: notifications?.morning_insight_time ?? '06:30:00',
    evening_journal_enabled: notifications?.evening_journal_enabled ?? true,
    evening_journal_time: notifications?.evening_journal_time ?? '21:00:00',
    quiet_hours_enabled: notifications?.quiet_hours_enabled ?? false,
    quiet_hours_start: notifications?.quiet_hours_start ?? '22:00:00',
    quiet_hours_end: notifications?.quiet_hours_end ?? '06:00:00',
    launch_on_startup: notifications?.launch_on_startup ?? true,
    sound_enabled: notifications?.sound_enabled ?? true,
  }), [notifications]);

  const updateTimeSetting = async (
    field: 'morning_insight_time' | 'evening_journal_time' | 'quiet_hours_start' | 'quiet_hours_end',
    value: string
  ) => {
    await updateNotificationPreferences({ [field]: `${value}:00` });
  };

  const handleExportData = () => {
    const snapshot = getLocalAppDataSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `numerology-app-data-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Đã xuất dữ liệu cục bộ.');
  };

  const handleDeleteData = async () => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu cục bộ? Hành động này không thể hoàn tác.');
    if (!confirmed) {
      return;
    }

    clearLocalAppData();
    await configManager.resetToDefaults();
    useUserStore.setState({
      profile: null,
      isOnboarded: false,
      isLoading: false,
      error: null,
    });
    useSettingsStore.setState({
      notifications: null,
      isLoading: false,
      error: null,
    });
    useInsightStore.setState({
      todayInsight: null,
      isLoading: false,
      error: null,
    });
    useJournalStore.setState({
      todayEntry: null,
      isLoading: false,
      error: null,
    });
    navigate('/onboarding', { replace: true });
  };

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.settings.title}
        title={messages.settings.title}
        subtitle={messages.settings.subtitle}
        accent="sky"
      />

      {statusMessage && (
        <div className="glass-panel rounded-[22px] border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {statusMessage}
        </div>
      )}

      {/* Notifications */}
      <PageSection eyebrow={messages.settings.notifications}>
        <div className="space-y-4">
          <SettingToggle
            label={messages.settings.morningInsight.label}
            description={messages.settings.morningInsight.description}
            enabled={effectiveNotifications.morning_insight_enabled}
            onChange={() => updateNotificationPreferences({
              morning_insight_enabled: !effectiveNotifications.morning_insight_enabled,
            })}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-slate-100">{messages.settings.morningTime.label}</div>
              <div className="text-sm text-slate-400">
                {messages.settings.morningTime.description}
              </div>
            </div>
            <input
              type="time"
              value={effectiveNotifications.morning_insight_time.slice(0, 5)}
              className="field-dark max-w-[180px]"
              onChange={(e) => updateTimeSetting('morning_insight_time', e.target.value)}
            />
          </div>

          <SettingToggle
            label={messages.settings.eveningJournal.label}
            description={messages.settings.eveningJournal.description}
            enabled={effectiveNotifications.evening_journal_enabled}
            onChange={() => updateNotificationPreferences({
              evening_journal_enabled: !effectiveNotifications.evening_journal_enabled,
            })}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-slate-100">{messages.settings.eveningTime.label}</div>
              <div className="text-sm text-slate-400">
                {messages.settings.eveningTime.description}
              </div>
            </div>
            <input
              type="time"
              value={effectiveNotifications.evening_journal_time.slice(0, 5)}
              className="field-dark max-w-[180px]"
              onChange={(e) => updateTimeSetting('evening_journal_time', e.target.value)}
            />
          </div>

          <SettingToggle
            label={messages.settings.sound.label}
            description={messages.settings.sound.description}
            enabled={effectiveNotifications.sound_enabled}
            onChange={() => updateNotificationPreferences({
              sound_enabled: !effectiveNotifications.sound_enabled,
            })}
          />

          <SettingToggle
            label={messages.settings.quietHours.label}
            description={messages.settings.quietHours.description}
            enabled={effectiveNotifications.quiet_hours_enabled}
            onChange={() => updateNotificationPreferences({
              quiet_hours_enabled: !effectiveNotifications.quiet_hours_enabled,
            })}
          />

          {effectiveNotifications.quiet_hours_enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div>
                <label className="field-label">Bắt đầu</label>
                <input
                  type="time"
                  value={effectiveNotifications.quiet_hours_start?.slice(0, 5) || '22:00'}
                  className="field-dark"
                  onChange={(e) => updateTimeSetting('quiet_hours_start', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Kết thúc</label>
                <input
                  type="time"
                  value={effectiveNotifications.quiet_hours_end?.slice(0, 5) || '06:00'}
                  className="field-dark"
                  onChange={(e) => updateTimeSetting('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </PageSection>

      {/* Application */}
      <PageSection eyebrow={messages.settings.application}>
        <div className="space-y-4">
          <SettingToggle
            label={messages.settings.launchOnStartup.label}
            description={messages.settings.launchOnStartup.description}
            enabled={effectiveNotifications.launch_on_startup}
            onChange={() => updateNotificationPreferences({
              launch_on_startup: !effectiveNotifications.launch_on_startup,
            })}
          />
        </div>
      </PageSection>

      <PageSection eyebrow={messages.settings.howItWorks.title}>
        <div className="mb-4">
          <p className="mt-1 text-sm text-slate-400">
            {messages.settings.howItWorks.subtitle}
          </p>
        </div>

        <div className="space-y-3 text-sm leading-7 text-slate-300">
          <div>{`1. ${messages.settings.howItWorks.steps.setup}`}</div>
          <div>{`2. ${messages.settings.howItWorks.steps.generate}`}</div>
          <div>{`3. ${messages.settings.howItWorks.steps.read}`}</div>
        </div>
      </PageSection>

      {/* AI / LLM Settings */}
      <div className="mb-6">
        <LLMSettings />
      </div>

      {/* Data */}
      <PageSection eyebrow={messages.settings.dataPrivacy}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-slate-100">{messages.settings.storageMode.label}</div>
              <div className="text-sm text-slate-400">
                {messages.settings.storageMode.description}
              </div>
            </div>
            <span className="text-slate-300">{messages.settings.storageMode.value}</span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-slate-100">{messages.settings.exportData.label}</div>
              <div className="text-sm text-slate-400">
                {messages.settings.exportData.description}
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="button-secondary-dark"
            >
              {messages.actions.export}
            </button>
          </div>

          <div className="flex items-center gap-4 border-t border-white/8 py-2 pt-4">
            <div className="flex-1">
              <div className="font-medium text-rose-200">{messages.settings.deleteData.label}</div>
              <div className="text-sm text-slate-400">
                {messages.settings.deleteData.description}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteData}
              className="button-danger-dark"
            >
              {messages.actions.delete}
            </button>
          </div>
        </div>
      </PageSection>
    </PageWrap>
  );
}

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1">
        <div className="font-medium text-slate-100">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-sky-400' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
