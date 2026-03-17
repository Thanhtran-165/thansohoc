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
    dashboard: 'Trang chủ',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    skipToContent: 'Đi đến nội dung chính',
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
      description: 'Hồ sơ của bạn đã được tạo. Hãy tạo nhận định đầu tiên cho ngày hôm nay.',
      button: 'Vào Trang chủ',
    },
    preferences: {
      settingUp: 'Đang thiết lập...',
    },
  },

  // Dashboard screen
  dashboard: {
    title: 'Trang chủ',
    insightSubtitle: 'Nhận định thần số học của bạn hôm nay',
    todaysInsight: 'Nhận định hôm nay',
    quickJournal: 'Nhật ký nhanh',
    yourNumbers: 'Các con số của bạn',
    noInsight: {
      title: 'Chưa có nhận định',
      description: 'Nhận định hàng ngày sẽ hiển thị ở đây sau khi được tạo.',
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
  },

  // Profile screen
  profile: {
    title: 'Hồ sơ',
    subtitle: 'Quản lý thông tin cá nhân và tùy chọn',
    preferences: 'Tùy chọn',
    insightStyle: 'Phong cách nhận định',
    insightLength: 'Độ dài nhận định',
    language: 'Ngôn ngữ',
    languageVi: 'Tiếng Việt',
    languageEn: 'Tiếng Anh',
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
      label: 'Nhắc nhở nhật ký buổi tối',
      description: 'Nhận lời nhắc viết nhật ký',
    },
    eveningTime: {
      label: 'Giờ buổi tối',
      description: 'Thời gian nhận lời nhắc nhật ký',
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
      happy: 'vui vẻ',
      calm: 'bình yên',
      excited: 'hào hứng',
      grateful: 'biết ơn',
      anxious: 'lo âu',
      tired: 'mệt mỏi',
      stressed: 'căng thẳng',
      motivated: 'có động lực',
      reflective: 'chiêm nghiệm',
      hopeful: 'hy vọng',
      sad: 'buồn',
      angry: 'tức giận',
    },
  },

  // Feedback
  feedback: {
    rateInsight: 'Đánh giá nhận định này',
    mostUsefulClaim: 'Loại nhận định nào hữu ích nhất?',
    tags: 'Thẻ đánh giá',
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
    calculatedClaims: 'Các nhận định được tính',
    interpretationBasis: 'Cơ sở diễn giải',
    confidenceBreakdown: 'Phân tích độ tin cậy',
    // InsightCard layers
    layers: {
      quick: 'Nhanh',
      standard: 'Tiêu chuẩn',
      deep: 'Sâu',
      deepOnDemand: '(theo yêu cầu)',
    },
    cached: 'Đã lưu',
    personalDay: 'Ngày cá nhân',
    questionsToExplore: 'Câu hỏi để khám phá',
    overallConfidence: 'Độ tin cậy tổng thể',
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
    modelVersion: 'Mô hình v',
    promptVersion: 'Prompt v',
    dataQuality: 'Chất lượng dữ liệu',
    interpretationConfidence: 'Độ tin cậy diễn giải',
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
