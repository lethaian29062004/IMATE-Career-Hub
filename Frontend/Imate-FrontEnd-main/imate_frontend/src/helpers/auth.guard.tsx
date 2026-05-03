import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component - Protects routes that require authentication
 * Usage: Wrap your protected routes with this component
 * Example: <AuthGuard><YourComponent /></AuthGuard>
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const userData = localStorage.getItem("user");

  if (!userData) {
    toast.error('Bạn không có quyền truy cập vào trang này.');
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

/**
 * Custom hook to check if user is authenticated
 * Returns: boolean indicating authentication status
 */
export const useAuthGuard = (): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }

  const userData = localStorage.getItem("user");
  return !!userData;
};