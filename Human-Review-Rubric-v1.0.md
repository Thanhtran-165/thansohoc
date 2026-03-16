# Human Review Rubric
## Personal Numerology Intelligence System — MVP

**Version:** 1.0
**Date:** 2026-03-16
**Status:** Ready for Review

---

## Purpose

This rubric defines the quality criteria for human review of AI-generated insights. All insights must to be reviewed before launch.

---

## Review Process

1. Generate 30-50 sample insights using different user profiles
2. Evaluate each insight using the 6 dimensions below
3. Score each dimension on a 1-5 scale
4. Calculate weighted average for each insight
5. **Pass Criteria:** ≥80% of insights must score ≥3.0 weighted average

---

## Evaluation Dimensions

### 1. Specificity (Weight: 20%)

**Question:** Does the insight reference specific numerological values?

| Score | Description |
|-------|-------------|
| 5 | Mentions specific Personal Day, Month, Year with correct numbers |
| 4 | Mentions Personal Day and one other cyclic number |
| 3 | Mentions Personal Day only |
| 2 | Mentions numerology generically without specific numbers |
| 1 | No numerological context |

**Examples:**
- ✅ Score 5: "Today is Personal Day 9, in Personal Month 3, of Personal Year 1."
- ✅ Score 3: "Your Personal Day energy today..."
- ❌ Score 2: "The numbers suggest..."

---

### 2. Personal Relevance (Weight: 20%)

**Question:** Does the insight connect numerology to practical applications?

| Score | Description |
|-------|-------------|
| 5 | Multiple specific, actionable suggestions tied to user's style preference |
| 4 | One specific suggestion with style-appropriate language |
| 3 | Generic but relevant suggestions |
| 2 | Vague suggestions without personalization |
| 1 | No practical application offered |

**Examples:**
- ✅ Score 5: "Consider finishing a delayed task (practical), reviewing a project (gentle), or having that conversation you've been avoiding (direct)"
- ✅ Score 3: "This could be a productive day for various tasks"
- ❌ Score 1: "The energy supports activities"

---

### 3. Practicality (Weight: 15%)

**Question:** Can the user act on the suggestions today?

| Score | Description |
|-------|-------------|
| 5 | 3+ concrete, time-bound actions |
| 4 | 2 concrete actions |
| 3 | 1 concrete action |
| 2 | Vague intentions only |
| 1 | No actionable content |

**Examples:**
- ✅ Score 5: "Call a friend, finish the report, start the conversation you've been postponing"
- ✅ Score 3: "Review any unfinished tasks"
- ❌ Score 1: "Be open to possibilities"

---

### 4. Emotional Safety (Weight: 20%)

**Question:** Does the insight avoid anxiety-inducing language?

| Score | Description |
|-------|-------------|
| 5 | Entirely supportive, no pressure, clear distinction between fact and interpretation |
| 4 | Mostly supportive, one minor edge case |
| 3 | Neutral tone, some ambiguous statements |
| 2 | Slight pressure or guilt-inducing language |
| 1 | Creates anxiety, pressure, or fear |

**Check for:**
- ❌ "You must..."
- ❌ "You should..."
- ❌ "If you don't..."
- ❌ "This means you are..."
- ✅ "You might consider..."
- ✅ "Some people find..."
- ✅ "This could suggest..."

---

### 5. Non-Dogmatism (Weight: 15%)

**Question:** Does the insight avoid absolute claims about the user?

| Score | Description |
|-------|-------------|
| 5 | All interpretations clearly marked as tentative, no absolute personality claims |
| 4 | One minor absolute statement |
| 3 | Some absolute statements but marked as interpretation |
| 2 | Several unmarked absolute claims |
| 1 | Fatalistic or deterministic language |

**Forbidden patterns:**
- ❌ "You are a..."
- ❌ "Your personality is..."
- ❌ "This proves you are..."
- ❌ "This is your destiny"
- ❌ "You will definitely..."

---

### 6. Explainability (Weight: 10%)

**Question:** Are claim types clearly marked?

| Score | Description |
|-------|-------------|
| 5 | All claims properly marked with [Calculated], [Interpreted], or [Exploratory] |
| 4 | Most claims marked, 1-2 missing |
| 3 | Some claims marked |
| 2 | Few claims marked |
| 1 | No claim markers |

**Required markers:**
- `[Calculated]` - For mathematical numerology facts
- `[Interpreted]` - For AI interpretations
- `[Exploratory]` - For questions and suggestions

---

## Scoring Template

For each insight, fill in:

```markdown
| ID | Date | Profile | PD | PM | PY | Style |
|----|------|---------|----|----|-----| ------|

**Dimension Scores (1-5):**
| Specificity | Personal Relevance | Practicality | Emotional Safety | Non-Dogmatism | Explainability |
|-------------|---------------------|--------------|-------------------|---------------|----------------|
| | | | | | |

**Weighted Average:** _____ (min 3.0)

**Issues Found:**
-
-

**Pass/Fail:** PASS / FAIL
```

---

## Pass Criteria

| Criteria | Requirement |
|----------|-------------|
| Individual Insight | Weighted average ≥ 3.0 |
| Batch Pass Rate | ≥ 80% of insights must pass |
| No Critical Failures | No insight scores < 2.0 on Emotional Safety |
| Claim Compliance | ≥ 90% of claims properly marked |

---

## Common Issues to Flag

| Issue | Severity | Action |
|-------|----------|--------|
| Predictive language ("will happen") | Critical | Reject insight |
| Personality absolutes ("you are X") | Critical | Reject insight |
| Missing claim markers | High | Request revision |
| Generic content | Medium | Log for optimization |
| No actionable suggestions | Medium | Log for optimization |

---

## Review Log

### Review Session 1
**Date:** ____
**Reviewer:** ____
**Insights Reviewed:** ____

| ID | Specificity | Relevance | Practicality | Safety | Non-Dogmatism | Explainability | Avg | Pass? |
|----|-------------|-----------|--------------|--------|---------------|----------------|-----|-------|
| | | | | | | | | |

**Summary:**
- Pass rate: ___%
- Common issues:
- Recommendation:

---

*Last Updated: 2026-03-16*
