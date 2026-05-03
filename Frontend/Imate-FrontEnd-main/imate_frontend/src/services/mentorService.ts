import axios from "axios";
import type { User } from "@/types/common/auth";
import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentorResponse } from "@/types/common/mentor";
import type { CommonParams, PaginatedApiResponse } from "@/types/common/pagination";
import type { SubmitMentorProfileRequest } from "@/types/request/mentor.request";
import type { CandidateRatingsResponse } from "@/types/response/rating.response";
import type { BankInfo } from "@/types/common/data";



export const getMentorRatings = async (): Promise<CandidateRatingsResponse> => {
  try {
    const res = await apiClient.get<CandidateRatingsResponse>(APIConfig.Mentor.GetMyCandidateRatings);
    return res.data;
  } catch (error) {
    console.error("Error fetching mentor ratings: ", error);
    throw error;
  }
};

export const updateMentorPrice = async (price: number) => {
  try {
    const res = await apiClient.put(APIConfig.Mentor.UpdatePrice, { pricePerSession: price });
    return res.data;
  } catch (error) {
    console.error("Error updating mentor price: ", error);
    throw error;
  }
};

/** @deprecated Dùng SubmitMentorProfileRequest từ @/types/request/mentor.request */
export type SubmitMentorProfilePayload = SubmitMentorProfileRequest;

/** Normalize item from API (backend may return PascalCase or camelCase) */
function normalizeMentorItem(raw: Record<string, unknown>): ListPreviewMentorResponse {
  return {
    fullName: (raw.fullName ?? raw.FullName ?? "") as string,
    position: (raw.position ?? raw.Position ?? "") as string,
    yoe: Number(raw.yoe ?? raw.Yoe ?? 0),
    company: (raw.company ?? raw.Company ?? "") as string,
    avgRatings: (raw.avgRatings ?? raw.AvgRatings) as number | null ?? null,
    totalRatingCount: (raw.totalRatingCount ?? raw.TotalRatingCount) as number | null ?? null,
    avatarUrl: (raw.avatarUrl ?? raw.AvatarUrl) as string | undefined,
    bio: (raw.bio ?? raw.Bio) as string | undefined,
    accountId: (raw.accountId ?? raw.AccountId) as number | undefined,
  };
}

/**
 * Get list of preview mentors with pagination (PagedList)
 */
export const getListPreviewMentors = async (
  params: CommonParams
): Promise<PaginatedApiResponse<ListPreviewMentorResponse>> => {
  const response = await apiClient.get<{
    items?: Record<string, unknown>[];
    Items?: Record<string, unknown>[];
    totalCount?: number;
    TotalCount?: number;
    pageNumber?: number;
    PageNumber?: number;
    pageSize?: number;
    PageSize?: number;
    totalPages?: number;
    TotalPages?: number;
  }>(APIConfig.Mentor.GetListPreviewMentors, {
    params,
  });

  const body = response.data ?? {};
  const raw = Array.isArray(body.items ?? body.Items) ? (body.items ?? body.Items)! : [];
  const data = raw.map((item) => normalizeMentorItem(item));

  const header = response.headers["x-pagination"];
  let meta: any = {};
  try {
    meta = header ? JSON.parse(header) : {};
  } catch {
    meta = {};
  }

  return {
    data,
    totalCount: meta.TotalCount ?? meta.totalCount ?? body.TotalCount ?? body.totalCount ?? 0,
    pageNumber: meta.PageNumber ?? meta.pageNumber ?? body.PageNumber ?? body.pageNumber ?? params.pageNumber ?? 1,
    pageSize: meta.PageSize ?? meta.pageSize ?? body.PageSize ?? body.pageSize ?? params.pageSize ?? 10,
    totalPages: meta.TotalPages ?? meta.totalPages ?? body.TotalPages ?? body.totalPages ?? 0,
  };
};

/**
 * Nộp / cập nhật hồ sơ Mentor (bước 2 sau khi đăng ký role Mentor).
 * Backend sẽ tạo hoặc cập nhật bản ghi Mentor cho account hiện tại.
 */
export const submitMentorProfile = async (payload: SubmitMentorProfileRequest): Promise<void> => {
  const formData = new FormData();

  // Helper function to append values
  const appendIfDefined = (key: string, value: any) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, String(item)));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  };

  // Append all fields from the payload
  Object.entries(payload).forEach(([key, value]) => {
    appendIfDefined(key, value);
  });

  await apiClient.post(APIConfig.Mentor.SubmitMentorProfile, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const updateMentorProfile = async (data: User) => {
  try {
    const res = await apiClient.put("/mentor-profile", data);

    return res.data;
  } catch (error) {
    console.log("Error updating mentor profile: ", error);
    throw error;
  }
};

export const getBankDetail = async (bankCode: string) => {
  try {
    const res = await axios.get("https://api.vietqr.io/v2/banks");

    const banks = res.data.data || res.data;

    const bank = banks.find((b: any) => b.code.toLowerCase() === bankCode.toLowerCase());

    if (!bank) throw new Error(`Bank with code: ${bankCode} not found`);

    return bank;
  } catch (error) {
    console.log("Error fetch bank detail: ", error);
    throw error;
  }
};

export const getBankList = async (): Promise<BankInfo[]> => {
  try {
    const res = await apiClient.get("https://api.vietqr.io/v2/banks");
    if (res.data?.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid response format from VietQR API");
    }
  } catch (error) {
    console.log("Error fetch bank list: ", error);
    return [];
  }
};
