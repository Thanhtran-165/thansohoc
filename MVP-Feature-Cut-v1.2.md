# MVP Feature Cut
# Personal Numerology Intelligence System

**Version:** 1.2
**Date:** 2024
**Status:** Clean - Ready for Handoff
**Based on:** PRD v1.1

---

## Purpose

Scope cho MVP: feature nào cần, có acceptance criteria.

---

## 1. MVP Scope Summary

| Category | IN MVP | NOT in MVP |
|----------|--------|------------|
| Core Engine | Numerology calculation + Daily Insight | Pattern detection |
| Journal | Quick entry (mood, energy, text) | Voice notes, photos |
| Onboarding | Quick (3-5 min) | Deep onboarding |
| Notifications | Desktop (macOS/Windows) | Mobile push, email |
| Reports | None | Weekly/Monthly |
| Trust | Basic claim types + badges | Observed claims |
| Fallback | Cached insights on timeout | - |

---

## 2. Features IN MVP

### 2.1. Core Infrastructure
- Tauri project setup (macOS + Windows)
- React UI skeleton
- SQLite database

### 2.2. Numerology Engine
- Core numbers: Life Path, Destiny, Soul Urge, Personality, Birthday
- Cyclic numbers: Personal Year/Month/Day
- All calculations verifiable by user

### 2.3. Daily Insight Engine
- AI-powered personalized insight via Deepseek
- 3 insight layers: Quick (30s), Standard (2m), Deep (5m)
- Claim type markers: [Calculated], [Interpreted], [Exploratory]
- Every claim block has appropriate marker
- At least 1 Calculated + 1 Interpreted claim per insight
- Confidence score displayed
- **Fallback:** Graceful degradation when API fails (see §5)

### 2.4. Journal Module
- Quick entry: Mood slider (1-10), Energy slider (1-10)
- Emotion tags (multi-select from predefined list)
- Free text reflection (optional, encrypted in privacy mode)
- Insight feedback (1-5 stars)

### 2.5. Onboarding (Quick)
- Welcome screen with product thesis
- Basic info: Full name, date of birth
- Style preference: Gentle/Direct/Practical/Spiritual
- Privacy mode: Local only (Cloud sync not in MVP)
- Notification time for morning insight
- **Target: 3-5 minutes to first insight**

### 2.6. Desktop Notifications
- Morning insight notification (user-scheduled time)
- Evening journal reminder
- Quiet hours support
- **Platform:** macOS + Windows only

### 2.7. Trust Features
- Claim type badges: [Calculated], [Interpreted], [Exploratory]
- "Why This Insight?" modal with calculation breakdown
- Confidence score display
- Profile editable (not locked)

---

## 3. NOT in MVP (Deferred to Phase 2+)

**Deferred Features:**
- Pattern detection / memory retrieval
- Weekly/monthly reports
- Observed claims (require pattern engine)
- Deep onboarding
- Mobile push / email notifications
- Email delivery
- Voice notes, photo attachments
- Rich text journal entries
- Journal search
- Export functionality
- Cloud sync
- Multi-device support
- A/B testing
- Adaptive optimization
- Mobile app
- Apple Watch / Siri / Widgets

---

## 4. Acceptance Criteria

### 4.1. Per Feature

| Feature | Acceptance Criteria |
|---------|---------------------|
| Onboarding | User completes in < 5 minutes, sees first insight |
| Daily Insight | Generates valid JSON, displays within 10s |
| Journal Entry | Saves mood + energy + text to local DB |
| Notifications | Works on macOS 10.14+ and Windows 10+ |
| Claim Types | Every claim block has marker, at least 1 Calculated + 1 Interpreted |
| Fallback | Shows cached insight when API fails |

### 4.2. Quality Gates

| Gate | Requirement |
|------|-------------|
| No predictive language | Verified by human review (see §6) |
| Claim type compliance | Every claim block marked |
| API timeout handling | Fallback after 10s + 3 retries |
| App stability | < 1% crash rate |

---

## 5. Fallback Behavior

When insight generation fails:

| Scenario | Behavior |
|----------|----------|
| API timeout (>10s) | Show cached insight from previous day |
| API error (5xx) | Show cached insight + error message |
| No cache available | Show generic numerology-only insight |
| Invalid JSON | Re-parse or show partial content |

**Fallback Insight Template:**
```
Headline: Your Personal Day {N} Theme
[Calculated] Today is Personal Day {N}.
{standard_interpretation}

Note: A more personalized insight will be available tomorrow.
```

**Retry Logic:**
1. First failure → retry after 2s
2. Second failure → retry after 5s
3. Third failure → show fallback

---

## 6. Human Review Requirements

Before launch, review minimum 50 insights using PRD §15 rubric.

| Dimension | Minimum Score | Weight |
|-----------|---------------|--------|
| Specificity | 3.0 | 20% |
| Personal Relevance | 3.0 | 20% |
| Practicality | 3.0 | 15% |
| Emotional Safety | 4.0 | 20% |
| Non-dogmatism | 4.0 | 15% |
| Explainability | 3.0 | 10% |

**Pass Criteria:** ≥ 80% of insights score ≥ 3.0 weighted average

**Launch Gate:** All dimensions ≥ 3.0 average

---

## 7. Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| D1 Retention | ≥ 40% | Industry standard for habit apps |
| D7 Retention | ≥ 25% | Habit formation indicator |
| First Insight Open | ≥ 80% | Core value experienced |
| First Journal Entry | ≥ 50% | Key behavior initiated |
| "Why This Insight?" Open | ≥ 25% | Trust/curiosity signal |
| "Helpful" Rating | ≥ 60% | Quality signal (4-5 stars) |
| App Crash Rate | < 1% | Stability baseline |

---

## 8. Timeline

| Week | Focus | Milestone |
|------|-------|----------|
| 1 | Infrastructure | App launches, DB works |
| 2 | Numerology | All calculations correct |
| 3 | Insight Engine | AI generates valid insights |
| 4 | Journal + UI | Quick entry, "Why This Insight?" |
| 5 | Polish | Bug fixes, human review complete, launch |

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Poor AI insights | Medium | Human review, prompt iteration |
| Low D1 retention | Medium | First insight quality, onboarding flow |
| Notification issues | Low | Test on macOS/Windows versions |
| API reliability | Low | Fallback system, caching |

---

## Changelog (v1.2 → v1.2.1)

| Change | Description |
|-------|-------------|
| Fixed privacy mode | Changed to "Local only" - Hybrid/Cloud sync not in MVP |
| Fixed fallback reference | Section reference corrected from §7 to §5 |

---

**End of MVP Feature Cut v1.2**
