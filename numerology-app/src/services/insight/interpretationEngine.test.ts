import { describe, expect, it } from 'vitest';
import { createInterpretationBlueprint } from './interpretationEngine';
import { NumerologyContext } from './types';

function buildContext(overrides: Partial<NumerologyContext>): NumerologyContext {
  return {
    personal_day: 5,
    personal_month: 6,
    personal_year: 3,
    life_path: 8,
    destiny_number: 3,
    soul_urge: 6,
    birthday_number: 5,
    advanced: {
      methodology: {
        school: 'pythagorean',
        reduction_rule: 'preserve_11_22_33',
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
      hidden_passion_numbers: [5],
      karmic_lessons: [2, 7],
      karmic_debt_numbers: [13],
      pinnacles: [
        { cycle: 1, number: 3, from_age: 0, to_age: 32 },
        { cycle: 2, number: 7, from_age: 33, to_age: 41 },
        { cycle: 3, number: 1, from_age: 42, to_age: 50 },
        { cycle: 4, number: 7, from_age: 51, to_age: null },
      ],
      challenges: [
        { cycle: 1, number: 0, from_age: 0, to_age: 32 },
        { cycle: 2, number: 4, from_age: 33, to_age: 41 },
        { cycle: 3, number: 5, from_age: 42, to_age: 50 },
        { cycle: 4, number: 5, from_age: 51, to_age: null },
      ],
      current_pinnacle: { cycle: 2, number: 7, from_age: 33, to_age: 41 },
      current_challenge: { cycle: 2, number: 4, from_age: 33, to_age: 41 },
    },
    ...overrides,
  };
}

describe('Interpretation Engine Golden Cases', () => {
  it.each([
    {
      name: 'movement with responsibility',
      context: buildContext({ personal_day: 5, personal_month: 6 }),
      pattern: 'movement_with_responsibility',
      archetype: 'anchored_change_day',
      conflict: 'push_pull',
    },
    {
      name: 'expression through structure',
      context: buildContext({ personal_day: 3, personal_month: 4, personal_year: 8 }),
      pattern: 'expression_through_structure',
      archetype: 'structured_expression_day',
      conflict: 'channeling',
    },
    {
      name: 'reflection before action',
      context: buildContext({ personal_day: 7, personal_month: 5, personal_year: 1 }),
      pattern: 'reflection_before_action',
      archetype: 'threshold_day',
      conflict: 'recalibration',
    },
    {
      name: 'completion before beginning',
      context: buildContext({ personal_day: 9, personal_month: 1, personal_year: 5 }),
      pattern: 'completion_before_beginning',
      archetype: 'closure_day',
      conflict: 'closure_transition',
    },
    {
      name: 'power with balance',
      context: buildContext({ personal_day: 8, personal_month: 2, personal_year: 6 }),
      pattern: 'power_with_balance',
      archetype: 'integration_day',
      conflict: 'amplification',
    },
  ])('should classify $name', ({ context, pattern, archetype, conflict }) => {
    const blueprint = createInterpretationBlueprint(context);

    expect(blueprint.pattern.id).toBe(pattern);
    expect(blueprint.report_archetype.id).toBe(archetype);
    expect(blueprint.conflict_grammar.kind).toBe(conflict);
    expect(blueprint.assembly_plan.some((item) => item.layer === 'deep')).toBe(true);
    expect(blueprint.assembly_plan[0].section).toBe('headline_frame');
    expect(blueprint.methodology_trace.ruling_stack[0]).toBe('personal_day');
  });
});
