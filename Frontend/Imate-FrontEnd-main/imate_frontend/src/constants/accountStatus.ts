export const ACCOUNT_STATUS = {
    Active: "Active",
    PendingVerification: "PendingVerification",
    Suspended: "Suspended",
} as const;

export type AccountStatus = typeof ACCOUNT_STATUS;
