import Link from "next/link";
import { ArrowRight, ShieldCheck, WalletCards } from "lucide-react";
import { GroupCard } from "@/components/groups/GroupCard";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

const stats = [
  { label: "Groups created", value: "12" },
  { label: "Active savers", value: "84" },
  { label: "cUSD contributed", value: "3.2K" },
];

const sampleGroups = [
  { id: "market-traders-circle", name: "Market Traders Circle", status: "Active", current: 2, total: 5, nextPayout: "Today" },
  { id: "diaspora-family-fund", name: "Diaspora Family Fund", status: "Contributing", current: 1, total: 4, nextPayout: "2 days" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 text-slate-900 lg:px-10">
      <section className="grid gap-8 rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_20px_80px_rgba(16,42,44,0.12)] backdrop-blur md:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            MiniPay Mini App on Celo
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Rotating savings that feel familiar and settle fully on-chain.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              AjoChain turns Ajo, Susu, and Chama circles into transparent cUSD-based groups with smart contracts instead of a human treasurer.
            </p>
          </div>
          <TransactionStatus status="success" label="MiniPay ready" />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Create a group
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
            >
              View my groups
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm text-slate-300">Built for</p>
              <p className="text-lg font-semibold">MiniPay mobile users</p>
            </div>
            <WalletCards className="h-10 w-10 text-emerald-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-50">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <p className="text-sm leading-6">
              Smart contracts enforce contribution rules so no single person holds group funds.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {sampleGroups.map((group) => (
          <GroupCard key={group.id} {...group} />
        ))}
      </section>
    </main>
  );
}
