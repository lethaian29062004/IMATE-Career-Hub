import * as React from "react";
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
import { toast } from "react-toastify";

import { createSystemQuestionForStaff } from '@/services/questionService';
import {
  getAllCategories,
  getAllPositions,
  getAllSkills
} from '@/services/commonService';
import type {
  CreateSystemQuestionRequest,
  PositionItem,
  SkillItem,
  CategoryItem
} from '@/types/common/question';
import { DIFFICULTY_LEVEL, DIFFICULTY_MAP } from '@/constants/common';

interface CreateSystemQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSystemQuestionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSystemQuestionDialogProps) {
  const MAX_SAMPLE_ANSWER_LENGTH = 1300;
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<CreateSystemQuestionRequest>({
    content: '',
    difficulty: DIFFICULTY_LEVEL.EASY,
    sampleAnswer: '',
    categoryIds: [],
    skillIds: [],
    positionIds: []
  });

  // Dropdown options
  const [positions, setPositions] = React.useState<PositionItem[]>([]);
  const [skills, setSkills] = React.useState<SkillItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);

  // Form errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [positionsRes, skillsRes, categoriesRes] = await Promise.all([
        getAllPositions({ pageSize: 10, isActive: true }),
        getAllSkills({ pageSize: 10, isActive: true }),
        getAllCategories({ pageSize: 10, isActive: true }),
      ]);

      setPositions(positionsRes.data);
      setSkills(skillsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
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

      const requestData = {
        ...formData
      };

      await createSystemQuestionForStaff(requestData);
      toast.success('Thêm câu hỏi thành công!');

      // Reset form
      setFormData({
        content: '',
        difficulty: DIFFICULTY_LEVEL.EASY,
        sampleAnswer: '',
        categoryIds: [],
        skillIds: [],
        positionIds: []
      });
      setErrors({});

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create question:', error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail;
      toast.error(serverMessage || 'Không thể tạo câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (difficulty: 0 | 1 | 2) => {
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
            Thêm câu hỏi hệ thống
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Tạo câu hỏi phỏng vấn mới cho ngân hàng câu hỏi hệ thống.
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
                {errors.difficulty && (
                  <p className="text-red-400 text-xs">{errors.difficulty}</p>
                )}
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
                {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
