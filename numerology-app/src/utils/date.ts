/**
 * Date Utilities
 * Helper functions for date manipulation and formatting
 */

import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  differenceInDays,
  addDays,
  isAfter,
  isBefore,
  isToday,
  isSameDay,
} from 'date-fns';

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current timestamp in ISO 8601 format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse an ISO date string to a Date object
 */
export function parseDateISO(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Check if a date string is valid ISO format
 */
export function isValidISODate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a date for display
 */
export function formatDateDisplay(date: Date | string, formatStr: string = 'MMMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format time for display (HH:MM:SS to readable)
 */
export function formatTimeDisplay(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get the start of a day
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get the end of a day
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Calculate difference in days between two dates
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addDays(d, days);
}

/**
 * Check if a date is after another date
 */
export function isDateAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(d1, d2);
}

/**
 * Check if a date is before another date
 */
export function isDateBefore(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(d1, d2);
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Get date components for numerology calculations
 */
export function getDateComponents(date: Date | string): {
  year: number;
  month: number;
  day: number;
} {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // JavaScript months are 0-indexed
    day: d.getDate(),
  };
}

/**
 * Check if current time is within quiet hours
 */
export function isInQuietHours(
  startTime: string | null,
  endTime: string | null
): boolean {
  if (!startTime || !endTime) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight quiet hours (e.g., 22:00 - 06:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Get relative time description
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffDays = getDaysDifference(d, now);

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays === -1) {
    return 'Tomorrow';
  } else if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 0 && diffDays > -7) {
    return `In ${Math.abs(diffDays)} days`;
  } else {
    return formatDateDisplay(d);
  }
}

export default {
  getCurrentDateISO,
  getCurrentTimestamp,
  parseDateISO,
  isValidISODate,
  formatDateISO,
  formatDateDisplay,
  formatTimeDisplay,
  getStartOfDay,
  getEndOfDay,
  getDaysDifference,
  addDaysToDate,
  isDateAfter,
  isDateBefore,
  isDateToday,
  areSameDay,
  getDateComponents,
  isInQuietHours,
  getRelativeTime,
};
