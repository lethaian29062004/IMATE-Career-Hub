import { useState, useEffect } from "react";
import { Pencil, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { toast } from "react-toastify";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { getSubscriptionOverview, updateSubscriptionPackagePrice } from "@/services/subscriptionPackageService";
import type { SubscriptionOverviewResponse } from "@/services/subscriptionPackageService";
import type { SubscriptionPackageItem } from "@/types/common/subscriptionPackage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MSG06, MSG07, MSG09, MSG10, MSG36 } from "@/constants/messages";

// ─── Helpers ────────────────────────────────────────────────
const formatPrice = (price: number) =>
  price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}`;

// Tier-specific color configs
const tierColors: Record<number, { gradient: string; badge: string; border: string; text: string }> = {
  0: {
    gradient: "from-slate-700/60 to-slate-800/60",
    badge: "bg-slate-600/80 text-slate-200",
    border: "border-slate-700/60",
    text: "text-white",
  },
  1: {
    gradient: "from-emerald-900/40 to-emerald-950/40",
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  2: {
    gradient: "from-rose-900/30 to-rose-950/30",
    badge: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    border: "border-rose-500/30",
    text: "text-rose-400",
  },
};

const getTierColor = (index: number) => tierColors[index] ?? tierColors[0];

// ─── SVG Area Chart ─────────────────────────────────────────
interface AreaChartProps {
  monthlySales: SubscriptionOverviewResponse["monthlySales"];
  packageNames: string[];
}

function AreaChart({ monthlySales, packageNames }: AreaChartProps) {
  const width = 700;
  const height = 260;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const chartMonths = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  const colors = ["#10b981", "#f43f5e", "#a855f7"];

  // Extract data arrays for each package
  const seriesData = packageNames.map((name) =>
    monthlySales.map((m) => m.packageSales[name] ?? 0)
  );

  const maxVal = Math.max(1, ...seriesData.flat());
  const toX = (i: number) => padX + (i / (chartMonths.length - 1)) * chartW;
  const toY = (v: number) => padY + chartH - (v / maxVal) * chartH;

  const buildPath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  const buildArea = (data: number[]) =>
    `${buildPath(data)} L${toX(data.length - 1)},${padY + chartH} L${toX(0)},${padY + chartH} Z`;

  // Y-axis labels
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((maxVal / ySteps) * i)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yLabels.map((val) => {
        const y = toY(val);
        return (
          <g key={val}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#334155" strokeWidth="0.5" />
            <text x={padX - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{val}</text>
          </g>
        );
      })}

      {/* Series */}
      {seriesData.map((data, si) => (
        <g key={si}>
          <path d={buildArea(data)} fill={colors[si]} opacity="0.15" />
          <path d={buildPath(data)} fill="none" stroke={colors[si]} strokeWidth="2" />
          {data.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={colors[si]} />
          ))}
        </g>
      ))}

      {/* X-axis labels */}
      {chartMonths.map((m, i) => (
        <text key={m} x={toX(i)} y={height - 4} textAnchor="middle" fill="#64748b" fontSize="10">{m}</text>
      ))}

      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

// ─── Mini Sparkline for Overview Cards ──────────────────────
function Sparkline({ up }: { up: boolean }) {
  const color = up ? "#a855f7" : "#f43f5e";
  const d = up
    ? "M0,20 Q10,18 20,12 T40,8 T60,4 T80,2"
    : "M0,4 Q10,6 20,10 T40,14 T60,16 T80,20";
  return (
    <svg viewBox="0 0 80 24" className="w-20 h-6">
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// ─── Pricing Card ───────────────────────────────────────────
interface PricingCardProps {
  pkg: SubscriptionPackageItem;
  index: number;
  onEdit: (pkg: SubscriptionPackageItem) => void;
}

function PricingCard({ pkg, index, onEdit }: PricingCardProps) {
  const tier = getTierColor(index);
  return (
    <div
      className={`relative rounded-lg border ${tier.border} bg-gradient-to-b ${tier.gradient} p-6 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
        {index > 0 && (
          <button
            onClick={() => onEdit(pkg)}
            className={`p-1.5 rounded-md ${tier.badge} hover:opacity-80 transition-opacity`}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {pkg.duration || "Chưa có mô tả"}
      </p>

      {/* Price */}
      <div className="mb-4">
        <p className={`text-3xl font-bold ${tier.text}`}>
          {formatPrice(pkg.price)}
        </p>
        {pkg.price > 0 && (
          <p className="text-xs text-slate-400 mt-1">{pkg.duration || "5 phiên phỏng vấn"}</p>
        )}
      </div>

      {/* Features */}
      <div className="mt-auto">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Tính năng</p>
        <ul className="space-y-2">
          {pkg.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-purple-400 mt-0.5 shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Edit Price Modal ───────────────────────────────────────
interface EditPriceModalProps {
  open: boolean;
  pkg: SubscriptionPackageItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

function EditPriceModal({ open, pkg, onClose, onUpdated }: EditPriceModalProps) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset when package changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && pkg) {
      setPrice(pkg.price.toLocaleString("vi-VN"));
      setError("");
    }
    if (!isOpen) onClose();
  };

  const handleSubmit = async () => {
    const numericStr = price.replace(/\./g, "").replace(/,/g, "");
    const numericVal = parseInt(numericStr, 10);
    if (isNaN(numericVal) || numericVal <= 0) {
      setError(MSG36);
      return;
    }
    if (!pkg) return;

    setLoading(true);
    try {
      await updateSubscriptionPackagePrice(pkg.id, numericVal);
      toast.success(MSG09);
      onUpdated();
      onClose();
    } catch {
      toast.error(MSG10);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">Chỉnh sửa giá dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">
              Giá dịch vụ cho một phiên phỏng vấn<span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                value={price}
                onChange={(e) => {
                  // Xóa tất cả ký tự không phải số
                  const raw = e.target.value.replace(/\D/g, "");
                  // Format với dấu chấm phân cách hàng nghìn
                  const formatted = raw ? Number(raw).toLocaleString("vi-VN") : "";
                  setPrice(formatted);
                  if (error) setError("");
                }}
                placeholder="100.000"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 pr-14 focus-visible:ring-purple-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">VNĐ</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
            <p className="text-xs text-slate-500">
              <strong className="text-slate-400">Điều khoản liên quan:</strong> Giá dịch vụ sẽ được áp dụng cho tất cả các phiên phỏng vấn mới. 
              Giá sẽ được reset theo chu kỳ gói đăng ký của người dùng.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function SubscriptionManagement() {
  const { data: packages = [], isLoading, error, refetch: refetchPackages } = useSubscriptionPackages();
  const [editPkg, setEditPkg] = useState<SubscriptionPackageItem | null>(null);
  const [overview, setOverview] = useState<SubscriptionOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const data = await getSubscriptionOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Featured package (from API or fallback)
  const featured = overview?.featuredPackageName
    ?? packages.find((p) => p.isRecommended)?.name
    ?? packages[1]?.name
    ?? null;

  // Get paid package names for chart legend
  const paidPackageNames = packages.filter((p) => p.price > 0).map((p) => p.name);
  const chartColors: Record<number, string> = { 0: "#10b981", 1: "#f43f5e", 2: "#a855f7" };

  const handlePriceUpdated = () => {
    refetchPackages();
    fetchOverview();
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý gói đăng ký
          </h1>
          <p className="text-slate-400">
            Quản lý và cập nhật các gói đăng ký dịch vụ.
          </p>
        </div>
      </div>

      {/* ── Overview Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Total sold */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-400">Tổng số gói bán được</p>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            {overviewLoading ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-bold text-white">{overview?.totalSold ?? 0}</p>
                <Sparkline up />
              </>
            )}
          </div>
        </div>

        {/* Card 2 — Revenue */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-400">Doanh thu</p>
            <TrendingDown size={16} className="text-rose-400" />
          </div>
          {overviewLoading ? (
            <div className="h-8 w-28 bg-slate-700 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {(overview?.totalRevenue ?? 0).toLocaleString("vi-VN")}
              <span className="text-sm font-normal text-slate-400 ml-2">VNĐ</span>
            </p>
          )}
        </div>

        {/* Card 3 — Featured package */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-5 flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400 mb-3">Gói đăng ký nổi bật</p>
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-purple-400" />
            <p className="text-2xl font-bold text-purple-300">{featured ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* ── Chart Section ── */}
      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Thống kê doanh thu</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {paidPackageNames.map((name, i) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i] ?? "#a855f7" }} />
                <span className="text-slate-300">{name}</span>
              </span>
            ))}
          </div>
        </div>
        {overview?.monthlySales ? (
          <AreaChart monthlySales={overview.monthlySales} packageNames={paidPackageNames} />
        ) : overviewLoading ? (
          <div className="h-64 bg-slate-700 rounded animate-pulse" />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">Không có dữ liệu thống kê</div>
        )}
      </div>

      {/* ── Pricing Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/40 p-6 h-72" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center text-rose-300">
          {MSG07}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-6 py-10 text-center text-slate-400">
          {MSG06}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.slice(0, 3).map((pkg, i) => (
            <PricingCard key={pkg.id} pkg={pkg} index={i} onEdit={setEditPkg} />
          ))}
        </div>
      )}

      {/* ── Edit Price Modal ── */}
      <EditPriceModal
        open={!!editPkg}
        pkg={editPkg}
        onClose={() => setEditPkg(null)}
        onUpdated={handlePriceUpdated}
      />
    </div>
  );
}
