import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getContributedQuestionDetail, sortCommentsByTotalVotesDesc } from '@/services/questionService';
import type { ContributedQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP, DIFFICULTY_LEVEL } from '@/constants/common';
import { toast } from 'react-toastify';

interface ViewContributeQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewContributeQuestionModal({
    questionId,
    open,
    onOpenChange
}: ViewContributeQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<ContributedQuestionDetail | null>(null);

    // Track if data has been fetched to prevent duplicate calls
    const hasFetchedRef = useRef(false);

    const sortedComments = useMemo(() => {
        return sortCommentsByTotalVotesDesc(questionData?.comments || []);
    }, [questionData?.comments]);

    const formatCommentDate = (createdAt?: string, updatedAt?: string): string => {
        const isDefaultDate = !createdAt || createdAt.startsWith('0001-01-01');
        const targetDate = isDefaultDate ? updatedAt : createdAt;

        if (!targetDate) return '';
        const parsed = new Date(targetDate);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toLocaleString('vi-VN');
    };

    const isCommentEdited = (createdAt?: string, updatedAt?: string): boolean => {
        if (!createdAt || !updatedAt) return false;
        if (createdAt.startsWith('0001-01-01')) return false;
        return updatedAt !== createdAt;
    };

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

                            {/* Is Active */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Trạng thái <span className="text-red-400">*</span>
                                </label>
                                <button
                                    type="button"
                                    disabled
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${questionData.isActive
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-slate-600 bg-slate-800 text-slate-300'
                                        } cursor-not-allowed opacity-70`}
                                >
                                    {questionData.isActive ? 'Hoạt động' : 'Vô hiệu'}
                                </button>
                            </div>

                            {/* Comments - Read only for staff */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-slate-200">
                                        Bình luận
                                    </label>
                                    <span className="text-xs text-slate-400">
                                        {sortedComments.length} bình luận
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {sortedComments.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400 text-center">
                                            Chưa có bình luận nào.
                                        </div>
                                    ) : (
                                        sortedComments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200">
                                                            {comment.userName || 'Ẩn danh'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {formatCommentDate(comment.createdAt, comment.updatedAt)}
                                                            {isCommentEdited(comment.createdAt, comment.updatedAt) ? ' (đã chỉnh sửa)' : ''}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-violet-400">
                                                        {comment.totalVotes}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-100 whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>

                                                <p className="text-[11px] text-slate-500">
                                                    Up: {comment.upvoteCount} | Down: {comment.downvoteCount}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
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
