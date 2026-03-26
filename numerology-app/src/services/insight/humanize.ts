import { InsightPresentationBlocks } from './types';

const VIETNAMESE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^Về bản chất,\s*/gi, ''],
  [/^Nhìn từ góc độ rộng hơn,\s*/gi, 'Nếu nhìn rộng ra một chút, '],
  [/^Nhìn trên một quãng thời gian rộng hơn,\s*/gi, 'Nếu nhìn rộng ra một chút, '],
  [/^Nhìn rộng hơn,\s*/gi, 'Nếu nhìn rộng ra một chút, '],
  [/^Hơn nữa,\s*/gi, 'Thêm một điều nữa là '],
  [/\bHôm nay hoạt động như một ngày\b/gi, 'Hôm nay giống như một ngày'],
  [/\bHôm nay hoạt động như\b/gi, 'Hôm nay giống như'],
  [/\bHôm nay giống như một ngày\b/gi, 'Hôm nay dễ gợi ra cảm giác'],
  [/\bHôm nay giống như\b/gi, 'Hôm nay dễ gợi ra'],
  [/\bVai trò của nó là\b/gi, 'Điều ngày này gợi ra là'],
  [/\bVai trò của ngày hôm nay là\b/gi, 'Điều ngày này gợi ra là'],
  [/\bTrục cân bằng chính của ngày xoay quanh việc\b/gi, 'Điều quan trọng nhất hôm nay là'],
  [/\bTrục chính của hôm nay là\b/gi, 'Điều nổi bật nhất hôm nay là'],
  [/\bTrục chính xoay quanh\b/gi, 'Điều nổi bật nhất nằm ở'],
  [/\bTrục cân bằng chính\b/gi, 'Điều quan trọng nhất'],
  [/\bBản chất của sự giằng co hôm nay là kiểu đẩy-kéo\b/gi, 'Sự giằng co hôm nay đến từ hai lực kéo ngược nhau'],
  [/\bBản chất của sự giằng co hôm nay là\b/gi, 'Sự giằng co hôm nay nằm ở chỗ'],
  [/\bNền tảng lâu dài hơn nữa đến từ\b/gi, 'Ở tầng sâu hơn,'],
  [/\bNền tảng lâu dài của bạn\b/gi, 'Ở phía sâu hơn trong bạn'],
  [/\bỞ lớp nền lâu dài hơn\b/gi, 'Ở phía sâu hơn trong bạn'],
  [/\bỞ tầng sâu hơn\b/gi, 'Ở phía sâu hơn trong bạn'],
  [/\bỞ lớp nền lâu dài hơn –\b/gi, 'Ở phía sâu hơn trong bạn, '],
  [/\bĐiều này phản ánh trục\b/gi, 'Điều này cho thấy rõ hơn'],
  [/\bĐiều này phản ánh trục\b/gi, 'Điều này cho thấy rõ hơn'],
  [/\bĐiều này cho thấy\b/gi, 'Điều đó gợi ra'],
  [/\bĐiều này giải thích tại sao\b/gi, 'Vì vậy cũng dễ hiểu vì sao'],
  [/\bĐiều này cung cấp một lớp hỗ trợ bổ sung cho\b/gi, 'Điều này cũng nâng đỡ thêm cho'],
  [/\bĐiều này có nghĩa là\b/gi, 'Điều đó thường có nghĩa là'],
  [/\bĐiều này có thể\b/gi, 'Vì vậy'],
  [/\bĐiều này giúp neo giữ\b/gi, 'Nhờ vậy,'],
  [/\bĐiều này giúp\b/gi, 'Nhờ vậy,'],
  [/\bbối cảnh lớn hơn\b/gi, 'dòng chảy rộng hơn'],
  [/\bkhung cảnh chung của tháng\b/gi, 'nhịp của tháng'],
  [/\bpattern\b/gi, 'nhịp'],
  [/\btrục\b/gi, 'mạch'],
  [/\bkhông đơn thuần là\b/gi, 'không chỉ là'],
  [/\báp lực khép vòng\b/gi, 'sức ép phải khép lại điều cũ'],
  [/\bsức ì khép vòng\b/gi, 'cảm giác còn vướng việc cũ'],
  [/\bđiểm giằng co\b/gi, 'điều khiến bạn lưỡng lự'],
  [/\bđiểm ma sát chính\b/gi, 'chỗ dễ vướng nhất'],
  [/\bđiểm ma sát\b/gi, 'chỗ dễ vướng'],
  [/\bpush-pull\b/gi, 'kéo qua kéo lại'],
  [/\bkarmic lessons\b/gi, 'những bài học cũ'],
  [/\bbài học nghiệp\b/gi, 'những bài học cũ'],
  [/\bkarmic debt\b/gi, 'món nợ cũ cần học cách gỡ'],
  [/\bvũ trụ đang thì thầm rằng:\s*/gi, 'Có cảm giác như ngày này đang nhắc rằng: '],
  [/\bđiểm hội tụ\b/gi, 'điều đáng giữ nhất'],
  [/\bđộ chuyển\b/gi, 'cách mọi thứ dịch chuyển'],
  [/\bkhông khí chung\b/gi, 'không khí của ngày'],
];

function cleanupSpacing(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])([^\s])/g, '$1 $2')
    .trim();
}

function cleanupVietnameseSentence(text: string): string {
  return text
    .replace(/\bđây là một ngày của\b/gi, 'hôm nay mang nhiều sắc thái của')
    .replace(/\bđây là một ngày\b/gi, 'hôm nay là một ngày')
    .replace(/\bđiều này\b/gi, 'điều đó')
    .replace(/\bđiều ngày này gợi ra là\b/gi, 'ngày này gợi ra')
    .replace(/\bở tầng sâu hơn,\s*ở tầng sâu hơn\b/gi, 'ở tầng sâu hơn')
    .replace(/\bhôm nay dễ gợi ra cảm giác\s+hôm nay\b/gi, 'hôm nay dễ gợi ra cảm giác')
    .replace(/\bhôm nay là một ngày\s+hôm nay\b/gi, 'hôm nay')
    .replace(/\bở tầng sâu hơn,\s*ở tầng sâu hơn\b/gi, 'ở tầng sâu hơn')
    .replace(/\bthường có nghĩa là thường có nghĩa là\b/gi, 'thường có nghĩa là')
    .replace(/\bTuy nhiên,\s+Ở\b/g, 'Nhưng ở')
    .replace(/\bCó cảm giác như ngày này đang nhắc rằng:\s*'([^']+)'\b/gi, '$1')
    .replace(/\bnhững bài học cũ\s*\(([^)]+)\)/gi, 'những bài học cũ')
    .replace(/\bpush-pull\b/gi, 'kéo qua kéo lại')
    .replace(/\s+'/g, " '")
    .replace(/'\s+/g, "' ");
}

function splitDenseParagraphs(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const expanded = paragraphs.flatMap((paragraph) => {
    const sentenceMatches = paragraph.match(/[^.!?]+[.!?…]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
    const shouldSplit = paragraph.length > 560 || sentenceMatches.length >= 6;

    if (!shouldSplit || sentenceMatches.length < 4) {
      return [paragraph];
    }

    const chunks: string[] = [];
    let buffer: string[] = [];

    sentenceMatches.forEach((sentence, index) => {
      buffer.push(sentence);
      const isBoundary = buffer.length >= 2 && (
        buffer.join(' ').length >= 260 ||
        sentenceMatches.length - index - 1 <= 2 ||
        buffer.length >= 3
      );

      if (isBoundary) {
        chunks.push(buffer.join(' ').trim());
        buffer = [];
      }
    });

    if (buffer.length > 0) {
      chunks.push(buffer.join(' ').trim());
    }

    return chunks;
  });

  return expanded.join('\n\n');
}

export function humanizeVietnameseText(text: string): string {
  let next = text;
  for (const [pattern, replacement] of VIETNAMESE_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  next = cleanupVietnameseSentence(next);
  next = splitDenseParagraphs(next);
  return next
    .split(/\n\s*\n/)
    .map((paragraph) => cleanupSpacing(paragraph))
    .join('\n\n');
}

export function humanizePresentationBlocks(
  presentation: InsightPresentationBlocks
): InsightPresentationBlocks {
  return {
    visual_scene: {
      atmosphere: humanizeVietnameseText(presentation.visual_scene.atmosphere),
      movement: humanizeVietnameseText(presentation.visual_scene.movement),
      focal_point: humanizeVietnameseText(presentation.visual_scene.focal_point),
    },
    energy_map: presentation.energy_map.map((item) => ({
      ...item,
      label: humanizeVietnameseText(item.label),
      meaning: humanizeVietnameseText(item.meaning),
    })),
    decision_compass: {
      lean_in: humanizeVietnameseText(presentation.decision_compass.lean_in),
      hold_steady: humanizeVietnameseText(presentation.decision_compass.hold_steady),
      avoid_force: humanizeVietnameseText(presentation.decision_compass.avoid_force),
    },
    practical_guidance: presentation.practical_guidance.map((item) => ({
      ...item,
      title: humanizeVietnameseText(item.title),
      suggestion: humanizeVietnameseText(item.suggestion),
      timing: humanizeVietnameseText(item.timing),
    })),
    narrative_beats: presentation.narrative_beats.map((item) => ({
      title: humanizeVietnameseText(item.title),
      summary: humanizeVietnameseText(item.summary),
    })),
    closing_signal: {
      title: humanizeVietnameseText(presentation.closing_signal.title),
      phrase: humanizeVietnameseText(presentation.closing_signal.phrase),
    },
  };
}
