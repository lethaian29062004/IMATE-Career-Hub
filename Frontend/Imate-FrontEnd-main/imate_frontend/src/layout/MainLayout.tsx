import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import HomePage from "@/pages/main/public/HomePage";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/store/AuthContext";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isRoot = location.pathname === "/";

  // Chặn các role truy cập route không phải của mình trong GuestRouter
  if (user?.role) {
    const candidateOnlyRoutes = ["/practice-with-AI", "/setup-ai-interview", "/parse-job-description"];

    const mentorOnlyRoutes = ["/mentor/interview-schedule", "/mentor/income", "/mentor/interview-history", "/mentor/candidate-ratings", "/mentor/recurring-slots", "/mentor/view-application", "/mentor/my-contributed-questions"];

    const staffOnlyRoutes = ["/staff/manage-question", "/staff/manage-category", "/staff/manage-application", "/staff/manage-report", "/staff/manage-community", "/staff/manage-transaction", "/staff/view-profile"];

    const adminOnlyRoutes: string[] = [];

    // Chặn mentor (kể cả pending) truy cập candidate routes
    if (user.role === "Mentor") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));

      if (isCandidateRoute) {
        if (user.accountStatus === "PendingVerification") {
          const hasMentorProfile = !!(user.bio || user.phone || user.yoe !== undefined || user.pricePerSession !== undefined || user.bankAccountNumber || user.bankCode);

          if (hasMentorProfile && user.verificationStatus !== "Rejected") {
            return <Navigate to="/pending-application" replace />;
          } else {
            return <Navigate to="/submit-mentor-application" replace />;
          }
        } else {
          return <Navigate to="/unauthorized" replace />;
        }
      }

      // Chặn mentor truy cập staff/admin routes
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isStaffRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn candidate truy cập mentor/staff/admin routes
    if (user.role === "Candidate") {
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isMentorRoute || isStaffRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn staff truy cập candidate/mentor/admin routes
    if (user.role === "Staff") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isCandidateRoute || isMentorRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn admin truy cập candidate/mentor routes (nhưng cho phép staff routes)
    if (user.role === "Admin") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isCandidateRoute || isMentorRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
      // Admin có thể truy cập staff routes (không chặn ở đây)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Isolated Header */}
      <Header />

      {/* Pages */}
      {isRoot ? (
        <HomePage />
      ) : (
        <div className={`w-full flex-1`}>
          <Outlet />
        </div>
      )}

      {isRoot ? null : user?.role === "Candidate" ? (
        <Footer />
      ) : user?.role === "Mentor" ? (
        <div className=" flex min-h-full flex-col bg-gray-50">
          <footer className="text-white" style={{ background: "linear-gradient(135deg, #5D5FEF 0%, #4a4cc9 100%)" }}>
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
              <div className="flex items-center justify-center">
                <p className="text-center text-sm text-white/80 md:text-left">© 2025 AI Interview Practice. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <Footer />
      )}
    </div>
  );
};

export default MainLayout;
