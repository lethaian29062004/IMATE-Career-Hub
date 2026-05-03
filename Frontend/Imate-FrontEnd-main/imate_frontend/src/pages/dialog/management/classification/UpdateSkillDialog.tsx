import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { updateSkill } from "@/services/skillService";
import type { FormUpdateSkill } from "@/types/request/skill.request";

interface UpdateSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: {
    id: number;
    name: string;
    isActive: boolean;
  };
  onSuccess?: () => void;
}

export function UpdateSkillDialog({ open, onOpenChange, skill, onSuccess }: UpdateSkillDialogProps) {
  const [name, setName] = React.useState(skill.name);
  const [isActive, setIsActive] = React.useState(skill.isActive);
  const [loading, setLoading] = React.useState(false);
  // ...existing code...

  React.useEffect(() => {
    setName(skill.name);
    setIsActive(skill.isActive);
  }, [skill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên kĩ năng");
      setLoading(false);
      return;
    }

    const payload: FormUpdateSkill = {
      name: name.trim(),
      isActive,
    };

    try {
      await updateSkill(skill.id, payload);
      toast.success("Cập nhật kĩ năng thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Cập nhật kĩ năng thất bại.";
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
            Cập nhật kĩ năng
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">
              Tên kĩ năng <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên kĩ năng..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-primary/50"
              disabled={loading}
              autoFocus
            />
          </div>

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
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}