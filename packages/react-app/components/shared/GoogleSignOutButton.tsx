"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type GoogleSignOutButtonProps = {
  className?: string;
  fullWidth?: boolean;
  label?: string;
};

export function GoogleSignOutButton({
  className,
  fullWidth = false,
  label = "Sign out",
}: GoogleSignOutButtonProps) {
  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
