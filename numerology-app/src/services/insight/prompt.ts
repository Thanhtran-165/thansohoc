/**
 * Prompt Builder
 * Constructs system prompts and user context payloads for LLM API
 * Based on Prompt-Output-Contract-v1.2.md
 */

import { logger } from '../../utils/logger';
import { InsightRequest, PROMPT_VERSION } from './types';

/**
 * System prompt (static) - defines AI behavior and output requirements
 */
const SYSTEM_PROMPT = `You are a personal numerology companion that provides interpretive guidance based on numerology cycles.

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
- "There's an energy of..." (descriptive)`;

/**
 * Build the user message payload for the LLM
 */
export function buildUserMessage(request: InsightRequest): string {
  const payload = {
    schema_version: request.schema_version,
    user: {
      id: request.user.id,
      name: request.user.name,
      style_preference: request.user.style_preference,
      insight_length: request.user.insight_length,
      language: request.user.language,
    },
    numerology: request.numerology,
    date: request.date,
    request_id: request.request_id,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Build the complete prompt for the LLM API
 * Returns system prompt and user message
 */
export function buildPrompt(request: InsightRequest): {
  systemPrompt: string;
  userMessage: string;
} {
  logger.debug('Building prompt for insight generation', {
    request_id: request.request_id,
    user_id: request.user.id,
    personal_day: request.numerology.personal_day,
  });

  const userMessage = buildUserMessage(request);

  // Add output schema instructions to system prompt
  const outputInstructions = `

## OUTPUT SCHEMA
You MUST output a valid JSON object with this exact structure:
{
  "schema_version": "1.0",
  "request_id": "${request.request_id}",
  "generated_at": "<ISO 8601 timestamp>",
  "model": "<your model name>",
  "insight": {
    "headline": "<5-10 word headline>",
    "theme": "<1-3 word theme>",
    "layers": {
      "quick": {
        "content": "<2-3 sentences, ~50 words>",
        "claims": [{"type": "calculated|interpreted|exploratory", "text": "<claim text with marker>", "confidence": 1.0|0.6|0.7|0.8|null}]
      },
      "standard": {
        "content": "<3-5 paragraphs, ~200 words>",
        "claims": [{"type": "calculated|interpreted|exploratory", "text": "<claim text with marker>", "confidence": 1.0|0.6|0.7|0.8|null}]
      }
    },
    "confidence": {
      "overall": <0.0-1.0>,
      "breakdown": {"calculated": 1.0, "interpreted": <0.6|0.7|0.8>}
    }
  },
  "metadata": {
    "prompt_version": "${PROMPT_VERSION}",
    "claim_types_used": ["calculated", "interpreted"],
    "word_counts": {"quick": <number>, "standard": <number>},
    "processing_time_ms": <number>
  }
}

IMPORTANT: Output ONLY the JSON object, no other text.`;

  return {
    systemPrompt: SYSTEM_PROMPT + outputInstructions,
    userMessage,
  };
}

/**
 * Create an insight request payload
 */
export function createInsightRequest(
  userId: string,
  numerology: {
    personal_day: number;
    personal_month: number;
    personal_year: number;
    life_path: number;
    destiny_number: number;
    soul_urge: number;
    birthday_number: number;
  },
  options: {
    name?: string;
    style_preference?: 'gentle' | 'direct' | 'practical' | 'spiritual';
    insight_length?: 'brief' | 'detailed';
    language?: 'vi' | 'en';
    date?: string;
  } = {}
): InsightRequest {
  const requestId = crypto.randomUUID();

  return {
    schema_version: '1.0',
    user: {
      id: userId,
      name: options.name,
      style_preference: options.style_preference || 'practical',
      insight_length: options.insight_length || 'detailed',
      language: options.language || 'en',
    },
    numerology,
    date: options.date || new Date().toISOString().split('T')[0],
    request_id: requestId,
  };
}

export default { buildPrompt, buildUserMessage, createInsightRequest };
