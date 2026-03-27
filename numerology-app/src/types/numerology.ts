// Numerology types

// Valid numerology numbers (1-9 or master numbers 11, 22, 33)
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type ChallengeNumber = 0 | NumerologyNumber;
export type KarmicDebtNumber = 13 | 14 | 16 | 19;
export type LoShuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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

export interface TransitLetterWindow {
  source: 'leading_name' | 'middle_name' | 'ending_name';
  label: string;
  letter: string;
  value: NumerologyNumber;
  from_age: number;
  to_age: number;
}

export interface TransitYearProfile {
  year: number;
  age: number;
  letters: TransitLetterWindow[];
  essence_compound: number;
  essence_number: NumerologyNumber;
}

export interface TransitContext {
  methodology: 'pythagorean_name_transits';
  current_age: number;
  current_year: number;
  current: TransitYearProfile;
  next_years: TransitYearProfile[];
}

export interface LoShuArrow {
  id: string;
  numbers: [LoShuDigit, LoShuDigit, LoShuDigit];
  kind: 'present' | 'missing';
  label: string;
  meaning: string;
}

export interface LoShuContext {
  methodology: 'lo_shu';
  grid: Record<LoShuDigit, number>;
  driver_number: NumerologyNumber;
  conductor_number: NumerologyNumber;
  present_arrows: LoShuArrow[];
  missing_arrows: LoShuArrow[];
  dominant_digits: Array<{ digit: LoShuDigit; count: number }>;
  absent_digits: LoShuDigit[];
}

export interface ChaldeanNameNumber {
  label: string;
  raw_total: number;
  reduced: NumerologyNumber;
}

export interface NameVariantComparison {
  birth_name: string;
  current_name: string;
  differs: boolean;
  pythagorean_birth: ChaldeanNameNumber;
  pythagorean_current: ChaldeanNameNumber;
  chaldean_birth: ChaldeanNameNumber;
  chaldean_current: ChaldeanNameNumber;
  dominant_shift: string;
}

export interface ExtendedNumerologyContext {
  transits: TransitContext;
  lo_shu: LoShuContext;
  name_variants: NameVariantComparison;
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
  extended: ExtendedNumerologyContext;
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
