import apiClient from "./apiClient";

import type { FormAddSkill, FormUpdateSkill } from "@/types/request/skill.request";
import type { ListSkillResponse } from "@/types/response/skill.response";
import type { AffectedQuestion } from "@/types/response/affected-question.response"; // Giả định type này tồn tại

/**
 * Lấy danh sách Kỹ năng có phân trang, tùy chọn lọc/sắp xếp, và lọc theo Vị trí.
 * @param pageNumber Số trang hiện tại.
 * @param pageSize Số lượng mục trên mỗi trang (hoặc null).
 * @param isActive Trạng thái hoạt động (true/false/null).
 * @param searchTerm Từ khóa tìm kiếm.
 * @param SortBy Trường cần sắp xếp.
 * @param SortOrder Thứ tự sắp xếp ('asc' hoặc 'desc').
 * @param PositionId ID của Vị trí để lọc kỹ năng (optional).
 * @returns Promise chứa dữ liệu ListSkillResponse.
 */
export const getAllSkill = async (
  pageNumber: number | null,
  pageSize: number | null,
  isActive: boolean | null,
  searchTerm: string,
  SortBy?: string,
  SortOrder?: string,
  PositionId?: number | null // THAM SỐ MỚI: Dùng để lọc kỹ năng theo vị trí
) => {
  try {
    const params = new URLSearchParams({
      ...(pageNumber !== null && pageNumber !== undefined && { PageNumber: pageNumber.toString() }),
      ...(pageSize !== null && pageSize !== undefined && { PageSize: pageSize.toString() }),
      ...(isActive !== null && isActive !== undefined && { IsActive: isActive.toString() }),
      SearchTerm: searchTerm,
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
      ...(PositionId !== null && PositionId !== undefined && { PositionId: PositionId.toString() }),
    });

    const res = await apiClient.get(`/get-skills?${params.toString()}`);
    return res.data as ListSkillResponse;
  } catch (error) {
    console.log("error fetch skills: ", error);
    return undefined;
  }
};

/**
 * Cập nhật thông tin của một Kỹ năng đã tồn tại.
 * @param id ID của Kỹ năng cần cập nhật.
 * @param data Dữ liệu cập nhật.
 * @returns Promise chứa phản hồi từ API.
 */
export const updateSkill = async (id: number, data: FormUpdateSkill) => {
  try {
    const res = await apiClient.put(`/skills/${id}`, data);
    return res;
  } catch (error: any) {
    console.log("error update skill: ", error);
    throw error;
  }
};

/**
 * Thêm một Kỹ năng mới.
 * @param data Dữ liệu Kỹ năng cần thêm.
 * @returns Promise chứa phản hồi từ API.
 */
export const addSkill = async (data: FormAddSkill) => {
  try {
    const res = await apiClient.post(`/skills`, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Lấy danh sách câu hỏi bị ảnh hưởng khi thay đổi trạng thái Kỹ năng.
 * @param skillId ID của Kỹ năng.
 * @param willBeActive Trạng thái mới (true/false).
 * @returns Promise chứa danh sách AffectedQuestion.
 */
export const getAffectedQuestions = async (skillId: number, willBeActive: boolean) => {
  try {
    const res = await apiClient.get(`/skills/${skillId}/affected-questions?willBeActive=${willBeActive}`);
    return res.data as AffectedQuestion[];
  } catch (error) {
    console.log("error fetch affected questions: ", error);
    return [];
  }
};
