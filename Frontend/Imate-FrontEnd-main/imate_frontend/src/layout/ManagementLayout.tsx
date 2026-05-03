import { NavLink, Outlet, useNavigate, Navigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { managementRoutes, recruiterManagementRoutes } from "@/config/managementRoutes";
import { useAuth } from "@/store/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ManagementLayout() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Màn hình tải nếu Auth vẫn đang check token
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0f1c] text-white">Loading...</div>;
  }

  // Nếu không có user, navigate về sign-in thay vì return null (tránh black screen)
  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Chỉ cho Admin, Staff và Recruiter truy cập management dashboard
  if (!["Admin", "Staff", "Recruiter"].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Lọc sidebar chỉ hiện route phù hợp với role
  const visibleRoutes = managementRoutes.filter(
    (route: any) => route.allowedRoles.includes(user.role!)
  );

  const sidebarUser = {
    name: user.fullName || "User",
    email: user.email || "",
    avatar:
      user.avatarUrl ||
      "https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg",
    role: user.role || "Role",
  };
  console.log("role:", user?.role);
  const basePath = user?.role === "Recruiter"
    ? "recruiter-dashboard"
    : "/management";

  const routes =
    user?.role === "Recruiter" ? recruiterManagementRoutes : visibleRoutes;

  const handleLogout = () => {
    logout();
    navigate("/Trang-chu");
  };

  return (
    <div className="flex h-screen bg-slate-950">

      {/* Sidebar */}
      <aside className="w-72 flex flex-col justify-between bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-slate-800">

        {/* Top */}
        <div>

          {/* Logo */}
          <div className="px-8 py-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              I
            </div>

            <span className="text-xl font-bold text-white">
              IMATE
            </span>

            <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/30 font-semibold">
              {sidebarUser.role}
            </span>
          </div>

          {/* Menu */}
          <nav className="mt-6 flex flex-col">

            {routes.map((item: any) => {
              const Icon = item.icon;
              const toPath = `${basePath}/${item.path}`;

              // Custom active logic for routes that define activePaths (e.g., detail pages)
              const isCustomActive = item.activePaths && item.activePaths.some((path: string) => location.pathname.includes(path));

              return (
                <NavLink
                  key={item.path}
                  to={toPath}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all
                      ${isActive || isCustomActive
                      ? "text-white bg-gradient-to-l from-indigo-500/20 to-transparent border-r-4 border-indigo-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}

          </nav>
        </div>

        {/* User */}
        <div className="border-t border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-4">
            <Avatar size="lg">
                <AvatarImage src={sidebarUser?.avatar || ""} />
                <AvatarFallback
                  name={sidebarUser?.name || "User"}
                />
            </Avatar>

            <div>
              <p className="text-sm text-white font-semibold">
                {sidebarUser.name}
              </p>

              <p className="text-xs text-slate-400">
                {sidebarUser.email}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="danger"
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>

        </div>

      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-2 bg-[radial-gradient(circle_at_top_right,#151336,#020617)]">
        <Outlet />
      </main>

    </div>
  );
}