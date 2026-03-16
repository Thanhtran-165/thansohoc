/**
 * Profile Screen
 * User profile view and edit
 *
 * Phase 4: Full implementation with real numerology calculations
 */

import { useState, useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { calculateCoreNumbers } from '@services/numerology';
import { CoreNumerologyResult } from '@services/numerology';
import { StylePreference, InsightLength } from '@/types';

export default function Profile() {
  const { profile, isLoading, updateProfile } = useUserStore();
  const { todayInsight } = useInsightStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    style_preference: StylePreference;
    insight_length: InsightLength;
  } | null>(null);

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
        <p className="text-gray-500">No profile found. Please complete onboarding.</p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditForm({
      style_preference: profile.style_preference,
      insight_length: profile.insight_length,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      setEditForm(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-2xl">
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile.full_name}
            </h2>
            <p className="text-gray-500 mt-1">
              Born: {new Date(profile.date_of_birth).toLocaleDateString()}
            </p>
            {/* Show today's cyclic numbers if available */}
            {todayInsight && (
              <div className="mt-2 flex gap-3 text-sm">
                <span className="text-gray-500">
                  Personal Day: <span className="font-medium text-primary-600">{todayInsight.personal_day}</span>
                </span>
                <span className="text-gray-500">
                  Month: <span className="font-medium text-primary-600">{todayInsight.personal_month}</span>
                </span>
                <span className="text-gray-500">
                  Year: <span className="font-medium text-primary-600">{todayInsight.personal_year}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Preferences
          </h3>
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing && editForm ? (
          <div className="space-y-4">
            {/* Style Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insight Style
              </label>
              <select
                value={editForm.style_preference}
                onChange={(e) => setEditForm({ ...editForm, style_preference: e.target.value as StylePreference })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="gentle">Gentle</option>
                <option value="direct">Direct</option>
                <option value="practical">Practical</option>
                <option value="spiritual">Spiritual</option>
              </select>
            </div>

            {/* Insight Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insight Length
              </label>
              <select
                value={editForm.insight_length}
                onChange={(e) => setEditForm({ ...editForm, insight_length: e.target.value as InsightLength })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="brief">Brief</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <PreferenceRow
              label="Insight Style"
              value={formatStylePreference(profile.style_preference)}
            />
            <PreferenceRow
              label="Insight Length"
              value={formatInsightLength(profile.insight_length)}
            />
            <PreferenceRow
              label="Language"
              value={profile.language === 'en' ? 'English' : 'Vietnamese'}
            />
          </div>
        )}
      </div>

      {/* Numerology Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Core Numbers
        </h3>

        {coreNumbers ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <CoreNumberCard
              label="Life Path"
              value={coreNumbers.life_path}
              description="Your life's purpose"
            />
            <CoreNumberCard
              label="Destiny"
              value={coreNumbers.destiny_number}
              description="Your ultimate goal"
            />
            <CoreNumberCard
              label="Soul Urge"
              value={coreNumbers.soul_urge}
              description="Inner desires"
            />
            <CoreNumberCard
              label="Personality"
              value={coreNumbers.personality_number}
              description="Outer persona"
            />
            <CoreNumberCard
              label="Birthday"
              value={coreNumbers.birthday_number}
              description="Special gift"
            />
            <CoreNumberCard
              label="Maturity"
              value={coreNumbers.maturity_number}
              description="Later life path"
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Complete your profile to see your core numbers.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Format helpers
function formatStylePreference(style: StylePreference): string {
  const labels: Record<StylePreference, string> = {
    gentle: 'Gentle',
    direct: 'Direct',
    practical: 'Practical',
    spiritual: 'Spiritual',
  };
  return labels[style] || style;
}

function formatInsightLength(length: InsightLength): string {
  const labels: Record<InsightLength, string> = {
    brief: 'Brief',
    detailed: 'Detailed',
  };
  return labels[length] || length;
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
        {isMaster && <span className="text-xs ml-1 text-accent-400">Master</span>}
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
