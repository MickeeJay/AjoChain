"use client";

import { cn } from "@/lib/utils";
import { GoogleSignOutButton } from "@/components/shared/GoogleSignOutButton";

type AuthStatusPillProps = {
  userLabel: string;
  userImage?: string | null;
  className?: string;
  actionClassName?: string;
};

function getInitial(userLabel: string) {
  const trimmed = userLabel.trim();
  if (!trimmed) {
    return "U";
  }

  return trimmed[0]?.toUpperCase() ?? "U";
}

export function AuthStatusPill({ userLabel, userImage, className, actionClassName }: AuthStatusPillProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
        {userImage ? <img src={userImage} alt={userLabel} className="h-full w-full object-cover" /> : getInitial(userLabel)}
      </span>
      <span className="max-w-[180px] truncate">Signed in as {userLabel}</span>
      <GoogleSignOutButton className={cn("min-h-8 px-3 py-1 text-xs", actionClassName)} label="Sign out" />
    </div>
  );
}
