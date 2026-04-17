import type { ReactNode } from "react";
import { WalletStatus } from "@/components/shared/WalletStatus";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 text-slate-900 sm:px-6 lg:px-10 lg:pb-10">
      <header className="mb-6 flex items-center justify-between rounded-[1.5rem] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_14px_40px_rgba(16,42,44,0.08)] backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">AjoChain</p>
          <p className="mt-1 text-sm text-slate-500">Rotating savings for MiniPay</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white lg:inline-flex">
            Celo mainnet ready
          </div>
          <WalletStatus />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
