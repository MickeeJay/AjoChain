"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type TwitterSignInButtonProps = {
  className?: string;
  fullWidth?: boolean;
  label?: string;
  callbackUrl?: string;
};

export function TwitterSignInButton({
  className,
  fullWidth = false,
  label = "Sign in with Twitter",
  callbackUrl,
}: TwitterSignInButtonProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const resolvedCallbackUrl = callbackUrl ?? pathname ?? "/";
    try {
      await signIn("twitter", { callbackUrl: resolvedCallbackUrl });
    } catch {
      setIsLoading(false);
    }
  };

  const buttonLabel = isLoading ? "Redirecting..." : label;

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )}
      {buttonLabel}
    </button>
  );
}
