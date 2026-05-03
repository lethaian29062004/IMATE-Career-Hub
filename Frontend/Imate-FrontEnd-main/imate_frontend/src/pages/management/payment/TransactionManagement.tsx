import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Check,
  X,
  HandCoins,
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
} from "lucide-react";
import { toast } from "react-toastify";

import { AppTabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  getAdminTransactions,
  getReadyForPayoutTransactions,
  getTransactionStatistics,
  processPayoutTransaction,
  rejectTransaction,
  approveTransaction,
} from "@/services/transactionService";
import { formatPrice } from "@/helpers/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminTransactionItem,
  PaginatedTransactionResponse,
  TransactionStatisticsResponse,
} from "@/types/response/transaction.response";

type TransactionTab = "all" | "withdrawal" | "booking";

const tabs = [
  { label: "Tất cả giao dịch", value: "all" },
  { label: "Yêu cầu rút tiền", value: "withdrawal" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
  { value: "Failed", label: "Failed" },
];

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status?: string) => {
  const normalized = (status || "").toLowerCase();

  if (["completed", "success", "approved", "paid"].includes(normalized)) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (["pending", "processing", "inprogress", "waiting"].includes(normalized)) {
    return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
  }

  if (["rejected", "failed", "cancelled", "canceled"].includes(normalized)) {
    return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
  }

  return "bg-slate-500/15 text-slate-300 border border-slate-500/30";
};

export default function TransactionManagement() {
  const [tab, setTab] = useState<TransactionTab>("all");

  const [items, setItems] = useState<AdminTransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  const [statistics, setStatistics] = useState<TransactionStatisticsResponse>({
    totalDeposit: 0,
    totalWithdrawal: 0,
    netProfit: 0,
  });
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    id: number;
    type: "approve" | "reject" | "payout";
  } | null>(null);
  const [responseNote, setResponseNote] = useState("");

  const activeType = useMemo(() => {
    if (tab === "withdrawal") return "Withdrawal";
    if (tab === "booking") return "BookingPayout";
    return undefined;
  }, [tab]);

  const effectiveStatus = useMemo(() => {
    if (tab === "withdrawal") {
      return "Pending";
    }

    return status;
  }, [tab, status]);

  useEffect(() => {
    const fetchStatistics = async () => {
      const response = await getTransactionStatistics();
      if (response) {
        setStatistics(response);
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          type: activeType,
          status: effectiveStatus,
          pageNumber: page,
          pageSize,
          searchTerm,
        };

        let response: PaginatedTransactionResponse | null = null;
        if (tab === "booking") {
          response = await getReadyForPayoutTransactions(params);
        } else {
          response = await getAdminTransactions(params);
        }

        if (!response) {
          setError("Không thể tải danh sách giao dịch.");
          setItems([]);
          setTotalPages(1);
          setTotalCount(0);
          return;
        }

        setItems(response.items || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      } catch (fetchError) {
        console.error("Lỗi tải giao dịch:", fetchError);
        setError("Không thể tải danh sách giao dịch.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [tab, activeType, effectiveStatus, page, pageSize, searchTerm]);

  const handleTabChange = (value: string) => {
    setTab(value as TransactionTab);
    setPage(1);
    setStatus("all");
    setSearchTerm("");
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleAction = (transactionId: number, action: "approve" | "reject" | "payout") => {
    setCurrentAction({ id: transactionId, type: action });
    setResponseNote("");
    setResponseDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!currentAction) return;

    const { id: transactionId, type: action } = currentAction;
    const note = responseNote;

    setActionLoadingId(transactionId);
    setResponseDialogOpen(false);

    try {
      if (action === "approve") {
        await approveTransaction(transactionId, { responseNote: note });
        toast.success("Đã duyệt yêu cầu rút tiền.");
      } else if (action === "reject") {
        await rejectTransaction(transactionId, { responseNote: note });
        toast.success("Đã từ chối yêu cầu rút tiền.");
      } else {
        await processPayoutTransaction(transactionId, { responseNote: note });
        toast.success("Đã xử lý payout giao dịch booking.");
      }

      setItems((prev) => prev.filter((item) => item.transactionId !== transactionId));
      setTotalCount((prev) => Math.max(0, prev - 1));

      const latestStats = await getTransactionStatistics();
      if (latestStats) {
        setStatistics(latestStats);
      }
    } catch (error: any) {
      const message = error?.message || "Xử lý giao dịch thất bại.";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
      setCurrentAction(null);
    }
  };

  const tableTitle =
    tab === "all"
      ? "Danh sách tất cả giao dịch"
      : tab === "withdrawal"
        ? "Danh sách yêu cầu rút tiền"
        : "Danh sách giao dịch booking cần xử lý";

  const searchPlaceholder =
    tab === "all"
      ? "Tìm theo mã giao dịch, external code, tài khoản..."
      : tab === "withdrawal"
        ? "Tìm theo mã giao dịch hoặc người rút tiền..."
        : "Tìm theo booking, tài khoản hoặc external code...";

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Quản lý giao dịch</h1>
          <p className="text-slate-400">
            Theo dõi và xử lý giao dịch hệ thống: thanh toán, rút tiền và giao dịch booking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-300">Tổng nạp</p>
            <ArrowDownCircle className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatPrice(statistics.totalDeposit)}</p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-300">Tổng rút</p>
            <ArrowUpCircle className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatPrice(statistics.totalWithdrawal)}</p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-indigo-300">Lợi nhuận ròng</p>
            <Landmark className="w-5 h-5 text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatPrice(statistics.netProfit)}</p>
        </div>
      </div>

      <AppTabs tabs={tabs} value={tab} onChange={handleTabChange} />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-white">{tableTitle}</h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
            <div className="relative min-w-70">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
              <select
                value={effectiveStatus}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                disabled={tab === "withdrawal"}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-w-45"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Chưa có giao dịch nào</div>
        ) : (
          <Table
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            maxHeight="58vh"
          >
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Mã GD</TableHead>
                <TableHead>Ngày giao dịch</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Loại GD</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thông tin</TableHead>
                <TableHead className="w-35 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((tx, index) => (
                <TableRow key={tx.transactionId}>
                  <TableCell>{String((page - 1) * pageSize + index + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="font-medium">#{tx.transactionId}</TableCell>
                  <TableCell>{formatDateTime(tx.date)}</TableCell>
                  <TableCell>{formatPrice(tx.amount || 0)}</TableCell>
                  <TableCell>{tx.transactionType || "-"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getStatusClass(tx.status)}`}>
                      {tx.status || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs text-slate-300">
                      {tx.externalCode && <p>External: {tx.externalCode}</p>}
                      {tx.bookingId && <p>Booking: #{tx.bookingId}</p>}
                      {tx.sourceAccountName && <p>Nguồn: {tx.sourceAccountName}</p>}
                      {tx.targetAccountName && <p>Đích: {tx.targetAccountName}</p>}
                      {tx.withdrawalDetail?.bankAccountNumber && (
                        <p>
                          Bank: {tx.withdrawalDetail.bankCode} - {tx.withdrawalDetail.bankAccountNumber}
                        </p>
                      )}
                      {tx.reason && <p>Lý do: {tx.reason}</p>}
                      {tx.escrowDeadline && <p>Escrow: {formatDateTime(tx.escrowDeadline)}</p>}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {tab === "withdrawal" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="primary"
                                icon={<Check size={14} />}
                                disabled={actionLoadingId === tx.transactionId}
                                onClick={() => handleAction(tx.transactionId, "approve")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Duyệt yêu cầu</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={<X size={14} />}
                                disabled={actionLoadingId === tx.transactionId}
                                onClick={() => handleAction(tx.transactionId, "reject")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Từ chối yêu cầu</TooltipContent>
                          </Tooltip>
                        </>
                      )}

                      {tab === "booking" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<HandCoins size={14} />}
                              disabled={actionLoadingId === tx.transactionId}
                              onClick={() => handleAction(tx.transactionId, "payout")}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Chi trả booking</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>
              {currentAction?.type === "approve"
                ? "Duyệt yêu cầu"
                : currentAction?.type === "reject"
                  ? "Từ chối yêu cầu"
                  : "Chi trả booking"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Bạn có thể nhập ghi chú phản hồi cho giao dịch này (không bắt buộc).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập ghi chú..."
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-primary"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResponseDialogOpen(false)} className="text-slate-400 hover:text-white">
              Hủy
            </Button>
            <Button variant="primary" onClick={confirmAction}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
