/**
 * Settings Screen
 * Application and notification settings
 *
 * Phase 1: Skeleton only - full implementation in Phase 5
 */

import { useSettingsStore } from '@stores/settingsStore';

export default function Settings() {
  const { notifications } = useSettingsStore();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your app preferences and notifications
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notifications
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="Morning Insight"
            description="Receive a notification with your daily insight"
            enabled={notifications?.morning_insight_enabled ?? true}
            onChange={() => {}}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Morning Time</div>
              <div className="text-sm text-gray-500">
                When to receive your morning insight
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
            label="Evening Journal Reminder"
            description="Get reminded to write your journal entry"
            enabled={notifications?.evening_journal_enabled ?? true}
            onChange={() => {}}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Evening Time</div>
              <div className="text-sm text-gray-500">
                When to receive your journal reminder
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
            label="Sound"
            description="Play a sound with notifications"
            enabled={notifications?.sound_enabled ?? true}
            onChange={() => {}}
          />

          <SettingToggle
            label="Quiet Hours"
            description="Suppress notifications during specified hours"
            enabled={notifications?.quiet_hours_enabled ?? false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Application */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Application
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="Launch on Startup"
            description="Automatically start the app when you log in"
            enabled={notifications?.launch_on_startup ?? false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AI Configuration
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">API Key</div>
              <div className="text-sm text-gray-500">
                Your LLM API key for generating insights
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              Configure
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Provider</div>
              <div className="text-sm text-gray-500">
                LLM provider for insight generation
              </div>
            </div>
            <span className="text-gray-600">DeepSeek (Default)</span>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Data & Privacy
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Storage Mode</div>
              <div className="text-sm text-gray-500">
                All data is stored locally on your device
              </div>
            </div>
            <span className="text-gray-600">Local Only</span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Export Data</div>
              <div className="text-sm text-gray-500">
                Download all your data as JSON
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              Export
            </button>
          </div>

          <div className="flex items-center gap-4 py-2 border-t border-gray-100 pt-4">
            <div className="flex-1">
              <div className="font-medium text-red-600">Delete All Data</div>
              <div className="text-sm text-gray-500">
                Permanently delete all your data
              </div>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
              Delete
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
