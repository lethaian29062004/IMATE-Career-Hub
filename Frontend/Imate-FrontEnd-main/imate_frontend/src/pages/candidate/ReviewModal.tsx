import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rateMentor } from "@/services/bookingCandidateService";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  mentorName: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  mentorName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (review.length < 10) {
      toast.error("Đánh giá phải có ít nhất 10 ký tự!");
      return;
    }

    try {
      setIsSubmitting(true);
      await rateMentor(bookingId, rating, review);
      toast.success("Cảm ơn bạn đã để lại đánh giá!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A2E] border-slate-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Đánh giá buổi phỏng vấn</DialogTitle>
          <DialogDescription className="text-slate-400">
            Hãy chia sẻ trải nghiệm của bạn về buổi phỏng vấn với {mentorName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-colors focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-8 w-8 ${
                    (hover || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-300">
            {rating === 0 ? "Chọn số sao" : `${rating} / 5 sao`}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Nhận xét chi tiết
          </label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Nhập nhận xét của bạn tại đây (tối thiểu 10 ký tự)..."
            className="min-h-[100px] border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-600"
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
