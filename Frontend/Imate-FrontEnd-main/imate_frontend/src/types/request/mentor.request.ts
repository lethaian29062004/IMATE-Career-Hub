/**
 * Request types cho các API liên quan Mentor.
 * Đặt cùng chuẩn với types/request/account.request.ts.
 */

/** Payload nộp / cập nhật hồ sơ Mentor (bước 2 sau khi đăng ký role Mentor). */
export interface SubmitMentorProfileRequest {
  bio: string;
  phone: string;
  birthDate?: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  pricePerSession?: number;
  positionIds: number[];
  skillIds: number[];
  companyIds: number[];
  yoe?: number;
  cvFile?: File;
  certificateFile?: File;
}
