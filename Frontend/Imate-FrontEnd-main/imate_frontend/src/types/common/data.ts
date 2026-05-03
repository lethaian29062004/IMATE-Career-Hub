export interface BankInfo {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name?: string;
}

export interface TransactionDetail {
  // Thông tin chính
  transactionId: string;
  date: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW";
  status: "SUCCESS" | "PENDING" | "FAILED";

  // Số dư
  balanceBefore: number;
  balanceAfter: number;

  // Phí (nếu có)
  fee?: number;

  // Mô tả
  description: string;
}
