import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg hover:opacity-90",

        secondary:
          "bg-slate-800 border border-slate-700 text-slate-200 hover:border-neon-blue hover:text-white hover:bg-slate-700",

        danger:
          "bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400",

        ghost:
          "text-slate-300 hover:bg-slate-800 hover:text-white",

        outline:
          "border border-slate-600 text-slate-200 hover:border-neon-blue hover:text-white",
        
        default: "bg-primary text-primary-foreground hover:bg-primary/90",

      },

      size: {
        sm: "text-xs px-2.5 py-1.5",
        md: "text-sm px-3.5 py-2",
        lg: "text-base px-5 py-2.5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
}

export function Button({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  )
}