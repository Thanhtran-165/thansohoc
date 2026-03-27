/**
 * Localization Messages
 * Vietnamese-first UI strings for Numerology Intelligence MVP
 *
 * This file contains all user-facing text in Vietnamese.
 * Structure is kept simple for MVP - single language (Vietnamese).
 */

export const messages = {
  // App-wide
  app: {
    name: 'Thần Số Học',
    tagline: 'Nhận định cá nhân hóa mỗi ngày',
    version: 'Phiên bản 0.1.0 (MVP)',
  },

  // Navigation
  nav: {
    dashboard: 'Báo cáo hôm nay',
    guidance: 'Dùng ngay',
    reading: 'Đọc sâu',
    compass: 'La bàn ngày',
    continuity: 'Mạch riêng',
    cycles: 'Chu kỳ sâu',
    birthChart: 'Biểu đồ ngày sinh',
    nameLayers: 'Lớp tên',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    skipToContent: 'Đi đến nội dung chính',
    openMenu: 'Mở menu điều hướng',
    closeMenu: 'Đóng menu điều hướng',
  },

  // Common actions
  actions: {
    save: 'Lưu',
    cancel: 'Hủy',
    edit: 'Sửa',
    delete: 'Xóa',
    export: 'Xuất',
    reset: 'Đặt lại',
    continue: 'Tiếp tục',
    getStarted: 'Bắt đầu',
    goToDashboard: 'Vào Trang chủ',
    close: 'Đóng',
    show: 'Hiện',
    hide: 'Ẩn',
    testConnection: 'Kiểm tra kết nối',
    testing: 'Đang kiểm tra...',
    saveSettings: 'Lưu cài đặt',
    resetToDefault: 'Khôi phục mặc định',
    removeApiKey: 'Xóa khóa API',
  },

  // Greetings
  greeting: {
    morning: 'Chào buổi sáng',
    afternoon: 'Chào buổi chiều',
    evening: 'Chào buổi tối',
    default: 'Xin chào',
  },

  // Onboarding screen
  onboarding: {
    steps: {
      welcome: 'Chào mừng',
      profile: 'Hồ sơ',
      preferences: 'Tùy chọn',
      complete: 'Hoàn tất',
    },
    welcome: {
      title: 'Chào mừng bạn đến với Thần Số Học',
      description: 'Khám phá nhận định hàng ngày dựa trên thần số học cá nhân của bạn. Hãy thiết lập hồ sơ để bắt đầu.',
      button: 'Bắt đầu',
    },
    profile: {
      title: 'Hồ sơ của bạn',
      description: 'Nhập tên và ngày sinh để nhận nhận định thần số học cá nhân hóa.',
      fullName: 'Họ và tên',
      fullNamePlaceholder: 'Nhập họ và tên của bạn',
      dateOfBirth: 'Ngày sinh',
    },
    preferences: {
      title: 'Tùy chọn của bạn',
      description: 'Chọn cách bạn muốn nhận các nhận định.',
      insightStyle: 'Phong cách nhận định',
      insightLength: 'Độ dài nhận định',
      styles: {
        gentle: { label: 'Nhẹ nhàng', description: 'Ngôn ngữ nhẹ nhàng, hỗ trợ' },
        direct: { label: 'Trực tiếp', description: 'Rõ ràng, đi thẳng vào vấn đề' },
        practical: { label: 'Thực tế', description: 'Hành động cụ thể, thực dụng' },
        spiritual: { label: 'Tâm linh', description: 'Sâu sắc, mang tính chiêm nghiệm' },
      },
      lengths: {
        brief: { label: 'Ngắn gọn', description: 'Đọc nhanh mỗi ngày' },
        detailed: { label: 'Chi tiết', description: 'Phân tích chuyên sâu' },
      },
      button: 'Hoàn tất thiết lập',
      settingUp: 'Đang thiết lập...',
    },
    complete: {
      title: 'Đã hoàn tất!',
      description: 'Hồ sơ của bạn đã sẵn sàng. Bạn có thể xem báo cáo đầu tiên của hôm nay.',
      button: 'Vào Trang chủ',
    },
  },

  // Dashboard screen
  dashboard: {
    title: 'Báo cáo hôm nay',
    insightSubtitle: 'Phần luận giải dành cho hôm nay',
    todaysInsight: 'Luận giải hôm nay',
    quickJournal: 'Ghi chú riêng',
    yourNumbers: 'Các con số của bạn',
    dailyReport: 'Báo cáo thần số học hôm nay',
    executiveSummary: 'Điểm chính hôm nay',
    detailedReport: 'Phần luận giải',
    reflectionPrompt: 'Nếu muốn, bạn có thể lưu lại một ghi chú riêng sau khi đọc xong. Đây chỉ là bước phụ, không ảnh hưởng đến báo cáo ngày mai.',
    generatedForToday: 'Điểm chính cho hôm nay',
    readingModes: 'Chế độ đọc',
    reportGuidance: 'Điểm chính hôm nay',
    noInsight: {
      title: 'Chưa có báo cáo',
      description: 'Báo cáo hôm nay sẽ hiện ở đây sau khi được tạo xong.',
    },
    journal: {
      mood: 'Tâm trạng',
      energy: 'Năng lượng',
      editEntry: 'Sửa nhật ký',
    },
    numerology: {
      personalDay: 'Ngày cá nhân',
      personalMonth: 'Tháng cá nhân',
      personalYear: 'Năm cá nhân',
    },
    practice: {
      streak: 'Chuỗi ngày có báo cáo',
      weeklyCompletion: 'Tần suất 7 ngày',
      dominantEmotion: 'Chủ đề nổi bật',
    },
  },

  continuity: {
    title: 'Mạch riêng của bạn',
    subtitle: 'Đặt báo cáo hằng ngày vào nhịp 30 ngày, tuần này và tháng này để câu chuyện không bị đứt đoạn.',
    empty: 'Chưa có đủ dữ liệu để tạo mạch riêng. Hãy mở thêm vài báo cáo để phần này rõ hơn.',
    cards: {
      continuity: 'Mạch 30 ngày',
      streak: 'Chuỗi hiện tại',
      opened7: 'Đã mở 30 ngày',
      shift: 'Nhịp đang đổi',
      recurring: 'Chủ đề trở lại',
      recentNumbers: 'Dòng nhịp gần đây',
      strongest: 'Mạch rõ nhất',
      weekly: 'Tuần này',
      monthly: 'Tháng này',
    },
  },

  guidance: {
    title: 'Dùng ngay',
    subtitle: 'Những gợi ý có thể áp dụng trong chính ngày hôm nay.',
  },

  reading: {
    title: 'Đọc sâu',
    subtitle: 'Đi vào phần luận giải sâu mà không bị chen bởi các phần phụ.',
  },

  compass: {
    title: 'La bàn ngày',
    subtitle: 'Tách riêng phần lực kéo và các con số để bạn nhìn cấu trúc của ngày mà không làm nặng phần đọc.',
  },

  cycles: {
    title: 'Chu kỳ sâu',
    subtitle: 'Theo dõi transit và essence như một lớp chu kỳ dài hơn đang đi qua tên và đời sống của bạn.',
  },

  birthChart: {
    title: 'Biểu đồ ngày sinh',
    subtitle: 'Đọc ngày sinh theo Lo Shu để thấy các mũi tên, khoảng trống và cách các con số phân bố trong nền bẩm sinh.',
  },

  nameLayers: {
    title: 'Lớp tên',
    subtitle: 'So sánh tên khai sinh, tên đang dùng và lớp đọc Chaldean để xem cách âm tên đang tạo sắc thái khác nhau.',
  },

  // Profile screen
  profile: {
    title: 'Hồ sơ',
    subtitle: 'Quản lý thông tin cá nhân và tùy chọn',
    personalInfo: 'Thông tin cá nhân',
    preferences: 'Tùy chọn',
    insightStyle: 'Phong cách nhận định',
    insightLength: 'Độ dài nhận định',
    language: 'Ngôn ngữ',
    languageVi: 'Tiếng Việt',
    languageEn: 'Tiếng Anh',
    fullName: 'Họ và tên',
    fullNamePlaceholder: 'Nhập họ và tên của bạn',
    currentName: 'Tên đang dùng',
    currentNamePlaceholder: 'Nếu khác tên khai sinh, nhập tên bạn đang dùng hằng ngày',
    dateOfBirth: 'Ngày sinh',
    born: 'Sinh ngày',
    coreNumbers: 'Các con số cốt lõi',
    coreNumberDescriptions: {
      lifePath: 'Mục đích cuộc đời',
      destiny: 'Mục tiêu tối thượng',
      soulUrge: 'Khao khát nội tâm',
      personality: 'Vẻ bề ngoài',
      birthday: 'Món quà đặc biệt',
      maturity: 'Con đường trưởng thành',
    },
    coreNumbersLabel: {
      lifePath: 'Đường Đời',
      destiny: 'Số Mệnh',
      soulUrge: 'Linh Hồn',
      personality: 'Nhân Cách',
      birthday: 'Ngày Sinh',
      maturity: 'Trưởng Thành',
    },
    masterNumber: 'Master',
    noProfile: 'Không tìm thấy hồ sơ. Vui lòng hoàn tất quá trình thiết lập.',
    completeProfile: 'Hoàn tất hồ sơ để xem các con số cốt lõi.',
    saveChanges: 'Lưu thay đổi',
    editPersonalInfo: 'Sửa thông tin cá nhân',
    editPreferences: 'Sửa tùy chọn',
    recalcWarning: 'Lưu ý: Thay đổi tên hoặc ngày sinh sẽ tính lại các con số thần số học của bạn.',
    saved: 'Đã lưu thay đổi!',
    saveError: 'Không thể lưu thay đổi. Vui lòng thử lại.',
  },

  // Settings screen
  settings: {
    title: 'Cài đặt',
    subtitle: 'Thiết lập tùy chọn ứng dụng và thông báo',
    notifications: 'Thông báo',
    application: 'Ứng dụng',
    dataPrivacy: 'Dữ liệu & Quyền riêng tư',
    morningInsight: {
      label: 'Nhận định buổi sáng',
      description: 'Nhận thông báo với nhận định hàng ngày',
    },
    morningTime: {
      label: 'Giờ buổi sáng',
      description: 'Thời gian nhận nhận định buổi sáng',
    },
    eveningJournal: {
      label: 'Nhắc xem lại buổi tối',
      description: 'Nhận lời nhắc mở lại báo cáo trước khi khép ngày',
    },
    eveningTime: {
      label: 'Giờ buổi tối',
      description: 'Thời gian nhận lời nhắc xem lại báo cáo',
    },
    sound: {
      label: 'Âm thanh',
      description: 'Phát âm thanh khi có thông báo',
    },
    quietHours: {
      label: 'Giờ yên tĩnh',
      description: 'Tắt thông báo trong khoảng thời gian nhất định',
    },
    launchOnStartup: {
      label: 'Khởi động cùng máy',
      description: 'Tự động mở ứng dụng khi đăng nhập',
    },
    storageMode: {
      label: 'Chế độ lưu trữ',
      description: 'Tất cả dữ liệu được lưu cục bộ trên thiết bị của bạn',
      value: 'Chỉ cục bộ',
    },
    exportData: {
      label: 'Xuất dữ liệu',
      description: 'Tải xuống tất cả dữ liệu của bạn dưới dạng JSON',
    },
    deleteData: {
      label: 'Xóa tất cả dữ liệu',
      description: 'Xóa vĩnh viễn tất cả dữ liệu của bạn',
    },
    howItWorks: {
      title: 'Cách app hoạt động',
      subtitle: 'Giải thích ngắn gọn về logic 1 chiều của sản phẩm hiện tại.',
      steps: {
        setup: 'Thiết lập hồ sơ một lần với họ tên, ngày sinh và phong cách đọc.',
        generate: 'Mỗi ngày app tự tạo báo cáo thần số học tương ứng với ngày hiện tại.',
        read: 'Bạn mở app để đọc, phản hồi nhẹ nếu muốn, và xem lại trong thư viện báo cáo.',
      },
    },
  },

  // LLM Settings
  llmSettings: {
    title: 'Cài đặt AI / LLM',
    subtitle: 'Cấu hình AI tạo nhận định hàng ngày',
    status: {
      notConfigured: {
        text: 'Chưa cấu hình',
        subtext: 'Nhập khóa API bên dưới để bật nhận định AI',
      },
      savedNotTested: {
        text: 'Đã lưu (chưa kiểm tra)',
        subtext: 'Nhấn "Kiểm tra kết nối" để xác minh khóa API',
      },
      connectionSuccessful: {
        text: 'Kết nối thành công',
        subtext: 'Khóa API hợp lệ và sẵn sàng sử dụng',
      },
      lastTestFailed: {
        text: 'Lần kiểm tra trước thất bại',
        subtext: 'Kiểm tra khóa API và thử lại',
      },
    },
    fields: {
      apiKey: {
        label: 'Khóa API',
        description: 'Khóa API DeepSeek của bạn. Tạo tại',
        placeholder: 'sk-...',
      },
      model: {
        label: 'Mô hình',
        description: 'Mô hình AI được sử dụng để tạo nhận định',
        options: {
          deepseekReasoner: 'DeepSeek Reasoner (Khuyến nghị)',
          deepseekChat: 'DeepSeek Chat',
        },
      },
      temperature: {
        label: 'Độ sáng tạo',
        description: 'Thấp = ổn định, dự đoán được. Cao = sáng tạo, đa dạng.',
        low: 'Ổn định (0)',
        high: 'Sáng tạo (2)',
      },
    },
    validation: {
      apiKeyRequired: 'Vui lòng nhập khóa API',
      apiKeyFormat: 'Khóa API phải bắt đầu bằng "sk-"',
      temperatureRange: 'Độ sáng tạo phải từ 0 đến 2',
      maxTokensRange: 'Số token tối đa phải từ 100 đến 8000',
    },
    testMessages: {
      enterApiKey: 'Vui lòng nhập khóa API trước',
      testing: 'Đang kiểm tra...',
      connectionFailed: 'Kết nối thất bại',
      invalidApiKey: 'Khóa API không hợp lệ',
      modelNotAvailable: 'Mô hình không khả dụng',
      timeout: 'Kết nối quá hạn',
      networkError: 'Lỗi mạng - kiểm tra kết nối internet',
      rateLimit: 'Đã vượt giới hạn - vui lòng đợi và thử lại',
    },
    help: {
      title: 'Cần trợ giúp?',
      gettingKey: 'Lấy khóa API:',
      gettingKeySteps: [
        'Truy cập platform.deepseek.com',
        'Tạo tài khoản hoặc đăng nhập',
        'Vào phần API Keys',
        'Tạo khóa API mới và dán vào đây',
      ],
      troubleshooting: 'Khắc phục sự cố:',
      troubleshootingSteps: [
        'Đảm bảo khóa API bắt đầu bằng "sk-"',
        'Kiểm tra xem bạn còn credit API khả dụng',
        'Xác minh kết nối internet của bạn',
      ],
    },
  },

  // Journal
  journal: {
    quickTitle: 'Nhật ký nhanh',
    fullTitle: 'Nhật ký chi tiết',
    mood: {
      label: 'Tâm trạng',
      question: 'Bạn cảm thấy thế nào? (1-10)',
      low: 'Thấp',
      high: 'Cao',
    },
    energy: {
      label: 'Năng lượng',
      question: 'Mức năng lượng (1-10)',
      low: 'Thấp',
      high: 'Cao',
    },
    emotions: {
      label: 'Cảm xúc (chọn tất cả phù hợp)',
    },
    reflection: {
      label: 'Suy ngẫm',
      placeholder: 'Viết suy nghĩ của bạn...',
    },
    saving: 'Đang lưu...',
    save: 'Lưu',
    update: 'Cập nhật',
    edit: 'Sửa nhật ký',
    error: 'Lỗi khi lưu nhật ký',
    tags: {
      peaceful: 'bình yên',
      anxious: 'lo âu',
      grateful: 'biết ơn',
      frustrated: 'bực bội',
      hopeful: 'hy vọng',
      overwhelmed: 'quá tải',
      content: 'hài lòng',
      restless: 'bồn chồn',
      inspired: 'truyền cảm hứng',
      tired: 'mệt mỏi',
      joyful: 'vui vẻ',
      confused: 'bối rối',
      confident: 'tự tin',
      uncertain: 'lưỡng lự',
      loved: 'được yêu',
      lonely: 'cô đơn',
    },
  },

  // Feedback
  feedback: {
    rateInsight: 'Đánh giá nhận định này',
    mostUsefulClaim: 'Loại nhận định nào hữu ích nhất?',
    tagLabels: 'Thẻ đánh giá',
    additionalFeedback: 'Phản hồi thêm (tùy chọn)',
    placeholder: 'Chia sẻ thêm suy nghĩ của bạn...',
    submitting: 'Đang gửi...',
    submit: 'Gửi đánh giá',
    thanks: 'Cảm ơn phản hồi của bạn!',
    tags: {
      helpful: 'hữu ích',
      inspiring: 'truyền cảm hứng',
      accurate: 'chính xác',
      confusing: 'khó hiểu',
      tooVague: 'quá chung chung',
      tooDetailed: 'quá chi tiết',
    },
  },

  // Claim types
  claimTypes: {
    calculated: 'Tính toán',
    interpreted: 'Diễn giải',
    exploratory: 'Gợi mở',
    confidence: 'độ tin cậy',
  },

  // Insight
  insight: {
    whyThis: 'Tại sao nhận định này?',
    dataSources: 'Nguồn dữ liệu',
    calculatedClaims: 'Phần dựa trên các con số',
    interpretationBasis: 'Cách luận giải',
    confidenceBreakdown: 'Mức độ chắc chắn',
    // InsightCard layers
    layers: {
      quick: 'Nhanh',
      standard: 'Tiêu chuẩn',
      deep: 'Sâu',
      deepOnDemand: '(theo yêu cầu)',
    },
    cached: 'Đã lưu',
    personalDay: 'Ngày cá nhân',
    overallConfidence: 'Mức độ chắc chắn',
    feedbackReceived: 'Đã nhận phản hồi',
    // WhyThisInsightModal
    whyThisTitle: 'Tại sao nhận định này?',
    noExplanation: 'Không có giải thích cho nhận định này.',
    failedToLoad: 'Không thể tải giải thích',
    explanationNotAvailable: 'Dữ liệu giải thích không khả dụng cho nhận định này.',
    explanationNotAvailableDetail: 'Điều này có thể xảy ra với nhận định dự phòng hoặc nhận định được tạo trước khi tính năng giải thích được thêm.',
    profileCompleteness: 'Độ hoàn thiện hồ sơ',
    available: 'Khả dụng',
    inputs: 'Đầu vào',
    style: 'Phong cách',
    context: 'Bối cảnh',
    dominantAxis: 'Trục đọc',
    pattern: 'Pattern',
    reportArchetype: 'Archetype',
    conflictGrammar: 'Dạng giằng co',
    hierarchy: 'Thứ bậc ảnh hưởng',
    reportStructure: 'Khung báo cáo',
    auditTrail: 'Dấu vết dựng báo cáo',
    modelVersion: 'Mô hình v',
    promptVersion: 'Prompt v',
    dataQuality: 'Chất lượng dữ liệu',
    interpretationConfidence: 'Độ chắc của phần diễn giải',
    overall: 'Tổng thể',
    summary: 'Tóm tắt',
  },

  // Error states
  errors: {
    general: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử khởi động lại ứng dụng.',
    restartApp: 'Khởi động lại ứng dụng',
    loadProfile: 'Không thể tải hồ sơ',
    saveProfile: 'Không thể lưu hồ sơ',
    loadSettings: 'Không thể tải cài đặt',
    loadInsight: 'Không thể tải nhận định',
    loadJournal: 'Không thể tải nhật ký',
  },

  // Empty states
  empty: {
    noData: 'Không có dữ liệu',
    loading: 'Đang tải...',
  },
};

export type Messages = typeof messages;
export default messages;
