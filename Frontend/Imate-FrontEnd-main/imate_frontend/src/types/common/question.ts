/**
 * Question related types and interfaces
 */

export interface ListHotQuestionResponse {
  id: number;
  content: string;
  categories: string[];
  commentCount: number;
}

// API Response wrapper
export interface GetListHotQuestionsResponse {
  data: ListHotQuestionResponse[];
}

// Question Bank Types
export interface QuestionBankItem {
  id: number;
  title: string;
  content: string;
  categories: string[];
  skills: string[];
  difficulty: string | null;
  commentCount: number;
  createdBy: string;
  createdAt: string;
}

export interface PublicQuestionLookupItem {
  id: number;
  name: string;
}

export interface PublicSystemQuestionBankItem {
  id: number;
  content: string;
  difficulty: string | null;
  sampleAnswer?: string;
  creatorName: string;
  createdAt: string;
  categories: PublicQuestionLookupItem[];
  skills: PublicQuestionLookupItem[];
  positions: PublicQuestionLookupItem[];
  isSaved: boolean;
  commentCount?: number;
}

export interface PublicContributedQuestionDetail {
  id: number;
  interviewDate?: string;
  level?: string;
  company?: string;
  companyURL?: string;
}

export interface PublicContributedQuestionBankItem {
  id: number;
  content: string;
  difficulty: string | null;
  sampleAnswer?: string;
  isActive: boolean;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorRole?: string;
  contributedDetail?: PublicContributedQuestionDetail;
  categories: PublicQuestionLookupItem[];
  skills: PublicQuestionLookupItem[];
  positions: PublicQuestionLookupItem[];
  isSaved: boolean;
  commentCount?: number;
}

export type SavedSystemQuestionItem = PublicSystemQuestionBankItem;

export type SavedContributedQuestionItem = PublicContributedQuestionBankItem;

export interface SystemQuestionBankItem {
  skillId: number;
  positionId: number;
  categoryId: number;
  difficulty: DifficultyLevel;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface ContributeQuestionBankItem {
  skillId: number;
  positionId: number;
  categoryId: number;
  companyId: number;
  level: Level;
  difficulty: DifficultyLevel;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface QuestionBankListResponse {
  items: PublicSystemQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SystemQuestionBankListResponse {
  questions: SystemQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ContributeQuestionBankListResponse {
  questions: ContributeQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GetSystemQuestionBankListResponse {
  data: SystemQuestionBankListResponse;
}

export interface GetContributeQuestionBankListResponse {
  data: ContributeQuestionBankListResponse;
}

export interface GetQuestionBankListResponse {
  success: boolean;
  data: QuestionBankListResponse;
  message?: string;
}

// Request Types
export interface GetQuestionBankListRequest {
  skillId?: number;
  positionId?: number;
  searchTerm?: string;
  categoryId?: number;
  difficulty?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPublicContributedQuestionBankListRequest extends GetQuestionBankListRequest {
  companyId?: number;
  level?: number;
  companyName?: string;
}

export interface GetMyContributedQuestionsRequest {
  approvalStatus?: number;
  skillId?: number;
  positionId?: number;
  categoryId?: number;
  level?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface PublicContributedQuestionBankListResponse {
  items: PublicContributedQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MyContributedQuestionItem {
  id: number;
  content: string;
  isActive: boolean;
  isSaved?: boolean;
  approvalStatus: string;
  sampleAnswer?: string;
  contributedDetailId?: number;
  contributedDetail?: {
    id?: number;
    interviewDate?: string;
    level?: string;
    company?: {
      id?: number;
      name?: string;
      imageUrl?: string;
    };
  };
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
  commentCount?: number;
}

export interface MyContributedQuestionListResponse {
  items: MyContributedQuestionItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetPublicContributedQuestionBankListResponse {
  success: boolean;
  data: PublicContributedQuestionBankListResponse;
  message?: string;
}

// Category Types
export interface CategoryItem {
  id: number;
  name: string;
}

export interface GetListQuestionCategoriesResponse {
  data: CategoryItem[];
}

// Types for Difficulty and Level
export type DifficultyLevel = 0 | 1 | 2; // 0 = Easy, 1 = Medium, 2 = Hard

export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Intern, 1 = Junior, 2 = Middle, 3 = Senior, 4 = Lead, 5 = Manager

// Staff Question Management Types
export interface StaffSystemQuestionItem {
  id: number;
  content: string;
  positionsName?: string[];
  skillsName?: string[];
  categoriesName?: string[];
  creatorName?: string;
  difficulty: DifficultyLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffContributedQuestionItem {
  id: number;
  content: string;
  difficulty: DifficultyLevel | null;
  isFromSystem: boolean;
  isActive: boolean;
  creatorId: number;
  creatorName: string;
  sampleAnswer?: string;
  contributedDetailId?: number;
  contributedDetail?: any;
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffQuestionListResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Request Parameters
export interface GetSystemQuestionParams {
  skillId?: number;
  positionId?: number;
  categoryId?: number;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface GetContributedQuestionParams {
  skillId?: number;
  positionId?: number;
  categoryId?: number;
  companyId?: number;
  level?: Level;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

// Position and Skill Types
export interface PositionItem {
  id: number;
  name: string;
}

export interface SkillItem {
  id: number;
  name: string;
}

export interface CategoryItem {
  id: number;
  name: string;
}


export interface CompanyItem {
  id: number;
  name: string;
}

// Create and Update System Question Types
export interface CreateSystemQuestionRequest {
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  categoryIds: number[];
  skillIds: number[];
  positionIds: number[];
}

export interface UpdateSystemQuestionRequest {
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  isActive: boolean;
  categoryIds: number[];
  skillIds: number[];
  positionIds: number[];
}

export interface CreateQuestionResponse {
  message: string;
  questionId: number;
}

export interface UpdateQuestionResponse {
  message: string;
  questionId: number;
}

export interface ChangeContributedQuestionStatusResponse {
  message: string;
  questionId: number;
  newStatus: boolean;
}

// Contribute Question Request (Candidate)
export interface ContributeQuestionRequest {
  content: string;
  companyId: number;
  positionIds: number[];
  level: Level;
  difficulty: DifficultyLevel;
  skillIds: number[];
  interviewDate: string; // DateOnly serialized as string "YYYY-MM-DD"
  categoryIds: number[];
  userAnswer: string;
}

// Detailed Question for Edit
export interface SystemQuestionDetail {
  id: number;
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  isActive: boolean;
  isFromSystem: boolean;
  creatorId: number;
  creatorName: string;
  categories?: CategoryItem[];
  skills?: SkillItem[];
  positions?: PositionItem[];
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
  comments?: CommentItem[];
}

// Contributed Question Detail for View
export interface ContributedQuestionDetail {
  id: number;
  content: string;
  difficulty: DifficultyLevel | null;
  level: Level | null;
  isFromSystem: boolean;
  isActive: boolean;
  creatorId: number;
  creatorName: string;
  companyName: string;
  sampleAnswer?: string;
  contributedDetailId?: number;
  contributedDetail?: any;
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
  comments?: CommentItem[];
}

export interface CommentItem {
  id: number;
  userId: string | number;
  userName: string;
  userAvatarUrl: string;
  userRole: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  downvoteCount: number;
  totalVotes: number;
  currentUserVoteIsUpvote?: boolean | null;
  currentUserVoteType?: "upvote" | "downvote" | null;
}

export interface FinalImportRequest {
  content: string;
  difficulty: string;
  sampleAnswer: string;
  categoryNames: string;
  skillNames: string;
  positionNames: string;
  isValid?: boolean;
  validationErrors?: string[];
  rowNumber?: number;
}

export interface ValidateExcelResponse {
  validRequests: FinalImportRequest[];
  invalidRequests: FinalImportRequest[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}