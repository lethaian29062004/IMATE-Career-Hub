import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getListCV } from "@/services/cvService";
import {
  checkInterviewCost,
  setupInterview,
  createInterviewSession,
  type SetupInterviewResponse,
  type InterviewCostInfo,
} from "@/services/interviewService";
import type { CvItem } from "@/types/common/cv";
import { MSG26, MSG27, MSG29, MSG30 } from "@/constants/messages";
import {
  USE_MOCK,
  MOCK_CV_LIST,
  MOCK_SETUP_RESPONSE,
  MOCK_SESSION,
} from "@/mocks/interviewMockData";

/* ------------------------------------------------------------------ */
/*  Tab types                                                          */
/* ------------------------------------------------------------------ */
type JdTab = "text";

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read prefilled JD from navigation state (e.g. coming from ViewJobApplicationDetail)
  const prefillJd = (location.state as { prefillJd?: string } | null)?.prefillJd ?? "";

  // CV state
  const [cvList, setCvList] = useState<CvItem[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [cvLoading, setCvLoading] = useState(true);

  // JD state — default tab to "text" and prefill if JD was passed in
  const [jdText, setJdText] = useState(prefillJd);

  // Duration
  // const [duration, setDuration] = useState("30");

  // Flow state
  const [submitting, setSubmitting] = useState(false);
  const [setupResult, setSetupResult] = useState<SetupInterviewResponse | null>(null);
  const [step, setStep] = useState<"config" | "review">("config");
  const [costInfo, setCostInfo] = useState<InterviewCostInfo | null>(null);



  // Fetch CV list on mount
  useEffect(() => {
    const fetchCvs = async () => {
      try {
        setCvLoading(true);
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 500));
          setCvList(MOCK_CV_LIST);
          setSelectedCvId(MOCK_CV_LIST[0].cvId);
          return;
        }
        const cvs = await getListCV();
        const validCvs = cvs.filter((c) => c.status === "Valid");
        setCvList(validCvs);
        if (validCvs.length > 0) {
          setSelectedCvId(validCvs[0].cvId);
        }
      } catch {
        // Lỗi load CV không chặn UI
      } finally {
        setCvLoading(false);
      }
    };
    fetchCvs();

    // Fetch cost/usage info
    const fetchCost = async () => {
      try {
        const info = await checkInterviewCost();
        setCostInfo(info);
      } catch {
        // Skip log
      }
    };
    fetchCost();
  }, []);



  // Handle confirm config
  const handleConfirm = async () => {
    if (!selectedCvId) {
      toast.error(MSG29);
      return;
    }

    const hasJdInput = jdText.trim().length > 10;

    if (!hasJdInput) {
      toast.error(MSG30);
      return;
    }

    try {
      setSubmitting(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1000));
        setSetupResult(MOCK_SETUP_RESPONSE);
        setStep("review");
        return;
      }

      const cost = await checkInterviewCost();
      if (cost.requiresPayment && !cost.hasEnoughBalance) {
        toast.error(MSG26);
        return;
      }

      const request = {
        method: "jd" as const,
        cvId: parseInt(selectedCvId),
        jobDescriptionSourceType: "text" as const,
        jobDescriptionText: jdText,
      };

      const result = await setupInterview(request);
      setSetupResult(result);
      setStep("review");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        MSG30;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle start interview (after review)
  const handleStartInterview = async () => {
    if (!setupResult) return;

    try {
      setSubmitting(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        navigate(`/interview-chat/${MOCK_SESSION.sessionId}`);
        return;
      }

      const sessionReq = {
        positionName: setupResult.position,
        skillName: setupResult.skill,
        skillNames: setupResult.skills,
        levelName: setupResult.level,
        companyName: setupResult.company ?? undefined,
        cvId: parseInt(selectedCvId),
        jobDescriptionText: jdText,
      };

      const session = await createInterviewSession(sessionReq);
      navigate(`/interview-chat/${session.sessionId}`);
    } catch {
      toast.error(MSG27);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Step 1: Config Form                                              */
  /* ---------------------------------------------------------------- */
  if (step === "config") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/practice-with-ai")}
          className="mb-6 flex items-center gap-3 text-base text-slate-300 transition-colors hover:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </span>
          Quay lại danh sách
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8">
          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Thiết lập Buổi Phỏng vấn AI
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            Cấu hình thông tin để AI tạo ra kịch bản phỏng vấn tối ưu nhất cho bạn
          </p>

          {/* Prefill notice */}
          {prefillJd && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/5 px-4 py-3 text-sm text-purple-300">
              <FileText className="h-4 w-4 shrink-0 text-purple-400" />
              Mô tả công việc đã được điền tự động từ tin tuyển dụng.
            </div>
          )}

          {/* CV Selector */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chọn CV sử dụng
            </label>
            {cvLoading ? (
              <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh sách CV...
              </div>
            ) : cvList.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {MSG29}
              </div>
            ) : (
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-purple-500/50"
              >
                {cvList.map((cv) => (
                  <option key={cv.cvId} value={cv.cvId}>
                    {cv.fileName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* JD Input */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thông tin mô tả công việc (JD)
            </label>

            {/* JD Content */}
            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Dán nội dung mô tả công việc (JD) tại đây. Càng chi tiết, AI sẽ phỏng vấn bạn càng sát thực tế..."
                rows={6}
                maxLength={5000}
                className="w-full resize-none rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50"
              />
              <span className="absolute bottom-3 right-3 text-xs text-slate-600">
                {jdText.length} / 5000 ký tự
              </span>
            </div>


          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thời gian ước tính
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-400">30 - 45 Phút</span>
              </div>
              <p className="text-xs text-slate-500">
              </p>
            </div>

            {/* Usage limits */}
            {costInfo && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm text-slate-300">
                <AlertCircle className="h-4 w-4 text-purple-400" />
                <span>
                  Số lượt phỏng vấn đã dùng tháng này:{" "}
                  <span className="font-bold text-white">
                    {costInfo.usedMock ?? 0}
                  </span>
                  /
                  <span className="font-bold text-white">
                    {costInfo.limit ?? 0}
                  </span>{" "}
                  lượt.
                </span>
                {costInfo.limit !== undefined &&
                  costInfo.usedMock !== undefined &&
                  costInfo.limit - costInfo.usedMock <= 1 && (
                    <span className="ml-auto text-xs font-semibold text-amber-400">
                      Sắp hết lượt!
                    </span>
                  )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={submitting || cvList.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Xác nhận cấu hình
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step 2: Review classified data → Start interview                 */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8">
        <h2 className="mb-2 text-center text-xl font-bold text-white">
          Xác nhận thông tin phỏng vấn
        </h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          AI đã phân loại JD của bạn. Vui lòng kiểm tra thông tin trước khi bắt đầu.
        </p>

        {setupResult && (
          <div className="mb-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Vị trí" value={setupResult.position} />
              <InfoCard label="Cấp độ" value={setupResult.level} />
              <InfoCard
                label="Kỹ năng"
                value={setupResult.skills.join(", ")}
              />
              {setupResult.company && (
                <InfoCard label="Công ty" value={setupResult.company} />
              )}
            </div>

            {setupResult.requirements &&
              setupResult.requirements.length > 0 && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Yêu cầu công việc
                  </p>
                  <ul className="space-y-1">
                    {setupResult.requirements.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {setupResult.levelMismatchWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {setupResult.levelMismatchWarning}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep("config")}
            disabled={submitting}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={handleStartInterview}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo phiên...
              </>
            ) : (
              <>
                Bắt đầu Phỏng vấn
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small info card                                                    */
/* ------------------------------------------------------------------ */
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}