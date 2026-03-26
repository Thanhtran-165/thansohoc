/**
 * Profile Screen
 * User profile view and edit - Vietnamese UI
 *
 * Phase 4: Full implementation with real numerology calculations
 * Updated: Support editing name, DOB, and preferences with recalculation
 */

import { useState, useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { calculateCoreNumbers } from '@services/numerology';
import { CoreNumerologyResult } from '@services/numerology';
import { StylePreference, UserProfile } from '@/types';
import messages from '@localization';

type EditMode = 'none' | 'personal' | 'preferences';

interface PersonalForm {
  full_name: string;
  date_of_birth: string;
}

interface PreferencesForm {
  style_preference: StylePreference;
}

export default function Profile() {
  const { profile, isLoading, updateProfile } = useUserStore();
  const { todayInsight, regenerateTodayInsight } = useInsightStore();
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [personalForm, setPersonalForm] = useState<PersonalForm | null>(null);
  const [preferencesForm, setPreferencesForm] = useState<PreferencesForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Calculate core numbers from profile data
  const coreNumbers = useMemo<CoreNumerologyResult | null>(() => {
    if (!profile?.full_name || !profile?.date_of_birth) return null;
    try {
      return calculateCoreNumbers(profile.full_name, profile.date_of_birth);
    } catch {
      return null;
    }
  }, [profile?.full_name, profile?.date_of_birth]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{messages.profile.noProfile}</p>
      </div>
    );
  }

  // Start editing personal info
  const handleStartPersonalEdit = () => {
    setPersonalForm({
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
    });
    setEditMode('personal');
    setSaveStatus('idle');
  };

  // Start editing preferences
  const handleStartPreferencesEdit = () => {
    setPreferencesForm({
      style_preference: profile.style_preference,
    });
    setEditMode('preferences');
    setSaveStatus('idle');
  };

  // Save personal info
  const handleSavePersonal = async () => {
    if (!personalForm) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await updateProfile(personalForm);
      const updatedProfile = { ...profile, ...personalForm } as UserProfile;
      await regenerateTodayInsight(updatedProfile);
      setEditMode('none');
      setPersonalForm(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    if (!preferencesForm) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await updateProfile(preferencesForm);
      const updatedProfile = { ...profile, ...preferencesForm } as UserProfile;
      await regenerateTodayInsight(updatedProfile);
      setEditMode('none');
      setPreferencesForm(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditMode('none');
    setPersonalForm(null);
    setPreferencesForm(null);
    setSaveStatus('idle');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{messages.profile.title}</h1>
        <p className="text-gray-600 mt-1">{messages.profile.subtitle}</p>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {messages.profile.saved}
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {messages.profile.saveError}
        </div>
      )}

      {/* Personal Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{messages.profile.personalInfo}</h3>
          {editMode !== 'personal' && (
            <button
              onClick={handleStartPersonalEdit}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {messages.profile.editPersonalInfo}
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            {editMode === 'personal' && personalForm ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {messages.profile.fullName}
                  </label>
                  <input
                    type="text"
                    value={personalForm.full_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={messages.profile.fullNamePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {messages.profile.dateOfBirth}
                  </label>
                  <input
                    type="date"
                    value={personalForm.date_of_birth}
                    onChange={(e) => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  {messages.profile.recalcWarning}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    {messages.actions.cancel}
                  </button>
                  <button
                    onClick={handleSavePersonal}
                    disabled={isSaving || !personalForm.full_name || !personalForm.date_of_birth}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isSaving ? messages.journal.saving : messages.profile.saveChanges}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="text-lg font-semibold text-gray-900">{profile.full_name}</h4>
                <p className="text-gray-500 text-sm">
                  {messages.profile.born}: {new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Cyclic Numbers */}
        {!editMode && todayInsight && (
          <div className="flex gap-4 text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-500">
              {messages.dashboard.numerology.personalDay}:{' '}
              <span className="font-medium text-primary-600">{todayInsight.personal_day}</span>
            </span>
            <span className="text-gray-500">
              {messages.dashboard.numerology.personalMonth}:{' '}
              <span className="font-medium text-primary-600">{todayInsight.personal_month}</span>
            </span>
            <span className="text-gray-500">
              {messages.dashboard.numerology.personalYear}:{' '}
              <span className="font-medium text-primary-600">{todayInsight.personal_year}</span>
            </span>
          </div>
        )}
      </div>

      {/* Preferences Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{messages.profile.preferences}</h3>
          {editMode !== 'preferences' && (
            <button
              onClick={handleStartPreferencesEdit}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {messages.profile.editPreferences}
            </button>
          )}
        </div>

        {editMode === 'preferences' && preferencesForm ? (
          <div className="space-y-4">
            {/* Style Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {messages.profile.insightStyle}
              </label>
              <select
                value={preferencesForm.style_preference}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, style_preference: e.target.value as StylePreference })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="gentle">{messages.onboarding.preferences.styles.gentle.label}</option>
                <option value="direct">{messages.onboarding.preferences.styles.direct.label}</option>
                <option value="practical">{messages.onboarding.preferences.styles.practical.label}</option>
                <option value="spiritual">{messages.onboarding.preferences.styles.spiritual.label}</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                {messages.actions.cancel}
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isSaving ? messages.journal.saving : messages.profile.saveChanges}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <PreferenceRow
              label={messages.profile.insightStyle}
              value={formatStylePreference(profile.style_preference)}
            />
            <PreferenceRow
              label={messages.profile.language}
              value={profile.language === 'en' ? messages.profile.languageEn : messages.profile.languageVi}
            />
          </div>
        )}
      </div>

      {/* Numerology Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {messages.profile.coreNumbers}
        </h3>

        {coreNumbers ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.lifePath}
              value={coreNumbers.life_path}
              description={messages.profile.coreNumberDescriptions.lifePath}
            />
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.destiny}
              value={coreNumbers.destiny_number}
              description={messages.profile.coreNumberDescriptions.destiny}
            />
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.soulUrge}
              value={coreNumbers.soul_urge}
              description={messages.profile.coreNumberDescriptions.soulUrge}
            />
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.personality}
              value={coreNumbers.personality_number}
              description={messages.profile.coreNumberDescriptions.personality}
            />
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.birthday}
              value={coreNumbers.birthday_number}
              description={messages.profile.coreNumberDescriptions.birthday}
            />
            <CoreNumberCard
              label={messages.profile.coreNumbersLabel.maturity}
              value={coreNumbers.maturity_number}
              description={messages.profile.coreNumberDescriptions.maturity}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{messages.profile.completeProfile}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Format helpers
function formatStylePreference(style: StylePreference): string {
  const labels: Record<StylePreference, string> = {
    gentle: messages.onboarding.preferences.styles.gentle.label,
    direct: messages.onboarding.preferences.styles.direct.label,
    practical: messages.onboarding.preferences.styles.practical.label,
    spiritual: messages.onboarding.preferences.styles.spiritual.label,
  };
  return labels[style] || style;
}

// Sub-components
function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function CoreNumberCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  const isMaster = value === 11 || value === 22 || value === 33;

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className={`text-2xl font-bold mb-1 ${isMaster ? 'text-accent-500' : 'text-primary-600'}`}>
        {value}
        {isMaster && <span className="text-xs ml-1 text-accent-400">{messages.profile.masterNumber}</span>}
      </div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
