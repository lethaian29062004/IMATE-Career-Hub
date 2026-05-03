import { useState, useEffect } from "react";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, ShieldAlert, UserX, StarOff, MessageSquareWarning } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// ...existing code...

import {
  getListApplicationForStaff,
  approveApplicationStaff,
  rejectApplicationStaff,
  getPendingApplicationSummary,
} from "@/services/applicationService";

import {
  APPLICATION_STATUS_OPTIONS,
  ApplicationStatus,
  APPLICATION_TYPE_OPTIONS,
  getApplicationTypeLabel,
} from "@/constants/enum";

import type {
  ApplicationStaff,
  ApplicationListStaffResponse,
  ApplicationPendingSummary,
} from "@/types/response/application.response";
import type { Status } from "@/components/ui/status-badge";

import { ViewApplicationDetailDialog } from "@/pages/dialog/main/reportApplication/ViewApplicationDetailDialog";

// ─── Status badge mapping ────────────────────────────────────────────────────

const statusBadgeMap: Record<string, Status> = {
  [ApplicationStatus.Pending]: "pending",
  [ApplicationStatus.InReview]: "pending",
  [ApplicationStatus.Approved]: "active",
  [ApplicationStatus.Rejected]: "error",
};

// ─── Summary card config ─────────────────────────────────────────────────────

const PENDING_TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}> = {
  TechnicalError: {
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "text-sky-300",
    borderColor: "border-sky-500/30",
    bgColor: "bg-sky-500/10",
  },
  ReportMentor: {
    icon: <UserX className="w-5 h-5" />,
    color: "text-amber-300",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
  },
  ReportRating: {
    icon: <StarOff className="w-5 h-5" />,
    color: "text-violet-300",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/10",
  },
  ReportComment: {
    icon: <MessageSquareWarning className="w-5 h-5" />,
    color: "text-rose-300",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/10",
  },
};

// ─── Quick Review Dialog ──────────────────────────────────────────────────────

interface QuickReviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  action: "approve" | "reject";
  applicationId: number | null;
  onSuccess: () => void;
}

function QuickReviewDialog({
  open, onOpenChange, action, applicationId, onSuccess,
}: QuickReviewDialogProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setNote(""); setError(null); }
  }, [open]);

  const handleSubmit = async () => {
    if (!note.trim()) { setError("Vui lòng nhập phản hồi."); return; }
    if (!applicationId) return;
    setLoading(true); setError(null);
    try {
      if (action === "approve") await approveApplicationStaff(applicationId, note);
      else await rejectApplicationStaff(applicationId, note);
      onOpenChange(false);
      onSuccess();
    } catch {
      setError("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const isApprove = action === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isApprove ? "Duyệt đơn" : "Từ chối đơn"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Nhập phản hồi gửi đến người dùng trước khi xác nhận.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label className="text-slate-200">
            Phản hồi <span className="text-red-400">*</span>
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lý do / ghi chú..."
            className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 min-h-[100px] resize-none focus:border-primary"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button
            variant={isApprove ? "primary" : "danger"}
            icon={isApprove ? <CheckCircle size={16} /> : <XCircle size={16} />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {isApprove ? "Xác nhận duyệt" : "Xác nhận từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffApplicationManagement() {
  const [applications, setApplications] = useState<ApplicationStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Summary
  const [summary, setSummary] = useState<ApplicationPendingSummary["data"]>([]);

  // Detail dialog
  const [selectedApp, setSelectedApp] = useState<{
    id: number; type: string;
  } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quick review dialog
  const [quickReview, setQuickReview] = useState<{
    open: boolean;
    action: "approve" | "reject";
    applicationId: number | null;
  }>({ open: false, action: "approve", applicationId: null });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchApplications = async () => {
    setLoading(true); setError(null);
    try {
      const params: Parameters<typeof getListApplicationForStaff>[0] = {
        PageNumber: page,
        PageSize: pageSize,
        SortOrder: "desc",
        ...(statusFilter && { Status: statusFilter as any }),
        ...(typeFilter && { Type: typeFilter as any }),
        ...(searchTerm.trim() && { SearchTerm: searchTerm.trim() }),
      };

      const response: ApplicationListStaffResponse = await getListApplicationForStaff(params);
      setApplications(response.items ?? []);
      setTotalPages(response.totalPages ?? 1);
      setTotalCount(response.totalCount ?? 0);
    } catch {
      setError("Không thể tải danh sách đơn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await getPendingApplicationSummary();
      setSummary(res.data ?? []);
    } catch {
      // không block UI chính nếu summary lỗi
    }
  };

  // Fetch list khi filter / page thay đổi
  useEffect(() => { fetchApplications(); }, [page, pageSize, statusFilter, typeFilter, searchTerm]);

  // Fetch summary 1 lần khi mount
  useEffect(() => { fetchSummary(); }, []);

  // Debounce search input → searchTerm
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewDetail = (app: ApplicationStaff) => {
    setSelectedApp({ id: app.id, type: app.applicationType });
    setIsDetailOpen(true);
  };

  const openQuickReview = (action: "approve" | "reject", id: number) => {
    setQuickReview({ open: true, action, applicationId: id });
  };

  const handleReviewSuccess = () => {
    fetchApplications();
    fetchSummary();
  };

  const isReviewable = (app: ApplicationStaff) =>
    app.status === ApplicationStatus.Pending ||
    app.status === ApplicationStatus.InReview;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Quản lý đơn</h1>
        <p className="text-slate-400">
          Xem xét và xử lý các đơn báo lỗi, tố cáo từ người dùng
        </p>
      </div>
      <div className="h-px bg-slate-700" />

      {/* Summary cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summary.map((item) => {
            const config = PENDING_TYPE_CONFIG[item.type];
            const label = APPLICATION_TYPE_OPTIONS.find(
              (o) => o.value === item.type
            )?.label ?? item.type;

            if (!config) return null;

            return (
              <div
                key={item.type}
                className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${config.color}`}>{label}</p>
                  <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{item.totalNeedProcess}</p>
                  <p className="text-xs text-slate-500 mt-0.5">đơn chờ xử lý</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-semibold text-white">Danh sách đơn</h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm tiêu đề..."
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-52 focus:outline-none focus:border-primary placeholder:text-slate-500"
          />

          {/* Filter loại đơn */}
          <p className="text-slate-400 text-sm">Loại đơn:</p>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả</option>
            {APPLICATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Filter trạng thái */}
          <p className="text-slate-400 text-sm">Trạng thái:</p>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả</option>
            {APPLICATION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải danh sách đơn...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900/50 border border-slate-700 rounded-2xl p-12">
          Không có đơn nào.
        </div>
      ) : (
        <Table
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          maxHeight="55vh"
        >
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead>Loại đơn</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right w-[160px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applications.map((app, index) => (
              <TableRow key={app.id}>
                {/* STT */}
                <TableCell className="text-slate-400">
                  {String((page - 1) * pageSize + index + 1).padStart(2, "0")}
                </TableCell>

                {/* Người gửi */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar size="lg">
                      <AvatarImage src={app?.avatarUrl || ""} />
                      <AvatarFallback
                        name={app?.fullName}
                        className="bg-slate-700"
                      />
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate max-w-[130px]">
                        {app.fullName}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[130px]">
                        {app.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Loại đơn */}
                <TableCell className="font-medium text-slate-200">
                  {getApplicationTypeLabel(app.applicationType)}
                </TableCell>

                {/* Ngày gửi */}
                <TableCell className="text-slate-400">
                  {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>

                {/* Tiêu đề */}
                <TableCell className="max-w-xs truncate text-slate-300">
                  {app.title}
                </TableCell>

                {/* Trạng thái */}
                <TableCell>
                  <StatusBadge status={statusBadgeMap[app.status] ?? "inactive"}>
                    {APPLICATION_STATUS_OPTIONS.find((o) => o.value === app.status)?.label ?? app.status}
                  </StatusBadge>
                </TableCell>

                {/* Thao tác */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Xem chi tiết */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Eye size={14} />}
                          onClick={() => handleViewDetail(app)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Xem chi tiết</TooltipContent>
                    </Tooltip>

                    {/* Duyệt / Từ chối nhanh — chỉ khi còn pending/in-review */}
                    {isReviewable(app) && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<CheckCircle size={14} />}
                              onClick={() => openQuickReview("approve", app.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Duyệt nhanh</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<XCircle size={14} />}
                              onClick={() => openQuickReview("reject", app.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Từ chối nhanh</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Detail dialog — canReview=true cho phép staff xử lý trong dialog */}
      <ViewApplicationDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        applicationId={selectedApp?.id ?? null}
        applicationType={selectedApp?.type ?? ""}
        canReview={true}
        onReviewSuccess={() => {
          setIsDetailOpen(false);
          handleReviewSuccess();
        }}
      />

      {/* Quick review dialog */}
      <QuickReviewDialog
        open={quickReview.open}
        onOpenChange={(v) => setQuickReview((prev) => ({ ...prev, open: v }))}
        action={quickReview.action}
        applicationId={quickReview.applicationId}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}