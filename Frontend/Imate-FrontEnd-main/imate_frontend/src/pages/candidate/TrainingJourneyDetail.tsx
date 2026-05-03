import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2, ArrowLeft, Edit2, CheckCircle2, Activity,
  FileText, Briefcase, AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { getListCV } from "@/services/cvService";
import {
  getJourneyProgress,
  renameJourney,
  startJourneySession,
  type JourneyProgressResult,
} from "@/services/trainingJourneyService";

// ── Dialog: Xem CV ──────────────────────────────────────────────────────────
function CvPreviewDialog({ open, onOpenChange, cvUrl, cvName, loading }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  cvUrl: string | null; cvName: string | null; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border border-white/10 bg-[#11142D] text-white shadow-2xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            CV đã dùng
          </DialogTitle>
          {cvName && <p className="mt-1 text-sm text-slate-400">{cvName}</p>}
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-sm text-slate-500">Đang tải CV...</p>
          </div>
        ) : cvUrl ? (
          <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F1333]">
            <div className="flex items-center border-b border-white/10 bg-white/5 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Xem trước CV</span>
            </div>
            <div className="h-[450px] w-full">
              <iframe src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="h-full w-full border-none" title="CV Preview" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm font-medium text-slate-400">CV không khả dụng</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: Xem JD ──────────────────────────────────────────────────────────
function JdPreviewDialog({ open, onOpenChange, jdText }: {
  open: boolean; onOpenChange: (v: boolean) => void; jdText: string | undefined;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border border-white/10 bg-[#11142D] text-white shadow-2xl rounded-3xl p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <Briefcase className="h-5 w-5 text-indigo-400" />
            </div>
            JD yêu cầu
          </DialogTitle>
        </DialogHeader>
        {jdText ? (
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0F1333] p-6 custom-scrollbar">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{jdText}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Briefcase className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">Không có mô tả công việc.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function JourneyStatusBadge({ status }: { status: string }) {
  const isCompleted = status === "Completed";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
      isCompleted
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
        : "border-amber-500/40 bg-amber-500/15 text-amber-400"
    }`}>
      {isCompleted ? "Hoàn thành" : "Cần luyện tập thêm"}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TrainingJourneyDetail() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const [selectedJourney, setSelectedJourney] = useState<JourneyProgressResult | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);

  // Rename
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [renaming, setRenaming] = useState(false);

  // CV / JD dialogs
  const [showCvDialog, setShowCvDialog] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [showJdDialog, setShowJdDialog] = useState(false);

  useEffect(() => {
    if (!journeyId) return;
    (async () => {
      try {
        setJourneyLoading(true);
        const data = await getJourneyProgress(Number(journeyId));
        setSelectedJourney(data);
      } catch {
        toast.error("Không thể lấy chi tiết lộ trình");
        navigate("/test-history?tab=interview");
      } finally {
        setJourneyLoading(false);
      }
    })();
  }, [journeyId, navigate]);

  const handleOpenCvDialog = async () => {
    setShowCvDialog(true);
    setCvUrl(null);
    setCvName(null);
    if (!selectedJourney?.userCvId) return;
    try {
      setCvLoading(true);
      const cvList = await getListCV();
      const matched = cvList.find(cv => String(cv.cvId) === String(selectedJourney.userCvId));
      if (matched) { setCvUrl(matched.fileUrl ?? null); setCvName(matched.fileName ?? null); }
    } catch {
      toast.error("Không thể tải thông tin CV.");
    } finally {
      setCvLoading(false);
    }
  };

  const handleSaveRename = async () => {
    if (!selectedJourney || !editName.trim()) {
      toast.warn("Tên lộ trình không được để trống");
      return;
    }
    try {
      setRenaming(true);
      await renameJourney(selectedJourney.journeyId, editName.trim());
      setSelectedJourney({ ...selectedJourney, name: editName.trim() });
      setRenameDialogOpen(false);
      toast.success("Đã đổi tên lộ trình");
    } catch {
      toast.error("Không thể đổi tên lộ trình");
    } finally {
      setRenaming(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (journeyLoading) {
    return (
      <div className="font-sans min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!selectedJourney) return null;

  const totalSkillGaps = selectedJourney.resolvedGaps.length + selectedJourney.unresolvedGaps.length;

  return (
    <div className="font-sans min-h-screen bg-[#020617] text-white pt-10 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/test-history?tab=interview")}
          className="mb-6 flex items-center gap-3 text-base text-slate-300 transition-colors hover:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </span>
          Quay lại lịch sử
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Info card */}
            <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Thông tin lộ trình</h3>
                <Button variant="secondary" size="sm" onClick={() => { setEditName(selectedJourney.name || ""); setRenameDialogOpen(true); }}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tên lộ trình</label>
                  <p className="text-white font-medium text-xl">{selectedJourney.name || "Lộ trình không tên"}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trạng thái</label>
                  <div className="mt-1"><JourneyStatusBadge status={selectedJourney.status} /></div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tổng số phiên</label>
                  <p className="text-white font-medium">{selectedJourney.totalSessions} buổi</p>
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex justify-between">
                    <span>Tiến độ kỹ năng</span>
                    <span className="text-purple-400">{selectedJourney.resolvedGaps.length} / {totalSkillGaps}</span>
                  </label>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${totalSkillGaps > 0 ? (selectedJourney.resolvedGaps.length / totalSkillGaps) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* CV / JD buttons */}
                <div className="pt-2 pb-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Tài liệu tham chiếu</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full h-10 border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs justify-start px-3" onClick={handleOpenCvDialog}>
                      <FileText className="mr-2 h-4 w-4 text-purple-400" /> Xem CV
                    </Button>
                    <Button variant="outline" className="w-full h-10 border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs justify-start px-3" onClick={() => setShowJdDialog(true)} disabled={!selectedJourney.jobDescriptionText}>
                      <Briefcase className="mr-2 h-4 w-4 text-indigo-400" /> Xem JD
                    </Button>
                  </div>
                </div>

                {/* Start session button */}
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={journeyLoading}
                  onClick={async () => {
                    try {
                      setJourneyLoading(true);
                      const result = await startJourneySession(selectedJourney.journeyId);
                      if (result.sessionId) {
                        navigate(`/interview-chat/${result.sessionId}`);
                      } else if (result.allResolved) {
                        toast.success("Chúc mừng! Bạn đã hoàn thành tất cả kỹ năng trong lộ trình này.");
                      }
                    } catch {
                      toast.error("Không thể bắt đầu phiên phỏng vấn mới");
                    } finally {
                      setJourneyLoading(false);
                    }
                  }}
                >
                  {journeyLoading
                    ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang chuẩn bị...</>
                    : <><Activity className="mr-2 h-5 w-5" /> Luyện tập tiếp</>
                  }
                </Button>
              </div>
            </div>

            {/* ── Skill gaps card ─────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 p-6 flex flex-col max-h-[700px] overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-5 shrink-0">Kỹ năng mục tiêu</h3>

              <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">

                {/* Profile gaps — chỉ hiển thị, không luyện tập */}
                {selectedJourney.profileGaps && selectedJourney.profileGaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Lưu ý về hồ sơ ({selectedJourney.profileGaps.length})
                    </h4>
                    <p className="text-xs text-slate-500 mb-2 italic px-1">
                      Những điểm này liên quan đến kinh nghiệm hoặc bằng cấp — không thể luyện tập qua phỏng vấn, chỉ mang tính tham khảo.
                    </p>
                    <div className="space-y-2">
                      {selectedJourney.profileGaps.map((gap, idx) => (
                        <div key={`profile-${idx}`} className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                          <span className="text-sm text-slate-400">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cần cải thiện */}
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    Cần luyện tập ({selectedJourney.unresolvedGaps.length})
                  </h4>
                  {selectedJourney.unresolvedGaps.length === 0 ? (
                    <p className="text-sm text-slate-500 italic px-4">Không có kỹ năng</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedJourney.unresolvedGaps.map((gap, idx) => (
                        <div key={`unresolved-${idx}`} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">{gap.gapName}</span>
                          </div>
                          {/* Progress bar with 2 segments */}
                          <div className="flex gap-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-amber-500 transition-all duration-300"
                                style={{ width: gap.consecutiveGoodScore >= 1 ? "100%" : (gap.consecutiveGoodScore * 100) + "%" }}
                              />
                            </div>
                            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: gap.consecutiveGoodScore >= 2 ? "100%" : (Math.max(0, gap.consecutiveGoodScore - 1) * 100) + "%" }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {gap.timesAsked > 0 ? `Đã hỏi ${gap.timesAsked} lần • ` : ""}
                            {gap.consecutiveGoodScore === 0 && "Cần 2 lần liên tiếp điểm tốt để hoàn thành"}
                            {gap.consecutiveGoodScore === 1 && "1 lần thành công • Cần 1 lần nữa để hoàn thành"}
                            {gap.consecutiveGoodScore >= 2 && "Sẵn sàng chuyển sang hoàn thành"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Đã hoàn thành */}
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã thành thạo ({selectedJourney.resolvedGaps.length})
                  </h4>
                  {selectedJourney.resolvedGaps.length === 0 ? (
                    <p className="text-sm text-slate-500 italic px-4">Chưa có kỹ năng nào</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedJourney.resolvedGaps.map((gap, idx) => (
                        <div key={`resolved-${idx}`} className="flex items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 opacity-70">
                          <span className="text-sm text-slate-300">{gap.gapName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Right Column: session history ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 p-6">
              <h3 className="text-lg font-bold text-white mb-6">Lịch sử phỏng vấn trong lộ trình</h3>
              {selectedJourney.sessionHistory.length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic text-sm">Chưa có dữ liệu phiên phỏng vấn.</div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0F1333]/30">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-xs font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Phiên</th>
                        <th className="px-4 py-3">Ngày</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedJourney.sessionHistory.map((s) => (
                        <tr key={s.sessionId} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-medium text-white">Buổi {s.sessionNumber}</td>
                          <td className="px-4 py-4 text-slate-400">{formatDate(s.startTime)}</td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              onClick={() => navigate(`/interview-history/${s.sessionId}?from=journey`)}
                            >
                              Xem lại
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-lg border border-white/10 bg-[#11142D] text-white shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle>Đổi tên lộ trình</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-sm font-medium text-slate-400">Tên lộ trình</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập tên lộ trình..."
              className="bg-slate-900 border-white/5 focus:border-purple-500/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)} disabled={renaming}>Hủy</Button>
            <Button onClick={handleSaveRename} disabled={renaming} variant="primary">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CvPreviewDialog open={showCvDialog} onOpenChange={setShowCvDialog} cvUrl={cvUrl} cvName={cvName} loading={cvLoading} />
      <JdPreviewDialog open={showJdDialog} onOpenChange={setShowJdDialog} jdText={selectedJourney.jobDescriptionText} />
    </div>
  );
}