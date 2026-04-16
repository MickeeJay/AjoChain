import Link from "next/link";
import { WalletGuard } from "@/components/shared/WalletGuard";

export default function InviteLandingPage({ params }: { params: { code: string } }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-8 text-center text-slate-900 lg:px-10">
      <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_20px_80px_rgba(16,42,44,0.12)] backdrop-blur">
        <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Invite link
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Join a savings circle with code {params.code}</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          MiniPay users can open this invite, verify the group, and join the rotating savings circle without a heavy onboarding flow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/create" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Create your own group
          </Link>
          <Link href="/groups" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            View groups
          </Link>
        </div>

        <WalletGuard isConnected={false}>
          <div>Wallet connected</div>
        </WalletGuard>
      </div>
    </main>
  );
}
