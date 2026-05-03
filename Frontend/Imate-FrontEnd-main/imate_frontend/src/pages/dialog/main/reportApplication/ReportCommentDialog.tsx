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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { toast } from "react-toastify";
import { addReportCommentApplication } from "@/services/applicationService";

import { useAuth } from "@/store/AuthContext";
import { 
  ReportReason, 
  REPORT_REASON_LABELS, 
  type ReportReasonEnum 
} from "@/constants/enum";

interface ReportCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: number | null;
  onSuccess?: () => void;
}

export function ReportCommentDialog({
  open,
  onOpenChange,
  commentId,
  onSuccess,
}: ReportCommentDialogProps) {
  const { user } = useAuth();

  const [reason, setReason] = React.useState<ReportReasonEnum>(ReportReason.Spam);
  const [additionalDetails, setAdditionalDetails] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const resetForm = () => {
    setReason(ReportReason.Spam);
    setAdditionalDetails("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !commentId) {
      toast.error("Thiếu thông tin cần thiết");
      return;
    }

    if (reason === ReportReason.Other && !additionalDetails.trim()) {
      toast.error("Vui lòng nhập lý do chi tiết khi chọn 'Lý do khác'");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("commentId", commentId.toString());
    formData.append("reason", reason);
    if (additionalDetails.trim()) {
      formData.append("additionalDetails", additionalDetails.trim());
    }

    try {
      await addReportCommentApplication(formData, user.id);
      toast.success("Báo cáo bình luận đã được gửi thành công!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Gửi báo cáo thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-slate-100 max-h-[85vh] flex flex-col">
        
        {/* Header - Không scroll */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-white">
            Báo cáo bình luận
          </DialogTitle>
          <DialogDescription className="text-md text-slate-400 mt-1">Chọn lý do báo cáo <span className="text-red-400">*</span></DialogDescription>
        </DialogHeader>

        {/* Phần nội dung chính - Cho phép scroll */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scroll">
          <div className="space-y-3">

            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReportReasonEnum)}
              className="space-y-2"
            >
              {Object.entries(REPORT_REASON_LABELS).map(([key, label]) => (
                <div 
                  key={key} 
                  className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700"
                >
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="text-sm text-slate-200 cursor-pointer flex-1">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === ReportReason.Other && (
            <div className="space-y-2">
              <Label className="text-slate-200">
                Lý do chi tiết <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do bạn báo cáo bình luận này..."
                className="min-h-[110px] bg-slate-800 border-slate-700 resize-y"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Footer - Không scroll */}
        <DialogFooter className="flex-shrink-0 gap-3 pt-6 border-t border-slate-700 mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Hủy
            </Button>
          </DialogClose>

          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            className="min-w-[120px]"
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}