import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type {
  PagedStaffMentorApplications,
  PagedStaffMentorApplicationsRaw,
  StaffMentorApplication,
  StaffMentorApplicationRaw,
  StaffRecruiterApplication,
} from "@/types/response/staffReview.response";

export interface GetPendingMentorsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

function mapItem(raw: StaffMentorApplicationRaw): StaffMentorApplication {
  return {
    accountId: raw.accountId,
    fullName: raw.fullName,
    email: raw.email,
    avatarUrl: raw.avatarUrl,
    bio: raw.bio,
    phone: raw.phone,
    birthDate: raw.birthDate,
    yoe: raw.yoe,
    cvUrl: raw.cvUrl,
    certificateUrl: raw.certificateUrl,
    pricePerSession: raw.pricePerSession,
    bankAccountHolderName: raw.bankAccountHolderName,
    bankAccountNumber: raw.bankAccountNumber,
    bankCode: raw.bankCode,
    skills: raw.skills ?? [],
    positions: raw.positions ?? [],
    companies: raw.companies ?? [],
    createdAt: raw.createdAt,
    avgRatings: raw.avgRatings ?? raw.AvgRatings ?? null,
    totalRatingCount: raw.totalRatingCount ?? raw.TotalRatingCount ?? null,
  };
}

export const getPendingMentorApplications = async (
  params: GetPendingMentorsParams = {}
): Promise<PagedStaffMentorApplications> => {
  const { pageNumber = 1, pageSize = 6, searchTerm = "" } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("pageNumber", String(pageNumber));
  searchParams.set("pageSize", String(pageSize));
  if (searchTerm.trim()) searchParams.set("searchTerm", searchTerm.trim());
  const url = `${APIConfig.StaffReview.GetPendingMentors}?${searchParams.toString()}`;
  const res = await apiClient.get<PagedStaffMentorApplicationsRaw>(url);
  const d = res.data;
  return {
    items: (d.items ?? []).map(mapItem),
    pageNumber: d.pageNumber,
    pageSize: d.pageSize,
    totalCount: d.totalCount,
    totalPages: d.totalPages,
  };
};

export const getMentorApplicationById = async (
  id: number
): Promise<StaffMentorApplication | null> => {
  const url = `${APIConfig.StaffReview.GetMentorById}/${id}`;
  const res = await apiClient.get<StaffMentorApplicationRaw | null>(url);
  const d = res.data;
  if (!d) return null;
  return mapItem(d);
};

export interface ReviewMentorPayload {
  isApproved: boolean;
  note?: string | null;
}

export const reviewMentorApplication = async (
  id: number,
  payload: ReviewMentorPayload
): Promise<{ message: string }> => {
  const url = `${APIConfig.StaffReview.ReviewMentor}/${id}/review`;
  const res = await apiClient.post<{ message: string }>(url, payload);
  return res.data;
};

export const getPendingRecruiterApplications = async (): Promise<StaffRecruiterApplication[]> => {
  const res = await apiClient.get<StaffRecruiterApplication[]>(APIConfig.StaffReview.GetPendingRecruiters);
  return res.data ?? [];
};

export interface ReviewRecruiterPayload {
  isApproved: boolean;
  note?: string | null;
  createCompany?: boolean;
}

export const reviewRecruiterApplication = async (
  id: number,
  payload: ReviewRecruiterPayload
): Promise<{ message: string }> => {
  const url = `${APIConfig.StaffReview.ReviewRecruiter}/${id}/review`;
  const res = await apiClient.post<{ message: string }>(url, payload);
  return res.data;
};
