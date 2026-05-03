import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  Info,
  XCircle,
  Video,
  ExternalLink
} from "lucide-react";
import { getMentorSessionDetail } from "@/services/bookingCandidateService";
import type { BookingDetailResponse } from "@/types/response/booking.response";
import ImateLoading from "@/components/custom/imateLoading";
import { toast } from "react-toastify";

import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

const MentorInterviewHistoryDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<BookingDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!sessionId) return;
      try {
        const data = await getMentorSessionDetail(parseInt(sessionId));
        setSession(data);
      } catch (error: any) {
        console.error("Error fetching session detail:", error);
        toast.error("Không thể tải thông tin chi tiết buổi học.");
        navigate("/mentor/interview-history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [sessionId, navigate]);

  if (isLoading) return <ImateLoading type="screen" />;
  if (!session) return null;

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 2: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case 3: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2: return "Đã hoàn thành";
      case 3: return "Đã hủy";
      default: return "Khác";
    }
  };

  return (
    <div className="text-white p-6 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/mentor/interview-history")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-600 transition-all">
          <ArrowLeft size={18} />
        </div>
        <span className="font-semibold">Quay lại lịch sử</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recording & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recording Section */}
          <div className="bg-[#1A1A2E] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video size={20} className="text-indigo-400" />
                <h3 className="text-xl font-bold">Video ghi lại buổi học</h3>
              </div>
              {session.recordingUrls && session.recordingUrls.length > 0 && (
                <a 
                  href={session.recordingUrls[selectedVideoIndex]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  Mở {session.recordingUrls.length > 1 ? `Phần ${selectedVideoIndex + 1}` : "video"} trong tab mới
                </a>
              )}
            </div>
            
            <div className="aspect-video bg-[#0B0F19] relative flex flex-col items-center justify-center">
              {session.recordingUrls && session.recordingUrls.length > 0 ? (
                <>
                  <video 
                    key={session.recordingUrls[selectedVideoIndex]}
                    controls 
                    className="w-full h-full object-contain"
                  >
                    <source src={session.recordingUrls[selectedVideoIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {session.recordingUrls.length > 1 && (
                    <div className="absolute bottom-12 left-0 right-0 p-4 flex justify-center gap-2 pointer-events-none">
                      <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-2xl pointer-events-auto border border-white/10">
                        {session.recordingUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedVideoIndex(index)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedVideoIndex === index 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            Phần {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="text-gray-600" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Không tìm thấy bản ghi</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Bản ghi video không khả dụng cho buổi học này. Điều này có thể do buổi học bị hủy hoặc lỗi trong quá trình lưu trữ.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Review */}
          {session.status === 2 && (
            <div className="bg-[#1A1A2E] rounded-3xl border border-white/5 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Star size={120} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-amber-400">
                  <Star size={24} fill="currentColor" />
                  Đánh giá từ ứng viên
                </h3>
                
                {session.ratingScore ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="text-5xl font-black text-white">
                         {session.ratingScore}.0
                       </div>
                       <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={20} 
                                fill={i < (session.ratingScore || 0) ? "currentColor" : "none"} 
                                className={i < (session.ratingScore || 0) ? "" : "text-gray-700"}
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm mt-1">Đánh giá độ hài lòng</span>
                       </div>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 italic text-gray-300 leading-relaxed relative">
                      <div className="absolute -top-4 left-4 text-4xl text-indigo-500/30 font-serif">"</div>
                      {session.reviewText || "Ứng viên không để lại lời nhắn."}
                      <div className="absolute -bottom-10 right-4 text-4xl text-indigo-500/30 font-serif rotate-180">"</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-gray-500 bg-white/5 p-6 rounded-2xl border border-dashed border-white/10">
                    <Info size={24} />
                    <p>Ứng viên chưa gửi đánh giá cho buổi học này.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Participant & Details */}
        <div className="space-y-6">
          {/* Candidate Card */}
          <div className="bg-[#1A1A2E] rounded-3xl border border-white/5 p-6 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
            
            <div className="relative z-10 mt-4">
              <div className="relative inline-block mb-4">
                <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center font-bold text-white border-4 border-[#1A1A2E] shadow-2xl mx-auto overflow-hidden",
                  !session.profileAvatarUrl && getAvatarColor(session.profileName)
                )}>
                  {session.profileAvatarUrl ? (
                    <img 
                      src={session.profileAvatarUrl} 
                      alt={session.profileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{getInitials(session.profileName)}</span>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#1A1A2E] ${session.status === 2 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              </div>
              <h3 className="text-2xl font-black text-white px-4 truncate">{session.profileName}</h3>
              <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase mt-1">Ứng viên</p>
              
              <div className="mt-8 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <Calendar size={14} />
                      Ngày
                   </div>
                   <span className="text-sm font-bold text-white">
                     {format(parseISO(session.bookDate), "dd MMMM, yyyy", { locale: vi })}
                   </span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <Clock size={14} />
                      Giờ
                   </div>
                   <span className="text-sm font-bold text-white">
                     {format(parseISO(session.startTime), "HH:mm")} - {format(parseISO(session.endTime), "HH:mm")}
                   </span>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <Info size={14} />
                      Trạng thái
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusStyle(session.status)}`}>
                     {getStatusText(session.status)}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Metadata */}
          <div className="bg-[#1A1A2E] rounded-3xl border border-white/5 p-6 shadow-xl">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
               <Info size={18} className="text-gray-500" />
               Thông tin bổ sung
            </h4>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Mã buổi học</label>
                  <p className="text-sm font-mono text-gray-300 mt-1">#IMATE-B{session.bookingId.toString().padStart(5, '0')}</p>
               </div>
               <div>
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Phòng họp</label>
                  <p className="text-sm font-mono text-gray-300 mt-1">{session.meetingRoomId || "Không có"}</p>
               </div>
               <div>
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Phí buổi học</label>
                  <p className="text-lg font-black text-indigo-400 mt-1">{session.price.toLocaleString()} imCoin</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorInterviewHistoryDetailPage;
