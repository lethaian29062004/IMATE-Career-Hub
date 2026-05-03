import { useState, useEffect } from "react";
import { Users, Zap, UserPlus, Eye, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getOverviewAccount, getAccountList, updateAccountState } from "@/services/accountService";
import type { OverviewChartAccountResponse, AccountResponse } from "@/types/response/account.response";
import { MSG09, MSG10 } from "@/constants/messages";
import { ACCOUNT_STATUS, ACCOUNT_STATUS_STRING, ROLE_LABELS, ROLE_BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/constants/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import UserAccountDetailModal from "@/pages/dialog/management/account/UserAccountDetailModal";
import CreateStaffModal from "@/pages/dialog/management/account/CreateStaffModal";

// This layout replicates the mockup

export default function UserManagement() {
  const [overview, setOverview] = useState<OverviewChartAccountResponse | null>(null);
  const [users, setUsers] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: AccountResponse | null;
    newChecked: boolean;
  }>({ open: false, user: null, newChecked: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await getOverviewAccount();
      if (data) setOverview(data);
    } catch (error) {
      console.error("Failed to fetch overview", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        PageNumber: page,
        PageSize: 10,
        SearchTerm: searchTerm || undefined,
      };
      const data = await getAccountList(params);
      if (data) {
        let filteredUsers = data.items || [];
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter(u => u.roles?.includes(roleFilter));
        }
        setUsers(filteredUsers);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, page]);

  const handleStatusToggle = (user: AccountResponse, checked: boolean) => {
    setConfirmDialog({ open: true, user, newChecked: checked });
  };

  const handleConfirmStatusChange = async () => {
    const user = confirmDialog.user;
    const newChecked = confirmDialog.newChecked;
    if (!user) return;
    setConfirmDialog({ open: false, user: null, newChecked: false });

    // Backend AccountStatus enum: Active=0, Suspended=1, PendingVerification=2
    // Backend endpoint expects string: "Active" or "Suspended"
    const newStatusStr = newChecked ? ACCOUNT_STATUS_STRING.ACTIVE : ACCOUNT_STATUS_STRING.SUSPENDED;
    const newStatusNum = newChecked ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.SUSPENDED;

    // Save previous state for rollback
    const previousUsers = [...users];
    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, status: newStatusNum } : u
      )
    );
    try {
      await updateAccountState({ 
        id: user.id, 
        status: newStatusStr 
      });
      toast.success(MSG09);
      fetchOverview();
    } catch (error) {
      setUsers(previousUsers);
      toast.error(MSG10);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-slate-400">
            Quản lý tài khoản, trạng thái và vai trò người dùng hệ thống
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateStaffOpen(true)}
          className="gap-2"
        >
          <span className="text-lg leading-none">+</span> Thêm tài khoản nhân viên
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="text-purple-400" size={20} />
            </div>
            {overview?.totalUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.totalUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}> 
                {overview.totalUsers.trend?.isPositive ? "↗" : "↘"} {overview.totalUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Tổng người dùng</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.totalUsers?.value?.toLocaleString() ?? "0"}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 w-[70%]"></div>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Zap className="text-rose-400" size={20} />
            </div>
            {overview?.activeUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.activeUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}> 
                {overview.activeUsers.trend?.isPositive ? "↗" : "↘"} {overview.activeUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Người dùng hoạt động</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.activeUsers?.value?.toLocaleString() ?? "0"}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-rose-500 w-[40%]"></div>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="text-emerald-400" size={20} />
            </div>
            {overview?.newUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.newUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}> 
                {overview.newUsers.trend?.isPositive ? "↗" : "↘"} {overview.newUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Người dùng mới</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.newUsers?.value?.toLocaleString() ?? "0"}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 w-[85%]"></div>
          </div>
        </div>
      </div>

      {/* Toolbar + Table */}
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-white">Danh sách tài khoản</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="relative min-w-[240px]">
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <span className="whitespace-nowrap">Vai trò:</span>
            <div className="relative inline-block">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="all">Tất cả</option>
                <option value="Candidate">Ứng viên</option>
                <option value="Mentor">Mentor</option>
                <option value="Staff">Nhân viên</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div>
          <Table
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={10}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
            maxHeight="55vh"
          >
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>TÊN NGƯỜI DÙNG</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>VAI TRÒ</TableHead>
                <TableHead>NGÀY THAM GIA</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[140px] text-right">HÀNH ĐỘNG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Đang tải danh sách...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Không tìm thấy người dùng
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {String((page - 1) * 10 + index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          <AvatarImage src={user?.avatarUrl} />
                          <AvatarFallback
                            name={user?.fullName}
                          />
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{user.fullName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles?.map(role => (
                          <Badge 
                            key={role} 
                            variant="outline" 
                            className={cn(
                              "font-medium border-none",
                              ROLE_BADGE_COLORS[role] ?? DEFAULT_BADGE_COLOR
                            )}>
                            {ROLE_LABELS[role] ?? role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.status === ACCOUNT_STATUS.ACTIVE} // Active=0 in backend enum
                        onCheckedChange={(c) => handleStatusToggle(user, c)}
                        className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-slate-700" 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserAccountDetailModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedUser(null); }}
      />

      {/* Confirmation Dialog for Status Toggle */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, user: null, newChecked: false });
        }}
      >
        <AlertDialogContent className="bg-[#111827] border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.newChecked ? "Kích hoạt tài khoản" : "Vô hiệu hóa tài khoản"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmDialog.newChecked 
                ? <>Bạn có chắc chắn muốn <span className="text-emerald-400 font-medium">kích hoạt</span> tài khoản <span className="text-white font-medium">"{confirmDialog.user?.fullName}"</span>?</>
                : <>Bạn có chắc chắn muốn <span className="text-rose-400 font-medium">vô hiệu hóa</span> tài khoản <span className="text-white font-medium">"{confirmDialog.user?.fullName}"</span>? Người dùng sẽ không thể đăng nhập.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setConfirmDialog({ open: false, user: null, newChecked: false })}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={cn(
                "font-medium",
                confirmDialog.newChecked 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              )}
            >
              {confirmDialog.newChecked ? "Kích hoạt" : "Vô hiệu hóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Staff Modal */}
      <CreateStaffModal
        open={createStaffOpen}
        onClose={() => setCreateStaffOpen(false)}
        onCreated={() => { fetchUsers(); fetchOverview(); }}
      />
    </div>
  );
}
