import apiClient from "./apiClient";
import APIConfig from "../config/apiConfig";

export interface JourneyGapItem {
  gapName: string;
  gapType: string;
  status: "Unresolved" | "Resolved";
  source?: string;
  consecutiveGoodScore: number;
  timesAsked: number;
  lastAskedSessionId?: number;
}

export interface TrainingJourneySummary {
  journeyId: number;
  name: string;
  totalSessions: number;
  totalGaps: number;
  resolvedGaps: number;
  lastPracticed: string;
  status: string;
}

export interface JourneyProgressResult {
  journeyId: number;
  userCvId: number;
  jobDescriptionText: string;
  status: string;
  totalSessions: number;
  scoreHistory: number[];
  name: string;
  updatedAt: string;
  resolvedGaps: JourneyGapItem[];
  unresolvedGaps: JourneyGapItem[];
  /// Thiếu sót về kinh nghiệm / bằng cấp — chỉ hiển thị, không luyện tập
  profileGaps: string[];
  sessionHistory: JourneySessionSummary[];
}

export interface JourneySessionSummary {
  sessionId: number;
  sessionNumber: number;
  startTime: string;
  estimatedAbility?: number;
  levelName?: string;
  sessionGapsJson: string;
}

export interface CreateJourneyRequest {
  cvId: number;
  cvContent: string;
  jobDescriptionText: string;
  name?: string;
}

export interface CreateJourneyResponse {
  journeyId: number;
  gapNames: string[];
  totalGaps: number;
  message: string;
}

export interface StartJourneySessionResult {
  sessionId: number;
  allResolved: boolean;
  gapsToTrain: {
    gapName: string;
    gapType: string;
    mode: "New" | "Review";
  }[];
}

export interface EndJourneySessionResult {
  allResolved: boolean;
  gapUpdates: {
    gapName: string;
    previousStatus: string;
    newStatus: string;
    score: number;
  }[];
  message: string;
}

export interface PaginatedJourneyResult {
  items: TrainingJourneySummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const createJourney = async (
  request: CreateJourneyRequest
): Promise<CreateJourneyResponse> => {
  const response = await apiClient.post(APIConfig.TrainingJourney.Create, request);
  return response.data?.data ?? response.data?.Data ?? response.data;
};

export const getJourneyList = async (
  page = 1,
  pageSize = 10
): Promise<PaginatedJourneyResult> => {
  const response = await apiClient.get(APIConfig.TrainingJourney.GetList, {
    params: { page, pageSize },
  });
  return response.data?.data ?? response.data?.Data ?? response.data;
};

export const getJourneyProgress = async (
  journeyId: number
): Promise<JourneyProgressResult> => {
  const url = APIConfig.TrainingJourney.GetProgress.replace("{journeyId}", journeyId.toString());
  const response = await apiClient.get(url);
  return response.data?.data ?? response.data?.Data ?? response.data;
};

export const startJourneySession = async (
  journeyId: number
): Promise<StartJourneySessionResult> => {
  const url = APIConfig.TrainingJourney.StartSession.replace("{journeyId}", journeyId.toString());
  const response = await apiClient.post(url);
  return response.data?.data ?? response.data?.Data ?? response.data;
};

export const endJourneySession = async (
  sessionId: number
): Promise<EndJourneySessionResult> => {
  const url = APIConfig.TrainingJourney.EndSession.replace("{sessionId}", sessionId.toString());
  const response = await apiClient.post(url);
  return response.data?.data ?? response.data?.Data ?? response.data;
};

export const renameJourney = async (
  journeyId: number,
  newName: string
): Promise<void> => {
  await apiClient.patch(`${APIConfig.TrainingJourney.Base}/${journeyId}/rename`, { newName });
};