import type {
  MonthlyNumerologyArc,
  NumerologyContext as FullNumerologyContext,
  WeeklyNumerologyArc,
} from '@/types';
import {
  type NumerologyContext as InsightNumerologyContext,
  type InterpretationBlueprint,
} from './types';
import { createInterpretationBlueprint } from './interpretationEngine';

function toInsightContext(numerology: FullNumerologyContext): InsightNumerologyContext {
  return {
    personal_day: numerology.personal_day,
    personal_month: numerology.personal_month,
    personal_year: numerology.personal_year,
    life_path: numerology.core.life_path,
    destiny_number: numerology.core.destiny_number,
    soul_urge: numerology.core.soul_urge,
    birthday_number: numerology.core.birthday_number,
    advanced: numerology.advanced,
    extended: numerology.extended,
  };
}

export function createMetaReadingContext(numerology: FullNumerologyContext): {
  insightNumerology: InsightNumerologyContext;
  blueprint: InterpretationBlueprint;
} {
  const insightNumerology = toInsightContext(numerology);
  return {
    insightNumerology,
    blueprint: createInterpretationBlueprint(insightNumerology),
  };
}

function summarizeNumber(number: number): string {
  switch (number) {
    case 1:
      return 'mở đường và tự chủ';
    case 2:
      return 'lắng nghe và hòa khí';
    case 3:
      return 'biểu đạt và lan tỏa';
    case 4:
      return 'dựng nền và giữ nhịp';
    case 5:
      return 'dịch chuyển và thử nghiệm';
    case 6:
      return 'chăm lo và trách nhiệm';
    case 7:
      return 'lùi lại để nhìn kỹ';
    case 8:
      return 'thực thi và hướng tới kết quả';
    case 9:
      return 'khép lại và buông bớt';
    case 11:
      return 'nhạy cảm và trực giác';
    case 22:
      return 'xây lớn và hiện thực hóa';
    case 33:
      return 'nâng đỡ và phụng sự';
    default:
      return 'một nhịp riêng cần được đọc trong ngữ cảnh';
  }
}

export function buildDailySystemSummary(blueprint: InterpretationBlueprint) {
  const activeLenses = blueprint.meta_methodology.supporting_lenses.filter(
    (lens) => lens.include_in_daily_report
  );

  return {
    title: 'Hôm nay đang được đọc theo trục nào',
    body: `${blueprint.meta_methodology.primary_system.label} vẫn là trục chính của ngày hôm nay. ${activeLenses.length > 0
      ? `Ngoài ra, ${activeLenses.map((lens) => lens.label.toLowerCase()).join(', ')} chỉ được kéo vào để làm rõ hơn một lớp nghĩa thật sự cần thiết.`
      : 'Các hệ mở rộng hôm nay đang ở nền, chưa cần chen lên để làm loãng nhịp đọc chính.'}`,
    activeLenses,
  };
}

export function buildTransitDeepReading(numerology: FullNumerologyContext, blueprint: InterpretationBlueprint) {
  const current = numerology.extended.transits.current;
  const letters = current.letters
    .map((letter) => `${letter.label.toLowerCase()} đang đi qua chữ ${letter.letter.toUpperCase()} (${letter.value})`)
    .join(', ');

  return {
    summary: `Essence ${current.essence_number} của giai đoạn này nghiêng về ${summarizeNumber(
      current.essence_number
    )}. Đây không phải nhịp của riêng hôm nay, mà là lớp thời gian dài hơn đang phủ lên cách bạn bước qua từng ngày.`,
    sections: [
      {
        title: 'Lớp thời gian dài hơn',
        body: `Nếu báo cáo hằng ngày là phần thời tiết của một ngày cụ thể, thì essence và transit giống như mùa đang diễn ra. Năm nay, mùa đó mang sắc ${summarizeNumber(
          current.essence_number
        )}, nên những ngày có cùng hướng sẽ dễ được cảm thấy mạnh hơn bình thường.`,
      },
      {
        title: 'Tên đang kéo bạn về đâu',
        body: `${letters}. Những transit này cho thấy lớp tên không chỉ là cách gọi, mà còn là nhịp biểu đạt đang được kích hoạt trong vài năm. Nó nên được dùng như một lớp bối cảnh, không phải như kết luận thay cho báo cáo ngày.`,
      },
      {
        title: 'Khi nào nên đưa vào daily report',
        body: blueprint.meta_methodology.supporting_lenses.find((lens) => lens.id === 'essence_transits')?.rationale
          ?? 'Chỉ nên kéo essence vào báo cáo ngày khi nó làm sáng hơn vì sao nhịp hôm nay có vẻ quen, mạnh hoặc dai hơn bình thường.',
      },
    ],
  };
}

export function buildLoShuDeepReading(numerology: FullNumerologyContext, blueprint: InterpretationBlueprint) {
  const chart = numerology.extended.lo_shu;
  const dominant = chart.dominant_digits[0];
  const missing = chart.missing_arrows[0];
  const present = chart.present_arrows[0];

  return {
    summary: `Biểu đồ ngày sinh không nói riêng về hôm nay, mà nói về cách bạn thường phản ứng khi gặp những ngày như hôm nay. Driver ${chart.driver_number} và conductor ${chart.conductor_number} tạo ra một lớp khí chất nền để đọc các chu kỳ hằng ngày sâu hơn.`,
    sections: [
      {
        title: 'Điểm bẩm sinh nổi nhất',
        body: dominant
          ? `Số ${dominant.digit} lặp ${dominant.count} lần cho thấy một nét bẩm sinh khá rõ về ${summarizeNumber(dominant.digit)}. Vì vậy, khi báo cáo ngày chạm tới hướng này, bạn thường không cảm nó như điều xa lạ.`
          : 'Biểu đồ của bạn không có một con số trội hẳn, nên phản ứng bẩm sinh cũng linh hoạt và ít bị đóng khung hơn.',
      },
      {
        title: 'Khoảng trống dễ bị chạm',
        body: missing
          ? `${missing.label} là khoảng thiếu đáng chú ý nhất. Những ngày có nhịp căng hoặc cần quyết đoán thường dễ chạm đúng vào chỗ này, nên Lo Shu hữu ích như một lời nhắc về phản xạ quen chứ không phải một bản án cố định.`
          : 'Không có một khoảng thiếu nổi bật ở cấp mũi tên, nên lớp Lo Shu hiện chủ yếu đóng vai trò nền chứ không tạo lực cản lớn.',
      },
      {
        title: 'Vai trò trong daily report',
        body: blueprint.meta_methodology.supporting_lenses.find((lens) => lens.id === 'lo_shu_birth_chart')?.caution
          ?? 'Lo Shu nên đi vào báo cáo ngày như một lăng kính phụ về phản xạ quen, không phải là hệ chính của bản đọc hôm nay.',
      },
      ...(present
        ? [
            {
              title: 'Mũi tên đang nâng đỡ bạn',
              body: `${present.label} là một lực nền tốt để dựa vào. Khi ngày có vẻ chông chênh, chính nét bẩm sinh này thường giúp bạn tự lấy lại trục.`,
            },
          ]
        : []),
    ],
  };
}

export function buildNameLayerReading(numerology: FullNumerologyContext, blueprint: InterpretationBlueprint) {
  const names = numerology.extended.name_variants;
  const pythagoreanShift =
    names.pythagorean_current.reduced !== names.pythagorean_birth.reduced;
  const chaldeanShift =
    names.chaldean_current.reduced !== names.chaldean_birth.reduced;

  return {
    summary: names.differs
      ? `Tên đang dùng của bạn đang tạo ra một lớp sắc thái khác so với tên khai sinh. Điều này không thay thế lõi con người hay daily stack, nhưng có thể đổi cách năng lượng được biểu đạt ra bên ngoài.`
      : 'Tên đang dùng hiện trùng với tên khai sinh, nên lớp tên chủ yếu củng cố nền hiện có thay vì tạo ra một sắc thái mới.',
    sections: [
      {
        title: 'Điều tên đang làm với bạn',
        body: names.dominant_shift,
      },
      {
        title: 'Pythagorean và Chaldean có đang cùng dịch không',
        body:
          pythagoreanShift || chaldeanShift
            ? `Pythagorean ${pythagoreanShift ? 'có' : 'không'} dịch chuyển, Chaldean ${chaldeanShift ? 'có' : 'không'} dịch chuyển. Điều này cho thấy lớp tên hiện tại không chỉ là thay cách gọi, mà còn đổi cách năng lượng đi ra hoặc được cảm nhận.`
            : 'Cả hai hệ đều khá ổn định giữa tên khai sinh và tên đang dùng, nên lớp tên hiện tại nghiêng về củng cố hơn là đổi hướng.',
      },
      {
        title: 'Khi nào nên kéo lớp tên vào daily report',
        body: blueprint.meta_methodology.supporting_lenses.find((lens) => lens.id === 'name_variants')?.rationale
          ?? 'Chỉ nên kéo lớp tên vào báo cáo ngày khi sự khác biệt giữa tên khai sinh và tên đang dùng thật sự đủ mạnh để giải thích cách bạn tự thể hiện trong giai đoạn này.',
      },
    ],
  };
}

export function buildContinuityReadingBlock(
  continuityNote: string | null,
  themeShift: string | null,
  dominantTheme: string | null
) {
  return {
    title: 'Mạch 30 ngày gần đây đang đi về đâu',
    paragraphs: [
      continuityNote
        ? continuityNote
        : 'Hiện chưa có một sợi chỉ đủ rõ để gọi tên mạch vài ngày gần đây.',
      themeShift
        ? themeShift
        : 'Khi chưa thấy một cú chuyển nhịp rõ, điều đó thường có nghĩa là bạn vẫn đang ở trong cùng một bài học nhưng đi sâu hơn vào nó.',
      dominantTheme
        ? `Nếu phải gom lại thành một đường dây rõ nhất trong 30 ngày gần đây, nó đang nghiêng về: ${dominantTheme}.`
        : 'Chưa có chủ đề nào trở lại đủ nhiều để xem là mạch nổi trội.',
    ],
  };
}

export function buildWeeklyCycleReading(weeklyArc: WeeklyNumerologyArc) {
  return {
    title: 'Tuần này đang kể câu chuyện gì',
    sections: [
      {
        title: 'Nhịp mở tuần',
        body: `Đầu tuần mở bằng hướng ${summarizeNumber(
          weeklyArc.opening_number
        )}. Đây là điểm bạn bắt đầu cảm nhận động lực chính của tuần, thường dưới dạng một nhu cầu rất gần người và rất dễ chạm vào đời sống hằng ngày.`,
      },
      {
        title: 'Điểm giữa tuần',
        body: `Giữa tuần chạm rõ hơn vào hướng ${summarizeNumber(
          weeklyArc.pivot_number
        )}. Nếu đầu tuần giống lúc lấy đà, thì giữa tuần là chỗ câu chuyện lộ mặt rõ hơn: bạn sẽ thấy nên đi sâu thêm, giữ vững, hay đổi hướng nhẹ.`,
      },
      {
        title: 'Cách tuần khép lại',
        body: `Cuối tuần nghiêng về ${summarizeNumber(
          weeklyArc.closing_number
        )}. Vì vậy, một ngày bất kỳ trong tuần này nên được đọc như một mắt xích: có ngày mở ra, có ngày thử lực, có ngày gom lại để khép cho gọn.`,
      },
      {
        title: 'Điều tuần này đang tập cho bạn',
        body: `Dù đi qua nhiều personal day khác nhau, cả tuần vẫn đang được đỡ bởi Tháng cá nhân ${weeklyArc.personal_month} và Năm cá nhân ${weeklyArc.personal_year}. Bài học của tuần không nằm ở việc chạy theo từng ngày riêng lẻ, mà ở cách bạn giữ được trục khi những nhịp ngắn thay nhau đi qua.`,
      },
    ],
  };
}

export function buildMonthlyCycleReading(monthlyArc: MonthlyNumerologyArc) {
  return {
    title: 'Tháng này đang mở bài học gì',
    sections: [
      {
        title: 'Nhịp lớn của tháng',
        body: `Tháng này nghiêng về ${monthlyArc.month_theme} trên nền Năm cá nhân ${monthlyArc.personal_year}. Điều đó tạo ra một bài học dài hơi hơn: bạn không chỉ phản ứng với từng ngày, mà đang sống trong một khí hậu chung có độ lặp và độ nhấn rõ hơn.`,
      },
      {
        title: 'Tuần nào dễ nổi lên nhất',
        body: `Nếu gom các tuần trong tháng lại, mạch nổi nhất đang nghiêng về ${monthlyArc.dominant_week_theme}. Điều này cho thấy tháng không trải đều như nhau; sẽ có vài đoạn làm bạn cảm thấy câu chuyện của tháng lộ rõ hơn hẳn.`,
      },
      {
        title: 'Daily nên nằm ở đâu trong tháng',
        body: `Một báo cáo daily trong tháng này chỉ thật sự có nghĩa khi được đặt trên nền tháng. Có ngày mở lối, có ngày siết nhịp, có ngày khép lại, nhưng tất cả vẫn là những biến thể nhỏ của cùng một bài học lớn hơn mà tháng đang yêu cầu.`,
      },
    ],
  };
}

export function buildEmbeddedCycleContext(
  weeklyArc: WeeklyNumerologyArc,
  monthlyArc: MonthlyNumerologyArc
) {
  return {
    weekly: `Tuần này đang đi từ ${summarizeNumber(weeklyArc.opening_number)} qua ${summarizeNumber(
      weeklyArc.pivot_number
    )} rồi khép ở ${summarizeNumber(weeklyArc.closing_number)}. Vì vậy, hôm nay nên được đọc như một đoạn nằm giữa dòng chuyển động đó, không tách riêng khỏi tuần.`,
    monthly: `Tháng này nghiêng về ${monthlyArc.month_theme} trên nền Năm cá nhân ${monthlyArc.personal_year}. Mọi báo cáo daily trong tháng này sẽ rõ hơn khi được nhìn như một biến thể nhỏ của bài học lớn này.`,
  };
}

export function buildCompassReading(
  numerology: FullNumerologyContext,
  blueprint: InterpretationBlueprint,
  weeklyArc: WeeklyNumerologyArc,
  monthlyArc: MonthlyNumerologyArc
) {
  return {
    summary: `Ba con số của hôm nay không đứng riêng lẻ. Ngày ${numerology.personal_day} đang mang nhịp ${summarizeNumber(
      numerology.personal_day
    )}, nhưng nó đi trên nền Tháng ${numerology.personal_month} với hướng ${summarizeNumber(
      numerology.personal_month
    )}, và được đỡ bởi Năm ${numerology.personal_year} nghiêng về ${summarizeNumber(
      numerology.personal_year
    )}.`,
    sections: [
      {
        title: 'Điều ngày hôm nay đang đẩy lên',
        body: `Nếu chỉ nhìn riêng ngày, phần nổi nhất đang là ${blueprint.primary_force.label.toLowerCase()}. Nó dễ xuất hiện dưới dạng nhu cầu gần người nhất: cách bạn phản ứng, cách bạn đổi nhịp, hoặc cách bạn xử lý việc đang ở trước mặt.`,
      },
      {
        title: 'Điều tháng đang giữ ở nền',
        body: `Nhưng tháng không để ngày đi quá xa. Trong tuần này, mạch đi từ ${summarizeNumber(
          weeklyArc.opening_number
        )} qua ${summarizeNumber(weeklyArc.pivot_number)} rồi khép về ${summarizeNumber(
          weeklyArc.closing_number
        )}. Vì vậy, la bàn của ngày không chỉ hỏi “hôm nay muốn gì”, mà còn hỏi “tuần này đang dẫn mình về đâu”.`,
      },
      {
        title: 'Cách đọc đúng nhịp',
        body: `Tháng này nghiêng về ${monthlyArc.month_theme}. Bởi vậy, cách dùng la bàn hôm nay là đọc nó như một điểm rơi nhỏ trong cùng một bài học dài hơn. ${blueprint.conflict_grammar.balancing_move}`,
      },
    ],
  };
}

export function buildBirthChartNarrative(
  numerology: FullNumerologyContext,
  blueprint: InterpretationBlueprint
) {
  const chart = numerology.extended.lo_shu;
  const strongestDigit = chart.dominant_digits[0];
  const firstAbsent = chart.absent_digits[0];
  const firstPresentArrow = chart.present_arrows[0];
  const firstMissingArrow = chart.missing_arrows[0];

  return {
    summary: `Biểu đồ ngày sinh không kể chuyện của một ngày cụ thể. Nó cho thấy khí chất bẩm sinh mà bạn thường đem vào mọi ngày, kể cả khi daily report thay đổi liên tục.`,
    sections: [
      {
        title: 'Khí chất nền của bạn',
        body: `Driver ${chart.driver_number} và conductor ${chart.conductor_number} tạo thành một cách phản ứng rất nền. Bạn thường bước vào đời sống với xu hướng ${summarizeNumber(
          chart.driver_number
        )}, rồi điều phối nó theo cách ${summarizeNumber(chart.conductor_number)}.`,
      },
      {
        title: 'Điểm tự nhiên dễ mạnh lên',
        body: strongestDigit
          ? `Số ${strongestDigit.digit} lặp ${strongestDigit.count} lần cho thấy nét ${summarizeNumber(
              strongestDigit.digit
            )} vốn đã khá quen thuộc trong bạn. Vì vậy, những ngày chạm đến hướng này thường không cần quá gồng, bạn dễ cảm và dễ dùng hơn.`
          : 'Biểu đồ không có một con số nào lặp trội rõ, nên khí chất nền của bạn ít bị đóng khung bởi một nét duy nhất.',
      },
      {
        title: 'Khoảng nào dễ bị gọi tên',
        body: firstMissingArrow
          ? `${firstMissingArrow.label} là khoảng dễ bị chạm nhất ở tầng mũi tên. Nó không phải điểm yếu cố định, nhưng là vùng bạn thường phải học cách đi qua có ý thức hơn khi ngày đòi hỏi đúng phẩm chất này.`
          : firstAbsent
            ? `Số ${firstAbsent} đang vắng trong biểu đồ, nên đây thường là vùng cần học bằng trải nghiệm nhiều hơn là bằng phản xạ bẩm sinh.`
            : 'Không có một khoảng trống quá nổi ở biểu đồ, nên nền bẩm sinh đang khá đều tay.',
      },
      {
        title: 'Khi đặt vào báo cáo hằng ngày',
        body: firstPresentArrow
          ? `${firstPresentArrow.label} là lực nền bạn có thể dựa vào khi ngày trở nên chông chênh. Vì vậy, biểu đồ ngày sinh nên được đọc như phần “mình vốn là ai khi bước vào ngày này”, còn daily report là phần “hôm nay đời sống đang yêu cầu gì ở mình”. ${blueprint.meta_methodology.supporting_lenses.find((lens) => lens.id === 'lo_shu_birth_chart')?.caution ?? ''}`
          : `Biểu đồ ngày sinh chủ yếu cho bạn một khung tự hiểu về phản xạ quen. ${blueprint.meta_methodology.supporting_lenses.find((lens) => lens.id === 'lo_shu_birth_chart')?.caution ?? ''}`,
      },
    ],
  };
}

export function buildTransitStageShiftReading(numerology: FullNumerologyContext) {
  const current = numerology.extended.transits.current;
  const next = numerology.extended.transits.next_years[0];

  if (!next) {
    return null;
  }

  return {
    title: 'Chuyển pha sắp tới',
    paragraphs: [
      `Hiện tại bạn đang đi trong essence ${current.essence_number}, nghiêng về ${summarizeNumber(
        current.essence_number
      )}. Đây là lớp khí hậu đang phủ lên vài năm hiện tại.`,
      `Năm kế tiếp chuyển sang essence ${next.essence_number}, nghiêng về ${summarizeNumber(
        next.essence_number
      )}. Vì vậy, điều đáng nhìn không chỉ là “năm nay là gì”, mà là bạn đang đi từ một kiểu nhịp nào sang một kiểu nhịp nào.`,
      `Nếu hai essence này khác sắc rõ, đây thường là lúc những lựa chọn nhỏ trong hiện tại bắt đầu hé ra hướng phát triển vài năm tới.`,
    ],
  };
}

export function buildNameExpressionReading(numerology: FullNumerologyContext) {
  const names = numerology.extended.name_variants;
  const pythagoreanShift =
    names.pythagorean_current.reduced !== names.pythagorean_birth.reduced;
  const chaldeanShift =
    names.chaldean_current.reduced !== names.chaldean_birth.reduced;

  return {
    title: 'Tên đang đổi cách bạn đi ra ngoài như thế nào',
    paragraphs: [
      names.differs
        ? `Tên đang dùng không xóa lõi của tên khai sinh, nhưng nó có thể làm đổi lớp biểu đạt gần với đời sống hằng ngày hơn: cách người khác gọi bạn, cách bạn bước vào quan hệ, và sắc thái đầu tiên bạn mang ra ngoài.`
        : 'Tên đang dùng hiện trùng với tên khai sinh, nên lớp biểu đạt bên ngoài và lõi tên đang đi khá cùng nhau.',
      pythagoreanShift || chaldeanShift
        ? `Ở lớp số học, sự dịch chuyển đang xảy ra theo ${pythagoreanShift ? 'Pythagorean' : ''}${pythagoreanShift && chaldeanShift ? ' và ' : ''}${chaldeanShift ? 'Chaldean' : ''}. Điều này cho thấy lớp tên hiện tại không chỉ khác trên giấy, mà còn thực sự tạo ra một sắc thái đi ra ngoài khác hơn trước.`
        : 'Cả Pythagorean lẫn Chaldean hiện khá ổn định giữa tên khai sinh và tên đang dùng, nên lớp tên chủ yếu đang củng cố nền cũ thay vì xoay hướng mới.',
      'Vì vậy, lớp tên nên được đọc như phần “đi ra ngoài” của bạn: nó không thay lõi số mệnh, nhưng có thể đổi cách năng lượng ấy được cảm, được gọi tên và được người khác đáp lại.',
    ],
  };
}
