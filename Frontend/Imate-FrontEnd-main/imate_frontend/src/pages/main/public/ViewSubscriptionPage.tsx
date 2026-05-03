import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { useAuth } from "@/store/AuthContext";
import {
  cancelSubscription,
  createUserSubscription,
  getCancelPreview,
  getCurrentPackage,
  getUpgradePreview,
} from "@/services/userSubscriptionService";
import { PreviewPackageDialog } from "@/pages/dialog/main/payment/PreviewPackageDialog";

const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ`;
};

const ViewSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: packages = [], isLoading, error, refetch } =
    useSubscriptionPackages();

  const [currentPackage, setCurrentPackage] = React.useState<any>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"upgrade" | "cancel">(
    "upgrade"
  );
  const [upgradePreview, setUpgradePreview] = React.useState<any>(null);
  const [cancelPreview, setCancelPreview] = React.useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = React.useState<number | null>(
    null
  );

  // ================= FETCH CURRENT PACKAGE =================
  const fetchCurrentPackage = async () => {
    if (!user) return;

    try {
      const pkg = await getCurrentPackage();
      setCurrentPackage(pkg);
    } catch (err) {
      console.log("Cannot get current package", err);
    }
  };

  useEffect(() => {
    fetchCurrentPackage();
  }, [user]);

  // ================= HANDLE BUTTON CLICK =================
  const handleCtaClick = async (pkg: any) => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    if (!currentPackage) {
      toast.error("Không lấy được gói hiện tại");
      return;
    }
    setSelectedPackageId(pkg.id);

    try {
      setUpgradePreview(null);
      setCancelPreview(null);

      if (pkg.rank === currentPackage.rank) {
        const preview = await getCancelPreview();
        setCancelPreview(preview);
        setDialogType("cancel");
      } else {
        const preview = await getUpgradePreview(pkg.id);
        setUpgradePreview(preview);
        setDialogType("upgrade");
      }

      setDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ================= CONFIRM UPGRADE / CANCEL =================
  const handleConfirm = async () => {
    try {
      if (dialogType === "upgrade") {
        if (!selectedPackageId) return;
        await createUserSubscription(selectedPackageId);
        toast.success("Nâng cấp gói thành công!");
      } else {
        await cancelSubscription();
        toast.success("Hủy gói thành công!");
      }

      setDialogOpen(false);
      await fetchCurrentPackage();
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="font-sans bg-[#020617]">
      <main className="px-6 pb-6 pt-16">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Chọn gói dịch vụ phù hợp với bạn
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Mở khóa nhiều quyền lợi hơn để tăng tốc hành trình luyện phỏng vấn IT
              cùng Imate.
            </p>
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white/10 bg-[#1e293b]/50 p-8"
                >
                  <div className="h-5 w-24 bg-slate-700 rounded mb-4" />
                  <div className="h-10 w-36 bg-slate-700 rounded mb-6" />
                  <div className="space-y-3 mb-8">
                    <div className="h-4 w-full bg-slate-800 rounded" />
                    <div className="h-4 w-4/5 bg-slate-800 rounded" />
                    <div className="h-4 w-3/5 bg-slate-800 rounded" />
                  </div>
                  <div className="h-11 w-full bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
              <p className="text-red-300 mb-4">
                {error instanceof Error
                  ? error.message
                  : "Không thể tải danh sách gói dịch vụ."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#1e293b]/40 px-6 py-10 text-center text-slate-300">
              Hiện chưa có gói dịch vụ khả dụng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.slice(0, 3).map((subscriptionPackage) => {
                const isCurrent =
                  currentPackage?.packageId === subscriptionPackage.id;

                let buttonText = "Mua ngay";
                let showButton = true;

                if (currentPackage) {
                  if (subscriptionPackage.id === currentPackage.packageId) {
                    if (subscriptionPackage.price === 0) {
                      showButton = false;
                    } else {
                      buttonText = "Hủy gói";
                    }
                  } else if (subscriptionPackage.rank > currentPackage.rank) {
                    buttonText = "Nâng cấp gói";
                  } else {
                    showButton = false;
                  }
                }

                let cardStyle = "bg-[#1e293b]/45 border-white/10";
                const highlightStyle =
                  "bg-gradient-to-b from-indigo-500/20 to-purple-500/10 border-indigo-400/50 shadow-xl shadow-indigo-900/30 scale-105";
                if (!user && subscriptionPackage.isRecommended) {
                  cardStyle = highlightStyle;
                }
                if (user && isCurrent) {
                  cardStyle = highlightStyle;
                }

                return (
                  <article
                    key={subscriptionPackage.id}
                    className={`relative rounded-3xl border p-8 backdrop-blur-sm transition-all ${cardStyle}`}
                  >
                    {/* GÓI HIỆN TẠI (ưu tiên hiển thị) */}
                    {user && isCurrent && (
                      <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-[11px] font-bold text-white">
                        GÓI CỦA BẠN
                      </span>
                    )}

                    {/* CHỈ hiện KHUYÊN DÙNG khi CHƯA login */}
                    {!user && subscriptionPackage.isRecommended && (
                      <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-[11px] font-bold text-white">
                        KHUYÊN DÙNG
                      </span>
                    )}

                    <h2 className="text-white text-2xl font-bold mb-2">
                      {subscriptionPackage.name}
                    </h2>
                    <p className="text-3xl font-extrabold text-white mb-1">
                      {formatPrice(subscriptionPackage.price)}
                    </p>
                    <p className="text-sm text-slate-400 mb-6">
                      {subscriptionPackage.duration}
                    </p>

                    <ul className="space-y-3 mb-8 min-h-[120px]">
                      {subscriptionPackage.benefits.map(
                        (benefit: string, index: number) => (
                          <li
                            key={`${subscriptionPackage.id}-${index}`}
                            className="flex items-start gap-2 text-slate-200 text-sm"
                          >
                            <span className="text-indigo-400 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        )
                      )}
                    </ul>

                    {showButton && (
                      <button
                        onClick={() => handleCtaClick(subscriptionPackage)}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                          isCurrent
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            : subscriptionPackage.isRecommended && !user
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                              : "bg-white text-[#0f172a] hover:bg-slate-100"
                        }`}
                      >
                        {buttonText}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* DIALOG */}
      <PreviewPackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        upgradePreview={upgradePreview}
        cancelPreview={cancelPreview}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ViewSubscriptionPage;