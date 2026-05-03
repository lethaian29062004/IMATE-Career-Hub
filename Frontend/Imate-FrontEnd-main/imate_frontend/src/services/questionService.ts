import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type {
  ListHotQuestionResponse,
  GetListHotQuestionsResponse,
  QuestionBankListResponse,
  GetQuestionBankListResponse,
  GetQuestionBankListRequest,
  GetPublicContributedQuestionBankListRequest,
  GetPublicContributedQuestionBankListResponse,
  PublicContributedQuestionBankListResponse,
  GetMyContributedQuestionsRequest,
  MyContributedQuestionItem,
  MyContributedQuestionListResponse,
  CategoryItem,
  GetListQuestionCategoriesResponse,
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  StaffQuestionListResponse,
  GetSystemQuestionParams,
  GetContributedQuestionParams,
  CreateSystemQuestionRequest,
  UpdateSystemQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionResponse,
  ChangeContributedQuestionStatusResponse,
  SystemQuestionDetail,
  ContributedQuestionDetail,
  ContributeQuestionRequest,
  SavedSystemQuestionItem,
  SavedContributedQuestionItem,
  CommentItem,
  ValidateExcelResponse,
  FinalImportRequest,
} from "@/types/common/question";

const parsePagination = (
  paginationHeader: string | undefined,
  fallback: {
    totalCount?: number;
    pageSize?: number;
    pageNumber?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  }
) => {
  const parsed = paginationHeader
    ? JSON.parse(paginationHeader)
    : null;

  return {
    totalCount: Number(
      parsed?.totalCount ?? parsed?.TotalCount ?? fallback.totalCount ?? 0
    ),
    pageNumber: Number(
      parsed?.pageNumber ?? parsed?.PageNumber ?? fallback.pageNumber ?? 1
    ),
    pageSize: Number(
      parsed?.pageSize ?? parsed?.PageSize ?? fallback.pageSize ?? 10
    ),
    totalPages: Number(
      parsed?.totalPages ?? parsed?.TotalPages ?? fallback.totalPages ?? 0
    ),
    hasNextPage: Boolean(
      parsed?.hasNextPage ?? parsed?.HasNextPage ?? fallback.hasNextPage ?? false
    ),
    hasPreviousPage: Boolean(
      parsed?.hasPreviousPage ?? parsed?.HasPreviousPage ?? fallback.hasPreviousPage ?? false
    ),
  };
};

/**
 * Get list of hot questions for home page
 * @returns Promise<ListHotQuestionResponse[]>
 */

export const getListHotQuestions = async (): Promise<ListHotQuestionResponse[]> => {
  const response = await apiClient.get<GetListHotQuestionsResponse>(APIConfig.Question.GetListHotQuestions);
  // API trả về { data: [...] }, extract array từ property data
  return response.data.data || [];
};

/**
 * Get question bank list with filters and pagination
 * @param request - Filter and pagination parameters
 * @returns Promise<QuestionBankListResponse>
 */
export const getQuestionBankList = async (request: GetQuestionBankListRequest): Promise<QuestionBankListResponse> => {
  const response = await apiClient.get<GetQuestionBankListResponse>(APIConfig.Question.GetQuestionBankList, {
    params: request
  });
  return response.data.data;
};

/**
 * Get public contributed question bank list with filters and pagination
 * @param request - Filter and pagination parameters
 * @returns Promise<PublicContributedQuestionBankListResponse>
 */
export const getPublicContributedQuestionBankList = async (
  request: GetPublicContributedQuestionBankListRequest
): Promise<PublicContributedQuestionBankListResponse> => {
  const response = await apiClient.get<GetPublicContributedQuestionBankListResponse>(
    APIConfig.Question.GetPublicContributedQuestionBankList,
    {
      params: request,
    }
  );
  return response.data.data;
};

/**
 * Get my contributed questions with filters and pagination
 * @param request - Filter and pagination parameters
 * @returns Promise<MyContributedQuestionListResponse>
 */
export const getMyContributedQuestions = async (
  request: GetMyContributedQuestionsRequest
): Promise<MyContributedQuestionListResponse> => {
  const response = await apiClient.get<{ items: MyContributedQuestionItem[] }>(
    APIConfig.Question.GetMyContributedQuestions,
    {
      params: request,
    }
  );
  const body = response.data as MyContributedQuestionListResponse | { items?: MyContributedQuestionItem[] };
  const pagination = parsePagination(response.headers['x-pagination'], {
    totalCount: (body as MyContributedQuestionListResponse).totalCount,
    pageNumber: (body as MyContributedQuestionListResponse).pageNumber,
    pageSize: (body as MyContributedQuestionListResponse).pageSize,
    totalPages: (body as MyContributedQuestionListResponse).totalPages,
    hasNextPage: (body as MyContributedQuestionListResponse).hasNextPage,
    hasPreviousPage: (body as MyContributedQuestionListResponse).hasPreviousPage,
  });
  const totalPages = pagination.totalPages > 0
    ? pagination.totalPages
    : Math.ceil((pagination.totalCount || 0) / (pagination.pageSize || 10));

  return {
    items: body?.items || [],
    totalCount: pagination.totalCount,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
  };
};

export const getSavedSystemQuestions = async (): Promise<SavedSystemQuestionItem[]> => {
  const response = await apiClient.get<SavedSystemQuestionItem[]>(APIConfig.Question.GetSavedSystemQuestions);
  return response.data || [];
};

export const getSavedContributedQuestions = async (): Promise<SavedContributedQuestionItem[]> => {
  const response = await apiClient.get<SavedContributedQuestionItem[]>(APIConfig.Question.GetSavedContributedQuestions);
  return response.data || [];
};

/**
 * Get list of question categories
 * @returns Promise<CategoryItem[]>
 */
export const getListQuestionCategories = async (): Promise<CategoryItem[]> => {
  const response = await apiClient.get<GetListQuestionCategoriesResponse>(APIConfig.Question.GetListQuestionCategories);
  return response.data.data || [];
};

/**
 * Get all system questions for staff with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with question list and pagination info
 */
export const getAllSystemQuestionsForStaff = async (
  params: GetSystemQuestionParams
): Promise<StaffQuestionListResponse<StaffSystemQuestionItem>> => {
  const response = await apiClient.get<any>(
    APIConfig.Question.GetAllSystemQuestionsForStaff,
    { params }
  );

  const pagination = parsePagination(response.headers['x-pagination'], {
    totalCount: response.data?.totalCount ?? response.data?.TotalCount,
    pageNumber: response.data?.pageNumber ?? response.data?.PageNumber,
    pageSize: response.data?.pageSize ?? response.data?.PageSize,
    totalPages: response.data?.totalPages ?? response.data?.TotalPages,
    hasNextPage: response.data?.hasNextPage ?? response.data?.HasNextPage,
    hasPreviousPage: response.data?.hasPreviousPage ?? response.data?.HasPreviousPage,
  });

  return {
    items: response.data.items || [],
    totalCount: pagination.totalCount,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage
  };
};

/**
 * Get all contributed questions for staff with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with question list and pagination info
 */
export const getAllContributedQuestionsForStaff = async (
  params: GetContributedQuestionParams
): Promise<StaffQuestionListResponse<StaffContributedQuestionItem>> => {
  const response = await apiClient.get<any>(
    APIConfig.Question.GetAllContributedQuestionsForStaff,
    { params }
  );

  const pagination = parsePagination(response.headers['x-pagination'], {
    totalCount: response.data?.totalCount ?? response.data?.TotalCount,
    pageNumber: response.data?.pageNumber ?? response.data?.PageNumber,
    pageSize: response.data?.pageSize ?? response.data?.PageSize,
    totalPages: response.data?.totalPages ?? response.data?.TotalPages,
    hasNextPage: response.data?.hasNextPage ?? response.data?.HasNextPage,
    hasPreviousPage: response.data?.hasPreviousPage ?? response.data?.HasPreviousPage,
  });

  return {
    items: response.data.items || [],
    totalCount: pagination.totalCount,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage
  };
};

/**
 * Get all pending contributed questions for staff with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with question list and pagination info
 */
export const getAllPendingContributedQuestionsForStaff = async (
  params: GetContributedQuestionParams
): Promise<StaffQuestionListResponse<StaffContributedQuestionItem>> => {
  const response = await apiClient.get<any>(
    APIConfig.Question.GetAllPendingContributedQuestionsForStaff,
    { params }
  );

  const pagination = parsePagination(response.headers['x-pagination'], {
    totalCount: response.data?.totalCount ?? response.data?.TotalCount,
    pageNumber: response.data?.pageNumber ?? response.data?.PageNumber,
    pageSize: response.data?.pageSize ?? response.data?.PageSize,
    totalPages: response.data?.totalPages ?? response.data?.TotalPages,
    hasNextPage: response.data?.hasNextPage ?? response.data?.HasNextPage,
    hasPreviousPage: response.data?.hasPreviousPage ?? response.data?.HasPreviousPage,
  });

  return {
    items: response.data.items || [],
    totalCount: pagination.totalCount,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage
  };
};

/**
 * Change contributed question status by staff
 * @param questionId - Question ID
 * @param status - true: approve, false: reject
 * @returns Promise with update result
 */
export const changeContributedQuestionStatusForStaff = async (
  questionId: number,
  status: boolean
): Promise<ChangeContributedQuestionStatusResponse> => {
  const response = await apiClient.put<ChangeContributedQuestionStatusResponse>(
    APIConfig.Question.ChangeContributedQuestionStatusStaff.replace('{questionId}', String(questionId)),
    null,
    {
      params: { status }
    }
  );

  return response.data;
};

/**
 * Create a new system question for staff
 * @param request - Question data
 * @returns Promise with created question info
 */
export const createSystemQuestionForStaff = async (
  request: CreateSystemQuestionRequest
): Promise<CreateQuestionResponse> => {
  const response = await apiClient.post<CreateQuestionResponse>(
    APIConfig.Question.CreateSystemQuestionForStaff,
    request
  );
  return response.data;
};

/**
 * Update an existing system question for staff
 * @param questionId - ID of the question to update
 * @param request - Updated question data
 * @returns Promise with updated question info
 */
export const updateSystemQuestionForStaff = async (
  questionId: number,
  request: UpdateSystemQuestionRequest
): Promise<UpdateQuestionResponse> => {
  const response = await apiClient.put<UpdateQuestionResponse>(
    APIConfig.Question.UpdateSystemQuestionForStaff.replace('{questionId}', String(questionId)),
    request
  );
  return response.data;
};

/**
 * Get detailed information for a specific system question (for editing)
 * @param questionId - ID of the question
 * @returns Promise with question details
 */
export const getSystemQuestionDetail = async (
  questionId: number
): Promise<SystemQuestionDetail> => {
  const response = await apiClient.get<SystemQuestionDetail>(
    APIConfig.Question.GetSystemQuestionDetail.replace('{questionId}', String(questionId))
  );
  return response.data;
};

/**
 * Get detailed information for a specific contributed question (for viewing)
 * @param questionId - ID of the question
 * @returns Promise with contributed question details
 */
export const getContributedQuestionDetail = async (
  questionId: number
): Promise<ContributedQuestionDetail> => {
  const response = await apiClient.get<ContributedQuestionDetail>(
    APIConfig.Question.GetContributedQuestionDetail.replace('{questionId}', String(questionId))
  );
  return response.data;
};

/**
 * Toggle save/unsave a question (works for both system and contributed)
 * @param questionId - ID of the question to save/unsave
 */
export const saveQuestion = async (questionId: number): Promise<void> => {
  await apiClient.post(APIConfig.Question.SaveQuestion, { questionId });
};

/**
 * Contribute a question (for Candidate)
 * @param request - Contribute question request data
 * @returns Promise with create response
 */
export const contributeQuestion = async (
  request: ContributeQuestionRequest
): Promise<CreateQuestionResponse> => {
  const response = await apiClient.post<CreateQuestionResponse>(
    APIConfig.Question.ContributeQuestion,
    request
  );
  return response.data;
};

export const createComment = async (
  questionId: number,
  content: string
): Promise<number | null> => {
  const response = await apiClient.post<unknown>(APIConfig.Comment.Create, {
    questionId,
    content,
  });

  const toNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.trim());
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    return null;
  };

  const extractCommentId = (payload: unknown): number | null => {
    const direct = toNumber(payload);
    if (direct !== null) {
      return direct;
    }

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const directKeys = ["id", "commentId", "Id", "CommentId"];
    for (const key of directKeys) {
      const parsed = toNumber(record[key]);
      if (parsed !== null) {
        return parsed;
      }
    }

    const nested = record.data;
    if (!nested || typeof nested !== "object") {
      return null;
    }

    const nestedRecord = nested as Record<string, unknown>;
    for (const key of directKeys) {
      const parsed = toNumber(nestedRecord[key]);
      if (parsed !== null) {
        return parsed;
      }
    }

    return toNumber(nested);
  };

  return extractCommentId(response.data);
};

export const updateComment = async (
  commentId: number,
  content: string
): Promise<void> => {
  await apiClient.put(
    APIConfig.Comment.Update.replace("{commentId}", String(commentId)),
    { content }
  );
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(
    APIConfig.Comment.Delete.replace("{commentId}", String(commentId))
  );
};

export const voteComment = async (
  commentId: number,
  isUpvote: boolean
): Promise<void> => {
  await apiClient.post(
    APIConfig.Comment.Vote.replace("{commentId}", String(commentId)),
    { isUpvote }
  );
};

export const sortCommentsByTotalVotesDesc = (comments: CommentItem[] = []): CommentItem[] => {
  return [...comments].sort((a, b) => {
    if (b.totalVotes !== a.totalVotes) {
      return b.totalVotes - a.totalVotes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const parseFilenameFromContentDisposition = (contentDisposition?: string): string => {
  if (!contentDisposition) {
    return `System_Questions_Export_${Date.now()}.xlsx`;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) {
    return basicMatch[1];
  }

  return `System_Questions_Export_${Date.now()}.xlsx`;
};

export const exportSystemQuestionsForStaff = async (params: GetSystemQuestionParams): Promise<{ blob: Blob; fileName: string }> => {
  const response = await apiClient.get(APIConfig.Question.ExportSystemQuestions, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  const fileName = parseFilenameFromContentDisposition(response.headers["content-disposition"]);
  return {
    blob: response.data,
    fileName,
  };
};

export const validateQuestionsFromExcel = async (file: File): Promise<ValidateExcelResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<ValidateExcelResponse>(
    APIConfig.Question.ValidateQuestionsFromExcel,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const importValidatedQuestions = async (requests: FinalImportRequest[]): Promise<any> => {
  const response = await apiClient.post(
    APIConfig.Question.ImportValidatedQuestions,
    requests
  );
  return response.data;
};

export const revalidateSingleQuestion = async (request: FinalImportRequest): Promise<any> => {
  const response = await apiClient.post(
    APIConfig.Question.RevalidateSingleQuestion,
    request
  );
  return response.data;
};

export const downloadQuestionTemplate = async (): Promise<{ blob: Blob; fileName: string }> => {
  const response = await apiClient.get(APIConfig.Question.DownloadQuestionTemplate, {
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  const fileName = parseFilenameFromContentDisposition(response.headers["content-disposition"] || `Question_Import_Template_${Date.now()}.xlsx`);
  return {
    blob: response.data,
    fileName,
  };
};
