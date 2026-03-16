/**
 * Numerology Service
 * Main entry point for all numerology calculations
 *
 * @module numerology
 */

import { NumerologyNumber, NumerologyProfile, NumerologyContext, CyclicNumbers } from '@/types';
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

/**
 * Get full numerology profile with core numbers and today's cyclic numbers
 */
export function getFullNumerologyProfile(
  fullName: string,
  dateOfBirth: string
): CoreNumerologyResult & CyclicNumbers {
  const coreNumbers = calculateCoreNumbers(fullName, dateOfBirth);
  const cyclicNumbers = calculateCyclicNumbers(dateOfBirth, new Date());

  return {
    ...coreNumbers,
    personal_year: cyclicNumbers.personal_year,
    personal_month: cyclicNumbers.personal_month,
    personal_day: cyclicNumbers.personal_day,
  };
}

/**
 * Calculate numerology context for a specific date
 */
export function calculateNumerologyContext(
  fullName: string,
  dateOfBirth: string,
  targetDate: Date | string
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
};

// Re-export types
export type { NumerologyNumber, NumerologyProfile, NumerologyContext, CyclicNumbers };
