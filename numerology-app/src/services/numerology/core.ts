/**
 * Core Numerology Calculations
 * Life Path, Birthday, Destiny (Expression), Soul Urge, Personality, and Maturity numbers
 *
 * @module core
 */

import { NumerologyNumber, NumerologyProfile } from '@/types';
import { logger } from '@utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentTimestamp } from '@utils/date';
import { dbQuery } from '@services/database';

// Calculation version for tracking
export const CALCULATION_VERSION = '1.0.0';

// Master numbers that should never be reduced
export const MASTER_NUMBERS: readonly number[] = [11, 22, 33];

// Vowels for Soul Urge calculation
const VOWELS = 'aeiou';

// Letter to number mapping (Pythagorean system)
export const LETTER_VALUES: Record<string, number> = {
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

/**
 * Result interface for core numerology calculations
 */
export interface CoreNumerologyResult {
  life_path: NumerologyNumber;
  destiny_number: NumerologyNumber;
  soul_urge: NumerologyNumber;
  personality_number: NumerologyNumber;
  birthday_number: NumerologyNumber;
  maturity_number: NumerologyNumber;
  calculation_version: string;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if a number is a valid master number (11, 22, or 33)
 */
export function isMasterNumber(num: number): boolean {
  return MASTER_NUMBERS.includes(num);
}

/**
 * Check if a number is a valid numerology number (1-9 or master number)
 */
export function isValidNumerologyNumber(num: number): boolean {
  if (!Number.isInteger(num)) return false;
  return (num >= 1 && num <= 9) || isMasterNumber(num);
}

/**
 * Sum all digits of a number
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
 * Reduce a number to a single digit (1-9) or master number (11, 22, 33)
 */
export function reduceToSingleDigit(num: number): NumerologyNumber {
  if (num < 0) num = Math.abs(num);
  if (num === 0) return 0 as NumerologyNumber;

  while (num > 9) {
    if (isMasterNumber(num)) {
      return num as NumerologyNumber;
    }
    num = sumDigits(num);
    if (isMasterNumber(num)) {
      return num as NumerologyNumber;
    }
  }
  return num as NumerologyNumber;
}

/**
 * Normalize a name for numerology calculations
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Parse a date string and return components
 */
export function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  const match = dateStr.match(dateRegex);
  if (!match) {
    throw new Error(`Failed to parse date: ${dateStr}`);
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be 1-12`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Must be 1-31`);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    throw new Error(`Invalid day: ${day}. ${year}-${month} has only ${daysInMonth} days`);
  }

  return { year, month, day };
}

/**
 * Validate a name string
 */
export function validateName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Name must be a non-empty string');
  }
  const normalized = normalizeName(name);
  if (normalized.length === 0) {
    throw new Error('Name must contain at least one letter');
  }
  return normalized;
}

/**
 * Validate a date of birth string
 */
export function validateDateOfBirth(dob: string): { year: number; month: number; day: number } {
  const parsed = parseDate(dob);
  const date = new Date(parsed.year, parsed.month - 1, parsed.day);
  const now = new Date();

  if (date > now) {
    throw new Error('Date of birth cannot be in the future');
  }

  const age = now.getFullYear() - parsed.year;
  if (age > 150) {
    throw new Error('Invalid date of birth: year is too far in the past');
  }

  return parsed;
}

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Calculate the Life Path Number
 *
 * Formula: Sum of birth date (day + month + year), reduced to single digit or master number
 * Each component is reduced separately before summing.
 */
export function calculateLifePath(dateOfBirth: string): NumerologyNumber {
  const { year, month, day } = validateDateOfBirth(dateOfBirth);

  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(sumDigits(year));

  const total = reducedDay + reducedMonth + reducedYear;
  const lifePath = reduceToSingleDigit(total);

  logger.debug('Life Path calculation:', { dateOfBirth, reducedDay, reducedMonth, reducedYear, total, lifePath });

  return lifePath;
}

/**
 * Calculate the Birthday Number
 *
 * Formula: Day of birth, reduced if needed
 * Days 11 and 22 are master numbers and preserved
 */
export function calculateBirthdayNumber(dateOfBirth: string): NumerologyNumber {
  const { day } = validateDateOfBirth(dateOfBirth);

  if (isMasterNumber(day)) {
    return day as NumerologyNumber;
  }

  if (day >= 1 && day <= 9) {
    return day as NumerologyNumber;
  }

  return reduceToSingleDigit(day);
}

/**
 * Get letter value from the Pythagorean numerology system
 */
function getLetterValue(letter: string): number {
  return LETTER_VALUES[letter.toLowerCase()] || 0;
}

/**
 * Check if 'Y' should be treated as a vowel
 *
 * Rules:
 * - Y at the end of name is usually a vowel
 * - Y between consonants is usually a vowel
 */
function isYVowel(name: string, index: number): boolean {
  const letters = name.toLowerCase();
  const prevChar = index > 0 ? letters[index - 1] : '';
  const nextChar = index < letters.length - 1 ? letters[index + 1] : '';

  if (index === letters.length - 1) {
    return true;
  }

  const prevIsConsonant = prevChar && !VOWELS.includes(prevChar);
  const nextIsConsonant = nextChar && !VOWELS.includes(nextChar);

  if (prevIsConsonant && nextIsConsonant) {
    return true;
  }

  if (index === 0 && 'aeiou'.includes(nextChar)) {
    return false;
  }

  if (!nextChar || nextIsConsonant) {
    return true;
  }

  return false;
}

/**
 * Calculate the Destiny (Expression) Number
 *
 * Formula: Sum of all letter values in full name
 */
export function calculateDestinyNumber(fullName: string): NumerologyNumber {
  const normalizedName = validateName(fullName);
  let sum = 0;

  for (const letter of normalizedName) {
    sum += getLetterValue(letter);
  }

  const destinyNumber = reduceToSingleDigit(sum);

  logger.debug('Destiny Number calculation:', { fullName, normalizedName, sum, destinyNumber });

  return destinyNumber;
}

/**
 * Calculate the Soul Urge Number
 *
 * Formula: Sum of vowels in full name
 * Y is sometimes a vowel (see isYVowel for rules)
 */
export function calculateSoulUrge(fullName: string): NumerologyNumber {
  const normalizedName = validateName(fullName);
  let sum = 0;

  for (let i = 0; i < normalizedName.length; i++) {
    const letter = normalizedName[i];

    if (VOWELS.includes(letter)) {
      sum += getLetterValue(letter);
    } else if (letter === 'y' && isYVowel(normalizedName, i)) {
      sum += getLetterValue(letter);
    }
  }

  const soulUrge = reduceToSingleDigit(sum);

  logger.debug('Soul Urge calculation:', { fullName, normalizedName, sum, soulUrge });

  return soulUrge;
}

/**
 * Calculate the Personality Number
 *
 * Formula: Sum of consonants in full name
 */
export function calculatePersonalityNumber(fullName: string): NumerologyNumber {
  const normalizedName = validateName(fullName);
  let sum = 0;

  for (let i = 0; i < normalizedName.length; i++) {
    const letter = normalizedName[i];
    const isVowel = VOWELS.includes(letter);
    const isYAsVowel = letter === 'y' && isYVowel(normalizedName, i);

    if (!isVowel && !isYAsVowel) {
      sum += getLetterValue(letter);
    }
  }

  const personalityNumber = reduceToSingleDigit(sum);

  logger.debug('Personality Number calculation:', { fullName, normalizedName, sum, personalityNumber });

  return personalityNumber;
}

/**
 * Calculate the Maturity Number
 *
 * Formula: Life Path + Destiny, reduced
 */
export function calculateMaturityNumber(
  lifePath: NumerologyNumber,
  destinyNumber: NumerologyNumber
): NumerologyNumber {
  const sum = lifePath + destinyNumber;
  const maturityNumber = reduceToSingleDigit(sum);

  logger.debug('Maturity Number calculation:', { lifePath, destinyNumber, sum, maturityNumber });

  return maturityNumber;
}

/**
 * Calculate all core numerology numbers from name and date of birth
 */
export function calculateCoreNumbers(
  fullName: string,
  dateOfBirth: string
): CoreNumerologyResult {
  logger.info('Calculating core numerology:', { fullName, dateOfBirth });

  const life_path = calculateLifePath(dateOfBirth);
  const birthday_number = calculateBirthdayNumber(dateOfBirth);
  const destiny_number = calculateDestinyNumber(fullName);
  const soul_urge = calculateSoulUrge(fullName);
  const personality_number = calculatePersonalityNumber(fullName);
  const maturity_number = calculateMaturityNumber(life_path, destiny_number);

  const result: CoreNumerologyResult = {
    life_path,
    destiny_number,
    soul_urge,
    personality_number,
    birthday_number,
    maturity_number,
    calculation_version: CALCULATION_VERSION,
  };

  logger.info('Core numerology result:', { ...result });

  return result;
}

// ==================== DATABASE FUNCTIONS ====================

/**
 * Save or update NumerologyProfile in the database
 */
export function saveNumerologyProfile(
  userId: string,
  fullName: string,
  dateOfBirth: string
): NumerologyProfile {
  logger.debug('Saving numerology profile', { userId, fullName, dateOfBirth });

  const coreNumbers = calculateCoreNumbers(fullName, dateOfBirth);
  const now = getCurrentTimestamp();

  // Check if profile already exists
  let existingProfile: NumerologyProfile | null = null;
  try {
    existingProfile = dbQuery.get<NumerologyProfile>(
      'SELECT * FROM numerology_profiles WHERE user_id = ?',
      [userId]
    ) ?? null;
  } catch (error) {
    logger.warn('Database query failed, will create new profile');
  }

  if (existingProfile) {
    // Update existing profile
    dbQuery.run(
      `UPDATE numerology_profiles
       SET life_path = ?, destiny_number = ?, soul_urge = ?,
           personality_number = ?, birthday_number = ?, maturity_number = ?,
           calculated_at = ?, calculation_version = ?
       WHERE user_id = ?`,
      [
        coreNumbers.life_path,
        coreNumbers.destiny_number,
        coreNumbers.soul_urge,
        coreNumbers.personality_number,
        coreNumbers.birthday_number,
        coreNumbers.maturity_number,
        now,
        CALCULATION_VERSION,
        userId,
      ]
    );

    logger.info('Numerology profile updated', { userId });

    return {
      ...existingProfile,
      life_path: coreNumbers.life_path,
      destiny_number: coreNumbers.destiny_number,
      soul_urge: coreNumbers.soul_urge,
      personality_number: coreNumbers.personality_number,
      birthday_number: coreNumbers.birthday_number,
      maturity_number: coreNumbers.maturity_number,
      calculated_at: now,
      calculation_version: CALCULATION_VERSION,
    };
  } else {
    // Create new profile
    const profile: NumerologyProfile = {
      id: uuidv4(),
      user_id: userId,
      life_path: coreNumbers.life_path,
      destiny_number: coreNumbers.destiny_number,
      soul_urge: coreNumbers.soul_urge,
      personality_number: coreNumbers.personality_number,
      birthday_number: coreNumbers.birthday_number,
      maturity_number: coreNumbers.maturity_number,
      calculated_at: now,
      calculation_version: CALCULATION_VERSION,
    };

    dbQuery.run(
      `INSERT INTO numerology_profiles (
        id, user_id, life_path, destiny_number, soul_urge, personality_number,
        birthday_number, maturity_number, calculated_at, calculation_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.user_id,
        profile.life_path,
        profile.destiny_number,
        profile.soul_urge,
        profile.personality_number,
        profile.birthday_number,
        profile.maturity_number,
        profile.calculated_at,
        profile.calculation_version,
      ]
    );

    logger.info('Numerology profile created', { userId });

    return profile;
  }
}

/**
 * Get stored NumerologyProfile from database
 */
export function getNumerologyProfile(userId: string): NumerologyProfile | null {
  try {
    const profile = dbQuery.get<NumerologyProfile>(
      'SELECT * FROM numerology_profiles WHERE user_id = ?',
      [userId]
    );
    return profile ?? null;
  } catch (error) {
    logger.error('Failed to get numerology profile', error);
    return null;
  }
}

/**
 * Delete NumerologyProfile from database
 */
export function deleteNumerologyProfile(userId: string): void {
  try {
    dbQuery.run('DELETE FROM numerology_profiles WHERE user_id = ?', [userId]);
    logger.info('Numerology profile deleted', { userId });
  } catch (error) {
    logger.error('Failed to delete numerology profile', error);
    throw error;
  }
}
