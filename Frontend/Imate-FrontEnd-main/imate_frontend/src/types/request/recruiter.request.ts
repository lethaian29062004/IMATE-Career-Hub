/**
 * Request types cho các API liên quan Recruiter.
 */

/** Payload nộp / cập nhật hồ sơ Recruiter (bước 2 sau khi đăng ký role Recruiter). */
export interface SubmitRecruiterProfileRequest {
  companyName: string;
  companyAddress: string;
  companyWebsite?: string;
  companyLogo?: string;
  phone: string;
}

export interface UpdateRecruiterProfileRequest {
  companyName: string;
  companyLogo?: File | null;
  website?: string | null;
  industry: string;
  companySize: string;
  address: string;
  phone: string;
  [key: string]: any;
}
