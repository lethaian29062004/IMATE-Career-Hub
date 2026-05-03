export interface WalletSummaryResponse {
  currentBalance: number;
  lastUpdated: string; // ISO date string
  totalDeposit: number;
  totalWithdrawal: number;
  // Thông tin cho Mentor
  maxBookingsCanReceive?: number | null; // Số lượt booking có thể nhận với số dư hiện tại
  pricePerSession?: number | null; // Giá 1 session của mentor
  currentEscrowBookings?: number | null; // Số booking đang escrow
  requiredBalanceForOneBooking?: number | null; // Số tiền đảm bảo cần cho 1 booking
  guaranteeDepositRate?: number | null; // Tỷ lệ tiền đảm bảo (%)
}

export interface WithdrawalDetail {
  bankCode: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
}

// Khớp với TransactionDto từ backend
export interface Transaction {
  transactionId: number;
  date: string; 
  amount: number;
  transactionType: string; 
  status: "Success" | "Pending" | "Failed" | "Escrowed"; 
  externalCode: string | null;
  reason: string | null;
  withdrawalDetail: WithdrawalDetail | null;
  sourceAccountName?: string | null;
  targetAccountName?: string | null;
  bookingId?: number | null;
  escrowDeadline?: string | null;
  commissionRateApplied?: number | null;
  hasPendingMentorReport?: boolean | null;
  // Lợi nhuận cho từng giao dịch payout của mentor (Fee - Payout)
  profit?: number | null;
}

// Khớp với DepositResponseDto (BE)
export interface DepositResponse {
  transactionId: number;
  checkoutUrl: string;
  orderCode: string;
}


