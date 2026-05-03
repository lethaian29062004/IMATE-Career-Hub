
import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { generateActionCode, sendActionEmail } from "@/services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Generate action code (oobCode) without sending email
      const oobCode = await generateActionCode(email, "PASSWORD_RESET");

      // Step 2: Send custom email via Resend with the oobCode
      //await sendActionEmail(oobCode, email, "PASSWORD_RESET");
      await sendActionEmail(oobCode, email, "PASSWORD_RESET");

      toast.success(`Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến ${email}!`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
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
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative bg-[#020617]">

        {/* Background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-[480px] relative z-10">

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-3">Quên mật khẩu</h2>
            <p className="text-slate-400">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/Sign-in"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Quay lại đăng nhập
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
