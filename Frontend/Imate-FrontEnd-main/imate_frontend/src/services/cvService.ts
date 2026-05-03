import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { CvItem, UploadCvResponse } from "@/types/common/cv";

/**
 * Map backend UserCvResponseModel → frontend CvItem
 * Backend không có field "status" → derive từ scannedData
 */
const mapToFrontend = (raw: any): CvItem => ({
  cvId: String(raw.id ?? raw.cvId),
  fileName: raw.fileName,
  uploadDate: raw.uploadDate,
  fileUrl: raw.fileUrl,
  scannedData: raw.scannedData,
  // Backend không có field status — CV tồn tại trong DB = upload + scan hoàn tất
  status: "Valid",
});

/**
 * Upload CV file (FormData)
 * Backend yêu cầu: FileName (string, required) + File (IFormFile, required)
 */
export const uploadCV = async (
  file: File,
  fileName?: string
): Promise<UploadCvResponse> => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("FileName", fileName || file.name.replace(/\.[^/.]+$/, ""));

  const response = await apiClient.post(APIConfig.CV.Upload, formData);
  const data = response.data?.data ?? response.data;
  return data as UploadCvResponse;
};

/**
 * Lấy danh sách CV của user hiện tại
 */
export const getListCV = async (): Promise<CvItem[]> => {
  const response = await apiClient.get(APIConfig.CV.GetList);

  // Normalize: backend có thể trả response.data hoặc response.data.data
  const data = (response.data as any)?.data ?? response.data;
  const items = Array.isArray(data) ? data : [];
  return items.map(mapToFrontend);
};

/**
 * Lấy chi tiết 1 CV theo ID
 */
export const getCvById = async (cvId: string): Promise<CvItem> => {
  const url = `/cv/${cvId}`;
  const response = await apiClient.get(url);
  const data = response.data?.data ?? response.data;
  return mapToFrontend(data);
};

/**
 * Xóa CV theo ID
 */
export const deleteCV = async (cvId: string): Promise<void> => {
  const url = APIConfig.CV.Delete.replace("{cvId}", cvId);
  await apiClient.delete(url);
};

/**
 * UC-29: Phân tích CV bằng AI (on-demand)
 * Gọi endpoint POST /api/ai/analyse-cv với { cvId }
 * Backend trả về: { success, data: { score, candidateName, strengths, ... }, message }
 */
export const analyseCvById = async (
  cvId: string,
  forceReanalyze: boolean = false
): Promise<any> => {
  const response = await apiClient.post(`/ai/analyse-cv`, {
    cvId: parseInt(cvId, 10),
    forceReanalyze,
  });
  // Backend trả trực tiếp CvAnalysisResult trong data
  return response.data?.data ?? response.data;
};
