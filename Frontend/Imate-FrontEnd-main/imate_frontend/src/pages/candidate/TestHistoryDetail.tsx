import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  TrendingUp,
  Lightbulb,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  getTestHistoryDetail,
  type TestHistoryDetail as TestHistoryDetailType,
  type TestAnswerDetail,
} from "@/services/geminiService";
import { MSG07 } from "@/constants/messages";

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */
function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-red-400";
  const strokeColor =
    score >= 80
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-amber-400"
        : "stroke-red-400";

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-700/40"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="text-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <p className="text-xs text-slate-500">/100</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skill Bar                                                          */
/* ------------------------------------------------------------------ */
function SkillBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const color =
    v >= 80
      ? "from-emerald-500 to-emerald-400"
      : v >= 50
        ? "from-amber-500 to-amber-400"
        : "from-red-500 to-red-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{v}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Answer Card                                                        */
/* ------------------------------------------------------------------ */
function AnswerCard({
  answer,
  index,
}: {
  answer: TestAnswerDetail;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  let options: { label: string; text: string }[] = [];
  try {
    options = JSON.parse(answer.optionsJson);
  } catch {
    options = [];
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${answer.isCorrect
        ? "border-slate-700/60 bg-slate-800/40"
        : "border-red-500/30 bg-red-500/5"
        }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-xs font-bold text-purple-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="text-sm font-medium leading-relaxed text-white">
            {answer.questionText}
          </p>
        </div>
        {answer.isCorrect ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
        )}
      </div>

      {/* User Answer */}
      <div className="ml-10 mt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Câu trả lời của bạn
        </p>
        <p className="mt-1 text-sm text-slate-300">
          {answer.userAnswer
            ? options.find((o) => o.label === answer.userAnswer)?.text ??
            answer.userAnswer
            : "Chưa trả lời"}
        </p>
      </div>

      {/* Expand Detail */}
      <div className="ml-10 mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-purple-400 transition-colors hover:text-purple-300"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Xem giải thích chi tiết
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {/* All options */}
            <div className="space-y-2">
              {options.map((opt) => {
                const isCorrect = opt.label === answer.correctAnswer;
                const isUserAnswer = opt.label === answer.userAnswer;

                let optClass =
                  "border-slate-700/30 bg-slate-900/20 opacity-60";
                if (isCorrect) {
                  optClass = "border-emerald-500/50 bg-emerald-500/10";
                } else if (isUserAnswer && !isCorrect) {
                  optClass = "border-red-500/50 bg-red-500/10";
                }

                return (
                  <div
                    key={opt.label}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${optClass}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${isCorrect
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isUserAnswer
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-700/50 text-slate-400"
                        }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-sm text-slate-300">{opt.text}</span>
                    {isCorrect && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                    )}
                    {isUserAnswer && !isCorrect && (
                      <XCircle className="ml-auto h-4 w-4 text-red-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {answer.explanation && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Giải thích
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  {answer.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function TestHistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TestHistoryDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getTestHistoryDetail(parseInt(id));
        setDetail(data);
      } catch {
        toast.error(MSG07);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
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
        <p className="text-slate-400">Không tìm thấy bài test.</p>
        <Button
          variant="secondary"
          onClick={() => navigate("/test-history")}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {detail.testTitle}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Hoàn thành: {formatDate(detail.completedAt)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Thời gian: {detail.durationMinutes ?? detail.timeLimitMinutes} phút
            </span>
          </div>
        </div>
        <ScoreRing score={detail.score} />
      </div>

      {/* Score Breakdown + AI Feedback Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Skill Breakdown */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            Phân tích chi tiết năng lực
          </h2>
          <div className="space-y-4">
            <SkillBar label="Kiến thức kỹ thuật" value={detail.technicalScore} />
            <SkillBar label="Tư duy logic" value={detail.logicalScore} />
            <SkillBar label="Tối ưu hóa" value={detail.optimizationScore} />
          </div>
        </div>

        {/* AI Feedback */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Star className="h-4 w-4 text-purple-400" />
            Nhận xét tổng quát từ AI
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            {detail.aiFeedback || "Chưa có nhận xét tổng quát."}
          </p>

          {/* Strengths */}
          {detail.aiStrengths && (
            <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Điểm mạnh
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {detail.aiStrengths}
              </p>
            </div>
          )}

          {/* Improvements */}
          {detail.aiImprovements && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Lightbulb className="h-3.5 w-3.5" />
                Gợi ý cải thiện
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {detail.aiImprovements}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="mb-8">
        <h2 className="mb-5 text-lg font-bold text-white">
          Chi tiết câu hỏi & Đáp án
        </h2>
        <div className="space-y-4">
          {detail.answers.map((answer, idx) => (
            <AnswerCard key={idx} answer={answer} index={idx} />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
          <Button
            variant="primary"
            size="lg"
            icon={<RotateCcw className="h-5 w-5" />}
            onClick={() => navigate("/practice-test")}
          >
            Luyện tập lại bài này
          </Button>
        </div>
      </div>
    </div>
  );
}
