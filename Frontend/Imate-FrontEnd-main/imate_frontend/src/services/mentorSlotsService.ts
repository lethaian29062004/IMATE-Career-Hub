import apiClient from "./apiClient";
import type { 
  MentorRecurringSlotsData, 
  MentorBookedSlotResponse 
} from "@/types/response/mentor.response";

/**
 * [GET] Lấy danh sách Recurring Slots của mentor để đặt lịch
 */
export const getMentorRecurringSlots = async (mentorId: number) => {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: MentorRecurringSlotsData;
      message: string;
    }>(`/mentor-recurring-slot/mentor/${mentorId}`);

    return res.data.data;
  } catch (error) {
    console.error("Error fetching mentor recurring slots: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy danh sách các slot đã được book của mentor để check trùng lịch
 */
export const getBookedSlotOfMentor = async (mentorId: number) => {
  try {
    const res = await apiClient.get<MentorBookedSlotResponse[]>(`/bookings/mentor/${mentorId}`);

    return res.data;
  } catch (error) {
    console.error("Error fetching mentor's booked slots: ", error);
    throw error;
  }
};
