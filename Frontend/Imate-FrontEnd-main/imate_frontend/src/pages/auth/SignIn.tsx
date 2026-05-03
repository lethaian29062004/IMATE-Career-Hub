// import AuthLayout from "@/layout/auth/authLayout";
// import AuthBanner from "@/components/custom/authBanner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import type { User } from "@/types/common/auth";
import { toast } from "react-toastify";
import { managementRoutes } from "@/config/managementRoutes";
// import logo from "@/assets//images/logo.png";

function SignIn() {
  const navigate = useNavigate();
  // MỚI: Lấy state và hàm từ AuthContext
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);

  const toggleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  const handleNavigation = (user: User) => {
    switch (user?.role) {
      case "Admin":
        navigate(`/management/${managementRoutes[0].path}`);
        break;
      case "Staff":
        navigate(`/management/${managementRoutes[0].path}`);
        break;
      case "Mentor":
        if (user.accountStatus === "Active") {
          navigate("/mentor/interview-schedule");
        } else if (user.verificationStatus === "Rejected") {
          toast.error("Hồ sơ Mentor của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại.");
          navigate("/submit-mentor-application");
        } else if (user.verificationStatus === "Approved") {
          navigate("/mentor/interview-schedule"); // Trùng với Active nhưng phòng hờ
        } else if (user.verificationStatus === "Pending" || user.accountStatus === "PendingVerification") {
          navigate("/pending-application");
        } else {
          navigate("/submit-mentor-application");
        }
        break;
      case "Recruiter":
        if (user.isNewAccount && user.verificationStatus !== "Rejected") {
          navigate("/submit-recruiter-application");
        } else if (user.accountStatus === "Active") {
          navigate("/management/recruiter-dashboard/create-job-posting");
        } else if (user.verificationStatus === "Rejected") {
          toast.error("Hồ sơ Nhà tuyển dụng của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại.");
          navigate("/submit-recruiter-application");
        } else if (user.verificationStatus === "Approved") {
          navigate("/management/recruiter-dashboard/create-job-posting");
        } else if (user.verificationStatus === "Pending" || user.accountStatus === "PendingVerification") {
          navigate("/recruiter-pending-application");
        } else {
          navigate("/submit-recruiter-application");
        }
        break;
      case "Candidate":
        navigate("/home");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Imate xin chào, ${user.fullName}!`);
      handleNavigation(user);
    } catch (err: any) {
      console.error("Lỗi khi đăng nhập: ", err);
      // Hiển thị thông báo lỗi cho người dùng
      const errorMessage = err?.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();

      // Nếu có role hợp lệ, hiển thị toast chào mừng và navigate
      toast.success(`Imate xin chào, ${user.fullName}!`);
      localStorage.setItem("user", JSON.stringify(user));
      handleNavigation(user);
    } catch (err: any) {
      // Nếu user đóng popup, không hiển thị lỗi
      if (err?.message === "POPUP_CLOSED") {
        return; // Chỉ return, không làm gì cả
      }
      console.error("Lỗi khi đăng nhập: ", err);
      // Hiển thị thông báo lỗi cho các lỗi khác
      const errorMessage = err?.message || "Đã xảy ra lỗi khi đăng nhập với Google. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };



  return (
  <div className="flex min-h-screen w-full bg-[#020617] text-white overflow-hidden">

    {/* LEFT PANEL */}
    <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#020617]">

      <div className="absolute inset-0 grid-pattern"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-xl text-center">
        <div className="flex items-center gap-3 mb-16">
          <div className="size-12 logo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black text-2xl">I</span>
          </div>
          <span className="text-3xl font-black tracking-tighter">IMATE</span>
        </div>

        <h1 className="text-[44px] font-bold leading-[1.1] mb-10 tracking-tight">
          Bắt đầu hành trình chinh phục sự nghiệp IT
        </h1>

        <p className="text-slate-400 text-lg mt-6">
          Nâng tầm kỹ năng phỏng vấn cùng AI Mentor hàng đầu được tin dùng bởi hàng ngàn developer.
        </p>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative bg-[#020617]">

      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[480px] relative z-10">

        {/* TITLE */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-3">Đăng nhập tài khoản</h2>
          <p className="text-slate-400">Chào mừng bạn quay trở lại với IMATE</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white text-slate-900 font-semibold rounded-full transition hover:bg-slate-100 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <span>Đăng nhập bằng Google</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Hoặc đăng nhập bằng Email
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 size-5" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => {
                  if (error) clearError();
                  setEmail(e.target.value);
                }}
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 size-5" />
              <input
                type={viewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  if (error) clearError();
                  setPassword(e.target.value);
                }}
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 "
              />
              <button
                type="button"
                onClick={toggleViewPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                {viewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* FORGOT PASSWORD */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-gradient text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

        </form>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Chưa có tài khoản?
            <Link
              to="/sign-up"
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>


  </div>
);
}

export default SignIn;
