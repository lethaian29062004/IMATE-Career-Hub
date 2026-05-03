import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"

interface TableProps extends React.ComponentProps<"table"> {
  page?: number
  totalPages?: number
  pageSize?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  maxHeight?: number | string
}

function Table({
  className,
  page = 1,
  totalPages = 1,
  pageSize = 10,
  totalCount,
  onPageChange,
  onPageSizeChange,
  maxHeight = 500,
  children,
  ...props
}: TableProps) {

  const hasPagination = onPageChange !== undefined

  const start =
    totalCount === 0 ? 0 : (page - 1) * pageSize + 1

  const end = Math.min(
    page * pageSize,
    totalCount ?? page * pageSize
  )

  // pagination window
  const visiblePages = React.useMemo(() => {
    const pages = []

    let startPage = Math.max(1, page - 2)
    let endPage = Math.min(totalPages, page + 2)

    if (page <= 3) endPage = Math.min(5, totalPages)
    if (page >= totalPages - 2)
      startPage = Math.max(1, totalPages - 4)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }, [page, totalPages])

  return (
    <div className="w-full rounded-lg border border-slate-700 overflow-hidden">

      {/* table scroll area */}
      <div
        className="w-full overflow-auto"
        style={{ maxHeight }}
      >
        <table
          className={cn(
            "w-full text-sm border-collapse",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>

      {/* pagination */}
      {hasPagination && (
        <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800/40 px-4 py-3">

          {/* result info */}
          <div className="text-sm text-slate-400">

            {totalCount !== undefined && (

              totalCount === 0
                ? (
                  <span>Không có kết quả</span>
                )
                : (
                  <>
                    Hiển thị{" "}
                    <span className="font-semibold text-slate-200">
                      {start}
                    </span>
                    {" - "}
                    <span className="font-semibold text-slate-200">
                      {end}
                    </span>
                    {" của "}
                    <span className="font-semibold text-slate-200">
                      {totalCount}
                    </span>{" "}
                    kết quả
                  </>
                )

            )}

          </div>

          <div className="flex items-center gap-3 ml-auto">

            {/* page size */}
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value))
                }
                className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-2 py-1 text-slate-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            )}

            <div className="flex items-center gap-2 ml-auto">

              {/* first */}
              <Button
                size="sm"
                variant="ghost"
                disabled={page === 1}
                onClick={() => onPageChange?.(1)}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* prev */}
              <Button
                size="sm"
                variant="ghost"
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* page numbers */}
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-md px-1 py-1">

                {visiblePages.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "primary" : "ghost"}
                    className="h-6 min-w-6 px-2 rounded-sm cursor-pointer"
                    onClick={() => onPageChange?.(p)}
                  >
                    {p}
                  </Button>
                ))}

              </div>

              {/* next */}
              <Button
                size="sm"
                variant="ghost"
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* last */}
              <Button
                size="sm"
                variant="ghost"
                disabled={page === totalPages}
                onClick={() => onPageChange?.(totalPages)}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "sticky top-0 z-20 bg-slate-900 [&_tr]:border-b border-slate-700",
        className
      )}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn(
        "divide-y divide-slate-700",
        className
      )}
      {...props}
    />
  )
}

function TableToolbar({
  title,
  right,
}: {
  title?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/40">

      <div className="text-lg font-semibold text-white">
        {title}
      </div>

      <div className="flex items-center gap-3">
        {right}
      </div>

    </div>
  )
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-800/40 transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-slate-200",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableToolbar
}