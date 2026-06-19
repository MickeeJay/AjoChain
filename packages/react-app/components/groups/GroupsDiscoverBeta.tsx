"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, UserPlus2, WandSparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { WalletRequiredCard } from "@/components/shared/WalletRequiredCard";
import { useDashboardData } from "@/hooks/useDashboardData";

type GroupsDiscoverBetaProps = {
  isConnected: boolean;
  isMiniPay: boolean;
};

const TEMPLATES = [
  {
    id: "weekly-market",
    title: "Weekly Market Circle",
    subtitle: "Great for traders, shop owners, and weekly earners.",
    details: "5 members · 10 cUSD · Weekly",
  },
  {
    id: "daily-coop",
    title: "Daily Cooperative Pot",
    subtitle: "Fast daily rounds for close friends and family.",
    details: "7 members · 5 cUSD · Daily",
  },
  {
    id: "monthly-growth",
    title: "Monthly Growth Club",
    subtitle: "Long-term monthly savings for larger goals.",
    details: "10 members · 20 cUSD · Monthly",
  },
 ] as const;

const INVITE_CODE_PATTERN = /^0x[a-fA-F0-9]{64}$/;

function normalizeInviteCode(rawCode: string) {
  const compact = rawCode.trim().replace(/\s+/g, "");
  if (!compact) {
    return "";
  }

  const prefixed = compact.startsWith("0x") ? compact : `0x${compact}`;
  return prefixed.toLowerCase();
}

export function GroupsDiscoverBeta({ isConnected, isMiniPay }: GroupsDiscoverBetaProps) {
  const router = useRouter();
  const { userGroups, activeGroupCount, nextActionGroup, isGroupsLoading } = useDashboardData();
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = normalizeInviteCode(inviteCodeInput);
    if (!normalized) {
      setInviteError("Paste an invite code to continue.");
      return;
    }

    if (!INVITE_CODE_PATTERN.test(normalized)) {
      setInviteError("Invite code must be 64 hex characters starting with 0x.");
      return;
    }

    setInviteError(null);
    router.push(`/invite/${normalized}`);
  };

  return (
    <section className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-[0_22px_80px_rgba(16,42,44,0.12)] dark:border-emerald-500/20 dark:from-emerald-900/40 dark:via-slate-950 dark:to-lime-900/30">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-emerald-200/50 blur-2xl dark:bg-emerald-500/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-lime-200/40 blur-2xl dark:bg-lime-500/20" aria-hidden="true" />

        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-celo-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-celo-green">
            <Sparkles className="h-3.5 w-3.5" />
            Discover beta
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-100">
            Find a savings group that fits your budget.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 dark:text-slate-400">
            Have an invite code? Paste it below. Or start fresh with a ready-made template.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Join with invite code</p>
          <form onSubmit={handleInviteSubmit} className="mt-3 space-y-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Paste invite code
              <input
                value={inviteCodeInput}
                onChange={(event) => setInviteCodeInput(event.target.value)}
                placeholder="0x..."
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-celo-green dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            {inviteError ? <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{inviteError}</p> : null}
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <UserPlus2 className="h-4 w-4" aria-hidden="true" />
              Open invite
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: Got an invite on WhatsApp or from a friend? Paste the code here.
            </p>
          </form>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Recommended next step</p>
          {isConnected ? (
            <div className="mt-3 space-y-3">
              <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                {isGroupsLoading
                  ? "Loading your group insights..."
                  : activeGroupCount > 0
                    ? `You have ${activeGroupCount} active ${activeGroupCount === 1 ? "group" : "groups"}`
                    : "You are ready to start your first active circle"}
              </p>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {isGroupsLoading
                  ? "We are reading your latest on-chain group state."
                  : nextActionGroup
                    ? `Next best action: contribute to ${nextActionGroup.name}.`
                    : userGroups.length > 0
                      ? "You have groups in progress. Open My Groups to review cycle status and payouts."
                      : "Use one of the templates below to launch a new, structured savings circle in minutes."}
              </p>
              {nextActionGroup ? (
                <Link
                  href={`/groups/${nextActionGroup.groupAddress}`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  Open next action
                </Link>
              ) : (
                <Link
                  href="/create"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
                >
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                  Create a new group
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <WalletRequiredCard
                title="Connect your wallet for personalized discovery"
                description="We will recommend the right next action based on your active contributions and group cycle status."
                className="border-0 bg-transparent p-0"
              />
            </div>
          )}
        </article>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Quick-start templates</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Launch common contribution patterns with one tap.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TEMPLATES.map((template) => (
            <article key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-base font-semibold text-slate-950 dark:text-slate-100">{template.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{template.subtitle}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{template.details}</p>
              <Link
                href={`/create?template=${template.id}`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-500"
              >
                Use template
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
