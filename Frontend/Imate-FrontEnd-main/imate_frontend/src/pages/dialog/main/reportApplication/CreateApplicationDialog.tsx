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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "react-toastify";
import { ImageUploadPreview } from "@/components/ui/image-upload-preview";
import { AlertTriangle, Info, ThumbsDown, ThumbsUp } from "lucide-react";

import {
  addApplicationTechnical,
  addApplicationMentor,
  // ...existing code...
} from "@/services/applicationService";

import { useAuth } from "@/store/AuthContext";
import { 
  ApplicationType, 
  APPLICATION_TYPE_OPTIONS, 
  type ApplicationTypeEnum
} from "@/constants/enum";

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultType?: ApplicationTypeEnum;
  defaultBookingId?: string | number;
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultType,
  defaultBookingId,
}: CreateApplicationDialogProps) {
  const { user } = useAuth();

  const [type, setType] = React.useState<ApplicationTypeEnum>(defaultType || ApplicationType.TechnicalError);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [bookingId, setBookingId] = React.useState(defaultBookingId?.toString() || "");
  // ...existing code...

  // Update values if props change (useful when opening for different sessions)
  React.useEffect(() => {
    if (open) {
      if (defaultType) setType(defaultType);
      if (defaultBookingId) setBookingId(defaultBookingId.toString());
    }
  }, [open, defaultType, defaultBookingId]);

  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);

  const isReportComment = type === ApplicationType.ReportComment;

  const resetForm = () => {
    setType(defaultType || ApplicationType.TechnicalError);
    setTitle("");
    setContent("");
    setBookingId(defaultBookingId?.toString() || "");
    setEvidenceFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung chi tiết");
      return;
    }
    if (evidenceFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 bằng chứng");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

    try {
      // ...existing code...

      switch (type) {
        case ApplicationType.TechnicalError:
          await addApplicationTechnical(formData, user.id);
          break;
        case ApplicationType.ReportMentor:
          if (!bookingId || isNaN(Number(bookingId))) {
            toast.error("Vui lòng nhập Booking ID hợp lệ");
            setLoading(false);
            return;
          }
          formData.append("bookingId", bookingId.trim());
          await addApplicationMentor(formData, user.id);
          break;
        default:
          toast.error("Loại đơn không hợp lệ");
          setLoading(false);
          return;
      }

      toast.success("Gửi đơn thành công!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Gửi đơn thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    if (files.length > 5) {
      toast.warn("Chỉ được tải lên tối đa 5 file");
      setEvidenceFiles(files.slice(0, 5));
    } else {
      setEvidenceFiles(files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-700 text-slate-100 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Tạo đơn mới
          </DialogTitle>
          <DialogDescription className="sr-only">Form tạo đơn mới</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="h-px bg-slate-700" />
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Thông tin đơn <span className="text-red-400">*</span>
            </h3>

            {/* Loại đơn — luôn hiển thị */}
            <div className="space-y-2">
              <Label className="text-slate-200">
                Loại đơn <span className="text-red-400">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ApplicationTypeEnum)}
                disabled={loading || !!defaultType}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Booking ID - hiện khi không phải TechnicalError */}
            {type !== ApplicationType.TechnicalError && (
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Mã Booking <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Nhập ID buổi học (ví dụ: 101)"
                  className="bg-slate-800 border-slate-700"
                  disabled={loading || !!defaultBookingId}
                />
              </div>
            )}

            {/* Hướng dẫn khi chọn ReportComment */}
            {isReportComment && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 space-y-4">
                <div className="flex items-center gap-2 text-blue-300">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">Hướng dẫn báo cáo bình luận</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Nhấn vào icon{" "}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  </span>{" "}
                  ở góc trên bên phải của bình luận để tạo đơn báo cáo.
                </p>

                {/* Comment mô phỏng */}
                <div className="rounded-lg border border-slate-600 bg-slate-800/60 p-3 space-y-3">
                  {/* Header comment */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-medium text-indigo-200 flex-shrink-0">
                        NV
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">Nguyễn Văn A</p>
                        <p className="text-xs text-slate-400">28/03/2026, 09:14</p>
                      </div>
                    </div>

                    {/* Icon báo cáo với highlight */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/30 px-2 py-1 rounded">
                        Bấm vào đây
                      </span>
                      <div className="relative">
                        {/* Vòng pulse */}
                        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
                        <div className="relative w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nội dung comment */}
                  <p className="text-sm text-slate-400 italic">
                    Đây là nội dung bình luận mẫu...
                  </p>

                  {/* Vote row */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-600 text-xs text-slate-400">
                      <ThumbsUp className="w-3 h-3" /> 2
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-600 text-xs text-slate-400">
                      <ThumbsDown className="w-3 h-3" /> 0
                    </span>
                    <span className="text-sm font-semibold text-violet-400 ml-1">+2</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  * Đây chỉ là bình luận mô phỏng minh họa cách thực hiện.
                </p>
              </div>
            )}

            {/* Các field chỉ hiện khi KHÔNG phải ReportComment */}
            {!isReportComment && (
              <>

                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Tiêu đề <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Lỗi không tải được video bài học"
                    className="bg-slate-800 border-slate-700"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Nội dung chi tiết <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả rõ ràng vấn đề bạn đang gặp phải..."
                    className="bg-slate-800 border-slate-700 min-h-[110px] resize-y"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Bằng chứng — ẩn khi ReportComment */}
          {!isReportComment && (
            <div className="space-y-4">
              <div className="h-px bg-slate-700" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Bằng chứng đính kèm <span className="text-red-400">*</span>
              </h3>
              <ImageUploadPreview
                multiple={true}
                currentFiles={evidenceFiles}
                onFilesChange={handleFilesChange}
                disabled={loading}
                size="lg"
                shape="square"
                maxFiles={5}
                accept="image/*,video/mp4"
                label="Tải lên ảnh, video minh chứng"
                allowRemove={true}
                allowDownload={false}
              />
              <div className="h-px bg-slate-700" />
            </div>
          )}

          <DialogFooter className="gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={resetForm}
              >
                {isReportComment ? "Đóng" : "Hủy"}
              </Button>
            </DialogClose>

            {/* Nút Gửi đơn — ẩn khi ReportComment */}
            {!isReportComment && (
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !title.trim() || !content.trim() || evidenceFiles.length === 0}
                className="min-w-[130px]"
              >
                {loading ? "Đang gửi đơn..." : "Gửi đơn"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}