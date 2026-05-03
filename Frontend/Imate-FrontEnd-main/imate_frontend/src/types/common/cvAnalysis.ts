/** Một điểm mạnh hoặc điểm cần cải thiện */
export interface CvInsight {
  title: string;
  description: string;
}

/** Một câu hỏi phỏng vấn gợi ý */
export interface InterviewQuestion {
  category: string;
  question: string;
}

/** Kết quả phân tích CV từ Gemini AI */
export interface CvAnalysisResult {
  score: number;
  candidateName: string;
  jobTitle: string;
  marketFit: string; // "Cao" | "Trung bình" | "Thấp"
  strengths: CvInsight[];
  improvements: CvInsight[];
  interviewQuestions: InterviewQuestion[];
}
