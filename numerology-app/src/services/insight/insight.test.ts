/**
 * Insight Service Tests
 * Tests for LLM client, prompt builder, parser, validator, and fallback pipeline
 */

import { describe, it, expect } from 'vitest';

// Import all modules
import { LLMClient } from '../api/llm';
import { buildPrompt, createInsightRequest } from './prompt';
import { parseInsightResponse, extractJSON, ParseError } from './parser';
import {
  isValidConfidence,
  checkForbiddenPatterns,
  containsMarkdown,
  stripMarkdown,
} from './validation';
import { generateGenericFallback } from './fallback';
import { ClaimType, PERSONAL_DAY_THEMES } from './types';

// ==================== LLM CLIENT TESTS ====================

describe('LLM Client', () => {
  it('should create client with default config', () => {
    const client = new LLMClient('test-key');
    expect(client).toBeDefined();
  });

  // Note: Actual API calls would be mocked in integration tests
});

// ==================== PROMPT BUILDER TESTS ====================

describe('Prompt Builder', () => {
  it('should create insight request with defaults', () => {
    const request = createInsightRequest('user-123', {
      personal_day: 5,
      personal_month: 3,
      personal_year: 1,
      life_path: 4,
      destiny_number: 8,
      soul_urge: 3,
      birthday_number: 6,
    });

    expect(request.schema_version).toBe('1.0');
    expect(request.user.id).toBe('user-123');
    expect(request.user.style_preference).toBe('practical');
    expect(request.user.language).toBe('en');
    expect(request.numerology.personal_day).toBe(5);
    expect(request.request_id).toBeDefined();
  });

  it('should create insight request with custom options', () => {
    const request = createInsightRequest(
      'user-456',
      {
        personal_day: 9,
        personal_month: 6,
        personal_year: 2,
        life_path: 11,
        destiny_number: 22,
        soul_urge: 6,
        birthday_number: 5,
      },
      {
        name: 'Jane Doe',
        style_preference: 'gentle',
        insight_length: 'brief',
        language: 'vi',
      }
    );

    expect(request.user.name).toBe('Jane Doe');
    expect(request.user.style_preference).toBe('gentle');
    expect(request.user.language).toBe('vi');
    expect(request.numerology.life_path).toBe(11);
    expect(request.numerology.destiny_number).toBe(22);
  });

  it('should build prompt with system and user messages', () => {
    const request = createInsightRequest('user-789', {
      personal_day: 1,
      personal_month: 1,
      personal_year: 1,
      life_path: 1,
      destiny_number: 1,
      soul_urge: 1,
      birthday_number: 1,
    });

    const { systemPrompt, userMessage } = buildPrompt(request);

    expect(systemPrompt).toContain('personal numerology companion');
    expect(systemPrompt).toContain('[Calculated]');
    expect(systemPrompt).toContain('[Interpreted]');
    expect(userMessage).toContain('user-789');
    expect(userMessage).toContain('"personal_day": 1');
  });
});

// ==================== PARSER TESTS ====================

describe('Response Parser', () => {
  const validResponse = {
    schema_version: '1.0',
    request_id: 'test-request-123',
    generated_at: '2024-01-15T06:00:00Z',
    model: 'deepseek-reasoner',
    insight: {
      headline: 'A Day for New Beginnings',
      theme: 'Fresh Starts',
      layers: {
        quick: {
          content:
            '[Calculated] Today is Personal Day 1. [Interpreted] This could be a day for new beginnings.',
          claims: [
            {
              type: 'calculated',
              text: '[Calculated] Today is Personal Day 1.',
              confidence: 1.0,
            },
            {
              type: 'interpreted',
              text: '[Interpreted] This could be a day for new beginnings.',
              confidence: 0.7,
            },
          ],
        },
        standard: {
          content:
            '[Calculated] Today is Personal Day 1.\n\n[Interpreted] Personal Day 1 is often associated with fresh starts and initiative.',
          claims: [
            {
              type: 'calculated',
              text: '[Calculated] Today is Personal Day 1.',
              confidence: 1.0,
            },
            {
              type: 'interpreted',
              text: '[Interpreted] Personal Day 1 is often associated with fresh starts and initiative.',
              confidence: 0.7,
            },
          ],
        },
      },
      confidence: {
        overall: 0.85,
        breakdown: {
          calculated: 1.0,
          interpreted: 0.7,
        },
      },
    },
    metadata: {
      prompt_version: '1.0.0',
      claim_types_used: ['calculated', 'interpreted'],
      word_counts: { quick: 20, standard: 30 },
      processing_time_ms: 2000,
    },
  };

  it('should extract JSON from content with extra text', () => {
    const content = `Here is the insight:\n${JSON.stringify(validResponse)}\nHope this helps!`;
    const extracted = extractJSON(content);
    expect(extracted).toContain('"schema_version"');
  });

  it('should parse valid insight response', () => {
    const parsed = parseInsightResponse(
      JSON.stringify(validResponse),
      'test-request-123',
      'deepseek-reasoner',
      2000
    );

    expect(parsed.schema_version).toBe('1.0');
    expect(parsed.request_id).toBe('test-request-123');
    expect(parsed.insight.headline).toBe('A Day for New Beginnings');
    expect(parsed.insight.layers.quick.claims).toHaveLength(2);
  });

  it('should throw ParseError for invalid JSON', () => {
    expect(() => parseInsightResponse('not json', 'req-123', 'model', 1000)).toThrow(ParseError);
  });

  it('should throw ParseError for missing layers', () => {
    const invalidResponse = { ...validResponse, insight: { ...validResponse.insight, layers: null } };
    expect(() =>
      parseInsightResponse(JSON.stringify(invalidResponse), 'req-123', 'model', 1000)
    ).toThrow(ParseError);
  });

  it('should throw ParseError for claims without markers', () => {
    const invalidResponse = JSON.parse(JSON.stringify(validResponse));
    invalidResponse.insight.layers.quick.claims[0].text = 'Today is Personal Day 1.';
    expect(() =>
      parseInsightResponse(JSON.stringify(invalidResponse), 'req-123', 'model', 1000)
    ).toThrow(ParseError);
  });
});

// ==================== VALIDATION TESTS ====================

describe('Validation', () => {
  describe('isValidConfidence', () => {
    it('should return true for calculated claim with confidence 1.0', () => {
      expect(isValidConfidence('calculated', 1.0)).toBe(true);
    });

    it('should return false for calculated claim with other confidence', () => {
      expect(isValidConfidence('calculated', 0.7)).toBe(false);
    });

    it('should return true for interpreted claim with bucketed confidence', () => {
      expect(isValidConfidence('interpreted', 0.6)).toBe(true);
      expect(isValidConfidence('interpreted', 0.7)).toBe(true);
      expect(isValidConfidence('interpreted', 0.8)).toBe(true);
    });

    it('should return false for interpreted claim with non-bucketed confidence', () => {
      expect(isValidConfidence('interpreted', 0.75)).toBe(false);
      expect(isValidConfidence('interpreted', 1.0)).toBe(false);
    });

    it('should return true for exploratory claim with null confidence', () => {
      expect(isValidConfidence('exploratory', null)).toBe(true);
    });
  });

  describe('checkForbiddenPatterns', () => {
    it('should detect predictive certainty', () => {
      const text = 'You will succeed today.';
      const matches = checkForbiddenPatterns(text);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should detect absolute personality claims', () => {
      const text = 'You are a natural leader.';
      const matches = checkForbiddenPatterns(text);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should not flag valid tentative language', () => {
      const text = 'You might consider starting a new project.';
      const matches = checkForbiddenPatterns(text);
      expect(matches).toHaveLength(0);
    });
  });

  describe('containsMarkdown', () => {
    it('should detect bold markdown', () => {
      expect(containsMarkdown('This is **bold** text')).toBe(true);
    });

    it('should detect markdown lists', () => {
      expect(containsMarkdown('- Item 1\n- Item 2')).toBe(true);
    });

    it('should not flag plain text', () => {
      expect(containsMarkdown('This is plain text.')).toBe(false);
    });
  });

  describe('stripMarkdown', () => {
    it('should remove bold markers', () => {
      expect(stripMarkdown('This is **bold**')).toBe('This is bold');
    });

    it('should remove italic markers', () => {
      expect(stripMarkdown('This is *italic*')).toBe('This is italic');
    });
  });
});

// ==================== FALLBACK TESTS ====================

describe('Fallback Pipeline', () => {
  describe('generateGenericFallback', () => {
    it('should generate fallback with correct personal day theme', () => {
      const fallback = generateGenericFallback(5, 'req-123', 'timeout');

      expect(fallback.is_fallback).toBe(true);
      expect(fallback.fallback_reason).toBe('timeout');
      expect(fallback.insight.theme).toBe(PERSONAL_DAY_THEMES[5].theme);
      expect(fallback.insight.layers.quick.claims).toHaveLength(2);
    });

    it('should include calculated and interpreted claims', () => {
      const fallback = generateGenericFallback(9, 'req-456', 'error');

      const claimTypes = fallback.insight.layers.quick.claims.map((c) => c.type);
      expect(claimTypes).toContain('calculated');
      expect(claimTypes).toContain('interpreted');
    });

    it('should handle master number personal days', () => {
      const fallback = generateGenericFallback(11, 'req-789', 'no_cache');
      expect(fallback.insight.theme).toBe(PERSONAL_DAY_THEMES[11].theme);
    });

    it('should default to completion theme for unknown personal day', () => {
      const fallback = generateGenericFallback(99, 'req-000', 'timeout');
      expect(fallback.insight.theme).toBe(PERSONAL_DAY_THEMES[9].theme);
    });
  });

  describe('Personal Day Themes', () => {
    it('should have themes for all numbers 1-9 and master numbers', () => {
      const expectedDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
      expectedDays.forEach((day) => {
        expect(PERSONAL_DAY_THEMES[day]).toBeDefined();
        expect(PERSONAL_DAY_THEMES[day].theme).toBeDefined();
        expect(PERSONAL_DAY_THEMES[day].meaning).toBeDefined();
      });
    });
  });
});

// ==================== INTEGRATION TESTS ====================

describe('Insight Pipeline Integration', () => {
  it('should create valid request and build prompt', () => {
    const numerologyContext = {
      personal_day: 3,
      personal_month: 6,
      personal_year: 9,
      life_path: 5,
      destiny_number: 7,
      soul_urge: 3,
      birthday_number: 8,
    };

    const request = createInsightRequest('test-user', numerologyContext, {
      style_preference: 'direct',
      language: 'en',
    });

    const { systemPrompt, userMessage } = buildPrompt(request);

    expect(systemPrompt).toContain('direct');
    expect(userMessage).toContain('"personal_day": 3');
    expect(request.numerology.personal_year).toBe(9);
  });

  it('should validate confidence bucketing correctly', () => {
    // Test all confidence combinations
    const validCombinations: Array<{ type: ClaimType; confidence: number | null }> = [
      { type: 'calculated', confidence: 1.0 },
      { type: 'interpreted', confidence: 0.6 },
      { type: 'interpreted', confidence: 0.7 },
      { type: 'interpreted', confidence: 0.8 },
      { type: 'exploratory', confidence: null },
    ];

    validCombinations.forEach(({ type, confidence }) => {
      expect(isValidConfidence(type, confidence)).toBe(true);
    });
  });
});
