export interface BookedSlotResponse {
  bookingId: number;
  startTime: string;
  bookDate: string;
  priceAtBooking: number;
  status: string;
  agoraChannelName: string;
  ratingScore: number | null;
  reviewText: string | null;
}

export interface MentorBookedSlotResponse extends BookedSlotResponse {
  candidateId: number;
  candidateName: string;
  candidateAvatarUrl: string;
}

export interface MentorRecurringSlotsData {
  mentorId: number;
  slotsByDay: SlotsByDay[];
}

export interface SlotsByDay {
  dayOfWeek: number; // 0–6
  dayName: string; 
  slots: MentorRecurringSlot[];
}

export interface MentorRecurringSlot {
  id: number;
  mentorId: number;
  slotId: number;
  createdAt: string;
  slot: SlotDetail;
  isBooked?: boolean;
  isTooSoon?: boolean;
  isPassed?: boolean;
}

export interface SlotDetail {
  id: number;
  dayOfWeek: number;
  dayOfWeekName: string;
  dayOfWeekEnglish: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  fullDescription: string;
}
