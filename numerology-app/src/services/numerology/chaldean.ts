import {
  ChaldeanNameNumber,
  NameVariantComparison,
} from '@/types';
import { normalizeName, reduceToSingleDigit } from './core';

const CHALDEAN_VALUES: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};

function getChaldeanLetterValue(letter: string): number {
  return CHALDEAN_VALUES[letter] ?? 0;
}

function sumNameByMapping(fullName: string, mapper: (letter: string) => number): number {
  const normalized = normalizeName(fullName);
  return [...normalized].reduce((sum, letter) => sum + mapper(letter), 0);
}

export function calculateChaldeanNameNumber(
  fullName: string,
  label = 'Tên khai sinh'
): ChaldeanNameNumber {
  const raw_total = sumNameByMapping(fullName, getChaldeanLetterValue);
  const reduced = reduceToSingleDigit(raw_total);

  return {
    label,
    raw_total,
    reduced,
  };
}

export function calculatePythagoreanNameNumber(
  fullName: string,
  label = 'Tên khai sinh'
): ChaldeanNameNumber {
  const raw_total = sumNameByMapping(fullName, (letter) => {
    const normalized = normalizeName(letter);
    if (!normalized[0]) return 0;
    const code = normalized.charCodeAt(0) - 96;
    return ((code - 1) % 9) + 1;
  });
  const reduced = reduceToSingleDigit(raw_total);

  return {
    label,
    raw_total,
    reduced,
  };
}

function inferShiftMessage(
  birthPythagorean: ChaldeanNameNumber,
  currentPythagorean: ChaldeanNameNumber,
  birthChaldean: ChaldeanNameNumber,
  currentChaldean: ChaldeanNameNumber
): string {
  if (
    birthPythagorean.reduced === currentPythagorean.reduced &&
    birthChaldean.reduced === currentChaldean.reduced
  ) {
    return 'Tên đang dùng vẫn giữ gần như nguyên nhịp cũ; thay đổi chủ yếu nằm ở sắc thái biểu đạt hằng ngày.';
  }

  if (currentPythagorean.reduced > birthPythagorean.reduced) {
    return 'Tên đang dùng đẩy nhịp biểu đạt ra ngoài nhiều hơn, dễ làm nổi bật chất muốn bước ra và lên tiếng.';
  }

  if (currentPythagorean.reduced < birthPythagorean.reduced) {
    return 'Tên đang dùng kéo năng lượng về phía tiết chế hơn, hợp khi bạn muốn giữ nhịp chắc và gọn hơn.';
  }

  if (currentChaldean.reduced !== birthChaldean.reduced) {
    return 'Theo lớp đọc Chaldean, tên đang dùng tạo một sắc thái khác với tên khai sinh; khác biệt này đáng theo dõi khi bạn đổi vai trò hoặc môi trường sống.';
  }

  return 'Tên đang dùng và tên khai sinh đang hỗ trợ nhau hơn là đối kháng; thay đổi nằm ở cách bạn cảm thấy mình được gọi tên hằng ngày.';
}

export function calculateNameVariantComparison(
  fullName: string,
  currentName?: string | null
): NameVariantComparison {
  const normalizedCurrent = currentName?.trim() ? currentName.trim() : fullName;

  const pythagorean_birth = calculatePythagoreanNameNumber(fullName, 'Tên khai sinh');
  const pythagorean_current = calculatePythagoreanNameNumber(normalizedCurrent, 'Tên đang dùng');
  const chaldean_birth = calculateChaldeanNameNumber(fullName, 'Tên khai sinh');
  const chaldean_current = calculateChaldeanNameNumber(normalizedCurrent, 'Tên đang dùng');

  return {
    birth_name: fullName,
    current_name: normalizedCurrent,
    differs: normalizeName(fullName) !== normalizeName(normalizedCurrent),
    pythagorean_birth,
    pythagorean_current,
    chaldean_birth,
    chaldean_current,
    dominant_shift: inferShiftMessage(
      pythagorean_birth,
      pythagorean_current,
      chaldean_birth,
      chaldean_current
    ),
  };
}

export { CHALDEAN_VALUES };
