// User types
export type StylePreference = 'gentle' | 'direct' | 'practical' | 'spiritual';
export type InsightLength = 'brief' | 'detailed';
export type Language = 'vi' | 'en';

export interface UserProfile {
  id: string;
  full_name: string;
  current_name: string | null;
  date_of_birth: string; // ISO 8601 date
  style_preference: StylePreference;
  insight_length: InsightLength;
  language: Language;
  privacy_mode: 'local_only';
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileInput {
  full_name: string;
  date_of_birth: string;
  style_preference: StylePreference;
  insight_length: InsightLength;
  language: Language;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  current_name?: string | null;
  date_of_birth?: string;
  style_preference?: StylePreference;
  insight_length?: InsightLength;
  language?: Language;
}
