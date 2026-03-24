/**
 * User Store
 * Manages user profile and authentication state
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@services/database';
import {
  UserProfile,
  CreateUserProfileInput,
  UpdateUserProfileInput,
} from '@/types';
import { getCurrentTimestamp } from '@utils/date';

// Helper to check if using localStorage mode
function isLocalStorageMode(): boolean {
  try {
    const db = getDatabase();
    return db?.type === 'localStorage';
  } catch {
    // Database not initialized yet - default to localStorage mode
    return true;
  }
}

// Helper to get profile (handles both initialized and uninitialized database)
function safeGetProfile(): UserProfile | null {
  try {
    return getProfileFromStorage();
  } catch {
    return null;
  }
}

// LocalStorage keys
const PROFILE_KEY = 'user_profile';

// Helper functions for localStorage
function getProfileFromStorage(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

function saveProfileToStorage(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

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
      let profile: UserProfile | null = null;

      if (isLocalStorageMode()) {
        profile = safeGetProfile();
      } else {
        // SQLite mode - would need proper implementation
        profile = null;
      }

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

    if (isLocalStorageMode()) {
      saveProfileToStorage(profile);
    }

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
    const updatedProfile = { ...profile, ...input, updated_at: now };

    if (isLocalStorageMode()) {
      saveProfileToStorage(updatedProfile);
    }

    set({ profile: updatedProfile });
  },

  // Mark onboarding as complete
  completeOnboarding: async () => {
    const { profile } = get();
    if (!profile) {
      throw new Error('No profile to complete onboarding');
    }

    const now = getCurrentTimestamp();
    const updatedProfile = {
      ...profile,
      onboarding_completed: true,
      onboarding_completed_at: now,
      updated_at: now,
    };

    if (isLocalStorageMode()) {
      saveProfileToStorage(updatedProfile);
    }

    set({
      profile: updatedProfile,
      isOnboarded: true,
    });
  },

  // Clear any error
  clearError: () => set({ error: null }),
}));
