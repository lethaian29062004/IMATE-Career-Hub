import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertTriangle,
    ArrowBigDown,
    ArrowBigUp,
    Bookmark,
    Eye,
    EyeOff,
    Save,
    Send,
    X
} from 'lucide-react';
import {
    createComment,
    deleteComment,
    getSystemQuestionDetail,
    sortCommentsByTotalVotesDesc,
    updateComment,
    voteComment,
} from '@/services/questionService';
import type { CommentItem, SystemQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP } from '@/constants/common';
import { ROLES } from '@/constants/role';
import { toast } from 'react-toastify';
import { StatusBadge } from '@/components/ui/status-badge';
import { ReportCommentDialog } from '../reportApplication/ReportCommentDialog';

type VoteType = 'upvote' | 'downvote' | null;

const getInitialVoteType = (comment: CommentItem): VoteType => {
    if (comment.currentUserVoteType === 'upvote' || comment.currentUserVoteType === 'downvote') {
        return comment.currentUserVoteType;
    }
    if (comment.currentUserVoteIsUpvote === true) return 'upvote';
    if (comment.currentUserVoteIsUpvote === false) return 'downvote';
    return null;
};

const formatCommentDate = (value?: string): string => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    if (parsed.getFullYear() <= 1) return '';
    return parsed.toLocaleString('vi-VN');
};

interface ViewSystemQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSaved?: boolean;
    onSaveToggle?: () => void;
}

export function ViewSystemQuestionModal({
    questionId,
    open,
    onOpenChange,
    isSaved = false,
    onSaveToggle,
}: ViewSystemQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<SystemQuestionDetail | null>(null);
    const [isSampleAnswerVisible, setIsSampleAnswerVisible] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);
    const [votingCommentId, setVotingCommentId] = useState<number | null>(null);
    const [localVoteByCommentId, setLocalVoteByCommentId] = useState<Record<number, VoteType>>({});
    const [pendingCommentIds, setPendingCommentIds] = useState<Record<number, true>>({});

    // Report Dialog States
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [selectedCommentIdForReport, setSelectedCommentIdForReport] = useState<number | null>(null);

    const hasFetchedRef = useRef(false);

    const currentUser = useMemo(() => {
        try {
            const userRaw = localStorage.getItem('user');
            return userRaw ? JSON.parse(userRaw) : null;
        } catch {
            return null;
        }
    }, []);

    const currentUserId = currentUser?.id !== undefined && currentUser?.id !== null
        ? String(currentUser.id)
        : null;

    const isLoggedIn = Boolean(localStorage.getItem('authToken') && currentUserId);
    const isCandidate = isLoggedIn && currentUser?.role === ROLES.CANDIDATE;

    const sortedComments = useMemo(() => {
        return sortCommentsByTotalVotesDesc(questionData?.comments || []);
    }, [questionData?.comments]);

    useEffect(() => {
        if (open && questionId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }

        if (!open) {
            hasFetchedRef.current = false;
            setQuestionData(null);
            setIsSampleAnswerVisible(false);
            setEditingCommentId(null);
            setEditingCommentContent('');
            setNewCommentContent('');
            setCommentToDeleteId(null);
            setLocalVoteByCommentId({});
            setPendingCommentIds({});
            setIsReportDialogOpen(false);
            setSelectedCommentIdForReport(null);
        }
    }, [open, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const questionDetail = await getSystemQuestionDetail(questionId);
            setQuestionData(questionDetail);

            const nextVoteMap: Record<number, VoteType> = {};
            (questionDetail.comments || []).forEach((comment) => {
                nextVoteMap[comment.id] = getInitialVoteType(comment);
            });
            setLocalVoteByCommentId(nextVoteMap);
        } catch (error) {
            console.error('Failed to fetch question data:', error);
            toast.error('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
            onOpenChange(false);
        } finally {
            setLoadingData(false);
        }
    };

    const getDifficultyStatus = (difficulty: number | null): "active" | "pending" | "error" | "inactive" | "draft" => {
        if (difficulty === 0) return 'active';
        if (difficulty === 1) return 'pending';
        if (difficulty === 2) return 'error';
        return 'inactive';
    };

    const isOwnComment = (commentUserId: string | number): boolean => {
        if (!currentUserId) return false;
        return String(commentUserId) === currentUserId;
    };

    const handleCreateComment = async () => {
        if (!isCandidate) {
            toast.info('Chức năng bình luận chỉ dành cho ứng viên.');
            return;
        }

        const content = newCommentContent.trim();
        if (!content) {
            toast.warning('Vui lòng nhập nội dung bình luận.');
            return;
        }

        const temporaryCommentId = -Date.now();
        const temporaryComment: CommentItem = {
            id: temporaryCommentId,
            userId: currentUser?.id ?? '',
            userName: currentUser?.name || currentUser?.fullName || currentUser?.userName || 'Bạn',
            userAvatarUrl: currentUser?.avatar || currentUser?.avatarUrl || '',
            userRole: currentUser?.role || '',
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvoteCount: 0,
            downvoteCount: 0,
            totalVotes: 0,
            currentUserVoteType: null,
        };

        setQuestionData((prev) => {
            if (!prev) return prev;
            const nextComments = [...(prev.comments || []), temporaryComment];
            return { ...prev, comments: nextComments };
        });
        setPendingCommentIds((prev) => ({ ...prev, [temporaryCommentId]: true }));
        setLocalVoteByCommentId((prev) => ({ ...prev, [temporaryCommentId]: null }));
        setNewCommentContent('');

        try {
            setIsCreatingComment(true);
            await createComment(questionId, content);
            await fetchData();
            toast.success('Bình luận đã được gửi và đã cập nhật danh sách mới nhất.');
        } catch (error) {
            console.error('Failed to create comment:', error);
            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).filter((comment) => comment.id !== temporaryCommentId),
                };
            });
            setLocalVoteByCommentId((prev) => {
                const next = { ...prev };
                delete next[temporaryCommentId];
                return next;
            });
            toast.error('Không thể tạo bình luận. Vui lòng thử lại.');
        } finally {
            setPendingCommentIds((prev) => {
                const next = { ...prev };
                delete next[temporaryCommentId];
                return next;
            });
            setIsCreatingComment(false);
        }
    };

    const handleStartEditComment = (comment: CommentItem) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content || '');
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const handleSaveEditComment = async (commentId: number) => {
        if (!isCandidate) {
            toast.info('Chức năng chỉnh sửa bình luận chỉ dành cho ứng viên.');
            return;
        }

        const content = editingCommentContent.trim();
        if (!content) {
            toast.warning('Nội dung bình luận không được để trống.');
            return;
        }

        try {
            setIsSavingEdit(true);
            await updateComment(commentId, content);

            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).map((comment) =>
                        comment.id === commentId
                            ? { ...comment, content, updatedAt: new Date().toISOString() }
                            : comment
                    ),
                };
            });

            setEditingCommentId(null);
            setEditingCommentContent('');
            toast.success('Đã cập nhật bình luận.');
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Không thể cập nhật bình luận. Vui lòng thử lại.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!isCandidate) {
            toast.info('Chức năng xoá bình luận chỉ dành cho ứng viên.');
            return;
        }

        try {
            setDeletingCommentId(commentId);
            await deleteComment(commentId);

            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).filter((comment) => comment.id !== commentId),
                };
            });

            setLocalVoteByCommentId((prev) => {
                const next = { ...prev };
                delete next[commentId];
                return next;
            });

            if (editingCommentId === commentId) handleCancelEditComment();

            toast.success('Đã xoá bình luận.');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Không thể xoá bình luận. Vui lòng thử lại.');
        } finally {
            setDeletingCommentId(null);
            setCommentToDeleteId(null);
        }
    };

    const handleVoteComment = async (comment: CommentItem, isUpvote: boolean) => {
        if (!isCandidate) {
            toast.info('Chức năng vote bình luận chỉ dành cho ứng viên.');
            return;
        }

        const requestedVote: VoteType = isUpvote ? 'upvote' : 'downvote';
        const previousVote = localVoteByCommentId[comment.id] ?? getInitialVoteType(comment);
        const nextVote: VoteType = previousVote === requestedVote ? null : requestedVote;

        try {
            setVotingCommentId(comment.id);
            await voteComment(comment.id, isUpvote);

            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).map((item) => {
                        if (item.id !== comment.id) return item;

                        let nextUpvoteCount = item.upvoteCount;
                        let nextDownvoteCount = item.downvoteCount;

                        if (previousVote === 'upvote') nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
                        if (previousVote === 'downvote') nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);

                        if (nextVote === 'upvote') nextUpvoteCount += 1;
                        if (nextVote === 'downvote') nextDownvoteCount += 1;

                        return {
                            ...item,
                            upvoteCount: nextUpvoteCount,
                            downvoteCount: nextDownvoteCount,
                            totalVotes: nextUpvoteCount - nextDownvoteCount,
                            currentUserVoteIsUpvote: nextVote === 'upvote' ? true : nextVote === 'downvote' ? false : null,
                            currentUserVoteType: nextVote,
                        };
                    }),
                };
            });

            setLocalVoteByCommentId((prev) => ({ ...prev, [comment.id]: nextVote }));
        } catch (error) {
            console.error('Failed to vote comment:', error);
            toast.error('Không thể vote bình luận. Vui lòng thử lại.');
        } finally {
            setVotingCommentId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                    <DialogHeader className="flex-1">
                        <DialogTitle className="text-xl font-semibold text-white">
                            Chi tiết câu hỏi hệ thống #{questionId}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Xem thông tin chi tiết câu hỏi phỏng vấn từ hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    {onSaveToggle && (
                        <button
                            onClick={onSaveToggle}
                            className={`p-2 rounded-lg transition-colors mt-1 ${isSaved ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'
                                }`}
                            title={isSaved ? 'Bỏ lưu' : 'Lưu câu hỏi'}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>

                {loadingData ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : questionData ? (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Nguồn
                                    </label>
                                    <StatusBadge status="draft">Hệ thống</StatusBadge>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Trạng thái
                                    </label>
                                    <StatusBadge status={questionData.isActive ? "active" : "inactive"}>
                                        {questionData.isActive ? "Hoạt động" : "Vô hiệu"}
                                    </StatusBadge>
                                </div>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-200">Nội dung câu hỏi</label>
                            <div className="w-full min-h-32 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
                                {questionData.content || 'Không có nội dung'}
                            </div>
                        </div>

                        {/* Sample Answer */}
                        {questionData.sampleAnswer && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">Câu trả lời mẫu</label>
                                <div className="relative w-full min-h-40 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-sm">
                                    {isSampleAnswerVisible ? (
                                        <>
                                            <div className="text-slate-100 whitespace-pre-wrap">
                                                {questionData.sampleAnswer}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsSampleAnswerVisible(false)}
                                                className="absolute top-3 right-3 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-slate-100 transition-colors"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                Ẩn
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsSampleAnswerVisible(true)}
                                            className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-100 transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Hiện câu trả lời
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-200">Độ khó</label>
                            <div>
                                <StatusBadge status={getDifficultyStatus(questionData.difficulty)}>
                                    {questionData.difficulty !== null && questionData.difficulty !== undefined
                                        ? DIFFICULTY_MAP[questionData.difficulty as 0 | 1 | 2]
                                        : 'N/A'}
                                </StatusBadge>
                            </div>
                        </div>

                        {/* Categories, Positions, Skills */}
                        {questionData.categoriesName && questionData.categoriesName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">Danh mục</label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.categoriesName.map((category, idx) => (
                                        <StatusBadge key={idx} status="inactive">{category}</StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {questionData.positionsName && questionData.positionsName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">Vị trí</label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.positionsName.map((position, idx) => (
                                        <StatusBadge key={idx} status="inactive">{position}</StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {questionData.skillsName && questionData.skillsName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">Kỹ năng</label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.skillsName.map((skill, idx) => (
                                        <StatusBadge key={idx} status="inactive">{skill}</StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        {isCandidate && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-slate-200">Bình luận</label>
                                    <span className="text-xs text-slate-400">{sortedComments.length} bình luận</span>
                                </div>

                                <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-2">
                                    <Textarea
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="min-h-24 bg-slate-900/60 border-slate-700 text-slate-100"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={handleCreateComment}
                                            disabled={isCreatingComment || !newCommentContent.trim()}
                                        >
                                            <Send className="w-4 h-4" />
                                            {isCreatingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {sortedComments.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400 text-center">
                                            Chưa có bình luận nào. Hãy là người đầu tiên bình luận.
                                        </div>
                                    ) : (
                                        sortedComments.map((comment) => {
                                            const isOwn = isOwnComment(comment.userId);
                                            const isEditing = editingCommentId === comment.id;
                                            const isPending = Boolean(pendingCommentIds[comment.id]);
                                            const currentVote = localVoteByCommentId[comment.id] ?? getInitialVoteType(comment);

                                            const createdLabel = formatCommentDate(comment.createdAt);
                                            const updatedLabel = formatCommentDate(comment.updatedAt);
                                            const displayLabel = createdLabel || updatedLabel;
                                            const showEdited = Boolean(createdLabel && updatedLabel && updatedLabel !== createdLabel);

                                            return (
                                                <div
                                                    key={comment.id}
                                                    className="rounded-lg border border-slate-700 bg-slate-800/30 p-3"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {!isPending && (
                                                            <div className="flex flex-col items-center gap-2 pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleVoteComment(comment, true)}
                                                                    disabled={!isCandidate || votingCommentId === comment.id}
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all ${currentVote === 'upvote' ? 'text-emerald-300' : 'text-slate-500'
                                                                        } disabled:opacity-60`}
                                                                >
                                                                    <ArrowBigUp className="w-6 h-6" />
                                                                </button>
                                                                <span className={`text-lg font-bold ${comment.totalVotes >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                                    {comment.totalVotes >= 0 ? '+' : ''}{comment.totalVotes}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleVoteComment(comment, false)}
                                                                    disabled={!isCandidate || votingCommentId === comment.id}
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all ${currentVote === 'downvote' ? 'text-rose-300' : 'text-slate-500'
                                                                        } disabled:opacity-60`}
                                                                >
                                                                    <ArrowBigDown className="w-6 h-6" />
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="group">
                                                                    <p className="text-sm font-medium text-slate-200">
                                                                        {comment.userName || 'Ẩn danh'}
                                                                    </p>
                                                                    {displayLabel && (
                                                                        <p className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {displayLabel}
                                                                            {showEdited ? ' (đã chỉnh sửa)' : ''}
                                                                            {isPending ? ' • Đang gửi...' : ''}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Nút hành động */}
                                                                <div className="flex items-center gap-3">
                                                                    {/* Nút Báo cáo bình luận */}
                                                                    {!isOwn && isCandidate && !isPending && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedCommentIdForReport(comment.id);
                                                                                setIsReportDialogOpen(true);
                                                                            }}
                                                                            className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-slate-700"
                                                                            title="Báo cáo bình luận"
                                                                        >
                                                                            <AlertTriangle className="w-4 h-4" />
                                                                        </button>
                                                                    )}

                                                                    {/* Nút chỉnh sửa & xoá (chỉ chủ bình luận) */}
                                                                    {isCandidate && isOwn && !isPending && !isEditing && (
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleStartEditComment(comment)}
                                                                                className="text-xs text-slate-400 hover:text-sky-300 transition-colors"
                                                                            >
                                                                                Chỉnh sửa
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCommentToDeleteId(comment.id)}
                                                                                disabled={deletingCommentId === comment.id}
                                                                                className="text-xs text-slate-400 hover:text-red-300 transition-colors disabled:opacity-60"
                                                                            >
                                                                                Xoá
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {!isEditing ? (
                                                                <p className="text-sm text-slate-100 whitespace-pre-wrap">
                                                                    {comment.content}
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <Textarea
                                                                        value={editingCommentContent}
                                                                        onChange={(e) => setEditingCommentContent(e.target.value)}
                                                                        className="min-h-20 bg-slate-900/60 border-slate-700 text-slate-100"
                                                                    />
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={handleCancelEditComment}
                                                                            disabled={isSavingEdit}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                            Huỷ
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="primary"
                                                                            size="sm"
                                                                            onClick={() => handleSaveEditComment(comment.id)}
                                                                            disabled={isSavingEdit || !editingCommentContent.trim()}
                                                                        >
                                                                            <Save className="w-4 h-4" />
                                                                            {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                            {onSaveToggle ? (
                                <button
                                    onClick={onSaveToggle}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${isSaved
                                        ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                                        : 'border-slate-600 text-slate-400 hover:border-yellow-500/50 hover:text-yellow-400'
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                    {isSaved ? 'Đã lưu' : 'Lưu câu hỏi'}
                                </button>
                            ) : <div />}
                            <DialogClose asChild>
                                <Button variant="outline">Đóng</Button>
                            </DialogClose>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400">
                        Không tìm thấy dữ liệu câu hỏi.
                    </div>
                )}

                {/* AlertDialog Xóa comment */}
                <AlertDialog open={commentToDeleteId !== null} onOpenChange={(openState) => {
                    if (!openState && deletingCommentId === null) {
                        setCommentToDeleteId(null);
                    }
                }}>
                    <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Xoá bình luận?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-300">
                                Hành động này không thể hoàn tác. Bình luận của bạn sẽ bị xoá vĩnh viễn.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-200 hover:bg-slate-800">
                                Huỷ
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30"
                                disabled={commentToDeleteId === null || deletingCommentId !== null}
                                onClick={() => {
                                    if (commentToDeleteId !== null) void handleDeleteComment(commentToDeleteId);
                                }}
                            >
                                {deletingCommentId !== null ? 'Đang xoá...' : 'Xoá bình luận'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Report Comment Dialog */}
                <ReportCommentDialog
                    open={isReportDialogOpen}
                    onOpenChange={setIsReportDialogOpen}
                    commentId={selectedCommentIdForReport}
                    onSuccess={() => setSelectedCommentIdForReport(null)}
                />
            </DialogContent>
        </Dialog>
    );
}