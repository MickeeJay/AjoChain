"use client";

import { usePrivy } from "@privy-io/react-auth";
import { LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PrivyLoginButtonProps = {
  className?: string;
  fullWidth?: boolean;
  label?: string;
};

export function PrivyLoginButton({
  className,
  fullWidth = false,
  label = "Sign In / Connect Wallet",
}: PrivyLoginButtonProps) {
  const { login, ready } = usePrivy();

  const handleLogin = () => {
    if (ready) {
      login();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={!ready}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "",
        className
      )}
    >
      {!ready ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogIn className="h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
