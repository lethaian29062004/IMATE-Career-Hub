import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { analyseCvById } from "@/services/cvService";
import { MSG07 } from "@/constants/messages";
import type { CvAnalysisResult } from "@/types/common/cvAnalysis";

/* ------------------------------------------------------------------ */
/*  Circular Score Component                                          */
/* ------------------------------------------------------------------ */
function CircularScore({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Gradient color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return { start: "#a855f7", end: "#6366f1" }; // purple → indigo
    if (s >= 60) return { start: "#f59e0b", end: "#f97316" }; // amber → orange
    return { start: "#ef4444", end: "#f97316" }; // red → orange
  };

  const colors = getScoreColor(score);
  const gradientId = "score-gradient";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">CV Score</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Market Fit Badge                                                  */
/* ------------------------------------------------------------------ */
function MarketFitBadge({ level }: { level: string }) {
  const styleMap: Record<string, string> = {
    "Cao": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Trung bình": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Thấp": "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${styleMap[level] || styleMap["Trung bình"]}`}>
      <TrendingUp className="h-3.5 w-3.5" />
      {level}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                   */
/* ------------------------------------------------------------------ */
function AnalyseSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-8 px-4 py-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-64 rounded bg-slate-700/50" />
        <div className="h-8 w-80 rounded bg-slate-700/50" />
      </div>
      {/* Score section skeleton */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8">
        <div className="flex items-center gap-8">
          <div className="h-[120px] w-[120px] rounded-full bg-slate-700/50" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-slate-700/50" />
            <div className="h-4 w-36 rounded bg-slate-700/50" />
            <div className="h-4 w-24 rounded bg-slate-700/50" />
          </div>
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-2xl border border-slate-700/50 bg-slate-800/40" />
        <div className="h-64 rounded-2xl border border-slate-700/50 bg-slate-800/40" />
      </div>
      <div className="h-48 rounded-2xl border border-slate-700/50 bg-slate-800/40" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */
export default function AnalyseCV() {
  const { cvId } = useParams<{ cvId: string }>();

  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [cvName, setCvName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const runAnalysis = async (force: boolean = false) => {
    if (!cvId) {
      setError("Không tìm thấy thông tin CV.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Gọi backend POST /api/ai/analyse-cv
      // Backend trả trực tiếp CvAnalysisResult: { score, candidateName, strengths, ... }
      const data = await analyseCvById(cvId, force);

      const analysisResult: CvAnalysisResult = {
        score: data.score ?? 70,
        candidateName: data.candidateName ?? "Ứng viên",
        jobTitle: data.jobTitle ?? "N/A",
        marketFit: data.marketFit ?? "Trung bình",
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        interviewQuestions: data.interviewQuestions ?? [],
      };

      setCvName(data.candidateName || "");
      setResult(analysisResult);
    } catch (err: any) {
      const msg = err?.message || MSG07;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      runAnalysis();
    }
  }, []);

  // Format today's date
  const analysisDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  /* ---- Loading State ---- */
  if (loading) {
    return (
      <div>
        <AnalyseSkeleton />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 px-10 py-8 shadow-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
            <p className="text-lg font-medium text-white">Đang phân tích CV...</p>
            <p className="text-sm text-slate-400">
              AI đang đánh giá CV của bạn, vui lòng chờ trong giây lát
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error State ---- */
  if (error || !result) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-8 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-lg font-medium text-red-300">Không thể phân tích CV</p>
          <p className="max-w-md text-sm text-slate-400">
            {error || MSG07}
          </p>
          <Button variant="primary" size="md" icon={<RefreshCw className="h-4 w-4" />} onClick={() => runAnalysis()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Success State ---- */
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/cv-management" className="transition-colors hover:text-slate-300">
          Quản Lý CV
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-400">Phân Tích CV</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-purple-400 font-medium">Báo cáo chi tiết</span>
      </nav>

      {/* Title */}
      <h1 className="mb-8 text-2xl font-bold text-white md:text-3xl">
        Báo cáo chi tiết AI CV {cvName && <span className="text-slate-400">— {cvName}</span>}
      </h1>

      {/* ===== Score + Info Section ===== */}
      <div className="mb-8 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 md:p-8 relative">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* Circular Score */}
          <CircularScore score={result.score} size={130} />

          {/* Candidate Info */}
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wider text-slate-500">
                Họ tên ứng viên
              </p>
              <p className="text-xl font-bold text-white">{result.candidateName}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Vị trí nhận diện
              </p>
              <p className="text-sm font-medium text-slate-300">{result.jobTitle}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Độ phù hợp thị trường
                </p>
                <MarketFitBadge level={result.marketFit} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Ngày phân tích
                </p>
                <p className="text-sm text-slate-300">{analysisDate}</p>
              </div>
            </div>
          </div>

        {/* Re-analyze button */}
        <button
          onClick={() => runAnalysis(true)}
          className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300"
          title="Phân tích lại CV với AI"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Phân tích lại
        </button>
        </div>
      </div>

      {/* ===== Strengths & Improvements ===== */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Điểm mạnh</h2>
          </div>
          <div className="space-y-4">
            {result.strengths.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-400">✦</span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Điểm cần cải thiện</h2>
          </div>
          <div className="space-y-4">
            {result.improvements.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✦</span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Interview Questions ===== */}
      <div className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Gợi ý câu hỏi phỏng vấn</h2>
            <p className="text-xs text-slate-400">
              Dựa trên kinh nghiệm của bạn, hãy chuẩn bị cho các câu hỏi sau:
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {result.interviewQuestions.map((q, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-4 transition-colors hover:border-slate-600/60 hover:bg-slate-900/80"
            >
              <span className="mb-2 inline-block rounded-md bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-400">
                {q.category}
              </span>
              <p className="text-sm leading-relaxed text-slate-300">
                "{q.question}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA Button (fixed bottom) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-end px-4 py-4">
          <Button
            variant="primary"
            size="lg"
            icon={<Sparkles className="h-5 w-5" />}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
          >
            Luyện tập với AI ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
