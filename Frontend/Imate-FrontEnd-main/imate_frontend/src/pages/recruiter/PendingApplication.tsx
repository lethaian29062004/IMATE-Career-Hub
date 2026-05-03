import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function PendingApplication() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== "Recruiter") {
      navigate("/", { replace: true });
    } else if (user.accountStatus === "Active") {
      navigate("/management/recruiter-dashboard/job-applications", { replace: true });
    } else if (user.verificationStatus === "Rejected") {
      navigate("/submit-recruiter-application", { replace: true });
    } else if (user.accountStatus !== "PendingVerification" || !user.companyName) {
      navigate("/submit-recruiter-application", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || user.role !== "Recruiter" || user.accountStatus === "Active" || user.verificationStatus === "Rejected") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/20 mb-6">
          <Clock className="h-12 w-12 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Hồ sơ đang được duyệt</h1>
        <p className="text-slate-400 text-sm mb-6">
          Chúng tôi đã nhận hồ sơ Recruiter của bạn. Bạn sẽ nhận thông báo khi tài khoản được kích hoạt. Vui lòng kiểm tra email hoặc đăng nhập lại sau.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/50 transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
