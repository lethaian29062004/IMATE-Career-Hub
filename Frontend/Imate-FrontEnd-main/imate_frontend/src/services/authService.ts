import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { AuthResponse, ChangePasswordData, RegisterEmailData, RegisterGoogleData } from "@/types/common/auth";

export const verifyTokenAndLogin = (data: { firebaseIdToken: string }): Promise<AuthResponse> => {
  return apiClient.post(APIConfig.Auth.LoginEmail, data).then((res) => res.data);
};

export const registerWithEmail = (data: RegisterEmailData): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>(APIConfig.Auth.RegisterEmail, data).then((res) => res.data);
};

export const registerWithGoogle = (data: RegisterGoogleData): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>(APIConfig.Auth.RegisterGoogle, data).then((res) => res.data);
};

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response = await apiClient.put(APIConfig.Auth.ChangePassword, data);
    return response.data;
  } catch (error) {
    throw error;  
  }
}

export const updateUserRole = async (role: "Candidate" | "Mentor" | "Recruiter") => {
  return apiClient.put(APIConfig.Auth.UpdateRole, { role });
}

export const generateActionCode = async (email: string, actionType: "VERIFY_EMAIL" | "PASSWORD_RESET") => {
  try {
    const response = await apiClient.post<{ oobCode: string }>(APIConfig.Auth.GenerateActionCode, {
      email,
      actionType,
    });
    return response.data.oobCode;
  } catch (error) {
    throw error;
  }
};

export const sendActionEmail = async (oobCode: string, email: string, actionType: "VERIFY_EMAIL" | "PASSWORD_RESET") => {
  try {
    const response = await apiClient.post(APIConfig.Auth.SendActionEmail, {
      oobCode,
      email,
      actionType,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};