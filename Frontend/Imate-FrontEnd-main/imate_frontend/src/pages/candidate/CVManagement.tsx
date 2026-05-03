import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, Calendar, Trash2, XCircle, Loader2, Sparkles, Eye } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getListCV, deleteCV } from "@/services/cvService";
import { MSG07, MSG15 } from "@/constants/messages";
import type { CvItem } from "@/types/common/cv";
import UploadCVModal from "./UploadCVModal";

export default function CVManagement() {
  const navigate = useNavigate();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: cvList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CvItem[]>({
    queryKey: ["cv-list"],
    queryFn: getListCV,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteCV(deleteTarget.cvId);
      toast.success(MSG15);
      refetch();
    } catch {
      toast.error(MSG07);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: CvItem["status"]) => {
    const styles: Record<CvItem["status"], string> = {
      Valid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Invalid: "bg-red-500/10 text-red-400 border-red-500/20",
      Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    const labels: Record<CvItem["status"], string> = {
      Valid: "Hợp lệ",
      Invalid: "Không hợp lệ",
      Processing: "Đang xử lý",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="font-sans min-h-screen bg-[#020617] text-white">
      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Quản lý CV
              </h1>
              <p className="text-slate-400 mb-8 max-w-2xl leading-relaxed">
                Tải lên và quản lý CV của bạn để ứng tuyển nhanh hơn.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-4">
              <Button
                variant="primary"
                size="md"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => setUploadModalOpen(true)}
              >
                Tải lên CV
              </Button>
            </div>
          </div>
        </section>

        {/* CV List */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : isError ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-center">
                {MSG07}
                <div>
                  <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
                    Thử lại
                  </Button>
                </div>
              </div>
            ) : cvList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0F1333]">
                  <FileText className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-lg font-medium text-slate-300">Chưa có CV nào</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tải lên CV đầu tiên của bạn để bắt đầu.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="mt-6"
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Tải lên CV
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cvList.map((cv) => (
                  <div
                    key={cv.cvId}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                        <FileText className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{cv.fileName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(cv.uploadDate)}
                          </span>
                          {getStatusBadge(cv.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                      {cv.fileUrl && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-slate-500 hover:text-blue-400"
                          onClick={() => window.open(cv.fileUrl, "_blank", "noopener,noreferrer")}
                          title="Xem CV"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500 hover:text-purple-400"
                        onClick={() => navigate(`/analyse-cv/${cv.cvId}`)}
                        title="Phân tích CV"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500 hover:text-red-400"
                        onClick={() => setDeleteTarget(cv)}
                        title="Xóa CV"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Upload Modal */}
      <UploadCVModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />

      {/* Delete Confirmation Modal (UC-28) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-8 shadow-2xl text-center">
            {/* Red X Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>

            {/* Title */}
            <h3 className="mb-2 text-xl font-bold text-white">
              Bạn muốn xóa CV này?
            </h3>

            {/* Description */}
            <p className="mb-8 text-sm text-slate-400">
              Chọn <span className="font-semibold text-white">Đồng ý</span> nếu bạn muốn xóa CV này, nếu không, hãy chọn{" "}
              <span className="font-semibold text-white">Hủy</span>
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="min-w-[100px] rounded-lg border border-slate-600 bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="min-w-[100px] flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Đồng ý"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
