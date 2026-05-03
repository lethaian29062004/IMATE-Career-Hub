import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileText,
    CheckCircle2,
    X,
    Briefcase,
    Search,
    Loader2,
    AlertCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { getListCV, uploadCV } from "@/services/cvService";
import { createJobApplication } from "@/services/recruiterService";
import { MSG50, MSG51 } from "@/constants/messages";
import type { CvItem } from "@/types/common/cv";

interface CandidateApplyJobCvDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobTitle: string;
    jobId: number;
}

const CandidateApplyJobCvDialog: React.FC<CandidateApplyJobCvDialogProps> = ({
    open,
    onOpenChange,
    jobTitle,
    jobId
}) => {
    const [cvList, setCvList] = useState<CvItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mode, setMode] = useState<"select" | "upload">("select");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (open) {
            fetchCVs();
        } else {
            // Reset state when dialog closes
            setSelectedCvId(null);
            setUploadedFile(null);
            setPreviewUrl(null);
            setMode("select");
            setShowConfirmDialog(false);
        }
    }, [open]);

    const fetchCVs = async () => {
        try {
            setIsLoading(true);
            const data = await getListCV();
            setCvList(data);
        } catch (error) {
            console.error("Failed to fetch CVs:", error);
            toast.error("Không thể tải danh sách CV.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (mode === "select" && !selectedCvId) {
            toast.warning("Vui lòng chọn một CV từ hồ sơ của bạn.");
            return;
        }
        if (mode === "upload" && !uploadedFile) {
            toast.warning("Vui lòng tải lên một CV mới.");
            return;
        }

        setShowConfirmDialog(true);
    };

    const confirmApply = async () => {
        try {
            setIsApplying(true);
            let applyCvId: number;

            if (mode === "upload" && uploadedFile) {
                // Call uploadCV if a new file is provided
                const newCv = await uploadCV(uploadedFile);
                applyCvId = newCv.cvId;
                console.log("CVID: ", applyCvId);
            } else {
                applyCvId = Number(selectedCvId);
            }

            // Call createJobApplication API
            await createJobApplication({
                JobId: jobId,
                CVId: applyCvId
            });

            toast.success(MSG50);
            onOpenChange(false);
            setShowConfirmDialog(false);
        } catch (error: any) {
            console.error("Failed to apply:", error);
            // Handle backend error messages if available (e.g. from axios response)
            const errorMsg = error.response?.data?.message || error.message || MSG51;
            toast.error(errorMsg);
        } finally {
            setIsApplying(false);
        }
    };

    const handleUnselect = () => {
        setSelectedCvId(null);
        setUploadedFile(null);
        setPreviewUrl(null);
        setMode("select");
        // Reset file input value
        const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMode("upload");
            setSelectedCvId(null);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl border border-white/10 bg-[#11142D] text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl rounded-3xl p-8">
                    <DialogHeader className="mb-6 overflow-hidden">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Briefcase className="text-purple-400" size={20} />
                            </div>
                            <span className="truncate">Ứng tuyển công việc</span>
                        </DialogTitle>
                        <p className="text-slate-400 text-sm mt-2 truncate">
                            Vị trí hiện tại: <span className="text-purple-400 font-semibold">{jobTitle}</span>
                        </p>
                    </DialogHeader>

                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Top Section: Inputs Side-by-Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-3 min-w-0">
                                <Label className="text-slate-400 text-sm flex items-center gap-2">
                                    <Search size={14} /> Chọn CV từ hồ sơ
                                </Label>
                                <Select
                                    value={selectedCvId || ""}
                                    onValueChange={(val) => {
                                        setSelectedCvId(val);
                                        setMode("select");
                                        setUploadedFile(null);
                                        const cv = cvList.find(c => c.cvId === val);
                                        if (cv && cv.fileUrl) setPreviewUrl(cv.fileUrl);
                                    }}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full !h-12 bg-[#0F1333] border border-white/10 rounded-xl focus:ring-purple-500/20 hover:border-white/20 transition-all text-slate-200 cursor-pointer overflow-hidden px-4">
                                        <div className="flex items-center gap-2 truncate">
                                            {isLoading && <Loader2 size={16} className="animate-spin text-purple-400 shrink-0" />}
                                            <SelectValue placeholder={isLoading ? "Đang tải CV..." : "Chọn CV hiện có"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#11142D] border-white/10 text-white shadow-2xl rounded-xl max-h-60">
                                        {cvList.length > 0 ? (
                                            cvList.map((cv) => (
                                                <SelectItem key={cv.cvId} value={cv.cvId} className="focus:bg-purple-500/10 focus:text-purple-400 rounded-lg cursor-pointer">
                                                    {cv.fileName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="py-2 px-4 text-xs text-slate-500">
                                                {isLoading ? "Đang tải danh sách..." : "Chưa có CV nào trong hồ sơ"}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 min-w-0">
                                <Label className="text-slate-400 text-sm flex items-center gap-2">
                                    <Upload size={14} /> Tải lên CV mới
                                </Label>
                                <div className="relative h-12">
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="cv-upload"
                                    />
                                    <label
                                        htmlFor="cv-upload"
                                        className="flex items-center justify-center w-full h-full bg-[#0F1333] border border-dashed border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-slate-400 text-sm font-medium cursor-pointer px-4 text-center truncate"
                                    >
                                        {uploadedFile ? "Thay đổi CV" : "Chọn tệp tin (PDF, DOCX)"}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Selection Info & Preview */}
                        <div className="space-y-4">
                            <div className="bg-[#0F1333] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group max-w-full">
                                {/* Background Decor */}
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />

                                {(selectedCvId || uploadedFile) ? (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-all shadow-inner shrink-0">
                                            <FileText size={24} className="text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-100 text-base mb-1 truncate" title={mode === "select" ? cvList.find(cv => cv.cvId === selectedCvId)?.fileName : uploadedFile?.name}>
                                                {mode === "select"
                                                    ? cvList.find(cv => cv.cvId === selectedCvId)?.fileName
                                                    : uploadedFile?.name}
                                            </p>
                                            <p className="text-slate-500 text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold truncate">
                                                {mode === "select" ? (
                                                    <>Đã chọn từ hồ sơ <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /></>
                                                ) : (
                                                    <>Mới tải lên <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /></>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUnselect();
                                            }}
                                            className="h-10 w-10 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer shrink-0 transition-all z-20"
                                        >
                                            <X size={18} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 opacity-30">
                                        <FileText size={32} className="mx-auto mb-2 text-slate-500" />
                                        <p className="text-xs font-medium">Chưa chọn nội dung hiển thị</p>
                                    </div>
                                )}
                            </div>

                            {/* CV Preview Area */}
                            {previewUrl && (
                                <div className="w-full bg-[#0F1333] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Xem trước CV</span>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <iframe
                                            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                            className="w-full h-full border-none"
                                            title="CV Preview"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5 text-slate-400 font-semibold cursor-pointer"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold shadow-lg shadow-indigo-600/20 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                            Ứng Tuyển
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="max-w-md border border-white/10 bg-[#11142D] text-white shadow-2xl rounded-3xl p-8">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <AlertCircle className="text-yellow-500" size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Xác nhận ứng tuyển</DialogTitle>
                        <p className="text-slate-400 text-sm break-words w-full">
                            Bạn có chắc chắn muốn ứng tuyển vào vị trí <span className="text-purple-400 font-semibold break-words">{jobTitle}</span> với CV này không?
                        </p>
                    </DialogHeader>

                    <div className="bg-[#0F1333] border border-white/5 rounded-2xl p-4 flex items-center gap-4 mt-2 w-full overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                            <FileText size={20} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-100 truncate" title={mode === "select" ? cvList.find(cv => cv.cvId === selectedCvId)?.fileName : uploadedFile?.name}>
                                {mode === "select"
                                    ? cvList.find(cv => cv.cvId === selectedCvId)?.fileName
                                    : uploadedFile?.name}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                                {mode === "select" ? "Chọn từ hồ sơ" : "CV mới tải lên"}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5 text-slate-400 font-semibold cursor-pointer"
                            disabled={isApplying}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            onClick={confirmApply}
                            disabled={isApplying}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold shadow-lg shadow-indigo-600/20 cursor-pointer h-12"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CandidateApplyJobCvDialog;
