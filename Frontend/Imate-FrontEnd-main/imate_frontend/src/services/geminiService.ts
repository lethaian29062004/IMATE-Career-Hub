import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { CvAnalysisResult } from "@/types/common/cvAnalysis";

/**
 * Phân tích CV bằng AI (gọi qua backend)
 * Backend sẽ gọi Gemini API, frontend không cần API key
 */
export const analyseCv = async (cvText: string): Promise<CvAnalysisResult> => {
  const response = await apiClient.post(APIConfig.AI.AnalyseCv, {
    cvText: cvText,
  });

  // Backend trả về { success, data, message }
  const data = response.data?.data ?? response.data;
  return data as CvAnalysisResult;
};

/* ------------------------------------------------------------------ */
/*  Practice Test (UC-30)                                              */
/* ------------------------------------------------------------------ */

export interface PracticeTestOption {
  label: string;
  text: string;
}

export interface PracticeTestQuestion {
  id: number;
  questionText: string;
  options: PracticeTestOption[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeTestResult {
  testTitle: string;
  testType: string;
  field: string;
  skill: string;
  level: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: PracticeTestQuestion[];
}

export interface GeneratePracticeTestParams {
  testType: string;
  field: string;
  skill: string;
  level: string;
  useCV: boolean;
  cvText?: string;
  numberOfQuestions?: number;
}

/**
 * Sinh bài test luyện tập bằng AI
 */
export const generatePracticeTest = async (
  params: GeneratePracticeTestParams
): Promise<PracticeTestResult> => {
  const response = await apiClient.post(APIConfig.AI.GeneratePracticeTest, params);
  const data = response.data?.data ?? response.data;
  return data as PracticeTestResult;
};

/* ------------------------------------------------------------------ */
/*  Practice Test History (UC-31, UC-32)                               */
/* ------------------------------------------------------------------ */

export interface SubmitAnswerItem {
  questionNumber: number;
  questionText: string;
  optionsJson: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string;
}

export interface SubmitPracticeTestParams {
  testTitle: string;
  testType: string;
  field: string;
  skill: string;
  level: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  durationMinutes?: number;
  answers: SubmitAnswerItem[];
}

export interface TestHistoryItem {
  id: number;
  testTitle: string;
  testType: string;
  field: string;
  level: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export interface TestAnswerDetail {
  questionNumber: number;
  questionText: string;
  optionsJson: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  explanation: string | null;
}

export interface TestHistoryDetail {
  id: number;
  testTitle: string;
  testType: string;
  field: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeLimitMinutes: number;
  durationMinutes: number | null;
  technicalScore: number | null;
  logicalScore: number | null;
  optimizationScore: number | null;
  aiFeedback: string | null;
  aiStrengths: string | null;
  aiImprovements: string | null;
  completedAt: string;
  answers: TestAnswerDetail[];
}

/**
 * Nộp bài test và lưu kết quả
 */
export const submitPracticeTest = async (
  params: SubmitPracticeTestParams
): Promise<{ sessionId: number }> => {
  const response = await apiClient.post(APIConfig.PracticeTest.Submit, params);
  const data = response.data?.data ?? response.data;
  return data;
};

/**
 * UC-31: Lấy danh sách lịch sử test
 */
export const getTestHistory = async (): Promise<TestHistoryItem[]> => {
  const response = await apiClient.get(APIConfig.PracticeTest.GetHistory);
  const data = response.data?.data ?? response.data;
  return data as TestHistoryItem[];
};

/**
 * UC-32: Lấy chi tiết kết quả test
 */
export const getTestHistoryDetail = async (
  id: number
): Promise<TestHistoryDetail> => {
  const url = APIConfig.PracticeTest.GetDetail.replace("{id}", id.toString());
  const response = await apiClient.get(url);
  const data = response.data?.data ?? response.data;
  return data as TestHistoryDetail;
};

