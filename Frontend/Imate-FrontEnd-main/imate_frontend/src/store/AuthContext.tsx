import { auth } from "@/lib/firebaseConfig";
import apiClient from "@/services/apiClient";
import { registerWithGoogle, verifyTokenAndLogin } from "@/services/authService";
import type { AuthContextType, AuthResponse, LoginEmailData, User, UserRole } from "@/types/common/auth";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAndSetUser = async () => {
    try {
      const response = await apiClient.get<User>("/profile");
      const freshUserData = response.data;
      // Normalize avatar: map avatarUrl to avatar for consistency
      if (freshUserData.avatarUrl && !freshUserData.avatar) {
        freshUserData.avatar = freshUserData.avatarUrl;
      }
      localStorage.setItem("user", JSON.stringify(freshUserData));
      setUser(freshUserData);
      console.log("User data fetched and set.");
      return freshUserData;
    } catch (e) {
      console.error("Token is invalid, logging out.");
      logout();
      throw e;
    }
  };
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (token) {
        await fetchAndSetUser();
      }
      setIsLoading(false);
    };
    checkUserStatus();
  }, []);

  const handleLoginSuccess = async (response: AuthResponse): Promise<User> => {
    // Lưu token trước
    localStorage.setItem("authToken", response.token);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    
    // Lưu isNewAccount từ response trước khi fetch (vì API /profile không trả về field này)
    const isNewAccount = response.user?.isNewAccount;
    
    // Fetch user mới nhất từ database để đảm bảo role và accountStatus đúng
    // API /profile sẽ query từ database, không phụ thuộc vào JWT token role
    try {
      const freshUser = await fetchAndSetUser();
      // Merge isNewAccount từ response vào freshUser (vì API /profile không trả về field này)
      if (isNewAccount !== undefined && freshUser) {
        freshUser.isNewAccount = isNewAccount;
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
        // Đợi state update hoàn thành
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      setError(null);
      // Đảm bảo user đã được set trước khi return
      return freshUser || JSON.parse(localStorage.getItem("user") || "{}");
    } catch (error) {
      // Nếu fetch thất bại, fallback về user từ response (nhưng vẫn lưu token)
      console.warn("Failed to fetch fresh user data, using response data:", error);
      const normalizedUser = { ...response.user };
      if (normalizedUser.avatarUrl && !normalizedUser.avatar) {
        normalizedUser.avatar = normalizedUser.avatarUrl;
      }
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      // Đợi state update hoàn thành
      await new Promise((resolve) => setTimeout(resolve, 0));
      setError(null);
      return normalizedUser;
    }
  };

  const handleLoginError = (err: any): string => {
    const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    setError(errorMessage);
    return errorMessage; // Trả về message để hàm gọi có thể sử dụng
  };

  const clearError = () => {
    setError(null);
  };

  const login = async (loginData: LoginEmailData): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const response = await verifyTokenAndLogin({ firebaseIdToken }); // Gửi token lên backend
      const user = await handleLoginSuccess(response);
      // Đảm bảo user đã được set trước khi set isLoading false
      // Sử dụng setTimeout để đảm bảo state update đã hoàn thành
      await new Promise((resolve) => setTimeout(resolve, 0));
      setIsLoading(false);
      return user;
    } catch (err: any) {
      if (err.code) {
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          err.message = "Email hoặc mật khẩu không đúng.";
        } else {
          err.message = "Đã xảy ra lỗi trong quá trình xác thực.";
        }
      }

      const errorMessage = handleLoginError(err);
      
      // Nếu là lỗi do email chưa verify, sign out Firebase user để tránh confusion
      const isEmailVerificationError = errorMessage.includes("xác minh") || errorMessage.includes("xác nhận") || errorMessage.includes("verify");
      if (isEmailVerificationError && auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Error signing out Firebase user:", signOutError);
        }
      }
      
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (role?: UserRole): Promise<User> => {
    setIsLoading(true);
    setError(null);

    // MẸO: Tạo một listener để bắt sự kiện người dùng quay lại tab
    // Nếu popup tắt, người dùng sẽ focus lại vào tab chính -> Ta tắt loading luôn
    const checkFocus = () => {
        // Chỉ tắt loading nếu đang loading, giúp nút bấm sáng lại ngay lập tức
        // Mặc kệ Firebase poll ngầm bên dưới, ta ưu tiên UX
        setIsLoading(false); 
        window.removeEventListener('focus', checkFocus);
    };
    window.addEventListener('focus', checkFocus);

    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth as any, provider);
        
        // Nếu đăng nhập thành công thì xóa listener đi để tránh conflict
        window.removeEventListener('focus', checkFocus); 

        // ... logic xử lý thành công (giữ nguyên code cũ)
        if (!result.user) throw new Error("...");
        const idToken = await result.user.getIdToken();
        const response = await registerWithGoogle({ idToken, role });
        const user = await handleLoginSuccess(response);
        // Đảm bảo user đã được set trước khi set isLoading false
        await new Promise((resolve) => setTimeout(resolve, 0));
        setIsLoading(false);
        return user;

    } catch (err: any) {
        window.removeEventListener('focus', checkFocus);
        
        // Code xử lý lỗi cũ của bạn
        setIsLoading(false); // Vẫn giữ dòng này để chắc chắn
        if (
          err.code === "auth/popup-closed-by-user" || 
          err.code === "auth/cancelled-popup-request" || 
          err.message?.includes("closed-by-user") ||
          err.message?.includes("cancelled-popup-request") 
        ) {
          setError(null);
          return Promise.reject(new Error("POPUP_CLOSED"));
        }
        // ...
        throw new Error(handleLoginError(err));
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refetchUser = async () => {
    console.log("Refetching user data...");
    await fetchAndSetUser(); // Chỉ cần gọi lại hàm logic đã tách
  };

  const updateUserBalance = useCallback((newBalance: number) => {
    setUser((prevUser) => {
      if (prevUser) {
        const updatedUser = { ...prevUser, balance: newBalance };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("User balance updated in context:", newBalance);
        return updatedUser;
      }
      return prevUser;
    });
  }, []);

  // Giá trị mà context sẽ cung cấp cho các component con
  // Đảm bảo isLoading là true nếu có token nhưng chưa có user
  const hasToken = !!localStorage.getItem("authToken");
  const effectiveIsLoading = isLoading || (hasToken && !user);
  
  const contextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading: effectiveIsLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    clearError,
    refetchUser,
    updateUserBalance,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ===== TẠO CUSTOM HOOK =====
// Tạo một custom hook để sử dụng AuthContext dễ dàng hơn
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
