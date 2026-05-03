import apiClient from "./apiClient";

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemConfigResponse {
  data: SystemConfig[];
  message: string;
}

export interface UpdateSystemConfigRequest {
  value: string;
}

export const getSystemConfigs = async (): Promise<SystemConfig[]> => {
  const response = await apiClient.get<SystemConfigResponse>("/system-config");
  return response.data.data;
};

export const getSystemConfigByKey = async (key: string, options?: { skipAuthRedirect?: boolean }): Promise<SystemConfig> => {
  const config = options?.skipAuthRedirect ? { _skipAuthRedirect: true } : {};
  // @ts-ignore - axios config type extension
  const response = await apiClient.get<{ data: SystemConfig; message: string }>(`/system-config/${key}`, config);
  return (response.data as { data: SystemConfig }).data;
};

export const updateSystemConfig = async (key: string, value: string): Promise<SystemConfig> => {
  const response = await apiClient.put<{ data: SystemConfig; message: string }>(`/system-config/${key}`, { value });
  return response.data.data;
};
