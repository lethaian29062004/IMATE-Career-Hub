import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Star, MessageSquare, User, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMentorRatings } from "@/services/mentorService";
import type { CandidateRatingsResponse, RatingDetail } from "@/types/response/rating.response";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MentorRatings = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CandidateRatingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      const result = await getMentorRatings();
      setData(result);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setError("Không thể tải dữ liệu đánh giá.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={cn(
              star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
            )}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] text-white">
        <p className="text-xl text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchRatings}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="text-white p-6 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Đánh giá từ ứng viên</h1>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-[#1A1A2E]/80 border-indigo-900/30 p-6 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-gray-400 mb-1">Đánh giá trung bình</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-indigo-400">
                {data?.averageRating?.toFixed(1) || "0.0"}
              </span>
              <div className="mb-2">
                {renderStars(Math.round(data?.averageRating || 0))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-indigo-500/10 rounded-2xl">
            <Star size={40} className="text-indigo-400" />
          </div>
        </Card>

        <Card className="bg-[#1A1A2E]/80 border-indigo-900/30 p-6 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-gray-400 mb-1">Tổng số lượt đánh giá</p>
            <span className="text-5xl font-bold text-emerald-400">
               {data?.totalRatingCount || 0}
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl">
            <MessageSquare size={40} className="text-emerald-400" />
          </div>
        </Card>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-indigo-400" />
          Chi tiết phản hồi
        </h2>

        {!data?.ratings || data.ratings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#1A1A2E]/50 rounded-3xl border border-dashed border-gray-700">
            <User size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400">Bạn chưa có lượt đánh giá nào từ ứng viên.</p>
          </div>
        ) : (
          data.ratings.map((review: RatingDetail) => (
            <Card key={review.bookingId} className="bg-[#1A1A2E]/80 border-white/5 p-6 hover:border-indigo-500/30 transition-all shadow-lg">
              <div className="flex flex-col md:flex-row gap-6">
                {/* User Column */}
                <div className="flex md:flex-col items-center md:items-center gap-4 md:w-32 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/20">
                    {review.candidateAvatar ? (
                      <img src={review.candidateAvatar} alt={review.candidateName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center">
                        <User size={24} className="text-indigo-300" />
                      </div>
                    )}
                  </div>
                  <div className="md:text-center">
                    <p className="font-bold text-white text-sm line-clamp-1">{review.candidateName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 md:justify-center">
                      <CalendarIcon size={12} />
                      {format(parseISO(review.createdAt), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-grow">
                  <div className="mb-3">
                    {renderStars(review.ratingScore)}
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-gray-300 italic leading-relaxed">
                      "{review.reviewText || "Không có nội dung phản hồi."}"
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MentorRatings;
