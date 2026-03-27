/**
 * Onboarding Screen
 * Multi-step onboarding flow for new users - Vietnamese UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useSettingsStore } from '@stores/settingsStore';
import { StylePreference, Language } from '@/types';
import messages from '@localization';
import { trackEvent } from '@services/analytics';

type OnboardingStep = 'welcome' | 'profile' | 'preferences' | 'complete';

interface FormData {
  full_name: string;
  date_of_birth: string;
  style_preference: StylePreference;
  language: Language;
}

const STEP_LABELS = [
  messages.onboarding.steps.welcome,
  messages.onboarding.steps.profile,
  messages.onboarding.steps.preferences,
  messages.onboarding.steps.complete,
];
const CURRENT_STEPS: OnboardingStep[] = ['welcome', 'profile', 'preferences', 'complete'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile, completeOnboarding } = useUserStore();
  const { createNotificationPreferences } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    date_of_birth: '',
    style_preference: 'practical',
    language: 'vi',
  });

  const handleNext = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('profile');
    } else if (currentStep === 'profile') {
      setCurrentStep('preferences');
    } else if (currentStep === 'preferences') {
      setIsLoading(true);
      try {
        const profile = await createProfile({
          ...formData,
          insight_length: 'detailed',
        });
        await createNotificationPreferences(profile.id);
        await completeOnboarding();
        await trackEvent('onboarding_completed', {
          userId: profile.id,
          payload: {
            style_preference: formData.style_preference,
          },
        });
        setCurrentStep('complete');
      } catch (error) {
        console.error('Onboarding error:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 'complete') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_24%),linear-gradient(180deg,_#040b15_0%,_#08111d_45%,_#0a1424_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index <= CURRENT_STEPS.indexOf(currentStep)
                    ? 'text-slate-100'
                    : 'text-slate-500'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index <= CURRENT_STEPS.indexOf(currentStep)
                      ? 'border border-white/20 bg-white/14 text-white shadow-[0_10px_30px_rgba(56,189,248,0.18)]'
                      : 'border border-white/10 bg-white/6 text-slate-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`mx-2 h-px w-16 ${
                      index < CURRENT_STEPS.indexOf(currentStep)
                        ? 'bg-gradient-to-r from-sky-300/70 to-amber-300/70'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-[32px] p-8">
          {currentStep === 'welcome' && (
            <WelcomeStep onNext={handleNext} />
          )}

          {currentStep === 'profile' && (
            <ProfileStep
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
            />
          )}

          {currentStep === 'preferences' && (
            <PreferencesStep
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteStep onNext={handleNext} />
          )}
        </div>
      </div>
    </div>
  );
}

// Step components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="glass-card-strong mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
        <span className="text-white font-bold text-2xl">N</span>
      </div>
      <h2 className="mb-4 text-2xl font-bold text-slate-50">
        {messages.onboarding.welcome.title}
      </h2>
      <p className="mb-8 text-slate-300">
        {messages.onboarding.welcome.description}
      </p>
      <button
        onClick={onNext}
        className="button-primary-dark w-full"
      >
        {messages.onboarding.welcome.button}
      </button>
    </div>
  );
}

function ProfileStep({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-slate-50">
        {messages.onboarding.profile.title}
      </h2>
      <p className="mb-6 text-slate-300">
        {messages.onboarding.profile.description}
      </p>

      <div className="space-y-4">
        <div>
          <label className="field-label">
            {messages.onboarding.profile.fullName}
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="field-dark"
            placeholder={messages.onboarding.profile.fullNamePlaceholder}
          />
        </div>

        <div>
          <label className="field-label">
            {messages.onboarding.profile.dateOfBirth}
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="field-dark"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.full_name || !formData.date_of_birth}
        className="button-primary-dark mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {messages.actions.continue}
      </button>
    </div>
  );
}

function PreferencesStep({
  formData,
  setFormData,
  onNext,
  isLoading,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  isLoading: boolean;
}) {
  const styles = [
    { value: 'gentle' as const, ...messages.onboarding.preferences.styles.gentle },
    { value: 'direct' as const, ...messages.onboarding.preferences.styles.direct },
    { value: 'practical' as const, ...messages.onboarding.preferences.styles.practical },
    { value: 'spiritual' as const, ...messages.onboarding.preferences.styles.spiritual },
  ];

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-slate-50">
        {messages.onboarding.preferences.title}
      </h2>
      <p className="mb-6 text-slate-300">
        {messages.onboarding.preferences.description}
      </p>

      <div className="space-y-4 mb-6">
        <label className="field-label">
          {messages.onboarding.preferences.insightStyle}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => setFormData({ ...formData, style_preference: style.value })}
              className={`rounded-[22px] border px-4 py-4 text-left transition-all ${
                formData.style_preference === style.value
                  ? 'glass-card-strong border-sky-300/35 shadow-[0_14px_36px_rgba(56,189,248,0.18)]'
                  : 'glass-card border-white/10 hover:border-white/16 hover:bg-white/[0.08]'
              }`}
            >
              <div className="text-sm font-semibold text-slate-50">{style.label}</div>
              <div className="mt-1 text-xs text-slate-400">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="button-primary-dark w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? messages.onboarding.preferences.settingUp
          : messages.onboarding.preferences.button}
      </button>
    </div>
  );
}

function CompleteStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="glass-card-strong mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-emerald-300/30 bg-emerald-400/10">
        <svg className="h-8 w-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mb-4 text-2xl font-bold text-slate-50">
        {messages.onboarding.complete.title}
      </h2>
      <p className="mb-8 text-slate-300">
        {messages.onboarding.complete.description}
      </p>
      <button
        onClick={onNext}
        className="button-primary-dark w-full"
      >
        {messages.onboarding.complete.button}
      </button>
    </div>
  );
}
