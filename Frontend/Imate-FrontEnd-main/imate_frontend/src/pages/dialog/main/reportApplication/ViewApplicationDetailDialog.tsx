// ViewApplicationDetailDialog.tsx
import * as React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, MessageSquare, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  getApplicationTechnicalDetails,
  getApplicationMentorDetails,
  getApplicationRatingDetails,
  getApplicationReportCommentDetails,
  approveApplicationStaff,
  rejectApplicationStaff,
} from "@/services/applicationService";

import {
  ApplicationType, ApplicationStatus, getApplicationTypeLabel,
  APPLICATION_STATUS_OPTIONS,
} from "@/constants/enum";

import type {
  ApplicationReportCommentDetailResponse,
} from "@/types/response/application.response";
import type { Status } from "@/components/ui/status-badge";
import { toast } from "react-toastify";

interface ViewApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: number | null;
  applicationType?: string;
  canReview?: boolean;
  onReviewSuccess?: () => void;
}

const statusBadgeMap: Record<string, Status> = {
  [ApplicationStatus.Pending]: "pending",
  [ApplicationStatus.InReview]: "pending",
  [ApplicationStatus.Approved]: "active",
  [ApplicationStatus.Rejected]: "error",
};

function ReadonlyField({ label, value, multiline = false }: {
  label: string; value?: string | null; multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-200">{label}</Label>
      {multiline ? (
        <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-300 text-sm min-h-[90px] whitespace-pre-wrap">
          {value || <span className="text-slate-500 italic">Không có</span>}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-300 text-sm h-10 flex items-center">
          {value || <span className="text-slate-500 italic">Không có</span>}
        </div>
      )}
    </div>
  );
}

function EvidenceList({ urls }: { urls?: any }) {
  let list: string[] = [];
  if (Array.isArray(urls)) list = urls;
  else if (typeof urls === "string" && urls.trim().startsWith("[")) {
    try { list = JSON.parse(urls); } catch { list = []; }
  } else if (typeof urls === "string" && urls) list = [urls];

  if (list.length === 0) {
    return (
      <div className="bg-slate-800 border border-dashed border-slate-600 rounded-md px-4 py-4 text-center text-slate-500 text-sm italic">
        Không có bằng chứng đính kèm
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {list.map((url, i) => {
        const isVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
        return isVideo ? (
          <video key={i} src={url} controls className="w-full rounded-lg border border-slate-700 object-cover aspect-square" />
        ) : (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <img src={url} alt={`Bằng chứng ${i + 1}`} className="w-full rounded-lg border border-slate-700 object-cover aspect-square hover:opacity-80 transition-opacity cursor-pointer" />
          </a>
        );
      })}
    </div>
  );
}

// ── Component mô phỏng câu hỏi + comment bị báo cáo ─────────────────────────
function ReportCommentPreview({ detail }: { detail: ApplicationReportCommentDetailResponse }) {
  const { commentDetail } = detail;

  // Comment đã bị xóa (do đơn khác được duyệt trước, CommentId đã thành null)
  if (!commentDetail) {
    return (
      <div className="space-y-3">
        {/* Banner thông báo comment đã bị xóa */}
        <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-4">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700">
            <Trash2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-300">Comment đã bị xóa</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Comment này đã bị gỡ do một báo cáo liên quan được duyệt trước đó.
              Đơn này sẽ được tự động chuyển sang trạng thái <span className="text-emerald-400 font-medium">Đã duyệt</span> vì
              mục đích báo cáo đã được thực hiện.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const question = commentDetail.question;
  const author   = commentDetail.author;

  return (
    <div className="space-y-3">
      {/* Khung câu hỏi */}
      {question && (
        <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Câu hỏi</span>
          </div>

          {question.createdByUser && (
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarImage src={question.createdByUser.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-violet-800 text-violet-200">
                  {question.createdByUser.fullName?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-slate-300">{question.createdByUser.fullName}</span>
              {question.createdByUser.email && (
                <span className="text-xs text-slate-500">· {question.createdByUser.email}</span>
              )}
            </div>
          )}

          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {question.content ?? <span className="italic text-slate-500">Không có nội dung</span>}
          </p>
        </div>
      )}

      {/* Comment bị báo cáo */}
      <div className="ml-4 rounded-lg border border-red-500/40 bg-red-500/5 p-4 space-y-3 relative">
        <span className="absolute -top-2.5 left-3 bg-slate-900 px-2 text-xs font-semibold text-red-400 border border-red-500/40 rounded">
          Comment bị báo cáo
        </span>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={author.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-indigo-800 text-indigo-200">
                {author.fullName?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-200">{author.fullName}</p>
              {author.email && <p className="text-xs text-slate-500">{author.email}</p>}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {commentDetail.content}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ViewApplicationDetailDialog({
  open, onOpenChange, applicationId, applicationType = "",
  canReview = false, onReviewSuccess,
}: ViewApplicationDetailDialogProps) {
  const [detail, setDetail] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [responseNote, setResponseNote] = React.useState("");
  const [reviewLoading, setReviewLoading] = React.useState(false);

  const fetchDetail = async () => {
    if (!applicationId) return;
    setLoading(true); setError(null);
    try {
      let data;
      if (applicationType === ApplicationType.TechnicalError)
        data = await getApplicationTechnicalDetails(applicationId);
      else if (applicationType === ApplicationType.ReportMentor)
        data = await getApplicationMentorDetails(applicationId);
      else if (applicationType === ApplicationType.ReportRating)
        data = await getApplicationRatingDetails(applicationId);
      else if (applicationType === ApplicationType.ReportComment)
        data = await getApplicationReportCommentDetails(applicationId);
      else data = null;
      setDetail(data);
    } catch {
      setError("Không thể tải chi tiết đơn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && applicationId) { fetchDetail(); setResponseNote(""); }
    else { setDetail(null); setError(null); }
  }, [open, applicationId, applicationType]);

  const isReportComment = applicationType === ApplicationType.ReportComment;

  // Đơn ReportComment mà comment đã bị xóa (commentDetail null) thì không cho review nữa
  // vì backend sẽ tự động approve — staff chỉ xem được
  const isCommentAlreadyDeleted = isReportComment && detail && !detail.commentDetail && !detail.commentId;

  const isReviewable = canReview &&
    !isCommentAlreadyDeleted &&
    (detail?.status === ApplicationStatus.Pending || detail?.status === ApplicationStatus.InReview);

  const handleReview = async (action: "approve" | "reject") => {
    if (!applicationId) return;
    if (!responseNote.trim()) {
      toast.error("Vui lòng nhập phản hồi trước khi " + (action === "approve" ? "duyệt" : "từ chối") + ".");
      return;
    }
    setReviewLoading(true);
    try {
      if (action === "approve") await approveApplicationStaff(applicationId, responseNote);
      else await rejectApplicationStaff(applicationId, responseNote);
      toast.success(action === "approve" ? "Duyệt đơn thành công." : "Đã từ chối đơn.");
      onOpenChange(false);
      onReviewSuccess?.();
    } catch {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setReviewLoading(false);
    }
  };

  const statusLabel = APPLICATION_STATUS_OPTIONS.find((o) => o.value === detail?.status)?.label || detail?.status || "";

  const senderName   = isReportComment ? detail?.reporter?.fullName  : detail?.fullName;
  const senderEmail  = isReportComment ? detail?.reporter?.email     : detail?.email;
  const senderAvatar = isReportComment ? detail?.reporter?.avatarUrl : detail?.avatarUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="space-y-0.5 flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white">Chi tiết đơn</DialogTitle>
            </div>
            {detail && (
              <div className="shrink-0 pt-1">
                <StatusBadge status={statusBadgeMap[detail.status] ?? "inactive"}>
                  {statusLabel || "Chưa xác định"}
                </StatusBadge>
              </div>
            )}
            <DialogDescription />
          </div>
          {detail && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Ngày gửi: {new Date(detail.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </DialogHeader>

        {loading && <div className="py-12 text-center text-slate-400">Đang tải chi tiết...</div>}
        {error   && <div className="py-8 text-center text-red-400">{error}</div>}
        {!loading && !error && !detail && (
          <div className="py-8 text-center text-slate-500 italic">Chưa hỗ trợ xem chi tiết cho loại đơn này.</div>
        )}

        {!loading && !error && detail && (
          <div className="space-y-3">
            <div className="h-px bg-slate-700" />

            {/* ── Thông tin đơn ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Thông tin đơn</h3>

              <div className="space-y-2">
                <Label className="text-slate-200">Người gửi đơn</Label>
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={senderAvatar ?? undefined} />
                    <AvatarFallback>{senderName?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{senderName}</p>
                    {senderEmail && <p className="text-xs text-slate-400">{senderEmail}</p>}
                  </div>
                </div>
              </div>

              <div>
                <ReadonlyField label="Loại đơn" value={getApplicationTypeLabel(applicationType)} />
              </div>

              <ReadonlyField label="Tiêu đề" value={detail.title} />
              <ReadonlyField label="Nội dung chi tiết" value={detail.content} multiline />
            </div>

            <div className="h-px bg-slate-700" />

            {/* ── Bằng chứng / Mô phỏng comment ── */}
            <div className="space-y-3">
              {isReportComment ? (
                <>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Bằng chứng
                  </h3>
                  <ReportCommentPreview detail={detail as ApplicationReportCommentDetailResponse} />
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Bằng chứng
                  </h3>
                  <EvidenceList urls={detail.evidenceUrls} />
                </>
              )}
            </div>

            <div className="h-px bg-slate-700" />

            {/* ── Trạng thái xử lý ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Trạng thái xử lý</h3>

              <div className="space-y-2">
                <Label className="text-slate-200">Người xử lý</Label>
                {detail.reviewerName ? (
                  <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback>{detail.reviewerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-200 text-sm font-medium">{detail.reviewerName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 h-10">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500 italic text-sm">Chưa có người xử lý</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Phản hồi từ người xử lý
                </Label>
                {isReviewable ? (
                  <Textarea
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Nhập phản hồi trước khi duyệt hoặc từ chối đơn..."
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 min-h-[100px] resize-none"
                  />
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm min-h-[80px] whitespace-pre-wrap">
                    {detail.response?.trim()
                      ? <span className="text-slate-300">{detail.response}</span>
                      : <span className="text-slate-500 italic">Chưa có phản hồi</span>}
                  </div>
                )}
              </div>

              {isCommentAlreadyDeleted &&
                (detail.status === ApplicationStatus.Pending || detail.status === ApplicationStatus.InReview) && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    Comment liên quan đã bị xóa do một đơn báo cáo khác được duyệt trước đó.
                    Đơn này sẽ được <span className="font-medium text-blue-200">tự động duyệt</span> bởi hệ thống.
                  </p>
                </div>
              )}

              {isReviewable && (
                <div className="flex gap-3 justify-end pt-1">
                  <Button
                    variant="danger"
                    icon={<XCircle size={16} />}
                    onClick={() => handleReview("reject")}
                    disabled={reviewLoading}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    icon={<CheckCircle size={16} />}
                    onClick={() => handleReview("approve")}
                    disabled={reviewLoading}
                  >
                    Duyệt đơn
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}