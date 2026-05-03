/**
 * Thông tin một CV đã upload — match backend UserCvResponseModel
 *
 * Backend trả về: id (int), accountId, fileUrl, fileName, uploadDate,
 * scannedData, createdAt, updatedAt.
 * Không có field "status" — ta derive status từ scannedData.
 */
export interface CvItem {
  cvId: string;       // mapped from backend "id"
  fileName: string;
  uploadDate: string; // ISO string
  fileUrl?: string;
  scannedData?: string | null;
  status: "Valid" | "Invalid" | "Processing";
}

/** Response khi upload CV thành công — raw backend shape */
export interface UploadCvResponse {
  cvId: number;
  accountId: number;
  fileUrl: string;
  fileName: string;
  uploadDate: string;
  scannedData?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
