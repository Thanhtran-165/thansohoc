import {
  TransitContext,
  TransitLetterWindow,
  TransitYearProfile,
  NumerologyNumber,
} from '@/types';
import { normalizeName, parseDate, reduceToSingleDigit } from './core';

type NameChannel = {
  key: 'leading_name' | 'middle_name' | 'ending_name';
  label: string;
  value: string;
};

function getAgeAtYear(dateOfBirth: string, year: number): number {
  const birth = parseDate(dateOfBirth);
  return Math.max(year - birth.year, 0);
}

function splitNameChannels(fullName: string): NameChannel[] {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return [];
  }

  if (parts.length === 1) {
    return [
      { key: 'leading_name', label: 'Nhịp đầu tên', value: parts[0] },
    ];
  }

  const leading = parts[0];
  const ending = parts[parts.length - 1];
  const middle = parts.slice(1, -1).join('');

  return [
    { key: 'leading_name', label: 'Nhịp đầu tên', value: leading },
    ...(middle ? [{ key: 'middle_name' as const, label: 'Nhịp giữa tên', value: middle }] : []),
    { key: 'ending_name', label: 'Nhịp cuối tên', value: ending },
  ];
}

function getLetterValues(namePart: string): Array<{ letter: string; value: NumerologyNumber }> {
  return [...normalizeName(namePart)]
    .map((letter) => {
      const code = letter.charCodeAt(0) - 96;
      const raw = ((code - 1) % 9) + 1;
      return {
        letter,
        value: reduceToSingleDigit(raw),
      };
    })
    .filter((item) => item.value >= 1);
}

function findActiveTransitLetter(
  channel: NameChannel,
  age: number
): TransitLetterWindow | null {
  const letters = getLetterValues(channel.value);
  if (letters.length === 0) {
    return null;
  }

  const cycleLength = letters.reduce((sum, item) => sum + item.value, 0);
  const cycleIndex = cycleLength > 0 ? age % cycleLength : 0;
  const cycleStartAge = age - cycleIndex;

  let cursor = 0;
  for (const item of letters) {
    const start = cursor;
    const end = cursor + item.value - 1;
    if (cycleIndex >= start && cycleIndex <= end) {
      return {
        source: channel.key,
        label: channel.label,
        letter: item.letter.toUpperCase(),
        value: item.value,
        from_age: cycleStartAge + start,
        to_age: cycleStartAge + end,
      };
    }
    cursor += item.value;
  }

  const fallback = letters[letters.length - 1];
  return {
    source: channel.key,
    label: channel.label,
    letter: fallback.letter.toUpperCase(),
    value: fallback.value,
    from_age: age,
    to_age: age + fallback.value - 1,
  };
}

function buildTransitYearProfile(
  fullName: string,
  dateOfBirth: string,
  year: number
): TransitYearProfile {
  const age = getAgeAtYear(dateOfBirth, year);
  const letters = splitNameChannels(fullName)
    .map((channel) => findActiveTransitLetter(channel, age))
    .filter((item): item is TransitLetterWindow => item !== null);
  const essence_compound = letters.reduce((sum, item) => sum + item.value, 0);
  const essence_number = reduceToSingleDigit(essence_compound);

  return {
    year,
    age,
    letters,
    essence_compound,
    essence_number,
  };
}

export function calculateTransitContext(
  fullName: string,
  dateOfBirth: string,
  targetDate: Date | string
): TransitContext {
  const year = typeof targetDate === 'string'
    ? parseDate(targetDate).year
    : targetDate.getFullYear();
  const current = buildTransitYearProfile(fullName, dateOfBirth, year);
  const next_years = Array.from({ length: 4 }, (_, index) =>
    buildTransitYearProfile(fullName, dateOfBirth, year + index + 1)
  );

  return {
    methodology: 'pythagorean_name_transits',
    current_age: current.age,
    current_year: year,
    current,
    next_years,
  };
}
