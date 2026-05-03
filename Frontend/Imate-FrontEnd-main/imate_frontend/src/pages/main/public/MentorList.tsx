import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListPreviewMentors } from '@/services/mentorService';
import { getAllPositions, getAllSkills, getAllCompanies } from '@/services/commonService';
import type { ListPreviewMentorResponse } from '@/types/common/mentor';
import type { PositionItem, SkillItem, CompanyItem } from '@/types/common/question';
import { Search, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const PAGE_SIZE = 8;

const MentorList: React.FC = () => {
  const [mentors, setMentors] = useState<ListPreviewMentorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListPreviewMentors({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: searchTerm || undefined,
        positionName: filterPosition,
        skillName: filterSkill,
        companyName: filterCompany,
      });
      setMentors(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
      setError('Không thể tải danh sách mentor. Vui lòng thử lại sau.');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, filterPosition, filterSkill, filterCompany, searchTerm]);

  const fetchFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const [posRes, skillRes, companyRes] = await Promise.all([
        getAllPositions({ pageNumber: 1, pageSize: 100, isActive: true }),
        getAllSkills({ pageNumber: 1, pageSize: 100, isActive: true }),
        getAllCompanies({ pageNumber: 1, pageSize: 100, isActive: true }),
      ]);
      setPositions(Array.isArray(posRes?.data) ? posRes.data : []);
      setSkills(Array.isArray(skillRes?.data) ? skillRes.data : []);
      setCompanies(Array.isArray(companyRes?.data) ? companyRes.data : []);
    } catch (err) {
      console.error('Failed to load filter options (positions/skills/companies):', err);
      setPositions([]);
      setSkills([]);
      setCompanies([]);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const visibleMentors = mentors;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterPosition('');
    setFilterSkill('');
    setFilterCompany('');
    setPageNumber(1);
  };

  const displayBio = (mentor: ListPreviewMentorResponse) => {
    return mentor.bio?.trim() || '—';
  };

  return (
    <div className="font-sans min-h-screen bg-[#020617]">
      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Kết nối với chuyên gia hàng đầu
              </h1>
              <p className="text-slate-400 mb-8 max-w-2xl leading-relaxed">
                Học hỏi từ những người đi trước để bứt phá sự nghiệp IT của bạn thông qua các buổi cố vấn 1:1 chuyên sâu.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#11142D]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(99,102,241,0.25),_transparent_55%)]" />
              <div className="w-full h-80 flex flex-col items-start justify-start text-slate-400 relative p-8">
                <span className="text-2xl md:text-3xl font-bold text-white">Kết nối Mentor</span>
                <span className="text-base md:text-lg text-slate-300 mt-2">Lộ trình cá nhân hóa theo mục tiêu</span>

              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 pb-10">
          <div className="max-w-7xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col gap-4"
            >
              <div className="w-full space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm kiếm</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative group flex-1">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPageNumber(1);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                      placeholder="Tìm theo tên mentor, vị trí, công ty..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center text-slate-300"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                  </button>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vị trí</label>
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                    disabled={filtersLoading}
                  >
                    <option value="">{filtersLoading && positions.length === 0 ? 'Đang tải...' : 'Tất cả'}</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kỹ năng</label>
                  <select
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                    disabled={filtersLoading}
                  >
                    <option value="">{filtersLoading && skills.length === 0 ? 'Đang tải...' : 'Tất cả'}</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Công ty</label>
                  <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                    disabled={filtersLoading}
                  >
                    <option value="">{filtersLoading && companies.length === 0 ? 'Đang tải...' : 'Tất cả'}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </form>
          </div>
        </section>

        {/* Mentor grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading && (
              <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-center">
                {error}
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleMentors.map((mentor, index) => {
                    const detailHref = mentor.accountId != null ? `/view-mentor/${mentor.accountId}` : '#';
                    return (
                      <div
                        key={`${mentor.fullName}-${index}`}
                        className="rounded-3xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 flex flex-col hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                      >
                        <Link
                          to={detailHref}
                          className="flex flex-col flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                        >
                          <div className="relative mb-4">
                            <span className="absolute top-0 left-0 z-10 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0a0b14]">
                              Mentor hàng đầu
                            </span>
                            <Avatar className="w-20 h-20 border-2 border-white/10 mx-auto mt-2">
                              <AvatarImage src={mentor.avatarUrl} alt={mentor.fullName} />
                              <AvatarFallback name={mentor.fullName} />
                            </Avatar>
                          </div>
                          <h3 className="text-lg font-bold text-white text-center mb-1 hover:text-indigo-300 transition-colors">{mentor.fullName}</h3>
                          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">{mentor.avgRatings?.toFixed(1) ?? '0.0'}</span>
                          </div>
                          <p className="text-sm font-medium text-indigo-400 text-center mb-1">{mentor.position || 'Mentor'}</p>
                          <p className="text-xs text-slate-400 text-center mb-3">{mentor.company || '—'}</p>
                          <p className="text-sm text-slate-300 line-clamp-3 flex-1 mb-3">{displayBio(mentor)}</p>
                          <p className="text-xs text-slate-500 mb-4">{mentor.totalRatingCount ?? 0} đánh giá</p>
                        </Link>
                        <Link
                          to={mentor.accountId ? `/view-mentor/${mentor.accountId}?book=true` : '/sign-in'}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-center hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Đặt lịch
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {mentors.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    Không tìm thấy mentor nào phù hợp với bộ lọc.
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setPageNumber(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${pageNumber === page
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MentorList;
