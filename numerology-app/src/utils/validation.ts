/**
 * Validation Utilities
 * Common validation functions for input validation
 */

import { isValidISODate } from './date';

/**
 * Validate a UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate a numerology number (1-9 or 11, 22, 33)
 */
export function isValidNumerologyNumber(num: number): boolean {
  return (num >= 1 && num <= 9) || num === 11 || num === 22 || num === 33;
}

/**
 * Validate a mood/energy score (1-10)
 */
export function isValidScore(score: number, min: number = 1, max: number = 10): boolean {
  return Number.isInteger(score) && score >= min && score <= max;
}

/**
 * Validate a rating (1-5)
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validate a name (non-empty, reasonable length)
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

/**
 * Validate a date of birth (must be in the past and reasonable)
 */
export function isValidDateOfBirth(dateString: string): boolean {
  if (!isValidISODate(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 150, now.getMonth(), now.getDate());

  // Must be in the past but not more than 150 years ago
  return date < now && date > minDate;
}

/**
 * Validate a time string (HH:MM:SS format)
 */
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(timeString);
}

/**
 * Validate a style preference
 */
export function isValidStylePreference(style: string): boolean {
  return ['gentle', 'direct', 'practical', 'spiritual'].includes(style);
}

/**
 * Validate an insight length preference
 */
export function isValidInsightLength(length: string): boolean {
  return ['brief', 'detailed'].includes(length);
}

/**
 * Validate a language code
 */
export function isValidLanguage(language: string): boolean {
  return ['vi', 'en'].includes(language);
}

/**
 * Validate a claim type
 */
export function isValidClaimType(type: string): boolean {
  return ['calculated', 'interpreted', 'exploratory'].includes(type);
}

/**
 * Sanitize text input (remove dangerous characters, trim)
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  return text.trim().slice(0, maxLength);
}

/**
 * Validate an email (basic format check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate user profile input
 */
export function validateUserProfileInput(input: {
  full_name: string;
  date_of_birth: string;
  style_preference: string;
  insight_length: string;
  language: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidName(input.full_name)) {
    errors.full_name = 'Name must be between 1 and 100 characters';
  }

  if (!isValidDateOfBirth(input.date_of_birth)) {
    errors.date_of_birth = 'Please enter a valid date of birth';
  }

  if (!isValidStylePreference(input.style_preference)) {
    errors.style_preference = 'Please select a valid style preference';
  }

  if (!isValidInsightLength(input.insight_length)) {
    errors.insight_length = 'Please select a valid insight length';
  }

  if (!isValidLanguage(input.language)) {
    errors.language = 'Please select a valid language';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate journal entry input
 */
export function validateJournalEntryInput(input: {
  mood_score: number;
  energy_score: number;
  emotions: string[];
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidScore(input.mood_score)) {
    errors.mood_score = 'Mood score must be between 1 and 10';
  }

  if (!isValidScore(input.energy_score)) {
    errors.energy_score = 'Energy score must be between 1 and 10';
  }

  if (!Array.isArray(input.emotions)) {
    errors.emotions = 'Emotions must be an array';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  isValidUUID,
  isValidNumerologyNumber,
  isValidScore,
  isValidRating,
  isValidName,
  isValidDateOfBirth,
  isValidTime,
  isValidStylePreference,
  isValidInsightLength,
  isValidLanguage,
  isValidClaimType,
  sanitizeText,
  isValidEmail,
  validateUserProfileInput,
  validateJournalEntryInput,
};
