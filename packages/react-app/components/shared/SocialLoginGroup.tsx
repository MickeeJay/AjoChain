"use client";

import { GoogleSignInButton } from "./GoogleSignInButton";
import { TwitterSignInButton } from "./TwitterSignInButton";

type SocialLoginGroupProps = {
  className?: string;
  callbackUrl?: string;
};

export function SocialLoginGroup({ className, callbackUrl }: SocialLoginGroupProps) {
  return (
    <div className={["space-y-3 w-full", className].join(" ")}>
      <div className="grid gap-2">
        <GoogleSignInButton fullWidth callbackUrl={callbackUrl} label="Continue with Google" />
        <TwitterSignInButton fullWidth callbackUrl={callbackUrl} label="Continue with Twitter" />
      </div>
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold">or</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>
    </div>
  );
}
