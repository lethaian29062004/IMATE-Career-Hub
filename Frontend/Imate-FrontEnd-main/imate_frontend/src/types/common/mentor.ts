/**
 * Mentor related types and interfaces
 */

export interface ListPreviewMentorResponse {
  fullName: string;
  position: string;
  yoe: number;
  company: string;
  avgRatings: number | null;
  totalRatingCount: number | null;
  /** Optional: avatar URL (when API supports) */
  avatarUrl?: string;
  /** Optional: short bio (when API supports) */
  bio?: string;
  /** Optional: account/mentor id for booking link */
  accountId?: number;
}

// API Response wrapper
export interface GetListPreviewMentorsResponse {
  data: ListPreviewMentorResponse[];
}
