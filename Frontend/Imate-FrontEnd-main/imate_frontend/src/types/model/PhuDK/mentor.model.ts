// export interface MentorItem {
//   accountId: number;
//   email: string;
//   fullName: string;
//   avatarUrl: string;
//   bio: string;
//   pricePerSession: number;
//   totalSessions: number;
//   averageRating: number;
//   reviews: string[];
//   phone: string;
//   birthDate: string;
//   yoe: number;
//   cvUrl: string;
//   certificateUrl: string;
//   companies: string[];
//   positions: string[];
//   skills: string[];
// }
// export interface MentorList {
//   data: MentorItem[];
// }

export interface Mentor {
  accountId: number;
  bio: string;
  phone: string;
  birthDate: string;
  yoe: number;
  cvUrl: string;
  certificateUrl: string;
  pricePerSession: number;
  guaranteeFundAmount: number;
  averageRating: number;
  totalRatingCount: number;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
}
