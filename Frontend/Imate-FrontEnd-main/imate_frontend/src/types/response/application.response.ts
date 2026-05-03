export interface ApplicationResponse {
  id: number;
  applicationType: string;
  createdAt: string;
  title: string;
  content: string;
  status: string;
  responseNote: string;
  reviewer: {
    id: number;
    fullName: string;
    avatarUrl: string;
  } | null;
}

export interface ApplicationListResponse {
  items: ApplicationResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApplicationTechnicalDetailResponse {
  id: number;
  userId: number;
  avatarUrl: string | null;
  email: string;
  fullName: string;
  status: string;
  applicationType: "Đơn Lỗi Kỹ Thuật";
  createdAt: string;
  updatedAt: string | null;
  title: string;
  content: string;
  response: string;
  reviewerName: string | null;
  evidenceUrls: string[];
}

export interface ApplicationMentorDetailResponse {
  id: number;
  userId: number;
  avatarUrl: string | null;
  email: string;
  fullName: string;
  status: string;
  applicationType: "Đơn Tố Cáo Mentor";
  createdAt: string;
  updatedAt: string | null;
  title: string;
  content: string;
  response: string;
  reviewerName: string | null;
  evidenceUrls: string[];
  bookingDetails: {
    bookingId: number;
    price: number;
    bookDate: string;
    starTime: string;

    mentorDetails: {
      id: number;
      fullName: string;
      email: string;
      avatarUrl: string;
    } | null;
  } | null;
}

export interface ApplicationRatingDetailResponse {
  id: number;
  userId: number;
  avatarUrl: string | null;
  email: string;
  fullName: string;
  status: string;
  applicationType: "Đơn Tố Cáo Rating";
  createdAt: string;
  updatedAt: string | null;
  title: string;
  content: string;
  response: string;
  reviewerName: string | null;
  evidenceUrls: string[];
  ratingDetails: {
    ratingScore: number;
    reviewText: string;
    ratingCreatedAt: string;
    mentorDetails: {
      id: number;
      fullName: string;
      email: string;
      avatarUrl: string;
    };
  } | null;
}

export interface ApplicationStaff {
  id: number;
  userId: number;
  avatarUrl: string | null;
  email: string;
  fullName: string;
  status: string;
  applicationType: string;
  createdAt: string;
  updatedAt: string | null;
  title: string;
  content: string;
  commentId: number | null;
  commentContent: string | null;
  commentUserId: number | null;
  commentUserName: string | null;
}

export interface ApplicationListStaffResponse {
  items: ApplicationStaff[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// {
//   "success": true,
//   "data": [
//     {
//       "type": 0,
//       "totalNeedProcess": 0
//     },
//     {
//       "type": 1,
//       "totalNeedProcess": 3
//     },
//     {
//       "type": 2,
//       "totalNeedProcess": 5
//     },
//     {
//       "type": 3,
//       "totalNeedProcess": 1
//     }
//   ],
//   "message": "Lấy thống kê đơn cần duyệt thành công"
// }
export interface ApplicationPendingSummary {
  data: {
    type: string;
    totalNeedProcess: number;
  }[];
  message: string;
  success: boolean;
}

export interface ReportCommentUserInfo {
  id: number;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface ReportCommentQuestionInfo {
  id: number;
  content: string | null;
  createdByUser: ReportCommentUserInfo | null;
}

export interface ReportCommentDetailInfo {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  author: ReportCommentUserInfo;
  question: ReportCommentQuestionInfo | null;
}

export interface ApplicationReportCommentDetailResponse {
  id: number;
  title: string;
  content: string;
  status: string;
  applicationType: string;
  evidenceUrls: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string | null;
  reporter: ReportCommentUserInfo;
  reviewerId: number | null;
  reviewerName: string | null;
  commentId: number | null;
  commentDetail: ReportCommentDetailInfo | null;
}
