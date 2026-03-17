/**
 * Settings Screen
 * Application and notification settings - Vietnamese UI
 *
 * Phase 5: Full implementation with LLM settings UI
 */

import { useSettingsStore } from '@stores/settingsStore';
import { LLMSettings } from '@components/settings';
import messages from '@localization';

export default function Settings() {
  const { notifications } = useSettingsStore();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{messages.settings.title}</h1>
        <p className="text-gray-600 mt-1">
          {messages.settings.subtitle}
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {messages.settings.notifications}
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label={messages.settings.morningInsight.label}
            description={messages.settings.morningInsight.description}
            enabled={notifications?.morning_insight_enabled ?? true}
            onChange={() => {}}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{messages.settings.morningTime.label}</div>
              <div className="text-sm text-gray-500">
                {messages.settings.morningTime.description}
              </div>
            </div>
            <input
              type="time"
              value={notifications?.morning_insight_time?.slice(0, 5) || '06:30'}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled
            />
          </div>

          <SettingToggle
            label={messages.settings.eveningJournal.label}
            description={messages.settings.eveningJournal.description}
            enabled={notifications?.evening_journal_enabled ?? true}
            onChange={() => {}}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{messages.settings.eveningTime.label}</div>
              <div className="text-sm text-gray-500">
                {messages.settings.eveningTime.description}
              </div>
            </div>
            <input
              type="time"
              value={notifications?.evening_journal_time?.slice(0, 5) || '21:00'}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled
            />
          </div>

          <SettingToggle
            label={messages.settings.sound.label}
            description={messages.settings.sound.description}
            enabled={notifications?.sound_enabled ?? true}
            onChange={() => {}}
          />

          <SettingToggle
            label={messages.settings.quietHours.label}
            description={messages.settings.quietHours.description}
            enabled={notifications?.quiet_hours_enabled ?? false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Application */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {messages.settings.application}
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label={messages.settings.launchOnStartup.label}
            description={messages.settings.launchOnStartup.description}
            enabled={notifications?.launch_on_startup ?? false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* AI / LLM Settings */}
      <div className="mb-6">
        <LLMSettings />
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {messages.settings.dataPrivacy}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{messages.settings.storageMode.label}</div>
              <div className="text-sm text-gray-500">
                {messages.settings.storageMode.description}
              </div>
            </div>
            <span className="text-gray-600">{messages.settings.storageMode.value}</span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{messages.settings.exportData.label}</div>
              <div className="text-sm text-gray-500">
                {messages.settings.exportData.description}
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              {messages.actions.export}
            </button>
          </div>

          <div className="flex items-center gap-4 py-2 border-t border-gray-100 pt-4">
            <div className="flex-1">
              <div className="font-medium text-red-600">{messages.settings.deleteData.label}</div>
              <div className="text-sm text-gray-500">
                {messages.settings.deleteData.description}
              </div>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
              {messages.actions.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
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
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-500' : 'bg-gray-300'
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
