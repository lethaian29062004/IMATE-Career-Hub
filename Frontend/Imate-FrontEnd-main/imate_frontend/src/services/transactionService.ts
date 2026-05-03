import apiClient from "./apiClient";
import type {
  PaginatedTransactionResponse,
  TransactionListParams,
  TransactionStatisticsResponse,
} from "@/types/response/transaction.response";

type TransactionActionPayload = {
  responseNote: string;
};

const buildQuery = (params: TransactionListParams) => {
  const query = new URLSearchParams();

  if (params.type) query.append("Type", params.type);
  if (params.status && params.status !== "all") query.append("Status", params.status);
  if (params.pageNumber !== undefined) query.append("PageNumber", String(params.pageNumber));
  if (params.pageSize !== undefined) query.append("PageSize", String(params.pageSize));
  if (params.searchTerm) query.append("SearchTerm", params.searchTerm);

  return query.toString();
};

export const getAdminTransactions = async (params: TransactionListParams) => {
  try {
    const query = buildQuery(params);
    const url = query ? `/admin/transactions?${query}` : "/admin/transactions";
    const response = await apiClient.get(url);
    return response.data as PaginatedTransactionResponse;
  } catch (error) {
    console.error("error fetch admin transactions:", error);
    return null;
  }
};

export const getReadyForPayoutTransactions = async (params: TransactionListParams) => {
  try {
    const query = buildQuery(params);
    const url = query
      ? `/admin/transactions/ready-for-payout?${query}`
      : "/admin/transactions/ready-for-payout";
    const response = await apiClient.get(url);
    return response.data as PaginatedTransactionResponse;
  } catch (error) {
    console.error("error fetch ready-for-payout transactions:", error);
    return null;
  }
};

export const getTransactionStatistics = async () => {
  try {
    const response = await apiClient.get("/admin/transactions/statistics");
    return response.data as TransactionStatisticsResponse;
  } catch (error) {
    console.error("error fetch transaction statistics:", error);
    return null;
  }
};

export const approveTransaction = async (transactionId: number, payload: TransactionActionPayload) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/approve`, payload);
    return response.data;
  } catch (error) {
    console.error("error approve transaction:", error);
    throw error;
  }
};

export const rejectTransaction = async (transactionId: number, payload: TransactionActionPayload) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/reject`, payload);
    return response.data;
  } catch (error) {
    console.error("error reject transaction:", error);
    throw error;
  }
};

export const processPayoutTransaction = async (transactionId: number, payload: TransactionActionPayload) => {
  try {
    const response = await apiClient.put(`/admin/transactions/${transactionId}/process-payout`, payload);
    return response.data;
  } catch (error) {
    console.error("error process payout transaction:", error);
    throw error;
  }
};
