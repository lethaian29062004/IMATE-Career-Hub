export interface UpgradePreview {
  newPackageName: string;
  newPackagePrice: number;
  hasActiveSubscription: boolean;
  oldPackageName?: string;
  remainingValue: number;
  amountToCharge: number;
  isEligible: boolean;
  message: string;
}

export interface CancelPreview {
  packageToCancel: string;
  remainingDays: number;
  refundAmount: number;
}

export interface CurrentPackage {
  packageId: number;
  packageName: string;
  rank: number;
  price: number;
}