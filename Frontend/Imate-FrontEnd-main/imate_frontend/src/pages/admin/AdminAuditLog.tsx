// 1. REACT & LIBRARIES
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// 2. ICONS
import { Search } from "lucide-react";

// 3. UTILITIES & SERVICES
import { getAuditLogs, getAuditLogFilterOptions } from "@/services/auditLogService";
import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

// 4. UI COMPONENTS
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppTabs } from "@/components/ui/tabs";

// 5. TYPES
import type { PaginatedAuditLogResponse } from "@/types/response/audit-log.response";
// ...existing code...

const DEFAULT_PAGE_SIZE = 10;

const AdminAuditLog: React.FC = () => {
  //==========STATE==========
  // URL & ROUTING STATE
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentTab = (() => {
    const tab = searchParams.get("tab") || "all";
    // Fallback to "all" if tab is "actions" (removed tab)
    return tab === "actions" ? "all" : tab;
  })();

  const [formFilter, setFormFilter] = useState<{
    staffName: string;
    entityType: string;
    search: string;
  }>({
    staffName: searchParams.get("staffName") || "all",
    entityType: searchParams.get("entityType") || "all",
    search: searchParams.get("search") || "",
  });

  // DATA STATE
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [data, setData] = useState<PaginatedAuditLogResponse | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    staffNames: string[];
    actions: string[];
    entityTypes: string[];
  }>({
    staffNames: [],
    actions: [],
    entityTypes: [],
  });

  // DERIVED STATE
  const totalPage = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;

  //==========USE EFFECT==========
  // Sync formFilter with URL params
  useEffect(() => {
    setFormFilter({
      staffName: searchParams.get("staffName") || "all",
      entityType: searchParams.get("entityType") || "all",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoadingData(true);

        // Filter by tab
        let fromDate: string | undefined;
        const now = new Date();

        if (currentTab === "today") {
          // Today's date range
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          fromDate = startOfDay.toISOString();
        }

        const staffName = searchParams.get("staffName");
        const entityType = searchParams.get("entityType");
        const searchTerm = searchParams.get("search");

        const requestParams = {
          pageNumber: currentPage,
          pageSize: pageSize,
          staffName: staffName && staffName !== "all" ? staffName : undefined,
          entityType: entityType && entityType !== "all" ? entityType : undefined,
          searchTerm: searchTerm || undefined,
          fromDate,
          sortBy: "actiontime",
          sortOrder: "desc",
        };

        const response = await getAuditLogs(requestParams);
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.log("List error:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchListData();
  }, [currentPage, currentTab, searchParams, pageSize]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await getAuditLogFilterOptions();
        if (options) {
          setFilterOptions(options);
        }
      } catch (error) {
        console.log("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  // ========== EVENT HANDLES ==========
  // 1. PAGINATION HANDLE
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  // 1b. PAGE SIZE HANDLE
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1"); // Reset to page 1 when page size changes
    setSearchParams(newParams);
  };

  // 2. TAB HANDLE
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    newParams.set("page", "1"); // Reset to page 1 when changing tabs
    setSearchParams(newParams);
  };

  // 3. FILTER HANDLE - Auto apply when dropdown changes
  const handleFilterChange = (filterType: "staffName" | "entityType", value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value === "all") {
      newParams.delete(filterType);
    } else {
      newParams.set(filterType, value);
    }

    newParams.set("page", "1"); // Reset to page 1 when filter changes
    setSearchParams(newParams);

    // Update formFilter state
    setFormFilter((prev) => ({ ...prev, [filterType]: value }));
  };

  // 4. SEARCH HANDLE - Only for search input
  const handleSearchSubmit = () => {
    const newParams = new URLSearchParams(searchParams);
    if (formFilter.search) {
      newParams.set("search", formFilter.search);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === "")
      return <span className="text-slate-500 italic">Không có dữ liệu</span>;

    let parsedValue = value;
    if (typeof value === "string") {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // Not a JSON string
      }
    }

    if (typeof parsedValue === "object") {
      return (
        <div className="max-w-[300px] overflow-hidden">
          <pre className="text-[10px] text-slate-400 font-mono bg-[#050816] p-3 rounded-lg border border-white/5 overflow-x-auto custom-scrollbar max-h-[150px] leading-relaxed">
            {JSON.stringify(parsedValue, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="max-w-[300px] overflow-hidden">
        <span className="text-slate-300 font-mono text-[11px] bg-slate-900/50 px-2 py-1 rounded border border-white/5 break-words">
          {String(value)}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${day}, Th${month}, ${year}\n${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };


  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Truy vết hệ thống</h1>
          <p className="text-slate-400">Theo dõi và quản lý nhật ký hoạt động của nhân viên trên nền tảng IMATE.</p>
        </div>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          { label: "Tất cả", value: "all" },
          { label: "Hôm nay", value: "today" }
        ]}
        value={currentTab}
        onChange={handleTabChange}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-white">Danh sách truy vết</h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="relative min-w-[240px]">
              <Input
                placeholder="Tìm nội dung, ID..."
                value={formFilter.search}
                onChange={(e) => setFormFilter((prev) => ({ ...prev, search: e.target.value }))}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Người dùng:</span>
              <select
                value={formFilter.staffName}
                onChange={(e) => handleFilterChange("staffName", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="all">Tất cả người dùng</option>
                {filterOptions.staffNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 whitespace-nowrap">Loại Entity:</span>
              <select
                value={formFilter.entityType}
                onChange={(e) => handleFilterChange("entityType", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="all">Tất cả loại</option>
                {filterOptions.entityTypes.map((entity) => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleSearchSubmit}
              variant="secondary"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div>
          {loadingData ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-6 pb-4 border-b border-white/5 last:border-0">
                  <div className="h-4 w-8 animate-pulse rounded bg-white/5" />
                  <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-8 w-8 animate-pulse rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#6B6F8E] space-y-4">
              <div className="p-4 rounded-full bg-white/5">
                <Search className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-lg">Không tìm thấy dữ liệu phù hợp</p>
            </div>
          ) : (
            <Table
              page={currentPage}
              totalPages={totalPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={handlePageChange}
              maxHeight="55vh"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Giá trị cũ</TableHead>
                  <TableHead>Giá trị mới</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{String((currentPage - 1) * pageSize + (index + 1)).padStart(2, '0')}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={cn("text-xs font-bold text-white", getAvatarColor(item.staffName))}>
                            {getInitials(item.staffName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{item.staffName}</p>
                          <p className="text-[11px] text-slate-500">{item.staffEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        item.action.toLowerCase().includes("create") || item.action.toLowerCase().includes("thêm")
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : item.action.toLowerCase().includes("update") || item.action.toLowerCase().includes("sửa")
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {item.action}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-300 border border-slate-700">{item.entityType}</span>
                    </TableCell>
                    <TableCell>
                      {renderValue(item.oldValue)}
                    </TableCell>
                    <TableCell>
                      {renderValue(item.newValue)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">{formatDate(item.actionTime).split("\n")[0]}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(item.actionTime).split("\n")[1]}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminAuditLog;
