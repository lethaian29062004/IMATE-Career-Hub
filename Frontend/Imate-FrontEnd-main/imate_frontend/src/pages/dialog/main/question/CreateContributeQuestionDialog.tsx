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

import { contributeQuestion } from '@/services/questionService';
import {
  getAllCategories,
  getAllPositions,
  getAllSkills,
  getAllCompanies
} from '@/services/commonService';
import type {
  ContributeQuestionRequest,
  PositionItem,
  SkillItem,
  CategoryItem,
  CompanyItem,
  Level,

} from '@/types/common/question';
import { DIFFICULTY_LEVEL, DIFFICULTY_MAP, LEVEL, LEVEL_MAP } from "@/constants/common";

interface CreateContributeQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateContributeQuestionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContributeQuestionDialogProps) {
  const MAX_USER_ANSWER_LENGTH = 1300;
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<ContributeQuestionRequest>({
    content: '',
    difficulty: DIFFICULTY_LEVEL.EASY,
    level: LEVEL.INTERN,
    companyId: 0,
    positionIds: [],
    skillIds: [],
    interviewDate: '',
    categoryIds: [],
    userAnswer: '',
  });

  // Dropdown options
  const [positions, setPositions] = React.useState<PositionItem[]>([]);
  const [skills, setSkills] = React.useState<SkillItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [companies, setCompanies] = React.useState<CompanyItem[]>([]);

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
      const [positionsRes, skillsRes, categoriesRes, companiesRes] = await Promise.all([
        getAllPositions({ pageSize: 10, isActive: true }),
        getAllSkills({ pageSize: 10, isActive: true }),
        getAllCategories({ pageSize: 10, isActive: true }),
        getAllCompanies({ pageSize: 10, isActive: true }),
      ]);

      setPositions(positionsRes.data);
      setSkills(skillsRes.data);
      setCategories(categoriesRes.data);
      setCompanies(companiesRes.data);
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

    if (!formData.positionIds || formData.positionIds.length === 0) {
      newErrors.positionIds = 'Vui lòng chọn vị trí.';
    }

    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Vui lòng chọn danh mục.';
    }

    if (formData.skillIds.length === 0) {
      newErrors.skillIds = 'Phải chọn ít nhất một kỹ năng.';
    }

    if (!formData.interviewDate) {
      newErrors.interviewDate = 'Vui lòng chọn ngày phỏng vấn.';
    } else {
      const selectedDate = new Date(formData.interviewDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
      if (selectedDate > currentDate) {
        newErrors.interviewDate = 'Ngày phỏng vấn không được chọn ngày trong tương lai.';
      }
    }

    if (formData.userAnswer && formData.userAnswer.length > MAX_USER_ANSWER_LENGTH) {
      newErrors.userAnswer = `Câu trả lời tối đa ${MAX_USER_ANSWER_LENGTH} ký tự.`;
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

      await contributeQuestion(formData);
      toast.success('Đóng góp câu hỏi thành công!');

      // Reset form
      setFormData({
        content: '',
        companyId: 0,
        positionIds: [],
        difficulty: DIFFICULTY_LEVEL.EASY,
        level: LEVEL.INTERN,
        skillIds: [],
        interviewDate: '',
        categoryIds: [],
        userAnswer: '',
      });
      setErrors({});

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to contribute question:', error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail;
      toast.error(serverMessage || 'Không thể đóng góp câu hỏi. Vui lòng thử lại sau.');
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

  const handleLevelChange = (level: Level) => {
    setFormData(prev => ({ ...prev, level }));
    if (errors.level) {
      setErrors(prev => ({ ...prev, level: '' }));
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
            Đóng góp câu hỏi phỏng vấn
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Chia sẻ câu hỏi phỏng vấn mà bạn đã gặp để giúp đỡ cộng đồng.
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
                  placeholder="Viết câu hỏi phỏng vấn mà bạn đã gặp..."
                  disabled={loading}
                />
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                )}
                <p className="text-xs text-slate-500">
                  {formData.content.length}/500 ký tự
                </p>
              </div>

              {/* User Answer (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Câu trả lời của bạn <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.userAnswer}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, userAnswer: e.target.value }));
                    if (errors.userAnswer) setErrors(prev => ({ ...prev, userAnswer: '' }));
                  }}
                  maxLength={MAX_USER_ANSWER_LENGTH}
                  className="w-full h-32 rounded-lg px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="Bạn đã trả lời câu hỏi này như thế nào? (Không bắt buộc)"
                  disabled={loading}
                />
                {errors.userAnswer && (
                  <p className="text-red-400 text-xs mt-1">{errors.userAnswer}</p>
                )}
                <p className="text-xs text-slate-500">
                  {formData.userAnswer?.length || 0}/{MAX_USER_ANSWER_LENGTH} ký tự
                </p>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Độ khó <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {([DIFFICULTY_LEVEL.EASY, DIFFICULTY_LEVEL.MEDIUM, DIFFICULTY_LEVEL.HARD] as const).map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => handleDifficultyChange(difficulty)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.difficulty === difficulty
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {DIFFICULTY_MAP[difficulty]}
                    </button>
                  ))}
                </div>
                {errors.difficulty && (
                  <p className="text-red-400 text-xs">{errors.difficulty}</p>
                )}
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Cấp độ <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {([LEVEL.INTERN,LEVEL.JUNIOR, LEVEL.JUNIOR, LEVEL.MIDDLE, LEVEL.SENIOR, LEVEL.LEAD, LEVEL.MANAGER] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleLevelChange(level)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.level === level
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {LEVEL_MAP[level]}
                    </button>
                  ))}
                </div>
                {errors.level && (
                  <p className="text-red-400 text-xs">{errors.level}</p>
                )}
              </div>

              {/* Companies */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Công ty <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, companyId: company.id }));
                        if (errors.companyId) setErrors(prev => ({ ...prev, companyId: '' }));
                      }}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.companyId === company.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
                {errors.companyId && (
                  <p className="text-red-400 text-xs">{errors.companyId}</p>
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
              {/* Interview Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Ngày phỏng vấn <span className="text-red-400">*</span>
                </label>
                <input
                  type="date" max={new Date().toISOString().split('T')[0]} value={formData.interviewDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, interviewDate: e.target.value }));
                    if (errors.interviewDate) setErrors(prev => ({ ...prev, interviewDate: '' }));
                  }}
                  className={`w-full rounded-lg px-4 py-3 bg-slate-800 border ${errors.interviewDate ? 'border-red-500' : 'border-slate-700'
                    } text-slate-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all`}
                  disabled={loading}
                />
                {errors.interviewDate && (
                  <p className="text-red-400 text-xs">{errors.interviewDate}</p>
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
                {loading ? 'Đang gửi...' : 'Đóng góp câu hỏi'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
