import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadQuestionTemplate, validateQuestionsFromExcel, importValidatedQuestions, revalidateSingleQuestion } from '@/services/questionService';
import type { FinalImportRequest, ValidateExcelResponse } from '@/types/common/question';

interface ImportSystemQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const ImportSystemQuestionDialog: React.FC<ImportSystemQuestionDialogProps> = ({
    open,
    onOpenChange,
    onSuccess
}) => {
    const [step, setStep] = useState<1 | 2>(1); // 1: Upload, 2: Review
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateExcelResponse | null>(null);
    const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
    const [editDrafts, setEditDrafts] = useState<Record<string, FinalImportRequest>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        setStep(1);
        setFile(null);
        setValidationResult(null);
        setEditingRowKey(null);
        setEditDrafts({});
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        handleReset();
        onOpenChange(false);
    };

    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const { blob, fileName } = await downloadQuestionTemplate();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Tải template thành công.');
        } catch (error) {
            console.error('Failed to download template:', error);
            toast.error('Không thể tải template. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const extension = selectedFile.name.split('.').pop()?.toLowerCase();
            if (extension !== 'xlsx' && extension !== 'xls') {
                toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)');
                return;
            }
            setFile(selectedFile);
        }
    };

    const normalizeValidationResult = (result: any): ValidateExcelResponse => {
        if (Array.isArray(result)) {
            const normalized = result.map((item) => {
                const errorValues = item?.errors ? Object.values(item.errors) : [];
                const validationErrors = Array.isArray(item?.validationErrors)
                    ? item.validationErrors
                    : errorValues.filter((value) => typeof value === 'string');

                return {
                    content: item?.content ?? '',
                    difficulty: item?.difficulty ?? '',
                    sampleAnswer: item?.sampleAnswer ?? '',
                    categoryNames: item?.categoryNames ?? '',
                    skillNames: item?.skillNames ?? '',
                    positionNames: item?.positionNames ?? '',
                    isValid: Boolean(item?.isValid),
                    validationErrors,
                    rowNumber: item?.rowIndex ?? item?.rowNumber,
                } as const;
            });

            const validRequests = normalized.filter((item) => item.isValid && !item.validationErrors?.length);
            const invalidRequests = normalized.filter((item) => !item.isValid || item.validationErrors?.length);
            return {
                validRequests,
                invalidRequests,
                totalRows: normalized.length,
                validCount: validRequests.length,
                invalidCount: invalidRequests.length,
            };
        }

        const validRequests = Array.isArray(result?.validRequests) ? result.validRequests : [];
        const invalidRequests = Array.isArray(result?.invalidRequests) ? result.invalidRequests : [];
        const totalRows = typeof result?.totalRows === 'number'
            ? result.totalRows
            : validRequests.length + invalidRequests.length;
        const validCount = typeof result?.validCount === 'number'
            ? result.validCount
            : validRequests.length;
        const invalidCount = typeof result?.invalidCount === 'number'
            ? result.invalidCount
            : invalidRequests.length;

        return {
            validRequests,
            invalidRequests,
            totalRows,
            validCount,
            invalidCount,
        };
    };

    const normalizeSingleResult = (item: any): FinalImportRequest => {
        const errorValues = item?.errors ? Object.values(item.errors) : [];
        const validationErrors = Array.isArray(item?.validationErrors)
            ? item.validationErrors
            : errorValues.filter((value) => typeof value === 'string');

        return {
            content: item?.content ?? '',
            difficulty: item?.difficulty ?? '',
            sampleAnswer: item?.sampleAnswer ?? '',
            categoryNames: item?.categoryNames ?? '',
            skillNames: item?.skillNames ?? '',
            positionNames: item?.positionNames ?? '',
            isValid: Boolean(item?.isValid),
            validationErrors,
            rowNumber: item?.rowIndex ?? item?.rowNumber,
        } as FinalImportRequest;
    };

    const getRowKey = (row: FinalImportRequest, fallbackIndex: number) => {
        return String(row.rowNumber ?? fallbackIndex);
    };

    const startEditRow = (row: FinalImportRequest, fallbackIndex: number) => {
        const key = getRowKey(row, fallbackIndex);
        setEditDrafts((prev) => ({
            ...prev,
            [key]: {
                content: row.content,
                difficulty: row.difficulty,
                sampleAnswer: row.sampleAnswer,
                categoryNames: row.categoryNames,
                skillNames: row.skillNames,
                positionNames: row.positionNames,
            },
        }));
        setEditingRowKey(key);
    };

    const updateDraftField = (key: string, field: keyof FinalImportRequest, value: string) => {
        setEditDrafts((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const handleRevalidateRow = async (row: FinalImportRequest, fallbackIndex: number) => {
        if (!validationResult) return;

        const key = getRowKey(row, fallbackIndex);
        const draft = editDrafts[key];
        if (!draft) return;

        try {
            setLoading(true);
            const response = await revalidateSingleQuestion(draft);
            const normalized = normalizeSingleResult(response);
            const validRequests = [...validationResult.validRequests];
            const invalidRequests = validationResult.invalidRequests.filter((item, idx) => getRowKey(item, idx) !== key);

            if (normalized.isValid && !normalized.validationErrors?.length) {
                validRequests.push(normalized);
            } else {
                invalidRequests.push(normalized);
            }

            setValidationResult({
                validRequests,
                invalidRequests,
                totalRows: validationResult.totalRows,
                validCount: validRequests.length,
                invalidCount: invalidRequests.length,
            });
            setEditingRowKey(null);
            toast.success('Đã cập nhật và kiểm tra lại dòng.');
        } catch (error: any) {
            console.error('Revalidate failed:', error);
            toast.error(error.response?.data?.message || 'Không thể kiểm tra lại dòng.');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!file) {
            toast.warning('Vui lòng chọn file để upload.');
            return;
        }

        try {
            setLoading(true);
            const result = await validateQuestionsFromExcel(file);
            const normalized = normalizeValidationResult(result);
            setValidationResult(normalized);
            setStep(2);
            if (normalized.totalRows === 0) {
                toast.info('Không tìm thấy dữ liệu trong file.');
            }
        } catch (error: any) {
            console.error('Validation failed:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra file.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!validationResult || validationResult.validCount === 0) {
            toast.warning('Không có câu hỏi hợp lệ nào để import.');
            return;
        }

        try {
            setLoading(true);
            const response = await importValidatedQuestions(validationResult.validRequests || []);
            toast.success(response.message || `Import thành công ${validationResult.validCount} câu hỏi.`);
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Import failed:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi import.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[800px] bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        Import Câu hỏi Hệ thống
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Upload file Excel để kiểm tra dữ liệu trước khi import vào hệ thống.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="py-6 space-y-6">
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-white">Tải file mẫu (Template)</h4>
                                <p className="text-xs text-slate-400">Sử dụng template chuẩn để đảm bảo định dạng dữ liệu.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                disabled={loading}
                                className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Tải Template
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Upload file Excel</label>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="excel-upload"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />

                                {!file ? (
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="p-3 bg-slate-800 rounded-full">
                                            <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white">Click để chọn file</p>
                                            <p className="text-xs text-slate-500">Hỗ trợ .xlsx, .xls</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 max-w-full overflow-hidden">
                                            <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0" />
                                            <span className="text-sm font-medium truncate text-white">{file.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="p-1 hover:bg-slate-700 rounded-full transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-slate-600 hover:bg-slate-700 text-xs"
                                        >
                                            Chọn file khác
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                                <span className="text-slate-400 text-xs font-medium mb-1">Tổng số dòng</span>
                                <span className="text-2xl font-bold text-white">{validationResult?.totalRows || 0}</span>
                            </div>
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center">
                                <span className="text-emerald-400 text-xs font-medium mb-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Hợp lệ
                                </span>
                                <span className="text-2xl font-bold text-emerald-500">{validationResult?.validCount || 0}</span>
                            </div>
                            <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex flex-col items-center justify-center">
                                <span className="text-rose-400 text-xs font-medium mb-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Không hợp lệ
                                </span>
                                <span className="text-2xl font-bold text-rose-500">{validationResult?.invalidCount || 0}</span>
                            </div>
                        </div>

                        {validationResult?.invalidRequests?.length ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-rose-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Danh sách không hợp lệ ({validationResult.invalidCount})
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Có thể kéo ngang bảng để thấy cột Thao tác và nút Sửa.
                                </p>
                                <div className="rounded-xl overflow-hidden border border-slate-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-[1100px] w-full text-sm text-left">
                                            <thead className="bg-slate-800 text-slate-300">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Dòng</th>
                                                    <th className="px-4 py-3 font-medium">Nội dung</th>
                                                    <th className="px-4 py-3 font-medium">Cấp độ</th>
                                                    <th className="px-4 py-3 font-medium">SampleAnswer</th>
                                                    <th className="px-4 py-3 font-medium">Category</th>
                                                    <th className="px-4 py-3 font-medium">Skill</th>
                                                    <th className="px-4 py-3 font-medium">Position</th>
                                                    <th className="px-4 py-3 font-medium">Lỗi</th>
                                                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800 bg-slate-900 border-t border-slate-800">
                                                {validationResult.invalidRequests?.map((req, idx) => {
                                                    const rowKey = getRowKey(req, idx);
                                                    const isEditing = editingRowKey === rowKey;
                                                    const draft = editDrafts[rowKey];
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                                                {req.rowNumber || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-white min-w-[220px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.content || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'content', e.target.value)}
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="truncate block" title={req.content}>
                                                                        {req.content || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[140px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.difficulty || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'difficulty', e.target.value)}
                                                                        placeholder="Difficulty"
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                                                                        {req.difficulty || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[220px] text-slate-200">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.sampleAnswer || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'sampleAnswer', e.target.value)}
                                                                        placeholder="SampleAnswer"
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="truncate block" title={req.sampleAnswer}>
                                                                        {req.sampleAnswer || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[160px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.categoryNames || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'categoryNames', e.target.value)}
                                                                        placeholder="CategoryNames"
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                                                                        {req.categoryNames || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[160px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.skillNames || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'skillNames', e.target.value)}
                                                                        placeholder="SkillNames"
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                                                                        {req.skillNames || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[180px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={draft?.positionNames || ''}
                                                                        onChange={(e) => updateDraftField(rowKey, 'positionNames', e.target.value)}
                                                                        placeholder="PositionNames"
                                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                                                                    />
                                                                ) : (
                                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                                                                        {req.positionNames || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 min-w-[320px]">
                                                                <ul className="list-disc list-inside text-rose-400 space-y-1 break-words whitespace-normal">
                                                                    {req.validationErrors?.map((err, errIdx) => (
                                                                        <li key={errIdx}>{err}</li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                            <td className="px-4 py-3 text-right min-w-[200px]">
                                                                {isEditing ? (
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            onClick={() => setEditingRowKey(null)}
                                                                            disabled={loading}
                                                                        >
                                                                            Hủy
                                                                        </Button>
                                                                        <Button
                                                                            variant="primary"
                                                                            size="sm"
                                                                            onClick={() => handleRevalidateRow(req, idx)}
                                                                            disabled={loading}
                                                                        >
                                                                            Kiểm tra lại
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        onClick={() => startEditRow(req, idx)}
                                                                        disabled={loading}
                                                                    >
                                                                        Sửa
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {validationResult && validationResult.validCount === 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm flex gap-3 text-center justify-center">
                                Không có dữ liệu hợp lệ để import. Vui lòng sửa lại file và thử lại!
                            </div>
                        )}
                        {validationResult && validationResult.validCount > 0 && validationResult.invalidCount > 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>
                                    Chỉ có những dòng hợp lệ mới được import. Bạn có muốn tiếp tục import <strong>{validationResult.validCount}</strong> dòng hợp lệ không?
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-800">
                    {step === 1 ? (
                        <>
                            <div className="flex w-full justify-end gap-2">
                                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleValidate}
                                    disabled={!file || loading}
                                >
                                    Kiểm tra dữ liệu
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex w-full justify-between items-center sm:w-auto sm:ml-auto gap-2">
                                <Button variant="secondary" onClick={handleReset} disabled={loading}>
                                    Upload lại
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleImport}
                                    disabled={!validationResult || validationResult.validCount === 0 || loading}
                                >
                                    Import {validationResult?.validCount ? `(${validationResult.validCount})` : ''}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
