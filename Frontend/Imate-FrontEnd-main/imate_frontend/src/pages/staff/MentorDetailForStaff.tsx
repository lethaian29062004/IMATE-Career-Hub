import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, FileText, Award, Mail, Phone, Briefcase } from "lucide-react";
import { getMentorApplicationById, reviewMentorApplication } from "@/services/staffReviewService";
import type { StaffMentorApplication } from "@/types/response/staffReview.response";

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

const MentorDetailForStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<StaffMentorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);

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

  useEffect(() => {
    fetchMentor();
  }, [fetchMentor]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading("approve");
    try {
      await reviewMentorApplication(Number(id), { isApproved: true, note: null });
      navigate("/management/applications", { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Duyệt thất bại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading("reject");
    try {
      await reviewMentorApplication(Number(id), { isApproved: false, note: "Từ chối từ trang chi tiết." });
      navigate("/management/applications", { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Từ chối thất bại.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#5D5FEF] border-t-transparent" />
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-400">{error}</p>
          <Link
            to="/management/applications"
            className="mt-4 inline-block text-[#5D5FEF] hover:underline"
          >
            ← Quay lại danh sách đơn ứng tuyển
          </Link>
        </div>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link to="/management/applications" className="hover:text-white">
            Đơn ứng tuyển
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-300">Chi tiết Mentor</span>
        </nav>

        {/* Title + Status */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Duyệt hồ sơ Mentor
          </h1>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium uppercase text-amber-400">
            Chờ duyệt
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Main card */}
        <div className="rounded-2xl border border-gray-800 bg-[#1a1a22] p-6 shadow-xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Thông tin Mentor */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Thông tin Mentor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {mentor.avatarUrl ? (
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.fullName}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5D5FEF] text-lg font-semibold text-white">
                      {getInitials(mentor.fullName)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{mentor.fullName}</p>
                    <p className="text-sm text-gray-400">
                      {mentor.positions?.length ? mentor.positions.join(", ") : "Mentor"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                  <a
                    href={`mailto:${mentor.email}`}
                    className="text-[#5D5FEF] hover:underline"
                  >
                    {mentor.email}
                  </a>
                </div>
                {mentor.phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                    <span>{mentor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Kinh nghiệm: {mentor.yoe} năm</span>
                </div>
                {mentor.companies?.length > 0 && (
                  <p className="text-sm text-gray-400">
                    Công ty: {mentor.companies.join(", ")}
                  </p>
                )}
                {mentor.bio && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-500">Giới thiệu</p>
                    <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{mentor.bio}</p>
                  </div>
                )}
                {mentor.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {mentor.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-gray-700/60 px-2 py-0.5 text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Thông tin bổ sung + Tài liệu */}
            <section className="space-y-6">
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Thông tin bổ sung
                </h2>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>Giá mỗi buổi: {mentor.pricePerSession?.toLocaleString("vi-VN") ?? 0} VNĐ</li>
                  {mentor.bankAccountHolderName && (
                    <li>Chủ tài khoản: {mentor.bankAccountHolderName}</li>
                  )}
                  {mentor.bankCode && <li>Ngân hàng (mã): {mentor.bankCode}</li>}
                </ul>
              </div>

              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tài liệu xác minh
                </h2>
                <div className="flex flex-col gap-3">
                  {mentor.cvUrl ? (
                    <a
                      href={mentor.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#252530] px-4 py-3 text-gray-300 transition hover:border-[#5D5FEF] hover:text-white"
                    >
                      <FileText className="h-5 w-5 text-[#5D5FEF]" />
                      <span>CV / Hồ sơ (.pdf)</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-700/50 bg-[#252530]/50 px-4 py-3 text-gray-500">
                      <FileText className="h-5 w-5" />
                      <span>Chưa có CV</span>
                    </div>
                  )}
                  {mentor.certificateUrl ? (
                    <a
                      href={mentor.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#252530] px-4 py-3 text-gray-300 transition hover:border-[#5D5FEF] hover:text-white"
                    >
                      <Award className="h-5 w-5 text-[#5D5FEF]" />
                      <span>Chứng chỉ</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-700/50 bg-[#252530]/50 px-4 py-3 text-gray-500">
                      <Award className="h-5 w-5" />
                      <span>Chưa có chứng chỉ</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Action buttons - bottom right */}
          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-800 pt-6">
            <button
              type="button"
              onClick={handleReject}
              disabled={!!actionLoading}
              className="rounded-lg border-2 border-red-500/80 bg-transparent px-5 py-2.5 font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {actionLoading === "reject" ? "Đang xử lý..." : "Từ chối"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={!!actionLoading}
              className="rounded-lg bg-gradient-to-r from-[#5D5FEF] to-[#4a4cc9] px-5 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading === "approve" ? "Đang xử lý..." : "Duyệt hồ sơ"}
            </button>
          </div>
        </div>

        <Link
          to="/management/applications"
          className="mt-6 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Quay lại danh sách đơn ứng tuyển
        </Link>
      </div>
    </div>
  );
};

export default MentorDetailForStaff;
