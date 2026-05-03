import React, { useEffect, useState } from 'react';
import {
  getAllSystemQuestionsForStaff,
  getAllContributedQuestionsForStaff,
  getAllPendingContributedQuestionsForStaff,
  getListQuestionCategories,
  exportSystemQuestionsForStaff
} from '@/services/questionService';
import { getListPosition } from '@/services/positionService';
import { getAllSkill } from '@/services/skillService';
import { DIFFICULTY_OPTIONS } from '@/constants/enum';
import { ImportSystemQuestionDialog } from '@/pages/dialog/management/question/ImportSystemQuestionDialog';
import { UpdateSystemQuestionModal } from '@/pages/dialog/management/question/UpdateSystemQuestionModal';
import { CreateSystemQuestionDialog } from '@/pages/dialog/management/question/CreateSystemQuestionDialog';
import { CreateContributeQuestionDialog } from '@/pages/dialog/main/question/CreateContributeQuestionDialog';
import { ViewContributeQuestionModal } from '@/pages/dialog/management/question/ViewContributeQuestionModal';
import { ViewPendingContributeQuestionModal } from '@/pages/dialog/management/question/ViewPendingContributeQuestionModal';
import type {
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  GetSystemQuestionParams,
  GetContributedQuestionParams,
  DifficultyLevel,
  CategoryItem,
  PositionItem,
  SkillItem
} from '@/types/common/question';
import { DIFFICULTY_MAP } from '@/constants/common';
import {
  Eye,
  Pencil,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AppTabs } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'react-toastify';

type TabType = 'system' | 'contributed' | 'pending';

const QUESTION_TABS = [
  { label: 'Câu hỏi hệ thống', value: 'system' },
  { label: 'Câu hỏi đóng góp', value: 'contributed' },
  { label: 'Câu hỏi đóng góp chờ duyệt', value: 'pending' },
];

const ViewQuestions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Create question modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Create contribute question modal state
  const [contributeModalOpen, setContributeModalOpen] = useState(false);

  // View contribute question modal state
  const [viewContributeModalOpen, setViewContributeModalOpen] = useState(false);
  const [selectedContributeQuestionId, setSelectedContributeQuestionId] = useState<number | null>(null);

  // View pending contribute question modal state
  const [viewPendingContributeModalOpen, setViewPendingContributeModalOpen] = useState(false);
  const [selectedPendingContributeQuestionId, setSelectedPendingContributeQuestionId] = useState<number | null>(null);

  // System Questions State
  const [systemQuestions, setSystemQuestions] = useState<StaffSystemQuestionItem[]>([]);
  const [systemPagination, setSystemPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Contributed Questions State
  const [contributedQuestions, setContributedQuestions] = useState<StaffContributedQuestionItem[]>([]);
  const [contributedPagination, setContributedPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Pending Contributed Questions State
  const [pendingContributedQuestions, setPendingContributedQuestions] = useState<StaffContributedQuestionItem[]>([]);
  const [pendingContributedPagination, setPendingContributedPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Filter State for System Questions
  const [systemFilters, setSystemFilters] = useState<GetSystemQuestionParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Filter State for Contributed Questions
  const [contributedFilters, setContributedFilters] = useState<GetContributedQuestionParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Filter State for Pending Contributed Questions
  const [pendingContributedFilters, setPendingContributedFilters] = useState<GetContributedQuestionParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Dropdown options from API
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [_categories, setCategories] = useState<CategoryItem[]>([]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchPositions();
    fetchSkills();
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      fetchSystemQuestions();
    } else if (activeTab === 'contributed') {
      fetchContributedQuestions();
    } else {
      fetchPendingContributedQuestions();
    }
  }, [activeTab, systemFilters, contributedFilters, pendingContributedFilters]);

  const fetchCategories = async () => {
    try {
      const result = await getListQuestionCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const result = await getListPosition(1, null, true, '', 'name', 'asc');
      if (result && result.items) {
        setPositions(result.items.map(item => ({ id: item.id, name: item.name })));
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const result = await getAllSkill(1, null, true, '', 'name', 'asc');
      if (result && result.items) {
        setSkills(result.items.map(item => ({ id: item.id, name: item.name })));
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const fetchSystemQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllSystemQuestionsForStaff(systemFilters);
      setSystemQuestions(result.items || []);
      setSystemPagination({
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages || 1
      });
    } catch (error) {
      console.error('Failed to fetch system questions:', error);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllContributedQuestionsForStaff(contributedFilters);
      console.log('Fetched contributed questions:', result);
      setContributedQuestions(result.items || []);
      setContributedPagination({
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages || 1
      });
    } catch (error) {
      console.error('Failed to fetch contributed questions:', error);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingContributedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllPendingContributedQuestionsForStaff(pendingContributedFilters);
      setPendingContributedQuestions(result.items || []);
      setPendingContributedPagination({
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages || 1
      });
    } catch (error) {
      console.error('Failed to fetch pending contributed questions:', error);
      setError('Không thể tải danh sách câu hỏi chờ duyệt. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemFilterChange = (key: keyof GetSystemQuestionParams, value: any) => {
    setSystemFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: key === 'pageNumber' ? value : 1
    }));
  };

  const handleContributedFilterChange = (key: keyof GetContributedQuestionParams, value: any) => {
    setContributedFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: key === 'pageNumber' ? value : 1
    }));
  };

  const handlePendingContributedFilterChange = (key: keyof GetContributedQuestionParams, value: any) => {
    setPendingContributedFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: key === 'pageNumber' ? value : 1
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (activeTab === 'system') {
      handleSystemFilterChange('pageSize', pageSize);
      handleSystemFilterChange('pageNumber', 1);
    } else if (activeTab === 'contributed') {
      handleContributedFilterChange('pageSize', pageSize);
      handleContributedFilterChange('pageNumber', 1);
    } else {
      handlePendingContributedFilterChange('pageSize', pageSize);
      handlePendingContributedFilterChange('pageNumber', 1);
    }
  };

  const handleEditQuestion = (questionId: number) => {
    console.log('handleEditQuestion called with ID:', questionId);
    setSelectedQuestionId(questionId);
    setUpdateModalOpen(true);
    console.log('Modal should open now');
  };

  const handleUpdateSuccess = () => {
    // Refresh the question list after successful update
    if (activeTab === 'system') {
      fetchSystemQuestions();
    } else if (activeTab === 'contributed') {
      fetchContributedQuestions();
    } else {
      fetchPendingContributedQuestions();
    }
  };

  const handleViewContributeQuestion = (questionId: number) => {
    setSelectedContributeQuestionId(questionId);
    setViewContributeModalOpen(true);
  };

  const handleViewPendingContributeQuestion = (questionId: number) => {
    setSelectedPendingContributeQuestionId(questionId);
    setViewPendingContributeModalOpen(true);
  };

  const handlePendingStatusChanged = () => {
    fetchPendingContributedQuestions();
  };

  const handleExportSystemQuestions = async () => {
    if (activeTab !== 'system') {
      toast.info('Chỉ hỗ trợ export ở tab Câu hỏi hệ thống.');
      return;
    }

    try {
      setExporting(true);
      const { blob, fileName } = await exportSystemQuestionsForStaff(systemFilters);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export câu hỏi thành công.');
    } catch (exportError) {
      console.error('Failed to export system questions:', exportError);
      toast.error('Không thể export câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setExporting(false);
    }
  };

  const getDifficultyStatus = (difficulty: string): "active" | "pending" | "error" | "inactive" | "draft" => {
    const diffLower = difficulty?.toLowerCase();
    if (diffLower === 'easy') return 'active';
    if (diffLower === 'medium') return 'pending';
    if (diffLower === 'hard') return 'error';
    return 'inactive';
  };

  const currentFilters = activeTab === 'system'
    ? systemFilters
    : activeTab === 'contributed'
      ? contributedFilters
      : pendingContributedFilters;

  const currentPagination = activeTab === 'system'
    ? systemPagination
    : activeTab === 'contributed'
      ? contributedPagination
      : pendingContributedPagination;

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý câu hỏi
          </h1>
          <p className="text-slate-400">
            Quản lý và cập nhật ngân hàng câu hỏi hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'system' && (
            <>
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                icon={<Upload className="w-4 h-4" />}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Import câu hỏi
              </Button>
              <Button
                variant="outline"
                onClick={handleExportSystemQuestions}
                disabled={exporting}
                icon={<Download className="w-4 h-4" />}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                {exporting ? 'Đang export...' : 'Export câu hỏi'}
              </Button>
            </>
          )}

          {activeTab === 'system' && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
            >
              Thêm câu hỏi
            </Button>
          )}
        </div>
      </div>

      <AppTabs
        tabs={QUESTION_TABS}
        value={activeTab}
        onChange={(value) => setActiveTab(value as TabType)}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-white">
              {activeTab === 'system'
                ? 'Danh sách câu hỏi hệ thống'
                : activeTab === 'contributed'
                  ? 'Danh sách câu hỏi đóng góp'
                  : 'Danh sách câu hỏi chờ duyệt'}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Vị trí:</span>
              <select
                value={currentFilters.positionId || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  if (activeTab === 'system') {
                    handleSystemFilterChange('positionId', value);
                  } else if (activeTab === 'contributed') {
                    handleContributedFilterChange('positionId', value);
                  } else {
                    handlePendingContributedFilterChange('positionId', value);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-40"
              >
                <option value="">Tất cả</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Kỹ năng:</span>
              <select
                value={currentFilters.skillId || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  if (activeTab === 'system') {
                    handleSystemFilterChange('skillId', value);
                  } else if (activeTab === 'contributed') {
                    handleContributedFilterChange('skillId', value);
                  } else {
                    handlePendingContributedFilterChange('skillId', value);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-44"
              >
                <option value="">Tất cả kỹ năng</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Cấp độ:</span>
              <select
                value={
                  activeTab === 'pending'
                    ? (pendingContributedFilters.level !== undefined ? String(pendingContributedFilters.level) : '')
                    : (currentFilters.difficulty !== undefined ? String(currentFilters.difficulty) : '')
                }
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value ? parseInt(value) as DifficultyLevel : undefined;
                  if (activeTab === 'system') {
                    handleSystemFilterChange('difficulty', numValue);
                  } else if (activeTab === 'contributed') {
                    handleContributedFilterChange('difficulty', numValue);
                  } else {
                    handlePendingContributedFilterChange('level', numValue);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-36"
              >
                <option value="">Tất cả</option>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={currentFilters.sortOrder || 'desc'}
                onChange={(e) => {
                  const value = e.target.value as 'asc' | 'desc';
                  if (activeTab === 'system') {
                    handleSystemFilterChange('sortOrder', value);
                  } else if (activeTab === 'contributed') {
                    handleContributedFilterChange('sortOrder', value);
                  } else {
                    handlePendingContributedFilterChange('sortOrder', value);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-36"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table
            page={currentPagination.pageNumber}
            totalPages={currentPagination.totalPages}
            pageSize={currentPagination.pageSize}
            totalCount={currentPagination.totalCount}
            onPageChange={(page) => {
              if (activeTab === 'system') {
                handleSystemFilterChange('pageNumber', page);
              } else if (activeTab === 'contributed') {
                handleContributedFilterChange('pageNumber', page);
              } else {
                handlePendingContributedFilterChange('pageNumber', page);
              }
            }}
            onPageSizeChange={handlePageSizeChange}
          >
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Câu hỏi</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Kỹ năng</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Người đăng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="px-8 py-6">
                        <div className="h-4 bg-slate-700 rounded w-8"></div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-800 rounded w-32"></div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-4 bg-slate-700 rounded w-24"></div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-4 bg-slate-700 rounded w-24"></div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-6 bg-slate-700 rounded w-16"></div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-4 bg-slate-700 rounded w-24"></div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : error ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={9} className="px-8 py-12 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={() => {
                        if (activeTab === 'system') {
                          fetchSystemQuestions();
                        } else if (activeTab === 'contributed') {
                          fetchContributedQuestions();
                        } else {
                          fetchPendingContributedQuestions();
                        }
                      }}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                    >
                      Thử lại
                    </button>
                  </TableCell>
                </TableRow>
              ) : activeTab === 'system' ? (
                systemQuestions.length > 0 ? (
                  systemQuestions.map((question, index) => (
                    <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                      <TableCell className="px-8 py-6 text-sm text-slate-400">
                        {String((systemPagination.pageNumber - 1) * systemPagination.pageSize + index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                          {question.content}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status="inactive">
                          {Array.isArray(question.positionsName) && question.positionsName.length > 0 ? question.positionsName.join(', ') : 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {Array.isArray(question.skillsName) && question.skillsName.length > 0 ? question.skillsName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {Array.isArray(question.categoriesName) && question.categoriesName.length > 0 ? question.categoriesName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={getDifficultyStatus(DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'Easy')}>
                          {DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.creatorName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={question.isActive ? "active" : "inactive"}>
                          {question.isActive ? "Hoạt động" : "Vô hiệu"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-8 w-8"
                                onClick={() => handleEditQuestion(question.id)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Sửa</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="px-8 py-12 text-center text-slate-400">
                      Không có câu hỏi nào
                    </TableCell>
                  </TableRow>
                )
              ) : activeTab === 'contributed' ? (
                contributedQuestions.length > 0 ? (
                  contributedQuestions.map((question, index) => (
                    <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                      <TableCell className="px-8 py-6 text-sm text-slate-400">
                        {String((contributedPagination.pageNumber - 1) * contributedPagination.pageSize + index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                          {question.content}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status="inactive">
                          {question.positionsName?.length > 0 ? question.positionsName.join(', ') : 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.skillsName?.length > 0 ? question.skillsName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.categoriesName?.length > 0 ? question.categoriesName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={getDifficultyStatus(question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A')}>
                          {question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.creatorName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={question.isActive ? "active" : "inactive"}>
                          {question.isActive ? "Hoạt động" : "Vô hiệu"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-8 w-8"
                                onClick={() => handleViewContributeQuestion(question.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="px-8 py-12 text-center text-slate-400">
                      Không có câu hỏi nào
                    </TableCell>
                  </TableRow>
                )
              ) : (
                pendingContributedQuestions.length > 0 ? (
                  pendingContributedQuestions.map((question, index) => (
                    <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                      <TableCell className="px-8 py-6 text-sm text-slate-400">
                        {String((pendingContributedPagination.pageNumber - 1) * pendingContributedPagination.pageSize + index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                          {question.content}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status="inactive">
                          {question.positionsName?.length > 0 ? question.positionsName.join(', ') : 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.skillsName?.length > 0 ? question.skillsName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.categoriesName?.length > 0 ? question.categoriesName.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={getDifficultyStatus(question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A')}>
                          {question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.creatorName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status="pending">
                          Chờ duyệt
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-8 w-8"
                                onClick={() => handleViewPendingContributeQuestion(question.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="px-8 py-12 text-center text-slate-400">
                      Không có câu hỏi nào
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Update Question Modal */}
      {selectedQuestionId && (
        <UpdateSystemQuestionModal
          questionId={selectedQuestionId}
          open={updateModalOpen}
          onOpenChange={(open: boolean) => {
            setUpdateModalOpen(open);
            if (!open) {
              setSelectedQuestionId(null);
            }
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Create Question Modal */}
      <CreateSystemQuestionDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          if (activeTab === 'system') {
            fetchSystemQuestions();
          }
        }}
      />

      {/* Contribute Question Modal */}
      <CreateContributeQuestionDialog
        open={contributeModalOpen}
        onOpenChange={setContributeModalOpen}
        onSuccess={() => {
          if (activeTab === 'contributed') {
            fetchContributedQuestions();
          }
        }}
      />

      {/* Import Question Modal */}
      <ImportSystemQuestionDialog
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          if (activeTab === 'system') {
            fetchSystemQuestions();
          }
        }}
      />

      {/* View Contribute Question Modal */}
      {selectedContributeQuestionId && (
        <ViewContributeQuestionModal
          questionId={selectedContributeQuestionId}
          open={viewContributeModalOpen}
          onOpenChange={(open: boolean) => {
            setViewContributeModalOpen(open);
            if (!open) {
              setSelectedContributeQuestionId(null);
            }
          }}
        />
      )}

      {/* View Pending Contribute Question Modal */}
      {selectedPendingContributeQuestionId && (
        <ViewPendingContributeQuestionModal
          questionId={selectedPendingContributeQuestionId}
          open={viewPendingContributeModalOpen}
          onOpenChange={(open: boolean) => {
            setViewPendingContributeModalOpen(open);
            if (!open) {
              setSelectedPendingContributeQuestionId(null);
            }
          }}
          onStatusChanged={handlePendingStatusChanged}
        />
      )}
    </div>
  );
};

export default ViewQuestions;