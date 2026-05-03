import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    DollarSign,
    Building2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { getListPosition } from "@/services/positionService";
import { getAllSkill } from "@/services/skillService";
import { getCandidateJobList } from "@/services/recruiterService";
import type { CandidateJobItem, CandidateJobListResponse } from "@/types/common/recruiter";


interface FilterState {
    searchTerm: string;
    location: string;
    jobSkillIds: number[];
    jobPositionIds: number[];
}

const ViewJobApplications: React.FC = () => {
    const navigate = useNavigate();

    // Data States
    const [jobs, setJobs] = useState<CandidateJobItem[]>([]);
    const [positions, setPositions] = useState<{ id: number; name: string }[]>([]);
    const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    // UI States
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [jobsPerPage, setJobsPerPage] = useState(10);

    // Filter States
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        location: "",
        jobSkillIds: [],
        jobPositionIds: [],
    });

    // Fetch Filter Options (Skills & Positions)
    useEffect(() => {
        const fetchFilters = async () => {
            setFiltersLoading(true);
            try {
                const [posRes, skillRes] = await Promise.all([
                    getListPosition(1, 100, true, ""),
                    getAllSkill(1, 100, true, "")
                ]);

                if (posRes) setPositions(posRes.items.map(p => ({ id: p.id, name: p.name })));
                if (skillRes) setSkills(skillRes.items.map(s => ({ id: s.id, name: s.name })));
            } catch (error) {
                console.error("Error fetching filters:", error);
                setPositions([]);
                setSkills([]);
            } finally {
                setFiltersLoading(false);
            }
        };
        fetchFilters();
    }, []);

    // Fetch Jobs from API
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = {
                pageNumber: currentPage,
                pageSize: jobsPerPage,
                searchTerm: filters.searchTerm || undefined,
                location: filters.location || undefined,
                jobSkillIds: filters.jobSkillIds.length > 0 ? filters.jobSkillIds : undefined,
                jobPositionIds: filters.jobPositionIds.length > 0 ? filters.jobPositionIds : undefined,
            };

            const response = await getCandidateJobList(queryParams);
            const data = response as CandidateJobListResponse;

            setJobs(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, jobsPerPage]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const togglePosition = (id: number) => {
        setFilters((prev) => ({
            ...prev,
            jobPositionIds: prev.jobPositionIds.includes(id)
                ? prev.jobPositionIds.filter((posId) => posId !== id)
                : [...prev.jobPositionIds, id],
        }));
        setCurrentPage(1);
    };

    const toggleSkill = (id: number) => {
        setFilters((prev) => ({
            ...prev,
            jobSkillIds: prev.jobSkillIds.includes(id)
                ? prev.jobSkillIds.filter((skillId) => skillId !== id)
                : [...prev.jobSkillIds, id],
        }));
        setCurrentPage(1);
    };

    const positionLabel = filters.jobPositionIds.length > 0
        ? `Đã chọn ${filters.jobPositionIds.length}`
        : "Tất cả";
    const skillLabel = filters.jobSkillIds.length > 0
        ? `Đã chọn ${filters.jobSkillIds.length}`
        : "Tất cả";

    return (
        <div className="font-sans min-h-screen bg-[#020617] text-white">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-16">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Khám phá cơ hội nghề nghiệp
                    </h1>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        Tìm kiếm hàng nghìn tin tuyển dụng từ các công ty hàng đầu. Kết nối với nhà tuyển dụng và ứng tuyển ngay hôm nay.
                    </p>
                </div>

                {/* Top Filters */}
                <section className="mb-10">
                    <form
                        onSubmit={handleSearch}
                        className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col gap-4"
                    >
                        <div className="w-full space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm kiếm</label>
                            <div className="flex flex-col lg:flex-row gap-3">
                                <div className="relative group flex-1">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={filters.searchTerm}
                                        onChange={(e) => {
                                            setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                                        placeholder="Tên công việc, skill..."
                                    />
                                </div>
                                <div className="relative group flex-1">
                                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={filters.location}
                                        onChange={(e) => {
                                            setFilters(prev => ({ ...prev, location: e.target.value }));
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                                        placeholder="Thành phố, khu vực..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilters({
                                            searchTerm: "",
                                            location: "",
                                            jobSkillIds: [],
                                            jobPositionIds: [],
                                        });
                                        setCurrentPage(1);
                                    }}
                                    className="px-6 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center text-slate-300"
                                >
                                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="w-full space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vị trí</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none flex items-center justify-between gap-2"
                                            disabled={filtersLoading}
                                        >
                                            <span className="truncate">{filtersLoading && positions.length === 0 ? "Đang tải..." : positionLabel}</span>
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-[--radix-popover-trigger-width] bg-[#11142D] border border-white/10 text-slate-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs uppercase tracking-wider text-slate-400">Chọn vị trí</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilters((prev) => ({ ...prev, jobPositionIds: [] }));
                                                    setCurrentPage(1);
                                                }}
                                                className="text-xs text-slate-400 hover:text-white"
                                            >
                                                Bỏ chọn
                                            </button>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                                            {positions.map((pos) => (
                                                <label key={pos.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                                    <Checkbox
                                                        checked={filters.jobPositionIds.includes(pos.id)}
                                                        onCheckedChange={() => togglePosition(pos.id)}
                                                        className="border-white/20 data-[state=checked]:bg-indigo-500"
                                                    />
                                                    <span>{pos.name}</span>
                                                </label>
                                            ))}
                                            {positions.length === 0 && !filtersLoading && (
                                                <div className="text-xs text-slate-500">Không có dữ liệu</div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="w-full space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kỹ năng</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none flex items-center justify-between gap-2"
                                            disabled={filtersLoading}
                                        >
                                            <span className="truncate">{filtersLoading && skills.length === 0 ? "Đang tải..." : skillLabel}</span>
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-[--radix-popover-trigger-width] bg-[#11142D] border border-white/10 text-slate-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs uppercase tracking-wider text-slate-400">Chọn kỹ năng</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilters((prev) => ({ ...prev, jobSkillIds: [] }));
                                                    setCurrentPage(1);
                                                }}
                                                className="text-xs text-slate-400 hover:text-white"
                                            >
                                                Bỏ chọn
                                            </button>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                                            {skills.map((skill) => (
                                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                                    <Checkbox
                                                        checked={filters.jobSkillIds.includes(skill.id)}
                                                        onCheckedChange={() => toggleSkill(skill.id)}
                                                        className="border-white/20 data-[state=checked]:bg-indigo-500"
                                                    />
                                                    <span>{skill.name}</span>
                                                </label>
                                            ))}
                                            {skills.length === 0 && !filtersLoading && (
                                                <div className="text-xs text-slate-500">Không có dữ liệu</div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Job listing area */}
                <div>
                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="animate-spin text-purple-500" />
                            <p className="text-slate-400 animate-pulse">Đang tải danh sách công việc...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-20 text-center">
                            <Building2 size={60} className="mx-auto text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Không tìm thấy công việc phù hợp</h3>
                            <p className="text-slate-400">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                            <Button
                                variant="ghost"
                                className="text-purple-400 mt-4 hover:bg-purple-500/10"
                                onClick={() => {
                                    setFilters({
                                        searchTerm: "",
                                        location: "",
                                        jobSkillIds: [],
                                        jobPositionIds: [],
                                    });
                                }}
                            >
                                Đặt lại tất cả bộ lọc
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6 px-1">
                                <p className="text-sm text-slate-400">
                                    Hiển thị <span className="text-white font-medium">{jobs.length}</span> công việc
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {jobs.map((job) => (
                                    <div key={job.id} className="rounded-3xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 flex flex-col hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">

                                        {/* Header: Logo + Basic Info */}
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-white/10">
                                                <img
                                                    src={job.companyRecruiter?.companyLogo || "https://api.dicebear.com/7.x/initials/svg?seed=Company"}
                                                    alt={job.companyRecruiter?.companyName || "Company"}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] py-1 px-3 rounded-full">
                                                {job.employmentType}
                                            </Badge>
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-1.5 line-clamp-1 text-slate-100 group-hover:text-purple-400 transition-colors" title={job.title}>
                                                {job.title}
                                            </h3>
                                            <p className="text-purple-400 text-sm font-semibold mb-4 flex items-center gap-2">
                                                <Building2 size={16} /> {job.companyRecruiter?.companyName || "Công ty chưa xác định"}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                                <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1.5 px-3 rounded-lg bg-[#0F1333]">
                                                    <MapPin size={14} className="text-slate-500" />
                                                    <span className="truncate">{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <DollarSign size={14} className="shrink-0" />
                                                    <span>${job.minSalary.toLocaleString('en-US')} VNĐ - ${job.maxSalary.toLocaleString('en-US')} VNĐ</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {job.jobSkills.slice(0, 4).map((skill) => (
                                                    <span key={skill.id} className="bg-[#0F1333] text-slate-300 px-2.5 py-1 rounded-md text-[11px] border border-white/5 transition-colors hover:border-purple-500/30">
                                                        {skill.skillName}
                                                    </span>
                                                ))}
                                                {job.jobPositions.map((pos) => (
                                                    <span key={pos.id} className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md text-[11px] border border-indigo-500/20">
                                                        {pos.positionName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            onClick={() => navigate(`/view-job-applications/${job.id}`)}
                                            className="w-full h-11 rounded-xl bg-slate-800/50 hover:bg-purple-600 transition-all text-sm font-bold border border-white/5 group-hover:border-purple-500/50 cursor-pointer"
                                        >
                                            Xem chi tiết công việc
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination - Matching JobPostingList (Table) Style */}
                            <div className="flex items-center justify-between border-t border-white/10 bg-[#11142D]/40 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm">
                                {/* Result Info */}
                                <div className="text-sm text-slate-400">
                                    {totalCount === 0 ? (
                                        <span>Không có kết quả</span>
                                    ) : (
                                        <>
                                            Hiển thị{" "}
                                            <span className="font-semibold text-slate-200">
                                                {(currentPage - 1) * jobsPerPage + 1}
                                            </span>
                                            {" - "}
                                            <span className="font-semibold text-slate-200">
                                                {Math.min(currentPage * jobsPerPage, totalCount)}
                                            </span>
                                            {" của "}
                                            <span className="font-semibold text-slate-200">
                                                {totalCount}
                                            </span>{" "}
                                            kết quả
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Page Size Selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Số lượng:</span>
                                        <select
                                            value={jobsPerPage}
                                            onChange={(e) => {
                                                setJobsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
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
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(1)}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronsLeft size={18} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronLeft size={18} />
                                        </Button>

                                        {/* Page Numbers Window */}
                                        <div className="flex items-center gap-1.5 px-2">
                                            {(() => {
                                                const pages = [];
                                                let startPage = Math.max(1, currentPage - 2);
                                                let endPage = Math.min(totalPages, currentPage + 2);

                                                if (currentPage <= 3) endPage = Math.min(5, totalPages);
                                                if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <Button
                                                            key={i}
                                                            size="sm"
                                                            variant={i === currentPage ? "primary" : "ghost"}
                                                            onClick={() => setCurrentPage(i)}
                                                            className={`h-9 min-w-[36px] rounded-xl font-bold transition-all duration-300 ${i === currentPage
                                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-600/20"
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
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <ChevronRight size={18} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
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

export default ViewJobApplications;
