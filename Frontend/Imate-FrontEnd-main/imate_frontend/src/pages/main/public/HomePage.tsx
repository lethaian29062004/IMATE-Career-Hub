import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getListPreviewMentors } from '../../../services/mentorService';
import { getListHotQuestions } from '../../../services/questionService';
import type { ListPreviewMentorResponse } from '../../../types/common/mentor';
import type { ListHotQuestionResponse } from '../../../types/common/question';

const HomePage: React.FC = () => {
  const [mentors, setMentors] = useState<ListPreviewMentorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ListHotQuestionResponse[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -324, behavior: 'smooth' }); // 300 (card) + 24 (gap)
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 324, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await getListPreviewMentors({});
        setMentors(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch mentors:', err);
        setError('Không thể tải danh sách mentor. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const data = await getListHotQuestions();
        setQuestions(data);
        setQuestionsError(null);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setQuestionsError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchMentors();
    fetchQuestions();
  }, []);

  return (
    <div className="font-sans">
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden">
          <div className="hero-glow"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">AI-Powered Tech Interviews</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
              Chinh phục mọi cuộc <br />
              <span className="neon-gradient-text">phỏng vấn IT với AI</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Nền tảng luyện tập phỏng vấn thông minh, kết nối chuyên gia hàng đầu giúp bạn bứt phá sự nghiệp công nghệ.
            </p>
            <div className="flex justify-center mb-20">
              <Link
                to="/practice-with-ai"
                className="w-full sm:w-auto px-12 py-4 bg-white text-[#0f172a] font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                Luyện tập ngay <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
            </div>
            <div className="pt-12 border-t border-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
                Học viên của chúng tôi đang làm việc tại
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all">
                <span className="text-2xl font-bold text-white tracking-tighter">TECHCOM</span>
                <span className="text-2xl font-bold text-white tracking-tighter">VNG</span>
                <span className="text-2xl font-bold text-white tracking-tighter">FPT</span>
                <span className="text-2xl font-bold text-white tracking-tighter">VIETTEL</span>
                <span className="text-2xl font-bold text-white tracking-tighter">MOMO</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Interview Mockup Section */}
        <section className="py-24 px-6 bg-[#020617] relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 perspective-card relative">
              <div className="tilted-mockup bg-[#1e293b] rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-mono">
                    imate.vn/practice-with-ai
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      alt="AI Avatar"
                      className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-xl shadow-indigo-500/20"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7lIZxbcXYMA55MyRh0LQthnEuT0cVgPib20pt2a8MgMIEMgiModrWhfi1xF9C7-aA8huFzP6Q84eylE41XTL5Bds3iqGZ1l3KZh0_IjECf2XBBMRe1fEGdb9SxTqZN33bcY6VqjxP_BQJbwbmeYfdOmW_LKc1MeqtKFc7LvW1HqxSgRvS2y54B_p0OaTTcp0XHYNaW5FyTDFQDLeMoRtZMpCOyZBXvTQcVXa-6OBGlOGiaAu_sLbqPW34087wMn-n_Qjj3ph6bA"
                    />
                    <div>
                      <div className="h-2 w-32 bg-slate-700 rounded-full mb-2"></div>
                      <div className="h-2 w-20 bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-[#020617] rounded-2xl p-6 h-48 flex items-center justify-center border border-white/5">
                    <div className="flex items-end gap-1 h-12">
                      <div className="w-1 bg-indigo-500 rounded-full h-8 animate-[pulse_1s_infinite]"></div>
                      <div className="w-1 bg-indigo-500 rounded-full h-12 animate-[pulse_1.2s_infinite]"></div>
                      <div className="w-1 bg-indigo-500 rounded-full h-6 animate-[pulse_0.8s_infinite]"></div>
                      <div className="w-1 bg-purple-500 rounded-full h-10 animate-[pulse_1.1s_infinite]"></div>
                      <div className="w-1 bg-purple-500 rounded-full h-4 animate-[pulse_0.9s_infinite]"></div>
                      <div className="w-1 bg-cyan-400 rounded-full h-8 animate-[pulse_1s_infinite]"></div>
                      <div className="w-1 bg-cyan-400 rounded-full h-12 animate-[pulse_1.2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-500 mb-1">Confidence Score</div>
                      <div className="text-xl font-bold text-cyan-400">92%</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-500 mb-1">Keywords Used</div>
                      <div className="text-xl font-bold text-purple-500">14/15</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 floating p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="material-symbols-outlined text-cyan-400">check_circle</span> Phản hồi 1:1
                </span>
              </div>
              <div className="absolute -bottom-10 -left-6 floating [animation-delay:1.5s] p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="material-symbols-outlined text-purple-500">analytics</span> Chấm điểm tự động
                </span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Môi trường giả lập <br />
                phòng phỏng vấn thực tế
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Thuật toán AI thế hệ mới sẽ đóng vai trò là Senior Interviewer, đưa ra các câu hỏi hóc búa và phân tích sâu
                sắc về thái độ, kiến thức cũng như cách diễn đạt của bạn.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-indigo-500 text-sm">bolt</span>
                  </div>
                  <p className="text-slate-300 font-medium">Nhận xét chi tiết ngay sau khi kết thúc buổi phỏng vấn.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-purple-500 text-sm">psychology</span>
                  </div>
                  <p className="text-slate-300 font-medium">Tự động gợi ý những lỗ hổng kiến thức cần bổ sung.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">history</span>
                  </div>
                  <p className="text-slate-300 font-medium">Lưu trữ lịch sử và theo dõi tiến độ phát triển mỗi ngày.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Top Mentors Section */}
        <section className="py-24 px-6 bg-[#020617]/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-4">Top chuyên gia hàng đầu</h2>
                <p className="text-slate-400">Kết nối trực tiếp với các Mentor đang làm việc tại các tập đoàn lớn.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={scrollLeft}
                  className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  onClick={scrollRight}
                  className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth">
              {loading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="min-w-[300px] flex-none bg-[#1e293b] rounded-3xl border border-white/5 p-6 animate-pulse">
                      <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/5] bg-slate-700"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                // Error state
                <div className="w-full text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              ) : mentors.length > 0 ? (
                // Mentor cards from API
                <>
                  {mentors.map((mentor, index) => (
                    <div
                      key={index}
                      className="min-w-[300px] flex-none bg-[#1e293b] rounded-3xl border border-white/5 p-6 group hover:border-indigo-500/50 transition-all duration-300"
                    >
                      <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/5]">
                        <img
                          alt={mentor.fullName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src={mentor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.fullName)}&background=random&color=fff&size=512`}
                        />
                        <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#020617]/80 backdrop-blur-md rounded-xl border border-white/10">
                          <div className="text-white font-bold">{mentor.fullName}</div>
                          <div className="text-xs text-slate-400">{mentor.position || 'Mentor'}</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Kinh nghiệm</span>
                          <span className="text-white font-semibold">{mentor.yoe} năm</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Nơi làm việc</span>
                          <span className="text-white font-semibold">{mentor.company || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          <span className="material-symbols-outlined text-sm fill-1">star</span>
                          <span className="text-xs font-bold">
                            {mentor.avgRatings?.toFixed(1) || '0.0'} ({mentor.totalRatingCount || 0} đánh giá)
                          </span>
                        </div>
                        <Link
                          to={`/view-mentor/${mentor.accountId}?book=true`}
                          className="w-full py-3 bg-white text-[#0f172a] font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer"
                        >
                          Đặt lịch
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* View More Card */}
                  <div className="min-w-[300px] flex-none rounded-3xl border border-white/10 border-dashed p-6 group hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center justify-center bg-[#1e293b]/30">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-indigo-400 transition-colors">arrow_forward</span>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3">Xem thêm Mentor</h3>
                    <p className="text-slate-400 text-sm text-center mb-8 px-4">
                      Khám phá thêm hàng trăm chuyên gia hướng dẫn xuất sắc trên hệ thống
                    </p>
                    <Link
                      to="/view-mentor"
                      onClick={() => window.scrollTo(0, 0)}
                      className="px-8 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all w-full text-center"
                    >
                      Khám phá ngay
                    </Link>
                  </div>
                </>
              ) : (
                // No mentors available
                <div className="w-full text-center py-12">
                  <p className="text-slate-400">Chưa có mentor nào khả dụng.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Community Questions Section */}
        <section className="py-24 px-6 bg-[#020617]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4">Câu hỏi hot từ cộng đồng</h2>
              <p className="text-slate-400">Tham gia thảo luận và giải đáp thắc mắc cùng hàng ngàn Developers khác.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionsLoading ? (
                // Loading skeleton
                <>              {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-pulse">
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <div className="h-4 w-20 bg-slate-200 rounded"></div>
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
                </>
              ) : questionsError ? (
                // Error state
                <div className="col-span-full text-center py-12">
                  <p className="text-red-400 mb-4">{questionsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              ) : questions.length > 0 ? (
                // Question cards from API
                questions.map((question) => {
                  // Generate random colors for categories
                  const colorVariants = [
                    'bg-indigo-50 text-indigo-600',
                    'bg-purple-50 text-purple-600',
                    'bg-cyan-50 text-cyan-600',
                    'bg-emerald-50 text-emerald-600',
                    'bg-amber-50 text-amber-600',
                    'bg-rose-50 text-rose-600',
                  ];

                  return (
                    <div key={question.id} className="bg-white rounded-3xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {question.categories.slice(0, 3).map((category, idx) => (
                          <span key={idx} className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${colorVariants[idx % colorVariants.length]}`}>
                            {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-[#0f172a] text-lg font-bold mb-6 leading-snug hover:text-indigo-500 cursor-pointer transition-colors">
                        {question.content}
                      </h3>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-sm">chat_bubble</span>
                          <span className="text-xs text-slate-500 font-medium">{question.commentCount} thảo luận</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // No questions available
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">Chưa có câu hỏi nào.</p>
                </div>
              )}
            </div>
            <div className="mt-12 text-center">
              <Link
                to="/view-question-bank"
                onClick={() => window.scrollTo(0, 0)}
                className="inline-block px-8 py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
                Xem thêm câu hỏi
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
