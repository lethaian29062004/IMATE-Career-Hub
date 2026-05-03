import type { FormAddPosition, FormUpdatePosition } from "@/types/request/position.request";
import type { ListPositionResponse } from "@/types/response/position.response";

/**
 * Lấy danh sách vị trí (Position) có phân trang và tùy chọn lọc/sắp xếp.
 * @param PageNumber Số trang hiện tại.
 * @param PageSize Số lượng mục trên mỗi trang (hoặc null).
 * @param IsActive Trạng thái hoạt động (true/false/null).
 * @param SearchTerm Từ khóa tìm kiếm.
 * @param SortBy Trường cần sắp xếp.
 * @param SortOrder Thứ tự sắp xếp ('asc' hoặc 'desc').
 * @returns Promise chứa dữ liệu ListPositionResponse.
 */
export const getListPosition = async (
  PageNumber: number,
  PageSize: number | null,
  IsActive: boolean | null,
  SearchTerm: string,
  SortBy?: string, // Thêm tham số SortBy
  SortOrder?: string // Thêm tham số SortOrder
) => {
  try {
    const params = new URLSearchParams({
      PageNumber: PageNumber.toString(),
      SearchTerm: SearchTerm,
      // Thêm các tham số tùy chọn nếu chúng tồn tại
      ...(PageSize !== null && { PageSize: PageSize.toString() }),
      ...(IsActive !== null && { IsActive: IsActive.toString() }),
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
    });

    // Sửa cách xây dựng URL để sử dụng URLSearchParams
    const res = await apiClient.get(`/get-positions?${params.toString()}`);
    return res.data as ListPositionResponse;
  } catch (error) {
    console.log("error fetch positions: ", error);
    return undefined; // Trả về undefined khi có lỗi
  }
};

/**
 * Thêm một vị trí mới.
 * @param data Dữ liệu vị trí cần thêm.
 * @returns Promise chứa phản hồi từ API.
 */
export const addPosition = async (data: FormAddPosition) => {
  try {
    const res = await apiClient.post(`/positions`, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Cập nhật thông tin của một vị trí đã tồn tại.
 * @param id ID của vị trí cần cập nhật.
 * @param data Dữ liệu cập nhật.
 * @returns Promise chứa phản hồi từ API.
 */
export const updatePosition = async (id: number, data: FormUpdatePosition) => {
  try {
    const res = await apiClient.put(`/positions/${id}`, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

import type { AffectedQuestion } from "@/types/response/affected-question.response";
import apiClient from "./apiClient";

export const getAffectedQuestions = async (positionId: number, willBeActive: boolean) => {
  try {
    const res = await apiClient.get(`/positions/${positionId}/affected-questions?willBeActive=${willBeActive}`);
    return res.data as AffectedQuestion[];
  } catch (error) {
    console.log("error fetch affected questions: ", error);
    return [];
  }
};
