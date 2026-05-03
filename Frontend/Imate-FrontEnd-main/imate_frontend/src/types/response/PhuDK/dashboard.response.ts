// Candidate Dashboard Response Types

export interface CandidateDashboardInformationCard {
  id: number;
  title: string;
  value: number;
  previousValue: number;
}

export interface CandidateAIPerformanceResponse {
  month: string;
  aiSessions: number;
}

// Mentor Dashboard Response Types

export interface MentorDashboardInformationCard {
  upcomingSessions: number;
  averageRating: number;
  totalRatings: number;
  totalCompletedSessions: number;
  totalIncome: number;
}

export interface MentorPerformanceChartDataResponse {
  month: string;
  completed: number;
  cancelled: number;
}

export interface MentorPendingApplicationResponse {
  applicationId: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
}

// Staff Dashboard Response Types

export interface StaffDashboardInformationCard {
  key: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
}

export interface StaffDashboardApplicationTrendChartResponse {
  month: string;
  value: number;
}

export interface StaffDashboardQuestionTrendChartResponse {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface StaffDashboardMentorPendingResponse {
  mentorAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  companies: string[];
  skills: string[];
  yearsOfExperience: number;
  pricePerSession: number;
  createdAt: string;
}

export interface StaffDashboardReportPendingResponse extends MentorPendingApplicationResponse {
  applicantName: string;
}

export interface StaffDashboardQuestionPendingResponse {
  questionId: number;
  content: string;
  creatorName: string;
  companyName: string;
  level: string;
  categories: string[];
  positions: string[];
  skills: string[];
  createdAt: string;
}

export interface StaffDashboardTransactionPendingResponse {
  transactionId: number;
  transactionType: string;
  status: string;
  amount: number;
  createdAt: string;
  sourceName: string;
  targetName: string;
  externalCode: string;
}

// Admin Dashboard Response Type

export interface AdminDashboardStatisticCardResponse {
  label: string;
  subtitle: string;
  value: number;
  previousValue: number;
}

export interface AdminDashboardFeaturedCompanyResponse {
  name: string;
  imageUrl: string;
  totalQuestions: number;
}

export interface AdminDashboardUserStatisticCardResponse {
  value: number;
  label: string;
}

export interface AdminDashboardUserStatisticChartResponse {
  label: string;
  candidate: number;
  mentor: number;
  staff: number;
}

export interface AdminDashboardTopMentorResponse {
  id: number;
  name: string;
  avatar: string;
  data: {
    email: string;
    companies: string[];
    skills: string[];
    positions: string[];
    rating: number;
    totalInterviews: number;
    interviewDates: string[];
  };
}

export interface AdminDashboardRevenueStatisticCardResponse {
  title: string;
  value: string;
  subtitle: string;
}

export interface AdminDashboardRevenueChartResponse {
  label: string;
  mentor: number;
  subscription: number;
}
