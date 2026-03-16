/**
 * User Store
 * Manages user profile and authentication state
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '@services/database';
import {
  UserProfile,
  CreateUserProfileInput,
  UpdateUserProfileInput,
} from '@/types';
import { getCurrentTimestamp } from '@utils/date';

interface UserState {
  // State
  profile: UserProfile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  createProfile: (input: CreateUserProfileInput) => Promise<UserProfile>;
  updateProfile: (input: UpdateUserProfileInput) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  profile: null,
  isOnboarded: false,
  isLoading: false,
  error: null,

  // Load existing profile from database
  loadProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const profile = dbQuery.get<UserProfile>(
        'SELECT * FROM user_profiles LIMIT 1'
      );

      if (profile) {
        set({
          profile,
          isOnboarded: profile.onboarding_completed === true,
          isLoading: false,
        });
      } else {
        set({ profile: null, isOnboarded: false, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load profile', isLoading: false });
      console.error('Failed to load profile:', error);
    }
  },

  // Create a new user profile
  createProfile: async (input: CreateUserProfileInput) => {
    const now = getCurrentTimestamp();
    const id = uuidv4();

    const profile: UserProfile = {
      id,
      full_name: input.full_name,
      date_of_birth: input.date_of_birth,
      style_preference: input.style_preference,
      insight_length: input.insight_length,
      language: input.language,
      privacy_mode: 'local_only',
      onboarding_completed: false,
      onboarding_completed_at: null,
      created_at: now,
      updated_at: now,
    };

    dbQuery.run(
      `INSERT INTO user_profiles (
        id, full_name, date_of_birth, style_preference, insight_length,
        language, privacy_mode, onboarding_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.full_name,
        profile.date_of_birth,
        profile.style_preference,
        profile.insight_length,
        profile.language,
        profile.privacy_mode,
        profile.onboarding_completed ? 1 : 0,
        profile.created_at,
        profile.updated_at,
      ]
    );

    set({ profile, isOnboarded: false });
    return profile;
  },

  // Update user profile
  updateProfile: async (input: UpdateUserProfileInput) => {
    const { profile } = get();
    if (!profile) {
      throw new Error('No profile to update');
    }

    const now = getCurrentTimestamp();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    // Build dynamic update query
    if (input.full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(input.full_name);
    }
    if (input.date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      values.push(input.date_of_birth);
    }
    if (input.style_preference !== undefined) {
      updates.push('style_preference = ?');
      values.push(input.style_preference);
    }
    if (input.insight_length !== undefined) {
      updates.push('insight_length = ?');
      values.push(input.insight_length);
    }
    if (input.language !== undefined) {
      updates.push('language = ?');
      values.push(input.language);
    }

    updates.push('updated_at = ?');
    values.push(now);

    values.push(profile.id);

    dbQuery.run(
      `UPDATE user_profiles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedProfile = { ...profile, ...input, updated_at: now };
    set({ profile: updatedProfile });
  },

  // Mark onboarding as complete
  completeOnboarding: async () => {
    const { profile } = get();
    if (!profile) {
      throw new Error('No profile to complete onboarding');
    }

    const now = getCurrentTimestamp();

    dbQuery.run(
      `UPDATE user_profiles
       SET onboarding_completed = 1, onboarding_completed_at = ?, updated_at = ?
       WHERE id = ?`,
      [now, now, profile.id]
    );

    set({
      profile: {
        ...profile,
        onboarding_completed: true,
        onboarding_completed_at: now,
        updated_at: now,
      },
      isOnboarded: true,
    });
  },

  // Clear any error
  clearError: () => set({ error: null }),
}));
