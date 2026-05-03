import MentorInterviewHistory from "@/components/custom/MentorInterviewHistory";
import { History } from "lucide-react";

const MentorInterviewHistoryPage = () => {
  return (
    <div className="text-white p-6 max-w-6xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <History size={20} className="animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest">Hệ thống quản lý</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
            Lịch sử phỏng vấn
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Xem lại danh sách tất cả các buổi phỏng vấn đã thực hiện, đánh giá từ ứng viên và các bản ghi âm.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
         {/* Decorative element */}
         <div className="absolute -left-10 top-0 w-px h-full bg-gradient-to-b from-indigo-500/50 via-transparent to-transparent hidden md:block"></div>
         
         <MentorInterviewHistory />
      </div>
    </div>
  );
};

export default MentorInterviewHistoryPage;
