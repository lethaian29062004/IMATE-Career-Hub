import {
  FileText,
  Users,
  CreditCard,
  HandCoins,
  Briefcase,
  PlusCircle,
  Layers,
  Logs,
  FileQuestion,
  Settings,
  ClipboardCheck,
} from "lucide-react";

import { ROLES } from "@/constants/role";

import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import UserManagement from "@/pages/admin/UserManagement";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";
import JobPostingList from "@/pages/recruiter/JobPostingList";
import CreateJobApplication from "@/pages/recruiter/CreateJobApplication";
import Classification from "@/pages/management/classification/Classification";
import ViewQuestions from "@/pages/management/question/ViewQuestions";
import AdminAuditLog from "@/pages/admin/AdminAuditLog";
import TransactionManagement from "@/pages/management/payment/TransactionManagement";
import SystemConfigManagement from "@/pages/management/config/SystemConfigManagement";
import RecruiterCompanyProfile from "@/pages/recruiter/RecruiterCompanyProfile";
import StaffApplicationManagement from "@/pages/management/reportApplication/StaffApplicationManagement";

export const managementRoutes = [
  {
    label: "Đơn ứng tuyển",
    icon: FileText,
    path: "applications",
    element: <ReviewMentorApplication />,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
  },
  {
    label: "Quản lý hạng mục",
    icon: Layers,
    path: "classification",
    element: <Classification />,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
  },
  {
    label: "Quản lý người dùng",
    icon: Users,
    path: "users",
    element: <UserManagement />,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "Quản lý câu hỏi",
    icon: FileQuestion,
    path: "view-questions",
    element: <ViewQuestions />,
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    label: "Quản lý gói đăng ký",
    icon: CreditCard,
    path: "subscriptions",
    element: <SubscriptionManagement />,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "Quản lý giao dịch",
    icon: HandCoins,
    path: "transactions",
    element: <TransactionManagement />,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
  },
  {
    label: "Quản lý đơn báo cáo",
    icon: ClipboardCheck,
    path: "manage-report-application",
    element: <StaffApplicationManagement />,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
  },
  {
    label: "Cấu hình hệ thống",
    icon: Settings,
    path: "config",
    element: <SystemConfigManagement />,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "Truy vết hệ thống",
    icon: Logs,
    path: "admin/audit-logs",
    element: <AdminAuditLog />,
    allowedRoles: [ROLES.ADMIN],
  },
];

export const recruiterManagementRoutes = [
  {
    label: "Đơn đăng tuyển",
    icon: Briefcase,
    path: "job-applications",
    element: <JobPostingList />,
    activePaths: ["/job-postings/"]
  },
  {
    label: "Tạo đơn đăng tuyển",
    icon: PlusCircle,
    path: "create-job-posting",
    element: <CreateJobApplication />,
  },
  {
    label: "Hồ sơ công ty",
    icon: Briefcase,
    path: "company-profile",
    element: <RecruiterCompanyProfile />,
  },
];
