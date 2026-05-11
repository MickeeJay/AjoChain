"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
      {isLoading ? "Signing out..." : label}
    </button>
  );
}
