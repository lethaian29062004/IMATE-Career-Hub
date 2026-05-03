import { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    getContributedQuestionDetail,
    changeContributedQuestionStatusForStaff
} from '@/services/questionService';
import type { ContributedQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP, DIFFICULTY_LEVEL } from '@/constants/common';
import { toast } from 'react-toastify';

interface ViewPendingContributeQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChanged?: () => void;
}

export function ViewPendingContributeQuestionModal({
    questionId,
    open,
    onOpenChange,
    onStatusChanged
}: ViewPendingContributeQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [questionData, setQuestionData] = useState<ContributedQuestionDetail | null>(null);

    // Track if data has been fetched to prevent duplicate calls
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (open && questionId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }

        // Reset when modal closes
        if (!open) {
            hasFetchedRef.current = false;
        }
    }, [open, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const questionDetail = await getContributedQuestionDetail(questionId);
            setQuestionData(questionDetail);
        } catch (error) {
            console.error('Failed to fetch question data:', error);
            toast.error('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
            onOpenChange(false);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChangeStatus = async (status: boolean) => {
        try {
            setLoadingAction(true);
            await changeContributedQuestionStatusForStaff(questionId, status);
            toast.success(status ? 'Duyệt câu hỏi thành công.' : 'Từ chối câu hỏi thành công.');
            onStatusChanged?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to change question status:', error);
            toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái câu hỏi. Vui lòng thử lại sau.');
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        Chi tiết câu hỏi đóng góp #{questionId}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Xem thông tin chi tiết câu hỏi phỏng vấn được đóng góp.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : questionData ? (
                    <form className="space-y-6">
                        <div className="space-y-6">
                            {/* Question Content */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Nội dung câu hỏi <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={questionData.content || ''}
                                    readOnly
                                    disabled
                                    className="w-full h-32 rounded-lg px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500">
                                    {(questionData.content || '').length}/500 ký tự
                                </p>
                            </div>

                            {/* Sample Answer */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Câu trả lời mẫu <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={questionData.sampleAnswer || ''}
                                    readOnly
                                    disabled
                                    className="w-full h-40 rounded-lg px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500">
                                    {(questionData.sampleAnswer || '').length}/2000 ký tự
                                </p>
                            </div>

                            {/* Difficulty Level */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Cấp độ <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {([DIFFICULTY_LEVEL.EASY, DIFFICULTY_LEVEL.MEDIUM, DIFFICULTY_LEVEL.HARD] as const).map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            disabled
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-not-allowed ${questionData.difficulty === level
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {DIFFICULTY_MAP[level]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Danh mục <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(questionData.categoriesName || []).map((category, idx) => (
                                        <button
                                            key={`${category}-${idx}`}
                                            type="button"
                                            disabled
                                            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-not-allowed border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Positions */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Vị trí <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(questionData.positionsName || []).map((position, idx) => (
                                        <button
                                            key={`${position}-${idx}`}
                                            type="button"
                                            disabled
                                            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-not-allowed border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                        >
                                            {position}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Kỹ năng <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(questionData.skillsName || []).map((skill, idx) => (
                                        <button
                                            key={`${skill}-${idx}`}
                                            type="button"
                                            disabled
                                            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-not-allowed border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleChangeStatus(false)}
                                disabled={loadingData || loadingAction}
                            >
                                {loadingAction ? 'Đang xử lý...' : 'Từ chối'}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => handleChangeStatus(true)}
                                disabled={loadingData || loadingAction}
                            >
                                {loadingAction ? 'Đang xử lý...' : 'Duyệt'}
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loadingAction}
                                >
                                    Đóng
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-12 text-center text-slate-400">
                        Không tìm thấy dữ liệu câu hỏi.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
