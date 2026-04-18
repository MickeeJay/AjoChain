import Link from "next/link";
import { WalletGuard } from "@/components/shared/WalletGuard";

export default function InviteLandingPage({ params }: { params: { code: string } }) {
  return (
    <section className="flex flex-col gap-4 text-center text-slate-900">
      <div className="space-y-5 rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <span className="inline-flex self-center rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
          Invite link
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Join a savings circle with code {params.code}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
          MiniPay users can open this invite, verify the group, and join the rotating savings circle without a heavy onboarding flow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/create" className="inline-flex min-h-12 items-center justify-center rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Create your own group
          </Link>
          <Link href="/groups" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            View groups
          </Link>
        </div>

        <WalletGuard>
          <div>Wallet connected</div>
        </WalletGuard>
      </div>
    </section>
  );
}
