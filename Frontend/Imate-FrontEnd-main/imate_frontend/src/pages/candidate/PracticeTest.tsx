import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Clock,
  FileText,
  Code2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  generatePracticeTest,
  submitPracticeTest,
  type PracticeTestResult,
  type PracticeTestQuestion,
  type GeneratePracticeTestParams,
} from "@/services/geminiService";
import { MSG25 } from "@/constants/messages";
import { getAllSkills } from "@/services/commonService";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FIELDS = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Engineer",
  "QA/Tester",
  "Business Analyst",
  "Project Manager",
  "UI/UX Designer",
];

const LEVELS = ["Intern", "Fresher", "Junior", "Middle", "Senior"];

/* ------------------------------------------------------------------ */
/*  Config Screen                                                      */
/* ------------------------------------------------------------------ */
function ConfigScreen({
  onStart,
}: {
  onStart: (params: GeneratePracticeTestParams) => void;
}) {
  const [testType] = useState("Technical");
  const [field, setField] = useState("Frontend Developer");
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [level, setLevel] = useState("Junior");

  const [loading, setLoading] = useState(false);

  // Fetch skills từ DB
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const result = await getAllSkills({ pageSize: 100, isActive: true });
        setSkills(result.data);
        if (result.data.length > 0 && !skill) {
          setSkill(result.data[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };
    fetchSkills();
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart({ testType, field, skill, level, useCV: false, numberOfQuestions: 10 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <span className="transition-colors hover:text-slate-300 cursor-pointer">Trang chủ</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-400">Luyện tập AI</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-purple-400">Cấu hình bài test</span>
      </nav>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Luyện tập bài test trắc nghiệm
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tạo bài đánh giá năng lực cá nhân hóa dựa trên CV và mục tiêu nghề nghiệp của bạn
        </p>
      </div>

      {/* Config Card */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 md:p-8">


        {/* Field */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <FileText className="h-4 w-4 text-purple-400" />
            Lĩnh vực chuyên môn
          </label>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
          >
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Skill */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Code2 className="h-4 w-4 text-purple-400" />
            Kỹ năng
          </label>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
          >
            {skills.length === 0 && (
              <option value="">Đang tải...</option>
            )}
            {skills.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Cấp bậc ứng tuyển
          </label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  level === l
                    ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                    : "border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>



        {/* Practice Limit Info */}
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2.5 text-sm">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-amber-300">
            Lượt luyện tập miễn phí: <strong>4/6</strong> lượt (tuần này)
          </span>
        </div>

        {/* Start Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
          icon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? "Đang tạo bài test..." : "Bắt đầu làm bài"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Test Taking Screen                                                 */
/* ------------------------------------------------------------------ */
function TestScreen({
  testData,
  onReset,
}: {
  testData: PracticeTestResult;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, label: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < testData.questions.length) {
      toast.warning("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài.");
      return;
    }
    setSubmitted(true);
    toast.success("Nộp bài thành công!");

    // Lưu kết quả vào DB (không block UI nếu lỗi)
    try {
      await submitPracticeTest({
        testTitle: testData.testTitle,
        testType: testData.testType,
        field: testData.field,
        skill: testData.skill ?? "",
        level: testData.level,
        totalQuestions: testData.totalQuestions,
        timeLimitMinutes: testData.timeLimitMinutes,
        answers: testData.questions.map((q) => ({
          questionNumber: q.id,
          questionText: q.questionText,
          optionsJson: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          userAnswer: answers[q.id] ?? null,
          explanation: q.explanation,
        })),
      });
    } catch {
      toast.warning(MSG25);
    }
  };

  // Calculate score
  const correctCount = testData.questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
  const score = Math.round((correctCount / testData.questions.length) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white md:text-2xl">
            {testData.testTitle}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-400">
              {testData.field}
            </span>
            {testData.skill && (
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                {testData.skill}
              </span>
            )}
            <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
              {testData.level}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {testData.timeLimitMinutes} phút
            </span>
          </div>
        </div>
        {!submitted && (
          <div className="text-sm text-slate-400">
            Đã trả lời:{" "}
            <span className="font-semibold text-white">
              {Object.keys(answers).length}/{testData.totalQuestions}
            </span>
          </div>
        )}
      </div>

      {/* Score Card (after submit) */}
      {submitted && (
        <div className="mb-8 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 text-center">
          <div className="mb-2 text-5xl font-bold text-white">{score}%</div>
          <p className="text-sm text-slate-400">
            Đúng {correctCount}/{testData.totalQuestions} câu
          </p>
          <div className="mt-3 flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                score >= 80
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                  : score >= 50
                  ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                  : "border-red-500/30 bg-red-500/15 text-red-400"
              }`}
            >
              {score >= 80 ? "Xuất sắc" : score >= 50 ? "Khá" : "Cần cải thiện"}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!submitted && (
        <div className="mb-6">
          <div className="h-1.5 rounded-full bg-slate-700/50">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).length / testData.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {testData.questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            selected={answers[q.id]}
            submitted={submitted}
            onSelect={(label) => handleSelect(q.id, label)}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          {submitted ? (
            <>
              <p className="text-sm text-slate-400">
                Kết quả: <strong className="text-white">{score}%</strong> ({correctCount}/{testData.totalQuestions})
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<History className="h-5 w-5" />}
                  onClick={() => navigate("/test-history")}
                >
                  Xem lịch sử
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<RotateCcw className="h-5 w-5" />}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 font-semibold shadow-lg"
                  onClick={onReset}
                >
                  Làm bài mới
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                {Object.keys(answers).length}/{testData.totalQuestions} câu đã trả lời
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<CheckCircle2 className="h-5 w-5" />}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 font-semibold shadow-lg"
                onClick={handleSubmit}
              >
                Nộp bài
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question Card                                                      */
/* ------------------------------------------------------------------ */
function QuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: {
  question: PracticeTestQuestion;
  index: number;
  selected?: string;
  submitted: boolean;
  onSelect: (label: string) => void;
}) {
  const isCorrect = selected === question.correctAnswer;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        submitted
          ? isCorrect
            ? "border-emerald-500/40 bg-emerald-500/5"
            : selected
            ? "border-red-500/40 bg-red-500/5"
            : "border-slate-700/60 bg-slate-800/40"
          : "border-slate-700/60 bg-slate-800/40"
      }`}
    >
      {/* Question */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-xs font-bold text-purple-400">
          {index + 1}
        </span>
        <p className="text-sm font-medium leading-relaxed text-white">
          {question.questionText}
        </p>
      </div>

      {/* Options */}
      <div className="ml-10 space-y-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrectOption = opt.label === question.correctAnswer;

          let optClass = "border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60 cursor-pointer";
          if (submitted) {
            if (isCorrectOption) {
              optClass = "border-emerald-500/50 bg-emerald-500/10";
            } else if (isSelected && !isCorrectOption) {
              optClass = "border-red-500/50 bg-red-500/10";
            } else {
              optClass = "border-slate-700/30 bg-slate-900/20 opacity-50";
            }
          } else if (isSelected) {
            optClass = "border-purple-500/50 bg-purple-500/10";
          }

          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt.label)}
              disabled={submitted}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${optClass}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  submitted && isCorrectOption
                    ? "bg-emerald-500/20 text-emerald-400"
                    : submitted && isSelected && !isCorrectOption
                    ? "bg-red-500/20 text-red-400"
                    : isSelected
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                {opt.label}
              </span>
              <span className="text-sm text-slate-300">{opt.text}</span>
              {submitted && isCorrectOption && (
                <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-400" />
              )}
              {submitted && isSelected && !isCorrectOption && (
                <XCircle className="ml-auto h-5 w-5 text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (after submit) */}
      {submitted && (
        <div className="ml-10 mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Giải thích
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Overlay                                                    */
/* ------------------------------------------------------------------ */
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 px-10 py-8 shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        <p className="text-lg font-medium text-white">Đang tạo bài test...</p>
        <p className="text-sm text-slate-400">
          AI đang tạo câu hỏi phù hợp với bạn, vui lòng chờ khoảng 30-60 giây
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function PracticeTest() {
  const [testData, setTestData] = useState<PracticeTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async (params: GeneratePracticeTestParams) => {
    setLoading(true);
    try {
      const result = await generatePracticeTest(params);
      setTestData(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tạo bài test. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTestData(null);
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      {testData ? (
        <TestScreen testData={testData} onReset={handleReset} />
      ) : (
        <ConfigScreen onStart={handleStart} />
      )}
    </>
  );
}
