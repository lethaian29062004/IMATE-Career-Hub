import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Phone,
  Mail,
  Star,
  ChevronRight,
  ChevronLeft,
  Video,
  ClipboardList,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  viewDetailAccountCandidate,
  viewDetailAccountMentor,
  viewDetailAccountStaff,
  viewDetailAccountRecruiter,
} from "@/services/accountService";
import type {
  AccountDetailCandidateResponse,
  AccountDetailMentorResponse,
  AccountDetailStaffResponse,
  StaffAuditLogResponse,
} from "@/types/response/account.response";
import type { AccountResponse } from "@/types/response/account.response";

// ─── helpers ────────────────────────────────────────────────────────────────

function Stars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.round(score)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-700 text-slate-700"
          }
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// ─── sub-panels ─────────────────────────────────────────────────────────────

/** Mentor panel */
function MentorPanel({ data }: { data: AccountDetailMentorResponse }) {
  const [reviewIdx, setReviewIdx] = useState(0);
  const reviews = data.reviews ?? [];
  const total = reviews.length;

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Đánh giá</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {(data.avgRatings ?? 0).toFixed(1)}
            </span>
            <Stars score={data.avgRatings ?? 0} />
          </div>
        </div>
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Phỏng vấn</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {data.totalCompletedSessions ?? 0}
            </span>
            <Video size={18} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Bio / Intro */}
      {(data.bio || data.phone) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Giới thiệu
          </h4>
          {data.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone size={14} className="text-slate-500 shrink-0" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-slate-500 shrink-0" />
              <span className="text-purple-400">{data.email}</span>
            </div>
          )}
          {data.bio && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {data.bio}
            </p>
          )}
        </div>
      )}

      {/* Reviews carousel */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Đánh giá gần đây
            </h4>
            <span className="text-xs text-slate-500">
              {reviewIdx + 1} / {total}
            </span>
          </div>

          <div className="relative bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 min-h-[90px]">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                <AvatarImage
                  src={reviews[reviewIdx]?.reviewerAvatarUrl}
                  alt={reviews[reviewIdx]?.reviewerFullName}
                />
                <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                  {reviews[reviewIdx]?.reviewerFullName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-white truncate">
                    {reviews[reviewIdx]?.reviewerFullName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Stars score={reviews[reviewIdx]?.score ?? 0} />
                    <span className="text-xs text-slate-500">
                      {timeAgo(reviews[reviewIdx]?.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {reviews[reviewIdx]?.text}
                </p>
              </div>
            </div>

            {/* nav arrows */}
            {total > 1 && (
              <div className="flex items-center gap-1 mt-3 justify-end">
                <button
                  onClick={() => setReviewIdx((i) => Math.max(i - 1, 0))}
                  disabled={reviewIdx === 0}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                    reviewIdx === 0
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setReviewIdx((i) => Math.min(i + 1, total - 1))}
                  disabled={reviewIdx === total - 1}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                    reviewIdx === total - 1
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Candidate panel */
function CandidatePanel({ data }: { data: AccountDetailCandidateResponse }) {
  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Phiên tham gia</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {data.mentorSessionCount ?? 0}
            </span>
            <Video size={18} className="text-purple-400" />
          </div>
        </div>
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Gói hiện tại</span>
          <span className="text-sm font-semibold text-white truncate max-w-full">
            {data.presentPackage ? data.presentPackage.name ?? "Có gói" : "Chưa có gói"}
          </span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
          Thông tin liên hệ
        </h4>
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-slate-500 shrink-0" />
          <span className="text-purple-400">{data.email}</span>
        </div>
      </div>

      {/* Past packages */}
      {data.exPackages && data.exPackages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Gói đã dùng
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.exPackages.map((pkg: any, i: number) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs border-slate-700 text-slate-400"
              >
                {pkg?.name ?? `Gói ${i + 1}`}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Recruiter panel */
function RecruiterPanel({ data }: { data: any }) {
  return (
    <div className="space-y-5">
      {/* Company info card */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800/60">
        <div className="flex items-center gap-3">
          {data.companyLogo && (
            <img
              src={data.companyLogo}
              alt={data.companyName}
              className="h-12 w-12 rounded-lg object-cover border border-slate-700"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">
              {data.companyName || "Chưa cập nhật"}
            </h4>
            <span className="text-xs text-slate-400">{data.industry}</span>
          </div>
          {data.verificationStatus && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0.5 shrink-0",
                data.verificationStatus === "Approved"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : data.verificationStatus === "Pending"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-slate-700/40 text-slate-400 border-slate-600/30"
              )}
            >
              {data.verificationStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Số job đã đăng</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {data.jobPostCount ?? 0}
            </span>
            <ClipboardList size={18} className="text-emerald-400" />
          </div>
        </div>
        <div className="bg-slate-900/70 rounded-xl p-4 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Xác minh</span>
          <span className={cn(
            "text-sm font-semibold mt-1",
            data.verificationStatus === "Verified" ? "text-emerald-400" :
            data.verificationStatus === "Pending" ? "text-amber-400" : "text-rose-400"
          )}>
            {data.verificationStatus === "Verified" ? "✓ Đã xác minh" :
             data.verificationStatus === "Pending" ? "⏳ Chờ xác minh" :
             data.verificationStatus === "Rejected" ? "✗ Bị từ chối" : "—"}
          </span>
        </div>
      </div>

      {/* Contact & Details */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
          Thông tin liên hệ
        </h4>
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-slate-500 shrink-0" />
          <span className="text-purple-400">{data.email}</span>
        </div>
        {data.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Phone size={14} className="text-slate-500 shrink-0" />
            <span>{data.phone}</span>
          </div>
        )}
        {data.website && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 shrink-0 text-xs">🌐</span>
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline truncate"
            >
              {data.website}
            </a>
          </div>
        )}
      </div>

      {/* Company details */}
      {(data.companySize || data.address) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Chi tiết công ty
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {data.companySize && (
              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/60">
                <span className="text-xs text-slate-400">Quy mô</span>
                <p className="text-sm font-semibold text-white mt-1">{data.companySize}</p>
              </div>
            )}
            {data.address && (
              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/60">
                <span className="text-xs text-slate-400">Địa chỉ</span>
                <p className="text-sm font-semibold text-white mt-1 line-clamp-2">{data.address}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Staff panel */
function StaffPanel({ data }: { data: AccountDetailStaffResponse }) {
  const logs: StaffAuditLogResponse[] = data.auditLog ?? [];

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/70 rounded-xl p-3 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Câu hỏi</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-white">{data.questionCount ?? 0}</span>
            <ClipboardList size={15} className="text-indigo-400" />
          </div>
        </div>
        <div className="bg-slate-900/70 rounded-xl p-3 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Đơn xét</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-white">{data.applicationCount ?? 0}</span>
            <ClipboardList size={15} className="text-amber-400" />
          </div>
        </div>
        <div className="bg-slate-900/70 rounded-xl p-3 flex flex-col items-start gap-1 border border-slate-800/60">
          <span className="text-xs text-slate-400">Mentor</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-white">{data.mentorCount ?? 0}</span>
            <Users size={15} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
          Thông tin liên hệ
        </h4>
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-slate-500 shrink-0" />
          <span className="text-purple-400">{data.email}</span>
        </div>
      </div>

      {/* Recent audit logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Nhật ký hoạt động gần đây
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2"
              >
                <span className="text-slate-500 shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleDateString("vi-VN")}
                </span>
                <span className="text-slate-300 font-medium">{log.action}</span>
                <span className="text-slate-500 truncate">{log.entityName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main modal ─────────────────────────────────────────────────────────────

interface UserAccountDetailModalProps {
  user: AccountResponse | null;
  open: boolean;
  onClose: () => void;
}

type AccountDetailData =
  | { role: "mentor"; data: AccountDetailMentorResponse }
  | { role: "candidate"; data: AccountDetailCandidateResponse }
  | { role: "staff"; data: AccountDetailStaffResponse }
  | { role: "recruiter"; data: any };

function getPrimaryRole(roles?: string[]): string {
  if (!roles || roles.length === 0) return "staff";
  if (roles.some((r) => r.includes("Staff"))) return "staff";
  if (roles.some((r) => r.includes("Recruiter"))) return "recruiter";
  if (roles.some((r) => r.includes("Mentor"))) return "mentor";
  if (roles.some((r) => r.includes("Candidate"))) return "candidate";
  return "staff";
}

function getUserRoleList(roles?: string[]): string[] {
  const result: string[] = [];
  if (roles?.some((r) => r.includes("Staff"))) result.push("staff");
  if (roles?.some((r) => r.includes("Recruiter"))) result.push("recruiter");
  if (roles?.some((r) => r.includes("Mentor"))) result.push("mentor");
  if (roles?.some((r) => r.includes("Candidate"))) result.push("candidate");
  return result.length > 0 ? result : ["staff"];
}

async function fetchSingleRole(id: number, role: string): Promise<AccountDetailData> {
  if (role === "mentor") {
    const data = await viewDetailAccountMentor(id);
    return { role: "mentor", data };
  }
  if (role === "candidate") {
    const data = await viewDetailAccountCandidate(id);
    return { role: "candidate", data };
  }
  if (role === "recruiter") {
    const data = await viewDetailAccountRecruiter(id);
    return { role: "recruiter", data };
  }
  const data = await viewDetailAccountStaff(id);
  return { role: "staff", data };
}

async function fetchAccountDetail(id: number, roles?: string[]): Promise<AccountDetailData> {
  const roleList = getUserRoleList(roles);
  // Try each role the user has; fallback to next if one fails
  for (let i = 0; i < roleList.length; i++) {
    try {
      return await fetchSingleRole(id, roleList[i]);
    } catch (err) {
      if (i === roleList.length - 1) throw err; // Last role, re-throw
      // Otherwise try the next role
    }
  }
  throw new Error("Cannot load account detail");
}

function roleBadgeClass(role: string) {
  if (role.includes("Candidate"))
    return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  if (role.includes("Mentor"))
    return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (role.includes("Recruiter"))
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
}
function roleLabel(role: string) {
  if (role.includes("Candidate")) return "ỨNG VIÊN";
  if (role.includes("Mentor")) return "MENTOR";
  if (role.includes("Recruiter")) return "NTD";
  return "NHÂN VIÊN";
}

export default function UserAccountDetailModal({
  user,
  open,
  onClose,
}: UserAccountDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const primaryRole = getPrimaryRole(user?.roles);

  const { data: detail, isLoading, isError, refetch } = useQuery<AccountDetailData>({
    queryKey: ["account-detail", user?.id, primaryRole],
    queryFn: () => fetchAccountDetail(user!.id, user?.roles),
    enabled: open && !!user,
  });

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  const statusLabel = user?.status === 1 || user?.status === 2 ? "ACTIVE" : "INACTIVE";
  const statusClass =
    user?.status === 1 || user?.status === 2
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-slate-700/40 text-slate-400 border-slate-600/30";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.15s ease" }}
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* ── gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              "linear-gradient(90deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)",
          }}
        />

        {/* ── header row */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {/* Avatar — large, with gradient border */}
          <div className="relative shrink-0">
            <div
              className="h-20 w-20 rounded-2xl p-[2px]"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)",
              }}
            >
              <Avatar className="h-full w-full rounded-2xl">
                <AvatarImage
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  className="object-cover rounded-2xl"
                />
                <AvatarFallback className="rounded-2xl bg-slate-800 text-slate-200 text-xl font-bold">
                  {user?.fullName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-xl font-bold text-white truncate">{user?.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-semibold tracking-wide px-2 py-0.5",
                  statusClass
                )}
              >
                {statusLabel}
              </Badge>
              {user?.roles?.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={cn(
                    "text-[11px] font-semibold tracking-wide px-2 py-0.5",
                    roleBadgeClass(role)
                  )}
                >
                  {roleLabel(role)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── divider */}
        <div className="h-px bg-slate-800/60 mx-6" />

        {/* ── body */}
        <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto custom-scroll">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={30} className="text-purple-500 animate-spin" />
              <span className="text-sm text-slate-400">Đang tải thông tin...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <AlertCircle size={28} className="text-rose-500" />
              <p className="text-sm text-slate-400 text-center">
                Không thể tải thông tin. Vui lòng thử lại
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          )}

          {detail?.role === "mentor" && <MentorPanel data={detail.data} />}
          {detail?.role === "candidate" && <CandidatePanel data={detail.data} />}
          {detail?.role === "staff" && <StaffPanel data={detail.data} />}
          {detail?.role === "recruiter" && <RecruiterPanel data={detail.data} />}
        </div>

        {/* ── footer */}
        <div className="px-6 pb-5 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/60"
          >
            Đóng
          </Button>
        </div>
      </div>

      {/* keyframe styles injected inline */}
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
    </div>
  );
}
