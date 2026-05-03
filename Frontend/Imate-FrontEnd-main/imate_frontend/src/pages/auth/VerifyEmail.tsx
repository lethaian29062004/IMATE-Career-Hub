import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth, applyActionCode } from "firebase/auth";
import { toast } from "react-toastify";
// import AuthLayout from "@/layout/auth/authLayout";
// import AuthBanner from "@/components/custom/authBanner";
import { CheckCircle, XCircle } from "lucide-react";

function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple calls (e.g., in React StrictMode)
      if (hasVerifiedRef.current) {
        return;
      }

      if (!oobCode) {
        setError("Đường dẫn không hợp lệ hoặc đã hết hạn.");
        setIsLoading(false);
        return;
      }

      try {
        hasVerifiedRef.current = true;
        const auth = getAuth();
        // Apply the action code to verify the email
        await applyActionCode(auth, oobCode);
        setIsVerified(true);
        toast.success("Email đã được xác minh thành công!");
        
        // Redirect to sign-in after 2 seconds
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } catch (err: any) {
        // Check if error is because code was already used (email already verified)
        if (err.code === "auth/invalid-action-code" || err.message?.includes("invalid action code")) {
          // If already verified, treat as success
          setIsVerified(true);
          toast.success("Email đã được xác minh thành công!");
          setTimeout(() => {
            navigate("/sign-in");
          }, 2000);
        } else {
          const errorMessage = err.message || "Đường dẫn không hợp lệ hoặc đã hết hạn.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [oobCode, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        {isLoading ? (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#5D5FEF] border-t-transparent"></div>
            <p className="text-gray-600">Đang xác minh email...</p>
          </div>
        ) : isVerified ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Xác minh thành công!</h2>
            <p className="mb-6 text-gray-600">Email của bạn đã được xác minh thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
          </div>
        ) : (
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Xác minh thất bại</h2>
            <p className="mb-6 text-gray-600">{error || "Đường dẫn không hợp lệ hoặc đã hết hạn."}</p>
            <button
              onClick={() => navigate("/sign-in")}
              className="w-full cursor-pointer rounded-lg bg-[#5D5FEF] py-2 font-medium text-white transition hover:opacity-90"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

