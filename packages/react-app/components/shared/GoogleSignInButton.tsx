"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  className?: string;
  fullWidth?: boolean;
  label?: string;
};

export function GoogleSignInButton({
  className,
  fullWidth = false,
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const callbackUrl = pathname ?? "/";
    await signIn("google", { callbackUrl });
  };

  const buttonLabel = isLoading ? "Redirecting..." : label;

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
      {buttonLabel}
    </button>
  );
}
