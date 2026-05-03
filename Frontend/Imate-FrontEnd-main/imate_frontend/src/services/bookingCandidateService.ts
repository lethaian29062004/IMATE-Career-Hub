import APIConfig from "@/config/apiConfig";
import apiClient from "./apiClient";
import type { BookingDetailResponse } from "@/types/response/booking.response";

export interface BookingCreateRequest {
  mentorId: number;
  slotId: number;
  bookDate: string; // YYYY-MM-DD format
}

/**
 * [POST] Tạo booking mới với mentor
 */
export const createBooking = async (request: BookingCreateRequest) => {
  try {
    const res = await apiClient.post<{
      success: boolean;
      data: any;
      message: string;
    }>(`/bookings`, {
      MentorId: request.mentorId,
      SlotId: request.slotId,
      BookDate: request.bookDate,
    });

    return res.data;
  } catch (error) {
    console.error("Error creating booking: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy danh sách booking của candidate
 */
export const getCandidateBookings = async () => {
  try {
    const res = await apiClient.get<BookingDetailResponse[]>(`/candidates/bookings`);
    return res.data;
  } catch (error) {
    console.error("Error fetching candidate bookings: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy danh sách booking của mentor
 */
export const getMentorBookings = async () => {
  try {
    const res = await apiClient.get<BookingDetailResponse[]>(`/bookings/mentor/my-bookings`);
    return res.data;
  } catch (error) {
    console.error("Error fetching mentor bookings: ", error);
    throw error;
  }
};

/**
 * [PUT] Hủy booking
 */
export const cancelBooking = async (bookingId: number) => {
  try {
    const url = APIConfig.Mentor.CancelBooking.replace("{bookingId}", bookingId.toString());
    const res = await apiClient.put(url);
    return res.data;
  } catch (error) {
    console.error("Error cancelling booking: ", error);
    throw error;
  }
};

/**
 * [POST] Đánh giá mentor sau buổi học
 */
export const rateMentor = async (bookingId: number, ratingScore: number, reviewText: string) => {
  try {
    const res = await apiClient.post(`/bookings/${bookingId}/rate`, {
      ratingScore,
      reviewText,
    });
    return res.data;
  } catch (error) {
    console.error("Error rating mentor: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy lịch sử phỏng vấn của mentor
 */
export const getMentorSessionHistory = async () => {
    try {
      const res = await apiClient.get<any[]>(`/bookings/mentor/history-session`);
      return res.data;
    } catch (error) {
      console.error("Error fetching mentor session history: ", error);
      throw error;
    }
  };
  
  /**
   * [GET] Lấy chi tiết buổi phỏng vấn trong lịch sử
   */
  export const getMentorSessionDetail = async (sessionId: number) => {
    try {
      const res = await apiClient.get<BookingDetailResponse>(`/bookings/mentor/history-session/${sessionId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching mentor session detail: ", error);
      throw error;
    }
  };

/**
 * [GET] Lấy lịch sử phỏng vấn của candidate (completed/cancelled)
 */
export const getCandidateSessionHistory = async () => {
  try {
    const res = await apiClient.get<any[]>(`/bookings/candidate/history-session`);
    return res.data;
  } catch (error) {
    console.error("Error fetching candidate session history: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy chi tiết buổi phỏng vấn của candidate
 */
export const getCandidateSessionDetail = async (sessionId: number) => {
  try {
    const res = await apiClient.get<BookingDetailResponse>(`/bookings/candidate/history-session/${sessionId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching candidate session detail: ", error);
    throw error;
  }
};


