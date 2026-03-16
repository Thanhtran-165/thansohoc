/**
 * Cyclic Numerology Calculations
 * Personal Year, Personal Month, and Personal Day
 *
 * @module cyclic
 *
 * CALCULATION RULES (from PRD §5.1.2):
 *
 * Personal Year: Birth Day + Birth Month + Current Year
 * Personal Month: Personal Year + Current Month
 * Personal Day: Personal Month + Current Day
 */

import { NumerologyNumber, CyclicNumbers } from '@/types';
import { logger } from '@utils/logger';
import {
  reduceToSingleDigit,
  sumDigits,
  parseDate,
  validateDateOfBirth,
} from './core';

/**
 * Calculate Personal Year
 *
 * Formula: Birth Day + Birth Month + Current Year (sum of digits)
 */
export function calculatePersonalYear(dateOfBirth: string, targetYear: number): NumerologyNumber {
  const { day, month } = validateDateOfBirth(dateOfBirth);

  if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 9999) {
    throw new Error(`Invalid year: ${targetYear}. Must be between 1900 and 9999`);
  }

  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(sumDigits(targetYear));

  const total = reducedDay + reducedMonth + reducedYear;
  const personalYear = reduceToSingleDigit(total);

  logger.debug('Personal Year calculation:', {
    dateOfBirth,
    targetYear,
    reducedDay,
    reducedMonth,
    reducedYear,
    total,
    result: personalYear,
  });

  return personalYear;
}

/**
 * Calculate Personal Month
 *
 * Formula: Personal Year + Current Month
 */
export function calculatePersonalMonth(
  dateOfBirth: string,
  targetMonth: number,
  targetYear: number
): NumerologyNumber {
  if (!Number.isInteger(targetMonth) || targetMonth < 1 || targetMonth > 12) {
    throw new Error(`Invalid month: ${targetMonth}. Must be between 1 and 12`);
  }

  const personalYear = calculatePersonalYear(dateOfBirth, targetYear);
  const reducedMonth = reduceToSingleDigit(targetMonth);

  const total = personalYear + reducedMonth;
  const personalMonth = reduceToSingleDigit(total);

  logger.debug('Personal Month calculation:', {
    dateOfBirth,
    targetMonth,
    targetYear,
    personalYear,
    reducedMonth,
    total,
    result: personalMonth,
  });

  return personalMonth;
}

/**
 * Calculate Personal Day
 *
 * Formula: Personal Month + Current Day
 */
export function calculatePersonalDay(
  dateOfBirth: string,
  targetDate: Date | string
): NumerologyNumber {
  let date: Date;

  if (typeof targetDate === 'string') {
    const parsed = parseDate(targetDate);
    date = new Date(parsed.year, parsed.month - 1, parsed.day);
  } else {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
      throw new Error('Target date must be a valid Date object or YYYY-MM-DD string');
    }
    date = targetDate;
  }

  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + 1;
  const targetDay = date.getDate();

  const personalMonth = calculatePersonalMonth(dateOfBirth, targetMonth, targetYear);
  const reducedDay = reduceToSingleDigit(targetDay);

  const total = personalMonth + reducedDay;
  const personalDay = reduceToSingleDigit(total);

  logger.debug('Personal Day calculation:', {
    dateOfBirth,
    targetDate: date.toISOString().split('T')[0],
    personalMonth,
    reducedDay,
    total,
    result: personalDay,
  });

  return personalDay;
}

/**
 * Calculate all cyclic numbers for a given date
 */
export function calculateCyclicNumbers(
  dateOfBirth: string,
  targetDate: Date | string = new Date()
): CyclicNumbers {
  let date: Date;

  if (typeof targetDate === 'string') {
    const parsed = parseDate(targetDate);
    date = new Date(parsed.year, parsed.month - 1, parsed.day);
  } else {
    date = targetDate;
  }

  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + 1;

  const personal_year = calculatePersonalYear(dateOfBirth, targetYear);
  const personal_month = calculatePersonalMonth(dateOfBirth, targetMonth, targetYear);
  const personal_day = calculatePersonalDay(dateOfBirth, date);

  logger.debug('Cyclic numbers calculated:', {
    dateOfBirth,
    targetDate: date.toISOString().split('T')[0],
    personal_year,
    personal_month,
    personal_day,
  });

  return {
    personal_year,
    personal_month,
    personal_day,
  };
}
