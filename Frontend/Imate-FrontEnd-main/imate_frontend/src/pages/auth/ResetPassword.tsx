import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff } from "lucide-react";
import { MSG01, MSG57, MSG58, MSG60, MSG61 } from "@/constants/messages";

function ResetPassword() {
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const checkCodeValidity = async () => {
      if (!oobCode) {
        toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
        navigate("/sign-in");
        return;
      }
      try {
        const auth = getAuth();
        // Hàm này sẽ báo lỗi nếu mã không hợp lệ
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true); // Mã hợp lệ, cho phép hiển thị form
      } catch (err) {
        toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
        navigate("/sign-in");
      }
    };
    
    checkCodeValidity();
  }, [oobCode, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Kiểm tra khoảng trắng ở đầu/cuối (MSG60)
    if (newPassword !== newPassword.trim() || confirmPassword !== confirmPassword.trim()) {
      setError(MSG60);
      return;
    }

    // 2. Kiểm tra chỉ có khoảng trắng hoặc trống (MSG01)
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError(MSG01);
      return;
    }

    // 3. Kiểm tra mật khẩu không được chứa bất kỳ khoảng trắng nào (MSG61)
    if (/\s/.test(newPassword)) {
      setError(MSG61);
      return;
    }

    // 4. Kiểm tra độ mạnh mật khẩu (MSG57)
    // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(MSG57);
      return;
    }

    // 5. Kiểm tra xác nhận mật khẩu (MSG58)
    if (newPassword !== confirmPassword) {
      setError(MSG58);
      return;
    }

    if (!oobCode) return;

    // 6. Gọi API Firebase
    setIsLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập.");
      navigate("/sign-in");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----- GIAO DIỆN CHỜ TRONG KHI KIỂM TRA MÃ -----
  if (!isValidCode) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Đang kiểm tra đường dẫn...</p>
        </div>
    );
  }

  // ----- GIAO DIỆN CHÍNH KHI MÃ HỢP LỆ -----
  return (
  <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden">

    {/* ================= LEFT BANNER ================= */}
    <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5">

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Blur effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center max-w-xl text-center">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-2xl">I</span>
          </div>
          <span className="text-3xl font-black tracking-tighter">IMATE</span>
        </div>

        <h1 className="text-[44px] font-bold leading-[1.1] mb-10 tracking-tight">
          Bắt đầu hành trình chinh phục sự nghiệp IT
        </h1>

        <p className="text-slate-400 text-lg mt-8 max-w-sm">
          Nâng tầm kỹ năng phỏng vấn cùng AI Mentor hàng đầu được tin dùng bởi hàng ngàn developer.
        </p>
      </div>
    </div>

    {/* ================= RIGHT FORM ================= */}
    <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative">

      {/* Background blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[480px] relative z-10">

        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-3">Nhập mật khẩu mới</h2>
          <p className="text-slate-400">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Mật khẩu mới
            </label>

            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type={viewNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />

              {viewNewPassword ? (
                <EyeOff
                  onClick={() => setViewNewPassword(false)}
                  className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white"
                />
              ) : (
                <Eye
                  onClick={() => setViewNewPassword(true)}
                  className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white"
                />
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Xác nhận mật khẩu
            </label>

            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type={viewConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />

              {viewConfirmPassword ? (
                <EyeOff
                  onClick={() => setViewConfirmPassword(false)}
                  className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white"
                />
              ) : (
                <Eye
                  onClick={() => setViewConfirmPassword(true)}
                  className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white"
                />
              )}
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  </div>
);
}

export default ResetPassword;