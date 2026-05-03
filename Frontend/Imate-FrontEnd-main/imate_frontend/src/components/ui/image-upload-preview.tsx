import * as React from "react";
import { UploadCloud, Eye, Download, Edit, X, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (có thể điều chỉnh)
const DEFAULT_MAX_FILES = 5;

interface ImageUploadPreviewProps {
  imageUrl?: string | null; // URL hiện có (cho chế độ edit/single)
  selectedFile?: File | null; // file đơn (dùng khi !multiple)
  currentFiles?: File[]; // danh sách file (dùng khi multiple)
  onFileChange?: (file: File | null) => void; // callback cho single file
  onFilesChange?: (files: File[]) => void; // callback cho multiple
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string; // ví dụ: "image/*,video/mp4"
  allowView?: boolean;
  allowDownload?: boolean;
  allowChange?: boolean;
  allowRemove?: boolean;
  label?: string;
  subLabel?: string;
}

export function ImageUploadPreview({
  imageUrl,
  selectedFile,
  currentFiles = [],
  onFileChange,
  onFilesChange,
  disabled = false,
  size = "md",
  shape = "square",
  className,
  multiple = false,
  maxFiles = DEFAULT_MAX_FILES,
  accept = "image/*,video/mp4",
  allowView = true,
  allowDownload = true,
  allowChange = true,
  allowRemove = true,
  label = "TẢI LÊN",
  subLabel = "",
}: ImageUploadPreviewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sizePx = {
    sm: 80,
    md: 96,
    lg: 150,
  }[size];

  const shapeClasses = {
    square: "rounded-md",
    circle: "rounded-full",
  }[shape];

  const effectiveAllowChange = allowChange && !disabled;

  // Preview cho single file
  const singlePreviewUrl = React.useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    if (imageUrl) return imageUrl;
    return null;
  }, [selectedFile, imageUrl]);

  React.useEffect(() => {
    return () => {
      if (singlePreviewUrl && selectedFile) {
        URL.revokeObjectURL(singlePreviewUrl);
      }
    };
  }, [singlePreviewUrl, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);

    // Validation
    const validFiles: File[] = [];
    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(`File ${file.name} không phải ảnh hoặc video`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    if (!multiple) {
      // Single mode
      onFileChange?.(validFiles[0] || null);
    } else {
      // Multiple mode
      const updatedFiles = [...currentFiles, ...validFiles];
      if (updatedFiles.length > maxFiles) {
        toast.warn(`Chỉ được tải tối đa ${maxFiles} file`);
        onFilesChange?.(updatedFiles.slice(0, maxFiles));
      } else {
        onFilesChange?.(updatedFiles);
      }
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    if (!multiple || !onFilesChange) return;
    const updated = currentFiles.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = (fileOrUrl: File | string, fileName?: string) => {
    const url = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || (typeof fileOrUrl === "string" ? "preview" : fileOrUrl.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof fileOrUrl !== "string") URL.revokeObjectURL(url);
  };

  // ------------------- Single mode -------------------
  if (!multiple) {
    const hasImage = !!singlePreviewUrl;

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <div className="text-sm font-medium text-slate-200">{label}</div>
        )}
        {subLabel && (
          <div className="text-xs text-slate-400 mb-2">{subLabel}</div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              style={{ width: sizePx, height: sizePx }}
              className={cn(
                "relative overflow-hidden bg-slate-800 border border-slate-700 cursor-pointer transition-all hover:border-primary/50 group",
                shapeClasses,
                disabled && "cursor-not-allowed opacity-70"
              )}
            >
              {singlePreviewUrl ? (
                singlePreviewUrl.endsWith(".mp4") ||
                singlePreviewUrl.includes("video") ? (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900">
                    <FileVideo size={sizePx / 3} className="text-slate-400" />
                  </div>
                ) : (
                  <img
                    src={singlePreviewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500">
                  <UploadCloud size={sizePx / 3} />
                </div>
              )}

              {!disabled && effectiveAllowChange && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <UploadCloud className="text-white" size={sizePx / 3} />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-48">
            {allowView && hasImage && (
              <DropdownMenuItem onClick={() => handleView(singlePreviewUrl!)}>
                <Eye size={16} className="mr-2" /> Xem
              </DropdownMenuItem>
            )}
            {allowDownload && hasImage && (
              <DropdownMenuItem
                onClick={() =>
                  handleDownload(
                    singlePreviewUrl!,
                    selectedFile?.name || "preview.jpg"
                  )
                }
              >
                <Download size={16} className="mr-2" /> Tải xuống
              </DropdownMenuItem>
            )}
            {effectiveAllowChange && (
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Edit size={16} className="mr-2" /> {hasImage ? "Thay đổi" : "Chọn file"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // ------------------- Multiple mode -------------------
  return (
    <div className={cn("space-y-3", className)}>
      {label && <div className="text-sm font-medium text-slate-200">{label}</div>}
      {subLabel && <div className="text-xs text-slate-400">{subLabel}</div>}

      <div className="flex flex-wrap gap-3">
        {currentFiles.map((file, index) => {
          const url = URL.createObjectURL(file);
          const isVideo = file.type.startsWith("video/");

          return (
            <div key={index} className="relative group">
              <div
                style={{ width: sizePx, height: sizePx }}
                className={cn(
                  "overflow-hidden bg-slate-800 border border-slate-700 rounded-md",
                  shapeClasses
                )}
              >
                {isVideo ? (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900">
                    <FileVideo size={sizePx / 3} className="text-slate-400" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {allowRemove && !disabled && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X size={14} />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70"
                  >
                    <Eye size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allowView && (
                    <DropdownMenuItem onClick={() => handleView(url)}>
                      <Eye size={14} className="mr-2" /> Xem
                    </DropdownMenuItem>
                  )}
                  {allowDownload && (
                    <DropdownMenuItem
                      onClick={() => handleDownload(file, file.name)}
                    >
                      <Download size={14} className="mr-2" /> Tải xuống
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {currentFiles.length < maxFiles && effectiveAllowChange && (
          <div
            style={{ width: sizePx, height: sizePx }}
            className={cn(
              "flex flex-col items-center justify-center bg-slate-800 border border-slate-700 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors",
              disabled && "cursor-not-allowed opacity-60"
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <UploadCloud size={sizePx / 4} className="text-slate-400 mb-1" />
            <span className="text-xs text-slate-500">Thêm</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Đã chọn {currentFiles.length}/{maxFiles} file • Tối đa {maxFiles} file, mỗi file ≤ 5MB
      </p>

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || (multiple && currentFiles.length >= maxFiles)}
      />
    </div>
  );
}