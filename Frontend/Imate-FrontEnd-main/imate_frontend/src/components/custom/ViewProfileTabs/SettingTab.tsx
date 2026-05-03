import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

// --- Thêm các import ---
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { auth as firebaseAuth } from "@/lib/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { changePassword as changePasswordService } from "@/services/authService";
import { toast } from "react-toastify";
import { MSG01, MSG57, MSG58, MSG60, MSG61 } from "@/constants/messages";

// 1. Định nghĩa schema validation
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, MSG01),
    newPassword: z
      .string()
      .min(1, MSG01)
      .refine((val) => val === val.trim(), { message: MSG60 })
      .refine((val) => !/\s/.test(val), { message: MSG61 })
      .refine((val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val), {
        message: MSG57,
      }),
    confirmPassword: z.string().min(1, MSG01),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: MSG58,
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["newPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingTab = () => {
  // State cho ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  // Check xem user có đăng nhập bằng Google không
  useEffect(() => {
    const checkGoogleAccount = () => {
      const user = firebaseAuth.currentUser;
      if (user && user.providerData) {
        // Check xem có provider nào là Google không
        const hasGoogleProvider = user.providerData.some((provider) => provider.providerId === "google.com");
        setIsGoogleAccount(hasGoogleProvider);
      }
    };

    checkGoogleAccount();

    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(() => {
      checkGoogleAccount();
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  // 2. Hàm xử lý submit
  const onSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    setIsLoading(true);

    try {
      // BƯỚC 1: Lấy user hiện tại từ Firebase Client SDK
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

      // BƯỚC 2: Re-authenticate (Đây là lúc xác thực "mật khẩu hiện tại")
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // BƯỚC 3: Nếu (2) thành công, lấy Firebase ID Token MỚI
      const firebaseIdToken = await user.getIdToken(true); // true = force refresh

      // BƯỚC 4: Gọi API backend đã tạo
      await changePasswordService({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        firebaseIdToken: firebaseIdToken,
      });

      // BƯỚC 5: Thành công
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Mật khẩu hiện tại không đúng.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div
        className="
      rounded-2xl
      bg-[#1e293b]/40
      border border-white/5
      backdrop-blur-sm
      p-8
      shadow-[0_20px_40px_rgba(0,0,0,0.35)]
      "
      >
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-[28px] font-semibold text-white">
                Đổi mật khẩu
              </h2>

              {isGoogleAccount ? (
                <p className="text-sm text-[#A0A3BD]">
                  Tài khoản đăng nhập bằng Google không thể thay đổi mật khẩu.
                </p>
              ) : (
                <p className="text-sm text-[#A0A3BD]">
                  Cập nhật mật khẩu để bảo mật tài khoản của bạn.
                </p>
              )}
            </div>

            {isGoogleAccount ? (
              <div className="bg-[#161A3F] border border-white/10 rounded-xl p-5 text-sm text-[#A0A3BD]">
                Để thay đổi mật khẩu, vui lòng truy cập{" "}
                <a
                  href="https://myaccount.google.com/personal-info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B5CF6] hover:underline font-medium"
                >
                  Google Account Security
                </a>
              </div>
            ) : (
              <>
                {/* Current Password */}
                <FormField
                  control={control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <label className="text-sm text-[#A0A3BD]">
                        Mật khẩu hiện tại
                      </label>

                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="
                          h-12
                          bg-[#0F1333]
                          border border-white/10
                          rounded-xl
                          text-white
                          placeholder:text-[#6B6F8E]
                          focus:border-[#8B5CF6]
                          focus:ring-0
                          "
                            {...field}
                          />
                        </FormControl>

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        text-[#6B6F8E]
                        hover:text-white
                        transition-colors
                        "
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <FormMessage className="text-[#EF4444] text-xs" />
                    </FormItem>
                  )}
                />

                {/* New Password */}
                <FormField
                  control={control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <label className="text-sm text-[#A0A3BD]">
                        Mật khẩu mới
                      </label>

                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu mới"
                            className="
                          h-12
                          bg-[#0F1333]
                          border border-white/10
                          rounded-xl
                          text-white
                          placeholder:text-[#6B6F8E]
                          focus:border-[#8B5CF6]
                          focus:ring-0
                          "
                            {...field}
                          />
                        </FormControl>

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                          className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        text-[#6B6F8E]
                        hover:text-white
                        transition-colors
                        "
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      <FormMessage className="text-[#EF4444] text-xs" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <label className="text-sm text-[#A0A3BD]">
                        Xác nhận mật khẩu mới
                      </label>

                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu mới"
                            className="
                          h-12
                          bg-[#0F1333]
                          border border-white/10
                          rounded-xl
                          text-white
                          placeholder:text-[#6B6F8E]
                          focus:border-[#8B5CF6]
                          focus:ring-0
                          "
                            {...field}
                          />
                        </FormControl>

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        text-[#6B6F8E]
                        hover:text-white
                        transition-colors
                        "
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      <FormMessage className="text-[#EF4444] text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                  h-12
                  px-6
                  rounded-xl
                  text-white
                  font-semibold
                  bg-gradient-to-r
                  from-[#6C63FF]
                  via-[#8B5CF6]
                  to-[#A855F7]
                  hover:brightness-110
                  transition-all
                  shadow-[0_0_20px_rgba(139,92,246,0.35)]
                  "
                  >
                    {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </button>
                </div>
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingTab;
