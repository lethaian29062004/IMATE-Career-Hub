import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CandidateApplyJobCvDialog from "@/pages/dialog/CandidateApplyJobCvDialog";
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    DollarSign,
    Calendar,
    Globe,
    Phone,
    MapPinned,
    ExternalLink,
    CheckCircle2,
    Users,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJobDetails } from "@/services/recruiterService";
import type { CandidateJobItem } from "@/types/common/recruiter";


const ViewJobApplicationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [job, setJob] = useState<CandidateJobItem | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchJobDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getJobDetails(Number(id));
                // response structure is expected to be { data: CandidateJobItem }
                if (response?.data) {
                    setJob(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch job details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [id]);


    if (loading) {
        return (
            <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Đang tải thông tin công việc...</p>
            </div>
        );
    }

    if (!job) {

        return (
            <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white p-6">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy công việc</h2>
                <Button onClick={() => navigate("/view-job-applications")}>Quay lại danh sách</Button>
            </div>
        );
    }

    const generateInterviewPrefill = () => {
        const parts = [job.jobDescription];

        if (job.jobSkills && job.jobSkills.length > 0) {
            parts.push(
                "=== KỸ NĂNG YÊU CẦU ===\n" +
                job.jobSkills.map(skill => `- ${skill.skillName}`).join('\n')
            );
        }

        if (job.jobPositions && job.jobPositions.length > 0) {
            parts.push(
                "=== VỊ TRÍ TƯƠNG ỨNG ===\n" +
                job.jobPositions.map(pos => `- ${pos.positionName}`).join('\n')
            );
        }

        return parts.join('\n\n');
    };

    return (

        <div className="min-h-screen bg-[#050816] text-white p-6 md:p-10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/5 blur-[110px] rounded-full" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/view-job-applications")}
                    className="mb-8 p-0 hover:bg-transparent text-slate-400 hover:text-white flex items-center gap-2 group transition-colors cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10">
                        <ArrowLeft size={16} />
                    </div>
                    <span>Quay lại danh sách</span>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Job Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Title & Summary Card */}
                        <div className="bg-[#11142D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                                        <div className="flex items-center gap-2 bg-[#0F1333] px-3 py-1.5 rounded-lg border border-white/5">
                                            <Briefcase size={16} className="text-purple-400" />
                                            <span>{job.employmentType}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-[#0F1333] px-3 py-1.5 rounded-lg border border-white/5">
                                            <MapPin size={16} className="text-emerald-400" />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-[#0F1333] px-3 py-1.5 rounded-lg border border-white/5 text-emerald-400 font-semibold">
                                            <DollarSign size={16} />
                                            <span>${job.minSalary.toLocaleString('en-US')} VNĐ - ${job.maxSalary.toLocaleString('en-US')} VNĐ / tháng</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                                    <Button
                                        onClick={() => setIsApplyDialogOpen(true)}
                                        variant="primary"
                                    >
                                        Ứng tuyển ngay
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            navigate("/interview-setup", {
                                                state: { prefillJd: generateInterviewPrefill() },
                                            })
                                        }
                                        variant="secondary"
                                    >
                                        Tập phỏng vấn cùng AI
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Job Description Card */}
                        <div className="bg-[#11142D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-purple-500 rounded-full" />
                                Chi tiết công việc
                            </h2>
                            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {job.jobDescription.split('###').map((section, idx) => {
                                    if (!section.trim()) return null;
                                    const lines = section.trim().split('\n');
                                    const title = lines[0];
                                    const content = lines.slice(1).join('\n');
                                    return (
                                        <div key={idx} className="mb-8">
                                            <h3 className="text-xl font-bold text-purple-400 mb-4">{title}</h3>
                                            <div className="space-y-3">
                                                {content.split('-').map((line, lIdx) => {
                                                    if (!line.trim()) return null;
                                                    if (idx === 0) return <p key={lIdx}>{line}</p>;
                                                    return (
                                                        <div key={lIdx} className="flex gap-3 items-start">
                                                            <CheckCircle2 size={18} className="text-emerald-500 mt-1 shrink-0" />
                                                            <span>{line.trim()}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Skills & Positions Card */}
                        <div className="bg-[#11142D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                                Kỹ năng & Vị trí
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Yêu cầu kỹ năng</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.jobSkills.map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-[#0F1333] text-slate-300 border-white/5 py-1.5 px-4 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 transition-all cursor-default">
                                                {skill.skillName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Vị trí tương ứng</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.jobPositions.map((pos, idx) => (
                                            <Badge key={idx} className="bg-indigo-500/10 text-indigo-400 border-none py-1.5 px-4 rounded-xl">
                                                {pos.positionName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Company Info */}
                    <div className="space-y-8">
                        <div className="bg-[#11142D] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm sticky top-10">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-white p-2 mx-auto mb-4 overflow-hidden shadow-inner flex items-center justify-center">
                                    <img src={job.companyRecruiter.companyLogo} alt={job.companyRecruiter.companyName} className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                    {job.companyRecruiter.companyName}
                                </h2>
                                {job.companyRecruiter.website ? (
                                    <a
                                        href={
                                            job.companyRecruiter.website.startsWith("http")
                                                ? job.companyRecruiter.website
                                                : `https://${job.companyRecruiter.website}`
                                        }
                                        target="_blank"
                                        className="text-purple-400 text-sm hover:underline inline-flex items-center gap-1"
                                    >
                                        {job.companyRecruiter.website.replace('https://', '').replace('http://', '')} <ExternalLink size={12} />
                                    </a>
                                ) : (
                                    <span className="text-slate-500 text-sm italic">website: N/A</span>
                                )}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0F1333] flex items-center justify-center shrink-0 border border-white/5">
                                        <Users size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Quy mô</p>
                                        <p className="text-sm text-slate-200">
                                            {job.companyRecruiter.companySize ? `${job.companyRecruiter.companySize} nhân viên` : "Đang cập nhật"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0F1333] flex items-center justify-center shrink-0 border border-white/5">
                                        <Phone size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Điện thoại</p>
                                        <p className="text-sm text-slate-200">{job.companyRecruiter.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0F1333] flex items-center justify-center shrink-0 border border-white/5">
                                        <MapPinned size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Địa chỉ</p>
                                        <p className="text-sm text-slate-200">{job.companyRecruiter.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0F1333] flex items-center justify-center shrink-0 border border-white/5">
                                        <Calendar size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Hạn ứng tuyển</p>
                                        <p className="text-sm text-emerald-400 font-semibold">
                                            {new Date(job.applicationDeadline).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-8 text-sm text-slate-400 leading-relaxed italic border-t border-white/5 pt-6">
                                "{job.companyRecruiter.industry}"
                            </p>

                            {job.companyRecruiter.website && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-8 border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-11 cursor-pointer"
                                    onClick={() => window.open(job.companyRecruiter.website, '_blank')}
                                >
                                    <Globe size={16} /> Xem trang công ty
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CandidateApplyJobCvDialog
                open={isApplyDialogOpen}
                onOpenChange={setIsApplyDialogOpen}
                jobTitle={job.title}
                jobId={job.id}
            />
        </div>
    );
};

export default ViewJobApplicationDetail;
