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
import { Switch } from "@/components/ui/switch";

import { updatePosition } from "@/services/positionService";
import type { FormUpdatePosition } from "@/types/request/position.request";

import { toast } from "react-toastify";

interface UpdatePositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: {
    id: number;
    name: string;
    isActive: boolean;
  } | null;
  onSuccess?: () => void;
}

export function UpdatePositionDialog({
  open,
  onOpenChange,
  position,
  onSuccess,
}: UpdatePositionDialogProps) {
  const [name, setName] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  // Đồng bộ state khi position thay đổi hoặc dialog mở
  React.useEffect(() => {
    if (position) {
      setName(position.name);
      setIsActive(position.isActive);
    }
  }, [position, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!position?.id) {
      toast.error("Không tìm thấy vị trí để cập nhật");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên vị trí");
      setLoading(false);
      return;
    }

    const payload: FormUpdatePosition = {
      name: name.trim(),
      isActive,
    };

    try {
      await updatePosition(position.id, payload);
      toast.success("Cập nhật vị trí thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Cập nhật vị trí thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Cập nhật vị trí
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên vị trí */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-200"
            >
              Tên vị trí <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên vị trí..."
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