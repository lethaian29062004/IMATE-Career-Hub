import { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCw, Save, Search, X } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSystemConfigs, updateSystemConfig, type SystemConfig } from "@/services/systemConfigService";

const formatDate = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

export default function SystemConfigManagement() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemConfigs();
      setConfigs(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải cấu hình hệ thống.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const filteredConfigs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return configs;

    return configs.filter((item) => {
      return (
        item.key.toLowerCase().includes(keyword) ||
        (item.description || "").toLowerCase().includes(keyword)
      );
    });
  }, [configs, searchTerm]);

  const handleEdit = (item: SystemConfig) => {
    setEditingKey(item.key);
    setDraftValue(item.value ?? "");
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setDraftValue("");
  };

  const handleSave = async () => {
    if (!editingKey) return;

    setSavingKey(editingKey);
    try {
      const updated = await updateSystemConfig(editingKey, draftValue.trim());
      setConfigs((prev) =>
        prev.map((item) =>
          item.key === editingKey
            ? {
                ...item,
                value: updated.value,
                updatedAt: updated.updatedAt,
              }
            : item
        )
      );
      toast.success("Cập nhật cấu hình thành công.");
      handleCancelEdit();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật cấu hình.";
      toast.error(message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Cấu hình hệ thống</h1>
          <p className="text-slate-400">Quản lý các thông số vận hành do Admin cấu hình.</p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCw size={16} />}
          onClick={fetchConfigs}
          disabled={loading}
        >
          Làm mới
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">Danh sách cấu hình</h2>

        <div className="relative min-w-80 max-w-110 w-full">
          <Input
            placeholder="Tìm theo key hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : filteredConfigs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Không có cấu hình phù hợp</div>
      ) : (
        <Table maxHeight="65vh">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">STT</TableHead>
              <TableHead className="w-70">Key</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-45">Cập nhật</TableHead>
              <TableHead className="w-45 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredConfigs.map((item, index) => {
              const isEditing = editingKey === item.key;
              const isSaving = savingKey === item.key;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-100">{item.key}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    ) : (
                      <span className="text-slate-200">{item.value}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-300">{item.description || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-400 text-sm">{formatDate(item.updatedAt || item.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={<Save size={14} />}
                                onClick={handleSave}
                                disabled={isSaving}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Lưu</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={<X size={14} />}
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Hủy</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Pencil size={14} />}
                              onClick={() => handleEdit(item)}
                              disabled={Boolean(editingKey)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
