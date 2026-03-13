# State & Data Model
# Personal Numerology Intelligence System — MVP

**Version:** 1.1
**Date:** 2024
**Status:** Implementation Ready
**Scope:** MVP Only

---

## 1. Purpose

This document defines the **implementation-facing data model** for the MVP, covering all entities, schemas, relationships, and storage requirements for local-only operation.

**Audience:** Backend developers, Database engineers, QA

**Source Documents:**
- `PRD-Numerology-Intelligence-System-v1.1.md`
- `MVP-Feature-Cut-v1.2.md`
- `Prompt-Output-Contract-v1.2.md`

---

## 2. MVP Scope Boundaries

| Item | IN MVP | NOT in MVP |
|------|--------|------------|
| Storage | Local SQLite only | Cloud sync, multi-device |
| User Profiles | Single profile per device | Multi-profile |
| Insights | Daily insight + Fallback cache | Weekly/Monthly reports |
| Journal | Quick entry (mood, energy, text, tags) | Voice notes, photos |
| Claims | Calculated, Interpreted, Exploratory | Observed (requires pattern engine) |
| Memory | Current profile + today's numbers | Pattern detection, retrieval |
| Notifications | Desktop preferences | Mobile push, email |

---

## 3. Core Entities

| Entity | Purpose | Storage |
|--------|---------|---------|
| `UserProfile` | User identity and core personal preferences | SQLite |
| `NumerologyProfile` | Current calculated numerology numbers (single version) | SQLite |
| `DailyInsight` | AI-generated daily insight (canonical source) | SQLite |
| `WhyThisInsight` | Explainability data for insight | SQLite |
| `JournalEntry` | Daily journal with mood/energy/text | SQLite |
| `InsightFeedback` | User rating for an insight | SQLite |
| `NotificationPreferences` | Desktop notification behavior | SQLite |
| `AppSettings` | Application/system-level settings only | SQLite |
| `FallbackCache` | Snapshot cache for API failure recovery | SQLite |

---

## 4. Entity Schemas

### 4.1. UserProfile

**Purpose:** User identity and core personalization preferences.

**Ownership Boundary:** Identity + preferences only. Does NOT include notification behavior or system settings.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Unique user identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `full_name` | string(100) | Yes | User's full name | `"Alex Nguyen"` |
| `date_of_birth` | date | Yes | ISO 8601 date | `"1990-05-15"` |
| `style_preference` | enum | Yes | `gentle`, `direct`, `practical`, `spiritual` | `"practical"` |
| `insight_length` | enum | Yes | `brief` or `detailed` | `"detailed"` |
| `language` | enum | Yes | `vi` or `en` | `"en"` |
| `privacy_mode` | enum | Yes | MVP: `local_only` only | `"local_only"` |
| `onboarding_completed` | boolean | Yes | Whether onboarding finished | `true` |
| `onboarding_completed_at` | timestamp | No | When onboarding finished | `"2024-01-15T06:30:00Z"` |
| `created_at` | timestamp | Yes | Record creation time | `"2024-01-15T06:00:00Z"` |
| `updated_at` | timestamp | Yes | Last update time | `"2024-01-20T14:22:00Z"` |

---

### 4.2. NumerologyProfile

**Purpose:** Stores the **current** calculated numerology numbers. Single version only — no history.

**Note:** When profile changes (name/DOB update), this record is **updated in place**, not versioned. Historical numerology versions are NOT stored in MVP.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Unique profile identifier | `660e8400-e29b-41d4-a716-446655440000` |
| `user_id` | UUID | Yes | FK to UserProfile (1:1) | `550e8400-e29b-41d4-a716-446655440000` |
| `life_path` | integer | Yes | 1-9, 11, 22, or 33 | `5` |
| `destiny_number` | integer | Yes | 1-9, 11, 22, or 33 | `7` |
| `soul_urge` | integer | Yes | 1-9, 11, 22, or 33 | `3` |
| `personality_number` | integer | Yes | 1-9, 11, 22, or 33 | `8` |
| `birthday_number` | integer | Yes | 1-9, 11, 22, or 33 | `5` |
| `maturity_number` | integer | No | Life Path + Destiny | `3` |
| `calculated_at` | timestamp | Yes | When numbers calculated | `"2024-01-15T06:00:00Z"` |
| `calculation_version` | string | Yes | Calculation engine version | `"1.0.0"` |

**Validation:** All number fields must be 1-9, 11, 22, or 33.

---

### 4.3. DailyInsight

**Purpose:** AI-generated daily insight. **This is the canonical source of truth.** FallbackCache is derived from this.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Unique insight identifier | `770e8400-...` |
| `user_id` | UUID | Yes | FK to UserProfile | `550e8400-...` |
| `date` | date | Yes | Date this insight is for | `"2024-01-15"` |
| `request_id` | UUID | Yes | Correlation ID for API | `880e8400-...` |
| `headline` | string(100) | Yes | 5-10 word headline | `"A Day for Completion..."` |
| `theme` | string(50) | Yes | 1-3 word theme | `"Integration"` |
| `personal_day` | integer | Yes | Personal Day number | `9` |
| `personal_month` | integer | Yes | Personal Month number | `3` |
| `personal_year` | integer | Yes | Personal Year number | `1` |
| `layers` | JSON | Yes | See §4.4 | `{...}` |
| `confidence` | JSON | Yes | See §4.5 | `{...}` |
| `metadata` | JSON | Yes | See §4.6 | `{...}` |
| `is_fallback` | boolean | Yes | Fallback insight flag | `false` |
| `fallback_reason` | enum | No | `timeout`, `error`, `no_cache`, `invalid_response` | `null` |
| `generated_at` | timestamp | Yes | Generation timestamp | `"2024-01-15T06:00:00Z"` |
| `viewed_at` | timestamp | No | First view timestamp | `"2024-01-15T07:15:00Z"` |

---

### 4.4. InsightLayer (Embedded in DailyInsight.layers)

**Standardized Storage:** `deep` is **omitted** when not generated, never an empty object.

```json
{
  "quick": {
    "content": "string (2-3 sentences)",
    "claims": ["array of Claim objects"]
  },
  "standard": {
    "content": "string (3-5 paragraphs)",
    "claims": ["array of Claim objects"]
  }
}
```

**When deep is generated:**
```json
{
  "quick": { "content": "...", "claims": [...] },
  "standard": { "content": "...", "claims": [...] },
  "deep": {
    "content": "string (5-8 paragraphs)",
    "claims": ["array of Claim objects"],
    "exploratory_questions": ["string", "string"]
  }
}
```

**Rules:**
- `quick`: Always present
- `standard`: Always present
- `deep`: **Omitted** when not generated (not `{}`)

---

### 4.5. Claim (Embedded)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | Yes | `calculated`, `interpreted`, `exploratory` |
| `text` | string | Yes | Claim text with marker |
| `confidence` | float | Yes | 1.0 / 0.6 / 0.7 / 0.8 / null |
| `source` | string | No | Data source description |

---

### 4.6. Confidence & Metadata (Embedded)

**Confidence:**
```json
{
  "overall": 0.7,
  "breakdown": { "calculated": 1.0, "interpreted": 0.7 }
}
```

**Metadata:**
```json
{
  "schema_version": "1.0",
  "prompt_version": "1.0.0",
  "model": "deepseek-reasoner",
  "claim_types_used": ["calculated", "interpreted"],
  "word_counts": { "quick": 32, "standard": 185 },
  "processing_time_ms": 3420
}
```

---

### 4.7. WhyThisInsight

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `insight_id` | UUID | Yes | FK to DailyInsight (unique) |
| `request_id` | UUID | Yes | Correlation ID |
| `data_sources` | JSON | Yes | Profile completeness, data available |
| `calculated_claims` | JSON | Yes | Array with formula for primary claims |
| `interpretation_basis` | JSON | Yes | Style, context, versions |
| `confidence_breakdown` | JSON | Yes | Data, interpretation, overall |
| `generated_at` | timestamp | Yes | Generation timestamp |

---

### 4.8. JournalEntry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique entry identifier |
| `user_id` | UUID | Yes | FK to UserProfile |
| `date` | date | Yes | Entry date |
| `mood_score` | integer | Yes | 1-10 |
| `energy_score` | integer | Yes | 1-10 |
| `emotions` | JSON | Yes | Array of emotion tags |
| `reflection_text` | text | No | Free-form reflection |
| `key_events` | JSON | No | Array of event objects |
| `created_at` | timestamp | Yes | Creation timestamp |
| `updated_at` | timestamp | Yes | Last update timestamp |

---

### 4.9. InsightFeedback

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `insight_id` | UUID | Yes | FK to DailyInsight |
| `user_id` | UUID | Yes | FK to UserProfile |
| `rating` | integer | Yes | 1-5 stars |
| `was_relevant` | boolean | No | Relevance flag |
| `was_helpful` | boolean | No | Helpfulness flag |
| `most_useful_claim_type` | enum | No | `calculated`, `interpreted`, `exploratory` |
| `feedback_text` | text | No | Optional feedback |
| `created_at` | timestamp | Yes | Submission timestamp |

---

### 4.10. NotificationPreferences

**Purpose:** Reminder and notification behavior only.

**Ownership Boundary:** Does NOT include identity or core preferences.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `user_id` | UUID | Yes | FK to UserProfile (unique) |
| `morning_insight_enabled` | boolean | Yes | Morning notification enabled |
| `morning_insight_time` | time | Yes | Morning notification time |
| `evening_journal_enabled` | boolean | Yes | Evening reminder enabled |
| `evening_journal_time` | time | Yes | Evening reminder time |
| `quiet_hours_enabled` | boolean | Yes | Quiet hours active |
| `quiet_hours_start` | time | No | Quiet hours start |
| `quiet_hours_end` | time | No | Quiet hours end |
| `launch_on_startup` | boolean | Yes | Auto-start with OS |
| `sound_enabled` | boolean | Yes | Notification sound |
| `created_at` | timestamp | Yes | Creation timestamp |
| `updated_at` | timestamp | Yes | Last update timestamp |

---

### 4.11. AppSettings

**Purpose:** Application/system-level settings ONLY. Not user preferences.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `key` | string(100) | Yes | Setting key (unique) |
| `value` | JSON | Yes | Setting value |
| `updated_at` | timestamp | Yes | Last update timestamp |

**Standard Keys:**
| Key | Purpose | Value Type |
|-----|---------|------------|
| `schema_version` | DB schema version | string |
| `last_api_health_check` | API health status | object |
| `last_insight_generation` | Last successful generation | timestamp |
| `fallback_mode_active` | Fallback mode status | boolean |
| `onboarding_step` | Current onboarding step | integer |

---

### 4.12. FallbackCache

**Purpose:** Cache snapshot for API failure recovery. **Derived data** — DailyInsight is the canonical source.

**Role:** This is a **secondary cache**, not the source of truth. It stores a copy of recent insights for quick fallback retrieval.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `user_id` | UUID | Yes | FK to UserProfile |
| `insight_id` | UUID | Yes | FK to original DailyInsight |
| `original_date` | date | Yes | Date of original insight |
| `insight_json` | JSON | Yes | Snapshot of insight JSON |
| `personal_day` | integer | Yes | PD for quick matching |
| `times_used` | integer | Yes | Fallback usage count |
| `created_at` | timestamp | Yes | Cache creation timestamp |
| `last_used_at` | timestamp | No | Last fallback usage |

---

## 5. Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIPS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  UserProfile (1) ─────────── (1) NumerologyProfile                   │
│       │                                                               │
│       │                                                               │
│       ├─── (1:N) ── DailyInsight ──── (1:1) ── WhyThisInsight        │
│       │                  │                                            │
│       │                  └─── (1:N) ── InsightFeedback                │
│       │                                                               │
│       ├─── (1:N) ── JournalEntry                                      │
│       │                                                               │
│       ├─── (1:1) ── NotificationPreferences                           │
│       │                                                               │
│       └─── (1:N) ── FallbackCache (derived)                           │
│                                                                       │
│  AppSettings (independent, system-level only)                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Relationship Summary:**

| From | To | Type | Notes |
|------|-----|------|-------|
| UserProfile | NumerologyProfile | **1:1** | One numerology profile per user |
| UserProfile | DailyInsight | 1:N | Many daily insights |
| DailyInsight | WhyThisInsight | 1:1 | Optional explainability |
| DailyInsight | InsightFeedback | 1:N | Zero or more feedback entries |
| UserProfile | JournalEntry | 1:N | Many journal entries |
| UserProfile | NotificationPreferences | **1:1** | One preference set |
| UserProfile | FallbackCache | 1:N | Derived cache entries |
| AppSettings | — | Independent | System-level only |

---

## 6. Write/Update Flows

### 6.1. Onboarding Complete

```
1. Create UserProfile
   INSERT INTO user_profiles (id, full_name, date_of_birth, style_preference, ...)
   VALUES (...)

2. Create NumerologyProfile (calculated from name/DOB)
   INSERT INTO numerology_profiles (id, user_id, life_path, ...)
   VALUES (...)

3. Create NotificationPreferences (defaults)
   INSERT INTO notification_preferences (id, user_id, ...)
   VALUES (...)

4. Update onboarding status
   UPDATE user_profiles
   SET onboarding_completed = 1, onboarding_completed_at = NOW()
   WHERE id = ?
```

### 6.2. Daily Insight Generation

```
1. Check for existing insight today
   SELECT * FROM daily_insights WHERE user_id = ? AND date = TODAY

2. If exists, return cached insight

3. If not exists:
   a. Generate via AI API
   b. INSERT INTO daily_insights (...)
   c. INSERT INTO why_this_insights (...)
   d. UPDATE fallback_cache (refresh with new insight)
```

### 6.3. Profile Update

```
1. Update UserProfile
   UPDATE user_profiles
   SET full_name = ?, style_preference = ?, updated_at = NOW()
   WHERE id = ?

2. If name or DOB changed:
   a. Recalculate NumerologyProfile
   b. UPDATE numerology_profiles
      SET life_path = ?, destiny_number = ?, ..., calculated_at = NOW()
      WHERE user_id = ?
   (No history stored - single version only)
```

### 6.4. Feedback Submission

```
1. Validate insight exists
   SELECT * FROM daily_insights WHERE id = ?

2. Insert feedback
   INSERT INTO insight_feedback (id, insight_id, user_id, rating, ...)
   VALUES (...)

3. Optionally update insight metadata (if needed)
```

### 6.5. Daily Cleanup Job (03:00 local)

```
1. Delete old insights (90+ days)
   DELETE FROM daily_insights
   WHERE generated_at < NOW() - INTERVAL 90 DAYS

2. Cascade delete orphans
   DELETE FROM why_this_insights
   WHERE insight_id NOT IN (SELECT id FROM daily_insights)

   DELETE FROM insight_feedback
   WHERE insight_id NOT IN (SELECT id FROM daily_insights)

3. Delete old journal entries (365+ days)
   DELETE FROM journal_entries
   WHERE created_at < NOW() - INTERVAL 365 DAYS

4. Delete old fallback cache (7+ days)
   DELETE FROM fallback_cache
   WHERE created_at < NOW() - INTERVAL 7 DAYS

5. Weekly: VACUUM database
```

---

## 7. SQLite Schema

**Database:** `~/.numerology-app/data.db`

```sql
-- UserProfile
CREATE TABLE user_profiles (
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
CREATE TABLE numerology_profiles (
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
CREATE TABLE daily_insights (
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
CREATE TABLE why_this_insights (
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
CREATE TABLE journal_entries (
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
CREATE TABLE insight_feedback (
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
CREATE TABLE notification_preferences (
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
CREATE TABLE app_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- FallbackCache (derived from DailyInsight)
CREATE TABLE fallback_cache (
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

-- Indexes
CREATE INDEX idx_daily_insights_user_date ON daily_insights(user_id, date);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date);
CREATE INDEX idx_fallback_cache_user_date ON fallback_cache(user_id, original_date);
CREATE INDEX idx_insight_feedback_insight ON insight_feedback(insight_id);
```

---

## 8. Retention Rules

| Entity | Retention | Notes |
|--------|-----------|-------|
| UserProfile | Permanent | Until user deletes |
| NumerologyProfile | Permanent | Updated in place, no history |
| DailyInsight | 90 days | Auto-delete |
| WhyThisInsight | 90 days | Cascade with insight |
| JournalEntry | 365 days | Rolling retention |
| InsightFeedback | 90 days | Cascade with insight |
| NotificationPreferences | Permanent | Cascade with user |
| AppSettings | Permanent | Application lifecycle |
| FallbackCache | 7 days | Refreshed with new insights |

---

## 9. Validation Rules

| Field Type | Validation |
|------------|------------|
| UUID | Valid UUID v4 |
| Date | ISO 8601: `YYYY-MM-DD` |
| Timestamp | ISO 8601: `YYYY-MM-DDTHH:MM:SSZ` |
| Time | 24-hour: `HH:MM:SS` |
| Enum | Must match predefined values |
| JSON | Valid JSON |

**Entity-Specific:**
- Numerology numbers: 1-9, 11, 22, or 33
- Mood/Energy: 1-10
- Rating: 1-5
- `layers.deep`: Omitted when not generated (not `{}`)

---

## 10. Deferred Entities (NOT in MVP)

| Entity | Why Deferred |
|--------|--------------|
| Pattern | Requires pattern engine |
| ObservedClaim | Requires pattern engine |
| WeeklyReport | Not in MVP scope |
| MonthlyReport | Not in MVP scope |
| MemoryFragment | Requires memory engine |
| NumerologyHistory | Single version only in MVP |
| Goal | Not in MVP scope |
| VoiceNote | Not in MVP scope |
| PhotoAttachment | Not in MVP scope |
| SyncState | Cloud sync not in MVP |

---

## 11. Integration Checklist

- [ ] SQLite schema matches this document
- [ ] All foreign keys with CASCADE delete
- [ ] NumerologyProfile is 1:1 with UserProfile
- [ ] NotificationPreferences is 1:1 with UserProfile
- [ ] `layers.deep` omitted (not `{}`) when not generated
- [ ] FallbackCache treated as derived data
- [ ] Write flows implemented as specified
- [ ] Cleanup job scheduled
- [ ] Timestamps in UTC
- [ ] UUID v4 generation

---

## Changelog (v1.0 → v1.1)

| Change | Description |
|--------|-------------|
| Relationship consistency | UserProfile ↔ NumerologyProfile now 1:1 everywhere (ER diagram + table) |
| Ownership boundaries | Clarified: UserProfile (identity), NotificationPreferences (reminders), AppSettings (system only) |
| NumerologyProfile | Single version only; no history stored in MVP |
| DailyInsight.layers | `deep` omitted when not generated, not empty object `{}` |
| FallbackCache role | Clarified as derived cache; DailyInsight is canonical source |
| Write flows added | §6: onboarding, insight gen, profile update, feedback, cleanup |
| Concise format | Simplified entity tables and removed redundancy |

---

**End of State & Data Model v1.1**
