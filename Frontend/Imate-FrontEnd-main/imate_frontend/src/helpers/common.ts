export const formatName = (name: string) => {
  // Thêm key - value vào để định nghĩa breadcrumbs
  const mapping: Record<string, string> = {
    "": "Trang chủ",
    "system-question-bank": "Câu hỏi của Imate",
    "view-question-bank": "Ngân hàng câu hỏi",
    "sign-in": "Đăng nhập",
    "sign-up": "Đăng ký",
    "view-subscription": "Gói dịch vụ",
    "save-question": "Câu hỏi đã lưu",
    "my-contributed-questions": "Câu hỏi đã đóng góp",
    "deposit-money": "Nạp tiền",
    "interview-schedule": "Lịch phỏng vấn",
    "candidate-ratings": "Phản hồi từ khách hàng",
    mentor: "Trang chủ",
    candidate: "Trang chủ",
    profile: "Hồ sơ cá nhân",
    transactions: "Quản lý giao dịch",
    "mentor-practice-history": "Lịch sử phỏng vấn",
    wallet: "Ví Imate",
    "cv-management": "Quản Lý CV",
    "practice-with-AI": "Luyện tập phỏng vấn với AI",
    "setup-ai-interview": "Thiết lập phỏng vấn AI",
    "ai-interview": "Phỏng vấn với AI",
    result: "Kết quả phỏng vấn",
    "interview-history": "Lịch sử phỏng vấn",
    "view-application": "Đơn đã gửi",
    income: "Thu nhập",
    "manage-subscription": "Quản lý gói đăng ký",
    contact: "Liên hệ",
  };
  return mapping[name] || name.charAt(0).toUpperCase() + name.slice(1);
};

export const formatPrice = (amount: number | string): string => {
  const num = typeof amount === "number" ? amount : parsePriceToNumber(amount);
  if (isNaN(num)) return "0 VND";
  return `${num.toLocaleString("vi-VN")} VND`;
};

export const parsePriceToNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  let cleaned = String(value)
    .replace(/\s/g, "")
    .replace(/VND|vnd|đ|₫/g, "");

  cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");

  cleaned = cleaned.replace(/[^0-9\.\-]/g, "");

  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hour = date.getHours();

  let period = "tối";
  if (hour >= 5 && hour < 12) period = "sáng";
  else if (hour >= 12 && hour < 18) period = "chiều";

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${time} ${period}`;
};

export const formatTimeUTC = (dateString: string | Date) => {
  const date = new Date(dateString);
  const hours = date.getHours(); // Local hours (JavaScript tự động convert UTC sang local)
  const minutes = String(date.getMinutes()).padStart(2, "0");

  let period = "";
  // Logic xác định buổi (sáng/chiều/tối) dựa trên Giờ Local
  if (hours >= 5 && hours < 12) period = "sáng";
  else if (hours >= 12 && hours < 18) period = "chiều";
  else period = "tối";

  const formattedHours = String(hours).padStart(2, "0");

  return `${formattedHours}:${minutes} ${period}`;
};

export const timeFromNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} năm trước`;
  if (months > 0) return `${months} tháng trước`;
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
};

export const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (seed: string | number): string => {
  const colors = ["bg-pink-400", "bg-purple-400", "bg-teal-400", "bg-blue-400", "bg-red-400", "bg-green-400", "bg-indigo-400", "bg-orange-400", "bg-cyan-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-400"];

  // Convert seed to number if it's a string
  const seedNumber = typeof seed === "string" ? hashStringToNumber(seed) : seed;
  return colors[seedNumber % colors.length];
};

const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};
