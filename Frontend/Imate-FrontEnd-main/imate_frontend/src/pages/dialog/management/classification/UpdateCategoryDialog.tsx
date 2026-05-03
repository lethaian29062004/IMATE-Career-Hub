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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // ← thêm Switch component (nếu chưa có thì tạo đơn giản)

import { UpdateCategory } from "@/services/categoryService";
import type { CategoryUpdate } from "@/types/request/category.request";

import { toast } from "react-toastify";

interface UpdateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: number;
    name: string;
    isActive: boolean;
  };
  onSuccess?: () => void;
}

export function UpdateCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: UpdateCategoryDialogProps) {
  const [name, setName] = React.useState(category.name);
  const [isActive, setIsActive] = React.useState(category.isActive);
  const [loading, setLoading] = React.useState(false);
  // ...existing code...

  // Đồng bộ state khi category thay đổi
  React.useEffect(() => {
    setName(category.name);
    setIsActive(category.isActive);
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thể loại");
      setLoading(false);
      return;
    }

    const payload: CategoryUpdate = {
      name: name.trim(),
      isActive: isActive,
    };

    try {
      await UpdateCategory(payload, category.id);
      toast.success("Cập nhật thể loại thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Cập nhật thể loại thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Cập nhật thể loại
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên danh mục */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-200"
            >
              Tên thể loại <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên thể loại..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-primary/50"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              Trạng thái hoạt động
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {isActive ? "Hoạt động" : "Vô hiệu"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}