import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { addAccount } from "@/services/accountService";
import { MSG01, MSG09, MSG43, MSG44 } from "@/constants/messages";

interface CreateStaffModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStaffModal({ open, onClose, onCreated }: CreateStaffModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { fullName?: string; email?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = MSG01;
    }

    if (!email.trim()) {
      newErrors.email = MSG01;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = MSG01;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      
      //await addAccount({ fullName: fullName.trim(), email: email.trim() });
      await addAccount({ fullName: fullName.trim(), email: email.trim() });
      toast.success(MSG09);
      resetForm();
      onCreated();
      onClose();
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.response?.data?.Message || "";

      if (status === 409) {
        // Duplicate email
        toast.error(MSG44);
      } else if (message.includes("email")) {
        // Email sending failure — account created but email failed
        toast.warning(MSG43);
        resetForm();
        onCreated();
        onClose();
      } else {
        toast.error(MSG43);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[460px] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">
            Tạo tài khoản cho Nhân viên
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="staff-fullname" className="text-sm font-medium text-slate-300">
              Họ và tên<span className="text-red-400">*</span>
            </Label>
            <Input
              id="staff-fullname"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-500/50"
            />
            {errors.fullName && (
              <p className="text-xs text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="staff-email" className="text-sm font-medium text-slate-300">
              Email<span className="text-red-400">*</span>
            </Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="example.email@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-500/50"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
