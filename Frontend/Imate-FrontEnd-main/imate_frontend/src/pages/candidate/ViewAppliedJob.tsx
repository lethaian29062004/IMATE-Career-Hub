import React, { useState, useEffect } from "react";
import {
    Search,
    MapPin,
    DollarSign,
    Building2,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle2,
    XCircle,
    // ...existing code...
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCandidateAppliedJobs } from "@/services/recruiterService";
import type { AppliedJobCandidateResponse } from "@/types/common/candidate";

type ApplicationStatus = "Waiting" | "Approved" | "Rejected";

const ViewAppliedJob: React.FC = () => {
    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");


    // Pagination States
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Data States
    const [data, setData] = useState<AppliedJobCandidateResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber,
                pageSize,
                ...(searchTerm && { searchTerm }),
                ...(statusFilter !== "All" && { status: statusFilter })
            };
            const response = await getCandidateAppliedJobs(params);
            setData({
                pageNumber: response.pageNumber,
                totalPages: response.totalPages,
                totalCount: response.totalCount,
                items: response.items,
            });
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [pageNumber, pageSize, searchTerm, statusFilter]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setPageNumber(1);
    };

    // Helper for Status UI
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Waiting":
                return { label: "Chờ duyệt", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Clock };
            case "Approved":
                return { label: "Trúng tuyển", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle2 };
            case "Rejected":
                return { label: "Từ chối", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: XCircle };
            default:
                return { label: "Không xác định", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: Clock };
        }
    };

    const allStatuses: { value: ApplicationStatus | "All", label: string }[] = [
        { value: "All", label: "Tất cả trạng thái" },
        { value: "Waiting", label: "Chờ duyệt" },
        { value: "Approved", label: "Trúng tuyển" },
        { value: "Rejected", label: "Từ chối" }
    ];

    return (
        <div className="font-sans min-h-screen bg-[#020617] text-white">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-16">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Công việc đã ứng tuyển
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Theo dõi trạng thái các hồ sơ bạn đã nộp và xem thông báo từ nhà tuyển dụng.
                    </p>
                </div>
                {/* Top Filters */}
                <section className="mb-10">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col gap-4"
                    >
                        <div className="w-full space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm kiếm</label>
                            <div className="flex flex-col lg:flex-row gap-3">
                                <div className="relative group flex-1">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tên công việc, công ty..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPageNumber(1);
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                                    />
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

                        <div className="w-full space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Trạng thái hồ sơ</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                {allStatuses.map(status => (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(status.value as ApplicationStatus | "All");
                                            setPageNumber(1);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${statusFilter === status.value
                                            ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 font-semibold"
                                            : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <span>{status.label}</span>
                                        {status.value !== "All" && (
                                            <Badge className={`${getStatusConfig(status.value as ApplicationStatus).bg} ${getStatusConfig(status.value as ApplicationStatus).color} border-none w-2 h-2 rounded-full p-0`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </form>
                </section>

                {/* Job listing area */}
                <div>
                    {loading ? (
                        <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-20 text-center flex flex-col items-center justify-center">
                            <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
                            <h3 className="text-xl font-bold mb-2">Đang tải dữ liệu...</h3>
                        </div>
                    ) : !data || data.items.length === 0 ? (
                        <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-20 text-center">
                            <Briefcase size={60} className="mx-auto text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Không tìm thấy hồ sơ ứng tuyển</h3>
                            <p className="text-slate-400">Hãy thử thay đổi điều kiện lọc hoặc quay lại danh sách việc làm để tìm cơ hội mới.</p>
                            <Button
                                variant="ghost"
                                className="text-purple-400 mt-4 hover:bg-purple-500/10"
                                onClick={handleResetFilters}
                            >
                                Hiển thị tất cả
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6 px-1">
                                <p className="text-sm text-slate-400">
                                    Đã tìm thấy <span className="text-white font-medium">{data.totalCount}</span> hồ sơ ứng tuyển
                                </p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {data.items.map((job) => {
                                    const StatusIcon = getStatusConfig(job.status).icon;
                                    return (
                                        <div key={job.id} className="rounded-3xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-6 hover:border-indigo-500/40 transition-all duration-300 relative group">
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                {/* Company Logo */}
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-white/10">
                                                    <img
                                                        src={job.companyLogo}
                                                        alt={job.companyName}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>

                                                {/* Job & Company Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-xl line-clamp-1 text-slate-100 group-hover:text-purple-400 transition-colors" title={job.title}>
                                                                    {job.title}
                                                                </h3>
                                                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] py-0.5 px-2.5 rounded-full shrink-0">
                                                                    {job.employmentType}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-slate-300 text-sm font-medium mt-1 flex items-center gap-2">
                                                                <Building2 size={16} className="text-purple-400" /> {job.companyName}
                                                            </p>
                                                        </div>

                                                        {/* Status Badge */}
                                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getStatusConfig(job.status).bg} ${getStatusConfig(job.status).border} shrink-0`}>
                                                            <StatusIcon size={14} className={getStatusConfig(job.status).color} />
                                                            <span className={`text-xs font-bold uppercase tracking-wider ${getStatusConfig(job.status).color}`}>
                                                                {getStatusConfig(job.status).label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4 bg-[#0F1333] p-3 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={14} className="text-slate-500" />
                                                            <span>Nộp ngày: <span className="text-slate-200">{new Date(job.appliedDate).toLocaleDateString("vi-VN")}</span></span>
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-slate-500" />
                                                            <span>{job.location}</span>
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                                                        <div className="flex items-center gap-1.5 text-emerald-400">
                                                            <DollarSign size={14} />
                                                            <span className="font-semibold">${job.minSalary} - ${job.maxSalary}</span>
                                                        </div>
                                                    </div>

                                                    {/* Feedback Section (if any) */}
                                                    {job.feedback && (
                                                        <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex gap-3 items-start">
                                                            <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <Briefcase size={12} className="text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-purple-300 mb-1 font-semibold uppercase tracking-wider">Phản hồi từ nhà tuyển dụng</p>
                                                                <p className="text-sm text-slate-300 italic">{job.feedback}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col xl:flex-row items-center justify-between border-t border-white/10 bg-[#11142D]/40 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm gap-4">
                                {/* Result Info */}
                                <div className="text-sm text-slate-400">
                                    Hiển thị{" "}
                                    <span className="font-semibold text-slate-200">
                                        {data.totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}
                                    </span>
                                    {" - "}
                                    <span className="font-semibold text-slate-200">
                                        {Math.min(pageNumber * pageSize, data.totalCount)}
                                    </span>
                                    {" của "}
                                    <span className="font-semibold text-slate-200">
                                        {data.totalCount}
                                    </span>{" "}
                                    kết quả
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Page Size Selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Số lượng:</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setPageNumber(1);
                                            }}
                                            className="bg-[#0F1333] border border-white/10 text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={pageNumber === 1}
                                            onClick={() => setPageNumber(1)}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronsLeft size={18} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={pageNumber === 1}
                                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronLeft size={18} />
                                        </Button>

                                        {/* Page Numbers Window */}
                                        <div className="flex items-center gap-1.5 px-2">
                                            {(() => {
                                                const pages = [];
                                                let startPage = Math.max(1, pageNumber - 2);
                                                let endPage = Math.min(data.totalPages, pageNumber + 2);

                                                if (pageNumber <= 3) endPage = Math.min(5, data.totalPages);
                                                if (pageNumber >= data.totalPages - 2) startPage = Math.max(1, data.totalPages - 4);

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <Button
                                                            key={i}
                                                            size="sm"
                                                            variant={i === pageNumber ? "default" : "ghost"}
                                                            onClick={() => setPageNumber(i)}
                                                            className={`h-9 min-w-[36px] rounded-xl font-bold transition-all duration-300 ${i === pageNumber
                                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-600/20 text-white"
                                                                : "hover:bg-purple-600/20 text-slate-400"
                                                                } cursor-pointer`}
                                                        >
                                                            {i}
                                                        </Button>
                                                    );
                                                }
                                                return pages;
                                            })()}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={pageNumber === data.totalPages || data.totalPages === 0}
                                            onClick={() => setPageNumber(prev => Math.min(data.totalPages, prev + 1))}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronRight size={18} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={pageNumber === data.totalPages || data.totalPages === 0}
                                            onClick={() => setPageNumber(data.totalPages)}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronsRight size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAppliedJob;
