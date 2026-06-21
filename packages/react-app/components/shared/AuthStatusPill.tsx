"use client";

import { Avatar } from "@/components/shared/Avatar";
import { PrivyLogoutButton } from "@/components/shared/PrivyLogoutButton";
import { cn } from "@/lib/utils";

type AuthStatusPillProps = {
  userLabel: string;
  userImage?: string | null;
  className?: string;
  actionClassName?: string;
};

export function AuthStatusPill({ userLabel, userImage, className, actionClassName }: AuthStatusPillProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
        className,
      )}
    >
      <Avatar name={userLabel} imageUrl={userImage} size="sm" />
      <span className="max-w-[180px] truncate">Signed in as {userLabel}</span>
      <PrivyLogoutButton className={cn("min-h-8 px-3 py-1 text-xs", actionClassName)} label="Sign out" />
    </div>
  );
}
