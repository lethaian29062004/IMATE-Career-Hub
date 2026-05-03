import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ACCOUNT_STATUS } from "@/constants/accountStatus";

interface StatusGuardProps {
  children: React.ReactNode;
  requiredStatus: string;
  redirectTo?: string;
}

/**
 * StatusGuard component - Protects routes based on user account status
 * Usage: Wrap your protected routes with this component
 * Example: <StatusGuard requiredStatus="Active"><YourComponent /></StatusGuard>
 */
export const StatusGuard: React.FC<StatusGuardProps> = ({ 
  children, 
  requiredStatus,
  redirectTo = "/home"
}) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const userDataString = localStorage.getItem("user");
  
  if (!userDataString) {
    // If no user data, let AuthGuard handle it or redirect to sign-in
    return <Navigate to="/sign-in" replace />;
  }

  try {
    const userData = JSON.parse(userDataString);
    const userStatus = userData.accountStatus || userData.verificationStatus;

    // Check if account is suspended - Global redirect
    if (userStatus === ACCOUNT_STATUS.Suspended) {
      return <Navigate to="/suspended" replace />;
    }

    if (userStatus === requiredStatus) {
      return <>{children}</>;
    }

    // Status doesn't match
    toast.error(`Bạn cần trạng thái ${requiredStatus} để truy cập trang này.`);
    
    // Custom redirect logic for Mentor/Recruiter
    if (userData.role === "Recruiter") {
      if (userData.verificationStatus === "Rejected" || !userData.verificationStatus || !userData.companyName) {
        return <Navigate to="/submit-recruiter-application" replace />;
      }
      return <Navigate to="/recruiter-pending-application" replace />;
    }
    if (userData.role === "Mentor") {
      if (userData.verificationStatus === "Rejected" || !userData.verificationStatus || !userData.phone) {
        return <Navigate to="/submit-mentor-application" replace />;
      }
      return <Navigate to="/pending-application" replace />;
    }

    return <Navigate to={redirectTo} replace />;
  } catch (error) {
    console.error("Error parsing user data in StatusGuard:", error);
    return <Navigate to={redirectTo} replace />;
  }
};
