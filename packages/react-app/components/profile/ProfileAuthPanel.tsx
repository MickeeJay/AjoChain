"use client";

import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export function ProfileAuthPanel() {
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(16,42,44,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account access</p>
      {status === "loading" ? (
        <p className="mt-3 text-sm text-slate-500">Checking sign-in status...</p>
      ) : isSignedIn ? (
        <div className="mt-3">
          <AuthStatusPill userLabel={userLabel} userImage={userImage} />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-600">
            Sign in with Google to explore groups and profiles without connecting a wallet.
          </p>
          <GoogleSignInButton fullWidth />
        </div>
      )}
    </section>
  );
}
