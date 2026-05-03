import apiClient from "@/services/apiClient";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface AgoraTokenResponse {
  token: string | null;
  appId: string;
  channelName: string;
  uid: number;
  expiresAt: number;
}

export interface StartRecordingResponse {
  success: boolean;
  bookingId: number;
  resourceId: string;
  sid: string;
  channelName: string;
}

export interface StopRecordingResponse {
  success: boolean;
  bookingId?: number;
  resourceId: string;
  sid: string;
  files?: RecordingFile[];
}

export interface RecordingFile {
  fileName: string;
  trackType: string;
  uid: string;
  isPlayable: boolean;
  sliceStartTime: number;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/**
 * Lấy Agora token theo bookingId (backend tự tính channelName & UID)
 */
export async function getAgoraTokenForBooking(
  bookingId: number
): Promise<AgoraTokenResponse> {
  const res = await apiClient.post<AgoraTokenResponse>(
    `/agora/token/booking/${bookingId}`
  );
  return res.data;
}

/**
 * Bắt đầu ghi âm/hình cho một booking
 */
export async function startRecordingForBooking(
  bookingId: number
): Promise<StartRecordingResponse> {
  const res = await apiClient.post<StartRecordingResponse>(
    `/agora/recording/start/booking/${bookingId}`
  );
  return res.data;
}

/**
 * Dừng ghi âm/hình cho một booking
 */
export async function stopRecordingForBooking(
  bookingId: number
): Promise<StopRecordingResponse> {
  const res = await apiClient.post<StopRecordingResponse>(
    `/agora/recording/stop/booking/${bookingId}`
  );
  return res.data;
}
