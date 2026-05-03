import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Calendar, Clock, Star, Activity } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getCandidateSessionHistory } from "@/services/bookingCandidateService";
import type { CandidateSessionSummaryResponse } from "@/types/response/booking.response";
import { format, parseISO } from "date-fns";

import ImateLoading from "@/components/custom/imateLoading";
import { toast } from "react-toastify";


const CandidateInterviewHistoryPage = () => {
  const [history, setHistory] = useState<CandidateSessionSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getCandidateSessionHistory();
        setHistory(data);
      } catch (error: any) {
        console.error("Error fetching candidate session history:", error);
        toast.error("Không thể tải dữ liệu lịch sử phỏng vấn.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) return <ImateLoading type="screen" />;

  return (
    <div className="text-white p-6 max-w-6xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <History size={20} className="animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest">Candidate Services</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
            Lịch sử phỏng vấn Mentor
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Xem lại danh sách tất cả các buổi phỏng vấn đã hoàn thành, video ghi lại và đánh giá của bạn.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className="absolute -left-10 top-0 w-px h-full bg-gradient-to-b from-indigo-500/50 via-transparent to-transparent hidden md:block"></div>
        
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#1A1A2E] rounded-3xl border border-white/5 shadow-xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Activity className="text-gray-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có dữ liệu</h3>
            <p className="text-gray-400 text-center">Bạn chưa hoàn thành buổi phỏng vấn nào với Mentor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((session) => (
              <div 
                key={session.bookingId}
                className="bg-[#1A1A2E] rounded-3xl border border-white/5 p-6 hover:border-indigo-500/30 transition-all shadow-xl group flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-transparent group-hover:border-indigo-500 transition-all">
                      <AvatarImage src={(session as any).profileAvatarUrl || session.mentorAvatarUrl || undefined} alt={session.mentorName} />
                      <AvatarFallback name={session.mentorName} />
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-white">{session.mentorName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          session.status === 2 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {session.status === 2 ? 'Đã hoàn thành' : 'Đã hủy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                    <Calendar size={16} className="text-indigo-400" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ngày</p>
                      <p className="text-sm font-semibold text-white">
                        {format(parseISO(session.startTime), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                    <Clock size={16} className="text-indigo-400" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Giờ</p>
                      <p className="text-sm font-semibold text-white">
                        {format(parseISO(session.startTime), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {session.ratingScore ? (
                      <>
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-bold text-white ml-1">{session.ratingScore}.0</span>
                        <span className="text-xs text-gray-500 ml-1">Đã đánh giá</span>
                      </>
                    ) : session.status === 2 ? (
                      <span className="text-xs text-gray-500">Chưa đánh giá</span>
                    ) : null}
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/candidate/interview-history/${session.bookingId}`)}
                    className="px-4 py-2 bg-white/5 hover:bg-indigo-600 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInterviewHistoryPage;
