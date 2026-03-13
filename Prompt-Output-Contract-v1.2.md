# Prompt & Output Contract
# Personal Numerology Intelligence System — MVP

**Version:** 1.2
**Date:** 2024
**Status:** Implementation Ready
**Scope:** MVP Only

---

## 1. Purpose

This document defines the **exact contract** between the app and the AI model for Daily Insight generation.

**Audience:** Backend developers, AI/ML engineers, QA

**Scope:** MVP only. See `MVP-Feature-Cut-v1.2.1.md` for feature boundaries.

---

## 2. MVP Scope Boundaries

| Item | IN MVP | NOT in MVP |
|------|-------|------------|
| Claim Types | Calculated, Interpreted, Exploratory | Observed (requires pattern engine) |
| Memory | Current profile + today's numbers | Historical patterns, journal retrieval |
| Personalization | Style preference only | Adaptive optimization, A/B variants |
| Insight Layers | Quick + Standard (required), Deep (optional/on-demand) | Adaptive layer selection |
| Fallback | Cached insight → Generic numerology-only | None |

---

## 3. Input Contract

### 3.1. System Prompt (Static)

```
You are a personal numerology companion that provides interpretive guidance based on numerology cycles.

## IDENTITY
You are a calm, supportive guide — not a fortune teller, not a therapist, not a predictor of the future.

## CORE RULES
1. NEVER imply certainty about future outcomes or absolute truths about the user
2. NEVER make absolute claims about the user's personality or nature
3. ALWAYS acknowledge uncertainty in interpretations
4. ALWAYS respect user autonomy — suggestions, not commands
5. NEVER mix claim types in the same sentence without markers

## LANGUAGE GUIDELINES
Avoid phrasing that implies certainty or predetermination:
- Predictive certainty: "you will succeed", "this will definitely happen"
- Fatalistic claims: "this is your destiny", "it is written", "nothing can change this"
- Absolute personality claims: "you are [fixed trait]", "your personality is [absolute]"
- Definitive interpretation: "this proves", "this shows that you are"
- Commands: "you must", "you have to"

Use tentative, exploratory language instead:
- "might", "could", "may", "often", "can", "sometimes"
- "some people find", "this could suggest", "you might consider"

## CLAIM TYPE MARKERS
Use these EXACT markers at the START of each claim:

- [Calculated] — Mathematical fact from numerology. Always verifiable.
- [Interpreted] — AI interpretation. Acknowledges uncertainty.
- [Exploratory] — Open-ended question or suggestion. No claim being made.

## CLAIM TYPE RULES
- Every claim block MUST start with a claim type marker
- At least ONE [Calculated] claim per insight
- At least ONE [Interpreted] claim per insight
- [Exploratory] claims are optional but encouraged

## OUTPUT REQUIREMENTS
- Output MUST be valid JSON matching the schema exactly
- All text MUST be in the language matching user's preference
- Confidence scores MUST be provided
- Each claim MUST have its own confidence score

## OUTPUT FORMATTING
- Plain text only within content fields
- NO markdown formatting (no **bold**, no *italic*, no headers)
- NO markdown lists (no - or 1. 2. 3.)
- NO emojis or special characters
- Use plain sentences and paragraphs only
- Separate paragraphs with single newline

## LANGUAGE STYLE
Match the user's style_preference:
- "gentle" → Soft, supportive, indirect suggestions
- "direct" → Clear, straightforward, actionable
- "practical" → Focus on concrete applications
- "spiritual" → Allow more abstract/metaphorical language

## PREFERRED PHRASES
Use instead of absolute statements:
- "You might consider..." (suggestion)
- "Some people find..." (non-absolute)
- "This could suggest..." (tentative)
- "You may want to explore..." (invitation)
- "There's an energy of..." (descriptive)
```

### 3.2. User Context Payload

```json
{
  "schema_version": "1.0",
  "user": {
    "id": "string (UUID)",
    "name": "string (for personalization, NOT calculation)",
    "style_preference": "gentle | direct | practical | spiritual",
    "insight_length": "brief | detailed",
    "language": "vi | en"
  },
  "numerology": {
    "personal_day": "integer (1-9, 11, 22, 33)",
    "personal_month": "integer (1-9)",
    "personal_year": "integer (1-9, 11, 22, 33)",
    "life_path": "integer (1-9, 11, 22, 33)",
    "destiny_number": "integer (1-9, 11, 22, 33)",
    "soul_urge": "integer (1-9, 11, 22, 33)",
    "birthday_number": "integer (1-9, 11, 22, 33)"
  },
  "date": "YYYY-MM-DD",
  "request_id": "string (UUID for logging)"
}
```

### 3.3. Input Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `schema_version` | string | Yes | Must match expected version |
| `user.id` | string | Yes | Valid UUID |
| `user.name` | string | No | Max 100 chars, sanitized |
| `user.style_preference` | enum | Yes | One of: gentle, direct, practical, spiritual |
| `user.insight_length` | enum | Yes | One of: brief, detailed |
| `user.language` | enum | Yes | One of: vi, en |
| `numerology.personal_day` | integer | Yes | 1-9, 11, 22, or 33 |
| `numerology.personal_month` | integer | Yes | 1-9 |
| `numerology.personal_year` | integer | Yes | 1-9, 11, 22, or 33 |
| `numerology.life_path` | integer | Yes | 1-9, 11, 22, or 33 |
| `numerology.*` | integer | No | 1-9, 11, 22, or 33 if provided |
| `date` | string | Yes | ISO 8601 date format |
| `request_id` | string | Yes | Valid UUID |

---

## 4. Output Contract

### 4.1. Response JSON Schema

```json
{
  "schema_version": "1.0",
  "request_id": "string (matches input)",
  "generated_at": "ISO 8601 timestamp",
  "model": "string (e.g., 'deepseek-reasoner')",
  "insight": {
    "headline": "string (5-10 words)",
    "theme": "string (1-3 words)",
    "layers": {
      "quick": {
        "content": "string (2-3 sentences, ~50 words)",
        "claims": ["array of claim objects"]
      },
      "standard": {
        "content": "string (3-5 paragraphs, ~200 words)",
        "claims": ["array of claim objects"]
      },
      "deep": {
        "content": "string (5-8 paragraphs, ~400 words) - OPTIONAL in MVP",
        "claims": ["array of claim objects"],
        "exploratory_questions": ["array of 2-3 strings"]
      }
    },
    "confidence": {
      "overall": "float (0.0-1.0, bucketed)",
      "breakdown": {
        "calculated": "float (0.0-1.0)",
        "interpreted": "float (0.0-1.0, bucketed)"
      }
    }
  },
  "metadata": {
    "prompt_version": "string (e.g., '1.0.0')",
    "claim_types_used": ["calculated", "interpreted", "exploratory"],
    "word_counts": {
      "quick": "integer",
      "standard": "integer",
      "deep": "integer (optional, only if deep layer present)"
    },
    "processing_time_ms": "integer"
  }
}
```

### 4.2. Layer Requirements (MVP)

| Layer | Required? | Notes |
|-------|-----------|-------|
| `quick` | Yes | Always present |
| `standard` | Yes | Always present |
| `deep` | No | Optional/on-demand; may be omitted or empty |

### 4.3. Claim Object Schema

```json
{
  "type": "calculated | interpreted | exploratory",
  "text": "string (the claim text including marker)",
  "confidence": "float (0.0-1.0, bucketed for interpreted)",
  "source": "string describing the data source (optional)"
}
```

### 4.4. Output Validation Rules

| Field | Rule |
|-------|------|
| `schema_version` | Must be present and valid |
| `headline` | 5-10 words, no predictive language |
| `theme` | 1-3 words, title case |
| `layers.quick` | Required; 2-3 sentences, 30-80 words |
| `layers.standard` | Required; 3-5 paragraphs, 150-300 words |
| `layers.deep` | Optional; if present, 5-8 paragraphs, 300-500 words |
| `claims[].type` | Must be one of: calculated, interpreted, exploratory |
| `claims[].text` | Must start with [Calculated], [Interpreted], or [Exploratory] |
| `confidence.overall` | 0.0-1.0, calculated as weighted average |
| `confidence.breakdown.calculated` | Always 1.0 for calculated claims |
| `confidence.breakdown.interpreted` | Bucketed: 0.6, 0.7, or 0.8 |
| `metadata.claim_types_used` | Must include "calculated" and "interpreted" |
| `metadata.prompt_version` | Must be present |

### 4.5. Output Formatting Rules

All text content in the output MUST follow these rules:

| Rule | Description |
|------|-------------|
| No Markdown | No `**bold**`, `*italic*`, `# headers`, `~~strikethrough~~` |
| No Markdown Lists | No `- item`, `* item`, `1. item` lists |
| No Emojis | No emoji characters or emoticons |
| No HTML | No `<b>`, `<i>`, `<br>` tags |
| Plain Paragraphs | Use plain sentences separated by single newlines |
| Bullet Alternatives | Use "Consider:" followed by comma-separated items, or numbered sentences |

---

## 5. Claim Type Rules

### 5.1. Calculated Claims

**Definition:** Mathematical facts from numerology engine. Always verifiable by user.

**Marker:** `[Calculated]`

**Confidence:** Always `1.0`

**Examples:**
```
[Calculated] Today is Personal Day 9, in Personal Month 3.
[Calculated] Your Life Path Number is 5.
[Calculated] This is a Personal Year 1 for you.
```

**Rules:**
- MUST be verifiable by manual calculation
- MUST NOT include any interpretation
- MUST be derived from input `numerology` object

### 5.2. Interpreted Claims

**Definition:** AI-generated interpretation of numerological significance. Acknowledges uncertainty.

**Marker:** `[Interpreted]`

**Confidence:** Bucketed values: `0.6`, `0.7`, or `0.8`

**Examples:**
```
[Interpreted] Personal Day 9 often relates to completion and reflection.
[Interpreted] The combination of Personal Day 9 and Personal Month 3 might suggest a time to integrate recent learning.
[Interpreted] This day could support activities that bring things full circle.
```

**Rules:**
- MUST use tentative language (might, could, often, may, can)
- MUST NOT make absolute claims about user
- SHOULD connect to user's style preference

### 5.3. Exploratory Claims

**Definition:** Open-ended questions or suggestions. No claim being made.

**Marker:** `[Exploratory]`

**Confidence:** N/A or `null`

**Examples:**
```
[Exploratory] What would completion look like for you today?
[Exploratory] You might explore what loose ends could be tied up.
[Exploratory] Consider: what chapter feels like it's ending?
```

**Rules:**
- MUST be phrased as question or invitation
- MUST NOT contain any claims
- SHOULD encourage user reflection

---

## 6. Language & Safety Rules

### 6.1. Forbidden Phrasing Patterns

Language validation uses **pattern matching** for high-risk predictive/fatalistic constructions.

| Pattern Category | Examples | Why Forbidden |
|------------------|----------|---------------|
| Predictive Certainty | "you will succeed", "this will definitely happen" | False certainty about future |
| Fatalistic Claims | "this is your destiny", "nothing can change" | Removes agency |
| Personality Absolutes | "you are [trait]", "your personality is" | Absolute claim about user |
| Definitive Interpretation | "this proves", "this shows that you are" | False certainty |
| Commands | "you must", "you have to" | Removes autonomy |

### 6.2. Context-Aware Validation

**Note:** Simple token matching causes false positives. Use pattern-aware validation:

| Phrase | Context | Valid? |
|--------|---------|--------|
| "you will" | "you will succeed" | ❌ Invalid |
| "you will" | "you will find this useful" | ❌ Invalid |
| "you will" | "what you will discover" | ⚠️ Edge case - review |
| "will" | "where there's a will" | ✅ Valid (idiom) |
| "means" | "this means you are" | ❌ Invalid |
| "means" | "the number 9 means completion" | ✅ Valid (definition) |

**Implementation:** Use regex patterns that check for predictive/fatalistic sentence structures, not isolated tokens.

### 6.3. Preferred Alternatives

| Instead of | Use |
|------------|-----|
| "You will have..." | "You might experience..." |
| "You are a..." | "People with Life Path X often..." |
| "This means..." | "This could suggest..." |
| "You should..." | "You might consider..." |
| "Your energy today is..." | "The energy of Personal Day X is often described as..." |

### 6.4. Style Adaptation

| Style | Tone | Example |
|-------|------|---------|
| gentle | Soft, indirect | "You might gently consider..." |
| direct | Clear, actionable | "Consider these activities:" |
| practical | Concrete focus | "Practical applications include:" |
| spiritual | Abstract allowed | "The spiritual significance of this number..." |

---

## 7. Confidence Score Rules

### 7.1. Heuristic MVP Scoring System

**Note:** This is a heuristic scoring system for MVP. Confidence values represent approximate reliability, not precise probabilities.

### 7.2. Calculation

```
overall_confidence = (
  calculated_confidence * 0.4 +
  interpreted_confidence * 0.6
)
```

### 7.3. Bucketed Values (MVP)

To avoid false precision, use **bucketed confidence values**:

| Claim Type | Allowed Values | Default |
|------------|----------------|---------|
| Calculated | `1.0` only | 1.0 |
| Interpreted | `0.6`, `0.7`, `0.8` | 0.7 |
| Exploratory | `null` | null |

### 7.4. Bucket Selection Guide

| Interpreted Confidence | When to Use |
|------------------------|-------------|
| 0.8 | Strong connection to established numerology meanings, well-supported interpretation |
| 0.7 | Standard interpretation, moderate personalization |
| 0.6 | More speculative, multiple possible interpretations, limited context |

### 7.5. Display Rules

| Confidence Range | Display Label |
|------------------|---------------|
| 0.8 - 1.0 | High |
| 0.6 - 0.79 | Moderate |
| < 0.6 | Low (flag for review) |

---

## 8. "Why This Insight?" Contract

### 8.1. Data Structure

```json
{
  "request_id": "string (matches insight)",
  "explanation": {
    "data_sources": {
      "profile_completeness": "float (0.0-1.0)",
      "data_available": ["list of data types used"]
    },
    "calculated_claims": [
      {
        "claim": "Personal Day 9",
        "formula": "Personal Month (3) + Day (15) = 18 → 1+8 = 9",
        "inputs": {
          "personal_month": 3,
          "day": 15
        }
      }
    ],
    "interpretation_basis": {
      "style_preference": "string",
      "numerology_context": ["list of numbers used"],
      "model_version": "string",
      "prompt_version": "string"
    },
    "confidence_breakdown": {
      "data": "float",
      "interpretation": "float",
      "overall": "float"
    }
  }
}
```

### 8.2. Requirements

- MUST show exact formula for **primary** calculated claims (e.g., Personal Day calculation)
- MUST show inputs used in primary calculation
- MAY omit formula for repeated/passing references to the same calculation
- MUST NOT include any user data (journal content, etc.)
- MUST show model version and prompt version

---

## 9. Fallback Contract

### 9.1. Fallback Architecture

Fallback uses a **two-tier system**:

```
Primary Fallback: Cached insight from previous successful generation
     ↓ (if not available)
Secondary Fallback: Generic numerology-only insight template
```

### 9.2. Fallback Trigger Conditions

| Condition | Primary Action | Secondary Action |
|-----------|----------------|------------------|
| API timeout (>10s) | Return cached insight | Generic template |
| API error (5xx) | Return cached insight | Generic template |
| No cache available | N/A | Generic template |
| Invalid JSON response | Return cached insight | Generic template |

### 9.3. Fallback Output Schema

**Default fallback includes quick + standard only. Deep is optional.**

```json
{
  "schema_version": "1.0",
  "request_id": "string",
  "generated_at": "ISO 8601 timestamp",
  "model": "fallback",
  "is_fallback": true,
  "fallback_reason": "timeout | error | no_cache | invalid_response",
  "insight": {
    "headline": "Your Personal Day {N} Theme",
    "theme": "{theme_name}",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day {N}. {standard_meaning}",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day {N}.",
            "confidence": 1.0
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day {N}.\n\n[Interpreted] {extended_meaning}\n\nNote: A more personalized insight will be available tomorrow.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day {N}.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] {extended_meaning}",
            "confidence": 0.6
          }
        ]
      },
      "deep": {
        "content": "(optional - may be omitted or empty)"
      }
    },
    "confidence": {
      "overall": 0.7,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.6
      }
    }
  },
  "metadata": {
    "prompt_version": "fallback-1.0.0",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {"quick": 30, "standard": 100},
    "is_cached": true,
    "original_date": "YYYY-MM-DD (if cached)"
  }
}
```

### 9.4. Fallback Template Values

| Personal Day | Theme | Standard Meaning |
|--------------|-------|-------------------|
| 1 | New Beginnings | A day for fresh starts and initiative |
| 2 | Cooperation | A day for partnership and diplomacy |
| 3 | Expression | A day for creativity and communication |
| 4 | Foundation | A day for building and organizing |
| 5 | Change | A day for adaptability and movement |
| 6 | Responsibility | A day for family and service |
| 7 | Reflection | A day for introspection and inner work |
| 8 | Power | A day for ambition and achievement |
| 9 | Completion | A day for endings and humanitarian focus |
| 11 | Master | A day for illumination and inspiration |
| 22 | Master Builder | A day for large-scale manifestation |
| 33 | Master Teacher | A day for spiritual service |

---

## 10. Validation Rules

### 10.1. Pre-Generation Validation

| Check | Action on Failure |
|-------|-------------------|
| Input JSON valid | Return 400 error |
| schema_version matches | Return 400 error |
| Required fields present | Return 400 error |
| Numerology values in range | Return 400 error |
| User ID is valid UUID | Return 400 error |

### 10.2. Post-Generation Validation

| Check | Scope | Action on Failure |
|-------|-------|-------------------|
| Output is valid JSON | All | Trigger fallback |
| Required fields present | All | Trigger fallback |
| `layers.quick` present and valid | Required | Trigger fallback |
| `layers.standard` present and valid | Required | Trigger fallback |
| `layers.deep` valid (if present) | Optional | Skip if absent; validate if present |
| At least 1 Calculated claim per required layer | Required | Trigger fallback |
| At least 1 Interpreted claim per required layer | Required | Trigger fallback |
| No forbidden phrasing patterns | All | Log warning, flag for review |
| Confidence scores in valid buckets | All | Use default 0.7 |
| No markdown/emoji in content | All | Strip formatting, log warning |

### 10.3. Validation Function (Pseudocode)

```
function validateInsight(output):
  // Structural validation
  if (!output.insight) return { valid: false, error: "Missing insight" }
  if (!output.insight.layers) return { valid: false, error: "Missing layers" }

  // Version validation
  if (!output.schema_version) return { valid: false, error: "Missing schema_version" }
  if (!output.metadata?.prompt_version) log_warning("Missing prompt_version")

  // Required layers: quick and standard
  required_layers = ["quick", "standard"]
  for layer in required_layers:
    if (!output.insight.layers[layer]):
      return { valid: false, error: "Missing required layer: ${layer}" }

    claims = output.insight.layers[layer].claims
    if (!claims.some(c => c.type === "calculated")):
      return { valid: false, error: "Missing Calculated claim in ${layer}" }
    if (!claims.some(c => c.type === "interpreted")):
      return { valid: false, error: "Missing Interpreted claim in ${layer}" }

  // Optional layer: deep - validate only if present
  if (output.insight.layers.deep):
    deep_claims = output.insight.layers.deep.claims
    if (deep_claims && deep_claims.length > 0):
      if (!deep_claims.some(c => c.type === "calculated")):
        log_warning("Deep layer present but missing Calculated claim")
      if (!deep_claims.some(c => c.type === "interpreted")):
        log_warning("Deep layer present but missing Interpreted claim")

  // Marker validation - all claims
  for claim in all_claims:
    if (!claim.text.match(/^\[(Calculated|Interpreted|Exploratory)\]/)):
      return { valid: false, error: "Claim missing marker" }

  // Language validation - pattern-based
  text = output.insight.layers.standard.content
  forbidden_patterns = [
    /you will\s+\w+/gi,
    /this (will|is going to)\s/gi,
    /you are\s+(a|an|the)\s/gi,
    /your personality\s+is/gi,
    /this (means|proves|shows)\s+you/gi
  ]
  for pattern in forbidden_patterns:
    if pattern.test(text):
      log_warning("Forbidden pattern matched: ${pattern}")
      flag_for_review(output.request_id)

  // Formatting validation
  if contains_markdown(text) or contains_emoji(text):
    output = strip_formatting(output)
    log_warning("Markdown/emoji stripped from content")

  // Confidence bucket validation
  for claim in all_claims:
    if (claim.type === "interpreted"):
      if (![0.6, 0.7, 0.8].includes(claim.confidence)):
        claim.confidence = 0.7
        log_warning("Confidence normalized to bucket: 0.7")

  return { valid: true }
```

---

## 11. Examples

### 11.1. Valid Input Example

```json
{
  "schema_version": "1.0",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alex",
    "style_preference": "practical",
    "insight_length": "detailed",
    "language": "en"
  },
  "numerology": {
    "personal_day": 9,
    "personal_month": 3,
    "personal_year": 1,
    "life_path": 5,
    "destiny_number": 7,
    "soul_urge": 3,
    "birthday_number": 5
  },
  "date": "2024-01-15",
  "request_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

### 11.2. Valid Output Example (With Deep Layer)

```json
{
  "schema_version": "1.0",
  "request_id": "660e8400-e29b-41d4-a716-446655440001",
  "generated_at": "2024-01-15T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "A Day for Completion and New Beginnings",
    "theme": "Integration",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 9, in Personal Month 3. [Interpreted] This combination might support completing a project or integrating recent learning.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9, in Personal Month 3.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This combination might support completing a project or integrating recent learning.",
            "confidence": 0.7
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.\n\n[Interpreted] Personal Day 9 often relates to completion, humanitarian concerns, and bringing matters to a close. Combined with the creative energy of Personal Month 3, this could be a productive day for finishing tasks that require both analytical and creative thinking.\n\n[Interpreted] The energy of new beginnings from your Personal Year 1 might suggest that what you complete today could make room for fresh opportunities.\n\nPractical applications might include finishing a delayed task, reviewing a project before submission, or having a concluding conversation you have been avoiding.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 9 often relates to completion, humanitarian concerns, and bringing matters to a close.",
            "confidence": 0.7
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Combined with the creative energy of Personal Month 3, this could be a productive day for finishing tasks that require both analytical and creative thinking.",
            "confidence": 0.7
          }
        ]
      },
      "deep": {
        "content": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.\n\n[Interpreted] Personal Day 9 carries the energy of completion, reflection, and universal love. It is often considered a day for tying up loose ends and considering the broader impact of your actions.\n\n[Interpreted] Your Personal Month 3 adds a layer of creative expression and communication to today's energy. This combination might particularly support activities that combine finishing with creativity.\n\n[Exploratory] What would completion look like for you today?",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 9 carries the energy of completion, reflection, and universal love.",
            "confidence": 0.7
          }
        ],
        "exploratory_questions": [
          "What would completion look like for you today?",
          "What chapter feels like it is ending, and what might begin next?"
        ]
      }
    },
    "confidence": {
      "overall": 0.7,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.7
      }
    }
  },
  "metadata": {
    "prompt_version": "1.0.0",
    "claim_types_used": ["calculated", "interpreted", "exploratory"],
    "word_counts": {
      "quick": 32,
      "standard": 185,
      "deep": 280
    },
    "processing_time_ms": 3420
  }
}
```

### 11.3. Valid Output Example (Without Deep Layer - MVP Default)

```json
{
  "schema_version": "1.0",
  "request_id": "660e8400-e29b-41d4-a716-446655440001",
  "generated_at": "2024-01-15T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "A Day for Completion and New Beginnings",
    "theme": "Integration",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 9, in Personal Month 3. [Interpreted] This combination might support completing a project or integrating recent learning.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9, in Personal Month 3.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This combination might support completing a project or integrating recent learning.",
            "confidence": 0.7
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.\n\n[Interpreted] Personal Day 9 often relates to completion, humanitarian concerns, and bringing matters to a close. Combined with the creative energy of Personal Month 3, this could be a productive day for finishing tasks that require both analytical and creative thinking.\n\nPractical applications might include finishing a delayed task, reviewing a project before submission, or having a concluding conversation you have been avoiding.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9, in Personal Month 3, of Personal Year 1.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 9 often relates to completion, humanitarian concerns, and bringing matters to a close.",
            "confidence": 0.7
          }
        ]
      },
      "deep": {}
    },
    "confidence": {
      "overall": 0.7,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.7
      }
    }
  },
  "metadata": {
    "prompt_version": "1.0.0",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {
      "quick": 32,
      "standard": 185
    },
    "processing_time_ms": 2100
  }
}
```

### 11.4. Fallback Output Example

```json
{
  "schema_version": "1.0",
  "request_id": "660e8400-e29b-41d4-a716-446655440001",
  "generated_at": "2024-01-15T06:00:05Z",
  "model": "fallback",
  "is_fallback": true,
  "fallback_reason": "timeout",
  "insight": {
    "headline": "Your Personal Day 9 Theme",
    "theme": "Completion",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 9. [Interpreted] This day often supports completion and reflection.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This day often supports completion and reflection.",
            "confidence": 0.6
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 9.\n\n[Interpreted] Personal Day 9 is associated with completion, humanitarian concerns, and bringing matters to a close. You might consider reviewing any unfinished tasks or projects today.\n\nNote: A more personalized insight will be available tomorrow.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 9.",
            "confidence": 1.0
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 9 is associated with completion, humanitarian concerns, and bringing matters to a close.",
            "confidence": 0.6
          }
        ]
      },
      "deep": {}
    },
    "confidence": {
      "overall": 0.7,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.6
      }
    }
  },
  "metadata": {
    "prompt_version": "fallback-1.0.0",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {"quick": 20, "standard": 65},
    "is_cached": true
  }
}
```

### 11.5. Invalid Output (Would Trigger Fallback)

```json
{
  "schema_version": "1.0",
  "request_id": "660e8400-e29b-41d4-a716-446655440001",
  "generated_at": "2024-01-15T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "You Will Have a Great Day",
    "theme": "Success",
    "layers": {
      "quick": {
        "content": "Today you will succeed in everything you do. You are a natural leader.",
        "claims": []
      }
    }
  }
}
```

**Invalid because:**
- Headline uses predictive language ("Will Have")
- No claim type markers
- No Calculated claims
- No Interpreted claims
- Missing required `standard` layer
- Uses "You are" (forbidden absolute claim)

---

## 12. API Specifications

| Parameter | Value |
|-----------|-------|
| Model | `deepseek-reasoner` |
| Max tokens | 4000 |
| Temperature | 0.7 |
| Timeout | 10 seconds |
| Retries | 3 (2s, 5s, 10s backoff) |
| Input schema_version | `1.0` |
| Output schema_version | `1.0` |

---

## 13. Versioning

### 13.1. Schema Versioning

| Field | Location | Purpose |
|-------|----------|---------|
| `schema_version` | Input payload | Version of input schema client is using |
| `schema_version` | Output payload | Version of output schema server is using |
| `prompt_version` | Output metadata | Version of system prompt used for generation |

### 13.2. Version Format

Versions use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes to schema structure
- **MINOR:** New optional fields, non-breaking additions
- **PATCH:** Bug fixes, clarification updates

### 13.3. Current Versions

| Component | Version |
|-----------|---------|
| Input Schema | `1.0` |
| Output Schema | `1.0` |
| System Prompt | `1.0.0` |
| Fallback Prompt | `1.0.0` |

---

## 14. Open Questions / Deferred Items

| Item | Status | Notes |
|------|--------|-------|
| Observed claims integration | Deferred | Requires pattern engine (Phase 2+) |
| Journal-aware personalization | Deferred | Privacy considerations, needs memory retrieval |
| Multi-language support | MVP: VI + EN only | i18n deferred |
| A/B testing | Deferred | Requires traffic volume |
| Deep layer default | MVP: optional/on-demand | May become required in Phase 2 |
| Adaptive confidence | Deferred | Use bucketed heuristic in MVP |

---

## 15. Integration Checklist

Before integrating, verify:

- [ ] Input validation passes for all test cases
- [ ] Output validation catches all invalid outputs
- [ ] Required layers (quick, standard) always validated
- [ ] Deep layer validated only when present
- [ ] Fallback system works for timeout/error scenarios
- [ ] Fallback uses cached insight first, then generic template
- [ ] Fallback defaults to quick + standard (deep optional)
- [ ] Claim markers are present in all layers
- [ ] No forbidden phrasing patterns appear in outputs
- [ ] Confidence scores use bucketed values (0.6, 0.7, 0.8)
- [ ] "Why This Insight?" shows formula for primary calculated claims
- [ ] Fallback template renders correctly for all PD values
- [ ] Output content has no markdown/emoji formatting
- [ ] schema_version is present in input and output
- [ ] prompt_version is present in metadata
- [ ] Retry logic works as specified
- [ ] Logging captures request_id throughout pipeline

---

## Changelog (v1.1 → v1.2)

| Change | Description |
|--------|-------------|
| System prompt wording | Replaced token-style prohibition with rule focused on predictive/fatalistic phrasing implying certainty |
| Deep layer clarification | Explicitly marked as optional/on-demand in schema and validation |
| Validation logic update | Always validate quick + standard; validate deep only if present |
| Fallback contract update | Default fallback includes quick + standard only; deep optional |
| "Why This Insight?" refinement | Require formula for primary calculated claims, not every reference |
| Added §4.2 | Layer requirements table for MVP clarity |
| Updated examples | Added output without deep layer; fallback without deep |

---

**End of Prompt & Output Contract v1.2**
