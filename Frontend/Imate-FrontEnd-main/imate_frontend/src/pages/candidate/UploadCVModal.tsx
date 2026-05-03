import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CloudUpload, FileText, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { uploadCV } from "@/services/cvService";
import { CV_UPLOAD } from "@/constants/common";
import { MSG18, MSG22, MSG23, MSG07 } from "@/constants/messages";

interface UploadCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadCVModal({ open, onOpenChange }: UploadCVModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (params: { file: File; fileName: string }) =>
      uploadCV(params.file, params.fileName),
    onSuccess: () => {
      toast.success(MSG22);
      queryClient.invalidateQueries({ queryKey: ["cv-list"] });
      handleClose();
    },
    onError: (error: any) => {
      const message = error?.message || "";
      // AI Engine reject → MSG23, otherwise → MSG07
      if (
        message.includes("không hợp lệ") ||
        message.includes("invalid") ||
        message.includes("IT")
      ) {
        toast.error(MSG23);
      } else {
        toast.error(MSG07);
      }
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    setCvName("");
    setDragActive(false);
    onOpenChange(false);
  };

  const validateFile = (file: File): boolean => {
    const isValidType = CV_UPLOAD.ACCEPTED_TYPES.includes(file.type as any);
    const isValidSize = file.size <= CV_UPLOAD.MAX_SIZE_BYTES;

    if (!isValidType || !isValidSize) {
      toast.error(MSG18);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      const finalName = cvName.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
      uploadMutation.mutate({ file: selectedFile, fileName: finalName });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên CV của bạn</DialogTitle>
          <DialogDescription>
            Hỗ trợ {CV_UPLOAD.ACCEPTED_DISPLAY} (tối đa {CV_UPLOAD.MAX_SIZE_MB}MB)
          </DialogDescription>
        </DialogHeader>

        {/* CV Name Input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tên CV
          </label>
          <input
            type="text"
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            placeholder="VD: CV Backend Developer 2024"
            maxLength={255}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50"
          />
        </div>

        {/* Drop Zone */}
        <div
          className={`
            relative flex flex-col items-center justify-center gap-3 
            rounded-lg border-2 border-dashed p-8 
            transition-all duration-200 cursor-pointer
            ${
              dragActive
                ? "border-neon-blue bg-neon-blue/5"
                : selectedFile
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={CV_UPLOAD.ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
                <CloudUpload className="h-6 w-6 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">
                  Tải lên CV của bạn (PDF, DOCX)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kéo & Thả tệp tại đây hoặc nhấp để chọn tệp.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploadMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-purple-500" />
            <span>Đang tải lên và phân tích CV...</span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Đang tải lên..." : "Tải lên CV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
