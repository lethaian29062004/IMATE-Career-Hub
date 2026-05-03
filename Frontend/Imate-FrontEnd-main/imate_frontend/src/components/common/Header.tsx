import {
  Menu,
  X,
  ChevronDown,
  Wallet,
  Bell,
  CheckCheck,
  Circle
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { Button } from "@/components/ui/button";
import { CANDIDATE_MENU_ITEMS, MENTOR_MENU_ITEMS } from "@/constants/menu";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/custom/UserMenu";
import type { MenuItem } from '@/types/common/menu';
import { ROLES } from '@/constants/role';
import { useSignalR } from '@/store/SignalRContext';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type HeaderNotification = {
  id: number;
  isRead: boolean;
  link?: string;
  message?: string;
  createdAt?: string;
};

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return "Vừa xong";
  }

  const createdDate = new Date(value);
  if (Number.isNaN(createdDate.getTime())) {
    return "Vừa xong";
  }

  const seconds = Math.floor((Date.now() - createdDate.getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

function Header() {
  const { user, isAuthenticated } = useAuth();
  const signalRContext = useSignalR() as {
    notifications?: HeaderNotification[];
    unreadCount?: number;
    markNotificationAsRead?: (notificationId: number) => Promise<void>;
    markAllNotificationsAsRead?: () => Promise<void>;
  };
  const notifications = signalRContext.notifications ?? [];
  const unreadCount = signalRContext.unreadCount ?? notifications.filter((notification) => !notification.isRead).length;
  const markNotificationAsRead = signalRContext.markNotificationAsRead ?? (async () => { });
  const markAllNotificationsAsRead = signalRContext.markAllNotificationsAsRead ?? (async () => { });
  const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const [isOpenNotificationMenu, setIsOpenNotificationMenu] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<number | null>(null);
  const [isCompactNav, setIsCompactNav] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const notificationAnchorRef = useRef<HTMLButtonElement>(null);

  // menu cho guest
  const guestMenu = [
    { label: "Ngân hàng câu hỏi", href: "/view-question-bank" },
    { label: "Luyện tập AI", href: "/practice-with-ai" },
    { label: "Mentor", href: "/view-mentor" },
    { label: "Bảng giá", href: "/view-subscription" },
  ];

  let menuItems: MenuItem[] = guestMenu;

  if (isAuthenticated) {
    if (user?.role === ROLES.MENTOR) {
      menuItems = MENTOR_MENU_ITEMS;
    } else if (user?.role === ROLES.CANDIDATE) {
      menuItems = CANDIDATE_MENU_ITEMS;
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1279px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompactNav(event.matches);
    };

    setIsCompactNav(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationAnchorRef.current?.contains(event.target as Node)) {
        return;
      }

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setIsOpenNotificationMenu(false);
      }
    };

    if (isOpenNotificationMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenNotificationMenu]);

  const toggleNotificationMenu = () => {
    setIsOpenNotificationMenu((prev) => !prev);
    setShowAllNotifications(false);
    setExpandedNotificationId(null);
  };

  const handleNotificationClick = async (notification: HeaderNotification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    setExpandedNotificationId((prev) => (prev === notification.id ? null : notification.id));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const displayedNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 3);

  return (
    <header className="glass-header sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/60 border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              I
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              IMATE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {menuItems.map((item: MenuItem, index) => (
              <NavLink
                key={index}
                to={item.href || "#"}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-semibold transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-300 hover:text-white"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3" href="/sign-in">
                Đăng nhập
              </a>
              <a className="text-sm font-bold text-[#020617] bg-white hover:bg-slate-100 px-5 py-2.5 rounded-full transition-all" href="/sign-up">
                Đăng ký
              </a>
              <Link className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" to="/sign-up?role=Mentor">
                Trở thành Mentor
              </Link>
              <Link className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" to="/sign-up?role=Recruiter">
                Liên kết với chúng tôi
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">

              <div className="relative">
                <button
                  ref={notificationAnchorRef}
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 text-slate-200 transition hover:bg-slate-700/80"
                  onClick={toggleNotificationMenu}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-none font-semibold flex items-center justify-center ring-2 ring-slate-900">
                      {unreadBadgeLabel}
                    </span>
                  )}
                </button>

                {isOpenNotificationMenu && (
                  <div
                    ref={notificationMenuRef}
                    className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <h3 className="text-lg font-bold text-white">Thông báo</h3>
                      <button
                        type="button"
                        className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200 disabled:cursor-not-allowed disabled:text-slate-500"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>

                    <div className={cn("divide-y divide-white/5", showAllNotifications && "max-h-80 overflow-y-auto")}>
                      {displayedNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">
                          Hiện chưa có thông báo nào.
                        </div>
                      ) : (
                        displayedNotifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5",
                              notification.isRead ? "opacity-60" : "opacity-100"
                            )}
                          >
                            <div className="pt-1">
                              <Circle
                                className={cn(
                                  "h-3 w-3",
                                  notification.isRead ? "text-slate-500" : "fill-emerald-400 text-emerald-400"
                                )}
                              />
                            </div>

                            <div className="flex-1">
                              <p
                                className={cn(
                                  "text-sm text-slate-100 whitespace-pre-wrap transition-all",
                                  expandedNotificationId === notification.id ? "line-clamp-none" : "line-clamp-2"
                                )}
                              >
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                              {notification.link && (
                                <p className="mt-1 text-[11px] text-slate-500">
                                  Thông báo có đính kèm liên kết.
                                </p>
                              )}
                            </div>

                            {!notification.isRead && (
                              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                                Mới
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {!showAllNotifications && notifications.length > 3 && (
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                        onClick={() => setShowAllNotifications(true)}
                      >
                        <CheckCheck className="h-4 w-4" />
                        Xem tất cả thông báo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Wallet */}
              <Button
                variant="outline"
                className="border-white/20 text-white cursor-pointer"
                onClick={() => navigate("/wallet")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {user?.balance ?? 0}
              </Button>

              {/* Avatar */}
              <div className="relative">
                <div
                  ref={userMenuRef}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsOpenUserMenu(!isOpenUserMenu)}
                >
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback name={user?.fullName} />
                  </Avatar>

                  <span className="text-sm text-white">
                    {user?.fullName}
                  </span>

                  <ChevronDown className="w-4 h-4 text-slate-300" />
                </div>

                <UserMenu
                  isOpenUserMenu={isOpenUserMenu}
                  onClose={() => setIsOpenUserMenu(false)}
                  anchorRef={userMenuRef}
                  extraMenuItems={isCompactNav ? menuItems : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export default Header;