import React from "react";
import { X, Calendar, Clock, Video, CreditCard, Tag, CheckCircle2, XCircle, AlertCircle, Timer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { BookingDetailResponse } from "@/types/response/booking.response";
import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailResponse | null;
  userRole: "Mentor" | "Candidate";
}

const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({
  open,
  onClose,
  booking,
  userRole,
}) => {
  if (!open || !booking) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "HH:mm");
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return {
          label: "Chờ xác nhận",
          color: "text-amber-400",
          bgColor: "bg-amber-400/10",
          borderColor: "border-amber-400/20",
          icon: <Timer size={16} />
        };
      case 1:
        return {
          label: "Đã xác nhận",
          color: "text-indigo-400",
          bgColor: "bg-indigo-400/10",
          borderColor: "border-indigo-400/20",
          icon: <CheckCircle2 size={16} />
        };
      case 2:
        return {
          label: "Đã hoàn thành",
          color: "text-emerald-400",
          bgColor: "bg-emerald-400/10",
          borderColor: "border-emerald-400/20",
          icon: <CheckCircle2 size={16} />
        };
      case 3:
        return {
          label: "Đã hủy",
          color: "text-red-400",
          bgColor: "bg-red-400/10",
          borderColor: "border-red-400/20",
          icon: <XCircle size={16} />
        };
      default:
        return {
          label: "Không xác định",
          color: "text-gray-400",
          bgColor: "bg-gray-400/10",
          borderColor: "border-gray-400/20",
          icon: <AlertCircle size={16} />
        };
    }
  };

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-lg bg-[#11142D] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Chi tiết lịch phỏng vấn</h2>
            <p className="text-slate-400 text-xs">Mã đặt lịch: #{booking.bookingId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color} font-bold text-xs uppercase tracking-wider`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>

          {/* Participant Info */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white border-2 border-indigo-500/20 overflow-hidden",
                !booking.profileAvatarUrl && getAvatarColor(booking.profileName)
              )}>
                {booking.profileAvatarUrl ? (
                  <img 
                    src={booking.profileAvatarUrl} 
                    alt={booking.profileName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">{getInitials(booking.profileName)}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#11142D] rounded-full" />
            </div>
            <div>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-0.5">
                {userRole === "Mentor" ? "Ứng viên" : "Mentor"}
              </p>
              <h3 className="text-lg font-bold text-white">{booking.profileName}</h3>
              {booking.jobTitle && (
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                  <Tag size={12} className="text-indigo-400" />
                  {booking.jobTitle}
                </p>
              )}
            </div>
          </div>

          {/* Schedule Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-600/20">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ngày phỏng vấn</p>
                  <p className="text-white font-bold text-sm">{formatDate(booking.bookDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-600/20">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Thời gian</p>
                  <p className="text-white font-bold text-sm">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Thời lượng: 60 phút</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/20">
                  <Video size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Hình thức</p>
                  <p className="text-white font-bold text-sm">Trực tuyến</p>
                  {booking.meetingRoomId && (
                    <p className="text-indigo-400 text-[11px] font-mono mt-1 bg-indigo-400/5 px-1.5 py-0.5 rounded border border-indigo-400/10 inline-block">
                      Room ID: {booking.meetingRoomId}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-600/20">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Chi phí</p>
                  <p className="text-white font-bold text-sm">
                    {booking.price?.toLocaleString("vi-VN")} imCoin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating & Review (if completed) */}
          {booking.status === 2 && booking.ratingScore && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Đánh giá từ ứng viên</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= (booking.ratingScore || 0) ? "text-yellow-400" : "text-slate-600"}>
                    ★
                  </span>
                ))}
                <span className="text-white font-bold ml-2">{booking.ratingScore}/5</span>
              </div>
              {booking.reviewText && (
                <p className="text-slate-300 text-sm italic">"{booking.reviewText}"</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold border border-transparent hover:border-white/10"
          >
            Đóng
          </button>
          {booking.status === 1 && (
            <button 
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => {
                // Logic to join/start meeting could go here
                window.location.href = `/video-call/${booking.bookingId}`;
              }}
            >
              {userRole === "Mentor" ? "Bắt đầu buổi học" : "Tham gia buổi học"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailDialog;
