-- Migration 001: Initial Schema
-- Personal Numerology Intelligence System MVP
-- Version: 1.0.0

-- UserProfile
-- Stores user identity and core personalization preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  style_preference TEXT NOT NULL CHECK(style_preference IN ('gentle', 'direct', 'practical', 'spiritual')),
  insight_length TEXT NOT NULL CHECK(insight_length IN ('brief', 'detailed')),
  language TEXT NOT NULL CHECK(language IN ('vi', 'en')),
  privacy_mode TEXT NOT NULL DEFAULT 'local_only',
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  onboarding_completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- NumerologyProfile (1:1 with UserProfile)
-- Stores current calculated numerology numbers - single version only
CREATE TABLE IF NOT EXISTS numerology_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  life_path INTEGER NOT NULL,
  destiny_number INTEGER NOT NULL,
  soul_urge INTEGER NOT NULL,
  personality_number INTEGER NOT NULL,
  birthday_number INTEGER NOT NULL,
  maturity_number INTEGER,
  calculated_at TEXT NOT NULL,
  calculation_version TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- DailyInsight
-- AI-generated daily insight - canonical source of truth
CREATE TABLE IF NOT EXISTS daily_insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  request_id TEXT NOT NULL,
  headline TEXT NOT NULL,
  theme TEXT NOT NULL,
  personal_day INTEGER NOT NULL,
  personal_month INTEGER NOT NULL,
  personal_year INTEGER NOT NULL,
  layers TEXT NOT NULL,
  confidence TEXT NOT NULL,
  metadata TEXT NOT NULL,
  is_fallback INTEGER NOT NULL DEFAULT 0,
  fallback_reason TEXT,
  generated_at TEXT NOT NULL,
  viewed_at TEXT,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- WhyThisInsight
-- Explainability data for insights
CREATE TABLE IF NOT EXISTS why_this_insights (
  id TEXT PRIMARY KEY,
  insight_id TEXT NOT NULL UNIQUE,
  request_id TEXT NOT NULL,
  data_sources TEXT NOT NULL,
  calculated_claims TEXT NOT NULL,
  interpretation_basis TEXT NOT NULL,
  confidence_breakdown TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE
);

-- JournalEntry
-- Daily journal with mood/energy/text
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK(mood_score BETWEEN 1 AND 10),
  energy_score INTEGER NOT NULL CHECK(energy_score BETWEEN 1 AND 10),
  emotions TEXT NOT NULL,
  reflection_text TEXT,
  key_events TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- InsightFeedback
-- User rating for insights
CREATE TABLE IF NOT EXISTS insight_feedback (
  id TEXT PRIMARY KEY,
  insight_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  was_relevant INTEGER,
  was_helpful INTEGER,
  most_useful_claim_type TEXT,
  feedback_text TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- NotificationPreferences (1:1 with UserProfile)
-- Reminder and notification behavior
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  morning_insight_enabled INTEGER NOT NULL DEFAULT 1,
  morning_insight_time TEXT NOT NULL DEFAULT '06:30:00',
  evening_journal_enabled INTEGER NOT NULL DEFAULT 1,
  evening_journal_time TEXT NOT NULL DEFAULT '21:00:00',
  quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  launch_on_startup INTEGER NOT NULL DEFAULT 0,
  sound_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- AppSettings
-- Application/system-level settings only
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- FallbackCache (derived from DailyInsight)
-- Cache snapshot for API failure recovery
CREATE TABLE IF NOT EXISTS fallback_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  insight_id TEXT NOT NULL,
  original_date TEXT NOT NULL,
  insight_json TEXT NOT NULL,
  personal_day INTEGER NOT NULL,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_insights_user_date ON daily_insights(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fallback_cache_user_date ON fallback_cache(user_id, original_date);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_insight ON insight_feedback(insight_id);

-- Insert default app settings
INSERT OR IGNORE INTO app_settings (id, key, value, updated_at) VALUES
  ('app-schema-version', 'schema_version', '"1.0.0"', datetime('now')),
  ('app-fallback-mode', 'fallback_mode_active', 'false', datetime('now')),
  ('app-onboarding-step', 'onboarding_step', '0', datetime('now'));
