export interface DepositRequest {
  amount: number;
}

// Khớp với WithdrawRequestDto
export interface WithdrawRequest {
  amount: number;
  bankCode?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
}