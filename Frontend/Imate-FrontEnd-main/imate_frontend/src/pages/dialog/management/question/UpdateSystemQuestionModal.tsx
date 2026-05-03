import React, { useEffect, useState, useRef } from 'react';
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
    updateSystemQuestionForStaff,
    getSystemQuestionDetail,
    sortCommentsByTotalVotesDesc
} from '@/services/questionService';
import {
    getAllPositions,
    getAllSkills,
    getAllCategories
} from '@/services/commonService';
import { getListQuestionCategories } from '@/services/questionService';
import type {
    UpdateSystemQuestionRequest,
    DifficultyLevel,
    PositionItem,
    SkillItem,
    CategoryItem,
    SystemQuestionDetail
} from '@/types/common/question';
import { DIFFICULTY_MAP, DIFFICULTY_LEVEL } from '@/constants/common';
import { toast } from 'react-toastify';

interface UpdateSystemQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function UpdateSystemQuestionModal({
    questionId,
    open,
    onOpenChange,
    onSuccess
}: UpdateSystemQuestionModalProps) {
    const MAX_SAMPLE_ANSWER_LENGTH = 1300;
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<SystemQuestionDetail | null>(null);

    // Form state
    const [formData, setFormData] = useState<UpdateSystemQuestionRequest>({
        content: '',
        difficulty: DIFFICULTY_LEVEL.EASY,
        sampleAnswer: '',
        isActive: true,
        categoryIds: [],
        skillIds: [],
        positionIds: []
    });

    // Dropdown options
    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    // Form errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Track if data has been fetched to prevent duplicate calls
    const hasFetchedRef = useRef(false);

    const sortedComments = React.useMemo(() => {
        return sortCommentsByTotalVotesDesc(questionData?.comments || []);
    }, [questionData?.comments]);

    const formatCommentDate = (createdAt?: string, updatedAt?: string): string => {
        // If createdAt is missing or is the C# default "0001-01-01...", use updatedAt instead
        const isDefaultDate = !createdAt || createdAt.startsWith('0001-01-01');
        const targetDate = isDefaultDate ? updatedAt : createdAt;

        if (!targetDate) return '';
        const parsed = new Date(targetDate);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toLocaleString('vi-VN');
    };

    const isCommentEdited = (createdAt?: string, updatedAt?: string): boolean => {
        if (!createdAt || !updatedAt) return false;
        if (createdAt.startsWith('0001-01-01')) return false; // Not considered edited if createdAt is default
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
            const [questionDetail, positionsRes, skillsRes, categoriesRes] = await Promise.all([
                getSystemQuestionDetail(questionId),
                getAllPositions({ pageSize: 10, isActive: true }),
                getAllSkills({ pageSize: 10, isActive: true }),
                getAllCategories({ pageSize: 10, isActive: true }),
                getListQuestionCategories()
            ]);

            setPositions(positionsRes.data);
            setSkills(skillsRes.data);
            setCategories(categoriesRes.data);

            // Match names to IDs from the fetched lists
            // API returns categoriesName, positionsName, skillsName as string arrays
            const categoryIds = Array.isArray(questionDetail.categoriesName)
                ? categoriesRes.data
                    .filter(c => questionDetail.categoriesName.includes(c.name))
                    .map(c => c.id)
                : [];

            const skillIds = Array.isArray(questionDetail.skillsName)
                ? skillsRes.data
                    .filter(s => questionDetail.skillsName.includes(s.name))
                    .map(s => s.id)
                : [];

            const positionIds = Array.isArray(questionDetail.positionsName)
                ? positionsRes.data
                    .filter(p => questionDetail.positionsName.includes(p.name))
                    .map(p => p.id)
                : [];

            console.log('Mapped IDs:', { categoryIds, skillIds, positionIds });
            setQuestionData(questionDetail);

            // Populate form with question details
            setFormData({
                content: questionDetail.content || '',
                difficulty: questionDetail.difficulty,
                sampleAnswer: questionDetail.sampleAnswer || '',
                isActive: questionDetail.isActive,
                categoryIds: categoryIds,
                skillIds: skillIds,
                positionIds: positionIds
            });
        } catch (error) {
            console.error('Failed to fetch question data:', error);
            toast.error('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
            onOpenChange(false);
        } finally {
            setLoadingData(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.content.trim()) {
            newErrors.content = 'Nội dung câu hỏi không được để trống.';
        } else if (formData.content.length > 500) {
            newErrors.content = 'Nội dung câu hỏi tối đa 500 ký tự.';
        }

        if (!formData.sampleAnswer.trim()) {
            newErrors.sampleAnswer = 'Câu trả lời mẫu không được để trống.';
        } else if (formData.sampleAnswer.length > MAX_SAMPLE_ANSWER_LENGTH) {
            newErrors.sampleAnswer = `Câu trả lời mẫu tối đa ${MAX_SAMPLE_ANSWER_LENGTH} ký tự.`;
        }

        if (formData.categoryIds.length === 0) {
            newErrors.categoryIds = 'Phải chọn ít nhất một danh mục.';
        }

        if (formData.skillIds.length === 0) {
            newErrors.skillIds = 'Phải chọn ít nhất một kỹ năng.';
        }

        if (formData.positionIds.length === 0) {
            newErrors.positionIds = 'Phải chọn ít nhất một vị trí.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin.');
            return;
        }

        try {
            setLoading(true);
            await updateSystemQuestionForStaff(questionId, formData);
            toast.success('Cập nhật câu hỏi thành công!');
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to update question:', error);
            const serverMessage =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.response?.detail;
            toast.error(serverMessage || 'Không thể cập nhật câu hỏi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyChange = (difficulty: DifficultyLevel) => {
        setFormData(prev => ({ ...prev, difficulty }));
        if (errors.difficulty) {
            setErrors(prev => ({ ...prev, difficulty: '' }));
        }
    };

    const toggleSelection = (
        type: 'categoryIds' | 'skillIds' | 'positionIds',
        id: number
    ) => {
        setFormData(prev => {
            const currentIds = prev[type];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(item => item !== id)
                : [...currentIds, id];

            return { ...prev, [type]: newIds };
        });

        if (errors[type]) {
            setErrors(prev => ({ ...prev, [type]: '' }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        Cập nhật câu hỏi #{questionId}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Chỉnh sửa thông tin câu hỏi phỏng vấn.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            {/* Question Content */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Nội dung câu hỏi <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, content: e.target.value }));
                                        if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
                                    }}
                                    className={`w-full h-32 rounded-lg px-4 py-3 bg-slate-800 border ${errors.content ? 'border-red-500' : 'border-slate-700'
                                        } text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all`}
                                    placeholder="Viết câu hỏi phỏng vấn của bạn ở đây..."
                                    disabled={loading}
                                />
                                {errors.content && (
                                    <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                    {formData.content.length}/500 ký tự
                                </p>
                            </div>

                            {/* Sample Answer */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Câu trả lời mẫu <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.sampleAnswer}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, sampleAnswer: e.target.value }));
                                        if (errors.sampleAnswer) setErrors(prev => ({ ...prev, sampleAnswer: '' }));
                                    }}
                                    maxLength={MAX_SAMPLE_ANSWER_LENGTH}
                                    className={`w-full h-40 rounded-lg px-4 py-3 bg-slate-800 border ${errors.sampleAnswer ? 'border-red-500' : 'border-slate-700'
                                        } text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all`}
                                    placeholder="Viết câu trả lời gợi ý cho câu hỏi của bạn ở đây..."
                                    disabled={loading}
                                />
                                {errors.sampleAnswer && (
                                    <p className="text-red-400 text-xs mt-1">{errors.sampleAnswer}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                    {formData.sampleAnswer.length}/{MAX_SAMPLE_ANSWER_LENGTH} ký tự
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
                                            onClick={() => handleDifficultyChange(level)}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.difficulty === level
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
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
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleSelection('categoryIds', category.id)}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.categoryIds.includes(category.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.categoryIds && (
                                    <p className="text-red-400 text-xs">{errors.categoryIds}</p>
                                )}
                            </div>

                            {/* Positions */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Vị trí <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {positions.map((position) => (
                                        <button
                                            key={position.id}
                                            type="button"
                                            onClick={() => toggleSelection('positionIds', position.id)}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.positionIds.includes(position.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            {position.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.positionIds && (
                                    <p className="text-red-400 text-xs">{errors.positionIds}</p>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Kỹ năng <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            onClick={() => toggleSelection('skillIds', skill.id)}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.skillIds.includes(skill.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.skillIds && (
                                    <p className="text-red-400 text-xs">{errors.skillIds}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Trạng thái <span className="text-red-400">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.isActive
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-slate-600 bg-slate-800 text-slate-300'
                                        } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {formData.isActive ? 'Hoạt động' : 'Vô hiệu'}
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
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
