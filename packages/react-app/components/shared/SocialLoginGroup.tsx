"use client";

import { GoogleSignInButton } from "./GoogleSignInButton";
import { TwitterSignInButton } from "./TwitterSignInButton";
import { useAvailableProviders } from "@/hooks/useAvailableProviders";

type SocialLoginGroupProps = {
  className?: string;
  callbackUrl?: string;
};

export function SocialLoginGroup({ className, callbackUrl }: SocialLoginGroupProps) {
  const { providerIds, isLoading } = useAvailableProviders();

  if (isLoading) {
    return null;
  }

  const hasGoogle = providerIds.has("google");
  const hasTwitter = providerIds.has("twitter");

  if (!hasGoogle && !hasTwitter) {
    return null;
  }

  return (
    <div className={["space-y-3 w-full", className].join(" ")}>
      <div className="grid gap-2">
        {hasGoogle && (
          <GoogleSignInButton fullWidth callbackUrl={callbackUrl} label="Continue with Google" />
        )}
        {hasTwitter && (
          <TwitterSignInButton fullWidth callbackUrl={callbackUrl} label="Continue with Twitter" />
        )}
      </div>
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold">or</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>
    </div>
  );
}
