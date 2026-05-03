// export type ApplicationTechnicalRequest = {
//   title: "Đơn báo lỗi kĩ thuật";
//   content: string;
//   file: File[];
// };

export interface ApplicationTechnicalRequest {
  title: string;
  content: string;
  evidenceFiles: File[];
}

export interface ApplicationMentorRequest {
  title: string;
  content: string;
  bookingId: number;
  evidenceFiles: File[];
}

export interface ReportCommentRequest {
  commentId: number;
  reason: ReportReason;
  additionalDetails?: string;
  evidenceFiles?: File[];
}

export const ReportReason = {
  Spam: 0,
  Harassment: 1,
  InappropriateContent: 2,
  HateSpeech: 3,
  FalseInformation: 4,
  OffTopic: 5,
  CopyrightViolation: 6,
  PersonalAttack: 7,
  InappropriateLanguage: 8,
  Other: 9,
} as const;

export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export const ReportReasonLabels: Record<ReportReason, string> = {
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
};