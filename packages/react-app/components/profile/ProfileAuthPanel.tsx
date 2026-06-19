"use client";

import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { AuthErrorBanner } from "@/components/shared/AuthErrorBanner";
import { SocialLoginGroup } from "@/components/shared/SocialLoginGroup";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export function ProfileAuthPanel() {
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account access</p>
      <AuthErrorBanner className="mt-3" />
      {status === "loading" ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Checking sign-in status...</p>
      ) : isSignedIn ? (
        <div className="mt-3">
          <AuthStatusPill userLabel={userLabel} userImage={userImage} />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in to explore groups and profiles without connecting a wallet.
          </p>
          <SocialLoginGroup />
        </div>
      )}
    </section>
  );
}
