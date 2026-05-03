import type { ApplicationListResponse, ApplicationPendingSummary, ApplicationReportCommentDetailResponse } from "@/types/response/application.response";
import apiClient from "./apiClient";

// get list all applications with filters and pagination
export const getListApplications = async (
  params: {
    SortBy?: "createdAt";
    SortOrder?: "asc" | "desc";
    Status?: 0 | 1 | 2 | 3;
    Type?: 0 | 1;
    PageNumber?: number;
    PageSize?: number;
    SearchTerm?: string;
  } = {},
  id?: number
) => {
  const queryParams = new URLSearchParams();

  queryParams.append("SortBy", "createdAt");
  if (params.SortOrder) queryParams.append("SortOrder", params.SortOrder);
  if (params.Status !== undefined) queryParams.append("Status", params.Status.toString());
  if (params.Type !== undefined) queryParams.append("Type", params.Type.toString());
  if (params.PageNumber !== undefined) queryParams.append("PageNumber", params.PageNumber.toString());
  if (params.PageSize !== undefined) queryParams.append("PageSize", params.PageSize.toString());
  if (params.SearchTerm) queryParams.append("SearchTerm", params.SearchTerm);
  try {
    const response = await apiClient.get(`/applications/${id}?${queryParams.toString()}`);
    return response.data as ApplicationListResponse;
  } catch (error: any) {
    throw error.message;
  }
};

// add new application technical request
export const addApplicationTechnical = async (data: FormData, id: number) => {
  try {
    // const formDataObj: Record<string, any> = {};
    // data.forEach((value, key) => {
    //   formDataObj[key] = value;
    // });
    // console.log("FormData content:", formDataObj);

    const response = await apiClient.post(`/application/technical-application/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
    //console.log(response);
    return response;
  } catch (error: any) {
    console.log("error", error.message);
    throw error.message;
  }
};
// add new application mentor request
export const addApplicationMentor = async (data: FormData, id: number) => {
  try {
    // console.log("dataAPI", data.toString());
    console.log("id", id);
    const response = await apiClient.post(`/application/report-application/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
    console.log(response);
    return response;
  } catch (error: any) {
    console.log("error", error.message);
    throw error.message;
  }
};

// add new application report comment
export const addReportCommentApplication = async (data: FormData, userId: number) => {
  try {
    const response = await apiClient.post(`/application/report-comment/${userId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
    return response;
  } catch (error: any) {
    console.log("error", error.message);
    throw error.message;
  }
};

// get all applications (for staff/admin)
export const getAllApplications = async (params: { PageNumber?: number; PageSize?: number; SearchTerm?: string; Status?: number; Type?: number; UserId?: number }) => {
  const queryParams = new URLSearchParams();
  if (params.PageNumber) queryParams.append("PageNumber", params.PageNumber.toString());
  if (params.PageSize) queryParams.append("PageSize", params.PageSize.toString());
  if (params.SearchTerm) queryParams.append("SearchTerm", params.SearchTerm);
  if (params.Status !== undefined) queryParams.append("Status", params.Status.toString());
  if (params.Type !== undefined) queryParams.append("Type", params.Type.toString());
  if (params.UserId) queryParams.append("UserId", params.UserId.toString());

  try {
    const response = await apiClient.get(`/applications?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.message;
  }
};

// approve application
export const approveApplication = async (applicationId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/application/${applicationId}/approve`, { responseNote });
    return response;
  } catch (error: any) {
    throw error.message;
  }
};

// reject application
export const rejectApplication = async (applicationId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/application/${applicationId}/reject`, { responseNote });
    return response;
  } catch (error: any) {
    throw error.message;
  }
};

// get application details
export const getApplicationTechnicalDetails = async (applicationId: number) => {
  try {
    const response = await apiClient.get(`/application/${applicationId}/technical-details/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// get application details
export const getApplicationMentorDetails = async (applicationId: number) => {
  try {
    console.log("res api", `/application/${applicationId}/report-mentor-details`);
    const response = await apiClient.get(`/application/${applicationId}/report-mentor-details`);
    return response.data;
  } catch (error: any) {
    throw error.message;
  }
};
//get all application details
export const getApplicationRatingDetails = async (applicationId: number) => {
  try {
    const response = await apiClient.get(`/application/${applicationId}/report-rating-details`);
    return response.data;
  } catch (error: any) {
    throw error.message;
  }
};

export const getApplicationReportCommentDetails = async (applicationId: number) => {
  try {
    const response = await apiClient.get(`/application/${applicationId}/report-comment-details`);
    return response.data as ApplicationReportCommentDetailResponse;
  } catch (error: any) {
    throw error;
  }
};

export const getListApplicationForStaff = async (params: { SortBy?: string; SortOrder?: string; Status?: number; Type?: number; PageNumber?: number; PageSize?: number; SearchTerm?: string }) => {
  try {
    //  console.log("params", params.Status);
    const queryParams = new URLSearchParams();
    // if (params.SortBy !== undefined) queryParams.append("SortBy", params.SortBy);
    queryParams.append("SortBy", "createdAt");
    if (params.SortOrder !== undefined) queryParams.append("SortOrder", params.SortOrder);
    if (params.Status !== undefined && params.Status !== null) {
      queryParams.append("Status", params.Status.toString());
    }
    if (params.Type !== undefined && params.Type !== null) {
      queryParams.append("Type", params.Type.toString());
    }

    if (params.PageNumber) queryParams.append("PageNumber", params.PageNumber.toString());
    if (params.PageSize) queryParams.append("PageSize", params.PageSize.toString());
    if (params.SearchTerm !== undefined) queryParams.append("SearchTerm", params.SearchTerm);
    // console.log(`/applications?${queryParams.toString()}`);
    const response = await apiClient.get(`/applications?${queryParams.toString()}`);

    //console.log(response);
    return response.data;
  } catch (error: any) {
    throw error.message;
  }
};

export const getApplicationDetails = async (applicationId: number) => {
  try {
    const response = await apiClient.get(`/application/${applicationId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const approveApplicationStaff = async (applicationId: number, responseNote?: string) => {
  try {
    ///application/12/approve
    const response = await apiClient.put(`/application/${applicationId}/approve`, { responseNote });
    console.log(response);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const rejectApplicationStaff = async (applicationId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/application/${applicationId}/reject`, { responseNote });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getPendingApplicationSummary = async () => {
  try {
    const response = await apiClient.get(`/applications/pending-summary`);
    return response.data as ApplicationPendingSummary;
  } catch (error: any) {
    throw error;
  }
};
