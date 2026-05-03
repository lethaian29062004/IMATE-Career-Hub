import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
// ...existing code...
import type { SubmitRecruiterProfileRequest, UpdateRecruiterProfileRequest } from "@/types/request/recruiter.request";
import type { AppliedCandidateResponse, CandidateJobListResponse, GetAppliedCandidateRequest, GetCandidateJobListRequest, JobResponse } from "@/types/common/recruiter";
import type { GetJobApplicationsRequest } from "@/types/common/recruiter";
import type { GetAppliedCandidateJobs, AppliedJobCandidateResponse } from "@/types/common/candidate";
/**
 * Nộp / cập nhật hồ sơ Recruiter (bước 2 sau khi đăng ký role Recruiter).
 * Backend sẽ tạo hoặc cập nhật bản ghi Recruiter cho account hiện tại.
 */
export const submitRecruiterProfile = async (payload: SubmitRecruiterProfileRequest): Promise<void> => {
  await apiClient.post(APIConfig.Recruiter.SubmitRecruiterProfile, payload);
};

/**
 * Upload logo công ty.
 * Trả về folderUrl / fileUrl từ S3.
 */
export const uploadCompanyLogo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(APIConfig.Recruiter.UploadLogo, formData);
  return response.data?.data ?? response.data;
};


export const updateRecruiterProfile = async ({ companyName, companyLogo, website, industry, companySize, address, phone }: UpdateRecruiterProfileRequest) => {
  try {
    const formData = new FormData();
    formData.append("CompanyName", companyName || "");
    
    if (companyLogo instanceof File) {
      formData.append("CompanyLogo", companyLogo);
    }
    
    if (website) formData.append("Website", website);
    formData.append("Industry", industry || "");
    formData.append("CompanySize", companySize || "");
    formData.append("Address", address || "");
    formData.append("Phone", phone || "");

    const res = await apiClient.put(APIConfig.Recruiter.UpdateRecruiterProfile, formData);

    return res.data;
  } catch (error) {
    console.log("Error updating recruiter profile: ", error);
    throw error;
  }
};

export const getRecruiterJobApplications = async (
  params?: GetJobApplicationsRequest
): Promise<JobResponse> => {
  const queryParams = {
    PageNumber: params?.pageNumber,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    Location: params?.location,
    EmploymentType: params?.employmentType,
    Status: params?.status,
  };

  const response = await apiClient.get(
    APIConfig.Recruiter.GetRecruiterJobApplication,
    { params: queryParams }
  );
  return response.data.data as JobResponse;
}

export const CreateJobPost = async (data: any) => {
  try {
    return await apiClient.post(APIConfig.Recruiter.CreateJobPost, data);
  } catch (error) {
    console.log("Error creating job post: ", error);
    throw error;
  }
};

export const UpdateJob = async (data: any) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.UpdateJob, data);

    return res.data;
  } catch (error) {
    console.log("Error updating job: ", error);
    throw error;
  }
};

export const CloseJob = async (data: any) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.CloseJob, data);

    return res.data;
  } catch (error) {
    console.log("Error closing job: ", error);
    throw error;
  }
};

export const UpdateJobApplication = async (data: any) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.UpdateJobApplication, data);

    return res.data;
  } catch (error) {
    console.log("Error updating job application: ", error);
    throw error;
  }
};

export const GetAppliedCandidate = async (jobId: number,
  params?: GetAppliedCandidateRequest
): Promise<AppliedCandidateResponse> => {
  const queryParams = {
    PageNumber: params?.pageNumber,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    Status: params?.status,
  };

  const response = await apiClient.get(
    APIConfig.Recruiter.GetAppliedCandidate(jobId),
    { params: queryParams }
  );
  return response.data.data as AppliedCandidateResponse;
}

export const getCandidateJobList = async (
  params?: GetCandidateJobListRequest
): Promise<CandidateJobListResponse> => {
  const queryParams = {
    PageNumber: params?.pageNumber,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    Location: params?.location,
    EmploymentType: params?.employmentType,
    SkillIds: params?.jobSkillIds,
    PositionIds: params?.jobPositionIds,
  };

  const response = await apiClient.get(
    APIConfig.Candidate.GetAllOpenedJob,
    {
      params: queryParams,
      paramsSerializer: (p) => {
        const searchParams = new URLSearchParams();
        Object.entries(p).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      }
    }
  );
  return response.data.data as CandidateJobListResponse;
}

export const getJobDetails = async (jobId: number) => {
  try {
    const res = await apiClient.get(APIConfig.Candidate.GetJobDetail(jobId));
    return res.data;
  } catch (error) {
    console.log("Error closing job application: ", error);
    throw error;
  }
};

export const createJobApplication = async (data: any) => {
  try {
    const res = await apiClient.post(APIConfig.Candidate.CreateJobApplication, data);
    return res.data;
  } catch (error) {
    console.log("Error creating job application: ", error);
    throw error;
  }
};



export const getCandidateAppliedJobs = async (
  params?: GetAppliedCandidateJobs
): Promise<AppliedJobCandidateResponse> => {
  const queryParams = {
    PageNumber: params?.pageNumber,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    Status: params?.status,
  };

  const response = await apiClient.get(
    APIConfig.Candidate.GetAppliedJob,
    { params: queryParams }
  );
  return response.data.data as AppliedJobCandidateResponse;
}