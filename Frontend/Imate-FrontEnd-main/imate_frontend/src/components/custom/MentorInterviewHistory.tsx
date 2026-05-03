import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  History, 
  Search, 
  Calendar, 
  Star, 
  ChevronRight, 
  Filter
} from "lucide-react";
import { getMentorSessionHistory } from "@/services/bookingCandidateService";
import type { MentorSessionSummaryResponse } from "@/types/response/booking.response";
import ImateLoading from "./imateLoading";

import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

const MentorInterviewHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<MentorSessionSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMentorSessionHistory();
        setHistory(data || []);
      } catch (error) {
        console.error("Error fetching mentor history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.candidateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 2: // Completed
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 3: // Cancelled
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case 4: // Refunded
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2: return "Đã hoàn thành";
      case 3: return "Đã hủy";
      case 4: return "Đã hoàn tiền";
      default: return "Khác";
    }
  };

  if (isLoading) return <ImateLoading type="component" />;

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1A1A2E]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm ứng viên..."
            className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0B0F19] border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all">
            <Filter size={16} />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((session) => (
            <div 
              key={session.bookingId}
              onClick={() => navigate(`/mentor/interview-history/${session.bookingId}`)}
              className="group relative overflow-hidden bg-[#1A1A2E]/80 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/5"
            >
              {/* Background Glow */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-600/5 blur-[80px] group-hover:bg-indigo-600/10 transition-all"></div>
              
              <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
                {/* Candidate Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white border border-white/10 overflow-hidden",
                      !session.candidateAvatarUrl && getAvatarColor(session.candidateName)
                    )}>
                      {session.candidateAvatarUrl ? (
                        <img 
                          src={session.candidateAvatarUrl} 
                          alt={session.candidateName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(session.candidateName)}</span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A1A2E] ${session.status === 2 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                      {session.candidateName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <Calendar size={12} className="text-indigo-400" />
                        {format(parseISO(session.startTime), "dd/MM/yyyy", { locale: vi })}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${getStatusStyle(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Summary / Rating */}
                <div className="flex flex-wrap items-center gap-6">
                  {session.status === 2 && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < (session.ratingScore || 0) ? "currentColor" : "none"} 
                            className={i < (session.ratingScore || 0) ? "" : "text-gray-600"}
                          />
                        ))}
                      </div>
                      {session.reviewText && (
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate italic">
                          "{session.reviewText}"
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-semibold">Chi tiết</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#1A1A2E]/30 rounded-3xl border border-dashed border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <History className="text-gray-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có lịch sử phỏng vấn</h3>
            <p className="text-gray-500 max-w-sm text-center px-4">
              Các buổi phỏng vấn đã hoàn thành hoặc bị hủy sẽ xuất hiện tại đây để bạn có thể theo dõi lại.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorInterviewHistory;
