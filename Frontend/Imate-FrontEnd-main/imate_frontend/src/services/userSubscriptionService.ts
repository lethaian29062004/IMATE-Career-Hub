import type { 
  UpgradePreview, 
  CancelPreview,
  CurrentPackage 
} from "@/types/response/userSubscription.response";
import apiClient from "./apiClient";

export const createUserSubscription = async (packageId: number) => {
  try {
    const res = await apiClient.post(`/user-subscriptions/${packageId}`);
    return res.data;
  } catch (error: any) {
    console.log("error create user subscription: ", error);
    throw new Error(error.response?.data?.message || "Không thể mua gói.");
  }
};

export const getUpgradePreview = async (
  newPackageId: number
): Promise<UpgradePreview> => {
  try {
    const res = await apiClient.get(`/user-subscriptions/upgrade-preview/${newPackageId}`);
    return res.data;
  } catch (error: any) {
    console.log("error get upgrade preview: ", error);
    throw new Error(error.response?.data?.message || "Không thể xem trước giá.");
  }
};

export const cancelSubscription = async () => {
  try {
    const res = await apiClient.post("/user-subscriptions/cancel");
    return res.data;
  } catch (error: any) {
    console.log("error canceling subscription: ", error);
    throw new Error(error.response?.data?.message || "Không thể hủy gói.");
  }
};

export const getCancelPreview = async (): Promise<CancelPreview> => {
  try {
    const res = await apiClient.get("/user-subscriptions/cancel-preview");
    return res.data;
  } catch (error: any) {
    console.log("error get cancel preview: ", error);
    throw new Error(error.response?.data?.message || "Không thể xem hoàn tiền.");
  }
};

export const getUserSubscriptionHistory = async () => {
  try {
    const res = await apiClient.get(`/user-subscriptions/history`);
    return res.data;
  } catch (error: any) {
    console.log("error fetch subscription history: ", error);
    throw error;
  }
};

export const getCurrentPackage = async (): Promise<CurrentPackage> => {
  try {
    const res = await apiClient.get(`/user-subscriptions/current-package`);
    return res.data;
  } catch (error: any) {
    console.log("error get current package: ", error);
    throw error;
  }
};
