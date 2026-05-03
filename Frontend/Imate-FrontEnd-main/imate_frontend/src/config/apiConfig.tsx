/**
 * API Configuration - Contains all API endpoint URIs
 */

const APIConfig = {
  // Auth endpoints
  Auth: {
    LoginEmail: "/login-email",
    RegisterEmail: "/register-email",
    RegisterGoogle: "/google",
    ChangePassword: "/change-password",
    UpdateRole: "/profile/role",
    GenerateActionCode: "/generate-action-code",
    SendActionEmail: "/send-action-email",
  },

  // Mentor endpoints (không leading slash để URL = baseURL + path)
  Mentor: {
    GetListPreviewMentors: "get-list-preview-mentors",
    SubmitMentorProfile: "profile/mentor",
    CancelBooking: "/bookings/{bookingId}/cancel",
    GetMyCandidateRatings: "mentor/my-candidate-ratings",
    UpdatePrice: "mentor/price",
  },

  // Question endpoints (không dùng leading slash để axios nối đúng baseURL .../api)
  Question: {
    GetListHotQuestions: "get-list-hot-questions",
    GetQuestionBankList: "get-public-system-question-banks",
    GetPublicContributedQuestionBankList: "get-public-contributed-question-banks",
    GetMyContributedQuestions: "/get-my-contributed-questions",
    GetSavedSystemQuestions: "/savedquestions-system",
    GetSavedContributedQuestions: "/savedquestions-contributed",
    GetListQuestionCategories: "get-list-question-categories",
    GetAllSystemQuestionsForStaff: "/get-all-system-question-banks-for-staff",
    GetAllContributedQuestionsForStaff: "/get-all-contributed-question-banks-for-staff",
    GetAllPendingContributedQuestionsForStaff: "/get-all-pending-contributed-questions-for-staff",
    CreateSystemQuestionForStaff: "/create-system-question-for-staff",
    UpdateSystemQuestionForStaff: "/update-system-question-for-staff/{questionId}",
    GetSystemQuestionDetail: "/get-system-question-by-id/{questionId}",
    GetContributedQuestionDetail: "/get-contributed-question-by-id/{questionId}",
    ChangeContributedQuestionStatusStaff: "/change-contributed-question-status-staff/{questionId}",
    ExportSystemQuestions: "/export-system-questions",
    ContributeQuestion: "/contribute-question",
    SaveQuestion: "/save-question",
    ValidateQuestionsFromExcel: "/validate-questions-from-excel",
    ImportValidatedQuestions: "/import-validated-questions",
    RevalidateSingleQuestion: "/revalidate-single-question",
    DownloadQuestionTemplate: "/download-question-template",
  },

  // Category endpoints
  Category: {
    GetAllCategories: "/get-categories",
    AddCategory: "/categories",
    UpdateCategory: "/categories/{categoryId}",
    GetAffectedQuestions: "/categories/{categoryId}/affected-questions",
  },

  // Position endpoints (không dùng leading slash để axios nối đúng với baseURL .../api)
  Position: {
    GetAllPositions: "/get-positions",
    AddPosition: "/positions",
    UpdatePosition: "/positions/{positionId}",
    GetAffectedQuestions: "/positions/{positionId}/affected-questions",
  },

  // Skills endpoints
  Skills: {
    GetAllSkills: "/get-skills",
    AddSkill: "/skills",
    UpdateSkill: "/skills/{skillId}",
    GetAffectedQuestions: "/skills/{skillId}/affected-questions",
  },

  // Companies endpoints
  Companies: {
    GetAllCompanies: "get-companies",
  },

  // Recruiter endpoints
  Recruiter: {
    SubmitRecruiterProfile: "/recruiters/submit-profile",
    GetJobApplicationList: "job-applications",
    GetRecruiterJobApplication: "recruiter-job-applications",
    UpdateRecruiterProfile: "/recruiter-profile",
    UploadLogo: "/recruiters/upload-logo",
    CreateJobPost: "/create-job-posts",
    UpdateJob: "/update-job",
    CloseJob: "/close-job",
    GetAppliedCandidate: (jobId: number) => `${jobId}/applied-candidates`,
    UpdateJobApplication: "/update-job-application",
  },

  Candidate: {
    GetAllOpenedJob: "get-all-jobs",
    GetJobDetail: (jobId: number) => `get-job-detail/${jobId}`,
    CreateJobApplication: "/apply-job",
    GetAppliedJob: "get-applied-jobs",
  },

  // Staff review endpoints (baseURL thường đã có /api)
  StaffReview: {
    GetPendingMentors: "/staff-review/mentors/pending",
    GetMentorById: "/staff-review/mentors",
    ReviewMentor: "/staff-review/mentors",
    GetPendingRecruiters: "/staff-review/recruiters/pending",
    ReviewRecruiter: "/staff-review/recruiters",
  },

  // Subscription endpoints
  Subscription: {
    GetSubscriptionPackages: "/subscription-packages",
    GetSubscriptionOverview: "/subscription-packages/overview",
    UpdateSubscriptionPackagePrice: "/subscription-packages",
  },

  // CV endpoints
  CV: {
    Upload: "/cv/upload",
    GetList: "/cv/list",
    Delete: "/cv/{cvId}",
  },

  // AI endpoints
  AI: {
    AnalyseCv: "/ai/analyse-cv",
    GeneratePracticeTest: "/ai/practice-test/generate",
  },

  // Practice Test History endpoints (UC-31, UC-32)
  PracticeTest: {
    Submit: "/practice-test/submit",
    GetHistory: "/practice-test/history",
    GetDetail: "/practice-test/history/{id}",
  },

  // Interview AI endpoints (UC-33, UC-34, UC-35)
  InterviewAI: {
    // UC-33: Xem kết quả
    GetHistory: "/ai-interview/history",
    GetResult: "/ai-interview/result/{sessionId}",
    // UC-34: Thiết lập phỏng vấn
    CheckCost: "/ai-interview/check-interview-cost",
    Setup: "/ai-interview/setup",
    CreateSession: "/ai-interview/create-session",
    // UC-35: Phỏng vấn trực tiếp
    WelcomeMessage: "/ai-interview/welcome-message/{sessionId}",
    GenerateQuestion: "/ai-interview/generate-question",
    SubmitAnswer: "/ai-interview/submit-answer",
    EndInterview: "/ai-interview/end-interview/{sessionId}",
    ResumeSession: "/ai-interview/resume-session/{sessionId}",
    // Hỗ trợ giọng nói & JD
    TranscribeWhisper: "/ai-interview/transcribe-whisper-base64",
    CorrectTranscript: "/ai-interview/correct-transcript",
    ParseHtml: "/ai-interview/scraping/parse-html",
  },
  // Training Journey endpoints
  TrainingJourney: {
    Base: "/training-journey",
    Create: "/training-journey",
    GetList: "/training-journey",
    GetProgress: "/training-journey/{journeyId}/progress",
    StartSession: "/training-journey/{journeyId}/start-session",
    EndSession: "/training-journey/end-session/{sessionId}",
  },
  // Comment endpoints
  Comment: {
    Create: "/create-comment",
    Update: "/update-comment/{commentId}",
    Delete: "/delete-comment/{commentId}",
    Vote: "/vote-comment/{commentId}",
  },
  // Speech TTS endpoints
  Speech: {
    Synthesize: "/speech/synthesize",
  },
} as const;

export default APIConfig;
