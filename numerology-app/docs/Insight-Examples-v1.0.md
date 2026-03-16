# Insight Output Examples v1.0

This document provides example outputs for the Daily Insight Engine.

## Example 1: Valid LLM-Generated Insight

**Context**: Personal Day 5, Personal Month 3, Personal Year 1, Life Path 4

```json
{
  "schema_version": "1.0",
  "request_id": "req-550e8400-e29b-41d4-a716-446655440000",
  "generated_at": "2024-01-15T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "Dynamic Energy for Change and Expression",
    "theme": "Movement",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 5. [Interpreted] This could be a day of movement and change for you. Your Life Path 4 suggests you might benefit from structured flexibility today.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 5.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This could be a day of movement and change for you. Your Life Path 4 suggests you might benefit from structured flexibility today.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 5, falling in Personal Month 3 of your Personal Year 1.\n\n[Interpreted] Personal Day 5 often brings a desire for variety and freedom. Combined with your Life Path 4, you might find that balancing your natural need for structure with today's changeable energy could be rewarding. Consider exploring new approaches to existing projects rather than starting entirely new ventures.\n\n[Interpreted] The creative energy of Personal Month 3 might support self-expression in your communications today. Some people find this combination helpful for networking or creative problem-solving.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 5, falling in Personal Month 3 of your Personal Year 1.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 5 often brings a desire for variety and freedom. Combined with your Life Path 4, you might find that balancing your natural need for structure with today's changeable energy could be rewarding. Consider exploring new approaches to existing projects rather than starting entirely new ventures.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] The creative energy of Personal Month 3 might support self-expression in your communications today. Some people find this combination helpful for networking or creative problem-solving.",
            "confidence": 0.6,
            "source": "llm_interpretation"
          }
        ]
      }
    },
    "confidence": {
      "overall": 0.75,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.67
      }
    },
    "personal_day": 5,
    "personal_month": 3,
    "personal_year": 1
  },
  "metadata": {
    "schema_version": "1.0",
    "prompt_version": "1.0.0",
    "model": "deepseek-reasoner",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {
      "quick": 28,
      "standard": 85
    },
    "processing_time_ms": 2500
  }
}
```

---

## Example 2: Insight with Deep Layer

**Context**: Personal Day 11 (Master Number), Personal Month 6, Personal Year 9, Life Path 11

```json
{
  "schema_version": "1.0",
  "request_id": "req-660e8400-e29b-41d4-a716-446655440001",
  "generated_at": "2024-01-15T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "Illumination Meets Completion in Service",
    "theme": "Master Energy",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 11, a Master number. [Interpreted] This may heighten your intuitive awareness and capacity for inspiration.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 11, a Master number.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This may heighten your intuitive awareness and capacity for inspiration.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 11, a Master number, in Personal Month 6 of your Personal Year 9.\n\n[Interpreted] The combination of Master Day 11 with your Life Path 11 might create a particularly sensitive day for spiritual awareness and intuitive insights. You may find yourself more attuned to subtle energies and patterns.\n\n[Interpreted] Personal Year 9 themes of completion and humanitarian focus might blend with today's master energy. Some people find this supportive for reflecting on what you've learned and how you might share those insights with others.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 11, a Master number, in Personal Month 6 of your Personal Year 9.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] The combination of Master Day 11 with your Life Path 11 might create a particularly sensitive day for spiritual awareness and intuitive insights. You may find yourself more attuned to subtle energies and patterns.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Year 9 themes of completion and humanitarian focus might blend with today's master energy. Some people find this supportive for reflecting on what you've learned and how you might share those insights with others.",
            "confidence": 0.6,
            "source": "llm_interpretation"
          }
        ]
      },
      "deep": {
        "content": "[Calculated] Your core numbers show Life Path 11, Destiny 22, Soul Urge 9, and Birthday 3.\n\n[Interpreted] The interplay between your Life Path 11 (illumination) and Destiny 22 (master building) suggests a life theme of translating spiritual insights into practical structures. Today's Personal Day 11 might amplify this bridge between vision and manifestation.\n\n[Exploratory] How might you bring more spiritual awareness into your daily work or projects?\n\n[Exploratory] What structures in your life could benefit from a more intuitive approach?\n\n[Exploratory] Consider journaling about any dreams or synchronicities you notice today.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Your core numbers show Life Path 11, Destiny 22, Soul Urge 9, and Birthday 3.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] The interplay between your Life Path 11 (illumination) and Destiny 22 (master building) suggests a life theme of translating spiritual insights into practical structures. Today's Personal Day 11 might amplify this bridge between vision and manifestation.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          },
          {
            "type": "exploratory",
            "text": "[Exploratory] How might you bring more spiritual awareness into your daily work or projects?",
            "confidence": null,
            "source": "llm_interpretation"
          },
          {
            "type": "exploratory",
            "text": "[Exploratory] What structures in your life could benefit from a more intuitive approach?",
            "confidence": null,
            "source": "llm_interpretation"
          },
          {
            "type": "exploratory",
            "text": "[Exploratory] Consider journaling about any dreams or synchronicities you notice today.",
            "confidence": null,
            "source": "llm_interpretation"
          }
        ],
        "exploratory_questions": [
          "How might you bring more spiritual awareness into your daily work or projects?",
          "What structures in your life could benefit from a more intuitive approach?",
          "Consider journaling about any dreams or synchronicities you notice today."
        ]
      }
    },
    "confidence": {
      "overall": 0.72,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.68
      }
    },
    "personal_day": 11,
    "personal_month": 6,
    "personal_year": 9
  },
  "metadata": {
    "schema_version": "1.0",
    "prompt_version": "1.0.0",
    "model": "deepseek-reasoner",
    "claim_types_used": ["calculated", "interpreted", "exploratory"],
    "word_counts": {
      "quick": 22,
      "standard": 76,
      "deep": 120
    },
    "processing_time_ms": 3800
  }
}
```

---

## Example 3: Cached Fallback Insight

**Context**: LLM timeout occurred, returning a previously cached insight from 2 days ago

```json
{
  "schema_version": "1.0",
  "request_id": "req-770e8400-e29b-41d4-a716-446655440002",
  "generated_at": "2024-01-13T06:00:00Z",
  "model": "deepseek-reasoner",
  "insight": {
    "headline": "Foundation Building with Practical Energy",
    "theme": "Structure",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 4. [Interpreted] This may be a day for organizing, planning, and building steady foundations.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 4.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This may be a day for organizing, planning, and building steady foundations.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 4.\n\n[Interpreted] Personal Day 4 is often associated with practical matters, hard work, and building foundations. You might find satisfaction in completing tasks that require attention to detail and systematic approaches.\n\nNote: This is a cached insight due to a temporary service issue. A fresh personalized insight will be available tomorrow.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 4.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 4 is often associated with practical matters, hard work, and building foundations. You might find satisfaction in completing tasks that require attention to detail and systematic approaches.",
            "confidence": 0.7,
            "source": "llm_interpretation"
          }
        ]
      }
    },
    "confidence": {
      "overall": 0.7,
      "breakdown": {
        "calculated": 1.0,
        "interpreted": 0.7
      }
    },
    "personal_day": 4,
    "personal_month": 2,
    "personal_year": 7
  },
  "metadata": {
    "schema_version": "1.0",
    "prompt_version": "1.0.0",
    "model": "deepseek-reasoner",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {
      "quick": 22,
      "standard": 62
    },
    "processing_time_ms": 2100
  },
  "is_fallback": true,
  "fallback_reason": "no_cache"
}
```

---

## Example 4: Generic Fallback Insight

**Context**: LLM error, no cached insight available, using generic template for Personal Day 7

```json
{
  "schema_version": "1.0",
  "request_id": "req-880e8400-e29b-41d4-a716-446655440003",
  "generated_at": "2024-01-15T06:05:00Z",
  "model": "fallback",
  "insight": {
    "headline": "Your Personal Day 7 Theme",
    "theme": "Reflection",
    "layers": {
      "quick": {
        "content": "[Calculated] Today is Personal Day 7. [Interpreted] This day often supports introspection and inner work.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 7.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] This day often supports introspection and inner work.",
            "confidence": 0.6,
            "source": "fallback_template"
          }
        ]
      },
      "standard": {
        "content": "[Calculated] Today is Personal Day 7.\n\n[Interpreted] Personal Day 7 is associated with a day for introspection and inner work. You might consider reviewing any relevant activities or projects today.\n\nNote: A more personalized insight will be available tomorrow.",
        "claims": [
          {
            "type": "calculated",
            "text": "[Calculated] Today is Personal Day 7.",
            "confidence": 1.0,
            "source": "numerology_calculation"
          },
          {
            "type": "interpreted",
            "text": "[Interpreted] Personal Day 7 is associated with a day for introspection and inner work. You might consider reviewing any relevant activities or projects today.\n\nNote: A more personalized insight will be available tomorrow.",
            "confidence": 0.6,
            "source": "fallback_template"
          }
        ]
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
    "schema_version": "1.0",
    "prompt_version": "fallback-1.0.0",
    "model": "fallback",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {
      "quick": 20,
      "standard": 65
    },
    "processing_time_ms": 0
  },
  "is_fallback": true,
  "fallback_reason": "error"
}
```

---

## Why This Insight Example

**Context**: Explanation for a generated insight

```json
{
  "id": "why-550e8400-e29b-41d4-a716-446655440000",
  "insight_id": "req-550e8400-e29b-41d4-a716-446655440000",
  "request_id": "req-550e8400-e29b-41d4-a716-446655440000",
  "data_sources": {
    "profile_completeness": 1.0,
    "data_available": ["full_name", "date_of_birth", "style_preference"]
  },
  "calculated_claims": [
    {
      "claim": "Today is Personal Day 5",
      "formula": "Reduce (birthday_day + birthday_month + current_year) to single digit for Personal Year, then add current_month and reduce for Personal Month, then add current_day and reduce for Personal Day",
      "inputs": {
        "birthday_day": 15,
        "birthday_month": 6,
        "current_year": 2024,
        "current_month": 1,
        "current_day": 15
      }
    }
  ],
  "interpretation_basis": {
    "style_preference": "practical",
    "numerology_context": ["personal_day_5", "personal_month_3", "personal_year_1", "life_path_4"],
    "model_version": "deepseek-reasoner",
    "prompt_version": "1.0.0"
  },
  "confidence_breakdown": {
    "data": 1.0,
    "interpretation": 0.7,
    "overall": 0.75
  },
  "explanation": "This insight is based on your calculated Personal Day 5, combined with interpretations filtered through your practical communication style preference. The calculated claims (Personal Day 5) are mathematically derived from your birth date using the Pythagorean numerology system. The interpreted claims offer suggestions based on traditional numerology associations with Personal Day 5 (change, freedom, variety), tailored to your Life Path 4 (structure, foundation).",
  "generated_at": "2024-01-15T06:00:05Z"
}
```

---

## Claim Type Definitions

| Type | Marker | Confidence | Description |
|------|--------|------------|-------------|
| **Calculated** | `[Calculated]` | Always 1.0 | Mathematically derived from numerology formulas. No interpretation involved. |
| **Interpreted** | `[Interpreted]` | 0.6, 0.7, or 0.8 | LLM-generated interpretation based on numerology context. Confidence reflects the strength of the numerological tradition and user data. |
| **Exploratory** | `[Exploratory]` | Always null | Open-ended questions or suggestions. No predictive claims. |

---

## Fallback Reason Codes

| Reason | Description |
|--------|-------------|
| `timeout` | LLM API call exceeded 10-second timeout |
| `error` | LLM API returned an error (5xx, rate limit, etc.) |
| `no_cache` | No cached insight available (first-time user or cache expired) |
| `invalid_response` | LLM response failed validation |
