/**
 * Onboarding Screen
 * Multi-step onboarding flow for new users - Vietnamese UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useSettingsStore } from '@stores/settingsStore';
import { StylePreference, InsightLength, Language } from '@/types';
import messages from '@localization';

type OnboardingStep = 'welcome' | 'profile' | 'preferences' | 'complete';

interface FormData {
  full_name: string;
  date_of_birth: string;
  style_preference: StylePreference;
  insight_length: InsightLength;
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
    insight_length: 'detailed',
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
        const profile = await createProfile(formData);
        await createNotificationPreferences(profile.id);
        await completeOnboarding();
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index <= CURRENT_STEPS.indexOf(currentStep)
                    ? 'text-primary-600'
                    : 'text-gray-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= CURRENT_STEPS.indexOf(currentStep)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < CURRENT_STEPS.indexOf(currentStep)
                        ? 'bg-primary-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span className="text-white font-bold text-2xl">N</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {messages.onboarding.welcome.title}
      </h2>
      <p className="text-gray-600 mb-8">
        {messages.onboarding.welcome.description}
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
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
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {messages.onboarding.profile.title}
      </h2>
      <p className="text-gray-600 mb-6">
        {messages.onboarding.profile.description}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {messages.onboarding.profile.fullName}
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={messages.onboarding.profile.fullNamePlaceholder}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {messages.onboarding.profile.dateOfBirth}
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.full_name || !formData.date_of_birth}
        className="w-full mt-6 py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
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
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {messages.onboarding.preferences.title}
      </h2>
      <p className="text-gray-600 mb-6">
        {messages.onboarding.preferences.description}
      </p>

      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {messages.onboarding.preferences.insightStyle}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => setFormData({ ...formData, style_preference: style.value })}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                formData.style_preference === style.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{style.label}</div>
              <div className="text-xs text-gray-500">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {messages.onboarding.preferences.insightLength}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, insight_length: 'brief' })}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              formData.insight_length === 'brief'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">
              {messages.onboarding.preferences.lengths.brief.label}
            </div>
            <div className="text-xs text-gray-500">
              {messages.onboarding.preferences.lengths.brief.description}
            </div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, insight_length: 'detailed' })}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              formData.insight_length === 'detailed'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">
              {messages.onboarding.preferences.lengths.detailed.label}
            </div>
            <div className="text-xs text-gray-500">
              {messages.onboarding.preferences.lengths.detailed.description}
            </div>
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
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
      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {messages.onboarding.complete.title}
      </h2>
      <p className="text-gray-600 mb-8">
        {messages.onboarding.complete.description}
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
      >
        {messages.onboarding.complete.button}
      </button>
    </div>
  );
}
