"use client";

import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md";

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-sm",
};

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }

  return trimmed[0]?.toUpperCase() ?? "U";
}

export function Avatar({ name, imageUrl, size = "sm", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700",
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : getInitial(name)}
    </span>
  );
}
