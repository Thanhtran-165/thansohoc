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
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';

type EditMode = 'none' | 'personal' | 'preferences';

interface PersonalForm {
  full_name: string;
  current_name: string;
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
      <div className="glass-panel py-12 text-center">
        <p className="text-slate-400">{messages.profile.noProfile}</p>
      </div>
    );
  }

  // Start editing personal info
  const handleStartPersonalEdit = () => {
    setPersonalForm({
      full_name: profile.full_name,
      current_name: profile.current_name ?? profile.full_name,
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
    <PageWrap>
      <PageHero
        eyebrow={messages.profile.title}
        title={messages.profile.title}
        subtitle={messages.profile.subtitle}
        accent="violet"
      />

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="glass-panel section-reveal rounded-[24px] border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {messages.profile.saved}
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="glass-panel section-reveal rounded-[24px] border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {messages.profile.saveError}
        </div>
      )}

      {/* Personal Info Card */}
      <PageSection eyebrow={messages.profile.personalInfo}>
        <div className="flex items-center justify-between mb-4">
          {editMode !== 'personal' && (
            <button
              onClick={handleStartPersonalEdit}
              className="button-secondary-dark"
            >
              {messages.profile.editPersonalInfo}
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="glass-card-strong flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
            <span className="text-white font-bold text-xl">
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            {editMode === 'personal' && personalForm ? (
              <div className="space-y-3">
                <div>
                  <label className="field-label">
                    {messages.profile.fullName}
                  </label>
                  <input
                    type="text"
                    value={personalForm.full_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                    className="field-dark"
                    placeholder={messages.profile.fullNamePlaceholder}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {messages.profile.currentName}
                  </label>
                  <input
                    type="text"
                    value={personalForm.current_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, current_name: e.target.value })}
                    className="field-dark"
                    placeholder={messages.profile.currentNamePlaceholder}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {messages.profile.dateOfBirth}
                  </label>
                  <input
                    type="date"
                    value={personalForm.date_of_birth}
                    onChange={(e) => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })}
                    className="field-dark"
                  />
                </div>
                <div className="rounded-[18px] border border-amber-300/20 bg-amber-400/10 p-3 text-xs text-amber-200">
                  {messages.profile.recalcWarning}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="button-ghost-dark"
                  >
                    {messages.actions.cancel}
                  </button>
                  <button
                    onClick={handleSavePersonal}
                    disabled={isSaving || !personalForm.full_name || !personalForm.date_of_birth}
                    className="button-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? messages.journal.saving : messages.profile.saveChanges}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="text-lg font-semibold text-slate-50">{profile.full_name}</h4>
                {(profile.current_name ?? profile.full_name) !== profile.full_name && (
                  <p className="text-sm text-slate-400">
                    {messages.profile.currentName}: {profile.current_name}
                  </p>
                )}
                <p className="text-sm text-slate-400">
                  {messages.profile.born}: {new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Cyclic Numbers */}
        {!editMode && todayInsight && (
          <div className="flex gap-4 border-t border-white/8 pt-2 text-sm">
            <span className="text-slate-400">
              {messages.dashboard.numerology.personalDay}:{' '}
              <span className="font-medium text-slate-100">{todayInsight.personal_day}</span>
            </span>
            <span className="text-slate-400">
              {messages.dashboard.numerology.personalMonth}:{' '}
              <span className="font-medium text-slate-100">{todayInsight.personal_month}</span>
            </span>
            <span className="text-slate-400">
              {messages.dashboard.numerology.personalYear}:{' '}
              <span className="font-medium text-slate-100">{todayInsight.personal_year}</span>
            </span>
          </div>
        )}
      </PageSection>

      {/* Preferences Card */}
      <PageSection eyebrow={messages.profile.preferences}>
        <div className="flex items-center justify-between mb-4">
          {editMode !== 'preferences' && (
            <button
              onClick={handleStartPreferencesEdit}
              className="button-secondary-dark"
            >
              {messages.profile.editPreferences}
            </button>
          )}
        </div>

        {editMode === 'preferences' && preferencesForm ? (
          <div className="space-y-4">
            {/* Style Preference */}
            <div>
              <label className="field-label">
                {messages.profile.insightStyle}
              </label>
              <select
                value={preferencesForm.style_preference}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, style_preference: e.target.value as StylePreference })}
                className="field-dark"
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
                className="button-ghost-dark"
              >
                {messages.actions.cancel}
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="button-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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
      </PageSection>

      {/* Numerology Profile */}
      <PageSection eyebrow={messages.profile.coreNumbers}>
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
          <div className="py-8 text-center text-slate-400">
            <p>{messages.profile.completeProfile}</p>
          </div>
        )}
      </PageSection>
    </PageWrap>
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
    <div className="flex items-center justify-between border-b border-white/8 py-3 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
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
    <div className="glass-card rounded-[24px] p-4 text-center">
      <div className={`mb-1 text-2xl font-bold ${isMaster ? 'text-amber-200' : 'text-slate-50'}`}>
        {value}
        {isMaster && <span className="ml-1 text-xs text-amber-300">{messages.profile.masterNumber}</span>}
      </div>
      <div className="text-sm font-medium text-slate-100">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{description}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="mb-2 h-8 w-1/4 rounded bg-white/10"></div>
      <div className="mb-8 h-4 w-1/3 rounded bg-white/6"></div>
      <div className="glass-panel mb-6 rounded-[28px] p-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-white/10"></div>
          <div className="flex-1">
            <div className="mb-2 h-6 w-1/3 rounded bg-white/10"></div>
            <div className="h-4 w-1/4 rounded bg-white/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
