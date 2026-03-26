// Numerology types

// Valid numerology numbers (1-9 or master numbers 11, 22, 33)
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type ChallengeNumber = 0 | NumerologyNumber;
export type KarmicDebtNumber = 13 | 14 | 16 | 19;

export interface NumerologyProfile {
  id: string;
  user_id: string;
  life_path: NumerologyNumber;
  destiny_number: NumerologyNumber;
  soul_urge: NumerologyNumber;
  personality_number: NumerologyNumber;
  birthday_number: NumerologyNumber;
  maturity_number: NumerologyNumber | null;
  calculated_at: string;
  calculation_version: string;
}

// Cyclic numbers (change daily/monthly/yearly)
export interface CyclicNumbers {
  personal_year: NumerologyNumber;
  personal_month: NumerologyNumber;
  personal_day: NumerologyNumber;
}

export interface LifeCyclePeriod<TNumber extends number = number> {
  cycle: 1 | 2 | 3 | 4;
  number: TNumber;
  from_age: number;
  to_age: number | null;
}

export interface NumerologyMethodology {
  school: 'pythagorean';
  reduction_rule: 'preserve_11_22_33';
  modules_used: Array<
    'core_numbers' |
    'personal_cycles' |
    'pinnacles' |
    'challenges' |
    'karmic_lessons' |
    'karmic_debt' |
    'hidden_passion' |
    'balance'
  >;
}

export interface AdvancedNumerologyContext {
  methodology: NumerologyMethodology;
  balance_number: NumerologyNumber;
  hidden_passion_numbers: NumerologyNumber[];
  karmic_lessons: NumerologyNumber[];
  karmic_debt_numbers: KarmicDebtNumber[];
  pinnacles: LifeCyclePeriod<NumerologyNumber>[];
  challenges: LifeCyclePeriod<ChallengeNumber>[];
  current_pinnacle: LifeCyclePeriod<NumerologyNumber>;
  current_challenge: LifeCyclePeriod<ChallengeNumber>;
}

// Full numerology context for a given date
export interface NumerologyContext extends CyclicNumbers {
  core: {
    life_path: NumerologyNumber;
    destiny_number: NumerologyNumber;
    soul_urge: NumerologyNumber;
    personality_number: NumerologyNumber;
    birthday_number: NumerologyNumber;
    maturity_number: NumerologyNumber | null;
  };
  advanced: AdvancedNumerologyContext;
}

// Letter to number mapping in numerology
export const LETTER_VALUES: Record<string, number> = {
  // Using Pythagorean system
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

// Y handling rule - treated as vowel only when it sounds like a vowel
export const Y_VOWEL_CONTEXTS = ['ay', 'ey', 'oy', 'uy'];

// Master numbers that should not be reduced
export const MASTER_NUMBERS = [11, 22, 33];
