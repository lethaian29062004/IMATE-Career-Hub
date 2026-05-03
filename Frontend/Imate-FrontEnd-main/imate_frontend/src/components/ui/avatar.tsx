import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

// ================= Avatar Root =================
function Avatar({
  className,
  size = "md",
  rounded = "full",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "md" | "lg" | "none";
}) {
  const sizeClass = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  }[size];

  const roundedClass = {
    full: "rounded-full",
    md: "rounded-md",
    lg: "rounded-lg",
    none: "rounded-none",
  }[rounded];

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        sizeClass,
        roundedClass,
        className
      )}
      {...props}
    />
  );
}

// ================= Avatar Image =================
function AvatarImage({
  className,
  src,
  onLoadingStatusChange,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover transition-opacity duration-200",
        className
      )}
      src={src}
      onLoadingStatusChange={onLoadingStatusChange}
      {...props}
    />
  );
}

// ================= Utils =================
function getInitials(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}
function getAvatarColor(name: string) {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
// ================= Avatar Fallback =================
function AvatarFallback({
  className,
  name,
  delayMs = 300,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  name?: string;
  delayMs?: number;
}) {
  const finalName = name || "User";
  const content = children ?? getInitials(finalName);
  const bgColor = getAvatarColor(finalName);

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      delayMs={delayMs}
      className={cn(
        "flex size-full items-center justify-center text-white font-semibold",
        bgColor,
        className
      )}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback }