import React, { useEffect, useRef} from "react";
import { Card } from "../ui/card";
import { MENTOR_PROFILE_MENU, RECRUITER_PROFILE_MENU, USER_PROFILE_MENU } from "@/constants/menu";
import { ROLES } from "@/constants/role";
import type { MenuItem } from "@/types/common/menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";

import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserMenuProps {
  isOpenUserMenu: boolean;
  onClose: () => void;
  userRole?: "Candidate" | "Mentor";
  anchorRef?: React.RefObject<HTMLDivElement | null>;
  extraMenuItems?: MenuItem[];
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpenUserMenu, onClose, anchorRef, extraMenuItems }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    logout();
    navigate("/sign-in");
    onClose();
  };

  // Xử lý click bên ngoài menu để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu click vào anchorRef (nút Avatar ở Header) thì không xử lý ở đây
      // vì nút đó đã có logic toggle riêng
      if (anchorRef?.current?.contains(event.target as Node)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpenUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenUserMenu, onClose]);

  useEffect(() => {
    if (!user?.avatarUrl) return;
    const img = new Image();
    img.src = user.avatarUrl;
  }, [user?.avatarUrl]);

  return (
    <AnimatePresence>
      {isOpenUserMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-14 right-0 z-50 origin-top-right"
          ref={menuRef}
        >
          <Card className="w-72 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl max-h-[70vh]">
            {/* User info */}
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <Avatar size="lg">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback
                  name={user?.fullName || "User"}
                />
              </Avatar>

              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white">
                  {user?.fullName}
                </h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            {/* Menu */}
            <div className="flex flex-col py-2 overflow-y-auto">
              {extraMenuItems && extraMenuItems.length > 0 && (
                <div className="border-b border-white/10 px-4 pb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Điều hướng nhanh
                  </p>
                </div>
              )}

              {extraMenuItems?.map((item: MenuItem, index: number) => (
                <Link
                  key={`quick-${index}`}
                  to={item.href || "#"}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5"
                >
                  {item.icon && <item.icon className="h-4 w-4 text-slate-300" />}
                  <span className="text-sm text-slate-200">
                    {item.label}
                  </span>
                </Link>
              ))}

              {extraMenuItems && extraMenuItems.length > 0 && (
                <div className="border-t border-white/10" />
              )}

              {(user?.role === ROLES.MENTOR
                ? MENTOR_PROFILE_MENU
                : user?.role === ROLES.RECRUITER
                  ? RECRUITER_PROFILE_MENU
                  : USER_PROFILE_MENU
              ).map((item: MenuItem, index: number) => {
                const Icon = item.icon;
                const isLogout = item.label === "Đăng xuất";

                return isLogout ? (
                  <button
                    key={index}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    {Icon && <Icon className="h-4 w-4 text-red-400" />}
                    <span className="text-sm text-red-400">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href || "#"}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5"
                  >
                    {Icon && <Icon className="h-4 w-4 text-slate-300" />}
                    <span className="text-sm text-slate-200">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserMenu;
