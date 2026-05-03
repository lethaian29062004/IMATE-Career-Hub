import apiClient from "./apiClient";
import type { MentorRecurringSlotsResponse } from "@/types/response/booking.response";

/**
 * [GET] Lấy danh sách slots lặp lại của mentor hiện tại
 */
export const getMyRecurringSlots = async () => {
    try {
        const res = await apiClient.get<{
            success: boolean;
            data: MentorRecurringSlotsResponse;
            message: string;
        }>(`/mentor-recurring-slot/my-slots`);
        return res.data.data;
    } catch (error) {
        console.error("Error fetching my recurring slots: ", error);
        throw error;
    }
};

/**
 * [GET] Lấy danh sách tất cả các slots có sẵn trong hệ thống
 */
export const getAllSlots = async () => {
    try {
        const res = await apiClient.get<{
            success: boolean;
            data: any[];
            message: string;
        }>(`/mentor-recurring-slot/slots`);
        return res.data.data;
    } catch (error) {
        console.error("Error fetching all slots: ", error);
        throw error;
    }
};

/**
 * [POST] Thêm danh sách slots lặp lại mới
 */
export const addMentorRecurringSlots = async (slotIds: number[]) => {
    try {
        const res = await apiClient.post<{
            success: boolean;
            data: any;
            message: string;
        }>(`/mentor-recurring-slot`, {
            SlotIds: slotIds
        });
        return res.data;
    } catch (error) {
        console.error("Error adding mentor recurring slots: ", error);
        throw error;
    }
};

/**
 * [DELETE] Xóa một slot lặp lại
 */
export const deleteMentorRecurringSlot = async (mentorRecurringSlotId: number) => {
    try {
        const res = await apiClient.delete<{
            success: boolean;
            message: string;
        }>(`/mentor-recurring-slot/${mentorRecurringSlotId}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting mentor recurring slot: ", error);
        throw error;
    }
};

/**
 * [GET] Lấy danh sách bookings của một slot (để cảnh báo khi xóa)
 */
export const getBookingsBySlotId = async (slotId: number) => {
    try {
        const res = await apiClient.get<any>(`/mentor-recurring-slot/${slotId}/bookings`);
        return res.data;
    } catch (error) {
        console.error("Error fetching bookings by slot id: ", error);
        throw error;
    }
};
