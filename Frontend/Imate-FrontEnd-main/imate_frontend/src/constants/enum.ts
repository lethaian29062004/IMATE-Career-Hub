// Enum for System Question Difficulty Levels
export const DifficultyLevel = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard'
} as const;

// Array for dropdown options
export const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.Easy, label: 'Easy' },
  { value: DifficultyLevel.Medium, label: 'Medium' },
  { value: DifficultyLevel.Hard, label: 'Hard' }
];


export const ApplicationStatus = {
  Pending: "Pending",
  InReview: "InReview",
  Approved: "Approved",
  Rejected: "Rejected",
} as const;

export type ApplicationStatusType = keyof typeof ApplicationStatus;

export const APPLICATION_STATUS_OPTIONS = [
  { value: ApplicationStatus.Pending, label: "Chờ xử lý" },
  { value: ApplicationStatus.InReview, label: "Đang xử lý" },
  { value: ApplicationStatus.Approved, label: "Đã duyệt" },
  { value: ApplicationStatus.Rejected, label: "Bị từ chối" },
] as const;

export const ApplicationType = {
  TechnicalError: "TechnicalError",
  ReportMentor: "ReportMentor",
  ReportRating: "ReportRating",
  ReportComment: "ReportComment",
} as const;

export type ApplicationTypeEnum = keyof typeof ApplicationType;

export const APPLICATION_TYPE_LABELS: Record<ApplicationTypeEnum, string> = {
  [ApplicationType.TechnicalError]: "Đơn Lỗi Kỹ Thuật",
  [ApplicationType.ReportMentor]: "Đơn Tố Cáo Mentor",
  [ApplicationType.ReportRating]: "Đơn Tố Cáo Rating",
  [ApplicationType.ReportComment]: "Đơn Tố Cáo Comment",
} as const;

export const APPLICATION_TYPE_OPTIONS = [
  { value: ApplicationType.TechnicalError, label: "Đơn Lỗi Kỹ Thuật" },
  { value: ApplicationType.ReportMentor, label: "Đơn Tố Cáo Mentor" },
  { value: ApplicationType.ReportRating, label: "Đơn Tố Cáo Rating" },
  { value: ApplicationType.ReportComment, label: "Đơn Tố Cáo Comment" },
] as const;

export const getApplicationTypeLabel = (type: string): string => {
  return APPLICATION_TYPE_LABELS[type as ApplicationTypeEnum] || "Không xác định";
};

export const TransactionStatus = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
  Cancelled: "Cancelled",
  Escrow: "Escrow",
} as const;

export type TransactionStatusType = keyof typeof TransactionStatus;

export const TRANSACTION_STATUS_OPTIONS = [
  { value: TransactionStatus.Pending, label: "Chờ xử lý" },
  { value: TransactionStatus.Completed, label: "Hoàn thành" },
  { value: TransactionStatus.Failed, label: "Thất bại" },
  { value: TransactionStatus.Cancelled, label: "Đã hủy" },
  { value: TransactionStatus.Escrow, label: "Đang giữ hộ" },
] as const;

export const TransactionType = {
  Deposit: "Deposit",
  Withdrawal: "Withdrawal",
  Subscription: "Subscription",
  Refund: "Refund",
  Penalty: "Penalty",
  BookingFee: "BookingFee",
  BookingPayout: "BookingPayout",
  InterviewFee: "InterviewFee",
} as const;

export type TransactionTypeEnum = keyof typeof TransactionType;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.Deposit, label: "Nạp tiền" },
  { value: TransactionType.Withdrawal, label: "Rút tiền" },
  { value: TransactionType.Subscription, label: "Gói dịch vụ" },
  { value: TransactionType.Refund, label: "Hoàn tiền" },
  { value: TransactionType.Penalty, label: "Phí phạt" },
  { value: TransactionType.BookingFee, label: "Phí đặt lịch" },
  { value: TransactionType.BookingPayout, label: "Phí Mentor" },
  { value: TransactionType.InterviewFee, label: "Phí phỏng vấn" },
];

export const ReportReason = {
  Spam: "Spam",
  Harassment: "Harassment",
  InappropriateContent: "InappropriateContent",
  HateSpeech: "HateSpeech",
  FalseInformation: "FalseInformation",
  OffTopic: "OffTopic",
  CopyrightViolation: "CopyrightViolation",
  PersonalAttack: "PersonalAttack",
  InappropriateLanguage: "InappropriateLanguage",
  Other: "Other",
} as const;

export type ReportReasonEnum = keyof typeof ReportReason;

export const REPORT_REASON_LABELS: Record<ReportReasonEnum, string> = {
  [ReportReason.Spam]: "Spam hoặc quảng cáo",
  [ReportReason.Harassment]: "Quấy rối, lăng mạ",
  [ReportReason.InappropriateContent]: "Nội dung không phù hợp",
  [ReportReason.HateSpeech]: "Ngôn từ thù địch",
  [ReportReason.FalseInformation]: "Thông tin sai lệch",
  [ReportReason.OffTopic]: "Lạc đề, không liên quan",
  [ReportReason.CopyrightViolation]: "Vi phạm bản quyền",
  [ReportReason.PersonalAttack]: "Công kích cá nhân",
  [ReportReason.InappropriateLanguage]: "Ngôn ngữ không phù hợp",
  [ReportReason.Other]: "Lý do khác",
} as const;

export const REPORT_REASON_OPTIONS = [
  { value: ReportReason.Spam, label: "Spam hoặc quảng cáo" },
  { value: ReportReason.Harassment, label: "Quấy rối, lăng mạ" },
  { value: ReportReason.InappropriateContent, label: "Nội dung không phù hợp" },
  { value: ReportReason.HateSpeech, label: "Ngôn từ thù địch" },
  { value: ReportReason.FalseInformation, label: "Thông tin sai lệch" },
  { value: ReportReason.OffTopic, label: "Lạc đề, không liên quan" },
  { value: ReportReason.CopyrightViolation, label: "Vi phạm bản quyền" },
  { value: ReportReason.PersonalAttack, label: "Công kích cá nhân" },
  { value: ReportReason.InappropriateLanguage, label: "Ngôn ngữ không phù hợp" },
  { value: ReportReason.Other, label: "Lý do khác" },
] as const;

export const getReportReasonLabel = (reason: ReportReasonEnum | string): string => {
  return REPORT_REASON_LABELS[reason as ReportReasonEnum] || "Không xác định";
};