import { cn } from "@/lib/utils"

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "draft"
  | "error";

const statusStyles: Record<Status, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  draft: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  error: "bg-red-500/15 text-red-400 border border-red-500/30",
}

type Props = {
  status: Status
  children?: React.ReactNode
}

export function StatusBadge({ status, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {children ?? status}
    </span>
  )
}