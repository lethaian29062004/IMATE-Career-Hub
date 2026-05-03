import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Check, X } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";

import { GetAppliedCandidate, UpdateJobApplication } from "@/services/recruiterService";
import type { AppliedCandidateResponse, AppliedCandidateItem } from "@/types/common/recruiter";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const AppliedCandidateList: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return;
        if (user && user.accountStatus === "PendingVerification" && user.verificationStatus !== "Rejected" && user.companyName) {
            navigate("/recruiter-pending-application", { replace: true });
        }
    }, [user, isAuthLoading, navigate]);

    const [data, setData] = useState<AppliedCandidateResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>();

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<AppliedCandidateItem | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    const fetchCandidates = async () => {
        if (!jobId) return;
        try {
            setLoading(true);
            const result = await GetAppliedCandidate(Number(jobId), {
                jobId: Number(jobId),
                pageNumber,
                pageSize,
                searchTerm,
                status,
            });

            setData({
                pageNumber: result.pageNumber,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                items: result.items,
            });
            console.log(result);
        } catch (err) {
            console.error("Error fetching candidates:", err);
            toast.error("Đã có lỗi xảy ra khi tải danh sách ứng viên");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (candidate: AppliedCandidateItem, status: string) => {
        setSelectedCandidate(candidate);
        setSelectedStatus(status);
        setFeedback("");
        setIsModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!selectedCandidate) return;

        try {
            setIsSubmitting(true);
            await UpdateJobApplication({
                id: selectedCandidate.applicationId,
                status: selectedStatus,
                recruiterFeedback: feedback
            });
            toast.success(`Cập nhật trạng thái thành công`);
            setIsModalOpen(false);
            fetchCandidates();
        } catch (err: any) {
            console.error("Error updating application:", err);
            toast.error(err?.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [jobId, pageNumber, pageSize, searchTerm, status]);

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "active";
            case "rejected":
                return "error";
            case "waiting":
            case "reviewing":
                return "pending";
            default:
                return "inactive";
        }
    };

    return (
        <div className="p-6 space-y-6 min-h-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => navigate("/management/recruiter-dashboard/job-applications")}
                    className="cursor-pointer"
                >
                    Quay lại danh sách
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Danh sách ứng viên
                    </h1>
                    <p className="text-slate-400">
                        Quản lý các hồ sơ ứng tuyển cho vị trí này
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">Danh sách</h2>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="relative min-w-[240px]">
                            <Input
                                placeholder="Tìm theo tên/email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
                            <select
                                value={status || ""}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="">Tất cả</option>
                                <option value="Waiting">Waiting</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Đang tải...</div>
                ) : !data || data.items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">Chưa có ứng viên nào</div>
                ) : (
                    <Table
                        page={pageNumber}
                        totalPages={data.totalPages}
                        pageSize={pageSize}
                        onPageChange={setPageNumber}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPageNumber(1);
                        }}
                        maxHeight="55vh"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên ứng viên</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>Ngày nộp</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-[120px] text-center">CV</TableHead>
                                <TableHead className="w-[100px] text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items.map((candidate) => (
                                <TableRow key={candidate.applicationId}>
                                    <TableCell className="font-medium text-white">{candidate.candidateFullName || "N/A"}</TableCell>
                                    <TableCell>{candidate.candidateEmail || "N/A"}</TableCell>
                                    <TableCell>{"N/A"}</TableCell>
                                    <TableCell>{candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : "N/A"}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={getStatusVariant(candidate.status)}>
                                            {candidate.status || "N/A"}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {candidate.candidateFileUrl ? (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => window.open(candidate.candidateFileUrl, "_blank")}
                                                className="cursor-pointer whitespace-nowrap"
                                            >
                                                Xem CV
                                            </Button>
                                        ) : (
                                            <span className="text-slate-500 text-sm whitespace-nowrap px-2">Không có CV</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-8 h-8 p-0 text-green-500 border-green-500 hover:bg-green-500 hover:text-white flex-shrink-0 cursor-pointer"
                                                title="Phê duyệt"
                                                onClick={() => handleOpenModal(candidate, "Approved")}
                                            >
                                                <Check size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-8 h-8 p-0 text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex-shrink-0 cursor-pointer"
                                                title="Từ chối"
                                                onClick={() => handleOpenModal(candidate, "Rejected")}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Feedback Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {selectedStatus === "Approved" ? "Phê duyệt hồ sơ" : "Từ chối hồ sơ"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-slate-400 text-sm mb-4">
                            Bạn đang thực hiện {selectedStatus === "Approved" ? "phê duyệt" : "từ chối"} hồ sơ của <span className="text-white font-semibold">{selectedCandidate?.candidateFullName}</span>. Vui lòng để lại phản hồi cho ứng viên.
                        </p>

                        <div className="space-y-2 mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phản hồi của bạn</label>
                            <textarea
                                className="w-full h-32 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                placeholder="VD: Hồ sơ của bạn rất ấn tượng..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={handleConfirmUpdate}
                                disabled={isSubmitting}
                                className={`cursor-pointer font-bold ${selectedStatus === "Approved" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    selectedStatus === "Approved" ? "Phê duyệt" : "Từ chối"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppliedCandidateList;
