import {
  LoShuArrow,
  LoShuContext,
  LoShuDigit,
} from '@/types';
import { parseDate, reduceToSingleDigit } from './core';

const ARROW_DEFINITIONS: Array<{
  id: string;
  numbers: [LoShuDigit, LoShuDigit, LoShuDigit];
  label: string;
  meaningPresent: string;
  meaningMissing: string;
}> = [
  {
    id: '492',
    numbers: [4, 9, 2],
    label: 'Trục đầu óc',
    meaningPresent: 'Bạn có xu hướng nối trực giác với tư duy và khả năng nhìn bức tranh lớn.',
    meaningMissing: 'Đôi lúc bạn phải tự tạo cho mình một điểm neo về định hướng và cách nhìn toàn cảnh.',
  },
  {
    id: '357',
    numbers: [3, 5, 7],
    label: 'Trục cảm xúc',
    meaningPresent: 'Cảm xúc, trực giác và chiều sâu nội tâm dễ nối với nhau thành một mạch liền.',
    meaningMissing: 'Phần cảm xúc cần được gọi tên kỹ hơn, nếu không dễ bị đứt đoạn hoặc khó hiểu chính mình.',
  },
  {
    id: '816',
    numbers: [8, 1, 6],
    label: 'Trục thực thi',
    meaningPresent: 'Bạn có nền tốt để biến ý định thành việc làm và giữ nhịp cho các trách nhiệm.',
    meaningMissing: 'Bạn cần dựng thêm thói quen hoặc khung hành động để ý tưởng không chỉ dừng ở suy nghĩ.',
  },
  {
    id: '438',
    numbers: [4, 3, 8],
    label: 'Trục nền tảng',
    meaningPresent: 'Khả năng dựng nền và giữ nhịp khá rõ, hợp với việc xây thứ gì đó bền hơn là bốc đồng.',
    meaningMissing: 'Phần dựng nền có thể cần được học qua trải nghiệm thật, thay vì tự nhiên có sẵn.',
  },
  {
    id: '951',
    numbers: [9, 5, 1],
    label: 'Trục ý chí',
    meaningPresent: 'Bên trong có một lõi ý chí đủ rõ để giữ hướng khi môi trường đổi nhịp.',
    meaningMissing: 'Ý chí dễ phân tán nếu không có mục tiêu và lý do đủ rõ ràng.',
  },
  {
    id: '276',
    numbers: [2, 7, 6],
    label: 'Trục gắn kết',
    meaningPresent: 'Bạn dễ quan tâm, kết nối và cảm được trách nhiệm trong các mối quan hệ.',
    meaningMissing: 'Sự gắn kết cần được học qua hành động cụ thể chứ không tự bật lên một cách ổn định.',
  },
  {
    id: '456',
    numbers: [4, 5, 6],
    label: 'Mũi tên quyết tâm',
    meaningPresent: 'Khi đã thấy đúng, bạn có thể bền bỉ theo đuổi đến cùng.',
    meaningMissing: 'Động lực có thể lên xuống thất thường nếu thiếu một lý do đủ thuyết phục.',
  },
  {
    id: '258',
    numbers: [2, 5, 8],
    label: 'Mũi tên cân bằng',
    meaningPresent: 'Bạn có khả năng giữ thế cân bằng giữa cảm xúc, nhu cầu và việc phải làm.',
    meaningMissing: 'Dễ bị lệch giữa quá chăm người khác và quá quên mình, hoặc ngược lại.',
  },
];

export function calculateLoShuContext(dateOfBirth: string): LoShuContext {
  const digits = [...dateOfBirth.replace(/[^0-9]/g, '')]
    .map((digit) => Number(digit))
    .filter((digit): digit is LoShuDigit => digit >= 1 && digit <= 9);

  const grid = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  } satisfies Record<LoShuDigit, number>;

  digits.forEach((digit) => {
    grid[digit] += 1;
  });

  const { day, month, year } = parseDate(dateOfBirth);
  const driver_number = reduceToSingleDigit(day);
  const conductor_number = reduceToSingleDigit(day + month + reduceToSingleDigit(year));

  const present_arrows: LoShuArrow[] = [];
  const missing_arrows: LoShuArrow[] = [];

  ARROW_DEFINITIONS.forEach((definition) => {
    const counts = definition.numbers.map((digit) => grid[digit]);
    if (counts.every((count) => count > 0)) {
      present_arrows.push({
        id: definition.id,
        numbers: definition.numbers,
        kind: 'present',
        label: definition.label,
        meaning: definition.meaningPresent,
      });
    } else if (counts.every((count) => count === 0)) {
      missing_arrows.push({
        id: definition.id,
        numbers: definition.numbers,
        kind: 'missing',
        label: definition.label,
        meaning: definition.meaningMissing,
      });
    }
  });

  const dominant_digits = (Object.entries(grid) as Array<[string, number]>)
    .filter(([, count]) => count > 1)
    .map(([digit, count]) => ({ digit: Number(digit) as LoShuDigit, count }))
    .sort((left, right) => right.count - left.count || left.digit - right.digit);

  const absent_digits = (Object.entries(grid) as Array<[string, number]>)
    .filter(([, count]) => count === 0)
    .map(([digit]) => Number(digit) as LoShuDigit);

  return {
    methodology: 'lo_shu',
    grid,
    driver_number,
    conductor_number,
    present_arrows,
    missing_arrows,
    dominant_digits,
    absent_digits,
  };
}
