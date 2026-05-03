import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { formatName } from "@/helpers/common";
import { useAuth } from "@/store/AuthContext";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return <Comp data-slot="breadcrumb-link" className={cn("hover:text-foreground transition-colors", className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("text-foreground font-normal", className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

function CommonBreadcrumb() {
  const location = useLocation();
  const { user } = useAuth();

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Kiểm tra nếu đang ở trang detail của mentor-practice-history
  const isMentorPracticeDetail = pathnames.includes("mentor-practice-history") && pathnames.length === 3;

  // Kiểm tra nếu đang ở trang kết quả phỏng vấn AI (ai-interview/result/:sessionId)
  const isAIInterviewResult = pathnames.includes("ai-interview") && pathnames.includes("result") && pathnames.length === 3;

  // Nếu có "candidate" và "mentor-practice-history", bỏ "Trang chủ" đầu tiên
  const hasCandidateAndMentorHistory = pathnames.includes("candidate") && pathnames.includes("mentor-practice-history");
  const shouldShowHome = pathnames.length !== 2 && !hasCandidateAndMentorHistory;

  // Xử lý đặc biệt cho setup-ai-interview - thêm parent link đến practice-with-AI
  const isSetupAIInterview = pathnames.length === 1 && pathnames[0] === "setup-ai-interview";

  // Xử lý đặc biệt cho ai-interview/result - thay đổi breadcrumb thành: Trang chủ > Lịch sử phỏng vấn > Phỏng vấn với PEPPO
  const isAIInterviewResultPage = isAIInterviewResult;

  // Format name với xử lý đặc biệt cho bookingId và sessionId
  const formatBreadcrumbName = (value: string, index: number) => {
    // Nếu là số và nằm sau "mentor-practice-history", thay bằng "Chi tiết buổi phỏng vấn"
    if (isMentorPracticeDetail && index === pathnames.length - 1 && /^\d+$/.test(value)) {
      return "Chi tiết buổi phỏng vấn";
    }
    // Nếu là số và nằm sau "result" trong ai-interview, không hiển thị (sẽ dùng custom breadcrumb)
    if (isAIInterviewResult && index === pathnames.length - 1 && /^\d+$/.test(value)) {
      return "";
    }
    return formatName(value);
  };

  // Filter out "candidate" nếu có "mentor-practice-history" để tránh hiển thị "Trang chủ" 2 lần
  const displayPathnames = hasCandidateAndMentorHistory ? pathnames.filter((p) => p !== "candidate") : pathnames;

  return (
    <Breadcrumb className="mb-6 flex w-full items-center gap-3">
      <BreadcrumbList>
        {shouldShowHome && (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={user?.role === "Candidate" ? "/candidate-dashboard" : "/"} className="text-[#5D5FEF] hover:underline">
                Trang chủ
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {/* Thêm parent link cho setup-ai-interview */}
        {isSetupAIInterview && (
          <>
            {(shouldShowHome || displayPathnames.length > 0) && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/practice-with-AI" className="text-[#5D5FEF] hover:underline">
                  {formatName("practice-with-AI")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {/* Xử lý đặc biệt cho ai-interview/result - hiển thị: Trang chủ > Lịch sử phỏng vấn > Phỏng vấn với PEPPO */}
        {isAIInterviewResultPage && (
          <>
            {shouldShowHome && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/mentor-practice-history" className="text-[#5D5FEF] hover:underline">
                  Lịch sử phỏng vấn
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-gray-700">Phỏng vấn với PEPPO</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
        {/* Chỉ hiển thị pathnames thông thường nếu không phải ai-interview/result */}
        {!isAIInterviewResultPage && displayPathnames.map((value, index) => {
          // Tìm index thực tế trong pathnames gốc để build route đúng
          const actualIndex = pathnames.indexOf(value);
          const routeTo = `/${pathnames.slice(0, actualIndex + 1).join("/")}`;
          const isLast = index === displayPathnames.length - 1;
          // Nếu đã có parent link cho setup-ai-interview, cần separator trước item đầu tiên
          // Nếu không có, separator theo logic thông thường
          const shouldShowSeparator = isSetupAIInterview
            ? true // Luôn có separator trước mỗi item khi có parent link
            : shouldShowHome || index > 0;
          const displayName = formatBreadcrumbName(value, actualIndex);

          // Bỏ qua nếu displayName rỗng
          if (!displayName) return null;

          return (
            <React.Fragment key={index}>
              {shouldShowSeparator && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage className="font-medium text-gray-700">{displayName}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink asChild>
                    <Link to={routeTo} className="text-[#5D5FEF] hover:underline">
                      {displayName}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis, CommonBreadcrumb };
