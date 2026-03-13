# Implementation Plan & Build Order
# Personal Numerology Intelligence System — MVP

**Version:** 1.1
**Date:** 2024
**Status:** Implementation Ready
**Scope:** MVP Only

---

## 1. Purpose

This document defines the **build-facing implementation plan** for the MVP, organized by phases, dependencies, and checkpoints. It tells GLM/dev exactly what to build first, in what order.

**Audience:** Developers, GLM, Product Owner

**Source Documents:**
- `PRD-Numerology-Intelligence-System-v1.1.md`
- `MVP-Feature-Cut-v1.2.md`
- `Prompt-Output-Contract-v1.2.md`
- `State-Data-Model-v1.1.md`

---

## 2. MVP Build Principles

| Principle | Description |
|-----------|-------------|
| **Local-first** | All data stored in SQLite, no cloud dependency |
| **Fallback-ready** | Every AI call has fallback to cached or generic insight |
| **Trust by design** | Claim types visible, calculations explainable |
| **Desktop-only** | macOS 10.14+ and Windows 10+ only |
| **6-week timeline** | Target 6 weeks from start to MVP launch |
| **Stop and verify** | Checkpoints after each major phase |

---

## 3. Phase-by-Phase Build Order

### Phase 1: Infrastructure (Week 1)

**Goal:** App launches, database works, basic UI skeleton.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P1.1 Project Setup** | Initialize Tauri project, React + TypeScript, Tailwind CSS | — |
| **P1.2 Database Layer** | Implement SQLite schema from State-Data-Model-v1.1.md, migrations | P1.1 |
| **P1.3 Core Services** | Config manager, logger, error handler, date utilities | P1.1 |
| **P1.4 UI Skeleton** | App shell, navigation, empty screens | P1.1 |

**Stop & Verify Checkpoint:**
- [ ] App launches on macOS and Windows
- [ ] SQLite database creates successfully
- [ ] Basic UI renders without errors
- [ ] Logs write to file

**Product Owner Verification:**
- [ ] App icon and name correct
- [ ] Window size and position appropriate
- [ ] No placeholder text visible
- [ ] App closes cleanly (no background processes)

---

### Phase 2: Numerology Engine (Week 2)

**Goal:** All numerology calculations correct and verifiable.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P2.1 Core Numbers** | Life Path, Destiny, Soul Urge, Personality, Birthday, Maturity | P1.2 |
| **P2.2 Cyclic Numbers** | Personal Year, Personal Month, Personal Day | P2.1 |
| **P2.3 Numerology Service** | Aggregate orchestrator, input validation, reduction utilities | P2.1, P2.2 |
| **P2.4 Calculation Tests** | Unit tests for all calculations, edge cases (master numbers) | P2.3 |

**Stop & Verify Checkpoint:**
- [ ] All core numbers calculate correctly (verify against test cases)
- [ ] Cyclic numbers correct for any date
- [ ] Master numbers (11, 22, 33) handled correctly
- [ ] 100% unit test coverage for numerology module

**Product Owner Verification:**
- [ ] Verify 3-5 known birth dates produce expected core numbers
- [ ] Personal Year for current year matches manual calculation
- [ ] Edge case: "Y" handling in name calculations documented
- [ ] Edge case: Master numbers not reduced (11, 22 stay as-is)

---

### Phase 3: Daily Insight Engine (Week 3)

**Goal:** AI generates valid insights, fallback works when API fails.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P3.1 LLM Client** | Generic LLM API client (DeepSeek default), retry logic, timeout (10s), error classification | P1.3 |
| **P3.2 Prompt Builder** | System prompt, user context payload, numerology context formatter | P2.3 |
| **P3.3 Response Parser** | JSON parser, claim extractor, confidence calculator, layer parser | P3.1 |
| **P3.4 Validation Layer** | Schema validation, language patterns, claim compliance, confidence buckets | P3.3 |
| **P3.5 Fallback System** | Template renderer, cache manager, two-tier fallback logic | P3.4, P1.2 |
| **P3.6 Insight Service** | Orchestrates P3.1–P3.5, stores to DailyInsight table | P3.1–P3.5 |

**Stop & Verify Checkpoint:**
- [ ] Insight generates within 10s
- [ ] Output JSON matches schema from Prompt-Output-Contract-v1.2.md
- [ ] At least 1 Calculated + 1 Interpreted claim present (Exploratory optional)
- [ ] Fallback activates when API fails (timeout, error, invalid response)
- [ ] Retry logic works (3 retries with backoff)
- [ ] No predictive language in generated insights

**Product Owner Verification:**
- [ ] Generate 5 sample insights, review for quality
- [ ] Check: No "will happen" or "is going to" language
- [ ] Check: Each claim has appropriate badge ([Calculated]/[Interpreted]/[Exploratory])
- [ ] Disconnect network → fallback insight appears with "limited" message
- [ ] Confidence scores displayed and make sense (Calculated = 1.0, Interpreted = 0.6–0.8)

---

### Phase 4: Journal & UI (Week 4)

**Goal:** Journal saves correctly, UI displays insights, feedback works.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P4.1 Journal Entry UI** | Mood slider, energy slider, emotion tags, reflection text | P1.4 |
| **P4.2 Journal Service** | CRUD operations, validation, storage to JournalEntry table | P1.2, P4.1 |
| **P4.3 Insight Display UI** | Today's insight, layer toggle (Quick/Standard/Deep), claim badges | P3.6, P1.4 |
| **P4.4 Insight Feedback UI** | Star rating (1-5), relevance toggle, claim type selection | P4.3 |
| **P4.5 Why This Insight Modal** | Calculated claims, formula breakdown, confidence explanation | P3.6, P1.4 |
| **P4.6 Dashboard** | Main screen combining insight + journal prompt + navigation | P4.1–P4.5 |

**Stop & Verify Checkpoint:**
- [ ] Journal entry saves with mood/energy/emotions
- [ ] Insight displays correctly with Quick + Standard layers (Deep only when present)
- [ ] Feedback submits and persists to InsightFeedback table
- [ ] "Why This Insight?" shows calculation breakdown
- [ ] Dashboard loads in < 2s

**Product Owner Verification:**
- [ ] Mood/Energy sliders feel responsive (drag smoothly)
- [ ] Emotion tags match MVP list (no missing or extra tags)
- [ ] Quick layer loads first, Standard shows on toggle
- [ ] Star rating highlights on hover, persists on click
- [ ] "Why This Insight?" modal shows numerology formulas with user's numbers
- [ ] Close and reopen app → today's insight still visible

---

### Phase 5: Onboarding & Notifications (Week 5)

**Goal:** User completes onboarding in < 5 min, notifications work.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P5.1 Onboarding Flow** | Welcome, name/DOB input, style preference, language, notification time | P1.4, P2.3 |
| **P5.2 First Insight** | Trigger insight generation after onboarding complete | P5.1, P3.6 |
| **P5.3 Profile Management** | View/edit profile, recalculate numerology on name/DOB change | P5.1, P2.3 |
| **P5.4 Notification Service** | macOS/Windows notifications, scheduling, quiet hours | P1.3 |
| **P5.5 Notification Settings UI** | Morning/evening times, quiet hours, sound, launch on startup | P5.4, P1.4 |

**Stop & Verify Checkpoint:**
- [ ] Onboarding completes in < 5 minutes
- [ ] First insight generates after onboarding
- [ ] Profile updates trigger numerology recalculation
- [ ] Notifications work on both macOS and Windows
- [ ] Quiet hours suppress notifications
- [ ] Launch on startup NOT default (false)

**Product Owner Verification:**
- [ ] Walk through onboarding as new user — note time to first insight
- [ ] All 4 style options visible (Gentle/Direct/Practical/Spiritual)
- [ ] Notification permission prompt appears (macOS/Windows)
- [ ] Set notification for 1 minute ahead → notification appears
- [ ] Edit name in profile → core numbers recalculate immediately
- [ ] "Skip for now" option exists for optional fields

---

### Phase 6: Polish & Launch (Week 6)

**Goal:** App stable, tests pass, ready for launch.

| Module | Tasks | Depends On |
|--------|-------|------------|
| **P6.1 Error Handling** | Global error boundary, user-friendly messages, recovery | All |
| **P6.2 Performance** | Query optimization, caching, lazy loading | All |
| **P6.3 Cleanup Jobs** | 90-day insight retention, 365-day journal, 7-day cache | P1.2 |
| **P6.4 Human Review** | Review 50+ insights using PRD §15 rubric | P3.6 |
| **P6.5 Final Testing** | Full regression, E2E tests, manual QA | All |
| **P6.6 Build & Sign** | Code signing for macOS/Windows, build pipeline | All |

**Stop & Verify Checkpoint:**
- [ ] All automated tests pass
- [ ] No critical bugs
- [ ] App crash rate < 1%
- [ ] Human review: ≥80% of insights score ≥3.0 weighted average
- [ ] Build succeeds for both platforms
- [ ] Code signing works

**Product Owner Verification:**
- [ ] Fresh install on clean macOS machine — app launches
- [ ] Fresh install on clean Windows machine — app launches
- [ ] No console errors in production build
- [ ] Uninstall removes all app data (or keeps per user choice)
- [ ] Human review spreadsheet complete with all 6 dimensions scored
- [ ] Final sign-off from stakeholder

---

## 4. Module Breakdown

### Phase 1 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P1.1 | `src-tauri/`, `package.json`, `vite.config.ts`, `tailwind.config.js` | App initialization |
| P1.2 | `src/services/database.ts`, `src/db/migrations/` | SQLite connection, schema creation |
| P1.3 | `src/services/config.ts`, `src/utils/logger.ts`, `src/utils/date.ts` | App utilities |
| P1.4 | `src/App.tsx`, `src/components/layout/` | UI shell |

### Phase 2 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P2.1 | `src/services/numerology/core.ts` | `calculateLifePath()`, `calculateDestiny()`, etc. |
| P2.2 | `src/services/numerology/cyclic.ts` | `calculatePersonalYear()`, `calculatePersonalMonth()`, `calculatePersonalDay()` |
| P2.3 | `src/services/numerology/index.ts` | `getFullNumerologyProfile()` |
| P2.4 | `src/services/numerology/__tests__/` | Unit tests |

### Phase 3 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P3.1 | `src/services/api/llm.ts` | `callLLMAPI()`, `retryWithBackoff()` |
| P3.2 | `src/services/insight/prompt.ts` | `buildPromptPayload()` |
| P3.3 | `src/services/insight/parser.ts` | `parseInsightResponse()` |
| P3.4 | `src/services/insight/validation.ts` | `validateInsight()`, `checkForbiddenPatterns()` |
| P3.5 | `src/services/insight/fallback.ts` | `getCachedInsight()`, `generateGenericInsight()` |
| P3.6 | `src/services/insight/index.ts` | `generateDailyInsight()` |

### Phase 4 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P4.1 | `src/components/journal/JournalEntry.tsx` | Mood/energy sliders, emotion tags |
| P4.2 | `src/services/journal.ts` | `createEntry()`, `updateEntry()`, `getEntry()` |
| P4.3 | `src/components/insight/InsightDisplay.tsx` | Layer toggle, claim badges |
| P4.4 | `src/components/insight/InsightFeedback.tsx` | Star rating, relevance toggle |
| P4.5 | `src/components/insight/WhyThisInsight.tsx` | Formula breakdown modal |
| P4.6 | `src/screens/Dashboard.tsx` | Main dashboard |

### Phase 5 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P5.1 | `src/screens/Onboarding.tsx` | Multi-step onboarding |
| P5.2 | `src/services/insight/firstInsight.ts` | `generateFirstInsight()` |
| P5.3 | `src/screens/Profile.tsx` | Profile edit, recalculation |
| P5.4 | `src/services/notification.ts` | `scheduleNotification()`, `checkQuietHours()` |
| P5.5 | `src/screens/Settings.tsx` | Notification preferences |

### Phase 6 Modules

| Module | Files | Key Functions |
|--------|-------|---------------|
| P6.1 | `src/components/ErrorBoundary.tsx` | Global error handling |
| P6.2 | `src/utils/performance.ts` | Query optimization, caching |
| P6.3 | `src/services/cleanup.ts` | `runDailyCleanup()` |
| P6.4 | Manual process | Human review spreadsheet |
| P6.5 | `tests/` | E2E tests |
| P6.6 | `src-tauri/tauri.conf.json` | Build configuration |

---

## 5. Dependency Graph

```
Phase 1: Infrastructure
├── P1.1 Project Setup
├── P1.2 Database Layer ──────── depends on P1.1
├── P1.3 Core Services ────────── depends on P1.1
└── P1.4 UI Skeleton ──────────── depends on P1.1

Phase 2: Numerology Engine
├── P2.1 Core Numbers ─────────── depends on P1.2
├── P2.2 Cyclic Numbers ───────── depends on P2.1
├── P2.3 Numerology Service ───── depends on P2.1, P2.2
└── P2.4 Calculation Tests ────── depends on P2.3

Phase 3: Daily Insight Engine
├── P3.1 LLM Client ───────────── depends on P1.3
├── P3.2 Prompt Builder ───────── depends on P2.3
├── P3.3 Response Parser ──────── depends on P3.1
├── P3.4 Validation Layer ─────── depends on P3.3
├── P3.5 Fallback System ──────── depends on P3.4, P1.2
└── P3.6 Insight Service ──────── depends on P3.1–P3.5

Phase 4: Journal & UI
├── P4.1 Journal Entry UI ─────── depends on P1.4
├── P4.2 Journal Service ──────── depends on P1.2, P4.1
├── P4.3 Insight Display UI ───── depends on P3.6, P1.4
├── P4.4 Insight Feedback UI ──── depends on P4.3
├── P4.5 Why This Insight ─────── depends on P3.6, P1.4
└── P4.6 Dashboard ────────────── depends on P4.1–P4.5

Phase 5: Onboarding & Notifications
├── P5.1 Onboarding Flow ──────── depends on P1.4, P2.3
├── P5.2 First Insight ────────── depends on P5.1, P3.6
├── P5.3 Profile Management ───── depends on P5.1, P2.3
├── P5.4 Notification Service ─── depends on P1.3
└── P5.5 Notification Settings ── depends on P5.4, P1.4

Phase 6: Polish & Launch
├── P6.1 Error Handling ───────── depends on All
├── P6.2 Performance ──────────── depends on All
├── P6.3 Cleanup Jobs ─────────── depends on P1.2
├── P6.4 Human Review ─────────── depends on P3.6
├── P6.5 Final Testing ────────── depends on All
└── P6.6 Build & Sign ─────────── depends on All
```

---

## 6. Test & Verification Commands

### After Phase 1
```bash
npm run tauri dev          # App launches
cat ~/.numerology-app/data.db  # Database exists
# UI renders without console errors
```

### After Phase 2
```bash
npm run test -- numerology  # All tests pass
# Manually verify calculations against known values
```

### After Phase 3
```bash
# Generate insight via API
# Verify JSON output matches schema
# Simulate API timeout → fallback shows
# Check for forbidden language patterns
```

### After Phase 4
```bash
# Create journal entry
# Verify mood/energy saved
# Submit feedback
# Open "Why This Insight?" modal
```

### After Phase 5
```bash
# Complete onboarding flow
# Check notification appears at scheduled time
# Update profile → numerology recalculates
```

### After Phase 6
```bash
npm run test               # All tests pass
npm run build              # Build succeeds
# Manual QA on both platforms
# Human review of 50+ insights complete
```

---

## 7. Definition of Done by Phase

| Phase | Criteria |
|-------|----------|
| **Phase 1** | App launches on macOS + Windows, database creates, UI renders |
| **Phase 2** | All calculations correct, 100% test coverage, master numbers handled |
| **Phase 3** | Insight generates <10s, valid JSON, fallback works, no predictive language |
| **Phase 4** | Journal saves, feedback submits, UI responsive, "Why This Insight?" works |
| **Phase 5** | Onboarding <5 min, notifications work, profile updates recalculate |
| **Phase 6** | All tests pass, <1% crash rate, human review passed, builds signed |

---

## 8. Risks & Common Failure Modes

| Risk | Phase | Likelihood | Mitigation |
|------|-------|------------|------------|
| API rate limiting | P3 | Medium | Implement retry with backoff, cache responses |
| Invalid JSON response | P3 | Medium | Validation layer triggers fallback |
| Notification permission denied | P5 | Low | Graceful degradation, show settings prompt |
| Database migration failure | P1 | Low | Versioned migrations, backup before upgrade |
| Numerology edge cases | P2 | Medium | Comprehensive test cases, master number handling |
| Long onboarding flow | P5 | Medium | Target <5 min, skip optional steps |
| Cross-platform UI issues | P4 | Low | Test on both macOS and Windows |
| Build signing issues | P6 | Medium | Test signing early, have fallback procedure |

---

## 9. Suggested Repo Structure

```
numerology-app/
├── src-tauri/
│   ├── src/
│   │   └── main.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── AppShell.tsx
│   │   ├── insight/
│   │   │   ├── InsightDisplay.tsx
│   │   │   ├── InsightFeedback.tsx
│   │   │   ├── WhyThisInsight.tsx
│   │   │   ├── ClaimBadge.tsx
│   │   │   └── LayerToggle.tsx
│   │   ├── journal/
│   │   │   ├── JournalEntry.tsx
│   │   │   ├── MoodSlider.tsx
│   │   │   ├── EnergySlider.tsx
│   │   │   └── EmotionTags.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Slider.tsx
│   │       └── ErrorBoundary.tsx
│   ├── screens/
│   │   ├── Dashboard.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── api/
│   │   │   └── llm.ts
│   │   ├── insight/
│   │   │   ├── index.ts
│   │   │   ├── prompt.ts
│   │   │   ├── parser.ts
│   │   │   ├── validation.ts
│   │   │   └── fallback.ts
│   │   ├── numerology/
│   │   │   ├── index.ts
│   │   │   ├── core.ts
│   │   │   └── cyclic.ts
│   │   ├── database.ts
│   │   ├── journal.ts
│   │   ├── notification.ts
│   │   ├── config.ts
│   │   └── cleanup.ts
│   ├── stores/
│   │   ├── userStore.ts
│   │   ├── insightStore.ts
│   │   ├── journalStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── insight.ts
│   │   ├── journal.ts
│   │   ├── numerology.ts
│   │   └── notification.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_initial.sql
│   │   └── seeds/
│   │       └── fallback_templates.sql
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── unit/
│   │   └── numerology.test.ts
│   ├── integration/
│   │   └── insight.test.ts
│   └── e2e/
│       └── onboarding.test.ts
├── docs/
│   ├── PRD-Numerology-Intelligence-System-v1.1.md
│   ├── MVP-Feature-Cut-v1.2.md
│   ├── Prompt-Output-Contract-v1.2.md
│   ├── State-Data-Model-v1.1.md
│   └── Implementation-Plan-v1.1.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 10. Handoff Checklist

### Before Starting Development
- [ ] All source documents reviewed and understood
- [ ] Development environment set up (Node.js, Rust, Tauri)
- [ ] LLM API key obtained (DeepSeek default)
- [ ] Repository structure created

### Before Each Phase
- [ ] Previous phase checkpoints passed
- [ ] Product Owner verification items passed
- [ ] Dependencies verified
- [ ] Test cases defined

### Before Launch
- [ ] All 6 phases complete
- [ ] All stop & verify checkpoints passed
- [ ] All Product Owner verification items passed
- [ ] Human review of 50+ insights complete
- [ ] App crash rate < 1%
- [ ] Build succeeds for macOS and Windows
- [ ] Code signing configured
- [ ] Documentation updated

### Sign-off
- [ ] Product Owner: Feature acceptance
- [ ] Developer: Code review complete
- [ ] QA: Testing complete
- [ ] Launch decision made

---

## 11. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial implementation plan |
| 1.1 | 2024 | Fixed timeline (6-week), refined checkpoints (Calculated+Interpreted required, Deep optional), generic LLM client naming, removed non-MVP files (JournalHistory.tsx, encryption.ts), added Product Owner Verification sections |

---

**End of Implementation Plan v1.1**
