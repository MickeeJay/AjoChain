"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthErrorBannerProps = {
  className?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Sign-in did not start. Please try again.",
  OAuthCallback: "Sign-in was interrupted. Please try again.",
  OAuthCreateAccount: "We could not create your account. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Please sign in using your original method.",
  AccessDenied: "Access denied. Please use an allowed account.",
  Verification: "Verification failed. Please try again.",
  Configuration: "Sign-in is not fully configured yet. Please try again later.",
  Callback: "Sign-in failed to complete. Please try again.",
  SessionRequired: "Please sign in to continue.",
  Default: "Sign-in failed. Please try again.",
};

function AuthErrorBannerInner({ className }: AuthErrorBannerProps) {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error");

  if (!errorCode) {
    return null;
  }

  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  return (
    <div
      className={cn(
        "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function AuthErrorBanner({ className }: AuthErrorBannerProps) {
  return (
    <Suspense fallback={null}>
      <AuthErrorBannerInner className={className} />
    </Suspense>
  );
}
