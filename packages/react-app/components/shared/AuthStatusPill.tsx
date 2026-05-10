"use client";

import { cn } from "@/lib/utils";
import { GoogleSignOutButton } from "@/components/shared/GoogleSignOutButton";

type AuthStatusPillProps = {
  userLabel: string;
  className?: string;
  actionClassName?: string;
};

export function AuthStatusPill({ userLabel, className, actionClassName }: AuthStatusPillProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
        className,
      )}
    >
      <span className="max-w-[180px] truncate">Signed in as {userLabel}</span>
      <GoogleSignOutButton className={cn("min-h-8 px-3 py-1 text-xs", actionClassName)} label="Sign out" />
    </div>
  );
}
