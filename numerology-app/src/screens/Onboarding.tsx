/**
 * Onboarding Screen
 * Multi-step onboarding flow for new users
 *
 * Phase 1: Skeleton only - full implementation in Phase 5
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useSettingsStore } from '@stores/settingsStore';
import { StylePreference, InsightLength, Language } from '@/types';

type OnboardingStep = 'welcome' | 'profile' | 'preferences' | 'complete';

interface FormData {
  full_name: string;
  date_of_birth: string;
  style_preference: StylePreference;
  insight_length: InsightLength;
  language: Language;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile, completeOnboarding } = useUserStore();
  const { createNotificationPreferences } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    date_of_birth: '',
    style_preference: 'practical',
    insight_length: 'detailed',
    language: 'en',
  });

  const handleNext = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('profile');
    } else if (currentStep === 'profile') {
      setCurrentStep('preferences');
    } else if (currentStep === 'preferences') {
      setIsLoading(true);
      try {
        // Create user profile
        const profile = await createProfile(formData);

        // Create notification preferences
        await createNotificationPreferences(profile.id);

        // Complete onboarding
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
            {['Welcome', 'Profile', 'Preferences', 'Complete'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index <= ['welcome', 'profile', 'preferences', 'complete'].indexOf(currentStep)
                    ? 'text-primary-600'
                    : 'text-gray-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= ['welcome', 'profile', 'preferences', 'complete'].indexOf(currentStep)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < ['welcome', 'profile', 'preferences', 'complete'].indexOf(currentStep)
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

// Step components (skeleton implementations)
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span className="text-white font-bold text-2xl">N</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Numerology Intelligence
      </h2>
      <p className="text-gray-600 mb-8">
        Discover daily insights based on your personal numerology.
        Let's set up your profile to get started.
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
      >
        Get Started
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
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your Profile</h2>
      <p className="text-gray-600 mb-6">
        Enter your name and birth date for personalized numerology insights.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
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
        Continue
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
    { value: 'gentle' as const, label: 'Gentle', description: 'Soft and supportive language' },
    { value: 'direct' as const, label: 'Direct', description: 'Clear and to the point' },
    { value: 'practical' as const, label: 'Practical', description: 'Actionable and grounded' },
    { value: 'spiritual' as const, label: 'Spiritual', description: 'Soulful and reflective' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your Preferences</h2>
      <p className="text-gray-600 mb-6">
        Choose how you'd like your insights to be delivered.
      </p>

      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Insight Style
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
          Insight Length
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
            <div className="font-medium text-gray-900">Brief</div>
            <div className="text-xs text-gray-500">Quick daily read</div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, insight_length: 'detailed' })}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              formData.insight_length === 'detailed'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">Detailed</div>
            <div className="text-xs text-gray-500">In-depth analysis</div>
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? 'Setting up...' : 'Complete Setup'}
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
        You're All Set!
      </h2>
      <p className="text-gray-600 mb-8">
        Your profile has been created. Let's generate your first daily insight.
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
