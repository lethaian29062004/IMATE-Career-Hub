import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import BookMentorDialog from "@/pages/dialog/main/mentor/BookMentorDialog";
import { getMentorApplicationById } from "@/services/staffReviewService";
import type { StaffMentorApplication } from "@/types/response/staffReview.response";
import {
  ChevronLeft,
  Star,
  Calendar,
  Building2,
  Route,
  Link2,
  Code,
  Award,
  Heart,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const BENEFITS = [
  { icon: Route, text: "Lộ trình cá nhân hóa theo kỹ năng và mục tiêu của bạn" },
  { icon: Link2, text: "Cơ hội kết nối tuyển dụng tại các tập đoàn công nghệ lớn" },
  { icon: Code, text: "Review mã nguồn 1:1 theo chuẩn industry" },
  { icon: Award, text: "Chứng chỉ hoàn thành từ chuyên gia hàng đầu" },
];

const MentorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<StaffMentorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const fetchMentor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMentorApplicationById(Number(id));
      setMentor(data ?? null);
      if (!data) setError("Không tìm thấy hồ sơ mentor.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được chi tiết.");
      setMentor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const autoBook = queryParams.get("book") === "true";

  useEffect(() => {
    fetchMentor();
  }, [fetchMentor]);

  useEffect(() => {
    if (autoBook && mentor && !loading) {
      setBookDialogOpen(true);
    }
  }, [autoBook, mentor, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="min-h-screen bg-[#020617] font-sans">
        <main className="max-w-4xl mx-auto px-6 py-12 text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/view-mentor"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
          >
            <ChevronLeft className="w-4 h-4" /> Kết nối Mentor
          </Link>
        </main>
      </div>
    );
  }

  if (!mentor) return null;

  const titleText = mentor.positions?.length
    ? `${mentor.positions[0]} @ ${mentor.companies?.[0] ?? ""}`
    : mentor.companies?.[0]
      ? `@ ${mentor.companies[0]}`
      : "Mentor";
  const pricePerSession = mentor.pricePerSession != null ? Number(mentor.pricePerSession) : 0;
  const package5 = pricePerSession > 0 ? Math.round(pricePerSession * 5 * 0.9) : 0;
  const package10 = pricePerSession > 0 ? Math.round(pricePerSession * 10 * 0.8) : 0;
  const avgRatings = mentor.avgRatings;
  const totalRatingCount = mentor.totalRatingCount;

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-white">
      <main className="max-w-6xl mx-auto px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <Link
          to="/view-mentor"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kết nối Mentor
        </Link>

        {/* Profile card */}
        <div className="rounded-3xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-6 md:p-8 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_65%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
            {/* Avatar + badge */}
            <div className="flex flex-col items-center lg:items-start flex-shrink-0">
              <Avatar className="w-28 h-28 md:w-32 md:h-32 border-2 border-white/10 bg-white/5">
                <AvatarImage src={mentor.avatarUrl || undefined} alt={mentor.fullName} />
                <AvatarFallback name={mentor.fullName} />
              </Avatar>
              <span className="mt-3 rounded-lg bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0a0b14]">
                Mentor hàng đầu
              </span>
            </div>

            {/* Tên, chức danh, thống kê */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{mentor.fullName}</h1>
              <p className="flex items-center gap-2 text-slate-300 mb-6">
                <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{titleText}</span>
              </p>
              {(avgRatings != null || totalRatingCount != null) && (
                <div className="flex flex-wrap gap-8 mb-6">
                  {avgRatings != null && (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-lg">{avgRatings.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                        {totalRatingCount != null ? `${totalRatingCount} đánh giá` : "Đánh giá"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chi phí + nút Đặt lịch */}
            <div className="flex flex-col items-start lg:items-end flex-shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Chi phí cố vấn</p>
              <p className="text-xl md:text-2xl font-bold text-white mb-4">
                {pricePerSession > 0
                  ? `${pricePerSession.toLocaleString("vi-VN")}₫ / buổi`
                  : "—"}
              </p>
              <button
                type="button"
                onClick={() => setBookDialogOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5" /> Đặt lịch ngay
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-8">
            {mentor.bio && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">Giới thiệu bản thân</h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap space-y-3">
                  {mentor.bio.split(/\n\n+/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {mentor.skills?.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Kỹ năng</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((s) => (
                    <span
                      key={s}
                      className="px-4 py-2 rounded-lg bg-[#1a1b2e] border border-white/10 text-sm text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {mentor.companies?.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Công ty đã làm việc
                </h2>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {mentor.companies.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            )}

            {mentor.positions?.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Vị trí</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.positions.map((p) => (
                    <span
                      key={p}
                      className="px-4 py-2 rounded-lg bg-[#1a1b2e] border border-white/10 text-sm text-slate-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Đánh giá từ học viên - chỉ hiển thị khi có dữ liệu từ API */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Đánh giá từ học viên</h2>
              <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-6 text-center">
                <p className="text-slate-400 text-sm">
                  {totalRatingCount != null && totalRatingCount > 0
                    ? `Có ${totalRatingCount} đánh giá. Tính năng xem chi tiết đánh giá sẽ được cập nhật.`
                    : "Chưa có đánh giá nào."}
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar phải */}
          <div className="space-y-6">
            <section className="p-6 rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-white mb-4">Lợi ích khi học cùng Mentor</h2>
              <ul className="space-y-4">
                {BENEFITS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-300 pt-1.5">{item.text}</p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="p-6 rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-semibold text-white">Gói dịch vụ phổ biến</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Tiết kiệm hơn với các gói học tập dài hạn cùng Mentor.
              </p>
              <div className="space-y-3 mb-4">
                {package5 > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-300">Gói 5 buổi</span>
                    <span className="font-semibold text-white">{package5.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                {package10 > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-300">Gói 10 buổi</span>
                    <span className="font-semibold text-white">{package10.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10 cursor-not-allowed opacity-80"
              >
                Chọn gói dịch vụ
              </button>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Giao dịch được đảm bảo bởi IMATE. Tiền sẽ được hoàn trả nếu buổi cố vấn không diễn ra đúng cam kết.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Book Mentor Dialog */}
      <BookMentorDialog
        open={bookDialogOpen}
        onClose={() => setBookDialogOpen(false)}
        mentorName={mentor.fullName}
        mentorId={Number(id)}
        pricePerSession={pricePerSession}
      />
    </div>
  );
};

export default MentorDetail;
