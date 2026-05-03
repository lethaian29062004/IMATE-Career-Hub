import { useState, useEffect } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/store/AuthContext";

import { getListApplications } from "@/services/applicationService";
import {
  APPLICATION_STATUS_OPTIONS,
  ApplicationStatus,
  type ApplicationStatusType,
  APPLICATION_TYPE_OPTIONS
} from "@/constants/enum";

import type { ApplicationListResponse, ApplicationResponse } from "@/types/response/application.response";

import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import type { Status } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";

import { ViewApplicationDetailDialog } from "@/pages/dialog/main/reportApplication/ViewApplicationDetailDialog";
import { CreateApplicationDialog } from "@/pages/dialog/main/reportApplication/CreateApplicationDialog";

export default function ViewApplication() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // State cho dialog chi tiết
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<{
    id: number;
    type: string;
  } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setPage(1);
    fetchApplications();
  };

  const handleViewDetail = (app: ApplicationResponse) => {
    setSelectedAppForDetail({
      id: app.id,
      type: app.applicationType || "",
    });
    setIsDetailOpen(true);
  };

  // Mapping trạng thái sang màu badge
  const statusBadgeMap: Record<ApplicationStatusType, Status> = {
    [ApplicationStatus.Pending]: "pending",
    [ApplicationStatus.InReview]: "pending",
    [ApplicationStatus.Approved]: "active",
    [ApplicationStatus.Rejected]: "error",
  };

  const fetchApplications = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        PageNumber: page,
        PageSize: pageSize,
        SortBy: "createdAt",
        SortOrder: "desc",
      };

      // Filter Status
      if (statusFilter !== "") {
        params.Status = statusFilter;        // string
      }

      // Filter Type - Truyền string trực tiếp
      if (typeFilter !== "") {
        params.Type = typeFilter;            // ví dụ: "ReportMentor"
      }

      const response: ApplicationListResponse = await getListApplications(params, user.id);

      setApplications(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error("Lỗi tải danh sách đơn:", err);
      setError("Không thể tải danh sách đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [page, pageSize, statusFilter, typeFilter, user?.id]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  };

  return (
    <div className="font-sans min-h-screen bg-[#020617] text-white">
      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Quản lý đơn
              </h1>
              <p className="text-slate-400 mb-8 max-w-2xl leading-relaxed">
                Xem tất cả đơn lỗi kỹ thuật, tố cáo mentor, tố cáo rating và tố cáo comment của bạn.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-4">
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={handleOpenCreateDialog}
              >
                Tạo đơn mới
              </Button>

            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Loại đơn</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                  >
                    <option value="">Tất cả</option>
                    {APPLICATION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                  >
                    <option value="">Tất cả</option>
                    {APPLICATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center text-slate-300"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-center">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-12">
                Bạn chưa có đơn nào. Hãy tạo đơn mới.
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-2">
                <Table
                  page={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                  maxHeight="55vh"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Loại đơn</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Phản hồi</TableHead>
                      <TableHead>Người xử lý</TableHead>
                      <TableHead className="w-[140px] text-right">Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app, index) => (
                      <TableRow key={app.id}>
                        <TableCell className="text-slate-400">
                          {String((page - 1) * pageSize + index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium">{app.applicationType}</TableCell>
                        <TableCell>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell className="max-w-md truncate">{app.title}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={statusBadgeMap[app.status as ApplicationStatusType] || "inactive"}
                          >
                            {APPLICATION_STATUS_OPTIONS.find(opt => opt.value === app.status)?.label || app.status}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-slate-400 truncate max-w-xs">
                          {app.responseNote || "Chưa có phản hồi"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={app.reviewer?.avatarUrl}
                                alt={app.reviewer?.fullName}
                              />
                              <AvatarFallback>
                                {app.reviewer?.fullName?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {app.reviewer?.fullName || "Chưa xử lý"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={<Eye size={14} />}
                                onClick={() => handleViewDetail(app)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết đơn</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Dialogs */}
      <CreateApplicationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <ViewApplicationDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        applicationId={selectedAppForDetail?.id || null}
        applicationType={selectedAppForDetail?.type || ""}
      />
    </div>
  );
}