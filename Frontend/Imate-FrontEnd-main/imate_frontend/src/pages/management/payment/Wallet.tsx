import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { DepositDialog } from "@/pages/dialog/main/payment/DepositDialog";
import { WithdrawDialog } from "@/pages/dialog/main/payment/WithdrawDialog";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Loader2, Calendar, BookOpen, Shield } from "lucide-react";
import { getTransactions, cancelTransaction, getWalletSummary } from "@/services/walletService";
import type { Transaction } from "@/types/response/wallet.response";
import type { WalletSummaryResponse } from "@/types/response/wallet.response";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StatusBadge, type Status } from "@/components/ui/status-badge";
import { TRANSACTION_STATUS_OPTIONS, TRANSACTION_TYPE_OPTIONS, TransactionStatus, type TransactionStatusType } from "@/constants/enum";
import { ROLES } from "@/constants/role";
import { toast } from "react-toastify";

function Wallet() {
  const { user, refetchUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  // ...existing code...

  // Wallet Summary
  const [walletSummary, setWalletSummary] = useState<WalletSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const params: any = { pageNumber: page, pageSize };
  if (statusFilter) {
    params.status = statusFilter;
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  const statusBadgeMap: Record<TransactionStatusType, Status> = {
    [TransactionStatus.Pending]: "pending",
    [TransactionStatus.Completed]: "active",
    [TransactionStatus.Failed]: "inactive",
    [TransactionStatus.Cancelled]: "error",
    [TransactionStatus.Escrow]: "draft"
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("status");
    const cancel = params.get("cancel");
    const orderCode = params.get("orderCode");

    if (paymentStatus === "PAID") {
      toast.success("Thanh toán thành công");
      refetchUser();

      navigate("/wallet", { replace: true });

      setTimeout(() => {
        fetchAll();
      }, 300);
      return;
    }

    if (cancel === "true" || paymentStatus === "CANCELLED") {
      if (orderCode) {
        cancelTransaction(Number(orderCode));
      }

      toast.error("Thanh toán đã bị hủy");

      navigate("/wallet", { replace: true });

      setTimeout(() => {
        fetchAll();
      }, 300);
    }
  }, [location]);

  // Fetch wallet summary
  const fetchWalletSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await getWalletSummary();
      setWalletSummary(response.data || null);
    } catch (err: any) {
      console.error("Lỗi tải thông tin ví:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        pageNumber: page,
        pageSize: pageSize,
      };

      if (statusFilter !== "") {
        params.status = statusFilter;
      }

      if (typeFilter !== "") {
        params.type = typeFilter;
      }
      const response = await getTransactions(params);
      setTransactions(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalCount(response.data?.totalCount || 0);
    } catch (err: any) {
      console.error("Lỗi tải lịch sử:", err);
      setError("Không thể tải lịch sử giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    fetchWalletSummary();
    fetchTransactions();
  };

  useEffect(() => {
    fetchWalletSummary();
    fetchTransactions();
  }, [page, statusFilter, typeFilter]);

  return (
    <div className="container mx-auto max-w-7xl pt-10 pb-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - Wallet Info & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Wallet Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                <WalletIcon size={18} className="text-white/90" />
              </div>
              <h1 className="text-2xl font-bold text-white">Ví Imate</h1>
            </div>

            <p className="text-sm text-gray-400 mb-1">Số dư hiện tại</p>
            <p className="text-4xl font-extrabold text-yellow-400 tracking-tight leading-none mb-6">
              {walletSummary?.currentBalance?.toLocaleString() ?? "0"}
              <span className="text-xl font-bold text-yellow-300/90 ml-2">imCoin</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                className="flex-1 gap-2"
                onClick={() => setOpenDeposit(true)}
              >
                <ArrowDownCircle size={18} />
                Nạp tiền
              </Button>
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={() => setOpenWithdraw(true)}
              >
                <ArrowUpCircle size={18} />
                Rút tiền
              </Button>
            </div>
          </div>

          {/* Summary Stats Cards */}
          {summaryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Stats Grid - Always show for all roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tổng thu / Nạp */}
                <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                  <p className="text-sm text-green-400/80 mb-1">Tổng thu (Nạp)</p>
                  <p className="text-2xl font-bold text-green-400">
                    +{walletSummary?.totalDeposit?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-xs text-green-400/60 mt-1">imCoin</p>
                </div>

                {/* Tổng rút */}
                <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                  <p className="text-sm text-red-400/80 mb-1">Tổng rút</p>
                  <p className="text-2xl font-bold text-red-400">
                    -{walletSummary?.totalWithdrawal?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-xs text-red-400/60 mt-1">imCoin</p>
                </div>
              </div>

              {/* Mentor-specific Cards */}
              {user?.role === ROLES.MENTOR && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Max Bookings Can Receive */}
                  {walletSummary?.maxBookingsCanReceive !== null && walletSummary?.maxBookingsCanReceive !== undefined && (
                    <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen size={18} className="text-blue-400" />
                      </div>
                      <p className="text-sm text-blue-400/80 mb-1">Slots khả dụng</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {walletSummary.maxBookingsCanReceive}
                      </p>
                      <p className="text-xs text-blue-400/60 mt-1">buổi học</p>
                    </div>
                  )}

                  {/* Current Escrow Bookings */}
                  {walletSummary?.currentEscrowBookings !== null && walletSummary?.currentEscrowBookings !== undefined && (
                    <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Shield size={18} className="text-purple-400" />
                      </div>
                      <p className="text-sm text-purple-400/80 mb-1">Đang khóa (Escrow)</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {walletSummary.currentEscrowBookings}
                      </p>
                      <p className="text-xs text-purple-400/60 mt-1">buổi học</p>
                    </div>
                  )}

                  {/* Price Per Session */}
                  {walletSummary?.pricePerSession !== null && walletSummary?.pricePerSession !== undefined && (
                    <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                      <p className="text-sm text-yellow-400/80 mb-1">Giá / buổi</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {walletSummary.pricePerSession.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-400/60 mt-1">imCoin</p>
                    </div>
                  )}

                  {/* Required Balance For One Booking */}
                  {walletSummary?.requiredBalanceForOneBooking !== null && walletSummary?.requiredBalanceForOneBooking !== undefined && (
                    <div className="rounded-xl border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-5 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar size={18} className="text-orange-400" />
                      </div>
                      <p className="text-sm text-orange-400/80 mb-1">Đảm bảo / buổi</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {walletSummary.requiredBalanceForOneBooking.toLocaleString()}
                      </p>
                      <p className="text-xs text-orange-400/60 mt-1">imCoin</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN - Transaction History */}
        <div className="lg:col-span-8">
          <div className="h-full bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Lịch sử giao dịch</h2>

              <div className="flex items-center gap-2">
                {/* Filter Type */}
                <p className="text-slate-400 text-sm">Loại:</p>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-36"
                >
                  <option value="">Tất cả</option>
                  {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {/* Filter Status */}
                <p className="text-slate-400 text-sm">Trạng thái:</p>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-36"
                >
                  <option value="">Tất cả</option>
                  {TRANSACTION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Đang tải giao dịch...
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-400">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20 text-slate-400">Chưa có giao dịch nào</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    maxHeight="60vh"
                  >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.transactionId}>
                          <TableCell>{new Date(tx.date).toLocaleString("vi-VN")}</TableCell>
                          <TableCell className="font-medium">
                            {
                              TRANSACTION_TYPE_OPTIONS.find(opt => opt.value === tx.transactionType)?.label
                              || tx.transactionType
                            }
                          </TableCell>
                          <TableCell
                            className={cn(
                              tx.transactionType === "Deposit" || tx.transactionType === "BookingPayout" || tx.transactionType === "Refund"
                                ? "text-green-400"
                                : "text-red-400",
                              "font-medium"
                            )}
                          >
                            {tx.transactionType === "Deposit" || tx.transactionType === "BookingPayout" || tx.transactionType === "Refund"
                              ? `+${tx.amount.toLocaleString("vi-VN")}`
                              : `-${Math.abs(tx.amount).toLocaleString("vi-VN")}`
                            }
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={statusBadgeMap[tx.status as TransactionStatusType] || "inactive"}>
                              {TRANSACTION_STATUS_OPTIONS.find(opt => opt.value === tx.status)?.label || tx.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm max-w-[200px] truncate">
                            {tx.reason || tx.externalCode || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DepositDialog open={openDeposit} onOpenChange={setOpenDeposit} onSuccess={fetchAll} />
      <WithdrawDialog open={openWithdraw} onOpenChange={setOpenWithdraw} onSuccess={fetchAll} />
    </div>
  );
}

export default Wallet;
