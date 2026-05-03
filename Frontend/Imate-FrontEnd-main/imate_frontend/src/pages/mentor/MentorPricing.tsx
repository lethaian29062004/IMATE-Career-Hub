import React, { useState, useEffect } from "react";
import { DollarSign, Info, Shield, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getWalletSummary } from "@/services/walletService";
import { updateMentorPrice } from "@/services/mentorService";
import type { WalletSummaryResponse } from "@/types/response/wallet.response";
import { Input } from "@/components/ui/input";

const MentorPricing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [walletSummary, setWalletSummary] = useState<WalletSummaryResponse | null>(null);
  const [newPrice, setNewPrice] = useState<string>("");

  useEffect(() => {
    fetchWalletSummary();
  }, []);

  const fetchWalletSummary = async () => {
    setLoading(true);
    try {
      const response = await getWalletSummary();
      const data = response.data;
      setWalletSummary(data);
      if (data?.pricePerSession) {
        setNewPrice(data.pricePerSession.toString());
      }
    } catch (error) {
      console.error("Error fetching wallet summary:", error);
      toast.error("Không thể tải thông tin giá hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  const calculateGuarantee = (price: number) => {
    if (!walletSummary?.guaranteeDepositRate) return 0;
    return (price * walletSummary.guaranteeDepositRate) / 100;
  };

  const handleUpdatePrice = async () => {
    const priceValue = parseInt(newPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error("Vui lòng nhập giá hợp lệ.");
      return;
    }

    setUpdating(true);
    try {
      await updateMentorPrice(priceValue);
      toast.success("Cập nhật giá dịch vụ thành công!");
      fetchWalletSummary();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Cập nhật giá thất bại.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentGuarantee = calculateGuarantee(walletSummary?.pricePerSession || 0);
  const estimatedGuarantee = calculateGuarantee(parseInt(newPrice) || 0);

  return (
    <div className="container mx-auto max-w-4xl py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <DollarSign className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Thiết lập mức giá</h1>
        </div>
        <p className="text-slate-400">Điều chỉnh mức phí cho mỗi buổi cố vấn của bạn. Thay đổi sẽ có hiệu lực ngay lập tức cho các yêu cầu đặt chỗ mới.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Left Column - Current Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors duration-500" />
            
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Thông tin hiện tại</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Giá mỗi buổi</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {walletSummary?.pricePerSession?.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-yellow-500/80">imCoin</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Mức đảm bảo yêu cầu (vốn)</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-lg font-semibold text-slate-200">
                    {currentGuarantee.toLocaleString()} imCoin
                  </span>
                  <span className="text-xs text-slate-500">
                    ({walletSummary?.guaranteeDepositRate}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-300 leading-relaxed">
                Số tiền đảm bảo sẽ được tạm giữ từ số dư ví của bạn cho mỗi buổi hẹn được xác nhận (Confirmed).
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-400" /> Các quy định về giá
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1 flex-shrink-0" />
                <span>Giá không bao gồm phí sàn cho mỗi giao dịch thành công.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1 flex-shrink-0" />
                <span>Bạn cần duy trì số dư tối thiểu trong ví tương ứng với mức đảm bảo để có thể nhận thêm lịch hẹn mới.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1 flex-shrink-0" />
                <span>Các lịch hẹn đã đặt trước khi đổi giá vẫn sẽ giữ nguyên mức giá cũ.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - Update Action */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Cập nhật giá mới</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Số imCoin cho mỗi buổi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                  </div>
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="pl-11 h-14 bg-slate-950/50 border-white/10 text-xl font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Nhập giá mới..."
                  />
                </div>
              </div>

              {/* Estimation Card */}
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Mức đảm bảo ước tính:</span>
                  <span className="font-bold text-indigo-300">{estimatedGuarantee.toLocaleString()} imCoin</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Mức thay đổi:</span>
                    <span className={estimatedGuarantee >= currentGuarantee ? "text-emerald-400" : "text-amber-400"}>
                        {estimatedGuarantee >= currentGuarantee ? "+" : ""}
                        {(estimatedGuarantee - currentGuarantee).toLocaleString()} imCoin
                    </span>
                </div>
              </div>
            </div>

            <Button 
                onClick={handleUpdatePrice} 
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                disabled={updating || !newPrice || parseInt(newPrice) === walletSummary?.pricePerSession}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận thay đổi"
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <p className="text-xs text-yellow-200/70">
                Hãy lựa chọn mức giá phù hợp với kinh nghiệm của bạn để thu hút nhiều học viên nhất!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPricing;
