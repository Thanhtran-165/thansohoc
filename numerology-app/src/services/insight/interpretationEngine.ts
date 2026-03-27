/**
 * Interpretation Engine
 * Converts numerology context into a deterministic reading blueprint.
 *
 * The model should elaborate on this blueprint, not invent the report structure
 * from scratch. This is the first step toward a real methodology layer.
 */

import {
  InterpretationBlueprint,
  InterpretationForce,
  NumerologyContext,
  InterpretationPatternId,
} from './types';

type SemanticProfile = {
  label: string;
  drive: 'initiation' | 'bonding' | 'expression' | 'structure' | 'change' | 'care' | 'reflection' | 'power' | 'completion' | 'vision' | 'mastery' | 'service';
  gifts: string;
  shadow: string;
  pacing: 'slow' | 'steady' | 'fluid' | 'intense';
};

const NUMBER_SEMANTICS: Record<number, SemanticProfile> = {
  1: { label: 'Mở đường', drive: 'initiation', gifts: 'khởi xướng, tách hướng, tự chủ', shadow: 'nóng vội hoặc quá tự mình', pacing: 'intense' },
  2: { label: 'Giữ hòa khí', drive: 'bonding', gifts: 'lắng nghe, nối kết, cân bằng', shadow: 'do dự hoặc lệ thuộc cảm xúc', pacing: 'slow' },
  3: { label: 'Biểu đạt', drive: 'expression', gifts: 'nói ra, sáng tạo, lan tỏa', shadow: 'phân tán hoặc nói nhiều hơn làm', pacing: 'fluid' },
  4: { label: 'Dựng nền', drive: 'structure', gifts: 'ổn định, tổ chức, kỷ luật', shadow: 'cứng hoặc sợ thay đổi', pacing: 'steady' },
  5: { label: 'Đổi nhịp', drive: 'change', gifts: 'linh hoạt, thử nghiệm, dịch chuyển', shadow: 'bốc đồng hoặc khó giữ nhịp', pacing: 'fluid' },
  6: { label: 'Chăm lo', drive: 'care', gifts: 'trách nhiệm, nâng đỡ, gắn kết', shadow: 'ôm việc hoặc kiểm soát', pacing: 'steady' },
  7: { label: 'Lùi lại để hiểu', drive: 'reflection', gifts: 'quan sát, chiêm nghiệm, đào sâu', shadow: 'khép kín hoặc xa cách', pacing: 'slow' },
  8: { label: 'Đi tới kết quả', drive: 'power', gifts: 'thực thi, quyết đoán, quản trị', shadow: 'quá cứng hoặc quá nặng thành tích', pacing: 'intense' },
  9: { label: 'Khép vòng', drive: 'completion', gifts: 'buông bỏ, hoàn thiện, nhìn rộng', shadow: 'cạn năng lượng hoặc tiếc nuối', pacing: 'steady' },
  11: { label: 'Nhạy cảm trực giác', drive: 'vision', gifts: 'cảm nhận tinh tế, truyền cảm hứng', shadow: 'quá tải thần kinh hoặc mơ hồ', pacing: 'intense' },
  22: { label: 'Biến ý tưởng thành hình', drive: 'mastery', gifts: 'xây lớn, hiện thực hóa, tổ chức hệ thống', shadow: 'quá áp lực hoặc quá tải trách nhiệm', pacing: 'intense' },
  33: { label: 'Dẫn dắt bằng sự nâng đỡ', drive: 'service', gifts: 'dìu dắt, chữa lành, phụng sự', shadow: 'hy sinh quá mức hoặc ôm hết phần người khác', pacing: 'steady' },
};

function semanticFor(number: number): SemanticProfile {
  return NUMBER_SEMANTICS[number] ?? NUMBER_SEMANTICS[9];
}

function createForce(
  source: InterpretationForce['source'],
  number: number,
  role: InterpretationForce['role']
): InterpretationForce {
  const semantic = semanticFor(number);
  return {
    source,
    number,
    role,
    label: semantic.label,
    meaning: semantic.gifts,
  };
}

function weightFor(source: InterpretationForce['source']): number {
  switch (source) {
    case 'personal_day':
      return 1;
    case 'personal_month':
      return 0.85;
    case 'current_challenge':
      return 0.8;
    case 'current_pinnacle':
      return 0.78;
    case 'personal_year':
      return 0.72;
    case 'life_path':
      return 0.65;
    case 'destiny_number':
      return 0.58;
    case 'balance_number':
      return 0.54;
    case 'soul_urge':
      return 0.48;
    case 'birthday_number':
      return 0.42;
    case 'hidden_passion':
      return 0.35;
    case 'karmic_debt':
      return 0.34;
    case 'karmic_lesson':
      return 0.3;
    default:
      return 0.25;
  }
}

function findTension(a: number, b: number): string | null {
  const driveA = semanticFor(a).drive;
  const driveB = semanticFor(b).drive;

  if (driveA === 'change' && (driveB === 'care' || driveB === 'structure')) {
    return 'mong muốn dịch chuyển đang đi cùng nhu cầu giữ nền và trách nhiệm';
  }
  if (driveA === 'expression' && (driveB === 'structure' || driveB === 'power')) {
    return 'nhu cầu biểu đạt cần đi qua khuôn khổ rõ ràng để không bị tản lực';
  }
  if (driveA === 'reflection' && (driveB === 'expression' || driveB === 'change')) {
    return 'một phần muốn lùi lại quan sát trong khi phần khác muốn nói ra hoặc đổi nhịp nhanh';
  }
  if (driveA === 'completion' && (driveB === 'initiation' || driveB === 'change')) {
    return 'một nhịp muốn khép lại đang đứng cạnh một nhịp muốn bắt đầu hoặc dịch chuyển';
  }

  return null;
}

function createReadingAngles(
  primary: InterpretationForce,
  support: InterpretationForce,
  friction: InterpretationForce | null
): InterpretationBlueprint['reading_angles'] {
  return [
    {
      area: 'inner_state',
      focus: `Nhìn xem năng lượng ${primary.label.toLowerCase()} đang xuất hiện trong tâm thế của bạn ra sao.`,
    },
    {
      area: 'relationships',
      focus: `Quan sát cách ${support.label.toLowerCase()} ảnh hưởng tới cách bạn giữ nhịp với người khác.`,
    },
    {
      area: 'work',
      focus: friction
        ? `Trong công việc, điểm cần lưu ý là ${friction.label.toLowerCase()} có thể tạo độ ì hoặc áp lực nếu không được đặt đúng chỗ.`
        : `Trong công việc, ưu tiên những việc hợp với nhịp ${primary.label.toLowerCase()} thay vì ôm quá nhiều hướng cùng lúc.`,
    },
    {
      area: 'decision_making',
      focus: `Khi cần quyết định, hãy cân bằng giữa ${primary.label.toLowerCase()} và ${support.label.toLowerCase()}.`,
    },
  ];
}

function createDominantAxis(
  primary: InterpretationForce,
  support: InterpretationForce
): InterpretationBlueprint['dominant_axis'] {
  const primarySemantic = semanticFor(primary.number);
  const supportSemantic = semanticFor(support.number);

  if (
    primarySemantic.drive === 'change' &&
    (supportSemantic.drive === 'care' || supportSemantic.drive === 'structure')
  ) {
    return {
      name: 'đổi mới và trách nhiệm',
      description: 'Ngày muốn mở ra hướng mới nhưng vẫn phải giữ nhịp ổn định với những cam kết đang có.',
    };
  }

  if (
    primarySemantic.drive === 'expression' &&
    (supportSemantic.drive === 'structure' || supportSemantic.drive === 'power')
  ) {
    return {
      name: 'biểu đạt và khuôn khổ',
      description: 'Điểm mạnh của hôm nay nằm ở việc đưa ý tưởng vào hình thức rõ ràng thay vì để cảm hứng chạy tự do.',
    };
  }

  if (
    primarySemantic.drive === 'reflection' &&
    (supportSemantic.drive === 'initiation' || supportSemantic.drive === 'change')
  ) {
    return {
      name: 'chiêm nghiệm và hành động',
      description: 'Ngày cần một nhịp lùi lại để nhìn rõ trước khi quyết định tiến lên hay đổi hướng.',
    };
  }

  if (
    primarySemantic.drive === 'completion' &&
    (supportSemantic.drive === 'initiation' || supportSemantic.drive === 'change')
  ) {
    return {
      name: 'khép lại và mở ra',
      description: 'Một phần của ngày đòi hỏi dọn dẹp, buông bớt hoặc hoàn tất để tạo chỗ cho nhịp mới.',
    };
  }

  return {
    name: `${primary.label.toLowerCase()} và ${support.label.toLowerCase()}`,
    description: `Trục đọc chính của hôm nay là sự gặp nhau giữa ${primary.label.toLowerCase()} và ${support.label.toLowerCase()}.`,
  };
}

function createPattern(
  primary: InterpretationForce,
  support: InterpretationForce,
  friction: InterpretationForce | null
): InterpretationBlueprint['pattern'] {
  const primaryDrive = semanticFor(primary.number).drive;
  const supportDrive = semanticFor(support.number).drive;
  const frictionDrive = friction ? semanticFor(friction.number).drive : null;

  const create = (
    id: InterpretationPatternId,
    label: string,
    rationale: string
  ): InterpretationBlueprint['pattern'] => ({
    id,
    label,
    rationale,
  });

  if (
    primaryDrive === 'change' &&
    (supportDrive === 'care' || supportDrive === 'structure' || frictionDrive === 'care')
  ) {
    return create(
      'movement_with_responsibility',
      'đổi nhịp nhưng không rời nền',
      'Ngày được dẫn bởi nhu cầu dịch chuyển, nhưng nền tháng hoặc lực cản đang kéo bạn trở về với trách nhiệm và nhịp ổn định.'
    );
  }

  if (
    primaryDrive === 'expression' &&
    (supportDrive === 'structure' || supportDrive === 'power' || frictionDrive === 'structure')
  ) {
    return create(
      'expression_through_structure',
      'sáng tạo trong khuôn khổ',
      'Năng lượng biểu đạt mạnh lên rõ, nhưng chỉ phát huy tốt khi đi qua một khuôn rõ ràng, có tổ chức hoặc có tiêu chuẩn.'
    );
  }

  if (
    primaryDrive === 'reflection' &&
    (supportDrive === 'change' || supportDrive === 'initiation' || frictionDrive === 'change')
  ) {
    return create(
      'reflection_before_action',
      'lùi lại để chọn hướng',
      'Ngày không phù hợp với việc lao đi ngay. Lớp nền đang buộc bạn quan sát sâu hơn trước khi hành động.'
    );
  }

  if (
    primaryDrive === 'care' &&
    (frictionDrive === 'power' || frictionDrive === 'change' || supportDrive === 'power')
  ) {
    return create(
      'service_with_boundaries',
      'chăm lo nhưng vẫn giữ ranh giới',
      'Nhịp phục vụ hoặc nâng đỡ mạnh lên, nhưng nếu không đặt ranh giới rõ thì rất dễ chuyển thành ôm việc hoặc quá tải.'
    );
  }

  if (
    primaryDrive === 'completion' &&
    (supportDrive === 'initiation' || supportDrive === 'change' || frictionDrive === 'initiation')
  ) {
    return create(
      'completion_before_beginning',
      'khép bớt trước khi mở mới',
      'Ngày này không chỉ nói về khởi đầu. Nó yêu cầu bạn kết thúc hoặc buông một phần cũ để nhịp mới có chỗ xuất hiện.'
    );
  }

  if (
    primaryDrive === 'power' &&
    (supportDrive === 'bonding' || supportDrive === 'care' || frictionDrive === 'care')
  ) {
    return create(
      'power_with_balance',
      'đẩy mạnh nhưng không ép',
      'Lực thực thi hoặc tham vọng đang mạnh, nhưng bài học của ngày là dùng sức đúng liều thay vì đẩy mọi thứ quá tay.'
    );
  }

  if (primaryDrive === 'structure' || supportDrive === 'structure') {
    return create(
      'steady_build',
      'dựng nền cho bước tiếp theo',
      'Báo cáo hôm nay nên đọc như một nhịp xây nền: ít hào nhoáng nhưng quan trọng cho tính bền vững của chặng sau.'
    );
  }

  return create(
    'intuitive_opening',
    'mở ra từ cảm nhận chính',
    'Trục đọc của hôm nay nghiêng về cảm nhận chủ đạo rồi mới đi xuống các ứng dụng cụ thể.'
  );
}

function createConflictGrammar(
  pattern: InterpretationBlueprint['pattern'],
  primary: InterpretationForce,
  support: InterpretationForce,
  friction: InterpretationForce | null
): InterpretationBlueprint['conflict_grammar'] {
  switch (pattern.id) {
    case 'movement_with_responsibility':
      return {
        kind: 'push_pull',
        summary: 'Một bên muốn đổi nhịp, một bên đòi giữ nền.',
        likely_overcorrection: 'Hoặc bốc lên quá nhanh, hoặc giữ quá chặt đến mức bỏ lỡ nhịp đổi cần thiết.',
        balancing_move: 'Đổi ở phạm vi vừa đủ nhưng không bỏ rơi các cam kết cốt lõi.',
        naming_rule: `Khi viết, phải giữ cả hai vế ${primary.label.toLowerCase()} và ${support.label.toLowerCase()} trong cùng một trục đọc.`,
      };
    case 'expression_through_structure':
      return {
        kind: 'channeling',
        summary: 'Cảm hứng chỉ trở nên có giá trị khi được đặt vào khuôn rõ ràng.',
        likely_overcorrection: 'Hoặc nói nhiều hơn làm, hoặc siết quá chặt khiến dòng sáng tạo nghẹt lại.',
        balancing_move: 'Cho phép ý tưởng đi ra, nhưng đi qua dàn ý, lịch trình hoặc tiêu chuẩn cụ thể.',
        naming_rule: 'Không được viết như thể cảm hứng tự nó là đủ; luôn phải gọi tên chiếc khung giữ nó đứng lại.',
      };
    case 'reflection_before_action':
      return {
        kind: 'recalibration',
        summary: 'Ngày cần nhịp chậm để nhìn lại trước khi tiến.',
        likely_overcorrection: 'Hoặc lao đi khi chưa rõ hướng, hoặc nghĩ quá lâu rồi bỏ lỡ điểm vào việc.',
        balancing_move: 'Cho bản thân một khoảng nhìn kỹ rồi chốt bước nhỏ đầu tiên.',
        naming_rule: 'Phải diễn đạt việc lùi lại như một bước chiến lược, không như sự trì hoãn.',
      };
    case 'service_with_boundaries':
      return {
        kind: 'containment',
        summary: 'Sự nâng đỡ chỉ bền khi có ranh giới.',
        likely_overcorrection: 'Ôm việc, ôm vai trò hoặc gánh luôn phần việc của người khác.',
        balancing_move: 'Giữ tinh thần chăm lo nhưng xác định rõ phần nào là của mình.',
        naming_rule: 'Khi viết phải để ranh giới xuất hiện như giải pháp, không chỉ như lời cảnh báo.',
      };
    case 'completion_before_beginning':
      return {
        kind: 'closure_transition',
        summary: 'Một nhịp khép lại là điều kiện để nhịp mới xuất hiện đúng cách.',
        likely_overcorrection: 'Hoặc cố mở mới quá sớm, hoặc níu phần cũ quá lâu.',
        balancing_move: 'Hoàn tất một đầu việc, mối bận tâm hoặc cảm giác dang dở trước khi mở hướng tiếp theo.',
        naming_rule: 'Luôn đặt ý khép lại đi trước ý bắt đầu.',
      };
    case 'power_with_balance':
      return {
        kind: 'amplification',
        summary: 'Lực đẩy mạnh nhưng cần được điều áp.',
        likely_overcorrection: 'Dùng sức quá tay, ép tiến độ hoặc đánh đồng hiệu quả với kiểm soát.',
        balancing_move: 'Giữ mục tiêu rõ nhưng điều chỉnh lực để không làm méo quan hệ và nhịp nội tâm.',
        naming_rule: 'Không được tán dương sức mạnh một chiều; phải đi cùng cảnh báo về liều lượng.',
      };
    case 'steady_build':
      return {
        kind: 'containment',
        summary: 'Giá trị của ngày nằm ở việc dựng nền ổn định.',
        likely_overcorrection: 'Sa vào khô cứng hoặc ôm quá nhiều việc nền cùng lúc.',
        balancing_move: 'Chọn một vài viên gạch quan trọng và đặt cho chắc.',
        naming_rule: 'Ngôn ngữ phải trầm, rõ, không phô trương.',
      };
    case 'intuitive_opening':
    default:
      return {
        kind: 'channeling',
        summary: 'Ngày mở ra từ cảm nhận chính rồi mới đi tới hành động.',
        likely_overcorrection: 'Đắm trong cảm hứng mà thiếu điểm tựa để triển khai.',
        balancing_move: 'Gọi tên cảm nhận cốt lõi rồi neo nó vào một quyết định hay hành động nhỏ.',
        naming_rule: friction
          ? `Vẫn phải giữ lực cản ${friction.label.toLowerCase()} trong khung đọc, không được làm nó biến mất.`
          : `Dùng ${support.label.toLowerCase()} như điểm tựa để cảm nhận không bị trôi.`,
      };
  }
}

function createReportArchetype(
  pattern: InterpretationBlueprint['pattern']
): InterpretationBlueprint['report_archetype'] {
  switch (pattern.id) {
    case 'movement_with_responsibility':
      return {
        id: 'anchored_change_day',
        label: 'ngày đổi nhịp có điểm tựa',
        narrative_role: 'Một ngày mở ra hướng mới nhưng vẫn phải đặt chân trên nền trách nhiệm.',
        report_emphasis: 'Nhấn vào cách đổi vừa đủ, không phủ định nền cũ.',
        closing_tone: 'Kết bằng một nhịp điều chỉnh tỉnh táo.',
      };
    case 'expression_through_structure':
      return {
        id: 'structured_expression_day',
        label: 'ngày đưa ý tưởng vào hình',
        narrative_role: 'Một ngày hợp với việc chuyển cảm hứng thành thứ có hình, có nhịp, có cấu trúc.',
        report_emphasis: 'Nhấn vào sự kết hợp giữa biểu đạt và kỷ luật.',
        closing_tone: 'Kết bằng cảm giác rõ đường hơn là hưng phấn đơn thuần.',
      };
    case 'service_with_boundaries':
      return {
        id: 'boundary_day',
        label: 'ngày giữ ranh giới để chăm lo bền hơn',
        narrative_role: 'Một ngày cần phân biệt giữa nâng đỡ và ôm thay.',
        report_emphasis: 'Nhấn vào trách nhiệm có giới hạn.',
        closing_tone: 'Kết bằng sự nhẹ lại, không tội lỗi.',
      };
    case 'completion_before_beginning':
      return {
        id: 'closure_day',
        label: 'ngày khép vòng để mở hướng',
        narrative_role: 'Một ngày nên được đọc như điểm chuyển, nơi việc kết thúc đúng chỗ quan trọng không kém việc bắt đầu.',
        report_emphasis: 'Nhấn vào quá trình dọn chỗ cho nhịp mới.',
        closing_tone: 'Kết bằng một lời nhắc buông bớt.',
      };
    case 'steady_build':
      return {
        id: 'builder_day',
        label: 'ngày dựng nền',
        narrative_role: 'Một ngày dành cho việc đặt những phần căn bản về đúng vị trí.',
        report_emphasis: 'Nhấn vào độ bền, nhịp đều và việc làm đúng thứ tự.',
        closing_tone: 'Kết bằng sự chắc tay.',
      };
    case 'reflection_before_action':
      return {
        id: 'threshold_day',
        label: 'ngày đứng ở ngưỡng chuyển',
        narrative_role: 'Một ngày ở lằn ranh giữa quan sát và hành động, nơi sự chín của quyết định quan trọng hơn tốc độ.',
        report_emphasis: 'Nhấn vào việc nhìn rõ trước khi tiến.',
        closing_tone: 'Kết bằng sự lắng nhưng không trì hoãn.',
      };
    case 'power_with_balance':
    case 'intuitive_opening':
    default:
      return {
        id: 'integration_day',
        label: 'ngày gom lực cho đúng hướng',
        narrative_role: 'Một ngày cần tập hợp nhiều lớp lực khác nhau vào cùng một trục rõ ràng.',
        report_emphasis: 'Nhấn vào việc phối hợp các lực thay vì dồn một lực lên quá cao.',
        closing_tone: 'Kết bằng sự cân bằng và tỉnh táo.',
      };
  }
}

function createSectionPlan(
  primary: InterpretationForce,
  support: InterpretationForce,
  friction: InterpretationForce | null,
  pattern: InterpretationBlueprint['pattern']
): InterpretationBlueprint['section_plan'] {
  return [
    {
      section: 'headline_frame',
      objective: 'Đặt đúng tên cho nhịp chính của ngày bằng ngôn ngữ tự nhiên.',
      anchors: [primary.source, support.source],
      guidance: `Headline phải phản ánh pattern "${pattern.label}" thay vì chỉ đọc lại tên con số.`,
    },
    {
      section: 'main_current',
      objective: 'Giải thích lực mở đầu của ngày và lớp nền đang định hình nó.',
      anchors: [primary.source, support.source],
      guidance: 'Mở thân bài bằng personal day trước, rồi mới đưa personal month hoặc current pinnacle vào như bối cảnh.',
    },
    {
      section: 'tension_point',
      objective: 'Gọi tên điểm ma sát hoặc nguy cơ lệch nhịp nếu có.',
      anchors: friction ? [friction.source, primary.source] : [primary.source],
      guidance: friction
        ? 'Nếu có current challenge hoặc karmic debt/lesson, phải nêu thành một điểm cảnh báo cụ thể, không được làm mờ.'
        : 'Nếu không có ma sát nổi bật, chuyển phần này thành lưu ý về xu hướng đi quá tay của lực chính.',
    },
    {
      section: 'applied_direction',
      objective: 'Đưa ra hướng vận dụng cho công việc, quan hệ và quyết định trong ngày.',
      anchors: [primary.source, support.source],
      guidance: 'Các gợi ý ứng dụng phải bám reading angles thay vì bịa thêm mảng đời sống không có cơ sở trong blueprint.',
    },
    {
      section: 'deepening_arc',
      objective: 'Nối nhịp hôm nay với chu kỳ dài hơn của người dùng.',
      anchors: ['personal_year', 'life_path', 'current_pinnacle'],
      guidance: 'Ở lớp sâu, phải nối personal year và life path như nền dài hạn, nhưng không để chúng cướp vai trò của personal day.',
    },
    {
      section: 'closing_note',
      objective: 'Khép báo cáo bằng một lời nhắc gọn, rõ, không thần bí quá mức.',
      anchors: friction ? [primary.source, friction.source] : [primary.source, support.source],
      guidance: 'Kết báo cáo bằng một nhịp điều chỉnh hoặc giữ nhịp, không kết bằng lời tiên đoán.',
    },
  ];
}

function createAssemblyPlan(
  sectionPlan: InterpretationBlueprint['section_plan'],
  archetype: InterpretationBlueprint['report_archetype'],
  conflictGrammar: InterpretationBlueprint['conflict_grammar']
): InterpretationBlueprint['assembly_plan'] {
  const sectionById = new Map(sectionPlan.map((section) => [section.section, section]));

  const build = (
    layer: 'quick' | 'standard' | 'deep',
    order: number,
    section: InterpretationBlueprint['section_plan'][number]['section'],
    intent: string,
    mustInclude: string[],
    avoid: string[]
  ): InterpretationBlueprint['assembly_plan'][number] => ({
    layer,
    order,
    section,
    intent,
    anchors: sectionById.get(section)?.anchors ?? [],
    must_include: mustInclude,
    avoid,
  });

  return [
    build(
      'quick',
      1,
      'headline_frame',
      `Mở thật nhanh bằng archetype ${archetype.label} và trục ${archetype.narrative_role.toLowerCase()}`,
      ['pattern', 'dominant_axis', 'primary_force'],
      ['generic spiritual filler', 'taxonomy label']
    ),
    build(
      'quick',
      2,
      'tension_point',
      'Chốt ngay điểm giằng co hoặc điều cần giữ nhịp trong ngày',
      ['conflict_grammar.summary', 'conflict_grammar.balancing_move'],
      ['prediction', 'vague encouragement']
    ),
    build(
      'standard',
      1,
      'main_current',
      'Giải thích lực mở đầu của ngày và lớp nền gần nhất',
      ['primary_force', 'supporting_forces[0]', 'central_dynamic'],
      ['jumping to life_path too early']
    ),
    build(
      'standard',
      2,
      'tension_point',
      `Gọi tên overcorrection và lý do nó xuất hiện theo grammar ${conflictGrammar.kind}`,
      ['tension_line', 'conflict_grammar.likely_overcorrection'],
      ['flattening the tension', 'making challenge the sole center']
    ),
    build(
      'standard',
      3,
      'applied_direction',
      'Đưa hướng vận dụng cho các quyết định trong ngày',
      ['reading_angles', 'conflict_grammar.balancing_move'],
      ['generic advice', 'too many life areas']
    ),
    build(
      'deep',
      1,
      'deepening_arc',
      `Mở lớp sâu theo archetype ${archetype.label} và vai trò tự sự của nó`,
      ['report_archetype.narrative_role', 'dominant_axis'],
      ['repeating quick layer verbatim']
    ),
    build(
      'deep',
      2,
      'deepening_arc',
      'Nối nhịp hôm nay với personal year, pinnacle và life path',
      ['personal_year', 'current_pinnacle', 'life_path'],
      ['letting life_path override personal_day']
    ),
    build(
      'deep',
      3,
      'tension_point',
      'Đào sâu bản chất giằng co và cách nó thường biểu hiện',
      ['conflict_grammar.kind', 'conflict_grammar.summary', 'friction_forces'],
      ['mystical abstraction without anchors']
    ),
    build(
      'deep',
      4,
      'closing_note',
      `Khép bằng tông ${archetype.closing_tone.toLowerCase()}`,
      ['conflict_grammar.balancing_move', 'report_archetype.closing_tone'],
      ['fortune telling', 'hard command']
    ),
  ];
}

function hasSharedDrive(a: number, b: number): boolean {
  return semanticFor(a).drive === semanticFor(b).drive;
}

function createMetaMethodology(
  numerology: NumerologyContext,
  primary: InterpretationForce,
  support: InterpretationForce,
  friction: InterpretationForce | null
): InterpretationBlueprint['meta_methodology'] {
  const essenceNumber = numerology.extended.transits.current.essence_number;
  const essenceAligned =
    hasSharedDrive(essenceNumber, primary.number) ||
    hasSharedDrive(essenceNumber, support.number);

  const strongestLoShuDigit = numerology.extended.lo_shu.dominant_digits[0]?.digit ?? null;
  const loShuAligned =
    strongestLoShuDigit !== null &&
    (strongestLoShuDigit === primary.number ||
      strongestLoShuDigit === support.number ||
      strongestLoShuDigit === numerology.life_path);

  const loShuMissingArrow = numerology.extended.lo_shu.missing_arrows[0];
  const loShuPresentArrow = numerology.extended.lo_shu.present_arrows[0];

  const currentNameShift =
    numerology.extended.name_variants.differs &&
    (numerology.extended.name_variants.chaldean_current.reduced !==
      numerology.extended.name_variants.chaldean_birth.reduced ||
      numerology.extended.name_variants.pythagorean_current.reduced !==
        numerology.extended.name_variants.pythagorean_birth.reduced);

  const supportingLenses: InterpretationBlueprint['meta_methodology']['supporting_lenses'] = [
    {
      id: 'essence_transits',
      label: 'Essence và transits',
      role: 'contextual',
      include_in_daily_report: essenceAligned,
      rationale: essenceAligned
        ? 'Essence hiện tại đang nói cùng hướng với nhịp chính của ngày, nên có thể dùng để nối ngày hôm nay với chu kỳ sống dài hơn.'
        : 'Essence hiện tại vẫn nên được giữ như bối cảnh chu kỳ, nhưng không nên chen lên trước nhịp ngày nếu nó không thật sự đồng âm.',
      contribution: essenceAligned
        ? `Lớp này giúp giải thích vì sao nhịp ${primary.label.toLowerCase()} hôm nay không phải một cảm hứng rời rạc, mà nằm trong dòng chảy ${semanticFor(essenceNumber).label.toLowerCase()} dài hơn.`
        : 'Nếu cần gọi tới, chỉ nên dùng nó như một lớp nền thời kỳ, không phải tiêu điểm của báo cáo hôm nay.',
      caution: 'Không để essence hoặc transit cướp vai personal day trong mở đầu; chỉ nên xuất hiện từ phần sâu trở đi.',
    },
    {
      id: 'lo_shu_birth_chart',
      label: 'Lo Shu và biểu đồ mũi tên',
      role: loShuAligned ? 'contextual' : 'tempering',
      include_in_daily_report: Boolean(loShuAligned || loShuMissingArrow),
      rationale: loShuAligned
        ? 'Biểu đồ ngày sinh đang có một tín hiệu bẩm sinh trùng hoặc cộng hưởng với lực chính của ngày.'
        : 'Lo Shu không cần lên sân khấu mỗi ngày; chỉ nên dùng khi một mũi tên thiếu hoặc trội thật sự làm rõ kiểu phản ứng quen thuộc của bạn.',
      contribution: loShuAligned
        ? `Có thể dùng để nói rằng nhịp hôm nay chạm vào một nét bẩm sinh quen thuộc, nhất là quanh số ${strongestLoShuDigit}.`
        : loShuMissingArrow
          ? `Có thể dùng như một lớp cản nền: ${loShuMissingArrow.label.toLowerCase()} khiến ngày hôm nay dễ chạm vào điểm yếu quen thuộc nếu bạn đi quá tay.`
          : loShuPresentArrow
            ? `Nếu cần thêm một nét tính cách nền, ${loShuPresentArrow.label.toLowerCase()} là tín hiệu tự nhiên nhất để gọi ra.`
            : 'Không có lý do đủ mạnh để đưa Lo Shu lên trong báo cáo hằng ngày.',
      caution: 'Lo Shu là lăng kính tính khí bẩm sinh; không được biến nó thành hệ chính của báo cáo ngày.',
    },
    {
      id: 'name_variants',
      label: 'Tên đang dùng và Chaldean',
      role: 'identity',
      include_in_daily_report: currentNameShift,
      rationale: currentNameShift
        ? 'Tên đang dùng đang tạo ra một lớp dịch chuyển về cách bạn tự trình diện hoặc được gọi trong đời sống hiện tại.'
        : 'Lớp tên nên ở nền, chỉ kéo vào khi sự khác biệt giữa tên khai sinh và tên đang dùng thực sự đáng kể.',
      contribution: currentNameShift
        ? numerology.extended.name_variants.dominant_shift
        : 'Nếu không có dịch chuyển đủ rõ, chỉ giữ lớp tên như một tab riêng để tham khảo sâu hơn.',
      caution: 'Không dùng Chaldean hoặc tên đang dùng để lật kết luận của Pythagorean daily stack; chỉ dùng như lăng kính bổ sung về bản sắc và cách tự biểu đạt.',
    },
  ];

  return {
    primary_system: {
      id: 'pythagorean_daily_stack',
      label: 'Pythagorean daily stack',
      rationale:
        'Daily report phải được neo vào personal day, personal month, challenge/pinnacle và personal year trước; đó là trục gần ngày nhất và ổn định nhất cho báo cáo hằng ngày.',
    },
    supporting_lenses: supportingLenses,
    synthesis_rule:
      'Bắt đầu từ daily stack của Pythagorean. Chỉ kéo thêm tối đa hai lăng kính hỗ trợ, và chỉ khi chúng thêm một lớp nghĩa mới thay vì nhắc lại điều daily stack đã nói.',
    dilution_guardrail: friction
      ? `Nếu một lăng kính mở rộng không giúp làm rõ lực chính ${primary.label.toLowerCase()}, nền ${support.label.toLowerCase()} hoặc ma sát ${friction.label.toLowerCase()}, thì không được đưa nó vào daily insight.`
      : `Nếu một lăng kính mở rộng không giúp làm rõ lực chính ${primary.label.toLowerCase()} hoặc nền ${support.label.toLowerCase()}, thì không được đưa nó vào daily insight.`,
  };
}

export function createInterpretationBlueprint(
  numerology: NumerologyContext
): InterpretationBlueprint {
  const primaryForce = createForce('personal_day', numerology.personal_day, 'trigger');
  const monthForce = createForce('personal_month', numerology.personal_month, 'field');
  const yearForce = createForce('personal_year', numerology.personal_year, 'tone');
  const pinnacleForce = createForce(
    'current_pinnacle',
    numerology.advanced.current_pinnacle.number,
    'support'
  );
  const challengeForce = createForce(
    'current_challenge',
    numerology.advanced.current_challenge.number,
    'friction'
  );
  const lifePathForce = createForce('life_path', numerology.life_path, 'baseline');
  const balanceForce = createForce('balance_number', numerology.advanced.balance_number, 'support');

  const hiddenPassionForces = numerology.advanced.hidden_passion_numbers
    .slice(0, 2)
    .map((number) => createForce('hidden_passion', number, 'support'));

  const karmicDebtForces = numerology.advanced.karmic_debt_numbers
    .slice(0, 1)
    .map((number) => createForce('karmic_debt', number, 'friction'));

  const karmicLessonForces = numerology.advanced.karmic_lessons
    .slice(0, 2)
    .map((number) => createForce('karmic_lesson', number, 'friction'));

  const hierarchy = [
    primaryForce,
    monthForce,
    challengeForce,
    pinnacleForce,
    yearForce,
    lifePathForce,
    balanceForce,
    ...hiddenPassionForces,
    ...karmicDebtForces,
    ...karmicLessonForces,
  ]
    .map((force) => ({
      source: force.source,
      number: force.number,
      weight: weightFor(force.source),
      role: force.role,
    }))
    .sort((a, b) => b.weight - a.weight);

  const supportingForces = [monthForce, pinnacleForce, yearForce, balanceForce, ...hiddenPassionForces]
    .filter((force, index, forces) => forces.findIndex((candidate) => candidate.source === force.source && candidate.number === force.number) === index)
    .slice(0, 4);

  const frictionForces = [challengeForce, ...karmicDebtForces, ...karmicLessonForces]
    .filter((force, index, forces) => forces.findIndex((candidate) => candidate.source === force.source && candidate.number === force.number) === index)
    .slice(0, 3);

  const firstSupport = supportingForces[0] ?? yearForce;
  const firstFriction = frictionForces[0] ?? null;

  const tensionLine =
    findTension(primaryForce.number, firstSupport.number) ??
    (firstFriction ? findTension(primaryForce.number, firstFriction.number) : null);

  const pattern = createPattern(primaryForce, firstSupport, firstFriction);
  const dominantAxis = createDominantAxis(primaryForce, firstSupport);
  const conflictGrammar = createConflictGrammar(pattern, primaryForce, firstSupport, firstFriction);
  const reportArchetype = createReportArchetype(pattern);
  const sectionPlan = createSectionPlan(primaryForce, firstSupport, firstFriction, pattern);
  const assemblyPlan = createAssemblyPlan(sectionPlan, reportArchetype, conflictGrammar);
  const metaMethodology = createMetaMethodology(numerology, primaryForce, firstSupport, firstFriction);

  const centralDynamic = `Trục chính của hôm nay là ${primaryForce.label.toLowerCase()} được đặt trong bối cảnh ${firstSupport.label.toLowerCase()}, theo pattern ${pattern.label} và archetype ${reportArchetype.label}.`;

  const reportFocuses = [
    `${primaryForce.label} là lực mở đầu của ngày`,
    `${firstSupport.label} là lớp nền hoặc điểm tựa`,
    ...(firstFriction ? [`${firstFriction.label} là điểm ma sát cần được gọi tên`] : []),
    `Đường đời ${numerology.life_path} giữ vai trò nền dài hạn`,
  ];

  const methodologyNotes = [
    'Ưu tiên đọc theo thứ tự: personal day -> personal month -> current challenge/pinnacle -> personal year -> life path.',
    'Nếu có ma sát giữa nhịp ngắn hạn và nhịp dài hạn, phải gọi tên sự giằng co đó thay vì gom thành một câu khái quát.',
    'Karmic lesson/debt chỉ nên được dùng như lớp nhấn hoặc lớp cản, không thay thế trục chính của ngày.',
    'Headline và theme phải là kết luận ngôn ngữ của pattern, không phải nhãn dịch thô từ tên lực.',
    'Pythagorean daily stack luôn là trục chính của báo cáo ngày.',
    'Essence/transits, Lo Shu và lớp tên chỉ được kéo vào khi chúng thêm góc nhìn thật sự mới cho ngày hôm đó.',
    'Không để lớp mở rộng làm loãng báo cáo: tối đa hai lăng kính hỗ trợ trong một bản đọc hằng ngày.',
  ];

  return {
    hierarchy,
    primary_force: primaryForce,
    supporting_forces: supportingForces,
    friction_forces: frictionForces,
    pattern,
    central_dynamic: centralDynamic,
    tension_line: tensionLine,
    dominant_axis: dominantAxis,
    conflict_grammar: conflictGrammar,
    report_archetype: reportArchetype,
    report_focuses: reportFocuses,
    reading_angles: createReadingAngles(primaryForce, firstSupport, firstFriction),
    section_plan: sectionPlan,
    assembly_plan: assemblyPlan,
    methodology_trace: {
      ruling_stack: hierarchy.slice(0, 5).map((force) => force.source),
      emphasis_order: [
        `Mở bằng ${primaryForce.label.toLowerCase()}`,
        `Đặt nền bằng ${firstSupport.label.toLowerCase()}`,
        ...(firstFriction ? [`Gọi tên lực cản ${firstFriction.label.toLowerCase()}`] : []),
        `Kết nối về nền dài hạn qua đường đời ${numerology.life_path}`,
      ],
      do_not_overweight: ['karmic_lesson', 'karmic_debt', 'hidden_passion'],
    },
    meta_methodology: metaMethodology,
    methodology_notes: methodologyNotes,
  };
}

export default { createInterpretationBlueprint };
