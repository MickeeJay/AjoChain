"use client";

import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthErrorBannerProps = {
  className?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Google sign-in did not start. Please try again.",
  OAuthCallback: "Google sign-in was interrupted. Please try again.",
  OAuthCreateAccount: "We could not create your account. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Use the originally linked account.",
  AccessDenied: "Access denied. Please use an allowed account.",
  Verification: "Verification failed. Please try again.",
  Configuration: "Auth is not configured yet. Please try again later.",
  Callback: "Sign-in failed to complete. Please try again.",
  SessionRequired: "Please sign in to continue.",
  Default: "Sign-in failed. Please try again.",
};

export function AuthErrorBanner({ className }: AuthErrorBannerProps) {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error");

  if (!errorCode) {
    return null;
  }

  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  return (
    <div className={cn("rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700", className)}>
      {message}
    </div>
  );
}
