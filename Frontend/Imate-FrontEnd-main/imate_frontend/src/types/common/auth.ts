export type UserRole = "Candidate" | "Mentor" | "Recruiter";

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  avatarUrl?: string; // Thêm field này vì API trả về avatarUrl
  subscription: string;
  balance?: number;
  role: "Mentor" | "Candidate" | "Recruiter" | string;
  isNewAccount?: boolean; // Flag để biết đây có phải là account mới không
  accountStatus?: "Active" | "PendingVerification" | "Suspended"; // Trạng thái tài khoản
  verificationStatus?: "Pending" | "Approved" | "Rejected"; // Trạng thái phê duyệt (nếu có form)
  // Thông tin cơ bản
  bio?: string;
  phone?: string;
  birthDate?: string;
  // Thông tin Mentor
  yoe?: number;
  cvUrl?: string;
  certificateUrl?: string;
  pricePerSession?: number;
  avgRatings?: number | null;
  totalRatingCount?: number | null;
  // Thông tin ngân hàng
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  // Danh sách kỹ năng và vị trí
  skills?: string[];
  positions?: string[];
  companies?: string[];

//Thông tin Recruiter
  companyName?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  address?: string;
}

export interface RegisterEmailData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

// Dữ liệu gửi đi cho đăng ký Google
export interface RegisterGoogleData {
  idToken: string;
  role?: UserRole;
}

// Dữ liệu nhận về từ Backend
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface LoginEmailData {
  email: string;
  password: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null; // MỚI: Thêm state cho lỗi
  login: (loginData: LoginEmailData) => Promise<User>; // THAY ĐỔI: Nhận object và trả về User
  loginWithGoogle: (role?: UserRole) => Promise<User>; // THAY ĐỔI: Nhận tham số role, trả về User
  logout: () => void;
  clearError: () => void; // MỚI: Hàm để xóa lỗi
  refetchUser: () => Promise<void>;
  updateUserBalance: (newBalance: number) => void;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  firebaseIdToken: string;
}
