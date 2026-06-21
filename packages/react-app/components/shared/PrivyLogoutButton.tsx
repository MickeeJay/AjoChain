"use client";

import { usePrivy } from "@privy-io/react-auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type PrivyLogoutButtonProps = {
  className?: string;
  label?: string;
};

export function PrivyLogoutButton({
  className,
  label = "Sign Out",
}: PrivyLogoutButtonProps) {
  const { logout, ready } = usePrivy();

  const handleLogout = () => {
    if (ready) {
      void logout();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={!ready}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      <LogOut className="h-3 w-3" aria-hidden="true" />
      {label}
    </button>
  );
}
