// ...existing code...
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

import type { UpgradePreview, CancelPreview } from "@/types/response/userSubscription.response";

type PreviewType = "upgrade" | "cancel";

interface PreviewPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: PreviewType;
  upgradePreview?: UpgradePreview;
  cancelPreview?: CancelPreview;
  onConfirm?: () => void;
}

export function PreviewPackageDialog({
  open,
  onOpenChange,
  type,
  upgradePreview,
  cancelPreview,
  onConfirm,
}: PreviewPackageDialogProps) {
  const isUpgrade = type === "upgrade";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {isUpgrade ? "Xác nhận nâng cấp gói" : "Xác nhận hủy gói"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Upgrade preview */}
        {isUpgrade && upgradePreview && (
          <div className="space-y-3 text-slate-200 text-sm">
            <div className="flex justify-between">
              <span>Gói hiện tại:</span>
              <span>{upgradePreview.oldPackageName || "Free"}</span>
            </div>

            <div className="flex justify-between">
              <span>Gói mới:</span>
              <span>{upgradePreview.newPackageName}</span>
            </div>

            <div className="flex justify-between">
              <span>Giá gói mới:</span>
              <span>{upgradePreview.newPackagePrice.toLocaleString()}đ</span>
            </div>

            <div className="flex justify-between">
              <span>Giá trị còn lại:</span>
              <span>-{upgradePreview.remainingValue.toLocaleString()}đ</span>
            </div>

            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white">
              <span>Số tiền cần thanh toán:</span>
              <span>{upgradePreview.amountToCharge.toLocaleString()}đ</span>
            </div>

            {!upgradePreview.isEligible && (
              <p className="text-red-400">{upgradePreview.message}</p>
            )}
          </div>
        )}

        {/* Cancel preview */}
        {!isUpgrade && cancelPreview && (
          <div className="space-y-3 text-slate-200 text-sm">
            <div className="flex justify-between">
              <span>Gói sẽ hủy:</span>
              <span>{cancelPreview.packageToCancel}</span>
            </div>

            <div className="flex justify-between">
              <span>Số ngày còn lại:</span>
              <span>{cancelPreview.remainingDays} ngày</span>
            </div>

            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white">
              <span>Số tiền hoàn lại:</span>
              <span>{cancelPreview.refundAmount.toLocaleString()}đ</span>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Hủy
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
          >
            {isUpgrade ? "Xác nhận nâng cấp" : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}