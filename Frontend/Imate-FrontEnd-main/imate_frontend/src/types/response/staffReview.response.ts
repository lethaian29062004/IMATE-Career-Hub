/** Ứng với StaffMentorApplicationResponse từ backend */
export interface StaffMentorApplication {
  accountId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio: string;
  phone: string;
  birthDate?: string | null;
  yoe: number;
  cvUrl?: string | null;
  certificateUrl?: string | null;
  pricePerSession: number;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  skills: string[];
  positions: string[];
  companies: string[];
  createdAt: string;
  avgRatings?: number | null;
  totalRatingCount?: number | null;
}

/** Response từ API GET .../mentors/pending (sau khi map từ PascalCase) */
export interface PagedStaffMentorApplications {
  items: StaffMentorApplication[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Raw response từ backend (camelCase - chuẩn JSON của ASP.NET Core) */
export interface PagedStaffMentorApplicationsRaw {
  items: StaffMentorApplicationRaw[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StaffMentorApplicationRaw {
  accountId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio: string;
  phone: string;
  birthDate?: string | null;
  yoe: number;
  cvUrl?: string | null;
  certificateUrl?: string | null;
  pricePerSession: number;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  skills: string[];
  positions: string[];
  companies: string[];
  createdAt: string;
  avgRatings?: number | null;
  totalRatingCount?: number | null;
  AvgRatings?: number | null;
  TotalRatingCount?: number | null;
}

/** Ứng với StaffRecruiterApplicationResponse từ backend */
export interface StaffRecruiterApplication {
  accountId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  companyName: string;
  companyLogo?: string | null;
  website?: string | null;
  industry: string;
  companySize?: string | null;
  address?: string | null;
  phone?: string | null;
  verificationStatus: string;
  createdAt: string;
}
