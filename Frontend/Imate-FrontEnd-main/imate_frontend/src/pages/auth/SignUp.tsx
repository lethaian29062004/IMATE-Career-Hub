import { Eye, EyeOff, CheckCircle2, Quote, Banknote } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerWithEmail, generateActionCode, sendActionEmail } from "@/services/authService";
import type { RegisterEmailData, UserRole, User } from "@/types/common/auth";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { managementRoutes } from "@/config/managementRoutes";
import { MSG01, MSG56, MSG57, MSG58, MSG59, MSG60, MSG61 } from "@/constants/messages";
function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = (queryParams.get("role") as UserRole) || "Candidate";

  const { loginWithGoogle, refetchUser } = useAuth();
  // Khởi tạo role từ URL query parameter hoặc mặc định là "Candidate" (Ứng viên)
  const [role, setRole] = useState<UserRole>(["Candidate", "Mentor", "Recruiter"].includes(initialRole) ? initialRole : "Candidate");
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RegisterEmailData, "role">>({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Hàm navigate theo role
  const handleNavigation = (user: User) => {
    switch (user?.role) {
      case "Admin":
        navigate(`/management-dashboard/${managementRoutes[0].path}`);
        break;
      case "Staff":
        navigate("/staff/manage-question");
        break;
      case "Mentor":
        if (user.isNewAccount && user.verificationStatus !== "Rejected") {
          navigate("/submit-mentor-application");
        } else if (user.accountStatus === "Active") {
          navigate("/mentor/interview-schedule");
        } else if (user.verificationStatus === "Rejected") {
          toast.error("Hồ sơ Mentor của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại.");
          navigate("/submit-mentor-application");
        } else if (user.verificationStatus === "Approved") {
          navigate("/mentor/interview-schedule");
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
        navigate("/");
        break;
    }
  };

  const toogleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  const toogleViewConfirmPassword = () => {
    setViewConfirmPassword(!viewConfirmPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Xóa lỗi khi người dùng bắt đầu nhập lại
  };



  const selectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setError(null);
  };

  // Hàm ánh xạ role frontend sang role backend/hiển thị
  // const getRoleLabel = (r: UserRole) => (r === "Candidate" ? "Ứng viên" : "Mentor");
  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case "Candidate":
        return "Ứng viên";
      case "Mentor":
        return "Mentor";
      case "Recruiter":
        return "Recruiter";
      default:
        return r;
    }
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    // 1. Kiểm tra khoảng trắng ở đầu/cuối (MSG60)
    if (fullName !== fullName.trim() || email !== email.trim() || password !== password.trim() || confirmPassword !== confirmPassword.trim()) {
      setError(MSG60);
      return false;
    }

    // 2. Kiểm tra chỉ có khoảng trắng hoặc trống (MSG01)
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(MSG01);
      return false;
    }

    // 3. Kiểm tra họ và tên ít nhất 2 ký tự (MSG59)
    if (fullName.trim().length < 2) {
      setError(MSG59);
      return false;
    }

    // 4. Kiểm tra định dạng email (MSG56)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(MSG56);
      return false;
    }

    // 5. Kiểm tra mật khẩu không được chứa bất kỳ khoảng trắng nào (MSG61)
    if (/\s/.test(password)) {
      setError(MSG61);
      return false;
    }

    // 6. Kiểm tra độ mạnh mật khẩu (MSG57)
    // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(MSG57);
      return false;
    }

    // 7. Kiểm tra xác nhận mật khẩu (MSG58)
    if (password !== confirmPassword) {
      setError(MSG58);
      return false;
    }

    return true;
  };
  // --- LOGIC GỌI API ĐĂNG KÝ EMAIL/PASSWORD ---
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }


    setError(null);
    setIsLoading(true);
    try {
      // Gộp formData với role hiện tại
      const dataToSend: RegisterEmailData = { ...formData, role };

      const responseData = await registerWithEmail(dataToSend);

      // LƯU LOCAL TOKEN VÀ REFETCH USER
      localStorage.setItem("authToken", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));
      await refetchUser();

      // Gửi email xác minh (nếu cần)
      try {
        const oobCode = await generateActionCode(formData.email, "VERIFY_EMAIL");
        await sendActionEmail(oobCode, formData.email, "VERIFY_EMAIL");
      } catch (emailError: any) {
        console.error("Failed to send verification email:", emailError);
      }

      // Sử dụng role đã chọn trong thông báo
      const roleLabel = getRoleLabel(role);
      toast.success(`Đăng ký thành công vai trò ${roleLabel}!`);

      // REDIRECT TRỰC TIẾP DỰA TRÊN ROLE
      if (role === "Recruiter") {
        navigate("/submit-recruiter-application");
      } else if (role === "Mentor") {
        navigate("/submit-mentor-application");
      } else {
        navigate("/sign-in");
      }
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);

      // Backend trả về Message (chữ M hoa) hoặc message (chữ m nhỏ)
      // apiClient interceptor đã normalize thành err.message, nhưng cần check cả response.data
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại.";

      if (err.response?.data) {
        // Ưu tiên lấy từ response.data (Message hoặc message)
        errorMessage = err.response.data.Message || err.response.data.message || errorMessage;
      } else if (err.message) {
        // Nếu không có response.data, lấy từ err.message (đã được apiClient normalize)
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC ĐĂNG KÝ/ĐĂNG NHẬP VỚI GOOGLE ---
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const user = await loginWithGoogle(role);

      toast.success(`Đăng ký thành công vai trò ${getRoleLabel(role)}!`);
      handleNavigation(user);
    } catch (err: any) {
      if (err?.message === "POPUP_CLOSED") return;
      console.error("Lỗi khi đăng ký với Google: ", err);
      toast.error(err?.message || "Đã xảy ra lỗi khi đăng ký với Google. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white overflow-hidden">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-12 border-r border-white/5">

        <div className="absolute inset-0 grid-pattern"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center justify-start gap-3 mb-10">
            <div className="size-12 logo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-black text-2xl">I</span>
            </div>
            <span className="text-3xl font-black tracking-tighter">IMATE</span>
          </div>

          {role === "Mentor" ? (
            <div className="space-y-8">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300 mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  Mentor Onboarding
                </p>
                <h1 className="text-[40px] font-bold leading-[1.1] mb-4">
                  Trở thành Mentor<br />đồng hành cùng thế hệ IT mới
                </h1>
                <p className="text-slate-300 text-base">
                  Chia sẻ kinh nghiệm thực chiến, xây dựng thương hiệu cá nhân và tạo thêm nguồn thu nhập bền vững.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Xây dựng thương hiệu cá nhân</p>
                    <p className="text-sm text-slate-400">
                      Xuất hiện như chuyên gia trong lĩnh vực, kết nối với hàng trăm mentee tiềm năng.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex items-start gap-3">
                  <div className="mt-1">
                    <Banknote className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Thu nhập hấp dẫn & linh hoạt</p>
                    <p className="text-sm text-slate-400">
                      Chủ động chọn lịch dạy, tối ưu thời gian rảnh với các buổi mentoring chất lượng cao.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-sky-500/5 p-4 flex gap-3">
                  <div className="mt-1">
                    <Quote className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-200 italic">
                      &quot;IMATE giúp mình vừa chia sẻ kinh nghiệm, vừa xây dựng được network chất lượng trong cộng đồng developer.&quot;
                    </p>
                    <p className="text-xs text-slate-400">
                      — Minh Anh, Tech Lead @ Google
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-[44px] font-bold leading-[1.1] mb-6">
                Bắt đầu hành trình chinh phục sự nghiệp IT
              </h1>
              <p className="text-slate-400 text-lg">
                Nâng tầm kỹ năng phỏng vấn cùng AI Mentor hàng đầu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">

        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]"></div>

        <div className="w-full max-w-[480px] relative z-10">

          <div className="mb-10">
            <div className="mb-8 flex bg-slate-900/50 p-1 rounded-xl border border-white/10">

              <button
                type="button"
                onClick={() => selectRole("Candidate")}
                className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${role === "Candidate"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                Ứng viên
              </button>

              <button
                type="button"
                onClick={() => selectRole("Mentor")}
                className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${role === "Mentor"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                Mentor
              </button>

              <button
                type="button"
                onClick={() => selectRole("Recruiter")}
                className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${role === "Recruiter"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                Recruiter
              </button>
            </div>
            <h2 className="text-3xl font-bold mb-3">Đăng ký tài khoản</h2>
            <p className="text-slate-400">
              Trở thành thành viên và bắt đầu luyện tập ngay hôm nay
            </p>
            {(role === "Mentor" || role === "Recruiter") && (
              <p className="mt-2 text-xs text-indigo-300/90">
                Sau khi đăng ký bằng Google, hệ thống sẽ tự động đăng nhập và chuyển hướng bạn đến trang nộp hồ sơ {role}.
              </p>
            )}
          </div>

          <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-white text-slate-900 font-semibold rounded-full transition hover:bg-slate-100 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              <span>{role === "Candidate" ? "Đăng ký ứng viên" : role === "Mentor" ? "Đăng ký Mentor" : "Đăng ký Recruiter"} bằng Google</span>
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                Hoặc đăng ký bằng Email
              </span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {/* FORM FIELDS FOR ALL ROLES */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Mật khẩu</label>
              <div className="relative">
                <input
                  type={viewPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 pr-12 focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={toogleViewPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {viewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Xác nhận Mật khẩu</label>
              <div className="relative">
                <input
                  type={viewConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 pr-12 focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={toogleViewConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {viewConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-gradient rounded-full font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          <div className="text-center mt-12">
            <p className="text-slate-400 text-sm">
              Đã có tài khoản?
              <Link to="/sign-in" className="text-indigo-400 font-bold ml-1 cursor-pointer hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
export default SignUp;
