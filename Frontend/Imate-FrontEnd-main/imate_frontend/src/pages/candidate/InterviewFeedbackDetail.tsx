import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Star,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  getInterviewResult,
  type InterviewResultDetail,
  type InterviewResponseDetail,
  type StructuredFeedback,
} from "@/services/interviewService";
import { MSG24 } from "@/constants/messages";
import { USE_MOCK } from "@/mocks/interviewMockData";

/*  Helper: parse structuredFeedbackJson  */
function parseFeedback(json: string | null): StructuredFeedback | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as StructuredFeedback;
  } catch {
    return null;
  }
}

/*  Helper: parse overallFeedback into sections */
interface OverallFeedbackSections {
  overview: string;
  strengths: string[];
  improvements: string[];
}

function parseOverallFeedback(text: string | null): OverallFeedbackSections {
  if (!text) {
    return { overview: "", strengths: [], improvements: [] };
  }

  try {
    const parsed = JSON.parse(text);
    return {
      overview: parsed.overall_comment || parsed.overview || text,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch {
    const sections: OverallFeedbackSections = {
      overview: "",
      strengths: [],
      improvements: [],
    };

    const lines = text.split("\n");
    let currentSection: "overview" | "strengths" | "improvements" = "overview";

    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (
        lower.includes("ưu điểm") ||
        lower.includes("điểm mạnh") ||
        lower.includes("strength")
      ) {
        currentSection = "strengths";
        continue;
      }
      if (
        lower.includes("cần cải thiện") ||
        lower.includes("cải thiện") ||
        lower.includes("improvement") ||
        lower.includes("nhược điểm")
      ) {
        currentSection = "improvements";
        continue;
      }

      const trimmed = line.replace(/^[-•*]\s*/, "").trim();
      if (!trimmed) continue;

      if (currentSection === "overview") {
        sections.overview += (sections.overview ? " " : "") + trimmed;
      } else if (currentSection === "strengths") {
        sections.strengths.push(trimmed);
      } else {
        sections.improvements.push(trimmed);
      }
    }

    if (!sections.strengths.length && !sections.improvements.length) {
      sections.overview = text;
    }

    return sections;
  }
}

/*  Score Bar (scaled /5)  */
function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const scaled = Math.round(v * 5 * 10) / 10;
  const displayValue = Math.round(scaled);
  const percent = (scaled / 5) * 100;

  const color =
    scaled >= 4
      ? "from-emerald-500 to-emerald-400"
      : scaled >= 2.5
        ? "from-amber-500 to-amber-400"
        : "from-red-500 to-red-400";

  const textColor =
    scaled >= 4
      ? "text-emerald-400"
      : scaled >= 2.5
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${textColor}`}>{displayValue}/5</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}


/*  Question Detail Card */
function QuestionCard({ response }: { response: InterviewResponseDetail }) {
  const [expanded, setExpanded] = useState(false);
  const feedback = parseFeedback(response.structuredFeedbackJson);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
      {/* Question Header */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-sm font-bold text-purple-400">
          {String(response.questionNumber).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <p className="text-base font-medium leading-relaxed text-white">
            {response.questionContent}
          </p>
          {feedback?.overall_comment && (
            <p className="mt-2 text-sm text-slate-400">
              {feedback.overall_comment}
            </p>
          )}
        </div>
      </div>

      {/* Candidate Response */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nội dung trả lời của bạn
        </p>
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3">
          <p className="text-sm italic leading-relaxed text-slate-300">
            "{response.userAnswer || "Chưa trả lời"}"
          </p>
        </div>
      </div>

      {/* Score Metrics or Loading */}
      {!response.structuredFeedbackJson ? (
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 rounded bg-slate-700" />
            <div className="h-2 w-full rounded bg-slate-700" />
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 rounded bg-slate-700" />
            <div className="h-2 w-full rounded bg-slate-700" />
          </div>
          <div className="col-span-2 mt-2 flex items-center gap-2 text-xs text-purple-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang phân tích phản hồi...
          </div>
        </div>
      ) : (
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <ScoreBar label="Cách diễn đạt" value={response.communicationScore} />
          <ScoreBar label="Kiến thức" value={response.technicalDepthScore} />
        </div>
      )}

      {/* Expand/Collapse */}
      <div className="border-t border-slate-700/40 pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-purple-400 transition-all hover:bg-slate-800 hover:text-purple-300"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Xem giải thích chi tiết & Đáp án mẫu
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ScoreBar
                label="Giải quyết vấn đề"
                value={response.problemSolvingScore}
              />
              <ScoreBar
                label="Kinh nghiệm thực tế"
                value={response.practicalExperienceScore}
              />
            </div>

            {(response.starSituationScore !== null ||
              response.starTaskScore !== null ||
              response.starActionScore !== null ||
              response.starResultScore !== null) && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Điểm STAR
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ScoreBar
                      label="Situation"
                      value={response.starSituationScore}
                    />
                    <ScoreBar label="Task" value={response.starTaskScore} />
                    <ScoreBar label="Action" value={response.starActionScore} />
                    <ScoreBar label="Result" value={response.starResultScore} />
                  </div>
                </div>
              )}

            {response.aiFeedback && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Nhận xét từ AI
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {response.aiFeedback}
                </p>
              </div>
            )}

            {feedback?.strengths && feedback.strengths.length > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Điểm mạnh
                </p>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback?.improvements && feedback.improvements.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Gợi ý cải thiện
                </p>
                <ul className="space-y-1">
                  {feedback.improvements.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(response.expectedAnswerOutline || feedback?.suggested_answer) && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
                  <Star className="h-3.5 w-3.5" />
                  Đáp án mẫu
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {feedback?.suggested_answer || response.expectedAnswerOutline}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/*  Main Page */
export default function InterviewFeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<InterviewResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get("from");

  useEffect(() => {
    let pollInterval: any;

    const fetchDetail = async (isSilent = false) => {
      if (!id) return;
      try {
        if (!isSilent) setLoading(true);
        const data = await getInterviewResult(parseInt(id));
        setDetail(data as unknown as InterviewResultDetail);

        if ((data as any).session.status === "Completed") {
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        if (!isSilent) toast.error(MSG24);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    fetchDetail();

    if (!(USE_MOCK && id === "999")) {
      pollInterval = setInterval(() => {
        fetchDetail(true);
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Không tìm thấy phiên phỏng vấn.</p>
        <Button variant="secondary" onClick={() => navigate("/test-history")}>
          Quay lại
        </Button>
      </div>
    );
  }

  const { session, responses } = detail;

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDuration = () => {
    if (!session.startTime || !session.endTime) return null;
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const diffMs = end - start;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const overallSections = parseOverallFeedback(session.overallFeedback);
  const duration = getDuration();
  const totalQuestions = responses.length;
  const currentResponse = responses[currentQuestionIndex];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28">
      {/* Back button */}
      {fromSource && (
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-3 text-base text-slate-300 transition-colors hover:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </span>
          Quay lại lộ trình
        </button>
      )}
      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Phiên phỏng vấn {session.id}
          </h1>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateTime(session.startTime)}
          </span>
          {duration && (
            <>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Thời gian: {duration}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {/* Tổng quan */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Tổng quan
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            {overallSections.overview ||
              (session.status !== "Completed" ? (
                <span className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang tổng hợp nhận xét...
                </span>
              ) : (
                "Chưa có nhận xét tổng quan."
              ))}
          </p>
        </div>

        {/* Ưu điểm */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Ưu điểm
            </h3>
          </div>
          {overallSections.strengths.length > 0 ? (
            <ul className="space-y-1.5">
              {overallSections.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Chưa có thông tin ưu điểm.</p>
          )}
        </div>

        {/* Cần cải thiện */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Cần cải thiện
            </h3>
          </div>
          {overallSections.improvements.length > 0 ? (
            <ul className="space-y-1.5">
              {overallSections.improvements.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              Chưa có thông tin cần cải thiện.
            </p>
          )}
        </div>
      </div>

      {/* Detail Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">
          Đánh giá chi tiết từng câu hỏi
        </h2>
      </div>

      {/* Question Card */}
      {totalQuestions > 0 && currentResponse ? (
        <div className="mb-8">
          <QuestionCard response={currentResponse} />
        </div>
      ) : (
        <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/40 py-12">
          <p className="text-slate-400">Chưa có dữ liệu đánh giá chi tiết.</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Button
            variant="secondary"
            size="lg"
            icon={<ChevronLeft className="h-5 w-5" />}
            disabled={currentQuestionIndex === 0}
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
          >
            Câu trước
          </Button>

          <span className="text-sm text-slate-400">
            {totalQuestions > 0
              ? `Câu ${currentQuestionIndex + 1} / ${totalQuestions}`
              : "Không có câu hỏi"}
          </span>

          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(totalQuestions - 1, prev + 1)
              )
            }
            disabled={
              currentQuestionIndex >= totalQuestions - 1 || totalQuestions === 0
            }
          >
            Câu tiếp theo
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </div>

    </div>
  );
}