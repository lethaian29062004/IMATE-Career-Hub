import type { Mentor } from "@/types/model/PhuDK/mentor.model";
export interface MentorItem extends Mentor {
  email: string;
  fullName: string;
  avatarUrl: string;
  totalSessions: number;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  companies: string[];
  positions: string[];
  skills: string[];
  reviews: {
    score: number;
    text: string;
    createdAt: string; // ISO date string
    reviewerFullName: string;
    reviewerAvatarUrl: string | null;
  }[];
}
export interface MentorPendingListResponse {
  items: MentorItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface MentorBookedSlotResponse extends BookedSlotResponse {
  candidateId: number;
  candidateName: string;
  candidateAvatarUrl: string;
}

export interface CandidateBookedSlotResponse extends BookedSlotResponse {
  mentorId: number;
  mentorName: string;
  mentorAvatarUrl: string;
}

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
export interface MentorList {
  data: MentorItem[];
}

export interface MentorRecurringSlotsData {
  mentorId: number;
  slotsByDay: SlotsByDay[];
}

export interface SlotsByDay {
  dayOfWeek: number; // 0–6
  dayName: string; // "Chủ nhật", "Thứ hai", ...
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
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...6=Saturday
  dayOfWeekName: string;
  dayOfWeekEnglish: string;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  displayTime: string;
  fullDescription: string;
}

export interface AddMentorRecurringSlotsRequest {
  slotIds: number[];
}

export interface AddSlotsResponse {
  successCount: number;
  skippedCount: number;
  messages: string[];
  addedSlots: MentorRecurringSlot[];
}

export interface CandidateMentorPracticeSummaryResponse {
  bookingId: number;
  mentorId: number;
  mentorName: string;
  mentorAvatarUrl: string | null;
  status: string;
  startTime: string;
  ratingScore: number | null;
  reviewText: string | null;
  ratingCreatedAt: string | null;
  hasProcessedReport: boolean;
}

export interface CandidateBookingDetailResponse {
  bookingId: number;
  mentorId: number;
  mentorName: string;
  mentorAvatarUrl: string | null;
  startTime: string;
  bookDate: string;
  priceAtBooking: number;
  status: string;
  agoraChannelName: string;
  audioRecordKey: string | null; // URL của file .mp4
  ratingScore: number | null;
  reviewText: string | null;
}

export interface MentorBookingDetailResponse {
  bookingId: number;
  candidateId: number;
  candidateName: string;
  candidateAvatarUrl: string | null;
  startTime: string;
  bookDate: string;
  priceAtBooking: number;
  status: string;
  agoraChannelName: string;
  audioRecordKey: string | null; // URL của file .mp4
  ratingScore: number | null;
  reviewText: string | null;
}

export interface RatingDetailModel {
  bookingId: number;
  candidateAvatar: string;
  candidateName: string;
  reviewText: string;
  ratingScore: number;
  createdAt: string;
}

export interface CandidateRatingsResponseModel {
  totalRatingCount: number;
  averageRating: number | null;
  ratings: RatingDetailModel[];
}
export interface ReportableRating {
  bookingId: number;
  candidateName: string;
  startTime: string;
  ratingScore: number | null;
  reviewText: string | null;
  ratingCreatedAt: string | null;
  avatarUrl: string;
}
export interface ReportableRatingResponse {
  success: boolean;
  data: ReportableRating[];
  message: string;
}
export interface MentorIncomeBooking {
  bookingId: number;
  candidateName: string;
  candidateAvatarUrl: string | null;
  candidateEmail: string;
  priceAtBooking: number;
  startTime: string;
}
export interface MentorIncomeChartPoint {
  day: string;
  total: number;
}
export interface MentorIncomeResponse {
  totalIncome: number;
  bookings: MentorIncomeBooking[];
  dailyStats: MentorIncomeChartPoint[];
}

export interface MentorGuaranteeStatusResponse {
  hasSufficientGuarantee: boolean;
  requiredGuaranteeBalance: number;
  currentBalance: number;
  commissionRate: number;
  escrowBookingCount: number;
  pricePerSession: number;
  maxConcurrentBookings?: number | null;
  remainingBookingCapacity?: number | null;
}

export interface MentorStatisticResponse {
  totalInterviews: number;
  completedInterviews: number;
  pendingInterviews: number;
  completionPercentage: number;
  upcomingInterviews: [
    {
      id: number;
      candidateName: string;
      candidateAvatar: string;
      time: string;
      startTime: string;
    },
  ];
}
