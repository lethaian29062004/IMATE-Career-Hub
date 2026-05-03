export interface WithdrawalDetail {
  bankCode: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
}

export interface AdminTransactionItem {
  transactionId: number;
  date: string;
  amount: number;
  transactionType: string;
  status: string;
  externalCode?: string;
  reason?: string;
  withdrawalDetail?: WithdrawalDetail | null;
  sourceAccountName?: string;
  targetAccountName?: string;
  bookingId?: number | null;
  escrowDeadline?: string | null;
  commissionRateApplied?: number;
  hasPendingMentorReport?: boolean;
  profit?: number;
}

export interface PaginatedTransactionResponse {
  items: AdminTransactionItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TransactionListParams {
  type?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface TransactionStatisticsResponse {
  totalDeposit: number;
  totalWithdrawal: number;
  netProfit: number;
}
