export interface RatingDetail {
  bookingId: number;
  candidateAvatar: string;
  candidateName: string;
  reviewText: string;
  ratingScore: number;
  createdAt: string;
}

export interface CandidateRatingsResponse {
  totalRatingCount: number;
  averageRating: number | null;
  ratings: RatingDetail[];
}
