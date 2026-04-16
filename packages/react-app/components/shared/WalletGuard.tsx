import type { ReactNode } from "react";
import Link from "next/link";

type WalletGuardProps = {
  isConnected: boolean;
  children: ReactNode;
};

export function WalletGuard({ isConnected, children }: WalletGuardProps) {
  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
      <p className="text-lg font-semibold">Connect MiniPay to continue</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        The app keeps sensitive actions gated behind the wallet connection before a user can create or join a savings circle.
      </p>
      <Link href="/" className="mt-5 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
        Back home
      </Link>
    </div>
  );
}
