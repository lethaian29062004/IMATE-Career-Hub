import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string | readonly string[] | string[];
  redirectTo?: string;
}

interface UserData {
  role: string;
  [key: string]: any;
}

/**
 * RoleGuard component - Protects routes based on user roles
 * Usage: Wrap your protected routes with this component
 * Example: <RoleGuard requiredRoles={["Admin", "Staff"]}><YourComponent /></RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRoles,
  redirectTo = "/sign-in"
}) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const userDataString = localStorage.getItem("user");
  
  if (!userDataString) {
    toast.error('Bạn không có quyền truy cập vào trang này.');
    return <Navigate to={redirectTo} replace />;
  }

  try {
    const userData: UserData = JSON.parse(userDataString);
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    console.log("User role:", userData.role);
    console.log("Required roles:", rolesArray);
    
    // Nếu route không yêu cầu quyền cụ thể hoặc user có quyền phù hợp
    if (rolesArray.includes(userData.role)) {
      console.log("Access granted");
      return <>{children}</>;
    }

    // Không đủ quyền
    toast.error('Bạn không có quyền truy cập vào trang này.');
    return <Navigate to={redirectTo} replace />;
  } catch (error) {
    console.error("Error parsing user data:", error);
    toast.error('Lỗi xác thực người dùng.');
    return <Navigate to={redirectTo} replace />;
  }
};

/**
 * Custom hook to check if user has required role(s)
 * @param requiredRoles - Single role or array of roles
 * @returns boolean indicating if user has required role
 */
export const useRoleGuard = (requiredRoles: string | readonly string[] | string[]): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }

  const userDataString = localStorage.getItem("user");
  
  if (!userDataString) {
    return false;
  }

  try {
    const userData: UserData = JSON.parse(userDataString);
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(userData.role);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return false;
  }
};