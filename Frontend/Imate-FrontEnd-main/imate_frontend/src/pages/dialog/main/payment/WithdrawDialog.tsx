import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createWithdrawal } from "@/services/walletService";
import type { WithdrawRequest } from "@/types/request/wallet.request";

import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WithdrawDialog({
  open,
  onOpenChange,
  onSuccess
}: WithdrawDialogProps) {
  const { user } = useAuth();
  
  const [amount, setAmount] = React.useState<number | "">("");
  const [bankCode, setBankCode] = React.useState("");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const isCandidate = user?.role === "Candidate";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (isCandidate) {
      if (!bankCode || !bankAccountHolder || !bankAccountNumber) {
        toast.error("Vui lòng nhập đầy đủ thông tin ngân hàng");
        return;
      }
    }

    setLoading(true);

    const payload: WithdrawRequest = {
      amount: Number(amount),
      bankCode: isCandidate ? bankCode : undefined,
      bankAccountHolder: isCandidate ? bankAccountHolder : undefined,
      bankAccountNumber: isCandidate ? bankAccountNumber : undefined,
    };

    try {
      await createWithdrawal(payload);

      toast.success("Tạo yêu cầu rút tiền thành công");
      onOpenChange(false);
      setAmount("");
      setBankCode("");
      setBankAccountHolder("");
      setBankAccountNumber("");
      onSuccess?.();     
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Tạo yêu cầu rút tiền thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Rút imCoin
          </DialogTitle>
          <DialogDescription>
            Yêu cầu rút tiền sẽ được xử lý trong vòng 48 giờ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* AMOUNT */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Số tiền muốn rút <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="Nhập số tiền muốn rút"
                className="bg-slate-800 border-slate-700 text-white pr-10"
                disabled={loading}
              />
              <span className="absolute right-3 top-2 text-slate-400">
                đ
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Số imCoin hiện tại:{" "}
              <span className="text-blue-400 font-medium">
                {user?.balance?.toLocaleString() ?? "0"}
              </span>
            </p>
          </div>

          {/* BANK INFO - only Candidate */}
          {isCandidate && (
            <div className="space-y-3">
              <label className="text-sm text-slate-300">
                Thông tin ngân hàng <span className="text-red-400">*</span>
              </label>

              <Input
                placeholder="Mã ngân hàng (VD: VCB)"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                disabled={loading}
              />

              <Input
                placeholder="Tên chủ tài khoản"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                disabled={loading}
              />

              <Input
                placeholder="Số tài khoản"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                disabled={loading}
              />
            </div>
          )}

          {/* FOOTER */}
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={loading}
              >
                Thoát
              </Button>
            </DialogClose>

            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}