/**
 * Mock data cho UC-34/UC-35 — dùng khi backend offline
 * ĐẶT USE_MOCK = false khi backend online
 */
export const USE_MOCK = false;

/* ------------------------------------------------------------------ */
/*  Mock CV list                                                       */
/* ------------------------------------------------------------------ */
export const MOCK_CV_LIST = [
  {
    cvId: "1",
    fileName: "CV Kỹ sư Phần mềm - Update May 2024",
    uploadDate: "2024-05-15T10:00:00Z",
    fileUrl: "#",
    status: "Valid" as const,
  },
  {
    cvId: "2",
    fileName: "CV Backend Developer - Trương Bảo Minh",
    uploadDate: "2024-06-01T08:30:00Z",
    fileUrl: "#",
    status: "Valid" as const,
  },
  {
    cvId: "3",
    fileName: "CV Senior React Developer",
    uploadDate: "2024-04-20T14:00:00Z",
    fileUrl: "#",
    status: "Valid" as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Mock Interview Cost                                                */
/* ------------------------------------------------------------------ */
export const MOCK_COST = {
  requiresPayment: false,
  isFree: true,
  freeUsedMock: 1,
  freeLimit: 5,
  remainingFree: 4,
};

/* ------------------------------------------------------------------ */
/*  Mock Setup Response (AI phân loại JD)                              */
/* ------------------------------------------------------------------ */
export const MOCK_SETUP_RESPONSE = {
  position: "Backend Developer",
  skill: "Node.js",
  skills: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "REST API"],
  level: "Junior",
  company: "FPT Software",
  requirements: [
    "Tối thiểu 1 năm kinh nghiệm phát triển Backend",
    "Thành thạo Node.js/TypeScript hoặc Java/Spring Boot",
    "Có kinh nghiệm với database SQL (PostgreSQL/MySQL)",
    "Hiểu biết về Docker, CI/CD pipeline",
    "Khả năng làm việc nhóm theo Agile/Scrum",
  ],
  levelMismatchWarning: null,
};

/* ------------------------------------------------------------------ */
/*  Mock Create Session                                                */
/* ------------------------------------------------------------------ */
export const MOCK_SESSION = {
  sessionId: 999,
  language: "vi-VN",
};

/* ------------------------------------------------------------------ */
/*  Mock Welcome Message                                               */
/* ------------------------------------------------------------------ */
export const MOCK_WELCOME =
  "Chào bạn! Tôi là Bernie, chuyên gia phỏng vấn AI của IMATE. Hôm nay chúng ta sẽ thực hiện một buổi phỏng vấn cho vị trí Backend Developer tại FPT Software. Hãy thoải mái và trả lời tự nhiên nhất nhé. Chúng ta bắt đầu thôi!";

/* ------------------------------------------------------------------ */
/*  Mock Questions (10 câu)                                            */
/* ------------------------------------------------------------------ */
export const MOCK_QUESTIONS = [
  {
    interviewResponseId: 101,
    questionText:
      "Chào bạn, hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc với Backend development của bạn.",
    topic: "Introduction",
  },
  {
    interviewResponseId: 102,
    questionText:
      "Bạn có thể giải thích sự khác biệt giữa SQL và NoSQL database không? Khi nào bạn sẽ chọn PostgreSQL thay vì MongoDB?",
    topic: "Database",
  },
  {
    interviewResponseId: 103,
    questionText:
      "Hãy mô tả cách bạn thiết kế một REST API cho hệ thống quản lý người dùng. Bạn sẽ cấu trúc các endpoints như thế nào?",
    topic: "REST API Design",
  },
  {
    interviewResponseId: 104,
    questionText:
      "Bạn hiểu thế nào về middleware trong Express.js/Node.js? Hãy cho một ví dụ về cách sử dụng middleware trong thực tế.",
    topic: "Node.js",
  },
  {
    interviewResponseId: 105,
    questionText:
      "Docker là gì và tại sao nó quan trọng trong phát triển phần mềm hiện đại? Bạn đã sử dụng Docker trong dự án nào chưa?",
    topic: "Docker",
  },
  {
    interviewResponseId: 106,
    questionText:
      "Hãy giải thích cách bạn xử lý authentication và authorization trong một ứng dụng web. JWT hoạt động như thế nào?",
    topic: "Security",
  },
  {
    interviewResponseId: 107,
    questionText:
      "Bạn đã từng gặp vấn đề về performance trong ứng dụng Backend chưa? Bạn đã giải quyết nó như thế nào?",
    topic: "Performance",
  },
  {
    interviewResponseId: 108,
    questionText:
      "TypeScript mang lại những lợi ích gì so với JavaScript thuần khi phát triển Backend? Hãy cho ví dụ cụ thể.",
    topic: "TypeScript",
  },
  {
    interviewResponseId: 109,
    questionText:
      "Bạn hiểu thế nào về CI/CD? Hãy mô tả quy trình deploy một ứng dụng từ code đến production mà bạn đã thực hiện.",
    topic: "CI/CD",
  },
  {
    interviewResponseId: 110,
    questionText:
      "Nếu được nhận vào vị trí này, bạn mong muốn phát triển bản thân theo hướng nào trong 1-2 năm tới?",
    topic: "Career Goals",
  },
];
