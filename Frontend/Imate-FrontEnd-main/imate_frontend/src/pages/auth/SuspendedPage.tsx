import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { ShieldAlert, LogOut, Mail, MessageSquare, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SuspendedPage - Redesigned to match the premium HomePage style
 */
const SuspendedPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Hero Glow - Matches HomePage */}
      <div className="hero-glow opacity-50"></div>
      
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8 relative z-10 animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">System Security Notification</span>
      </div>

      <div className="max-w-xl w-full glassmorphism rounded-3xl p-8 md:p-12 text-center relative z-10 shadow-2xl border border-white/10">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-slate-900 p-6 rounded-2xl border border-red-500/30">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1.5 rounded-lg border border-red-500/50">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Tài khoản <br />
          <span className="neon-gradient-text">đã bị tạm khóa</span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-sm mx-auto">
          Rất tiếc, tài khoản <span className="text-white font-semibold">{user?.email || "của bạn"}</span> đã bị đình chỉ hoạt động do vi phạm quy tắc cộng đồng hoặc lý do bảo mật.
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-left hover:border-white/10 transition-all group">
            <Mail className="w-5 h-5 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email hỗ trợ</div>
            <div className="text-white font-medium truncate">StartImate@gmail.com</div>
          </div>
          
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-left hover:border-white/10 transition-all group">
            <MessageSquare className="w-5 h-5 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phản hồi</div>
            <div className="text-white font-medium">Trong vòng 24-48h</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleLogout}
            variant="danger"
            className="flex-1 py-7 text-lg font-bold rounded-2xl shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Đăng xuất
          </Button>
          
          <Link
            to="/home"
            className="flex-1 py-4 px-6 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Trang chủ
          </Link>
        </div>

        <div className="mt-12 flex justify-center items-center gap-3">
            <div className="h-px w-8 bg-slate-800"></div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Imate Governance</p>
            <div className="h-px w-8 bg-slate-800"></div>
        </div>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-xs text-slate-500 tracking-wide relative z-10">
        Account ID: <span className="font-mono text-slate-400">{user?.id || "anonymous"}</span>
      </p>
    </div>
  );
};

export default SuspendedPage;
