/**
 * Insight Service Tests
 * Tests for LLM client, prompt builder, parser, validator, and fallback pipeline
 */

import { describe, it, expect } from 'vitest';

// Import all modules
import { LLMClient } from '../api/llm';
import {
  buildPrompt,
  createInsightRequest,
  buildBlueprintStagePrompt,
  buildNarrativeStagePrompt,
  buildPracticalStagePrompt,
  buildPresentationStagePrompt,
  buildDeepExpansionStagePrompt,
  buildVoicePolishStagePrompt,
  buildSpokenVietnameseStagePrompt,
} from './prompt';
import { createInterpretationBlueprint } from './interpretationEngine';
import {
  parseInsightResponse,
  parseBlueprintStageResponse,
  parseNarrativeStageResponse,
  parsePracticalStageResponse,
  parsePresentationStageResponse,
  parseDeepExpansionStageResponse,
  parseVoicePolishStageResponse,
  parseSpokenVietnameseStageResponse,
  extractJSON,
  ParseError,
} from './parser';
import {
  isValidConfidence,
  checkForbiddenPatterns,
  containsMarkdown,
  stripMarkdown,
} from './validation';
import { generateGenericFallback } from './fallback';
import { ClaimType, PERSONAL_DAY_THEMES } from './types';

function createAdvancedNumerologyFixture() {
  return {
    methodology: {
      school: 'pythagorean' as const,
      reduction_rule: 'preserve_11_22_33' as const,
      modules_used: [
        'core_numbers',
        'personal_cycles',
        'pinnacles',
        'challenges',
        'karmic_lessons',
        'karmic_debt',
        'hidden_passion',
        'balance',
      ],
    },
    balance_number: 5,
    hidden_passion_numbers: [5, 6],
    karmic_lessons: [2, 7],
    karmic_debt_numbers: [13],
    pinnacles: [
      { cycle: 1 as const, number: 3, from_age: 0, to_age: 32 },
      { cycle: 2 as const, number: 7, from_age: 33, to_age: 41 },
      { cycle: 3 as const, number: 1, from_age: 42, to_age: 50 },
      { cycle: 4 as const, number: 7, from_age: 51, to_age: null },
    ],
    challenges: [
      { cycle: 1 as const, number: 0, from_age: 0, to_age: 32 },
      { cycle: 2 as const, number: 5, from_age: 33, to_age: 41 },
      { cycle: 3 as const, number: 5, from_age: 42, to_age: 50 },
      { cycle: 4 as const, number: 5, from_age: 51, to_age: null },
    ],
    current_pinnacle: { cycle: 2 as const, number: 7, from_age: 33, to_age: 41 },
    current_challenge: { cycle: 2 as const, number: 5, from_age: 33, to_age: 41 },
  };
}

function createInterpretationFixture() {
  return {
    hierarchy: [
      { source: 'personal_day' as const, number: 5, weight: 1, role: 'trigger' as const },
      { source: 'personal_month' as const, number: 6, weight: 0.85, role: 'field' as const },
    ],
    primary_force: {
      source: 'personal_day' as const,
      number: 5,
      label: 'Đổi nhịp',
      role: 'trigger' as const,
      meaning: 'linh hoạt, thử nghiệm, dịch chuyển',
    },
    supporting_forces: [
      {
        source: 'personal_month' as const,
        number: 6,
        label: 'Chăm lo',
        role: 'field' as const,
        meaning: 'trách nhiệm, nâng đỡ, gắn kết',
      },
    ],
    friction_forces: [
      {
        source: 'current_challenge' as const,
        number: 5,
        label: 'Đổi nhịp',
        role: 'friction' as const,
        meaning: 'bốc đồng hoặc khó giữ nhịp',
      },
    ],
    pattern: {
      id: 'movement_with_responsibility' as const,
      label: 'đổi nhịp nhưng không rời nền',
      rationale: 'Ngày được dẫn bởi nhu cầu dịch chuyển nhưng vẫn bị giữ bởi trách nhiệm.',
    },
    central_dynamic: 'Trục chính của hôm nay là đổi nhịp được đặt trong bối cảnh chăm lo.',
    tension_line: 'mong muốn dịch chuyển đang đi cùng nhu cầu giữ nền và trách nhiệm',
    dominant_axis: {
      name: 'đổi mới và trách nhiệm',
      description: 'Ngày muốn mở ra hướng mới nhưng vẫn phải giữ nhịp ổn định với những cam kết đang có.',
    },
    conflict_grammar: {
      kind: 'push_pull' as const,
      summary: 'Một bên muốn đổi nhịp, một bên đòi giữ nền.',
      likely_overcorrection: 'Bốc quá nhanh hoặc giữ quá chặt.',
      balancing_move: 'Đổi ở phạm vi vừa đủ nhưng không bỏ rơi nền cũ.',
      naming_rule: 'Phải giữ cả hai vế trong cùng một trục đọc.',
    },
    report_archetype: {
      id: 'anchored_change_day' as const,
      label: 'ngày đổi nhịp có điểm tựa',
      narrative_role: 'Một ngày mở ra hướng mới nhưng vẫn phải đặt chân trên nền trách nhiệm.',
      report_emphasis: 'Nhấn vào cách đổi vừa đủ.',
      closing_tone: 'Kết bằng một nhịp điều chỉnh tỉnh táo.',
    },
    report_focuses: ['Đổi nhịp là lực mở đầu của ngày'],
    reading_angles: [
      { area: 'inner_state' as const, focus: 'Quan sát nhu cầu đổi nhịp trong tâm thế của bạn.' },
    ],
    section_plan: [
      {
        section: 'headline_frame' as const,
        objective: 'Đặt đúng tên cho nhịp chính của ngày bằng ngôn ngữ tự nhiên.',
        anchors: ['personal_day' as const, 'personal_month' as const],
        guidance: 'Headline phải phản ánh pattern thay vì chỉ đọc lại tên con số.',
      },
    ],
    assembly_plan: [
      {
        layer: 'quick' as const,
        order: 1,
        section: 'headline_frame' as const,
        intent: 'Mở nhanh bằng pattern chính.',
        anchors: ['personal_day' as const, 'personal_month' as const],
        must_include: ['pattern', 'dominant_axis'],
        avoid: ['generic filler'],
      },
    ],
    methodology_trace: {
      ruling_stack: ['personal_day' as const, 'personal_month' as const, 'current_challenge' as const],
      emphasis_order: ['Mở bằng đổi nhịp', 'Đặt nền bằng chăm lo'],
      do_not_overweight: ['karmic_lesson' as const, 'karmic_debt' as const, 'hidden_passion' as const],
    },
    methodology_notes: ['Ưu tiên đọc theo thứ tự: personal day -> personal month.'],
  };
}

function createInsightRequestFixture() {
  return createInsightRequest('user-stage-123', {
    personal_day: 5,
    personal_month: 6,
    personal_year: 3,
    life_path: 8,
    destiny_number: 3,
    soul_urge: 6,
    birthday_number: 5,
    advanced: createAdvancedNumerologyFixture(),
  }, {
    name: 'Tran Dinh Thanh',
    style_preference: 'practical',
    language: 'vi',
    interpretation: createInterpretationFixture(),
  });
}

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
      advanced: createAdvancedNumerologyFixture(),
    }, {
      interpretation: createInterpretationFixture(),
    });

    expect(request.schema_version).toBe('1.0');
    expect(request.user.id).toBe('user-123');
    expect(request.user.style_preference).toBe('practical');
    expect(request.user.language).toBe('en');
    expect(request.numerology.personal_day).toBe(5);
    expect(request.interpretation.primary_force.number).toBe(5);
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
        advanced: createAdvancedNumerologyFixture(),
      },
      {
        name: 'Jane Doe',
        style_preference: 'gentle',
        insight_length: 'brief',
        language: 'vi',
        interpretation: createInterpretationFixture(),
      }
    );

    expect(request.user.name).toBe('Jane Doe');
    expect(request.user.style_preference).toBe('gentle');
    expect(request.user.language).toBe('vi');
    expect(request.numerology.life_path).toBe(11);
    expect(request.numerology.destiny_number).toBe(22);
    expect(request.interpretation.tension_line).toContain('trách nhiệm');
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
      advanced: createAdvancedNumerologyFixture(),
    }, {
      interpretation: createInterpretationFixture(),
    });

    const { systemPrompt, userMessage } = buildPrompt(request);

    expect(systemPrompt).toContain('personal numerology companion');
    expect(systemPrompt).toContain('[Calculated]');
    expect(systemPrompt).toContain('[Interpreted]');
    expect(userMessage).toContain('user-789');
    expect(userMessage).toContain('"personal_day": 1');
    expect(userMessage).toContain('"current_pinnacle"');
    expect(userMessage).toContain('"primary_force"');
    expect(userMessage).toContain('"report_archetype"');
    expect(userMessage).toContain('"conflict_grammar"');
    expect(systemPrompt).toContain('"presentation"');
    expect(systemPrompt).toContain('"energy_map"');
    expect(systemPrompt).toContain('"practical_guidance"');
    expect(systemPrompt).toContain('translate the reading into concrete daily use');
    expect(systemPrompt).toContain('## PRESENTATION BLOCKS');
  });

  it('should build blueprint stage prompt with narrow stage schema', () => {
    const request = createInsightRequestFixture();
    const { systemPrompt, userMessage } = buildBlueprintStagePrompt(request);

    expect(systemPrompt).toContain('You are generating the blueprint');
    expect(systemPrompt).toContain('"opening_summary"');
    expect(systemPrompt).not.toContain('"practical_guidance"');
    expect(userMessage).toContain('"request_id"');
    expect(userMessage).toContain('"interpretation"');
  });

  it('should build staged prompts with staged context', () => {
    const request = createInsightRequestFixture();
    const blueprint = {
      headline: 'Năng lượng sáng tạo trong khung thực tế',
      theme: 'đổi nhịp có điểm tựa',
      opening_summary: 'Hôm nay có xu hướng muốn dịch chuyển nhưng vẫn cần giữ nền.',
      narrative_beats: [
        { title: 'Mở đầu ngày', summary: 'Nhìn ra lực mở đầu.' },
        { title: 'Giữ nền', summary: 'Không bỏ rơi trách nhiệm.' },
      ],
    };
    const narrative = {
      layers: {
        quick: { content: 'Lớp nhanh.' },
        standard: { content: 'Lớp tiêu chuẩn.' },
        deep: { content: 'Lớp sâu.' },
      },
    };
    const practical = {
      decision_compass: {
        lean_in: 'dịch chuyển có chọn lọc',
        hold_steady: 'cam kết đang có',
        avoid_force: 'đổi toàn bộ kế hoạch',
      },
      practical_guidance: [
        { area: 'micro_action' as const, title: 'Đổi nhịp nhỏ', suggestion: 'Thử một thay đổi nhỏ.', timing: 'buổi sáng' },
        { area: 'work' as const, title: 'Đổi cách làm', suggestion: 'Điều chỉnh một bước trong công việc.', timing: 'đầu giờ chiều' },
        { area: 'relationships' as const, title: 'Nói rõ hơn', suggestion: 'Mở lời nhẹ nhàng hơn bình thường.', timing: 'trong một cuộc trao đổi' },
        { area: 'self_regulation' as const, title: 'Giữ nhịp thở', suggestion: 'Chậm lại vài phút trước khi đổi hướng.', timing: 'khi thấy xao động' },
      ],
    };
    const presentation = {
      visual_scene: {
        atmosphere: 'muốn đổi nhịp nhưng vẫn bám nền',
        movement: 'dịch chuyển nhẹ nhưng không vội',
        focal_point: 'đừng bỏ rơi điều đang giữ bạn',
      },
      energy_map: [
        { label: 'đổi nhịp', intensity: 4 as const, meaning: 'Có thôi thúc làm khác đi một chút.' },
        { label: 'giữ nền', intensity: 4 as const, meaning: 'Vẫn cần giữ các cam kết đang có.' },
        { label: 'khép việc cũ', intensity: 3 as const, meaning: 'Một phần của ngày muốn khép nốt chuyện còn dang dở.' },
      ],
      closing_signal: {
        title: 'giữ nhịp',
        phrase: 'đổi một bước, nhưng vẫn giữ chân trên nền',
      },
    };

    const narrativePrompt = buildNarrativeStagePrompt(request, blueprint);
    const practicalPrompt = buildPracticalStagePrompt(request, blueprint, narrative);
    const presentationPrompt = buildPresentationStagePrompt(request, blueprint, practical);
    const deepExpansionPrompt = buildDeepExpansionStagePrompt(request, blueprint, narrative, practical);
    const expandedNarrative = {
      ...narrative,
      layers: {
        ...narrative.layers,
        standard: { content: 'Lớp tiêu chuẩn dày hơn.' },
        deep: { content: 'Lớp sâu dày hơn và nhiều góc hơn.' },
      },
    };
    const voicePrompt = buildVoicePolishStagePrompt(request, blueprint, expandedNarrative, practical, presentation);
    const spokenPrompt = buildSpokenVietnameseStagePrompt(request, {
      headline: 'Thử một bước mới',
      theme: 'đổi nhẹ nhưng không đứt nền',
      layers: {
        quick: 'Lớp nhanh đã nói như người hơn.',
        standard: 'Lớp tiêu chuẩn đã được viết lại tự nhiên hơn.',
        deep: 'Lớp sâu đã bớt mùi phân tích và gần lời nói hơn.',
      },
      visual_scene: presentation.visual_scene,
      energy_map: presentation.energy_map,
      decision_compass: practical.decision_compass,
      practical_guidance: practical.practical_guidance,
      narrative_beats: blueprint.narrative_beats,
      closing_signal: presentation.closing_signal,
    });

    expect(narrativePrompt.systemPrompt).toContain('You are writing the full narrative layers');
    expect(narrativePrompt.systemPrompt).toContain('"deep"');
    expect(narrativePrompt.userMessage).toContain('"blueprint"');
    expect(practicalPrompt.systemPrompt).toContain('translating the reading into usable guidance');
    expect(practicalPrompt.userMessage).toContain('"narrative_context"');
    expect(presentationPrompt.systemPrompt).toContain('generating the presentation layer');
    expect(presentationPrompt.userMessage).toContain('"decision_compass"');
    expect(deepExpansionPrompt.systemPrompt).toContain('expanding the substantial layers');
    expect(deepExpansionPrompt.userMessage).toContain('"expansion_context"');
    expect(voicePrompt.systemPrompt).toContain('final editorial and voice polish pass');
    expect(voicePrompt.userMessage).toContain('"draft_report"');
    expect(spokenPrompt.systemPrompt).toContain('final spoken-Vietnamese rewrite');
    expect(spokenPrompt.userMessage).toContain('"spoken_draft"');
  });
});

describe('Interpretation Engine', () => {
  it('should classify a movement-with-responsibility pattern', () => {
    const blueprint = createInterpretationBlueprint({
      personal_day: 5,
      personal_month: 6,
      personal_year: 3,
      life_path: 8,
      destiny_number: 3,
      soul_urge: 6,
      birthday_number: 5,
      advanced: createAdvancedNumerologyFixture(),
    });

    expect(blueprint.pattern.id).toBe('movement_with_responsibility');
    expect(blueprint.dominant_axis.name).toContain('đổi mới');
    expect(blueprint.report_archetype.id).toBe('anchored_change_day');
    expect(blueprint.conflict_grammar.kind).toBe('push_pull');
    expect(blueprint.section_plan[0].section).toBe('headline_frame');
    expect(blueprint.methodology_trace.ruling_stack[0]).toBe('personal_day');
  });
});

// ==================== PARSER TESTS ====================

describe('Response Parser', () => {
  it('should parse deep expansion stage responses', () => {
    const parsed = parseDeepExpansionStageResponse(
      JSON.stringify({
        layers: {
          standard: 'Lớp tiêu chuẩn được mở rộng rõ hơn.',
          deep: 'Lớp sâu được mở rộng với nhiều góc hơn và không bị nén.',
        },
      })
    );

    expect(parsed.layers.standard).toContain('mở rộng');
    expect(parsed.layers.deep).toContain('nhiều góc');
  });

  it('should parse spoken Vietnamese stage responses', () => {
    const parsed = parseSpokenVietnameseStageResponse(
      JSON.stringify({
        headline: 'Thử một bước mới, nhưng đừng rời nền',
        theme: 'dịch chuyển có chừng mực',
        layers: {
          quick: 'Hôm nay dễ muốn đổi nhịp một chút.',
          standard: 'Bạn có thể muốn thử cách khác, nhưng vẫn sẽ thấy mình cần giữ những điều đang đỡ mình.',
          deep: 'Khi nhìn kỹ hơn, bạn có thể thấy nhu cầu đổi mới không hề đối lập với trách nhiệm, miễn là bạn đi từng bước vừa tầm.',
        },
        visual_scene: {
          atmosphere: 'muốn dịch chuyển nhưng vẫn giữ nền',
          movement: 'đổi nhẹ trong nhịp quen',
          focal_point: 'đừng bỏ rơi điều quan trọng',
        },
        energy_map: [
          { label: 'đổi nhịp', intensity: 4, meaning: 'Có nhu cầu thử khác đi.' },
          { label: 'giữ nền', intensity: 4, meaning: 'Vẫn cần giữ điều cốt lõi.' },
          { label: 'tự cân bằng', intensity: 3, meaning: 'Ngày đòi hỏi sự điều chỉnh mềm.' },
        ],
        decision_compass: {
          lean_in: 'thử một bước nhỏ',
          hold_steady: 'giữ các cam kết chính',
          avoid_force: 'đổi quá tay',
        },
        practical_guidance: [
          { area: 'micro_action', title: 'Đổi một chút', suggestion: 'Thử khác đi ở một việc nhỏ.', timing: 'đầu ngày' },
          { area: 'work', title: 'Giữ mục tiêu', suggestion: 'Đổi cách làm nhưng giữ đích đến.', timing: 'giữa buổi' },
          { area: 'relationships', title: 'Nói nhẹ hơn', suggestion: 'Mở một câu chuyện mới thật nhẹ.', timing: 'khi trò chuyện' },
          { area: 'self_regulation', title: 'Chậm lại', suggestion: 'Dừng vài phút trước khi bẻ hướng.', timing: 'khi thấy vội' },
        ],
        narrative_beats: [
          { title: 'mở ra', summary: 'Một điều mới đang muốn chen vào.' },
          { title: 'giữ nền', summary: 'Nhưng điều quan trọng vẫn cần được giữ.' },
          { title: 'đi vừa tầm', summary: 'Đổi đủ thôi là đẹp.' },
        ],
        closing_signal: {
          title: 'giữ nhịp',
          phrase: 'đổi một chút thôi, nhưng đừng buông nền.',
        },
      })
    );

    expect(parsed.headline).toContain('bước mới');
    expect(parsed.layers.deep).toContain('nhìn kỹ hơn');
    expect(parsed.practical_guidance).toHaveLength(4);
  });

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
      presentation: {
        visual_scene: {
          atmosphere: 'Calm but forward-moving',
          movement: 'gentle momentum toward a fresh start',
          focal_point: 'the first step you are willing to own',
        },
        energy_map: [
          {
            label: 'Fresh motion',
            intensity: 4,
            meaning: 'The day favors initiative when it stays grounded.',
          },
          {
            label: 'Measured pace',
            intensity: 3,
            meaning: 'Move, but not so fast that you lose clarity.',
          },
        ],
        decision_compass: {
          lean_in: 'starting the part that is already clear',
          hold_steady: 'your existing commitments',
          avoid_force: 'big declarations before the path is visible',
        },
        practical_guidance: [
          {
            area: 'micro_action',
            title: 'Start one clear piece',
            suggestion: 'Pick one small beginning and complete it before expanding the scope.',
            timing: 'at the start of the day',
          },
          {
            area: 'work',
            title: 'Move one priority',
            suggestion: 'Advance the task that already has momentum instead of opening three new threads.',
            timing: 'when work begins',
          },
          {
            area: 'relationships',
            title: 'Say it plainly',
            suggestion: 'Use one direct sentence if a conversation matters instead of hinting around it.',
            timing: 'during a key exchange',
          },
          {
            area: 'self_regulation',
            title: 'Leave room to adjust',
            suggestion: 'Pause before making a big declaration so the day can still evolve.',
            timing: 'when emotion spikes',
          },
        ],
        narrative_beats: [
          {
            title: 'Open the day',
            summary: 'Name the new energy without overstating it.',
          },
          {
            title: 'Hold the line',
            summary: 'Keep one practical anchor while you move.',
          },
        ],
        closing_signal: {
          title: 'Carry this',
          phrase: 'Begin in a way that still leaves room to adjust.',
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
    expect(parsed.insight.presentation?.energy_map[0]?.label).toBe('Fresh motion');
    expect(parsed.insight.presentation?.practical_guidance).toHaveLength(4);
    expect(parsed.insight.presentation?.practical_guidance[1]?.area).toBe('work');
    expect(parsed.insight.presentation?.closing_signal.title).toBe('Carry this');
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

  it('should parse blueprint stage response', () => {
    const parsed = parseBlueprintStageResponse(JSON.stringify({
      headline: 'Năng lượng sáng tạo trong khuôn khổ',
      theme: 'đổi nhịp có nền',
      opening_summary: 'Hôm nay có xu hướng muốn dịch chuyển nhưng vẫn cần giữ nền.',
      narrative_beats: [
        { title: 'Mở đầu ngày', summary: 'Nhìn ra lực đẩy ban đầu.' },
        { title: 'Giữ nhịp', summary: 'Không rời khỏi phần việc đang có.' },
      ],
    }));

    expect(parsed.headline).toContain('Năng lượng');
    expect(parsed.narrative_beats).toHaveLength(2);
  });

  it('should parse narrative stage response', () => {
    const parsed = parseNarrativeStageResponse(JSON.stringify({
      layers: {
        quick: {
          content: '[Calculated] Hôm nay là Ngày cá nhân 5. [Interpreted] Bạn có thể thấy nhu cầu đổi nhịp.',
          claims: [
            { type: 'calculated', text: '[Calculated] Hôm nay là Ngày cá nhân 5.', confidence: 1.0 },
            { type: 'interpreted', text: '[Interpreted] Bạn có thể thấy nhu cầu đổi nhịp.', confidence: 0.7 },
          ],
        },
        standard: {
          content: '[Calculated] Tháng cá nhân là 6. [Interpreted] Vì vậy ngày đổi nhịp này vẫn cần giữ nền.',
          claims: [
            { type: 'calculated', text: '[Calculated] Tháng cá nhân là 6.', confidence: 1.0 },
            { type: 'interpreted', text: '[Interpreted] Vì vậy ngày đổi nhịp này vẫn cần giữ nền.', confidence: 0.7 },
          ],
        },
        deep: {
          content: '[Calculated] Năm cá nhân là 3. [Interpreted] Trục sáng tạo của năm khiến thay đổi hôm nay có tiếng vang lớn hơn.',
          claims: [
            { type: 'calculated', text: '[Calculated] Năm cá nhân là 3.', confidence: 1.0 },
            { type: 'interpreted', text: '[Interpreted] Trục sáng tạo của năm khiến thay đổi hôm nay có tiếng vang lớn hơn.', confidence: 0.8 },
          ],
        },
      },
      confidence: {
        overall: 0.82,
        breakdown: {
          calculated: 1.0,
          interpreted: 0.8,
        },
      },
    }));

    expect(parsed.layers.deep?.content).toContain('Trục sáng tạo');
    expect(parsed.confidence.breakdown.interpreted).toBe(0.8);
  });

  it('should parse practical stage response', () => {
    const parsed = parsePracticalStageResponse(JSON.stringify({
      decision_compass: {
        lean_in: 'dịch chuyển trong phạm vi hẹp',
        hold_steady: 'nhịp trách nhiệm đang có',
        avoid_force: 'đổi tất tay khi chưa đủ dữ liệu',
      },
      practical_guidance: [
        {
          area: 'micro_action',
          title: 'Đổi một bước',
          suggestion: 'Thử một thay đổi nhỏ trước khi mở rộng.',
          timing: 'đầu buổi sáng',
        },
        {
          area: 'work',
          title: 'Dịch chuyển có neo',
          suggestion: 'Tiến một phần việc quan trọng nhưng giữ nguyên deadline chính.',
          timing: 'lúc vào việc',
        },
        {
          area: 'relationships',
          title: 'Nói thẳng nhưng ấm',
          suggestion: 'Nói rõ điều bạn cần thay vì chờ người khác đoán.',
          timing: 'trong một trao đổi quan trọng',
        },
        {
          area: 'self_regulation',
          title: 'Để mình thở',
          suggestion: 'Dừng lại vài phút nếu thấy mình đang đổi quá nhanh.',
          timing: 'khi cảm xúc tăng lên',
        },
      ],
    }));

    expect(parsed.practical_guidance).toHaveLength(4);
    expect(parsed.practical_guidance[2]?.area).toBe('relationships');
  });

  it('should parse presentation stage response', () => {
    const parsed = parsePresentationStageResponse(JSON.stringify({
      visual_scene: {
        atmosphere: 'mở ra nhưng vẫn có nền',
        movement: 'dịch chuyển vừa đủ',
        focal_point: 'một thay đổi có chủ đích',
      },
      energy_map: [
        { label: 'dịch chuyển', intensity: 4, meaning: 'Ngày có lực đẩy để thử cách mới.' },
        { label: 'giữ nền', intensity: 4, meaning: 'Cam kết cũ vẫn cần được giữ.' },
        { label: 'sáng tạo', intensity: 3, meaning: 'Có khoảng trống để nói theo cách riêng.' },
      ],
      closing_signal: {
        title: 'Mang theo',
        phrase: 'Đổi vừa đủ để ngày mở ra mà nền vẫn còn đó.',
      },
    }));

    expect(parsed.energy_map).toHaveLength(3);
    expect(parsed.closing_signal.title).toBe('Mang theo');
  });

  it('should parse voice polish stage response', () => {
    const parsed = parseVoicePolishStageResponse(JSON.stringify({
      headline: 'Đổi nhẹ thôi, nhưng đừng lỏng tay với điều đang giữ',
      theme: 'đổi mới có điểm tựa',
      layers: {
        quick: 'Hôm nay muốn đổi một chút, nhưng vẫn cần giữ các cam kết đang có.',
        standard: 'Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba.\n\nĐoạn bốn.',
        deep: 'Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba.\n\nĐoạn bốn.\n\nĐoạn năm.\n\nĐoạn sáu.\n\nĐoạn bảy.',
      },
      visual_scene: {
        atmosphere: 'muốn đổi nhịp nhưng vẫn bám nền',
        movement: 'dịch chuyển nhẹ nhưng không vội',
        focal_point: 'đừng bỏ rơi điều đang giữ bạn',
      },
      energy_map: [
        { label: 'đổi nhịp', intensity: 4, meaning: 'Có thôi thúc làm khác đi một chút.' },
        { label: 'giữ nền', intensity: 4, meaning: 'Vẫn cần giữ các cam kết đang có.' },
        { label: 'khép việc cũ', intensity: 3, meaning: 'Một phần của ngày muốn khép nốt chuyện còn dang dở.' },
      ],
      decision_compass: {
        lean_in: 'điều mới ở phạm vi nhỏ',
        hold_steady: 'việc đang cam kết',
        avoid_force: 'đảo tung mọi thứ',
      },
      practical_guidance: [
        { area: 'micro_action', title: 'Đổi nhịp nhỏ', suggestion: 'Thử một thay đổi nhỏ.', timing: 'buổi sáng' },
        { area: 'work', title: 'Đổi cách làm', suggestion: 'Điều chỉnh một bước trong công việc.', timing: 'đầu giờ chiều' },
        { area: 'relationships', title: 'Nói rõ hơn', suggestion: 'Mở lời nhẹ nhàng hơn bình thường.', timing: 'trong một cuộc trao đổi' },
        { area: 'self_regulation', title: 'Giữ nhịp thở', suggestion: 'Chậm lại vài phút trước khi đổi hướng.', timing: 'khi thấy xao động' },
      ],
      narrative_beats: [
        { title: 'điều mở ra', summary: 'Có điều gì đó muốn chuyển động.' },
        { title: 'điều cần giữ', summary: 'Nhưng nền cũ vẫn đang giữ vai trò quan trọng.' },
        { title: 'cách đi tiếp', summary: 'Chỉ cần đổi vừa đủ để không đứt nhịp.' },
      ],
      closing_signal: {
        title: 'giữ nhịp',
        phrase: 'đổi một bước, nhưng vẫn giữ chân trên nền',
      },
    }));

    expect(parsed.headline).toContain('Đổi nhẹ');
    expect(parsed.theme).toBe('đổi mới có điểm tựa');
    expect(parsed.layers.quick).toContain('cam kết');
    expect(parsed.practical_guidance).toHaveLength(4);
    expect(parsed.narrative_beats).toHaveLength(3);
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
      expect(fallback.insight.presentation?.energy_map).toHaveLength(3);
      expect(fallback.insight.presentation?.practical_guidance).toHaveLength(4);
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
      advanced: createAdvancedNumerologyFixture(),
    };

    const request = createInsightRequest('test-user', numerologyContext, {
      style_preference: 'direct',
      language: 'en',
      interpretation: createInterpretationFixture(),
    });

    const { systemPrompt, userMessage } = buildPrompt(request);

    expect(systemPrompt).toContain('direct');
    expect(userMessage).toContain('"personal_day": 3');
    expect(systemPrompt).toContain('current pinnacle');
    expect(systemPrompt).toContain('interpretation blueprint');
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
