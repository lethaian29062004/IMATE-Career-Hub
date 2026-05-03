import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Ban, Edit } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { getMentorBookings, cancelBooking } from "@/services/bookingCandidateService";
import type { BookingDetailResponse } from "@/types/response/booking.response";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BookingDetailDialog from "@/pages/dialog/main/booking/BookingDetailDialog";

import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

type ViewMode = "Ngày" | "Tuần" | "Tháng";

const MentorInterviewSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Tuần");
  
  const [bookings, setBookings] = useState<BookingDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailResponse | null>(null);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMentorBookings();
      setBookings(data || []);
    } catch (err: any) {
      console.error("Error fetching mentor bookings:", err);
      setError("Không thể tải dữ liệu lịch hẹn.");
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc book theo ngày được chọn
  const selectedDateBookings = useMemo(() => {
    return bookings.filter(b => {
      const bDate = parseISO(b.bookDate);
      return isSameDay(bDate, selectedDate);
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, selectedDate]);

  // Các ngày trong tuần hiện tại
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Calendar Navigation
  const handlePrev = () => setCurrentDate(prev => subDays(prev, 7));
  const handleNext = () => setCurrentDate(prev => addDays(prev, 7));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Helper cho định dạng ngày giờ
  const formatTimeRange = (start: string, end: string) => {
    const startTimeStr = format(parseISO(start), "hh:mm a");
    const endTimeStr = format(parseISO(end), "hh:mm a");
    return `${startTimeStr} - ${endTimeStr}`;
  };

  // Kiểm tra ngày có event
  const hasEvents = (date: Date) => {
    return bookings.some(b => isSameDay(parseISO(b.bookDate), date));
  };

  // Xử lý action
  const handleJoinMeeting = (bookingId: number) => {
    navigate(`/video-call/${bookingId}`);
  };

  const isJoinable = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    // Tạm thời cho phép tham gia bất cứ lúc nào trước khi kết thúc (giả sử 1 tiếng sau start)
    const oneHourAfter = new Date(start.getTime() + 60 * 60 * 1000);
    
    return now <= oneHourAfter;
  };

  const handleCancelClick = (bookingId: number) => {
    setBookingToCancel(bookingId);
    setIsCancelDialogOpen(true);
  };

  const handleViewDetail = (booking: BookingDetailResponse) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    try {
      await cancelBooking(bookingToCancel);
      toast.success("Hủy lịch phỏng vấn thành công!");
      fetchBookings(); // Refresh list
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      const errorMsg = err.response?.data?.message || "Không thể hủy lịch phỏng vấn. Vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setIsCancelling(false);
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  return (
    <div className="text-white p-6 max-w-6xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Lịch làm việc</h1>
        <button 
          onClick={() => navigate("/mentor/manage-slots")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-semibold"
        >
          <Edit size={18} />
          Quản lý lịch làm việc
        </button>
      </div>

      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#1A1A2E] p-4 rounded-xl border border-gray-800">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <span className="text-xl font-medium min-w-[120px]">
            {format(currentDate, "MMMM, yyyy", { locale: vi })}
          </span>
          <div className="flex space-x-2">
            <button onClick={handlePrev} className="p-2 border border-gray-700 bg-gray-800/50 rounded-lg hover:bg-gray-700 transition">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className="p-2 border border-gray-700 bg-gray-800/50 rounded-lg hover:bg-gray-700 transition">
              <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={handleToday} className="px-4 py-2 text-sm border border-gray-700 bg-gray-800/50 rounded-lg hover:bg-gray-700 transition">
            Hôm nay
          </button>
        </div>

        <div className="flex bg-gray-800/50 p-1 rounded-lg border border-gray-700">
          {(["Ngày", "Tuần", "Tháng"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm rounded-md transition ${
                viewMode === mode ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* WEEK DAYS SELECTOR */}
      <div className="flex justify-between items-center mb-10 px-4">
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasEvent = hasEvents(day);
          
          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(day)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <span className={`text-sm mb-2 font-medium ${isSelected ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-200"}`}>
                {format(day, "E", { locale: vi })} {format(day, "d")}
              </span>
              <div 
                className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold transition-all relative
                  ${isSelected ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "text-gray-300 group-hover:bg-gray-800"}
                `}
              >
                {format(day, "d")}
                {hasEvent && (
                  <span className={`absolute -bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMELINE / EVENTS LIST */}
      <div className="relative pl-16 py-4">
        {/* Lõi thời gian trang trí trái */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-800 border-l border-dashed border-gray-700"></div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
           <div className="flex flex-col justify-center items-center py-20 text-gray-400">
            <Ban size={48} className="mb-4 text-red-500 opacity-80" />
            <p className="text-lg">Không thể tải dữ liệu lịch hẹn!</p>
            <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">Thử lại</button>
          </div>
        ) : selectedDateBookings.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-gray-400">
            <CalendarIcon size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Bạn không có lịch làm việc nào vào ngày này.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedDateBookings.map((booking, idx) => {
               // Render thẻ event card
               return (
                 <div key={idx} className="relative group">
                   {/* Dấu chấm trên timeline */}
                   <div className="absolute -left-10 top-6 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0B0F19] z-10"></div>
                   
                   {/* Hiển thị giờ bên trái timeline */}
                   <div className="absolute -left-24 top-4 text-xs font-semibold text-indigo-300 w-12 text-right">
                      {format(parseISO(booking.startTime), "hh:mm a")}
                   </div>

                   <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-indigo-900/30 p-5 rounded-2xl hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     
                     {/* Left: Info */}
                     <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-14 h-14 rounded-full flex items-center justify-center font-bold text-white border-2 border-indigo-500/30 overflow-hidden",
                         !booking.profileAvatarUrl && getAvatarColor(booking.profileName)
                       )}>
                         {booking.profileAvatarUrl ? (
                           <img 
                             src={booking.profileAvatarUrl} 
                             alt={booking.profileName} 
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <span>{getInitials(booking.profileName)}</span>
                         )}
                       </div>
                       <div>
                         <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {booking.profileName}
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700/50">
                               {booking.jobTitle?.toUpperCase()}
                            </span>
                         </h3>
                         <div className="flex items-center text-sm text-gray-400 mt-1 gap-3">
                           <span className="flex items-center gap-1.5 text-indigo-200/80 font-medium">
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                             {formatTimeRange(booking.startTime, booking.endTime)}
                           </span>
                           <span className="opacity-50">•</span>
                           <span className="flex items-center gap-1.5">
                             <Video size={14} className="text-gray-500" /> 
                             Phòng họp: <span className="text-gray-300 ml-1 font-mono text-xs bg-gray-800 px-1.5 py-0.5 rounded">{booking.meetingRoomId || "N/A"}</span>
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* Right: Actions */}
                     <div className="flex flex-wrap gap-2 md:justify-end mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800">
                       <button 
                         onClick={() => handleCancelClick(booking.bookingId)}
                         className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 border border-gray-700 rounded-xl transition-all"
                       >
                         Hủy lịch
                       </button>
                        <button 
                          onClick={() => handleViewDetail(booking)}
                          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all"
                        >
                          Xem chi tiết
                        </button>
                       <button 
                         onClick={() => handleJoinMeeting(booking.bookingId)}
                         disabled={!isJoinable(booking.startTime)}
                         className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                           isJoinable(booking.startTime) 
                             ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]" 
                             : "bg-gray-600 cursor-not-allowed shadow-none"
                         }`}
                       >
                         Bắt đầu buổi phỏng vấn
                       </button>
                     </div>

                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A2E] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy lịch phỏng vấn?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn hủy lịch phỏng vấn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              Bỏ qua
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isCancelling ? "Đang xử lý..." : "Đồng ý"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BookingDetailDialog 
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        booking={selectedBooking}
        userRole="Mentor"
      />
    </div>
  );
};

export default MentorInterviewSchedule;
