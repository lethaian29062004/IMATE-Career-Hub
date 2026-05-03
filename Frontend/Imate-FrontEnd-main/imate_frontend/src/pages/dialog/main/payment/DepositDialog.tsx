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

import { createDeposit } from "@/services/walletService";
import type { DepositRequest } from "@/types/request/wallet.request";

import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance?: number;
  onSuccess?: () => void;
}

export function DepositDialog({
  open,
  onOpenChange,
  onSuccess
}: DepositDialogProps) {
  const { user} = useAuth();
  const [amount, setAmount] = React.useState<number | "">("");
  const [loading, setLoading] = React.useState(false);

  const quickAmounts = [50000, 100000, 500000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);

    const payload: DepositRequest = {
      amount: Number(amount),
    };

    try {
      const res = await createDeposit(payload);

      const checkoutUrl = res.data.checkoutUrl;

      toast.success("Đang chuyển đến trang thanh toán...");

      onSuccess?.();
      window.location.href = checkoutUrl;

    } catch (err: any) {
      const message =
        err.response?.data?.message || "Tạo yêu cầu nạp thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) =>
    value.toLocaleString("vi-VN");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Nạp imCoin
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* INPUT */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Số tiền muốn nạp <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="Nhập số tiền muốn nạp"
                className="bg-slate-800 border-slate-700 text-white pr-10"
                disabled={loading}
              />
              <span className="absolute right-3 top-2 text-slate-400">
                đ
              </span>
            </div>

            {/* Balance */}
            <p className="text-sm text-slate-400">
              Số imCoin hiện tại:{" "}
              <span className="text-blue-400 font-medium">
                {user?.balance?.toLocaleString() ?? "0"}
              </span>
            </p>
          </div>

          {/* QUICK AMOUNT */}
          <div className="flex gap-2">
            {quickAmounts.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setAmount(item)}
              >
                + {formatMoney(item)}
              </Button>
            ))}
          </div>

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
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}