import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const SKIP_AUTH_REDIRECT_FOR_TEST = true;

// 1. Định nghĩa API_BASE_URL ở đây
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_BASE_URL = "http://localhost:5067"; // Thay thế bằng URL thực tế của backend

// 2. Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Flag để tránh multiple refresh token calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Cấu hình interceptor để tự động đính kèm token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  const isFormData = typeof FormData !== "undefined" && (config.data instanceof FormData || (config.headers && String(config.headers["Content-Type"] || "").startsWith("multipart/form-data")));

  if (!isFormData && !config.headers?.["Content-Type"]) {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _skipAuthRedirect?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest._skipAuthRedirect) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        const errorMessage = error.response?.data?.message || error.response?.data?.Message || "";
        const isEmailVerificationError = errorMessage.includes("xác minh") || errorMessage.includes("xác nhận") || errorMessage.includes("verify");
        const isLoginRequest = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/verify-token");

        if (isEmailVerificationError || isLoginRequest) {
          processQueue(error, null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        processQueue(new Error("Không có refresh token"), null);
        isRefreshing = false;
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (!SKIP_AUTH_REDIRECT_FOR_TEST) {
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken: refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Lưu tokens mới
        localStorage.setItem("authToken", token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Retry original request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Process queue với token mới
        processQueue(null, token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (!SKIP_AUTH_REDIRECT_FOR_TEST) {
          window.location.href = "/sign-in";
        }
        return Promise.reject(refreshError);
      }
    }

    // Các lỗi khác
    let errorMessage = "Có lỗi không xác định xảy ra";
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // Backend có thể trả về string trực tiếp hoặc object
      if (typeof data === "string") {
        // Backend trả về string trực tiếp (ví dụ: BadRequest(ex.Message))
        errorMessage = data.trim();
      } else if (data && typeof data === "object") {
        // Backend trả về object với các property khác nhau
        errorMessage = 
          data.Message ||      // Từ middleware ExceptionHandlingMiddleware
          data.message ||      // Từ controller BadRequest(new { message })
          data.detail ||       // Từ ProblemDetails
          data.Detail ||       // ProblemDetails (PascalCase)
          data.error ||        // Format khác
          data.Error ||        // Case-sensitive
          error.message;       // Fallback về axios message
      }
    } else if (error.message) {
      // Không có response.data, dùng message mặc định của Axios
      errorMessage = error.message;
    }
    
    // Tạo Error mới và giữ lại response để có thể truy cập sau
    const customError: any = new Error(errorMessage);
    customError.response = error.response; // Giữ lại response gốc
    customError.originalError = error; // Giữ lại error gốc để debug
    return Promise.reject(customError);
  }
);

export default apiClient;
