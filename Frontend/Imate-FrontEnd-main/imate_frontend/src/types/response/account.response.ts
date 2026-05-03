// Tên interface có thể theo kiểu [Action][Entity][Request].

export interface AccountResponse {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}
export interface AccountListResponse {
  items: AccountResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface AccountDetailCandidateResponse extends Omit<AccountResponse, "status" | "createdAt" | "updatedAt" | "roles" | "avatarUrl"> {
  status: string;
  roleName: string;
  exPackages: any[];
  presentPackage: any | null;
  mentorSessionCount: number;
  avatarUrl?: string;
}

interface MentorReviewResponse {
  reviewerFullName: string;
  reviewerName: string;
  reviewerAvatarUrl: string;
  score: number;
  text: string;
  createdAt?: string;
}
export interface AccountDetailMentorResponse extends Omit<AccountResponse, "roles" | "status" | "avatarUrl" | "createdAt" | "updatedAt"> {
  phone: string;
  bio: string;
  avgRatings: number;
  pricePerSession: number;
  status: string;
  roleName: "Mentor";
  totalCompletedSessions: number;
  avatarUrl?: string;
  reviews: MentorReviewResponse[];
}
export interface StaffAuditLogResponse {
  id: number;
  action: string;
  entityName: string;
  entityId: number;
  timestamp: string;
}
export interface AccountDetailStaffResponse extends Omit<AccountResponse, "avatarUrl" | "status" | "createdAt" | "updatedAt" | "roles"> {
  questionCount: number;
  applicationCount: number;
  mentorCount: number;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  roleName: "Staff";
  avatarUrl?: string;
  auditLog: StaffAuditLogResponse[];
}
interface ChartTrend {
  percentage: number;
  isPositive: boolean;
}
interface ChartMetric<TValue = number> {
  value: TValue;
  data: number[];
  trend: ChartTrend | null;
}
export interface OverviewChartAccountResponse {
  totalUsers: ChartMetric<number>;
  activeUsers: ChartMetric<number>;
  newUsers: ChartMetric<number>;
}
