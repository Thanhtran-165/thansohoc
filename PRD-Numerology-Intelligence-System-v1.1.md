# Product Requirements Document (PRD)
# Personal Numerology Intelligence System

**Version:** 1.1
**Date:** 2024
**Status:** Revised Draft
**Previous Version:** 1.0

---

# Mục lục

1. [Tổng quan Sản phẩm](#1-tổng-quan-sản-phẩm)
2. [Định vị & Triết lý](#2-định-vị--triết-lý)
3. [Jobs-to-be-Done & Personas](#3-jobs-to-be-done--personas)
4. [User Journeys](#4-user-journeys)
5. [Feature Specifications](#5-feature-specifications)
6. [Onboarding System](#6-onboarding-system)
7. [Trust Architecture](#7-trust-architecture)
8. [Privacy & Data Control Layer](#8-privacy--data-control-layer)
9. [Personalization Optimization Layer](#9-personalization-optimization-layer)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Technical Constraints](#11-technical-constraints)
12. [Success Metrics](#12-success-metrics)
13. [Roadmap](#13-roadmap)
14. [Failure Modes & Mitigations](#14-failure-modes--mitigations)
15. [Human Review Rubric](#15-human-review-rubric)
16. [Insight Safety Policy](#16-insight-safety-policy)
17. [Notifications, Delivery & User Preferences](#17-notifications-delivery--user-preferences)

---

# 1. Tổng quan Sản phẩm

## 1.1. Tên sản phẩm

**Tentative:** NumerologyOS / SoulCycles / PersonalNumerology.ai

*(Tên chính thức sẽ được quyết định sau)*

## 1.2. Product Thesis

> **"Một hệ thống đồng hành cá nhân giúp người dùng diễn giải chu kỳ thần số học của mình bằng dữ liệu sống thực tế, thay vì chỉ đọc diễn giải tĩnh."**

Sản phẩm này không phải là công cụ bói toán. Nó là một **interpretive companion** — hệ thống giúp người dùng:
- Hiểu chu kỳ năng lượng cá nhân theo thời gian
- Ghi nhận trải nghiệm thực tế và so sánh với insight
- Phát hiện pattern trong cuộc sống của chính mình
- Xây dựng thực hành self-reflection bền vững

## 1.3. Core Promise

**Một câu định nghĩa sản phẩm:**

> "Biến thần số học từ nội dung tĩnh thành hệ thống phản tư cá nhân hóa theo thời gian."

**Mọi feature phải trả lời 3 câu hỏi:**

1. Nó có làm daily insight **đúng với user hơn** không?
2. Nó có làm self-reflection **sâu hơn** không?
3. Nó có tăng **retention** không?

Nếu không, để phase sau.

## 1.4. MVP Thesis

> "Phiên bản đầu không cần 'thông minh toàn diện'; nó chỉ cần tạo ra một daily insight đủ cá nhân hóa để khiến người dùng muốn quay lại và journal tiếp."

## 1.5. Vấn đề giải quyết

| Vấn đề | Giải pháp |
|--------|-----------|
| Thần số học thường được trình bày chung chung, không cá nhân hóa | Insight được tailored theo profile và history của từng user |
| Người dùng không biết insight nào đáng tin | Trust architecture đa tầng với claim types rõ ràng |
| Không có công cụ theo dõi pattern theo thời gian | Journal + Pattern analytics + Weekly/Monthly reports |
| Dữ liệu cá nhân nhạy cảm không được bảo vệ | Privacy-first design với local-first option |
| AI insight không học từ feedback | Adaptive personalization layer |

## 1.6. Mục tiêu sản phẩm

### Mục tiêu chính

Tạo trải nghiệm mỗi ngày mà người dùng cảm thấy:

1. **Insight hôm nay "đúng với mình"** — không chung chung
2. **Hệ thống nhớ mình là ai** — context được giữ qua thời gian
3. **Lời khuyên có thể áp dụng** — practical, không chỉ lý thuyết
4. **Ranh giới rõ ràng** — biết đâu là calculated, đâu là interpreted
5. **Càng dùng lâu, chất lượng càng tăng** — learning system

### Mục tiêu second-order

- Tạo habit journaling và self-reflection
- Giúp user hiểu chu kỳ năng lượng cá nhân
- Xây dựng library insight cá nhân có giá trị dài hạn

---

# 2. Định vị & Triết lý

## 2.1. Đây KHÔNG phải (Non-goals)

### Sản phẩm không phải

- App tạo quote thần số học
- App bói toán theo ngày
- App chỉ gọi API rồi in ra vài câu động viên
- App dự đoán tương lai

### Sản phẩm không làm

| Non-goal | Lý do |
|----------|-------|
| **Không điều trị tâm lý** | Đây không phải therapeutic tool |
| **Không đưa lời khuyên y khoa/tài chính/pháp lý** | Vượt quá scope và trách nhiệm |
| **Không dự đoán tương lai** | Không có evidential basis |
| **Không thay thế therapist/coach/spiritual mentor** | Sản phẩm là companion, không phải chuyên gia |
| **Không cam kết accuracy tuyệt đối** | Insight mang tính interpretive, không predictive |

## 2.2. Đây LÀ

- Hệ thống phân tích thần số học cá nhân hóa theo lịch sử sống
- Công cụ journaling + self-observation + cycle interpretation
- AI companion cho phát triển bản thân theo chu kỳ
- Personal Intelligence System với transparency về nguồn gốc insight

## 2.3. Triết lý thiết kế

| Nguyên tắc | Ứng dụng |
|------------|----------|
| **Quality over brevity** | Insight dài, giàu context, không cắt ngắn |
| **Memory creates value** | Lưu và sử dụng history để cá nhân hóa |
| **Transparency builds trust** | Giải thích vì sao insight được đưa ra, tách bạch claim types |
| **Privacy by default** | Local-first, user control data |
| **Learning system** | Adaptive từ feedback |
| **Epistemic humility** | Không khẳng định tuyệt đối, giữ framing mở |

## 2.4. Ngôn ngữ sản phẩm

### Ngôn ngữ ĐÚNG

| Dùng | Thay vì |
|------|---------|
| Interpretive guidance | Prediction |
| Pattern-based reflection | Forecast |
| Cycle-aware planning | Optimal timing |
| Suggested timing | Best timing |
| Observed tendency | Will happen |
| Explores / Invites / Suggests | Predicts / Determines / Dictates |

### Nguyên tắc ngôn ngữ

- **Không:** huyền bí, sáo rỗng, cam kết tuyệt đối, định mệnh
- **Có:** practical, reflective, grounded, respectful of uncertainty, exploratory

### Ví dụ rewrite

| ❌ Tránh | ✅ Dùng |
|----------|---------|
| "Hôm nay bạn sẽ gặp may mắn" | "Hôm nay có năng lượng hỗ trợ cho các hoạt động giao tiếp" |
| "Đây là ngày tốt nhất để ra quyết định" | "Đây có thể là thời điểm phù hợp để xem xét các lựa chọn" |
| "Năng lượng hôm nay预言..." | "Dựa trên chu kỳ hiện tại, bạn có thể cảm nhận..." |

## 2.5. Trust Thesis

> "Mọi insight phải tách bạch giữa phần được tính toán, phần được quan sát từ lịch sử, và phần là diễn giải gợi ý."

Đây là nền tảng của Trust Architecture (xem §7).

---

---

# 3. Jobs-to-be-Done & Personas

## 3.1. Jobs-to-be-Done Framework

Sản phẩm được xây dựng xung quanh **4 jobs chính** mà user thuê app thực hiện:

### JTBD Matrix

| JTBD | Khi nào xảy ra | Kết quả user muốn | Feature phục vụ |
|------|----------------|-------------------|-----------------|
| **JTBD 1: Daily Orientation** | Buổi sáng trước khi bắt đầu ngày | Một định hướng ngắn, hữu ích, không generic | Daily Insight (3 layers) |
| **JTBD 2: Experience Recording** | Cuối ngày / khi có sự kiện đáng nhớ | Ghi lại trải nghiệm nhanh, không phức tạp | Quick Journal |
| **JTBD 3: Pattern Discovery** | Cuối tuần / cuối tháng / khi tò mò | Tìm ra pattern thực sự đáng tin, có evidence | Weekly/Monthly Reports |
| **JTBD 4: Self-Observation Over Time** | Sau 2-4 tuần sử dụng liên tục | Thấy app càng dùng càng hiểu mình | Memory Engine, Pattern Detection |

### Chi tiết từng JTBD

#### JTBD 1: Daily Orientation

```
Trigger: User mở mắt, bắt đầu ngày mới
Current behavior: Lướt social media, không có định hướng
Desired outcome: Có một "compass" nhẹ nhàng cho ngày

Success criteria:
- User đọc insight trong vòng 30 phút sau khi wake up
- Insight có ít nhất 1 điểm specific to user (không generic)
- User cảm thấy "có gì đó để mang theo vào ngày"
```

#### JTBD 2: Experience Recording

```
Trigger: Cuối ngày, hoặc khi có event đáng nhớ
Current behavior: Không ghi lại gì, hoặc note rời rạc
Desired outcome: Ghi lại nhanh, không tốn nhiều effort

Success criteria:
- Entry completion time < 30 giây cho quick mode
- Entry có đủ data để phân tích pattern sau này
- User không cảm thấy burden
```

#### JTBD 3: Pattern Discovery

```
Trigger: Cuối tuần, cuối tháng, hoặc khi tò mò về chu kỳ
Current behavior: Không có công cụ, phải tự nhớ
Desired outcome: Thấy pattern rõ ràng, có evidence

Success criteria:
- Pattern có confidence score và evidence count
- User hiểu vì sao pattern được phát hiện
- Pattern actionable (có thể áp dụng)
```

#### JTBD 4: Self-Observation Over Time

```
Trigger: Sau 2-4 tuần sử dụng
Current behavior: Các app khác generic theo thời gian
Desired outcome: App càng dùng càng "biết mình"

Success criteria:
- Insight personal relevance tăng theo thời gian
- User có library insights cá nhân
- User cảm thấy relationship với app deepen
```

## 3.2. Primary Personas

### Persona 1: "The Conscious Seeker"

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tuổi** | 28-45 |
| **Nghề nghiệp** | Professional, knowledge worker, creative |
| **Đặc điểm** | Đã có awareness về self-development, quan tâm đến công cụ hiểu bản thân |
| **Primary JTBD** | Daily Orientation + Self-Observation |
| **Nhu cầu** | Muốn công cụ có chiều sâu, không superficial |
| **Pain point** | Đã thử nhiều app nhưng đều generic, không nhớ context |
| **Expectation** | Sẵn sàng đầu tư thời gian setup nếu giá trị trả về xứng đáng |
| **Key metric** | 30-day retention, insight helpfulness rating |

### Persona 2: "The Cycle Tracker"

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tuổi** | 30-50 |
| **Nghề nghiệp** | Entrepreneur, freelancer, người quản lý năng lượng cá nhân |
| **Đặc điểm** | Nhận ra năng lượng có chu kỳ, muốn tận dụng |
| **Primary JTBD** | Pattern Discovery + Daily Orientation |
| **Nhu cầu** | Pattern analytics, cycle-aware suggestions |
| **Pain point** | Không có công cụ tracking chu kỳ cá nhân |
| **Expectation** | Evidence-based, actionable insights |
| **Key metric** | Pattern detection engagement, weekly report open rate |

### Persona 3: "The Journal Enthusiast"

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tuổi** | 25-40 |
| **Nghề nghiệp** | Multi-disciplinary, growth-oriented |
| **Đặc điểm** | Đã có habit journaling, muốn thêm dimension phân tích |
| **Primary JTBD** | Experience Recording + Pattern Discovery |
| **Nhu cầu** | Integration giữa numerology và journal practice |
| **Pain point** | Journal rời rạc, không có analysis layer |
| **Expectation** | Beautiful UX, seamless workflow |
| **Key metric** | Journal completion rate, streak length |

## 3.3. User không phải target

- Người tìm quick fortune-telling
- Người không sẵn sàng input data cá nhân
- Người muốn app "dự đoán" tương lai
- Người không quan tâm self-reflection

## 3.4. Persona-JTBD Mapping

| Persona | JTBD 1 (Daily) | JTBD 2 (Record) | JTBD 3 (Pattern) | JTBD 4 (Long-term) |
|---------|----------------|-----------------|------------------|-------------------|
| Conscious Seeker | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Cycle Tracker | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Journal Enthusiast | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

# 4. User Journeys

## 4.1. First-time User Journey (Day 0-7)

### Day 0: First Launch

```
┌─────────────────────────────────────────────────────────────────┐
│                         DAY 0 - FIRST LAUNCH                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Welcome screen - Giới thiệu app concept                      │
│     - Product thesis ngắn gọn                                    │
│     - "Đây không phải app bói toán"                              │
│                                                                  │
│  2. Quick Onboarding (3-5 min)                                   │
│     - Tên, ngày sinh                                             │
│     - Style preference (gentle / direct / practical / spiritual) │
│     - Privacy mode selection                                     │
│                                                                  │
│  3. First numerology profile generated                           │
│     - Show với explainability                                    │
│                                                                  │
│  4. First daily insight created (light version)                  │
│     - Marked as "Calculated" claim type                          │
│     - Lower confidence (new user)                                │
│                                                                  │
│  5. Prompt to set notification time                              │
│                                                                  │
│  6. Suggest deep onboarding for later                            │
│     - "Bạn có thể hoàn thiện profile dần trong 7 ngày tới"       │
└─────────────────────────────────────────────────────────────────┘
```

### Day 1-7: Learning Phase

```
┌─────────────────────────────────────────────────────────────────┐
│                       DAY 1-7 - LEARNING PHASE                   │
├─────────────────────────────────────────────────────────────────┤
│  - Daily insights delivered each morning                         │
│    - Confidence tăng dần khi có thêm data                        │
│                                                                  │
│  - Micro-prompts to complete deep onboarding (1-2 questions/day) │
│    - Non-intrusive, có thể skip                                  │
│                                                                  │
│  - Introduction to journal feature                               │
│    - First journal prompt xuất hiện Day 2                        │
│                                                                  │
│  - First pattern hints appear (after day 3)                      │
│    - Marked as "Observed" with occurrence count                  │
│                                                                  │
│  - End of week: First mini-report                                │
│    - Includes confidence level: "Early data, patterns cần        │
│      nhiều thời gian hơn để xác nhận"                            │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2. Daily User Journey

### Buổi sáng — JTBD 1: Daily Orientation

```
┌────────────────────────────────────────────────────────────────┐
│                    MORNING ROUTINE                              │
├────────────────────────────────────────────────────────────────┤
│  1. Notification arrives (configurable time, default 6:30)      │
│     - Headline insight                                          │
│     - Personal Day number                                       │
│     - Claim type badge (Calculated / Observed / Interpreted)    │
│                                                                 │
│  2. User opens app → Dashboard                                  │
│     - Today's theme                                             │
│     - Energy overview                                           │
│     - Quick actions                                             │
│                                                                 │
│  3. User reads Daily Insight (3 layers available)               │
│     - Layer 1: Quick read (30 sec)                              │
│     - Layer 2: Standard (2 min)                                 │
│     - Layer 3: Deep (5+ min)                                    │
│     - Each section marked with claim type                       │
│                                                                 │
│  4. Optional: Tap "Why this insight?"                           │
│     - See full explainability breakdown                         │
│                                                                 │
│  5. Optional: Set intention for the day                         │
└────────────────────────────────────────────────────────────────┘
```

### Trong ngày — JTBD 2: Experience Recording

```
┌────────────────────────────────────────────────────────────────┐
│                    THROUGHOUT THE DAY                           │
├────────────────────────────────────────────────────────────────┤
│  - Quick journal entry (mood, energy, notes)                   │
│    - Target: < 30 seconds                                       │
│                                                                 │
│  - Check specific insight if needed                            │
│                                                                 │
│  - Ask AI follow-up questions (optional)                        │
│    - Answers maintain claim type discipline                     │
│                                                                 │
│  - Mark events as they happen                                   │
└────────────────────────────────────────────────────────────────┘
```

### Buổi tối — JTBD 2 continuation

```
┌────────────────────────────────────────────────────────────────┐
│                    EVENING REFLECTION                           │
├────────────────────────────────────────────────────────────────┤
│  1. Reminder for end-of-day journal                             │
│     - Mood score                                                │
│     - Energy score                                              │
│     - Key events                                                │
│     - Reflection notes                                          │
│                                                                 │
│  2. Rate today's insight                                        │
│     - Was it relevant?                                          │
│     - Was it helpful?                                           │
│     - What claim type was most useful?                          │
│                                                                 │
│  3. System updates memory based on feedback                     │
│     - Pattern confidence updated                                │
│     - Personalization adjusted                                  │
└────────────────────────────────────────────────────────────────┘
```

## 4.3. Weekly Review Journey — JTBD 3: Pattern Discovery

```
┌────────────────────────────────────────────────────────────────┐
│                    WEEKLY REPORT (Every Sunday)                 │
├────────────────────────────────────────────────────────────────┤
│  1. Auto-generated report delivered                             │
│                                                                 │
│  2. Report contains:                                            │
│     ┌─────────────────────────────────────────────────────────┐│
│     │ CALCULATED (High confidence)                             ││
│     │ - Week overview (energy pattern based on PD numbers)    ││
│     │ - Numerology summary                                     ││
│     └─────────────────────────────────────────────────────────┘│
│     ┌─────────────────────────────────────────────────────────┐│
│     │ OBSERVED (Medium confidence, with evidence)              ││
│     │ - Mood patterns detected                                 ││
│     │ - Energy correlations                                    ││
│     │ - "Observed X times in Y days"                           ││
│     └─────────────────────────────────────────────────────────┘│
│     ┌─────────────────────────────────────────────────────────┐│
│     │ INTERPRETED (Lower confidence, suggestions)              ││
│     │ - Themes that emerged                                    ││
│     │ - Recommended focus areas                                ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│  3. Preview of next week's energy                               │
│     - Marked as "Calculated"                                    │
│     - "Suggested" actions, not predictions                      │
│                                                                 │
│  4. User can:                                                   │
│     - Add notes to report                                       │
│     - Validate/invalidate detected patterns                     │
│     - Deep dive into specific days                              │
└────────────────────────────────────────────────────────────────┘
```

## 4.4. Monthly Review Journey — JTBD 3 + 4

```
┌────────────────────────────────────────────────────────────────┐
│                    MONTHLY REPORT (End of month)                │
├────────────────────────────────────────────────────────────────┤
│  1. Comprehensive analysis generated                            │
│                                                                 │
│  2. Report contains:                                            │
│     - Month in review (narrative)                               │
│     - Personal Month analysis (Calculated)                      │
│     - Behavioral patterns detected (Observed + evidence)        │
│     - Correlation: numerology vs actual experience              │
│     - Progress toward stated goals                              │
│     - Recurring themes                                          │
│                                                                 │
│  3. Confidence Summary:                                         │
│     - "Data confidence: X% (based on Y journal entries)"        │
│     - "Pattern confidence: varies (see each pattern)"           │
│                                                                 │
│  4. Recommendations for next month                              │
│     - Marked as "Interpreted" or "Exploratory"                  │
│     - Framed as suggestions, not predictions                    │
│                                                                 │
│  5. User can:                                                   │
│     - Update goals/intentions                                   │
│     - Adjust preferences                                        │
│     - Export report                                             │
│     - Review and confirm/deny patterns                          │
└────────────────────────────────────────────────────────────────┘
```

---

---

# 5. Feature Specifications

## 5.1. Numerology Engine (Deterministic)

### 5.1.1. Core Numbers

| Chỉ số | Công thức | Lưu ý |
|--------|-----------|-------|
| **Life Path Number** | Tổng ngày sinh, reduce đến single digit (trừ 11, 22, 33) | Master numbers giữ nguyên |
| **Destiny Number** | Tổng giá trị chữ cái tên đầy đủ | |
| **Soul Urge Number** | Tổng nguyên âm trong tên | |
| **Personality Number** | Tổng phụ âm trong tên | |
| **Birthday Number** | Ngày sinh (không reduce) | |
| **Maturity Number** | Life Path + Destiny | |

### 5.1.2. Cyclic Numbers

| Chỉ số | Công thức | Chu kỳ |
|--------|-----------|--------|
| **Personal Year** | Ngày + tháng + năm hiện tại | 1 năm |
| **Personal Month** | Personal Year + tháng hiện tại | 1 tháng |
| **Personal Day** | Personal Month + ngày hiện tại | 1 ngày |

### 5.1.3. Extended Calculations

| Chỉ số | Mô tả |
|--------|-------|
| **Pinnacles** | 4 giai đoạn chính của đời người |
| **Challenges** | 4 thử thách chính |
| **Period Cycles** | Chu kỳ năng lượng dài hạn |

### 5.1.4. Yêu cầu

- ✅ Kết quả luôn nhất quán (deterministic)
- ✅ Có giải thích công thức (explainable)
- ✅ Không phụ thuộc AI
- ✅ Unit test coverage 100%

---

## 5.2. Daily Insight Engine

### 5.2.1. Output Structure

```json
{
  "date": "2024-01-15",
  "personal_day": 9,
  "headline": "A Day for Inner Clarity",
  "summary": {
    "quick_read": "2-3 câu tóm tắt",
    "theme": "Từ khóa chính của ngày"
  },
  "insight_layers": {
    "layer_1_quick": {
      "duration": "30 seconds",
      "content": "Tóm tắt nhanh, 2-3 câu"
    },
    "layer_2_standard": {
      "duration": "2 minutes",
      "content": "Phân tích đầy đủ với context"
    },
    "layer_3_deep": {
      "duration": "5+ minutes",
      "content": "Phân tích sâu, nhiều dimension"
    }
  },
  "claim_sections": {
    "calculated": {
      "badge": "Calculated",
      "content": "Phần tính toán từ numerology engine",
      "confidence": 1.0
    },
    "observed": {
      "badge": "Observed",
      "content": "Phần quan sát từ history",
      "evidence_count": 4,
      "confidence": 0.72
    },
    "interpreted": {
      "badge": "Interpreted",
      "content": "Phần diễn giải",
      "confidence": 0.68
    },
    "exploratory": {
      "badge": "Exploratory",
      "content": "Gợi ý mở để suy ngẫm",
      "confidence": 0.45
    }
  },
  "opportunities": [
    "Cơ hội 1",
    "Cơ hội 2"
  ],
  "suggested_actions": [
    {
      "action": "Hành động cụ thể",
      "why": "Lý do",
      "claim_type": "interpreted"
    }
  ],
  "reflection_questions": [
    "Câu hỏi 1",
    "Câu hỏi 2",
    "Câu hỏi 3"
  ],
  "personal_relevance": {
    "why_today_matters": "Vì sao ngày này quan trọng với cá nhân user",
    "cycle_context": "Liên hệ với Personal Month/Year",
    "recent_pattern_link": "Liên hệ với pattern gần đây (nếu có)"
  },
  "confidence_summary": {
    "data_confidence": 0.92,
    "pattern_confidence": 0.68,
    "interpretation_confidence": 0.74,
    "overall_confidence": 0.78,
    "factors": [
      "Có 45 ngày journal gần đây",
      "Pattern mood lặp 3 lần ở Personal Day 9"
    ]
  },
  "metadata": {
    "prompt_version": "v2.3",
    "model": "deepseek-reasoner",
    "generated_at": "2024-01-15T06:00:00Z",
    "claim_types_used": ["calculated", "observed", "interpreted"]
  }
}
```

### 5.2.2. Input Context cho AI

```json
{
  "numerology_context": {
    "personal_day": 9,
    "personal_month": 3,
    "personal_year": 1,
    "core_numbers": { "...": "..." },
    "cycle_transitions": ["..."]
  },
  "user_profile": {
    "name": "User",
    "life_goals": ["..."],
    "current_focus": ["..."],
    "values": ["..."],
    "challenges": ["..."],
    "insight_style_preference": "practical",
    "profile_version": 3
  },
  "recent_history": {
    "last_7_days_journal": ["..."],
    "recent_patterns": ["..."],
    "recurring_themes": ["..."],
    "mood_trend": "improving"
  },
  "previous_insights": {
    "last_3_days": ["..."],
    "feedback_summary": "User rates practical advice highly"
  },
  "temporal_context": {
    "day_of_week": "Monday",
    "is_weekend": false,
    "is_beginning_of_month": false,
    "is_birthday_period": false
  },
  "trust_constraints": {
    "must_use_claim_types": true,
    "must_not_mix_fact_and_interpretation": true,
    "must_show_evidence_for_observed": true,
    "language_mode": "interpretive_not_predictive"
  }
}
```

---

## 5.3. Journal Module

### 5.3.1. Entry Structure

```json
{
  "id": "uuid",
  "date": "2024-01-15",
  "created_at": "2024-01-15T21:30:00Z",
  "mood_score": 7,
  "energy_score": 6,
  "emotions": ["calm", "hopeful", "focused"],
  "key_events": [
    {
      "event": "Mô tả sự kiện",
      "impact": "positive/neutral/negative",
      "tags": ["work", "relationship"]
    }
  ],
  "free_reflection": "Nội dung tự do",
  "insight_feedback": {
    "was_relevant": true,
    "was_helpful": true,
    "which_part_helped": "Phần practical advice",
    "most_useful_claim_type": "observed",
    "rating": 4
  },
  "ai_detected_themes": ["productivity", "work-life balance"]
}
```

### 5.3.2. Quick Entry Mode

- Mood slider (1-10)
- Energy slider (1-10)
- 3 emotion tags (quick select from presets)
- Optional: One-line note
- Optional: Rate today's insight

Target: < 30 seconds to complete

### 5.3.3. Full Entry Mode

- All quick entry fields
- Key events (with impact rating)
- Free reflection (unlimited text)
- Photo attachment (optional)
- Voice note (optional - future)

---

## 5.4. Memory Engine

### 5.4.1. Memory Types

| Loại | Mô tả | Retention | Decay Model |
|------|-------|-----------|-------------|
| **Profile Memory** | Thông tin nền tảng user | Permanent | No decay |
| **Pattern Memory** | Patterns đã xác nhận | Permanent | Strength decay |
| **Event Memory** | Sự kiện quan trọng | Permanent | Recency decay |
| **Mood Memory** | Historical mood data | Rolling 365 days | Time decay |
| **Insight Memory** | Tất cả insights đã tạo | Permanent | Relevance decay |
| **Feedback Memory** | User ratings và comments | Permanent | No decay |

### 5.4.2. Memory Decay Model

Mỗi memory fragment có decay score:

```json
{
  "memory_id": "uuid",
  "type": "pattern",
  "content": "...",
  "decay_score": {
    "strength": 0.85,        // Confidence trong pattern
    "recency": 0.72,         // Gần đây xuất hiện
    "confirmation_count": 4, // Số lần xác nhận
    "contradiction_count": 1,// Số lần mâu thuẫn
    "net_confidence": 0.68   // (confirm - contradict) / total
  },
  "last_accessed": "2024-01-15",
  "created_at": "2024-01-01"
}
```

**Decay formula:**

```
effective_confidence = base_confidence * strength * recency * net_confidence

Where:
- strength = min(1.0, confirmation_count / 5)
- recency = exp(-days_since_last_access / 90)  // 90-day half-life
- net_confidence = (confirmation_count - contradiction_count * 2) /
                   max(confirmation_count + contradiction_count, 1)
```

**Rules:**

- Pattern không permanent chỉ vì từng xuất hiện vài lần
- Contradiction có weight cao hơn confirmation (x2)
- Recency quan trọng cho mood data, ít quan trọng cho profile

### 5.4.3. Memory Retrieval Logic

```
Khi tạo daily insight:

1. Retrieve Profile Memory (always, current version)
2. Retrieve Pattern Memory (relevance + recency filtered)
   - Only patterns with net_confidence > 0.3
   - Sorted by effective_confidence
3. Retrieve last 7 days of Mood/Event Memory
4. Retrieve last 3 days of Insight Memory
5. Retrieve Feedback Memory (aggregate patterns)
6. Semantic search for relevant historical entries (optional)
```

### 5.4.4. Pattern Detection

System tự động phát hiện:

- Mood patterns theo Personal Day
- Energy patterns theo Personal Month
- Recurring themes trong journal
- Effectiveness patterns của certain advice types
- User validation/invalidation of suggested patterns

**Pattern Confidence Requirements:**

| Pattern Type | Minimum Occurrences | Minimum Consistency | Claim Type Output |
|--------------|---------------------|---------------------|-------------------|
| Mood/PD correlation | 3 | 0.6 | Observed |
| Theme recurrence | 3 | N/A | Observed |
| Advice effectiveness | 5 ratings | 0.7 avg | Interpreted |

---

## 5.5. Report Engine

### 5.5.1. Weekly Report Structure

```json
{
  "week_number": 3,
  "date_range": {
    "start": "2024-01-15",
    "end": "2024-01-21"
  },
  "calculated_section": {
    "badge": "Calculated",
    "dominant_energy": "Personal Day 3 & 5",
    "numerology_summary": "..."
  },
  "observed_section": {
    "badge": "Observed",
    "average_mood": 7.2,
    "average_energy": 6.8,
    "patterns_detected": [
      {
        "pattern": "Low energy on PD 9",
        "evidence_count": 3,
        "confidence": 0.72,
        "user_validated": null
      }
    ]
  },
  "interpreted_section": {
    "badge": "Interpreted",
    "key_themes": [
      {
        "theme": "Productivity focus",
        "evidence": "5/7 days mentioned work progress"
      }
    ],
    "recommendations": [
      "Consider scheduling important tasks for PD 3 days"
    ]
  },
  "next_week_preview": {
    "badge": "Calculated",
    "dominant_numbers": [1, 8],
    "energy_description": "High action energy",
    "suggested_timing": ["Plan important meetings for Wednesday"]
  }
}
```

### 5.5.2. Monthly Report Structure

```json
{
  "month": "January 2024",
  "personal_month": {
    "number": 1,
    "theme": "New Beginnings",
    "badge": "Calculated"
  },
  "confidence_summary": {
    "data_confidence": 0.85,
    "pattern_confidence_average": 0.68,
    "journal_entries": 28,
    "feedback_entries": 22
  },
  "sections": {
    "calculated": {
      "narrative_summary": "2-3 đoạn narrative về tháng..."
    },
    "observed": {
      "behavioral_patterns": [
        {
          "pattern": "High productivity in first week",
          "evidence": "...",
          "confidence": 0.85
        }
      ],
      "goal_progress": [
        {
          "goal": "Start meditation practice",
          "status": "partial",
          "days_completed": 18
        }
      ]
    },
    "interpreted": {
      "insight_effectiveness": {
        "most_helpful_claim_type": "observed",
        "average_rating": 4.2
      },
      "recommendations_for_next_month": ["..."]
    }
  }
}
```

---

## 5.6. Notification System

> **Note:** Section này định nghĩa notification **capability** (những gì app có thể gửi). Để biết **delivery strategy, consent, content policy, và platform-specific behavior**, xem §17.

### 5.6.1. Notification Types

| Loại | Thời gian | Nội dung | Configurable |
|------|-----------|----------|--------------|
| Morning Insight | 6:00-8:00 (user set) | Headline + theme + claim type | ✅ |
| Evening Journal Reminder | 20:00-22:00 (user set) | Prompt to journal | ✅ |
| Weekly Report | Sunday morning | Report ready | ✅ |
| Monthly Report | 1st of month | Report ready | ✅ |
| Cycle Transition | When entering new cycle | Cycle alert | ✅ |
| Pattern Alert | When significant pattern detected | Pattern notification | ✅ |

### 5.6.2. Notification Preferences

```json
{
  "morning_insight": {
    "enabled": true,
    "time": "06:30",
    "style": "brief"
  },
  "evening_journal": {
    "enabled": true,
    "time": "21:00"
  },
  "weekly_report": {
    "enabled": true,
    "day": "sunday",
    "time": "09:00"
  },
  "sound": true,
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  }
}
```

---

# 6. Onboarding System

## 6.1. Two-Phase Onboarding

### Phase 1: Quick Onboarding (3-5 minutes)

**Mục tiêu:** Cho phép user bắt đầu dùng app ngay

```
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 1: Welcome                                             │
│  - Product thesis ngắn gọn                                     │
│  - "Đây không phải app bói toán, mà là companion"              │
│  - "Let's set up your profile in 3 minutes"                    │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 2: Basic Info                                          │
│  - Full name (for numerology calculation)                      │
│  - Date of birth                                               │
│  - "This is all we need to create your profile"                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 3: Style Preference                                    │
│  - "How do you like your insights?"                            │
│  - Options: Gentle / Direct / Practical / Spiritual            │
│  - Slider: Brief ↔ Detailed                                    │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 4: Privacy Mode                                        │
│  - "How would you like your data handled?"                     │
│  - Local Mode / Hybrid Mode / Cloud Mode                       │
│  - Explanation of each                                         │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 5: Notification Setup                                  │
│  - "When should we deliver your daily insight?"                │
│  - Time picker                                                 │
│  - Enable/disable options                                      │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  SCREEN 6: Profile Generated                                   │
│  - Show core numbers với explainability                        │
│  - "Your first insight is ready!"                              │
│  - Note: "Bạn có thể hoàn thiện profile bất cứ lúc nào"        │
│  - Option: "Complete deep profile now" or "Later"              │
└────────────────────────────────────────────────────────────────┘
```

### Phase 2: Deep Onboarding (Spread over 7 days)

**Mục tiêu:** Thu thập context sâu để cá nhân hóa tốt hơn

**Ngày 1-2: Life Context**

```
- "What are you currently focused on in life?"
  - Career
  - Relationships
  - Health
  - Creativity
  - Spiritual growth
  - [Multi-select]

- "What's your current role/profession?"
  - Free text

- "Any major life transitions in the past year?"
  - Free text (optional)
```

**Ngày 3-4: Values & Goals**

```
- "Which values matter most to you right now?"
  - Authenticity
  - Growth
  - Balance
  - Achievement
  - Connection
  - Freedom
  - [Rank top 3]

- "What do you hope to get from this app?"
  - Self-understanding
  - Pattern awareness
  - Reflective practice
  - Daily orientation
  - [Multi-select]
```

**Ngày 5-6: Challenges & Preferences**

```
- "What challenges are you currently working through?"
  - Free text (optional)

- "What kind of support works best for you?"
  - Gentle encouragement
  - Direct honesty
  - Practical steps
  - Deep questions to reflect on
  - [Multi-select]
```

**Ngày 7: Review**

```
- Show summary of profile
- Allow edits
- "Your profile helps us personalize insights"
- "Bạn có thể cập nhật profile bất cứ lúc nào trong Settings"
```

## 6.2. Profile Editability & Version History

### Nguyên tắc: Luôn editable, không khóa

**Thay đổi từ v1.0:**
- ❌ ~~Profile locked sau 7 ngày~~
- ✅ Profile luôn editable
- ✅ Mọi thay đổi được versioned
- ✅ Pattern engine biết phân biệt user state cũ/mới

### Profile Version Structure

```json
{
  "user_id": "uuid",
  "current_version": 3,
  "versions": [
    {
      "version": 1,
      "created_at": "2024-01-01",
      "data": {
        "full_name": "John Doe",
        "date_of_birth": "1990-05-15",
        "life_goals": ["Career growth"],
        "values": ["Achievement"]
      }
    },
    {
      "version": 2,
      "created_at": "2024-02-15",
      "change_reason": "User updated life goals",
      "data": {
        "full_name": "John Doe",
        "date_of_birth": "1990-05-15",
        "life_goals": ["Career growth", "Work-life balance"],
        "values": ["Achievement", "Balance"]
      }
    },
    {
      "version": 3,
      "created_at": "2024-03-20",
      "change_reason": "Major life transition",
      "data": {
        "...": "..."
      }
    }
  ]
}
```

### Pattern Engine Versioning

Khi tính pattern:

```python
def get_patterns_for_date(target_date):
    active_version = get_profile_version_at(target_date)
    # Use profile version that was active during the journal entry
    # Not the current profile version

    patterns = []
    for entry in journal_entries:
        entry_version = get_profile_version_at(entry.date)
        # Patterns are attributed to the profile version at that time
```

### User Communication

```
┌────────────────────────────────────────────────────────────────┐
│  PROFILE UPDATED                                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  "Your profile has been updated.                               │
│                                                                │
│   Patterns detected before this change will remain, but        │
│   future insights will reflect your current priorities.        │
│                                                                │
│   [View what changed]  [View version history]"                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 6.3. Progressive Profiling

- Questions được release dần để không overwhelm
- User có thể skip bất kỳ câu hỏi nào
- System nhắc nhở gentle để complete profile trong 7 ngày
- User có thể quay lại Settings để cập nhật bất cứ lúc nào
- Major changes trigger version update

---

---

# 7. Trust Architecture

## 7.1. Core Thesis

> "Mọi insight phải tách bạch giữa phần được tính toán, phần được quan sát từ lịch sử, và phần là diễn giải gợi ý."

Trust Architecture bao gồm:
1. **Claim Types** — 4 loại khẳng định với badge rõ ràng
2. **Three-Tier Confidence System** — Data, Pattern, Interpretation
3. **Explainability Component** — "Why This Insight?"
4. **Epistemic Rules** — Quy tắc ngôn ngữ và formatting

---

## 7.2. Claim Types (4-Tier Classification)

### Tổng quan

Mỗi phần của insight phải được phân loại vào 1 trong 4 loại:

| Claim Type | Badge | Mô tả | Confidence Range |
|------------|-------|-------|------------------|
| **Calculated** | `[Calculated]` | Deterministic từ numerology engine | 1.0 (always) |
| **Observed** | `[Observed: X times]` | Pattern từ user history | 0.5 - 0.95 |
| **Interpreted** | `[Interpreted]` | Diễn giải từ AI | 0.4 - 0.8 |
| **Exploratory** | `[Exploratory]` | Gợi ý mở, không khẳng định | 0.2 - 0.5 |

### Chi tiết từng loại

#### Calculated (Deterministic)

```json
{
  "claim_type": "calculated",
  "badge": "Calculated",
  "display": "🧮 Calculated",
  "confidence": 1.0,
  "examples": [
    "Personal Day 9",
    "Personal Month 3",
    "Life Path Number 5"
  ],
  "rules": [
    "Always show with formula explanation",
    "Never mix with interpretation in same sentence",
    "Can be verified by user manually"
  ]
}
```

#### Observed (From User History)

```json
{
  "claim_type": "observed",
  "badge": "Observed: 4 times",
  "display": "📊 Observed",
  "confidence": "calculated",
  "examples": [
    "You tend to feel calmer on PD 9 days",
    "Your energy peaks in Personal Month 1",
    "You mention 'clarity' frequently in journal"
  ],
  "rules": [
    "Must include occurrence count",
    "Must include time span",
    "Must show evidence on tap",
    "Never claim causation, only correlation"
  ]
}
```

**Observed Confidence Formula:**
```
observed_confidence = min(
  (occurrences / 5) * consistency_score,
  0.95
)

Where consistency_score = matching_cases / total_cases
```

#### Interpreted (AI Reasoning)

```json
{
  "claim_type": "interpreted",
  "badge": "Interpreted",
  "display": "💡 Interpreted",
  "confidence": "model_estimated",
  "examples": [
    "This might be a good day for reflection",
    "Consider scheduling important conversations",
    "Your current focus aligns with today's energy"
  ],
  "rules": [
    "Always use tentative language",
    "Must reference specific context that led to interpretation",
    "User can mark as helpful/not helpful",
    "Never present as fact"
  ]
}
```

#### Exploratory (Open-Ended)

```json
{
  "claim_type": "exploratory",
  "badge": "Exploratory",
  "display": "🔍 Exploratory",
  "confidence": "low",
  "examples": [
    "You might want to explore...",
    "A question to consider...",
    "Perhaps this is related to..."
  ],
  "rules": [
    "Purely suggestive",
    "Often in question form",
    "No expectation of accuracy",
    "Designed to prompt reflection"
  ]
}
```

### Claim Type Display Rules

#### In Insight View

```
┌────────────────────────────────────────────────────────────────┐
│  TODAY'S INSIGHT                                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [🧮 Calculated]                                               │
│  Today is Personal Day 9, in Personal Month 3.                 │
│  → Tap to see calculation                                      │
│                                                                │
│  [📊 Observed: 4 times]                                        │
│  You tend to feel more reflective on PD 9 days.                │
│  → Tap to see evidence                                         │
│                                                                │
│  [💡 Interpreted]                                              │
│  This might be a good day to reflect on the career             │
│  decision you mentioned last week.                             │
│  → Tap to see reasoning                                        │
│                                                                │
│  [🔍 Exploratory]                                              │
│  What would clarity look like for you right now?               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### Badge Color Coding

| Claim Type | Color | Hex |
|------------|-------|-----|
| Calculated | Blue | #3B82F6 |
| Observed | Green | #10B981 |
| Interpreted | Amber | #F59E0B |
| Exploratory | Gray | #6B7280 |

### Epistemic Rules

**Rule 1: No Mixing**
> Không bao giờ trộn fact với interpretation trong cùng một câu nếu không có marker.

❌ Wrong:
```
"Your Personal Day 9 means you should rest today."
```

✅ Right:
```
"[Calculated] Today is Personal Day 9.
[Interpreted] This might be a good day to rest."
```

**Rule 2: Evidence Required for Observed**
> Mọi claimed observation phải có evidence count.

❌ Wrong:
```
"You feel tired on PD 9 days."
```

✅ Right:
```
"[Observed: 3 times] You've reported lower energy on PD 9 days."
```

**Rule 3: Causation vs Correlation**
> Observed claims không bao giờ claim causation.

❌ Wrong:
```
"PD 9 causes you to feel introspective."
```

✅ Right:
```
"[Observed: 4 times] You've reported feeling more introspective on PD 9 days."
```

---

## 7.3. Three-Tier Confidence System

### Tier 1: Data Confidence

```json
{
  "data_confidence": 0.92,
  "factors": {
    "profile_completeness": 0.95,
    "journal_entries_last_30_days": 28,
    "feedback_entries": 22,
    "days_since_onboarding": 45
  }
}
```

**Công thức tính:**
```
data_confidence = (
  profile_completeness * 0.3 +
  min(journal_entries / 30, 1) * 0.3 +
  min(feedback_entries / 20, 1) * 0.2 +
  min(days_since_onboarding / 30, 1) * 0.2
)
```

### Tier 2: Pattern Confidence

```json
{
  "pattern_confidence": 0.68,
  "factors": {
    "pattern_occurrences": 3,
    "consistency_score": 0.75,
    "time_span_days": 45,
    "user_validations": 2,
    "user_invalidations": 0
  }
}
```

**Công thức tính:**
```
pattern_confidence = min(
  (pattern_occurrences / 5) * consistency_score * validation_multiplier,
  1.0
)

Where validation_multiplier:
- +0.1 for each user validation
- -0.15 for each user invalidation
```

### Tier 3: Interpretation Confidence

```json
{
  "interpretation_confidence": 0.74,
  "factors": {
    "model_certainty": "high",
    "context_richness": 0.85,
    "similar_past_insights_accuracy": 0.78,
    "claim_type_distribution": {
      "calculated": 0.3,
      "observed": 0.4,
      "interpreted": 0.2,
      "exploratory": 0.1
    }
  }
}
```

### Overall Confidence

```
overall_confidence = (
  data_confidence * 0.2 +
  pattern_confidence * 0.3 +
  interpretation_confidence * 0.5
)
```

**Display:**
- 0.8+: "High confidence"
- 0.6-0.8: "Moderate confidence"
- 0.4-0.6: "Early insights (needs more data)"
- < 0.4: "Limited data"

---

## 7.4. Explainability Component

### "Why This Insight?" Feature

Khi user tap vào một insight, họ có thể xem:

```
┌────────────────────────────────────────────────────────────────┐
│  WHY THIS INSIGHT?                                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📊 DATA SOURCES                                               │
│  ├─ Profile completeness: 95%                                  │
│  ├─ Journal entries: 45 days                                   │
│  └─ Feedback given: 38 times                                   │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  🧮 CALCULATED CLAIMS                                          │
│  - Personal Day 9: Month 3 + Day 15 = 18 → 1+8 = 9             │
│    [View full calculation]                                     │
│  - Personal Month 3: Year 1 + Month 3 = 4                      │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  📊 OBSERVED CLAIMS                                            │
│  - "You tend to feel reflective on PD 9"                       │
│    Evidence: 4 occurrences (Jan 6, Jan 15, Jan 24, Feb 5)      │
│    Consistency: 3/4 matched pattern (75%)                      │
│    [View journal entries]                                      │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  💡 INTERPRETATION BASIS                                       │
│  - Referenced: Your goal "make career decision"                │
│  - Referenced: Pattern "seeking clarity"                       │
│  - Model confidence: High                                      │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  📈 CONFIDENCE BREAKDOWN                                       │
│  ├─ Data confidence: 92% ████████████████████░░                │
│  ├─ Pattern confidence: 68% ██████████████░░░░░░░░              │
│  └─ Interpretation confidence: 74% ███████████████░░░░░░       │
│                                                                │
│  Overall: 74% ███████████████████░░░░░░░░                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

# 8. Privacy & Data Control Layer

## 8.1. Privacy Modes

### Mode 1: Local Mode (Maximum Privacy)

| Aspect | Behavior |
|--------|----------|
| Data storage | 100% local SQLite |
| AI processing | Local model or disabled |
| Cloud sync | Disabled |
| Backup | Local file export only |
| Features | Reduced (no cloud AI, limited personalization) |

### Mode 2: Hybrid Mode (Balanced)

| Aspect | Behavior |
|--------|----------|
| Data storage | Local SQLite (primary) |
| AI processing | Cloud API (sent: current context only) |
| Cloud sync | Optional encrypted backup |
| What's sent | Only necessary context for insight generation |
| Features | Full features |

### Mode 3: Cloud Mode (Full Features)

| Aspect | Behavior |
|--------|----------|
| Data storage | Local + encrypted cloud backup |
| AI processing | Cloud API |
| Cloud sync | Enabled |
| Cross-device | Available |
| Features | Full + multi-device sync |

## 8.2. Data Transparency

### "What We Send" Dashboard

User có thể xem chính xác data nào được gửi khi tạo insight:

```
┌────────────────────────────────────────────────────────────────┐
│  DATA SENT TO AI FOR TODAY'S INSIGHT                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ Sent:                                                      │
│  - Your numerology profile (core numbers)                      │
│  - Today's numerology calculations                             │
│  - Last 7 days of journal summaries (anonymized)               │
│  - Your stated preferences and goals                           │
│  - Detected patterns (not raw journal text)                    │
│                                                                │
│  ❌ Not Sent:                                                  │
│  - Your full name                                              │
│  - Your exact birth date                                       │
│  - Specific event details                                      │
│  - Raw journal text (only AI-detected themes)                  │
│  - Personal identifiers                                        │
│                                                                │
│  [View Raw Payload]                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 8.3. User Data Rights

| Right | Implementation |
|-------|----------------|
| **Export** | Full JSON export of all data |
| **Delete** | One-click delete all data |
| **View** | Browse all stored data in-app |
| **Edit** | Edit any stored information |
| **Portability** | Standard format export |
| **Version History** | View all profile changes |

## 8.4. Sensitive Data Handling

### Encrypted Fields

- Journal free-text entries
- Event descriptions
- Personal goals
- Any free-form user input

### Never Stored

- API keys in plain text
- Authentication tokens unencrypted
- Personal identifiers sent to AI

## 8.5. Privacy-Preserving AI Communication

### Data Minimization

```json
{
  "sent_to_ai": {
    "profile_summary": {
      "life_path": 5,
      "current_focus_areas": ["career", "relationships"],
      "style_preference": "practical"
    },
    "numerology_today": {
      "personal_day": 9,
      "personal_month": 3
    },
    "patterns": [
      {
        "type": "mood_correlation",
        "observation": "lower_energy_on_pd9",
        "occurrences": 4
      }
    ],
    "recent_themes": ["seeking_clarity", "work_reflection"]
  },
  "not_sent": {
    "full_name": null,
    "birth_date": null,
    "raw_journal_text": null,
    "exact_events": null
  }
}
```

---

---

# 9. Personalization Optimization Layer

## 9.1. Adaptive Insight System

### Variables to Optimize

| Variable | Options | How Measured | Priority |
|----------|---------|--------------|----------|
| **Insight Length** | Brief / Standard / Deep | Completion rate | High |
| **Tone** | Gentle / Direct / Balanced | Helpfulness rating | High |
| **Focus** | Practical / Reflective / Spiritual | Engagement + rating | Medium |
| **Reflection Questions** | 1-2 / 3-4 / 5+ | Response rate | Medium |
| **Action Items** | 0 / 1-2 / 3+ | Completion rate | Medium |
| **History Integration** | None / Light / Deep | Helpfulness rating | High |
| **Claim Type Mix** | Calculated% / Observed% / Interpreted% | Overall rating | High |

### Learning Algorithm

```
Every 7 days:

1. Analyze user feedback patterns
   - Which insights got highest ratings?
   - Which claim types were most helpful?
   - What length had best completion rate?

2. Identify highest-rated insight characteristics
   - Cluster by parameters
   - Find winning combinations

3. Adjust default insight generation parameters
   - Gradual adjustment (max 10% per week)
   - A/B test new variations

4. Update user preference profile
   - Store as explicit preference
   - Use for future generation
```

## 9.2. Variant Tracking

```json
{
  "variant_id": "v_insight_2024_w3_practical_deep",
  "parameters": {
    "length": "deep",
    "tone": "direct",
    "focus": "practical",
    "questions_count": 3,
    "claim_type_mix": {
      "calculated": 0.25,
      "observed": 0.40,
      "interpreted": 0.25,
      "exploratory": 0.10
    }
  },
  "performance": {
    "impressions": 7,
    "avg_rating": 4.3,
    "completion_rate": 0.85,
    "follow_up_actions": 5,
    "most_helpful_claim_type": "observed"
  },
  "created_at": "2024-01-15",
  "is_active": true
}
```

## 9.3. Feedback Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK COLLECTION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  End of day prompt:                                         │
│                                                             │
│  "How was today's insight?"                                 │
│                                                             │
│  [⭐⭐⭐⭐⭐] Rating                                         │
│                                                             │
│  Specific feedback (optional):                              │
│  ☐ Relevant to my day                                       │
│  ☐ Gave useful perspective                                  │
│  ☐ Made me think differently                                │
│  ☐ Too long / Too short                                     │
│  ☐ Not relevant                                             │
│                                                             │
│  Which part was most helpful?                               │
│  ○ The calculations (Personal Day, etc.)                    │
│  ○ The patterns from my history                             │
│  ○ The interpretations and suggestions                      │
│  ○ The reflection questions                                 │
│  ○ None particularly helpful                                │
│                                                             │
│  [Add note]                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 9.4. Personalization Boundaries

### What Can Be Personalized

| Aspect | Can Personalize | Cannot Personalize |
|--------|-----------------|-------------------|
| **Tone** | ✅ Gentle ↔ Direct | ❌ Cannot become predictive |
| **Length** | ✅ Brief ↔ Deep | ❌ Cannot remove claim types |
| **Focus** | ✅ Practical ↔ Reflective | ❌ Cannot change numerology |
| **Claim Mix** | ✅ Adjust ratios | ❌ Cannot remove Calculated |
| **Language** | ✅ Style preferences | ❌ Cannot use predictive words |

### Hard Constraints

```
1. Claim Type discipline always maintained
2. Never use predictive language ("will", "certainly", "definitely")
3. Always show confidence indicators
4. Never remove evidence links for Observed claims
5. Never change Calculated outputs (they are deterministic)
```

## 9.5. Learning Timeline

| User Age | Personalization Level | Data Available |
|----------|----------------------|----------------|
| Day 1-7 | Minimal | Profile only |
| Week 2-4 | Light | + 14-28 journals |
| Month 2-3 | Moderate | + Patterns emerging |
| Month 4+ | High | + Validated patterns |

### New User Handling

```
For users with < 7 days of data:
- Focus on Calculated claims (higher confidence)
- Use generic Observed claims sparingly
- Be explicit about "early insights, needs more data"
- Don't attempt pattern detection yet

For users with 7-30 days:
- Start introducing Observed claims
- Show pattern hints with low confidence
- Collect feedback on what's helpful

For users with 30+ days:
- Full personalization active
- Pattern detection at normal thresholds
- Adaptive adjustments in effect
```

---

---

# 10. UI/UX Requirements

## 10.1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Calm & Focused** | Minimal UI, no distracting elements |
| **Progressive Disclosure** | Show simple first, deep on demand |
| **One-Action Primary** | Each screen has one clear primary action |
| **Respect Time** | Quick interactions possible |
| **Premium Feel** | Typography, spacing, micro-interactions |
| **Trust Through Transparency** | Claim types always visible |

## 10.2. Color & Typography

### Color Palette

```
Primary:     Deep Indigo / Midnight Blue (#1a1a2e)
Secondary:   Soft Gold / Amber (#f4a261)
Background:  Off-white / Warm Gray (#faf9f6)
Text:        Charcoal (#2d2d2d)
Accent:      Teal (#2a9d8f)

Claim Type Colors:
- Calculated: Blue (#3B82F6)
- Observed: Green (#10B981)
- Interpreted: Amber (#F59E0B)
- Exploratory: Gray (#6B7280)
```

### Typography

```
Headings:    Inter / SF Pro Display (Bold)
Body:        Inter / SF Pro Text (Regular)
Numbers:     JetBrains Mono / SF Mono (for numerology numbers)
Claim Badges: Inter Semi-Bold (small caps)
```

## 10.3. Key Screens

### Home Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│  ☰                    January 15                      ⚙️ 🔔   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    PERSONAL DAY 7                         │ │
│  │                  [🧮 Calculated]                          │ │
│  │                                                          │ │
│  │          "A Day for Inner Clarity"                       │ │
│  │                                                          │ │
│  │          [Read Today's Insight →]                        │ │
│  │                                                          │ │
│  │          Confidence: 74%  [Why?]                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Personal      │  │  Personal      │  │  Personal      │  │
│  │  Month: 3      │  │  Year: 1       │  │  Cycle: Growth │  │
│  │  Creativity    │  │  New Beginnings│  │  Phase 2       │  │
│  │  [🧮]          │  │  [🧮]          │  │  [🧮]          │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Quick Journal                                           │ │
│  │  Mood: [━━━━━━━●━━━] 7    Energy: [━━━━●━━━━━] 5        │ │
│  │  [Add note...]                              [Save]       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Recent Patterns [📊] ─────────────────────────────────────── │
│  • You tend to feel calm on PD 9 days (observed 4x)          │
│  • Morning reflections are most effective for you            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  [Home]  [Journal]  [Timeline]  [Reports]  [Profile]          │
└────────────────────────────────────────────────────────────────┘
```

### Daily Insight View

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back              January 15, 2024                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │          [7]                                            │ │
│  │          Personal Day                                    │ │
│  │          [🧮 Calculated]                                 │ │
│  │                                                          │ │
│  │          "A Day for Inner Clarity"                       │ │
│  │                                                          │ │
│  │          Confidence: 74%  [Why?]                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  LAYER SELECTOR:  [Quick]  [Standard]  [Deep ✓]               │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  [🧮 Calculated]                                               │
│  Today is Personal Day 9, in Personal Month 3.                │
│  PD 9 is associated with completion and reflection.           │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  [📊 Observed: 4 times]                                        │
│  You've reported feeling more reflective on PD 9 days.        │
│  Your energy tends to be lower but mood calmer.               │
│  [View evidence →]                                            │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  [💡 Interpreted]                                              │
│  This might be a good day to reflect on the career            │
│  decision you mentioned last week. Consider journaling        │
│  about what clarity would look like for you.                  │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  [🔍 Exploratory]                                              │
│  What truth have you been avoiding?                           │
│  If you trusted your intuition, what would it say?           │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  SUGGESTED ACTIONS [💡 Interpreted]                           │
│  1. Schedule 30 minutes of quiet reflection                    │
│  2. Journal about the decision you're facing                   │
│  3. Avoid making major commitments today                       │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  [Was this helpful? ⭐⭐⭐⭐⭐]                                 │
│                                                                │
│  [Share]  [Save to Notes]  [Ask Follow-up]                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### "Why This Insight?" Modal

```
┌────────────────────────────────────────────────────────────────┐
│  WHY THIS INSIGHT?                                         ✕   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📊 DATA SOURCES                                               │
│  ├─ Profile completeness: 95%                                  │
│  ├─ Journal entries: 45 days                                   │
│  └─ Feedback given: 38 times                                   │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  🧮 CALCULATED CLAIMS                                          │
│  Personal Day 9:                                               │
│  Personal Month (3) + Day (15) = 18 → 1+8 = 9                  │
│  [View full calculation →]                                     │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  📊 OBSERVED CLAIM: "reflective on PD 9"                      │
│  Occurrences: 4 times in 45 days                               │
│  Dates: Jan 6, Jan 15, Jan 24, Feb 5                          │
│  Consistency: 3/4 matched pattern (75%)                        │
│  Pattern confidence: 68%                                       │
│  [View journal entries →]                                      │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  💡 INTERPRETATION BASIS                                       │
│  Context used:                                                 │
│  - Your goal: "make career decision"                          │
│  - Recent theme: "seeking clarity" (mentioned 5x)             │
│  - Pattern: "reflective, completion-oriented on PD 9"         │
│                                                                │
│  Model confidence: 74%                                         │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                │
│  📈 CONFIDENCE BREAKDOWN                                       │
│  Data:      92% ████████████████████░░                        │
│  Pattern:   68% ██████████████░░░░░░░░                        │
│  Interpret: 74% ███████████████░░░░░░░                        │
│  ─────────────────────────────────────────────               │
│  Overall:   74% ███████████████████░░░░░░                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 10.4. Micro-interactions

- Smooth transitions between screens (300ms ease)
- Number reveals with subtle animation
- Claim type badge fade-in
- Confidence bar animation
- Pull-to-refresh for updates
- Swipe gestures for navigation
- Haptic feedback on rating selection

## 10.5. Claim Type UI Components

### Badge Styles

```css
.badge-calculated {
  background: #3B82F6;
  icon: "🧮";
}

.badge-observed {
  background: #10B981;
  icon: "📊";
  suffix: ": X times";
}

.badge-interpreted {
  background: #F59E0B;
  icon: "💡";
}

.badge-exploratory {
  background: #6B7280;
  icon: "🔍";
}
```

### Interactive Elements

- **Calculated badges**: Tap to see formula/explanation
- **Observed badges**: Tap to see evidence list
- **Interpreted badges**: Tap to see reasoning context
- **Exploratory badges**: No tap action (purely reflective)

---

# 11. Technical Constraints

## 11.1. Platform Requirements

| Requirement | Specification |
|-------------|---------------|
| **Primary Platform** | macOS (first), Windows (second) |
| **Framework** | Tauri 2.x |
| **Frontend** | React 18+ with TypeScript |
| **Database** | SQLite (local) |
| **Minimum OS** | macOS 11+, Windows 10+ |

## 11.2. AI Integration

| Requirement | Specification |
|-------------|---------------|
| **Primary AI** | Deepseek Reasoner API |
| **Fallback AI** | OpenAI GPT-4 (optional) |
| **Response Time** | < 30 seconds for full insight |
| **Rate Limiting** | Implement client-side queuing |
| **Error Handling** | Graceful degradation with cached insights |

## 11.3. Performance Requirements

| Metric | Target |
|--------|--------|
| App Launch Time | < 2 seconds |
| Insight Generation | < 30 seconds |
| Journal Entry Save | < 500ms |
| Database Query | < 100ms |
| Memory Usage | < 200MB idle |

## 11.4. Storage Estimates

| Data Type | Per Entry | Est. Annual |
|-----------|-----------|-------------|
| Daily Insight | ~15KB | ~5.5MB |
| Journal Entry | ~2KB | ~0.7MB |
| Memory Index | ~1KB/entry | ~0.4MB |
| Profile Versions | ~5KB/version | ~0.1MB |
| **Total** | | **~7MB/year** |

## 11.5. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Local Data Encryption | SQLite with SQLCipher |
| Transit Encryption | TLS 1.3 for all API calls |
| API Key Storage | OS keychain integration |
| Journal Encryption | AES-256 for sensitive fields |

---

---

# 12. Success Metrics

## 12.1. Metrics Philosophy

Metrics được tổ chức theo **4 nhóm**, mỗi nhóm đo một khía cạnh khác nhau của product success:

| Nhóm | Đo lường | Mục tiêu |
|------|----------|----------|
| **Activation** | User có bắt đầu dùng không? | First-time experience |
| **Habit Formation** | User có quay lại không? | Retention & consistency |
| **Perceived Distinctiveness** | User có thấy khác biệt không? | Differentiation |
| **Trust** | User có tin tưởng không? | Confidence system effectiveness |

## 12.2. Activation Metrics

| Metric | Target | Measurement | JTBD |
|--------|--------|-------------|------|
| Quick Onboarding Completion | ≥ 85% | % complete onboarding | - |
| First Insight Read | ≥ 90% | % read within 24h | JTBD 1 |
| First Journal Entry | ≥ 50% within 72h | % create entry | JTBD 2 |
| Deep Onboarding Start | ≥ 40% | % start within 7 days | - |
| Profile Version 2 Created | ≥ 30% within 30 days | % update profile | - |

## 12.3. Habit Formation Metrics

| Metric | Target | Measurement | JTBD |
|--------|--------|-------------|------|
| Daily Active Usage | 70% open daily | App open events | JTBD 1 |
| 7-Day Retention | ≥ 60% | Cohort analysis | All |
| 30-Day Retention | ≥ 40% | Cohort analysis | All |
| Journal Completion Rate | ≥ 60% daily | Entries / days | JTBD 2 |
| Median Streak Length | ≥ 7 days | Streak analysis | JTBD 2 |
| Active Users (3+/week after week 2) | ≥ 50% | Weekly active % | All |

### Streak Analysis

```
Target distribution:
- 0-2 days: 15%
- 3-6 days: 25%
- 7-13 days: 30%
- 14-29 days: 20%
- 30+ days: 10%
```

## 12.4. Perceived Distinctiveness Metrics

| Metric | Target | Measurement | Notes |
|--------|--------|-------------|-------|
| "Insight feels personal" | ≥ 70% agree | In-app survey | After 7 days |
| "This is not generic" | ≥ 65% agree | In-app survey | After 7 days |
| Insight Save/Share Rate | ≥ 15% | Save + share events | Weekly |
| Deep Layer Read Rate | ≥ 40% | Scroll depth | Per insight |
| "Most helpful claim type" response | ≥ 60% respond | Feedback collection | Validates trust architecture |

### Distinctiveness Survey Questions

```
After 7 days of use:

1. "The daily insights feel personal to me"
   [Strongly Disagree] ... [Strongly Agree]

2. "This app is different from other numerology/spiritual apps"
   [Strongly Disagree] ... [Strongly Agree]

3. "The app remembers context about me over time"
   [Strongly Disagree] ... [Strongly Agree]
```

## 12.5. Trust Metrics

| Metric | Target | Measurement | Notes |
|--------|--------|-------------|-------|
| "Why This Insight?" Open Rate | ≥ 25% | Tap events | Explainability interest |
| Evidence View Rate (Observed claims) | ≥ 20% | Tap events | Transparency engagement |
| Privacy Mode Check | ≥ 30% view | Settings views | Privacy awareness |
| Confidence-Rating Correlation | ≥ 0.5 | Statistical | Higher confidence → higher rating |
| Claim Type Preference Response | ≥ 50% | Feedback | User knows what helps |

### Trust Survey Questions

```
After 14 days:

1. "I understand why the app suggests certain things"
   [Strongly Disagree] ... [Strongly Agree]

2. "I trust that the app is being honest about its limitations"
   [Strongly Disagree] ... [Strongly Agree]

3. "The confidence indicators are helpful"
   [Strongly Disagree] ... [Strongly Agree]
```

## 12.6. Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Insight Relevance (user-reported) | ≥ 70% "relevant" | Feedback |
| Insight Helpfulness (avg rating) | ≥ 4.0/5 | Rating |
| Pattern Detection Rate | ≥ 3 patterns/user/month | System logs |
| Pattern Validation Rate | ≥ 60% validated | User confirm |
| Personalization Improvement | Ratings improve over time | Trend analysis |

## 12.7. Technical Metrics

| Metric | Target |
|--------|--------|
| App Crash Rate | < 0.1% |
| AI API Success Rate | > 99% |
| Data Loss Incidents | 0 |
| Average Insight Generation Time | < 20 seconds |
| Database Query Time (avg) | < 100ms |

## 12.8. Metrics Dashboard Priority

**Phase 1 (MVP):** Focus on Activation + Habit Formation
**Phase 2 (Retention):** Add Perceived Distinctiveness
**Phase 3 (Premium):** Add Trust + Quality deep dives

---

# 13. Roadmap

## 13.1. Roadmap Philosophy

> "Đừng build 'full intelligence system' ngay từ đầu. Hãy build daily habit, rồi mới đến compounding intelligence."

Roadmap được chia thành **3 lớp** với mục tiêu rõ ràng mỗi lớp:

| Lớp | Tên | Mục tiêu | Timeline |
|-----|-----|----------|----------|
| **Lớp 1** | MVP | Daily habit + basic value | 4-5 weeks |
| **Lớp 2** | Retention Engine | Memory + patterns + trust | 3-4 weeks |
| **Lớp 3** | Premium Depth | Advanced features + optimization | 3-4 weeks |

## 13.2. Lớp 1: MVP (Week 1-5)

**Mục tiêu:** Tạo ra một daily insight đủ cá nhân hóa để khiến user muốn quay lại

### Must-Have Features

| Feature | Priority | Week |
|---------|----------|------|
| Tauri project setup | P0 | 1 |
| React UI skeleton | P0 | 1 |
| SQLite database schema | P0 | 1 |
| **Numerology Engine (core)** | P0 | 1-2 |
| Basic user profile storage | P0 | 1 |
| **Quick Onboarding flow** | P0 | 2 |
| **AI Integration (Deepseek)** | P0 | 2-3 |
| Prompt builder system | P0 | 3 |
| **Daily Insight generation** | P0 | 3 |
| Basic insight display UI | P0 | 3 |
| **Quick Journal (mood + energy)** | P0 | 3-4 |
| Insight rating system | P0 | 4 |
| **Basic Confidence display** | P0 | 4 |
| **Simple Weekly Recap** | P1 | 4-5 |
| Local storage (all data) | P0 | 1-5 |

### Success Criteria for MVP

- [ ] User có thể hoàn thành onboarding trong 5 phút
- [ ] User nhận được daily insight mỗi ngày
- [ ] Insight có ít nhất 1 phần Calculated
- [ ] User có thể quick journal < 30 giây
- [ ] User có thể rate insight
- [ ] Weekly recap đơn giản hoạt động
- [ ] 7-day retention ≥ 40%

### MVP Scope Cuts

**NOT in MVP:**
- ~~Deep onboarding~~ → Phase 2
- ~~Memory retrieval~~ → Phase 2
- ~~Pattern detection~~ → Phase 2
- ~~Full claim type badges~~ → Phase 2 (only basic confidence)
- ~~Monthly reports~~ → Phase 3
- ~~Profile version history~~ → Phase 2

## 13.3. Lớp 2: Retention Engine (Week 6-9)

**Mục tiêu:** Memory + patterns + trust architecture → giữ user lâu hơn

### Features

| Feature | Priority | Week |
|---------|----------|------|
| **Deep Onboarding** | P0 | 6 |
| **Memory Engine (basic)** | P0 | 6 |
| **Pattern Detection v1** | P0 | 6-7 |
| **Full Claim Type System** | P0 | 7 |
| **"Why This Insight?" UI** | P0 | 7 |
| **Observed Claims with Evidence** | P0 | 7 |
| Personalization rules (simple) | P1 | 7-8 |
| **Profile Versioning** | P1 | 8 |
| Privacy Mode UI | P1 | 8 |
| Export functionality | P2 | 8-9 |
| Memory Decay Model | P1 | 9 |

### Success Criteria for Retention Engine

- [ ] User có thể xem evidence cho Observed claims
- [ ] Ít nhất 2 patterns được detect trong 30 ngày
- [ ] "Why This Insight?" được mở bởi ≥ 25% users
- [ ] Profile có thể được updated với version tracking
- [ ] 30-day retention ≥ 35%

### Retention Engine Scope Cuts

**NOT in Phase 2:**
- ~~Semantic memory retrieval~~ → Phase 3
- ~~Advanced A/B optimization~~ → Phase 3
- ~~Monthly reports~~ → Phase 3
- ~~Adaptive optimization~~ → Phase 3

## 13.4. Lớp 3: Premium Depth (Week 10-13)

**Mục tiêu:** Advanced features cho power users + optimization

### Features

| Feature | Priority | Week |
|---------|----------|------|
| **Monthly Reports** | P1 | 10 |
| Timeline/Calendar view | P1 | 10 |
| **Pattern Visualization** | P1 | 10-11 |
| Advanced Report UI | P1 | 11 |
| Semantic Memory Retrieval | P2 | 11-12 |
| Adaptive Optimization Engine | P2 | 12 |
| A/B Testing Framework | P2 | 12 |
| Cloud Sync (optional) | P2 | 12-13 |
| Multi-device Support | P3 | 13 |
| Advanced Personalization | P2 | 13 |

### Success Criteria for Premium Depth

- [ ] Monthly reports được mở bởi ≥ 50% monthly active users
- [ ] Pattern visualization được xem
- [ ] Adaptive optimization shows improvement
- [ ] User satisfaction (NPS) ≥ 40

### Future Features (Post-Launch)

- Mobile companion app
- Multi-profile support
- Community features (optional)
- Integration với calendar apps
- Voice journaling

## 13.5. Roadmap Summary

```
Week 1-2:  Foundation
Week 3-4:  Core Features (Daily Insight + Journal)
Week 5:    MVP Polish + Launch Readiness
Week 6-7:  Trust Architecture + Memory
Week 8-9:  Pattern Detection + Profile Versioning
Week 10-11: Reports + Visualization
Week 12-13: Advanced Features + Optimization
```

---

# 14. Failure Modes & Mitigations

## 14.1. Identified Failure Modes

### Failure Mode 1: Generic Insights

**Description:** Insights cảm thấy generic, không khác các app khác

**Detection:**
- "This feels personal" rating < 50%
- Low save/share rate
- User feedback: "Could apply to anyone"

**Mitigations:**
- Increase Observed claims ratio
- Require minimum profile completeness
- Add more personalization variables
- Review prompt engineering

### Failure Mode 2: Confidence Mismatch

**Description:** High confidence nhưng user thấy sai

**Detection:**
- High confidence insights get low ratings
- Negative feedback correlation with confidence
- User trust survey decline

**Mitigations:**
- Calibrate confidence formulas
- Lower pattern confidence thresholds
- Add user validation step for patterns
- Increase "Exploratory" claims for uncertain areas

### Failure Mode 3: Pattern from Insufficient Data

**Description:** Pattern được claim từ quá ít data points

**Detection:**
- Patterns with < 3 occurrences shown
- User invalidates pattern immediately
- Evidence view shows weak data

**Mitigations:**
- Minimum 3 occurrences before showing
- Higher consistency threshold
- Clear "early indication" messaging
- User must validate before high confidence

### Failure Mode 4: Overly Prescriptive Tone

**Description:** AI tone quá áp đặt, không尊重 uncertainty

**Detection:**
- User feedback: "Too bossy"
- Language audit finds predictive words
- Low "trust honesty" survey score

**Mitigations:**
- Language model fine-tuning
- Mandatory language review in prompt
- Regular insight audits
- User preference for tone

### Failure Mode 5: User Feels Judged

**Description:** Insight làm user cảm thấy bị phán xét

**Detection:**
- User churn after specific insight
- Negative qualitative feedback
- "Emotional safety" concern in surveys

**Mitigations:**
- Insight safety policy enforcement
- Avoid diagnostic language
- Focus on patterns, not judgments
- Add user control over topic sensitivity

### Failure Mode 6: Onboarding Drop-off

**Description:** Onboarding quá dài gây drop-off

**Detection:**
- < 70% quick onboarding completion
- Drop-off at specific screen
- Time-to-complete > 7 minutes

**Mitigations:**
- Reduce quick onboarding to 3 screens
- Move deep questions to progressive profiling
- Add "skip for now" everywhere
- Show progress indicator

### Failure Mode 7: Pattern Becomes Outdated

**Description:** Pattern đúng trong quá khứ nhưng không còn đúng

**Detection:**
- Pattern invalidation increases
- Profile version change without pattern reset
- User feedback: "This used to be true"

**Mitigations:**
- Pattern decay model
- Periodic re-validation prompts
- Link patterns to profile versions
- Time-based confidence decay

## 14.2. Failure Mode Monitoring

| Failure Mode | Primary Metric | Alert Threshold |
|--------------|----------------|-----------------|
| Generic Insights | "Feels personal" score | < 60% |
| Confidence Mismatch | Confidence-rating correlation | < 0.3 |
| Insufficient Data | Pattern invalidation rate | > 30% |
| Prescriptive Tone | Predictive word audit | > 5% of insights |
| User Feels Judged | "Feeling judged" feedback | > 5% |
| Onboarding Drop-off | Completion rate | < 75% |
| Outdated Patterns | Validation rate decline | > 20% drop |

## 14.3. Recovery Procedures

### For Generic Insights
1. Immediate: Review prompt templates
2. Short-term: Increase personalization parameters
3. Long-term: Retrain/fine-tune model

### For Trust Issues
1. Immediate: Adjust confidence display
2. Short-term: Add more explainability
3. Long-term: Rebuild trust through transparency

### For User Experience Issues
1. Immediate: Add skip options
2. Short-term: Redesign flow
3. Long-term: A/B test alternatives

---

---

# 15. Human Review Rubric

## 15.1. Purpose

Trong giai đoạn đầu, mọi insight nên được đánh giá thủ công theo rubric này để đảm bảo chất lượng trước khi tự động hóa hoàn toàn.

## 15.2. Review Dimensions

### Dimension 1: Specificity (Độ cụ thể)

| Score | Description | Example |
|-------|-------------|---------|
| 1 | Generic, could apply to anyone | "Today is a good day for reflection" |
| 2 | Some personalization | "As a Life Path 5, today is good for reflection" |
| 3 | Specific to user's context | "Given your focus on career decisions, today's PD 9 supports reflection on that" |
| 4 | Highly specific, unique to user | "You've mentioned 'clarity' 5 times this month. Today's PD 9, combined with your Personal Month 3, suggests a good moment to journal specifically about the career decision you mentioned on Jan 12" |

**Target:** Average score ≥ 3.0

### Dimension 2: Personal Relevance (Liên quan cá nhân)

| Score | Description |
|-------|-------------|
| 1 | No reference to user's stated goals/values |
| 2 | Generic reference to profile |
| 3 | Connects to user's current focus areas |
| 4 | Deeply integrated with user's context, history, and stated preferences |

**Target:** Average score ≥ 3.0

### Dimension 3: Practicality (Tính thực tế)

| Score | Description |
|-------|-------------|
| 1 | Abstract only, no actionable elements |
| 2 | Vague suggestions |
| 3 | Clear, actionable suggestions |
| 4 | Specific actions with reasoning and context |

**Target:** Average score ≥ 3.0

### Dimension 4: Emotional Safety (An toàn cảm xúc)

| Score | Description |
|-------|-------------|
| 1 | Judgmental, prescriptive, or potentially harmful |
| 2 | Neutral but could be interpreted negatively |
| 3 | Supportive, non-judgmental |
| 4 | Gently empowering, respects user autonomy |

**Target:** Average score ≥ 3.5 (higher bar)

### Dimension 5: Non-Dogmatism (Không giáo điều)

| Score | Description |
|-------|-------------|
| 1 | Absolute claims, no uncertainty acknowledged |
| 2 | Mostly prescriptive |
| 3 | Tentative language, suggestions not commands |
| 4 | Clearly framed as interpretation, invites user's own meaning-making |

**Target:** Average score ≥ 3.0

### Dimension 6: Explainability Consistency (Nhất quán giải thích)

| Score | Description |
|-------|-------------|
| 1 | No claim type markers, facts mixed with interpretation |
| 2 | Some markers but inconsistent |
| 3 | Consistent claim types, most sections labeled |
| 4 | Perfect separation, all claims properly typed, evidence linked |

**Target:** Average score ≥ 3.5

## 15.3. Review Process

### Sampling Strategy

| Phase | Sample Size | Frequency |
|-------|-------------|-----------|
| Pre-launch (alpha) | 100% of insights | Daily |
| Soft launch | 20% of insights | Daily |
| Full launch | 5% of insights | Weekly |
| Post-launch (stable) | 1% of insights | Monthly |

### Review Workflow

```
1. Generate insight
2. Human reviewer evaluates on 6 dimensions
3. If any dimension < 2: Reject and regenerate
4. If average < 3.0: Flag for prompt improvement
5. If all dimensions ≥ 3: Approve
6. Log scores for trend analysis
```

### Reviewer Guidelines

**Good Reviewer:**
- Understands numerology concepts
- Understands product philosophy
- Can empathize with user personas
- Trained on emotional safety

**Calibration:**
- Weekly calibration sessions
- Compare scores across reviewers
- Discuss borderline cases

## 15.4. Rubric Scorecard Template

```
┌────────────────────────────────────────────────────────────────┐
│  INSIGHT REVIEW                                               │
├────────────────────────────────────────────────────────────────┤
│  Insight ID: ________  Date: ________  Reviewer: ________     │
│                                                                │
│  Dimension 1: Specificity                                     │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  Dimension 2: Personal Relevance                              │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  Dimension 3: Practicality                                    │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  Dimension 4: Emotional Safety                                │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  Dimension 5: Non-Dogmatism                                   │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  Dimension 6: Explainability Consistency                      │
│  [1] [2] [3] [4]  Score: ___  Notes: ________________        │
│                                                                │
│  ──────────────────────────────────────────────────────────── │
│  AVERAGE SCORE: ___/4                                         │
│                                                                │
│  [Approve]  [Reject & Regenerate]  [Flag for Review]          │
└────────────────────────────────────────────────────────────────┘
```

## 15.5. Trend Analysis

Track over time:
- Average score per dimension
- Score distribution
- Common failure patterns
- Reviewer consistency

---

# 16. Insight Safety Policy

## 16.1. Purpose

Đây là app động chạm tới self-concept và emotional state. Policy này đảm bảo insights không gây hại và giữ framing đúng.

## 16.2. Core Safety Principles

### Principle 1: No Absolute Claims About Personhood

❌ **Prohibited:**
- "You are a [personality type]"
- "You will always struggle with [X]"
- "Your nature is [fixed trait]"

✅ **Instead:**
- "You've described experiencing [X]"
- "Patterns in your history suggest [tendency]"
- "You might explore [area]"

### Principle 2: No Reinforcement of Negative Self-Beliefs

❌ **Prohibited:**
- "You always sabotage relationships"
- "You're not good at [X]"
- "Your pattern is failure in [area]"

✅ **Instead:**
- "You've noted challenges in [area]"
- "Some users find it helpful to explore [X]"
- "What might support look like for you in [area]?"

### Principle 3: No Fatalistic or Destiny Language

❌ **Prohibited:**
- "This is your destiny"
- "You were meant to [X]"
- "It is written that [X]"
- "Your number means you will [X]"

✅ **Instead:**
- "Some interpretations of this cycle suggest..."
- "You might explore how [X] relates to your goals"
- "This could be a time to consider..."

### Principle 4: No Dangerous Directives

❌ **Prohibited:**
- Any suggestion to harm self or others
- Medical advice
- Financial advice
- Legal advice
- Relationship ultimatum suggestions
- Major life decision commands

✅ **Instead:**
- "Consider consulting a professional for [X]"
- "This is a personal reflection tool, not professional advice"
- "Take what resonates, leave what doesn't"

### Principle 5: Maintain Open, Reflective Framing

✅ **Required:**
- Use questions, not commands
- Offer perspectives, not conclusions
- Invite user's own interpretation
- Acknowledge uncertainty
- Respect user autonomy

## 16.3. Language Guidelines

### Preferred Language

| Use | Instead of |
|-----|------------|
| "may" | "will" |
| "might consider" | "should" |
| "could be helpful" | "is the solution" |
| "some people find" | "you need" |
| "explore" | "fix" |
| "notice" | "your problem is" |
| "curious about" | "you are" |

### Topics Requiring Extra Care

| Topic | Special Handling |
|-------|------------------|
| Mental health | Never diagnose, always defer to professionals |
| Relationships | No ultimatums, focus on user's own experience |
| Career | No "should," frame as exploration |
| Major decisions | Encourage reflection, not action |
| Past trauma | Acknowledge without re-traumatizing |
| Self-worth | Always affirming, never diminishing |

## 16.4. Safety Review Checklist

Before any insight goes to user:

```
□ No absolute claims about user's nature
□ No reinforcement of negative beliefs
□ No fatalistic/destiny language
□ No dangerous directives
□ Open, reflective framing maintained
□ Appropriate uncertainty markers
□ No medical/financial/legal advice
□ Sensitive topics handled with care
□ User autonomy respected
□ Claim types properly separated
```

## 16.5. Escalation Protocol

### If Unsafe Content Detected

1. **Immediate:** Block insight from delivery
2. **Review:** Human reviewer assesses
3. **Log:** Document for pattern analysis
4. **Fix:** Adjust prompt/model
5. **Retest:** Verify fix works

### Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| Critical | Harmful content | Immediate block, same-day fix |
| High | Inappropriate advice | Block, fix within 24h |
| Medium | Tone issue | Flag, fix within week |
| Low | Minor language | Log, batch fix |

## 16.6. User Safety Controls

Users can:
- Mark insight as "unhelpful" or "concerning"
- Request no content on specific topics
- Access support resources
- Report content for review
- Delete any stored data

## 16.7. Safety Metrics

| Metric | Target |
|--------|--------|
| Critical content incidents | 0 |
| High severity incidents | < 0.1% |
| User safety reports | < 0.5% |
| "Feeling judged" feedback | < 5% |

---

# 17. Notifications, Delivery & User Preferences

## 17.0. Notification Philosophy

> **Core Principles:**
>
> 1. **Support, not persuade:** Notifications are a support layer for ritual formation, not a persuasion or urgency mechanism.
>
> 2. **Opt-in by default:** All outbound channels are opt-in, user-configurable, and respect privacy mode, quiet hours, and platform capabilities.
>
> 3. **Content boundary:** No journal text, inferred sensitive emotional state, or private pattern detail may appear in lock-screen-visible surfaces.
>
> 4. **Startup boundary:** Launch-on-startup is an optional retention preference for engaged desktop users, never a required or default behavior.

## 17.1. Delivery Channels

### 17.1.1. Platform-First Channel Strategy

> **Important:** Product này là **desktop-first**. Platform priority ảnh hưởng notification strategy:
> - **Desktop Notification (MVP):** Native OS notification cho macOS/Windows
> - **Mobile Push (Future):** Khi có mobile app, không phải MVP

| Channel | Platform | Use Cases | Priority | MVP |
|---------|----------|-----------|----------|-----|
| In-App | All | Daily insights, immediate feedback | Primary | ✅ |
| Desktop Notification | Desktop (macOS/Windows) | Morning insight, evening journal | Secondary | ✅ |
| Mobile Push | Mobile (iOS/Android) | Reminders, alerts | Secondary | Phase 3+ |
| Email | All | Weekly/Monthly reports, reactivation | Tertiary | Phase 2 |
| Desktop Widget | Desktop | Quick glance at daily theme | Optional | Phase 3 |

### 17.1.2. Desktop Notification (MVP)

```json
{
  "desktop_notification": {
    "platform_support": {
      "macos": "native_notification_center",
      "windows": "windows_action_center"
    },
    "capabilities": {
      "sound": true,
      "badge": false,
      "actions": ["open_app", "dismiss"],
      "rich_content": false
    },
    "mvp_scope": ["morning_insight", "evening_journal", "cycle_transition"]
  }
}
```

### 17.1.3. Mobile Push (Phase 3+)

> **Deferred:** Mobile push chỉ implement khi có mobile app. Không build infrastructure cho mobile push trong MVP.

### 17.1.4. Email Delivery (Phase 2)

**Email Purpose:**
- **Recap:** Weekly/monthly summary delivered to inbox
- **Reactivation:** Re-engage users who haven't opened app in 7+ days
- **Archive:** Persistent record of reports for reference
- **NOT Daily Channel:** Email không phải kênh primary cho daily ritual

```json
{
  "email_delivery": {
    "enabled": false,
    "purpose": ["recap", "reactivation", "archive"],
    "address": null,
    "verification_status": "pending",
    "types": {
      "weekly_report": {
        "enabled": true,
        "day": "sunday",
        "time": "09:00",
        "format": "html",
        "purpose": "recap"
      },
      "monthly_report": {
        "enabled": true,
        "day": 1,
        "time": "09:00",
        "format": "html",
        "purpose": "recap + archive"
      },
      "reactivation": {
        "enabled": true,
        "trigger": "no_app_open_7_days",
        "frequency_cap": "once_per_week",
        "purpose": "reactivation"
      },
      "daily_insight_email": {
        "enabled": false,
        "not_recommended": true,
        "reason": "Email should not be primary daily channel"
      }
    }
  }
}
```

**Email Content Rules:**
- Weekly/Monthly reports: Full HTML with charts and summaries
- Never include sensitive journal content in email
- Always include unsubscribe link
- Preview text must be meaningful without opening

### 17.1.5. Desktop Notification Specifications (MVP)

| Type | Title Template | Body Template | Action |
|------|----------------|---------------|--------|
| Morning Insight | "Good morning ☀️" | "Your {theme} insight is ready" | Open to daily view |
| Evening Journal | "Time to reflect 🌙" | "How did your day go?" | Open to journal |
| Cycle Transition | "New cycle begins" | "Entering Personal {cycle_type} {number}" | Open to cycle view |

## 17.2. Notification Content Policy

### 17.2.1. What MAY Appear in Notifications

| Content | Desktop Notification | Email |
|---------|---------------------|-------|
| Headline/theme | ✅ | ✅ |
| Claim type badge | ✅ | ✅ |
| Cycle number | ✅ | ✅ |
| CTA to open app | ✅ | ✅ |
| Pattern count (aggregated) | ✅ | ✅ |
| Report summary | ❌ | ✅ |

### 17.2.2. What MUST NOT Appear in Notifications

| Content | Reason |
|---------|--------|
| Journal text/excerpts | Privacy - visible on lock screen |
| Inferred emotional state | Privacy + potential embarrassment |
| Specific pattern details | Privacy - patterns may be sensitive |
| Reflection questions | Too personal for notification surface |
| Predictive statements | Violates trust architecture |
| Personal advice | Should be consumed in-app with full context |

### 17.2.3. Content Policy Example

```
✅ ALLOWED:
  Title: "Good morning"
  Body: "Your reflection insight is ready"
  Body: "Personal Day 5 theme: Change"

❌ NOT ALLOWED:
  Body: "You seemed stressed yesterday, here's advice..."
  Body: "Your pattern: you often feel anxious on Day 9"
  Body: "Why did you skip journaling last night?"
```

## 17.3. Notification Preferences

### 17.3.1. Preference Schema

```json
{
  "notification_preferences": {
    "morning_insight": {
      "enabled": true,
      "channel": ["desktop", "in_app"],
      "time": "06:30",
      "timezone": "auto",
      "style": "brief"
    },
    "evening_journal": {
      "enabled": true,
      "channel": ["desktop"],
      "time": "21:00",
      "timezone": "auto"
    },
    "weekly_report": {
      "enabled": true,
      "channel": ["in_app", "email"],
      "day": "sunday",
      "time": "09:00"
    },
    "monthly_report": {
      "enabled": true,
      "channel": ["in_app", "email"],
      "day": 1,
      "time": "09:00"
    },
    "cycle_transition": {
      "enabled": true,
      "channel": ["desktop", "in_app"],
      "advance_notice": true
    },
    "pattern_alert": {
      "enabled": true,
      "channel": ["in_app"],
      "frequency": "weekly_digest"
    },
    "sound": {
      "enabled": true,
      "type": "gentle_chime"
    }
  }
}
```

### 17.3.2. Quiet Hours

```json
{
  "quiet_hours": {
    "enabled": true,
    "mode": "scheduled",
    "schedule": {
      "start": "22:00",
      "end": "07:00",
      "timezone": "auto",
      "weekends_different": false,
      "weekend_start": "23:00",
      "weekend_end": "09:00"
    },
    "behavior": {
      "suppress_push": true,
      "suppress_sound": true,
      "queue_for_delivery": false,
      "in_app_visible": true
    },
    "override_rules": {
      "cycle_transition": false,
      "critical_only": true
    }
  }
}
```

## 17.4. Consent & Privacy for Notifications

### 17.4.1. Notification Consent Flow

```
┌────────────────────────────────────────────────────────────────┐
│  NOTIFICATION PERMISSION REQUEST                                │
│                                                                 │
│  "Would you like to receive daily insights and reminders?"      │
│                                                                 │
│  [Enable Notifications]  [Not Now]  [Settings]                  │
│                                                                 │
│  Note: "You can adjust these anytime in Settings"               │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  NOTIFICATION PREFERENCES (after enabling)                      │
│                                                                 │
│  "When should we deliver your daily insight?"                   │
│  [ Time Picker: 06:30 ]                                         │
│                                                                 │
│  "Evening journal reminder?"                                    │
│  [ Toggle ] — [ Time Picker: 21:00 ]                            │
│                                                                 │
│  "Weekly report notification?"                                  │
│  [ Toggle ] — [ Day: Sunday ] [ Time: 09:00 ]                   │
└────────────────────────────────────────────────────────────────┘
```

### 17.4.2. Privacy Rules for Notifications

| Rule | Implementation |
|------|----------------|
| No sensitive content in push | Push shows only "Your insight is ready" |
| No journal excerpts in notifications | Never quote user's own writing |
| Email requires explicit consent | Separate opt-in from push notifications |
| Unsubscribe always available | One-click unsubscribe in every email |
| Data minimization in payload | Notification contains ID, not full content |

### 17.4.3. Notification Data Retention

```json
{
  "notification_retention": {
    "delivered_notifications": "30 days",
    "failed_deliveries": "7 days",
    "open_rates": "90 days (aggregated)",
    "preference_history": "1 year",
    "email_delivery_logs": "30 days"
  }
}
```

## 17.5. Platform-Specific Features

### 17.5.1. Desktop Application Features

```json
{
  "desktop_features": {
    "launch_on_startup": {
      "available": true,
      "default": false,
      "user_controllable": true,
      "suggest_after_days": 5,
      "suggest_condition": "user_opened_app_3_consecutive_days",
      "minimize_to_tray": true,
      "rationale": "Only suggest after user has established ritual value"
    },
    "system_tray": {
      "available": true,
      "show_daily_theme": true,
      "quick_actions": ["open_journal", "view_insight", "quit"],
      "badge_count": true
    },
    "background_sync": {
      "available": true,
      "default": true,
      "sync_interval_minutes": 30,
      "wifi_only_option": true
    },
    "offline_mode": {
      "available": true,
      "cache_days": 7,
      "sync_on_reconnect": true
    },
    "window_behavior": {
      "close_to_tray": true,
      "minimize_to_tray": true,
      "remember_position": true,
      "always_on_top_option": false
    }
  }
}
```

**Launch on Startup Behavior:**

| Day | Behavior | UX |
|-----|----------|-----|
| Day 0-4 | OFF, no suggestion | User discovers value first |
| Day 5+ | Gentle suggestion if usage pattern established | "Would you like [App] to start with your day?" |
| After enable | On by default, user can disable | In Settings > App Behavior |
| Never force | Always optional | Respects startup boundary principle |

### 17.5.2. Mobile Application Features (Future)

> **Note:** Mobile là future platform. Features được phân phase để tránh scope creep.

**Phase 3a: Core Mobile**
```json
{
  "mobile_phase_3a": {
    "background_fetch": {
      "available": true,
      "interval": "system_managed",
      "pre_fetch_insights": true
    },
    "basic_push": {
      "available": true,
      "types": ["morning_insight", "evening_journal"]
    }
  }
}
```

**Phase 3b: Widgets & Shortcuts**
```json
{
  "mobile_phase_3b": {
    "widget": {
      "available": true,
      "types": ["daily_theme", "cycle_summary"],
      "refresh_interval": "daily",
      "tap_action": "open_app"
    },
    "siri_shortcuts": {
      "available": true,
      "phrases": ["Show my numerology", "Open my journal", "What's my daily insight"]
    }
  }
}
```

**Phase 4: Watch & Advanced**
```json
{
  "mobile_phase_4": {
    "complications": {
      "available": true,
      "data": ["personal_day", "daily_theme_emoji"],
      "complexity": "high",
      "requires": "watch_app_build"
    },
    "rich_notifications": {
      "available": true,
      "actions": ["journal_quick_entry", "mark_read"]
    }
  }
}
```

### 17.5.3. Cross-Platform Sync

```json
{
  "sync_settings": {
    "enabled": true,
    "sync_content": [
      "profile",
      "preferences",
      "journal_entries",
      "insight_history",
      "notification_preferences"
    ],
    "conflict_resolution": "last_write_wins_with_notification",
    "sync_on": ["wifi_preferred", "cellular_allowed_user_choice"],
    "manual_sync_available": true
  }
}
```

## 17.6. User Preference Center

### 17.6.1. Settings Structure

```
Settings
├── Notifications
│   ├── Daily Insight
│   │   ├── Enable/Disable
│   │   ├── Time
│   │   └── Style (Brief/Detailed)
│   ├── Evening Journal
│   │   ├── Enable/Disable
│   │   └── Time
│   ├── Reports
│   │   ├── Weekly (Day, Time)
│   │   └── Monthly (Day, Time)
│   ├── Quiet Hours
│   │   ├── Enable/Disable
│   │   └── Schedule
│   └── Sound & Badge
│       ├── Notification Sound
│       └── Badge Count
├── Email Delivery (Phase 2)
│   ├── Email Address
│   ├── Verification Status
│   └── Email Types
├── App Behavior
│   ├── Launch on Startup (Desktop)
│   ├── Background Sync
│   ├── Offline Mode
│   └── Data Usage (Mobile)
└── Privacy
    ├── Notification Content
    └── Data Retention
```

### 17.6.2. Default Values

| Setting | Default | Rationale |
|---------|---------|-----------|
| Morning Insight | Enabled, 06:30 | Core value proposition |
| Evening Journal | Enabled, 21:00 | Habit formation |
| Weekly Report | Enabled, Sunday 09:00 | Weekly rhythm |
| Monthly Report | Enabled, 1st 09:00 | Monthly reflection |
| Quiet Hours | Enabled, 22:00-07:00 | Respect boundaries |
| Launch on Startup | Disabled | User choice, suggest after Day 5 |
| Background Sync | Enabled | Seamless experience |
| Email Delivery | Disabled | Requires explicit consent |

## 17.7. Notification Metrics

### 17.7.1. Cohort-Based Opt-Out Metrics

> **Important:** Opt-out rate nên đo theo cohort và channel, không dùng một con số chung.

| Cohort | Channel | D7 Opt-out Target | D30 Opt-out Target | Alert Threshold |
|--------|---------|-------------------|--------------------|-----------------|
| New users | Desktop Notification | < 15% | < 25% | D7 > 25% |
| New users | Email (if enabled) | < 20% | < 30% | D7 > 35% |
| Engaged (7+ days) | Desktop Notification | < 5% | < 10% | > 15% |
| Engaged (7+ days) | Email | < 10% | < 15% | > 20% |

### 17.7.2. Channel-Specific Delivery Metrics

| Channel | Metric | Target | Alert Threshold |
|---------|--------|--------|-----------------|
| Desktop Notification | Delivery rate | > 98% | < 95% |
| Desktop Notification | Open rate (24h) | > 40% | < 25% |
| Desktop Notification | Action completion | > 60% | < 40% |
| Email | Delivery rate | > 99% | < 97% |
| Email | Open rate | > 30% | < 15% |
| Email | Click-through rate | > 10% | < 5% |

### 17.7.3. Notification Type Performance

| Type | Open Rate Target | Action Rate Target | Notes |
|------|------------------|--------------------|-------|
| Morning Insight | > 45% | > 65% | Core ritual |
| Evening Journal | > 35% | > 50% | Secondary habit |
| Weekly Report | > 50% | > 70% | High-value content |
| Cycle Transition | > 60% | > 80% | Rare, high-interest |

### 17.7.4. Engagement Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Time to open (median) | Time from notification to app open | < 30 min |
| Action completion rate | % completing intended action | > 60% |
| Quiet hours compliance | % correctly suppressed | > 99% |
| Preference change frequency | Changes per user per month | < 2 |
| Re-enable rate | % who re-enable after opt-out | > 20% (within 30 days) |

### 17.7.5. Notification Health Score

```
Notification Health = (Delivery Rate × 0.2) +
                      (Open Rate × 0.3) +
                      (Action Rate × 0.3) +
                      (1 - Opt-out Rate) × 0.2)

Target: > 0.70
Alert: < 0.50
```

---

# Appendices

## Appendix A: Numerology Calculation Reference

### Life Path Number

```
Example: December 25, 1990

Step 1: Reduce each component
- Month: 12 → 1 + 2 = 3
- Day: 25 → 2 + 5 = 7
- Year: 1990 → 1 + 9 + 9 + 0 = 19 → 1 + 9 = 10 → 1 + 0 = 1

Step 2: Sum and reduce
- 3 + 7 + 1 = 11 (Master Number - do not reduce)

Result: Life Path 11
```

### Personal Day Number

```
Example: January 15, 2024, with Personal Month 3

Personal Day = Personal Month + Day
= 3 + 15
= 3 + (1 + 5)
= 3 + 6
= 9

Result: Personal Day 9
```

### Master Numbers

- 11, 22, 33 are Master Numbers
- Do not reduce these unless final sum > 33
- Display with special formatting

---

## Appendix B: Prompt Template Structure

```
## System Context
You are a personal numerology companion that provides interpretive
guidance based on numerology cycles and personal history.

## Critical Rules
1. NEVER use predictive language (will, certainly, definitely)
2. ALWAYS separate claim types with markers
3. ALWAYS acknowledge uncertainty
4. NEVER make absolute claims about user's nature
5. ALWAYS respect user autonomy

## Claim Type Markers
- [CALCULATED] for deterministic numerology outputs
- [OBSERVED: X times] for patterns from history
- [INTERPRETED] for AI interpretations
- [EXPLORATORY] for open-ended suggestions

## User Profile
{user_profile_json}

## Numerology Context
{numerology_context_json}

## Recent History
{recent_history_json}

## Trust Constraints
{trust_constraints_json}

## Task
Generate a personalized daily insight following all rules above.

## Output Format
{output_schema_json}
```

---

## Appendix C: Database Schema Overview

```
users
├── id (PK)
├── created_at
├── updated_at
├── full_name
├── date_of_birth
├── preferences (JSON)
├── privacy_mode
└── current_profile_version

profile_versions
├── id (PK)
├── user_id (FK)
├── version_number
├── created_at
├── change_reason
├── data (JSON)
└── is_current

numerology_profiles
├── id (PK)
├── user_id (FK)
├── life_path
├── destiny_number
├── soul_urge
├── personality_number
├── birthday_number
└── calculated_at

daily_cycles
├── id (PK)
├── user_id (FK)
├── date
├── personal_year
├── personal_month
├── personal_day
└── calculated_at

daily_insights
├── id (PK)
├── user_id (FK)
├── date
├── insight_json (JSON)
├── claim_types_used (JSON)
├── prompt_version
├── model_used
└── generated_at

journal_entries
├── id (PK)
├── user_id (FK)
├── date
├── mood_score
├── energy_score
├── emotions (JSON)
├── key_events (JSON)
├── free_reflection (encrypted)
├── insight_feedback (JSON)
├── profile_version_at_entry
└── created_at

memory_fragments
├── id (PK)
├── user_id (FK)
├── type (profile/pattern/event/mood)
├── content (JSON)
├── strength_score
├── recency_score
├── confirmation_count
├── contradiction_count
├── net_confidence
├── last_accessed
└── created_at

patterns
├── id (PK)
├── user_id (FK)
├── pattern_type
├── description
├── occurrences
├── consistency_score
├── net_confidence
├── user_validated
├── profile_version_created
├── last_observed
└── created_at

weekly_reports
├── id (PK)
├── user_id (FK)
├── week_start_date
├── week_end_date
├── report_json (JSON)
└── generated_at

monthly_reports
├── id (PK)
├── user_id (FK)
├── month
├── year
├── report_json (JSON)
└── generated_at

insight_variants
├── id (PK)
├── variant_id
├── parameters (JSON)
├── performance (JSON)
├── is_active
└── created_at

insight_reviews
├── id (PK)
├── insight_id (FK)
├── reviewer_id
├── specificity_score
├── relevance_score
├── practicality_score
├── emotional_safety_score
├── non_dogmatism_score
├── explainability_score
├── average_score
├── status (approved/rejected/flagged)
├── notes
└── reviewed_at
```

---

## Appendix D: API Integration Specs

### Deepseek Reasoner API

```
Endpoint: https://api.deepseek.com/v1/chat/completions
Model: deepseek-reasoner
Max Tokens: 4000
Temperature: 0.7

Headers:
- Authorization: Bearer {api_key}
- Content-Type: application/json

Request Body:
{
  "model": "deepseek-reasoner",
  "messages": [
    {"role": "system", "content": "{system_prompt}"},
    {"role": "user", "content": "{user_context}"}
  ],
  "max_tokens": 4000,
  "temperature": 0.7
}

Response Handling:
- Parse structured output
- Validate claim type markers
- Calculate confidence scores
- Store with metadata
```

### Error Handling

```
On API Failure:
1. Retry with exponential backoff (max 3 retries)
2. If still failing, use cached insight from previous day
3. Log error for monitoring
4. Display graceful message to user
```

---

# Change Log

## v1.1 (Current) — Major Revision

### Strategic Changes

| Change | Section | Rationale |
|--------|---------|-----------|
| Added Product Thesis | §1.2 | Clarify core value proposition |
| Added Core Promise | §1.3 | Focus feature prioritization |
| Added MVP Thesis | §1.4 | Guide first release scope |
| Expanded Non-goals | §2.1 | Clear product boundaries |
| Added Trust Thesis | §2.5 | Foundation for trust architecture |
| Rewrote Product Language | §2.4 | Avoid predictive framing |

### User Value Changes

| Change | Section | Rationale |
|--------|---------|-----------|
| Added JTBD Framework | §3.1 | Align features with user jobs |
| Updated Personas | §3.2 | Link to JTBD priorities |
| Updated User Journeys | §4 | Reflect claim types in flow |

### Trust Architecture Changes

| Change | Section | Rationale |
|--------|---------|-----------|
| Renamed to Trust Architecture | §7 | Broader than just confidence |
| Added 4-tier Claim Types | §7.2 | Separate fact from interpretation |
| Added Epistemic Rules | §7.2 | Prevent mixed claims |
| Enhanced Explainability | §7.4 | Show claim type breakdown |

### Learning System Changes

| Change | Section | Rationale |
|--------|---------|-----------|
| Added Memory Decay Model | §5.4.2 | Patterns shouldn't be permanent |
| Added Profile Versioning | §6.2 | Profile always editable |
| Removed Profile Lock | §6.2 | Allow user evolution |

### Execution Changes

| Change | Section | Rationale |
|--------|---------|-----------|
| Rewrote Roadmap | §13 | 3-phase approach, more realistic |
| Added 4 Metric Categories | §12 | Activation, Habit, Distinctiveness, Trust |
| Added Failure Modes | §14 | Anticipate and mitigate issues |
| Added Human Review Rubric | §15 | Quality assurance framework |
| Added Insight Safety Policy | §16 | Emotional safety guidelines |

### Structural Changes

| Change | Description |
|--------|-------------|
| 17 sections (was 13) | Added §14, §15, §16, §17 |
| Renamed §7 | Confidence Layer → Trust Architecture |
| Reorganized §12 | Grouped metrics by category |
| Reorganized §13 | 3-layer roadmap vs 6-phase |
| Added §17 | Notifications, Delivery & User Preferences |

### §17 Addition Details

| Subsection | Content |
|------------|---------|
| §17.0 | Notification Philosophy (4 core principles) |
| §17.1 | Delivery Channels (desktop-first strategy, email purpose) |
| §17.2 | Notification Content Policy (allowed/forbidden content) |
| §17.3 | Notification Preferences & Quiet Hours |
| §17.4 | Consent & Privacy for Notifications |
| §17.5 | Platform-Specific Features (desktop startup behavior, mobile phases) |
| §17.6 | User Preference Center structure |
| §17.7 | Cohort-based Notification Metrics |

### §17 Refinements (Post-Review)

| Refinement | Change |
|------------|--------|
| Desktop-first strategy | Clarified desktop notification (MVP) vs mobile push (Phase 3+) |
| Email purpose | Defined as recap/reactivation/archive, NOT daily channel |
| Notification Content Policy | Added explicit allowed/forbidden content rules |
| Launch on Startup | Changed to suggest after Day 5, never default ON |
| Mobile features | Split into Phase 3a, 3b, 4 to avoid scope creep |
| Opt-out metrics | Changed from single target to cohort/channel-based |
| Section 5.6 clarification | Added note distinguishing capability vs strategy |

## v1.0 — Initial Release

- Original PRD structure
- 13 sections
- Basic confidence system
- 10-week roadmap
- Standard metrics

---

# Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | [Author] | Initial PRD |
| 1.1 | 2024 | [Author] | Major revision based on review |

---

**End of PRD v1.1**
