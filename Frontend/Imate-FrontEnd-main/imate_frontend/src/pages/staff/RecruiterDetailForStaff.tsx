import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Mail, Phone, Briefcase, Globe, MapPin, Building2 } from "lucide-react";
import { reviewRecruiterApplication, getPendingRecruiterApplications } from "@/services/staffReviewService";
import type { StaffRecruiterApplication } from "@/types/response/staffReview.response";

function getInitials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const RecruiterDetailForStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState<StaffRecruiterApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [createCompany, setCreateCompany] = useState(true);

  const fetchRecruiter = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const all = await getPendingRecruiterApplications();
      const found = all.find((r) => r.accountId === Number(id)) ?? null;
      setRecruiter(found);
      if (!found) setError("Không tìm thấy hồ sơ recruiter.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được chi tiết.");
      setRecruiter(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecruiter();
  }, [fetchRecruiter]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading("approve");
    try {
      await reviewRecruiterApplication(Number(id), { 
        isApproved: true, 
        note: null,
        createCompany: createCompany
      });
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
      await reviewRecruiterApplication(Number(id), { isApproved: false, note: "Từ chối từ trang chi tiết." });
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

  if (error && !recruiter) {
    return (
      <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-400">{error}</p>
          <Link to="/management/applications" className="mt-4 inline-block text-[#5D5FEF] hover:underline">
            ← Quay lại danh sách đơn ứng tuyển
          </Link>
        </div>
      </div>
    );
  }

  if (!recruiter) return null;

  return (
    <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link to="/management/applications" className="hover:text-white">
            Đơn ứng tuyển
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-300">Chi tiết Recruiter</span>
        </nav>

        {/* Title + Status */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Duyệt hồ sơ Recruiter</h1>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium uppercase text-amber-400">
            Chờ duyệt
          </span>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}

        {/* Main card */}
        <div className="rounded-2xl border border-gray-800 bg-[#1a1a22] p-6 shadow-xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Thông tin Recruiter */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Thông tin Recruiter
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {recruiter.avatarUrl ? (
                    <img
                      src={recruiter.avatarUrl}
                      alt={recruiter.fullName}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5D5FEF] text-lg font-semibold text-white">
                      {getInitials(recruiter.fullName)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{recruiter.fullName}</p>
                    <p className="text-sm text-gray-400">{recruiter.companyName || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                  <a href={`mailto:${recruiter.email}`} className="text-[#5D5FEF] hover:underline">
                    {recruiter.email}
                  </a>
                </div>

                {recruiter.phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                    <span>{recruiter.phone}</span>
                  </div>
                )}

                {recruiter.address && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                    <span>{recruiter.address}</span>
                  </div>
                )}

                {recruiter.website && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                    <a
                      href={recruiter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-[#5D5FEF] hover:underline"
                    >
                      {recruiter.website}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Thông tin Công ty */}
            <section className="space-y-6">
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Thông tin Công ty
                </h2>
                <ul className="space-y-2 text-sm text-gray-300">
                  {recruiter.companyName && (
                    <li className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-gray-500" />
                      <span>{recruiter.companyName}</span>
                    </li>
                  )}
                  {recruiter.industry && (
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-gray-500" />
                      <span>Ngành: {recruiter.industry}</span>
                    </li>
                  )}
                  {recruiter.companySize && (
                    <li>
                      <span className="text-gray-400">Quy mô:</span> {recruiter.companySize}
                    </li>
                  )}
                </ul>
              </div>

              {/* Logo */}
              {recruiter.companyLogo && (
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Logo Công ty</h2>
                  <img
                    src={recruiter.companyLogo}
                    alt={`${recruiter.companyName} logo`}
                    className="h-20 w-auto rounded-lg border border-gray-700 object-contain bg-white/5 p-2"
                  />
                </div>
              )}
            </section>
          </div>


          {/* Create Company Checkbox */}
          <div className="mt-8 flex items-center gap-3 border-t border-gray-800 pt-6">
            <input
              type="checkbox"
              id="createCompany"
              checked={createCompany}
              onChange={(e) => setCreateCompany(e.target.checked)}
              className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-[#5D5FEF] focus:ring-[#5D5FEF]"
            />
            <label htmlFor="createCompany" className="text-sm font-medium text-gray-300 cursor-pointer">
              Tạo công ty chính thức trong hệ thống từ thông tin này
            </label>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap justify-end gap-3">
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

export default RecruiterDetailForStaff;
