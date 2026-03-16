/**
 * Numerology Utilities
 * Core reduction functions, master number handling, and input normalization
 *
 * REDUCTION RULES:
 * - Single digits (1-9) remain as-is
 * - Master numbers (11, 22, 33) are NEVER reduced
 * - All other numbers are reduced by summing digits until reaching 1-9 or a master number
 *
 * MASTER NUMBER HANDLING:
 * - 11, 22, 33 are special "Master Numbers" in numerology
 * - They are preserved during reduction and never broken down further
 * - Example: 29 -> 2+9=11 (stays 11, not reduced to 2)
 */

import { NumerologyNumber } from '@/types';

// Master numbers that should never be reduced
export const MASTER_NUMBERS: readonly NumerologyNumber[] = [11, 22, 33];

/**
 * Check if a number is a valid master number (11, 22, or 33)
 */
export function isMasterNumber(num: number): boolean {
  return MASTER_NUMBERS.includes(num as NumerologyNumber);
}

/**
 * Check if a number is a valid numerology number (1-9 or master number)
 */
export function isValidNumerologyNumber(num: number): boolean {
  if (!Number.isInteger(num)) return false;
  return (num >= 1 && num <= 9) || isMasterNumber(num);
}

/**
 * Reduce a number to a single digit (1-9) or master number (11, 22, 33)
 *
 * This is the core reduction function used in all numerology calculations.
 *
 * @param num - The number to reduce
 * @returns A valid NumerologyNumber (1-9, 11, 22, or 33)
 *
 * @example
 * reduceToSingleDigit(29) // returns 11 (master number preserved)
 * reduceToSingleDigit(38) // returns 2 (3+8=11, but 11 stays as master)
 * reduceToSingleDigit(47) // returns 2 (4+7=11, master number)
 * reduceToSingleDigit(15) // returns 6 (1+5=6)
 */
export function reduceToSingleDigit(num: number): NumerologyNumber {
  // Handle negative numbers
  if (num < 0) {
    num = Math.abs(num);
  }

  // Handle zero - treat as 0, but this shouldn't happen in practice
  if (num === 0) {
    return 0 as NumerologyNumber; // Edge case, shouldn't occur with valid input
  }

  // Keep reducing until we get 1-9 or a master number
  while (num > 9) {
    // Check for master numbers BEFORE reducing
    if (isMasterNumber(num)) {
      return num as NumerologyNumber;
    }

    // Sum the digits
    num = sumDigits(num);

    // Check if the result is a master number after summing
    if (isMasterNumber(num)) {
      return num as NumerologyNumber;
    }
  }

  return num as NumerologyNumber;
}

/**
 * Sum all digits of a number
 *
 * @example
 * sumDigits(123) // returns 6 (1+2+3)
 * sumDigits(29) // returns 11 (2+9)
 * sumDigits(2024) // returns 8 (2+0+2+4)
 */
export function sumDigits(num: number): number {
  let sum = 0;
  num = Math.abs(num);

  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }

  return sum;
}

/**
 * Normalize a name for numerology calculations
 *
 * Rules:
 * - Convert to lowercase
 * - Remove all non-alphabetic characters (spaces, hyphens, apostrophes, etc.)
 * - Handle accented characters by converting to base letters
 *
 * @param name - The name to normalize
 * @returns Normalized name containing only lowercase letters
 *
 * @example
 * normalizeName("John O'Brien-Smith") // returns "johnobriensmith"
 * normalizeName("María García") // returns "mariagarcia"
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z]/g, ''); // Remove non-alphabetic characters
}

/**
 * Normalize a date string to ISO format (YYYY-MM-DD)
 *
 * @param dateStr - Date string in any format
 * @returns ISO formatted date string or null if invalid
 */
export function normalizeDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Extract date components from an ISO date string
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Object with year, month, day or null if invalid
 */
export function extractDateComponents(dateStr: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

