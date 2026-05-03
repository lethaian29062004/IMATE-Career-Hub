import type { FormAddCompanyRequest, FormUpdateCompanyRequest } from "@/types/request/company.request";
import type { ListCompanyResponse } from "@/types/response/company.response";
import apiClient from "./apiClient";

export const getListCompany = async (PageNumber: number, PageSize: number, SearchTerm: string, IsActive: boolean | null, SortBy?: string, SortOrder?: string) => {
  try {
    const params = new URLSearchParams({
      PageNumber: PageNumber.toString(),
      PageSize: PageSize.toString(),
      SearchTerm: SearchTerm || "",
      ...(IsActive !== null && { IsActive: IsActive.toString() }),
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
    });

    const res = await apiClient.get(`/get-companies?${params.toString()}`);

    return res.data as ListCompanyResponse;
  } catch (error) {
    console.log("error fetch companies: ", error);
  }
};
export const updateActiveTrue = async (id: number) => {
  try {
    const res = await apiClient.put(`/company-staff/${id}/active`, null);
    return res;
  } catch (error) {
    console.log("error fetch postitions: ", error);
  }
};
export const updateActiveFalse = async (id: number) => {
  try {
    const res = await apiClient.put(`/company-staff/${id}/inactive`, null);
    return res;
  } catch (error) {
    console.log("error fetch postitions: ", error);
  }
};
export const addCompany = async (data: FormAddCompanyRequest) => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.imageFile) {
      formData.append("imageFile", data.imageFile);
    }
    const res = await apiClient.post(`/staff-create-company`, formData);
    return res;
  } catch (error: any) {
    console.log("error fetch postitions: ", error);
    throw error;
  }
};
//company.update
export const updateCompany = async (id: number, data: FormUpdateCompanyRequest) => {
  try {
    console.log("data gửi lên API:", data);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("isActive", data.isActive.toString());

    if (data.newImageFile) {
      formData.append("newImageFile", data.newImageFile);
    }

    const res = await apiClient.put(`/company-staff/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data; // thành công → trả data
  } catch (error: any) {
    console.error("Lỗi khi cập nhật công ty:", error);
    throw error;
  }
};

// Get positions and skills from questions by company (for manual interview setup)
export interface CompanyPositionsSkillsResponse {
  success: boolean;
  data: {
    positions: Array<{ id: number; name: string }>;
    skills: Array<{ id: number; name: string }>;
  };
  message: string;
}

export interface CompanyPositionsSkillsData {
  positions: Array<{ id: number; name: string }>;
  skills: Array<{ id: number; name: string }>;
}

export const getCompanyPositionsAndSkills = async (companyId: number): Promise<CompanyPositionsSkillsResponse> => {
  try {
    const res = await apiClient.get(`/company/${companyId}/positions-skills`);
    return res.data;
  } catch (error: any) {
    console.error("error fetch company positions and skills: ", error);
    throw error;
  }
};