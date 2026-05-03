import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  History,
  Eye,
  BookOpen,
  Languages,
  Trophy,
  Briefcase,
  Star,
  Activity,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  getTestHistory,
  type TestHistoryItem,
} from "@/services/geminiService";
import {
  getJourneyList,
  type TrainingJourneySummary,
} from "@/services/trainingJourneyService";
import { getCandidateBookings } from "@/services/bookingCandidateService";
import type { BookingDetailResponse } from "@/types/response/booking.response";
import { MSG07, MSG31 } from "@/constants/messages";

/* ------------------------------------------------------------------ */
/*  Score Badge                                                        */
/* ------------------------------------------------------------------ */
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
      : score >= 50
        ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
        : "border-red-500/40 bg-red-500/15 text-red-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${color}`}
    >
      {score}/100
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Tag                                                       */
/* ------------------------------------------------------------------ */
function CategoryTag({ testType }: { testType: string }) {
  const isLang = testType === "Language";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${isLang
        ? "bg-cyan-500/15 text-cyan-400"
        : "bg-purple-500/15 text-purple-400"
        }`}
    >
      {isLang ? (
        <Languages className="h-3 w-3" />
      ) : (
        <BookOpen className="h-3 w-3" />
      )}
      {isLang ? "Đánh giá ngoại ngữ" : "Kiến thức chuyên môn"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <Trophy className="h-8 w-8 text-slate-500" />
      </div>
      <p className="mb-2 text-lg font-semibold text-white">
        Chưa có lịch sử
      </p>
      <p className="mb-6 max-w-md text-sm text-slate-400">{MSG31}</p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate("/practice-test")}
      >
        Bắt đầu làm bài test
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Navigation                                                     */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: "test", label: "Bài test năng lực" },
  { id: "interview", label: "Lộ trình luyện tập" },
  { id: "mentor", label: "Lịch sử Mentor" },
];

/* ------------------------------------------------------------------ */
/*  Interview Status Badge                                             */
/* ------------------------------------------------------------------ */
function InterviewStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    Completed: {
      color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
      label: "Hoàn thành",
    },
    InProgress: {
      color: "border-amber-500/40 bg-amber-500/15 text-amber-400",
      label: "Đang diễn ra",
    },
    Cancelled: {
      color: "border-red-500/40 bg-red-500/15 text-red-400",
      label: "Đã hủy",
    },
  };
  const c = config[status] || config["Cancelled"];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${c.color}`}
    >
      {c.label}
    </span>
  );
}

function JourneyStatusBadge({ status }: { status: string }) {
  const isCompleted = status === "Mastered" || status === "Completed";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        isCompleted
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
          : "border-amber-500/40 bg-amber-500/15 text-amber-400"
      }`}
    >
      {isCompleted ? "Hoàn thành" : "Cần luyện tập thêm"}
    </span>
  );
}

export default function TestHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "test";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [journeys, setJourneys] = useState<TrainingJourneySummary[]>([]);
  const [mentorHistory, setMentorHistory] = useState<BookingDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);

  // Pagination for Journey Tab
  const [journeyPage, setJourneyPage] = useState(1);
  const [journeyPageSize, setJourneyPageSize] = useState(10);
  const [journeyTotalPages, setJourneyTotalPages] = useState(1);
  const [journeyTotalCount, setJourneyTotalCount] = useState(0);

  // Pagination for Mentor Tab
  const [mentorPage, setMentorPage] = useState(1);
  const [mentorPageSize, setMentorPageSize] = useState(10);


  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    if (tabId === "mentor") {
      setMentorPage(1);
    }
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const fetchMentorHistory = async () => {
    try {
      setMentorLoading(true);
      const data = await getCandidateBookings();
      setMentorHistory(data || []);
    } catch {
      toast.error(MSG07);
    } finally {
      setMentorLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getTestHistory();
        setHistory(data);
      } catch {
        toast.error(MSG07);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "test") fetchHistory();
    if (activeTab === "mentor") fetchMentorHistory();
  }, [activeTab]);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setJourneyLoading(true);
        const data = await getJourneyList(journeyPage, journeyPageSize);
        setJourneys(data.items);
        setJourneyTotalPages(data.totalPages);
        setJourneyTotalCount(data.totalCount);
      } catch {
        toast.error(MSG07);
      } finally {
        setJourneyLoading(false);
      }
    };
    if (activeTab === "interview") fetchJourneys();
  }, [activeTab, journeyPage, journeyPageSize]);


  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Client-side pagination logic for Mentor History
  const mentorTotalCount = mentorHistory.length;
  const mentorTotalPages = Math.ceil(mentorTotalCount / mentorPageSize);
  const paginatedMentorHistory = mentorHistory.slice(
    (mentorPage - 1) * mentorPageSize,
    mentorPage * mentorPageSize
  );

  const handleMentorPageSizeChange = (size: number) => {
    setMentorPageSize(size);
    setMentorPage(1);
  };

  // const activeCount =
  //   activeTab === "test"
  //     ? history.length
  //     : activeTab === "interview"
  //       ? interviewHistory.length
  //       : mentorHistory.length;


  return (
    <div className="font-sans min-h-screen bg-[#020617] text-white">
      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Lịch sử hoạt động
              </h1>
              <p className="text-slate-400 mb-6 max-w-2xl leading-relaxed">
                Theo dõi tiến trình bài test, phỏng vấn AI và các buổi mentor của bạn.
              </p>
            </div>

          </div>
        </section>

        {/* Tabs */}
        <section className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#1e293b]/40 backdrop-blur-sm p-2 rounded-2xl border border-white/5">
              <div className="flex flex-col sm:flex-row gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === tab.id
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-300"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {activeTab === "test" && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <div className="col-span-4">Tên bài test</div>
                      <div className="col-span-2">Phân loại</div>
                      <div className="col-span-2">Ngày hoàn thành</div>
                      <div className="col-span-2 text-center">Điểm số</div>
                      <div className="col-span-2 text-center">Thao tác</div>
                    </div>

                    {/* Table Body */}
                    {history.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-800/40 ${idx < history.length - 1
                          ? "border-b border-white/5"
                          : ""
                          }`}
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15">
                            <History className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="font-medium text-white">
                            {item.testTitle}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <CategoryTag testType={item.testType} />
                        </div>
                        <div className="col-span-2 text-sm text-slate-400">
                          {formatDate(item.completedAt)}
                        </div>
                        <div className="col-span-2 text-center">
                          <ScoreBadge score={item.score} />
                        </div>
                        <div className="col-span-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => navigate(`/test-history/${item.id}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Training Journey Tab */}
            {activeTab === "interview" && (
              <>
                {journeyLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <>
                    {journeys.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F1333]">
                          <Activity className="h-8 w-8 text-slate-500" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-white">Chưa có lộ trình nào</h3>
                        <p className="mb-6 max-w-md text-sm text-slate-400">
                          Hãy thực hiện phỏng vấn AI với CV và JD để hệ thống tự động tạo lộ trình luyện tập cho bạn.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-2">
                        <Table
                          page={journeyPage}
                          totalPages={journeyTotalPages}
                          totalCount={journeyTotalCount}
                          pageSize={journeyPageSize}
                          onPageChange={setJourneyPage}
                          onPageSizeChange={(size) => {
                            setJourneyPageSize(size);
                            setJourneyPage(1);
                          }}
                          maxHeight="60vh"
                        >
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/3">Tên lộ trình</TableHead>
                              <TableHead>Tiến độ kỹ năng</TableHead>
                              <TableHead className="text-center">Số phiên tập</TableHead>
                              <TableHead className="text-center">Cập nhật</TableHead>
                              <TableHead className="text-center">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {journeys.map((j) => (
                              <TableRow key={j.journeyId}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                                      <Activity className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                      <span className="font-medium text-white block truncate">{j.name || "Lộ trình không tên"}</span>
                                      <div className="mt-1">
                                        <JourneyStatusBadge status={j.status} />
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1.5 pr-4">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400">Hoàn thành</span>
                                      <span className="text-purple-400 font-medium">{j.resolvedGaps}/{j.totalGaps}</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                                        style={{ width: `${j.totalGaps > 0 ? (j.resolvedGaps / j.totalGaps) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-medium text-white">{j.totalSessions}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-slate-400">{formatDate(j.lastPracticed)}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={<Eye className="h-4 w-4" />}
                                      className="text-xs h-8 px-2"
                                      onClick={() => navigate(`/test-history/journey/${j.journeyId}`)}
                                    >
                                      Chi tiết
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Mentor History Tab */}
            {activeTab === "mentor" && (
              <>
                {mentorLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : mentorHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F1333]">
                      <Briefcase className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-white">Chưa có lịch sử mentor</p>
                    <p className="mb-6 max-w-md text-sm text-slate-400">
                      Bạn chưa tham gia buổi phỏng vấn nào với Mentor. Hãy đặt lịch ngay!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-2">
                    <Table
                      page={mentorPage}
                      totalPages={mentorTotalPages}
                      totalCount={mentorTotalCount}
                      pageSize={mentorPageSize}
                      onPageChange={setMentorPage}
                      onPageSizeChange={handleMentorPageSizeChange}
                      maxHeight="60vh"
                    >
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Mentor</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead className="text-center">Trạng thái</TableHead>
                          <TableHead className="text-center">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMentorHistory.map((item) => (
                          <TableRow key={item.bookingId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-700">
                                  <AvatarImage src={item.profileAvatarUrl} alt={item.profileName} />
                                  <AvatarFallback name={item.profileName} />
                                </Avatar>
                                <div>
                                  <span className="font-medium text-white block truncate">{item.profileName}</span>
                                  <span className="text-xs text-slate-500">{item.jobTitle || "Mentor"}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-400">
                                <div>{formatDate(item.bookDate)}</div>
                                <div className="text-xs text-slate-500">
                                  {new Date(item.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <InterviewStatusBadge status={item.status === 2 ? "Completed" : item.status === 3 ? "Cancelled" : "InProgress"} />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                {item.ratingScore && (
                                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-yellow-400/10 px-2 py-1 rounded-lg">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                    {item.ratingScore}
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Eye className="h-4 w-4" />}
                                  className="text-xs h-8 px-2"
                                  onClick={() => navigate(`/candidate/interview-history/${item.bookingId}`)}
                                >
                                  Chi tiết
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
