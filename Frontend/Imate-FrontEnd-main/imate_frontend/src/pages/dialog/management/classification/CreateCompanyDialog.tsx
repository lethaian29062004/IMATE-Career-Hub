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
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import { addCompany } from "@/services/companyService";
import type { FormAddCompanyRequest } from "@/types/request/company.request";
import { ImageUploadPreview } from "@/components/ui/image-upload-preview";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [name, setName] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form khi bấm "Hủy" hoặc submit thành công
  const resetForm = () => {
    setName("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên công ty");
      setLoading(false);
      return;
    }

    const payload: FormAddCompanyRequest = {
      name: name.trim(),
      imageFile,
    };

    try {
      await addCompany(payload);
      toast.success("Thêm công ty thành công!");
      resetForm(); // Reset sau thành công
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Thêm công ty thất bại. Vui lòng thử lại.";
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
            Thêm công ty mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin để thêm công ty mới vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên công ty */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-200">
              Tên công ty <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên công ty..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-primary/50"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Logo - dùng component mới */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200">
              Logo công ty (tùy chọn - tối đa 5MB)
            </Label>
            <div className="flex justify-start">
              <ImageUploadPreview
                selectedFile={imageFile}
                onFileChange={setImageFile}
                disabled={loading}
                size="lg" 
                shape="square"
                allowView={true}
                allowDownload={true}
                allowChange={true}
              />
            </div>
          </div>

          <DialogFooter>
            {/* Nút Hủy - reset form */}
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={resetForm} // Reset khi bấm Hủy
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}