import type { DepositResponse, Transaction, WalletSummaryResponse } from "@/types/response/wallet.response";
import apiClient from "./apiClient"; // Import apiClient của bạn
import type { PagedResponse } from "@/types/common/pagination";
import type { DepositRequest, WithdrawRequest } from "@/types/request/wallet.request";
// Chúng ta sẽ tạo file này ở bước 2

export interface TransactionPagedResponse {
  items: Transaction[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// 1. API GET /api/wallet/summary
export const getWalletSummary = () => {
  return apiClient.get<WalletSummaryResponse>("/balance");
};

// 2. API GET /api/transactions (Phân trang)
interface GetTransactionsParams {
  pageNumber: number;
  pageSize: number;
  type?: string;     // Thêm
  status?: string;   // Thêm
  searchTerm?: string; // Thêm
}

export const getTransactions = (params: GetTransactionsParams) => {
  return apiClient.get<TransactionPagedResponse>("/transactions", { params });
};

// 3. API POST /api/transactions/deposit
export const createDeposit = (data: DepositRequest) => {
  return apiClient.post<DepositResponse>("/deposit", data);
};

// 4. API POST /api/transactions/withdraw
export const createWithdrawal = (data: WithdrawRequest) => {
  return apiClient.post<Transaction>("/withdraw", data);
};

export const getRecentTransactions = (take: number = 5) => {
  return apiClient.get<Transaction[]>(`/transactions/recent`, {
    params: { take },
  });
};

// 5. API PUT /api/transactions/{transactionId}/cancel
export const cancelTransaction = (transactionId: number) => {
  return apiClient.put(`/transactions/${transactionId}/cancel`);
};

// ========== ADMIN/STAFF ENDPOINTS ==========

// 6. API GET /api/admin/transactions (for admin/staff)
export const getAllTransactionsForAdmin = (params: GetTransactionsParams) => {
  return apiClient.get<PagedResponse<Transaction>>("/admin/transactions", { params });
};

// 7. API PUT /api/admin/transactions/{transactionId}/approve
export const approveWithdrawal = async (transactionId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/approve`, { responseNote });
    return response;
  } catch (error: any) {
    throw error.message;
  }
};

// 8. API PUT /api/admin/transactions/{transactionId}/reject
export const rejectWithdrawal = async (transactionId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/reject`, { responseNote });
    return response;
  } catch (error: any) {
    throw error.message;
  }
};

// 9. API GET /api/admin/transactions/statistics
export interface SystemStatistics {
  totalDeposit: number;
  totalWithdrawal: number;
  netProfit: number;
}

export const getSystemStatistics = () => {
  return apiClient.get<SystemStatistics>("/admin/transactions/statistics");
};

// 10. API GET /api/admin/transactions/ready-for-payout
export const getReadyForPayoutBookings = (params: GetTransactionsParams) => {
  return apiClient.get<PagedResponse<Transaction>>("/admin/transactions/ready-for-payout", { params });
};

// 11. API PUT /api/admin/transactions/{transactionId}/process-payout
export const processBookingPayout = async (transactionId: number, responseNote?: string) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/process-payout`, { responseNote });
    return response;
  } catch (error: any) {
    throw error.message;
  }
};

// const extractTotalCount = <T>(data?: PagedResponse<T> | null): number => {
//   if (!data) return 0;
//   return data.totalItems ?? data.totalItems ?? data.totalCount ?? data.TotalCount ?? data.items?.length ?? 0;
// };

// export const getReadyForPayoutTotalCount = async (): Promise<number> => {
//   try {
//     const res = await getReadyForPayoutBookings({
//       pageNumber: 1,
//       pageSize: 1,
//     });
//     return extractTotalCount(res.data);
//   } catch (error) {
//     console.error("Error fetching ready-for-payout total count:", error);
//     return 0;
//   }
// };

// export const getPendingWithdrawalTotalCount = async (): Promise<number> => {
//   try {
//     const res = await getAllTransactionsForAdmin({
//       pageNumber: 1,
//       pageSize: 1,
//       type: "MoneyWithdrawal",
//       status: "Pending",
//     });
//     return extractTotalCount(res.data);
//   } catch (error) {
//     console.error("Error fetching pending withdrawal total count:", error);
//     return 0;
//   }
// };

// 12. API GET /api/admin/transactions/revenue
export interface RevenueResponse {
  totalRevenue: number;
  totalIncome: number;
  totalDeposit: number;
  breakdown: {
    pointBookingPayout: number;
    pointSubscriptionFee: number;
    pointPenalty: number;
    pointInterviewFee: number;
    pointDeposit: number;
  };
  year: number;
  month?: number;
  transactionType?: string;
}

export interface RevenueQueryParameters {
  year: number;
  month?: number;
  transactionType?: string;
}

export const getRevenue = (params: RevenueQueryParameters) => {
  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
      )
    : undefined;
  console.log("[Revenue] GET /revenue params:", cleaned);
  return apiClient.get<RevenueResponse>("/admin/transactions/revenue", { params: cleaned });
};

// 13. API GET /api/admin/transactions/revenue-transactions
export interface RevenueTransactionQueryParameters {
  year: number;
  month?: number;
  transactionType?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export const getRevenueTransactions = (params: RevenueTransactionQueryParameters) => {
  // Clean up params to remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== "")
  );
  
  console.log("Sending params to API:", cleanParams); // Debug log
  
  return apiClient.get<PagedResponse<Transaction>>("/admin/transactions/revenue-transactions", { params: cleanParams });
};