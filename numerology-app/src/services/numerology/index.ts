/**
 * Numerology Service
 * Main entry point for all numerology calculations
 *
 * @module numerology
 */

import {
  AdvancedNumerologyContext,
  ChallengeNumber,
  CyclicNumbers,
  ExtendedNumerologyContext,
  KarmicDebtNumber,
  LifeCyclePeriod,
  NumerologyContext,
  NumerologyNumber,
  NumerologyProfile,
} from '@/types';
import {
  reduceToSingleDigit,
  sumDigits,
  isMasterNumber,
  isValidNumerologyNumber,
  normalizeName,
  validateName,
  validateDateOfBirth,
  parseDate,
  calculateLifePath,
  calculateBirthdayNumber,
  calculateDestinyNumber,
  calculateSoulUrge,
  calculatePersonalityNumber,
  calculateMaturityNumber,
  calculateCoreNumbers,
  saveNumerologyProfile,
  getNumerologyProfile,
  deleteNumerologyProfile,
  CoreNumerologyResult,
  MASTER_NUMBERS,
  LETTER_VALUES,
  CALCULATION_VERSION,
} from './core';
import {
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateCyclicNumbers,
} from './cyclic';
import {
  calculateAdvancedNumerologyContext,
  calculateBalanceNumber,
  calculateChallenges,
  calculateHiddenPassionNumbers,
  calculateKarmicDebtNumbers,
  calculateKarmicLessons,
  calculatePinnacles,
} from './advanced';
import { calculateTransitContext } from './transits';
import { calculateLoShuContext } from './loshu';
import {
  calculateChaldeanNameNumber,
  calculateNameVariantComparison,
  calculatePythagoreanNameNumber,
} from './chaldean';

/**
 * Get full numerology profile with core numbers and today's cyclic numbers
 */
export function getFullNumerologyProfile(
  fullName: string,
  dateOfBirth: string,
  currentName?: string | null
): CoreNumerologyResult & CyclicNumbers & { advanced: AdvancedNumerologyContext; extended: ExtendedNumerologyContext } {
  const coreNumbers = calculateCoreNumbers(fullName, dateOfBirth);
  const cyclicNumbers = calculateCyclicNumbers(dateOfBirth, new Date());
  const advanced = calculateAdvancedNumerologyContext(fullName, dateOfBirth, new Date());
  const extended = {
    transits: calculateTransitContext(currentName?.trim() || fullName, dateOfBirth, new Date()),
    lo_shu: calculateLoShuContext(dateOfBirth),
    name_variants: calculateNameVariantComparison(fullName, currentName),
  };

  return {
    ...coreNumbers,
    personal_year: cyclicNumbers.personal_year,
    personal_month: cyclicNumbers.personal_month,
    personal_day: cyclicNumbers.personal_day,
    advanced,
    extended,
  };
}

/**
 * Calculate numerology context for a specific date
 */
export function calculateNumerologyContext(
  fullName: string,
  dateOfBirth: string,
  targetDate: Date | string,
  currentName?: string | null
): NumerologyContext {
  const coreNumbers = calculateCoreNumbers(fullName, dateOfBirth);
  const cyclicNumbers = calculateCyclicNumbers(dateOfBirth, targetDate);

  return {
    core: {
      life_path: coreNumbers.life_path,
      destiny_number: coreNumbers.destiny_number,
      soul_urge: coreNumbers.soul_urge,
      personality_number: coreNumbers.personality_number,
      birthday_number: coreNumbers.birthday_number,
      maturity_number: coreNumbers.maturity_number,
    },
    personal_year: cyclicNumbers.personal_year,
    personal_month: cyclicNumbers.personal_month,
    personal_day: cyclicNumbers.personal_day,
    advanced: calculateAdvancedNumerologyContext(fullName, dateOfBirth, targetDate),
    extended: {
      transits: calculateTransitContext(currentName?.trim() || fullName, dateOfBirth, targetDate),
      lo_shu: calculateLoShuContext(dateOfBirth),
      name_variants: calculateNameVariantComparison(fullName, currentName),
    },
  };
}

// Re-export utilities
export {
  reduceToSingleDigit,
  sumDigits,
  isMasterNumber,
  isValidNumerologyNumber,
  normalizeName,
  validateName,
  validateDateOfBirth,
  parseDate,
  MASTER_NUMBERS,
  LETTER_VALUES,
  CALCULATION_VERSION,
};

// Re-export core calculations
export {
  calculateLifePath,
  calculateBirthdayNumber,
  calculateDestinyNumber,
  calculateSoulUrge,
  calculatePersonalityNumber,
  calculateMaturityNumber,
  calculateCoreNumbers,
  saveNumerologyProfile,
  getNumerologyProfile,
  deleteNumerologyProfile,
};

// Re-export types (using export type for isolatedModules compatibility)
export type { CoreNumerologyResult } from './core';

// Re-export cyclic calculations
export {
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateCyclicNumbers,
  calculateBalanceNumber,
  calculateKarmicLessons,
  calculateHiddenPassionNumbers,
  calculateKarmicDebtNumbers,
  calculatePinnacles,
  calculateChallenges,
  calculateAdvancedNumerologyContext,
  calculateTransitContext,
  calculateLoShuContext,
  calculateChaldeanNameNumber,
  calculatePythagoreanNameNumber,
  calculateNameVariantComparison,
};

// Re-export types
export type {
  AdvancedNumerologyContext,
  ChallengeNumber,
  CyclicNumbers,
  ExtendedNumerologyContext,
  KarmicDebtNumber,
  LifeCyclePeriod,
  NumerologyContext,
  NumerologyNumber,
  NumerologyProfile,
};
