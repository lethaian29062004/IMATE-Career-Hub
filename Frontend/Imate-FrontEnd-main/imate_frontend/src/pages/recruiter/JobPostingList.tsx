import React, { useEffect, useState } from "react";
import { Plus, Pencil, Search, Users, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";

import type { JobItem, JobResponse } from "@/types/common/recruiter";
import { getRecruiterJobApplications, CloseJob } from "@/services/recruiterService";
import UpdateJobPostModal from "@/pages/dialog/main/recruiter/UpdateJobPostModal";
import { toast } from "react-toastify";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const JobPostingList: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return;
        if (user && user.accountStatus === "PendingVerification" && user.verificationStatus !== "Rejected" && user.companyName) {
            navigate("/recruiter-pending-application", { replace: true });
        }
    }, [user, isAuthLoading, navigate]);

    const [data, setData] = useState<JobResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState<string | undefined>();
    const [employmentType, setEmploymentType] = useState<string | undefined>();

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
    const [jobToClose, setJobToClose] = useState<JobItem | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleEdit = (job: JobItem) => {
        setSelectedJob(job);
        setShowEditModal(true);
    };

    const handleCloseJob = async () => {
        if (!jobToClose) return;
        try {
            setIsClosing(true);
            await CloseJob(jobToClose.id);
            toast.success("Đóng bài đăng thành công");
            setJobToClose(null);
            fetchJobs();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Đã có lỗi xảy ra khi đóng bài đăng");
        } finally {
            setIsClosing(false);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);

            const result = await getRecruiterJobApplications({
                pageNumber,
                pageSize,
                searchTerm,
                location,
                employmentType,
            });

            setData({
                pageNumber: result.pageNumber,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                items: result.items,
            });
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [pageNumber, pageSize, searchTerm, location, employmentType]);

    const formatSalary = (min: number, max: number) => {
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Open":
                return "active";
            case "Closed":
                return "error";
            default:
                return "inactive";
        }
    };

    return (
        <div className="p-6 space-y-6 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Quản lý bài đăng tuyển dụng
                    </h1>
                    <p className="text-slate-400">
                        Quản lý danh sách công việc mà bạn đã đăng tuyển
                    </p>
                </div>

                <Button className="cursor-pointer"
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => navigate("/management/recruiter-dashboard/create-job-posting")}
                >
                    Thêm bài đăng mới
                </Button>
            </div>

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">Danh sách bài đăng</h2>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="relative min-w-[240px]">
                            <Input
                                placeholder="Tìm theo tiêu đề..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="relative min-w-[200px]">
                            <Input
                                placeholder="Tìm theo địa điểm..."
                                value={location || ""}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 whitespace-nowrap">Loại hình:</span>
                            <select
                                value={employmentType || ""}
                                onChange={(e) => {
                                    setEmploymentType(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="">Tất cả</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Đang tải...</div>
                ) : !data || data.items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">Chưa có bài đăng nào</div>
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
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Loại hình</TableHead>
                                <TableHead>Địa điểm</TableHead>
                                <TableHead>Lương</TableHead>
                                <TableHead>Hạn nộp</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-[140px] text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium truncate max-w-[200px]" title={job.title}>{job.title}</TableCell>
                                    <TableCell>{job.employmentType}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{formatSalary(job.minSalary, job.maxSalary)}</TableCell>
                                    <TableCell>{new Date(job.applicationDeadline).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={getStatusVariant(job.status)}>
                                            {job.status}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button className="cursor-pointer"
                                                        size="sm"
                                                        variant="secondary"
                                                        icon={<Pencil size={14} />}
                                                        onClick={() => handleEdit(job)}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>Sửa</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="text-green-400 hover:text-green-300 cursor-pointer"
                                                        icon={<Users size={14} />}
                                                        onClick={() => navigate(`/management/recruiter-dashboard/job-postings/${job.id}/candidates`)}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>Ứng viên</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-8 h-8 p-0 text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex-shrink-0"
                                                        title="Đóng bài"
                                                        onClick={() => setJobToClose(job)}
                                                        disabled={job.status === "Closed"}
                                                    >
                                                        <Ban size={16} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Đóng bài</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {showEditModal && selectedJob && (
                <UpdateJobPostModal
                    open={showEditModal}
                    job={selectedJob}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={fetchJobs}
                />
            )}

            <AlertDialog open={!!jobToClose} onOpenChange={(open) => !open && !isClosing && setJobToClose(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận đóng bài đăng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đóng bài đăng <span className="font-medium text-white">"{jobToClose?.title}"</span>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isClosing}>Bỏ qua</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCloseJob();
                            }}
                            disabled={isClosing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isClosing ? "Đang xử lý..." : "Xác nhận đóng"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default JobPostingList;