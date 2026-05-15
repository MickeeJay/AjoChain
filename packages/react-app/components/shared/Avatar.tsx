"use client";

import Image from "next/image";
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

const sizePixels: Record<AvatarSize, number> = {
  sm: 24,
  md: 32,
};

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }

  return trimmed[0]?.toUpperCase() ?? "U";
}

export function Avatar({ name, imageUrl, size = "sm", className }: AvatarProps) {
  const pixelSize = sizePixels[size];

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} width={pixelSize} height={pixelSize} className="h-full w-full object-cover" />
      ) : (
        getInitial(name)
      )}
    </span>
  );
}
