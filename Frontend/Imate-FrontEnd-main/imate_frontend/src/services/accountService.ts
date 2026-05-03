import type { AccountAddStaffRequest, AccountRequest, UpdateProfileRequest } from "@/types/request/account.request";
import type { AccountListResponse, AccountResponse, OverviewChartAccountResponse } from "@/types/response/account.response";
import apiClient from "./apiClient";

// get all
export const getAccountList = async (params: { AccountStatus?: 0 | 1 | 2; SortBy?: string; SortOrder?: string; PageNumber?: number; PageSize?: number; SearchTerm?: string }) => {
  //
  try {
    const urlParams = new URLSearchParams();

    if (params.AccountStatus !== undefined) urlParams.append("AccountStatus", params.AccountStatus.toString());
    if (params.SortBy) urlParams.append("SortBy", params.SortBy);
    if (params.SortOrder) urlParams.append("SortOrder", params.SortOrder);
    if (params.PageNumber) urlParams.append("PageNumber", params.PageNumber.toString());
    if (params.PageSize) urlParams.append("PageSize", params.PageSize.toString());
    if (params.SearchTerm) urlParams.append("SearchTerm", params.SearchTerm);

    const res = await apiClient.get(`/accounts?${urlParams.toString()}`);
    //  console.log("res", res.data);
    return res.data as AccountListResponse;
  } catch (error) {
    console.log("error fetch account list: ", error);
    return null;
  }
};
// update status
export const updateAccountState = async (data: AccountRequest) => {
  try {
    //console.log("dataAPi", data);
    //console.log("url", `/accounts/${data.id}/${data.status}`);
    const res = await apiClient.put(`/accounts/${data.id}/${data.status}`, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};
// get account detail
export const getAccountDetail = async (id: number) => {
  try {
    const res = await apiClient.get(`/accounts/${id}`);
    return res.data as AccountResponse;
  } catch (error) {
    console.log("error fetch account detail: ", error);
  }
};
// add acount staff
export const addAccount = async (data: AccountAddStaffRequest) => {
  //console.log("data", data);
  const response = await apiClient.post("/create-employee", data);
  return response;
};

export const updateMyProfile = async ({ fullName, avatarFile }: UpdateProfileRequest) => {
  const formData = new FormData();

  // Tên key "FullName" phải khớp chính xác với C# model
  formData.append("FullName", fullName);

  // Tên key "AvatarFile" phải khớp chính xác với C# model
  if (avatarFile) {
    formData.append("AvatarFile", avatarFile);
  }

  try {
    const response = await apiClient.put("/profile", formData);
    return response;
  } catch (error) {
    console.error("Error contributing question:", error);
    throw error;
  }
};

// view detail account candidate
export const viewDetailAccountCandidate = async (id: number) => {
  try {
    const res = await apiClient.get(`/accounts/candidate/${id}`);
    return res.data;
  } catch (error) {
    console.log("error fetch account candidate detail : ", error);
    throw error;
  }
};
export const viewDetailAccountMentor = async (id: number) => {
  try {
    const res = await apiClient.get(`/accounts/mentor/${id}`);
    return res.data;
  } catch (error) {
    console.log("error fetch account mentor detail : ", error);
    throw error;
  }
};
export const viewDetailAccountStaff = async (id: number) => {
  try {
    const res = await apiClient.get(`/accounts/staff/${id}`);
    return res.data;
  } catch (error) {
    console.log("error fetch account staff detail : ", error);
    throw error;
  }
};
export const viewDetailAccountRecruiter = async (id: number) => {
  try {
    const res = await apiClient.get(`/accounts/recruiter/${id}`);
    return res.data;
  } catch (error) {
    console.log("error fetch account recruiter detail : ", error);
    throw error;
  }
};
export const getOverviewAccount = async () => {
  try {
    const res = await apiClient.get(`/accounts/overview`);
    console.log("res overview", res.data);
    return res.data as OverviewChartAccountResponse;
  } catch (error) {
    console.log("error fetch account staff detail : ", error);
    throw error;
  }
};
