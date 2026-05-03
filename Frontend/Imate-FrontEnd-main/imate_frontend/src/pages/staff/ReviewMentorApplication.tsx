import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  // ...existing code...
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppTabs } from "@/components/ui/tabs";
import {
  getPendingMentorApplications,
  getPendingRecruiterApplications,
  reviewMentorApplication,
  reviewRecruiterApplication,
} from "@/services/staffReviewService";
import type { StaffMentorApplication } from "@/types/response/staffReview.response";
import type { StaffRecruiterApplication } from "@/types/response/staffReview.response";
import { toast } from "react-toastify";

const PAGE_SIZE = 6;
type Tab = "mentor" | "recruiter";

/* ─── helpers ─── */
function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const COLORS = ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-indigo-400"];

function Avatar({ name, url, className }: { name: string; url?: string | null; className?: string }) {
  if (url)
    return <img src={url} alt={name} className={`h-12 w-12 shrink-0 rounded-full object-cover ${className ?? ""}`} />;
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${COLORS[name.length % COLORS.length]} ${className ?? ""}`}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Review Modal ─── */
interface ReviewModalProps {
  name: string;
  onClose: () => void;
  onSubmit: (approved: boolean, note: string) => Promise<void>;
  loading: boolean;
}
function ReviewModal({ name, onClose, onSubmit, loading }: ReviewModalProps) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a22] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Duyệt hồ sơ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-300">
          Bạn đang xét duyệt hồ sơ của <span className="font-semibold text-white">{name}</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (tuỳ chọn)..."
          rows={3}
          className="mb-4 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => onSubmit(true, note)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" /> Duyệt
          </button>
          <button
            disabled={loading}
            onClick={() => onSubmit(false, note)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" /> Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
const ReviewMentorApplication: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("mentor");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // mentor
  const [mentorData, setMentorData] = useState<{
    items: StaffMentorApplication[];
    totalCount: number;
    totalPages: number;
  } | null>(null);

  // recruiter
  const [recruiterData, setRecruiterData] = useState<StaffRecruiterApplication[] | null>(null);

  // review modal
  const [reviewTarget, setReviewTarget] = useState<{ id: number; name: string; type: Tab } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* fetch */
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingMentorApplications({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: submittedSearch || undefined,
      });
      setMentorData({ items: result.items, totalCount: result.totalCount, totalPages: result.totalPages });
    } catch {
      setError("Không tải được danh sách đơn Mentor.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, submittedSearch]);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingRecruiterApplications();
      // client-side search filter
      const filtered = submittedSearch
        ? result.filter((r) => r.fullName.toLowerCase().includes(submittedSearch.toLowerCase()) || r.companyName.toLowerCase().includes(submittedSearch.toLowerCase()))
        : result;
      setRecruiterData(filtered);
    } catch {
      setError("Không tải được danh sách đơn Recruiter.");
    } finally {
      setLoading(false);
    }
  }, [submittedSearch]);

  useEffect(() => {
    if (tab === "mentor") fetchMentors();
    else fetchRecruiters();
  }, [tab, fetchMentors, fetchRecruiters]);

  const handleTabChange = (value: string) => {
    setTab(value as Tab);
    setPageNumber(1);
    setSearchTerm("");
    setSubmittedSearch("");
    setError(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleReviewSubmit = async (approved: boolean, note: string) => {
    if (!reviewTarget) return;
    setReviewLoading(true);
    try {
      if (reviewTarget.type === "mentor") {
        await reviewMentorApplication(reviewTarget.id, { isApproved: approved, note });
      } else {
        await reviewRecruiterApplication(reviewTarget.id, { isApproved: approved, note });
      }
      toast.success(approved ? "Duyệt hồ sơ thành công!" : "Đã từ chối hồ sơ.");
      setReviewTarget(null);
      if (tab === "mentor") fetchMentors();
      else fetchRecruiters();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setReviewLoading(false);
    }
  };

  /* paged recruiter items */
  const recruiterPaged = recruiterData
    ? recruiterData.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE)
    : [];
  const recruiterTotalPages = recruiterData ? Math.ceil(recruiterData.length / PAGE_SIZE) : 1;

  const totalPages = tab === "mentor" ? (mentorData?.totalPages ?? 1) : recruiterTotalPages;


  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Đơn ứng tuyển</h1>
          <p className="text-slate-400">Xem và phê duyệt hồ sơ Mentor & Recruiter</p>
        </div>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          {
            label: `Mentor${mentorData ? ` (${mentorData.totalCount})` : ''}`,
            value: "mentor",
          },
          {
            label: `Recruiter${recruiterData ? ` (${recruiterData.length})` : ''}`,
            value: "recruiter",
          },
        ]}
        value={tab}
        onChange={handleTabChange}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-white">Danh sách hồ sơ</h2>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={tab === "mentor" ? "Tìm theo tên Mentor..." : "Tìm theo tên hoặc công ty..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-red-400">{error}</div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <>
          {((tab === "mentor" ? mentorData?.items?.length : recruiterPaged.length) === 0) ? (
            <div className="text-center py-12 text-slate-400">Không có đơn ứng tuyển nào</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(tab === "mentor" ? mentorData?.items ?? [] : recruiterPaged).map((app) => (
                <div
                  key={app.accountId}
                  className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={app.fullName} url={app.avatarUrl} className="h-10 w-10" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-white truncate">{app.fullName}</span>
                      <span className="text-sm text-slate-400 truncate">{app.email}</span>
                    </div>
                  </div>
                  {/* Body */}
                  {"companyName" in app && (
                    <p className="text-sm text-indigo-400 font-medium mb-2">{app.companyName}</p>
                  )}
                  {"positions" in app && (
                    <p className="text-sm text-indigo-400 font-medium mb-2">{app.positions?.[0] ?? "Mentor"}</p>
                  )}
                  {/* Skills */}
                  {"skills" in app && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(app.skills ?? []).slice(0, 4).map((skill) => (
                        <span key={skill} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{skill}</span>
                      ))}
                    </div>
                  )}
                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Button
                      onClick={() =>
                        navigate(`/management/applications/${tab === "mentor" ? "mentor" : "recruiter"}/${app.accountId}`)
                      }
                      variant="secondary"
                      size="md"
                      className="flex-1"
                    >
                      Chi tiết
                    </Button>
                    <Button
                      onClick={() =>
                        setReviewTarget({ id: app.accountId, name: app.fullName, type: tab })
                      }
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      Xét duyệt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-slate-400">Trang {pageNumber} / {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md bg-slate-800 border border-slate-700"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-md bg-slate-800 border border-slate-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {reviewTarget && (
        <ReviewModal
          name={reviewTarget.name}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
          loading={reviewLoading}
        />
      )}
    </div>
  );
};
export default ReviewMentorApplication;
