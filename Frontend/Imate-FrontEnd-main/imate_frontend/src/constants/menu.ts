import { FolderOpen, CircleUser, CreditCard, FileUser, LogOut, Wallet, History, Calendar, Briefcase, Star, DollarSign } from "lucide-react";
import type { MenuItem } from "@/types/common/menu";

export const MENTOR_MENU_ITEMS: MenuItem[] = [
  { label: "Lịch làm việc", href: "/mentor/interview-schedule" },
  { label: "Quản lý lịch lặp lại", href: "/mentor/manage-slots" },
  { label: "Đánh giá từ ứng viên", href: "/mentor/ratings" },
  { label: "Lịch sử phỏng vấn", href: "/mentor/interview-history" },
];

export const CANDIDATE_MENU_ITEMS: MenuItem[] = [
  {
    label: "Ngân hàng câu hỏi",
    href: "/view-question-bank"
  },
  {
    label: "Luyện tập với AI",
    href: "/practice-with-ai"
  },
  { label: "Mentor", href: "/view-mentor" },
  { label: "Bảng giá", href: "/view-subscription" },
  { label: "Cơ hội việc làm", href: "/view-job-applications" }
];

export const USER_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Ví Imate",
    href: "/wallet",
    icon: Wallet,
  },
  {
    label: "Lịch phỏng vấn",
    href: "/interview-schedule",
    icon: Calendar,
  },
  {
    label: "Lịch sử luyện tập",
    href: "/test-history",
    icon: History,
  },
  {
    label: "Quản lý CV",
    href: "/cv-management",
    icon: FileUser,
  },
  {
    label: "Gửi đơn",
    href: "/view-application",
    icon: FolderOpen,
  },
  {
    label: "Danh sách ứng tuyển",
    href: "/view-applied-job",
    icon: Briefcase,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];

export const MENTOR_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Ví Imate",
    href: "/wallet",
    icon: CreditCard,
  },
  {
    label: "Lịch làm việc",
    href: "/mentor/interview-schedule",
    icon: Calendar,
  },
  {
    label: "Lịch sử phỏng vấn",
    href: "/mentor/interview-history",
    icon: History,
  },
  {
    label: "Quản lý lịch lặp lại",
    href: "/mentor/manage-slots",
    icon: Calendar,
  },
  {
    label: "Quản lý giá",
    href: "/mentor/pricing",
    icon: DollarSign,
  },
  {
    label: "Đánh giá từ ứng viên",
    href: "/mentor/ratings",
    icon: Star,
  },
  {
    label: "Gửi đơn",
    href: "/view-application",
    icon: FolderOpen,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];


export const RECRUITER_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Management",
    href: "/management/recruiter-dashboard/job-applications",
    icon: Briefcase,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];
