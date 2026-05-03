import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";

/* ------------------------------------------------------------------ */
/*  Interview History Types (UC-33)                                    */
/* ------------------------------------------------------------------ */

export interface InterviewHistoryItem {
  id: number;
  positionName: string | null;
  skillName: string | null;
  levelName: string | null;
  companyName: string | null;
  startTime: string;
  endTime: string | null;
  totalQuestionsAnswered: number;
  estimatedAbility: number | null;
  status: string; // "InProgress" | "Completed" | "Cancelled"
  interviewType: string; // "Single_Question" | "CV_JD" | "Text"
  questionContent: string | null;
  difficulty: string | null;
  isFromSystem: boolean | null;
}

export interface InterviewResponseDetail {
  id: number;
  questionNumber: number;
  turnNumber: number;
  questionContent: string;
  userAnswer: string | null;
  answerTimestamp: string | null;
  expectedBloomLevel: number | null;
  demonstratedBloomLevel: number | null;
  bloomScore: number | null;
  difficultyScore: number | null;
  cognitiveLoadScore: number | null;
  technicalDepthScore: number | null;
  problemSolvingScore: number | null;
  communicationScore: number | null;
  practicalExperienceScore: number | null;
  starSituationScore: number | null;
  starTaskScore: number | null;
  starActionScore: number | null;
  starResultScore: number | null;
  structuredFeedbackJson: string | null;
  aiFeedback: string | null;
  expectedAnswerOutline: string | null;
}

export interface InterviewSessionInfo {
  id: number;
  positionName: string | null;
  skillName: string | null;
  levelName: string | null;
  companyName: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  totalQuestions: number;
  totalQuestionsAnswered: number;
  overallFeedback: string | null;
  estimatedAbility: number | null;
  userCvId: number | null;
  jobDescriptionText: string | undefined;
}

export interface InterviewResultDetail {
  session: InterviewSessionInfo;
  responses: InterviewResponseDetail[];
}

/* ------------------------------------------------------------------ */
/*  Structured Feedback (parsed from structuredFeedbackJson)           */
/* ------------------------------------------------------------------ */

export interface StructuredFeedback {
  overall_comment?: string;
  strengths?: string[];
  improvements?: string[];
  detailed_feedback?: string;
  suggested_answer?: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  API Functions — UC-33                                              */
/* ------------------------------------------------------------------ */

/**
 * UC-33: Lấy danh sách lịch sử phỏng vấn AI
 */
export const getInterviewHistory = async (): Promise<InterviewHistoryItem[]> => {
  const response = await apiClient.get(APIConfig.InterviewAI.GetHistory);
  const data = response.data?.data ?? response.data;
  return data as InterviewHistoryItem[];
};

/**
 * UC-33: Lấy chi tiết kết quả phỏng vấn AI
 */
export const getInterviewResult = async (
  sessionId: number
): Promise<InterviewResultDetail> => {
  const url = APIConfig.InterviewAI.GetResult.replace(
    "{sessionId}",
    sessionId.toString()
  );
  const response = await apiClient.get(url);
  const data = response.data?.data ?? response.data;
  return data as InterviewResultDetail;
};

/* ------------------------------------------------------------------ */
/*  Types — UC-34: Thiết lập phỏng vấn                                */
/* ------------------------------------------------------------------ */

export interface InterviewCostInfo {
  requiresPayment: boolean;
  isFree: boolean;
  freeUsedMock?: number;
  freeLimit?: number;
  remainingFree?: number;
  usedMock?: number;      // New field from backend
  limit?: number;         // New field from backend
  remaining?: number;     // New field from backend
  cost?: number;
  balance?: number;
  hasEnoughBalance?: boolean;
  subscriptionPlan?: string;
}

export interface SetupInterviewRequest {
  method: "manual" | "jd";
  // Manual
  positionId?: number;
  skillId?: number;
  level?: string;
  companyId?: number;
  // JD + CV
  jobDescriptionSourceType?: "url" | "text" | "file";
  jobDescriptionUrl?: string;
  jobDescriptionText?: string;
  cvId?: number;
  language?: string;
}

export interface SetupInterviewResponse {
  position: string;
  skill: string;
  skills: string[];
  level: string;
  company: string | null;
  requirements: string[] | null;
  levelMismatchWarning: string | null;
}

export interface CreateSessionRequest {
  positionName?: string;
  skillName?: string;
  skillNames?: string[];
  levelName?: string;
  companyName?: string;
  jobDescriptionText?: string;
  cvId?: number;
  cvContent?: string;
  language?: string;
}

export interface CreateSessionResponse {
  sessionId: number;
  language: string;
}

/* ------------------------------------------------------------------ */
/*  Types — UC-35: Phỏng vấn trực tiếp                                */
/* ------------------------------------------------------------------ */

export interface GenerateQuestionResponse {
  interviewResponseId: number;
  questionText: string;
  expectedAnswerOutline?: string;
  topic?: string;
  isTerminated?: boolean;
  terminationReason?: string;
  terminationMessage?: string;
  audioBase64?: string | null;
  mimeType?: string | null;
  metrics?: {
    bloomTaxonomy?: { level: number; levelName: string; description: string };
    irt?: { difficultyScore: number; estimatedAbility: number; interpretation: string };
    clt?: { totalCognitiveLoad: number; interpretation: string };
    questionType?: string;
  };
}

export interface SubmitAnswerRequest {
  interviewSessionId: number;
  interviewResponseId: number;
  userAnswer: string;
}

/* ------------------------------------------------------------------ */
/*  API Functions — UC-34                                              */
/* ------------------------------------------------------------------ */

/**
 * Kiểm tra chi phí phỏng vấn (lượt free / subscription / peppoints)
 */
export const checkInterviewCost = async (): Promise<InterviewCostInfo> => {
  const response = await apiClient.get(APIConfig.InterviewAI.CheckCost);
  const data = response.data?.data ?? response.data;
  return data as InterviewCostInfo;
};

/**
 * Thiết lập phỏng vấn: Gửi JD để AI phân loại vị trí, kỹ năng, cấp độ
 * Hỗ trợ cả JSON (text/url) và FormData (file)
 */
export const setupInterview = async (
  request: SetupInterviewRequest,
  file?: File
): Promise<SetupInterviewResponse> => {
  let response;

  if (file) {
    // File upload — dùng FormData
    const formData = new FormData();
    formData.append("method", request.method);
    formData.append("jobDescriptionSourceType", "file");
    formData.append("file", file);
    if (request.cvId) formData.append("cvId", request.cvId.toString());
    response = await apiClient.post(APIConfig.InterviewAI.Setup, formData);
  } else {
    // JSON body
    response = await apiClient.post(APIConfig.InterviewAI.Setup, request);
  }

  const data = response.data?.data ?? response.data;
  return data as SetupInterviewResponse;
};

/**
 * Tạo phiên phỏng vấn mới (trừ lượt free hoặc peppoints)
 */
export const createInterviewSession = async (
  request: CreateSessionRequest
): Promise<CreateSessionResponse> => {
  const response = await apiClient.post(
    APIConfig.InterviewAI.CreateSession,
    request
  );
  const data = response.data?.data ?? response.data;
  return data as CreateSessionResponse;
};

/* ------------------------------------------------------------------ */
/*  API Functions — UC-35                                              */
/* ------------------------------------------------------------------ */

/**
 * Lấy tin chào đầu buổi phỏng vấn
 */
export interface WelcomeMessageResponse {
  welcomeMessage: string;
  audioBase64?: string | null;
  mimeType?: string | null;
}

export const getWelcomeMessage = async (
  sessionId: number
): Promise<WelcomeMessageResponse> => {
  const url = APIConfig.InterviewAI.WelcomeMessage.replace(
    "{sessionId}",
    sessionId.toString()
  );
  const response = await apiClient.get(url);
  const data = response.data?.data ?? response.data;
  return data as WelcomeMessageResponse;
};

/**
 * Tạo câu hỏi tiếp theo (adaptive)
 */
export const generateQuestion = async (
  sessionId: number,
  estimatedAbility?: number
): Promise<GenerateQuestionResponse> => {
  const response = await apiClient.post(
    APIConfig.InterviewAI.GenerateQuestion,
    {
      interviewSessionId: sessionId,
      estimatedAbility: estimatedAbility ?? null,
    },
    { timeout: 200_000 } // 200 giây
  );
  const data = response.data?.data ?? response.data;

  // Nếu response chứa isTerminated ở top level
  if (response.data?.isTerminated) {
    return {
      ...data,
      isTerminated: true,
      terminationReason: response.data.terminationReason,
      terminationMessage: response.data.terminationMessage,
    };
  }

  return data as GenerateQuestionResponse;
};

/**
 * Gửi câu trả lời của người dùng — nhận phản hồi AI
 */
export interface SubmitAnswerResponse {
  message: string;
  aiReaction?: string;
  aiReactionAudioBase64?: string | null;
  mimeType?: string | null;
}

export const submitAnswer = async (
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
  const response = await apiClient.post(
    APIConfig.InterviewAI.SubmitAnswer,
    request,
    { timeout: 200_000 } // 200 giây
  );
  const data = response.data?.data ?? response.data;
  return data as SubmitAnswerResponse;
};

/**
 * Kết thúc phiên phỏng vấn — tạo feedback chạy nền
 */
export const endInterview = async (sessionId: number): Promise<void> => {
  const url = APIConfig.InterviewAI.EndInterview.replace(
    "{sessionId}",
    sessionId.toString()
  );
  await apiClient.post(url);
};

/**
 * Khôi phục trạng thái phiên phỏng vấn khi reload trang
 */
export interface ResumeSessionResponseItem {
  id: number;
  turnNumber: number;
  questionContent: string;
  userAnswer: string | null;
  answerTimestamp: string | null;
}

export interface ResumeSessionResponse {
  session: {
    id: number;
    positionName: string | null;
    skillName: string | null;
    levelName: string | null;
    companyName: string | null;
    startTime: string;
    endTime: string | null;
    status: string;
  };
  responses: ResumeSessionResponseItem[];
  answeredCount: number;
  currentResponseId: number | null;
  hasUnansweredQuestion: boolean;
}

export const resumeSession = async (
  sessionId: number
): Promise<ResumeSessionResponse> => {
  const url = APIConfig.InterviewAI.ResumeSession.replace(
    "{sessionId}",
    sessionId.toString()
  );
  const response = await apiClient.get(url);
  const data = response.data?.data ?? response.data;
  return data as ResumeSessionResponse;
};

/**
 * Chuyển giọng nói (base64) → văn bản bằng Whisper
 */
export const transcribeWhisperBase64 = async (
  audioData: string,
  fileName?: string,
  language?: string
): Promise<string> => {
  const response = await apiClient.post(
    APIConfig.InterviewAI.TranscribeWhisper,
    { audioData, fileName, language }
  );
  const data = response.data?.data ?? response.data;
  return data.text as string;
};

/**
 * Sửa thuật ngữ IT tiếng Anh trong transcript tiếng Việt
 */
export const correctTranscript = async (
  transcript: string
): Promise<string> => {
  const response = await apiClient.post(
    APIConfig.InterviewAI.CorrectTranscript,
    { transcript }
  );
  const data = response.data?.data ?? response.data;
  return data.correctedText as string;
};

/* ------------------------------------------------------------------ */
/*  API Functions — Speech TTS                                         */
/* ------------------------------------------------------------------ */

export interface SynthesizeSpeechResponse {
  text: string;
  audioUrl: string;
  audioBase64: string | null;
  mimeType: string | null;
  voice: string;
  language: string;
}

/**
 * Chuyển text AI thành giọng nói (TTS) qua Gemini
 */
export const synthesizeSpeech = async (
  text: string,
  language?: string
): Promise<SynthesizeSpeechResponse> => {
  const response = await apiClient.post(APIConfig.Speech.Synthesize, {
    text,
    language: language ?? "vi-VN",
    returnBase64: true,
  });
  const data = response.data?.data ?? response.data;
  return data as SynthesizeSpeechResponse;
};

