/**
 * Advanced Numerology Calculations
 * Pinnacles, challenges, karmic lessons/debt, hidden passion, and balance number
 *
 * The implementation follows a consistent Pythagorean-style ruleset so the
 * app can explain how a daily report was derived, instead of relying only on
 * a small set of basic numbers.
 */

import {
  AdvancedNumerologyContext,
  ChallengeNumber,
  KarmicDebtNumber,
  LifeCyclePeriod,
  NumerologyMethodology,
  NumerologyNumber,
} from '@/types';
import {
  LETTER_VALUES,
  calculateLifePath,
  normalizeName,
  parseDate,
  reduceToSingleDigit,
  sumDigits,
  validateDateOfBirth,
  validateName,
} from './core';

const KARMIC_DEBT_NUMBERS: readonly KarmicDebtNumber[] = [13, 14, 16, 19];

const METHODOLOGY: NumerologyMethodology = {
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
};

function getLetterValuesForName(fullName: string): number[] {
  const normalized = validateName(fullName);
  return [...normalized]
    .map((letter) => LETTER_VALUES[letter] ?? 0)
    .filter((value) => value > 0);
}

function getBirthReduction(dateOfBirth: string) {
  const { year, month, day } = validateDateOfBirth(dateOfBirth);

  return {
    year,
    month,
    day,
    reducedMonth: reduceToSingleDigit(month),
    reducedDay: reduceToSingleDigit(day),
    reducedYear: reduceToSingleDigit(sumDigits(year)),
  };
}

function getAgeAtDate(dateOfBirth: string, targetDate: Date | string): number {
  const birth = validateDateOfBirth(dateOfBirth);
  const target = typeof targetDate === 'string'
    ? parseDate(targetDate)
    : {
        year: targetDate.getFullYear(),
        month: targetDate.getMonth() + 1,
        day: targetDate.getDate(),
      };

  let age = target.year - birth.year;
  const beforeBirthday =
    target.month < birth.month ||
    (target.month === birth.month && target.day < birth.day);

  if (beforeBirthday) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function createLifeCyclePeriod<TNumber extends number>(
  cycle: 1 | 2 | 3 | 4,
  number: TNumber,
  fromAge: number,
  toAge: number | null
): LifeCyclePeriod<TNumber> {
  return {
    cycle,
    number,
    from_age: fromAge,
    to_age: toAge,
  };
}

function findCurrentCycle<TNumber extends number>(
  cycles: LifeCyclePeriod<TNumber>[],
  age: number
): LifeCyclePeriod<TNumber> {
  return cycles.find((cycle) => cycle.to_age === null || age <= cycle.to_age) ?? cycles[cycles.length - 1];
}

function collectKarmicDebtCandidates(fullName: string, dateOfBirth: string): number[] {
  const { day, reducedDay, reducedMonth, reducedYear } = getBirthReduction(dateOfBirth);
  const rawNameValues = getLetterValuesForName(fullName);

  const normalized = validateName(fullName);
  const rawSoulUrge = [...normalized].reduce((sum, letter, index) => {
    const isVowel = 'aeiou'.includes(letter);
    const prev = index > 0 ? normalized[index - 1] : '';
    const next = index < normalized.length - 1 ? normalized[index + 1] : '';
    const isYAsVowel = letter === 'y' &&
      (index === normalized.length - 1 || (!'aeiou'.includes(prev) && !'aeiou'.includes(next)));

    return isVowel || isYAsVowel ? sum + (LETTER_VALUES[letter] ?? 0) : sum;
  }, 0);

  const rawPersonality = [...normalized].reduce((sum, letter, index) => {
    const isVowel = 'aeiou'.includes(letter);
    const prev = index > 0 ? normalized[index - 1] : '';
    const next = index < normalized.length - 1 ? normalized[index + 1] : '';
    const isYAsVowel = letter === 'y' &&
      (index === normalized.length - 1 || (!'aeiou'.includes(prev) && !'aeiou'.includes(next)));

    return !isVowel && !isYAsVowel ? sum + (LETTER_VALUES[letter] ?? 0) : sum;
  }, 0);

  const rawDestiny = rawNameValues.reduce((sum, value) => sum + value, 0);
  const rawLifePath = reducedDay + reducedMonth + reducedYear;
  const rawMaturity = calculateLifePath(dateOfBirth) + reduceToSingleDigit(rawDestiny);

  return [day, rawLifePath, rawDestiny, rawSoulUrge, rawPersonality, rawMaturity];
}

export function calculateBalanceNumber(fullName: string): NumerologyNumber {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const total = words.reduce((sum, word) => {
    const normalized = normalizeName(word);
    if (!normalized[0]) {
      return sum;
    }
    return sum + (LETTER_VALUES[normalized[0]] ?? 0);
  }, 0);

  return reduceToSingleDigit(total);
}

export function calculateKarmicLessons(fullName: string): NumerologyNumber[] {
  const presentValues = new Set(getLetterValuesForName(fullName));
  const missing: NumerologyNumber[] = [];

  for (let value = 1; value <= 9; value += 1) {
    if (!presentValues.has(value)) {
      missing.push(value as NumerologyNumber);
    }
  }

  return missing;
}

export function calculateHiddenPassionNumbers(fullName: string): NumerologyNumber[] {
  const counts = new Map<number, number>();

  for (const value of getLetterValuesForName(fullName)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const maxFrequency = Math.max(...counts.values(), 0);
  if (maxFrequency === 0) {
    return [];
  }

  return [...counts.entries()]
    .filter(([, count]) => count === maxFrequency)
    .map(([value]) => value as NumerologyNumber)
    .sort((a, b) => a - b);
}

export function calculateKarmicDebtNumbers(
  fullName: string,
  dateOfBirth: string
): KarmicDebtNumber[] {
  const debts = new Set<KarmicDebtNumber>();

  for (const candidate of collectKarmicDebtCandidates(fullName, dateOfBirth)) {
    if (KARMIC_DEBT_NUMBERS.includes(candidate as KarmicDebtNumber)) {
      debts.add(candidate as KarmicDebtNumber);
    }
  }

  return [...debts].sort((a, b) => a - b);
}

export function calculatePinnacles(dateOfBirth: string): LifeCyclePeriod<NumerologyNumber>[] {
  const { reducedMonth, reducedDay, reducedYear } = getBirthReduction(dateOfBirth);
  const lifePath = calculateLifePath(dateOfBirth);

  const first = reduceToSingleDigit(reducedMonth + reducedDay);
  const second = reduceToSingleDigit(reducedDay + reducedYear);
  const third = reduceToSingleDigit(first + second);
  const fourth = reduceToSingleDigit(reducedMonth + reducedYear);

  const firstEndAge = 36 - lifePath;
  const secondEndAge = firstEndAge + 9;
  const thirdEndAge = secondEndAge + 9;

  return [
    createLifeCyclePeriod(1, first, 0, firstEndAge),
    createLifeCyclePeriod(2, second, firstEndAge + 1, secondEndAge),
    createLifeCyclePeriod(3, third, secondEndAge + 1, thirdEndAge),
    createLifeCyclePeriod(4, fourth, thirdEndAge + 1, null),
  ];
}

export function calculateChallenges(dateOfBirth: string): LifeCyclePeriod<ChallengeNumber>[] {
  const { reducedMonth, reducedDay, reducedYear } = getBirthReduction(dateOfBirth);
  const lifePath = calculateLifePath(dateOfBirth);

  const first = reduceToSingleDigit(Math.abs(reducedMonth - reducedDay)) as ChallengeNumber;
  const second = reduceToSingleDigit(Math.abs(reducedDay - reducedYear)) as ChallengeNumber;
  const third = reduceToSingleDigit(Math.abs(first - second)) as ChallengeNumber;
  const fourth = reduceToSingleDigit(Math.abs(reducedMonth - reducedYear)) as ChallengeNumber;

  const firstEndAge = 36 - lifePath;
  const secondEndAge = firstEndAge + 9;
  const thirdEndAge = secondEndAge + 9;

  return [
    createLifeCyclePeriod(1, first, 0, firstEndAge),
    createLifeCyclePeriod(2, second, firstEndAge + 1, secondEndAge),
    createLifeCyclePeriod(3, third, secondEndAge + 1, thirdEndAge),
    createLifeCyclePeriod(4, fourth, thirdEndAge + 1, null),
  ];
}

export function calculateAdvancedNumerologyContext(
  fullName: string,
  dateOfBirth: string,
  targetDate: Date | string
): AdvancedNumerologyContext {
  const age = getAgeAtDate(dateOfBirth, targetDate);
  const pinnacles = calculatePinnacles(dateOfBirth);
  const challenges = calculateChallenges(dateOfBirth);

  return {
    methodology: METHODOLOGY,
    balance_number: calculateBalanceNumber(fullName),
    hidden_passion_numbers: calculateHiddenPassionNumbers(fullName),
    karmic_lessons: calculateKarmicLessons(fullName),
    karmic_debt_numbers: calculateKarmicDebtNumbers(fullName, dateOfBirth),
    pinnacles,
    challenges,
    current_pinnacle: findCurrentCycle(pinnacles, age),
    current_challenge: findCurrentCycle(challenges, age),
  };
}

export default {
  calculateBalanceNumber,
  calculateKarmicLessons,
  calculateHiddenPassionNumbers,
  calculateKarmicDebtNumbers,
  calculatePinnacles,
  calculateChallenges,
  calculateAdvancedNumerologyContext,
};
