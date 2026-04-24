"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, UserPlus2, WandSparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { useDashboardData } from "@/hooks/useDashboardData";

type GroupsDiscoverBetaProps = {
  isConnected: boolean;
  isMiniPay: boolean;
};

const TEMPLATES = [
  {
    id: "weekly-market",
    title: "Weekly Market Circle",
    subtitle: "Balanced for traders and salary earners.",
    details: "5 members · 10 cUSD · Weekly",
  },
  {
    id: "daily-coop",
    title: "Daily Cooperative Pot",
    subtitle: "Fast-rotation cycles for tight communities.",
    details: "7 members · 5 cUSD · Daily",
  },
  {
    id: "monthly-growth",
    title: "Monthly Growth Club",
    subtitle: "Lower frequency for predictable long-term saving.",
    details: "10 members · 20 cUSD · Monthly",
  },
] as const;

function normalizeInviteCode(rawCode: string) {
  const compact = rawCode.trim().replace(/\s+/g, "");
  if (!compact) {
    return "";
  }

  const prefixed = compact.startsWith("0x") ? compact : `0x${compact}`;
  return prefixed;
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

    if (!/^0x[0-9a-fA-F]+$/.test(normalized)) {
      setInviteError("Invite code must be a valid hexadecimal value.");
      return;
    }

    setInviteError(null);
    router.push(`/invite/${normalized}`);
  };

  return (
    <section className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-[0_22px_80px_rgba(16,42,44,0.12)]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-emerald-200/50 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-lime-200/40 blur-2xl" aria-hidden="true" />

        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-celo-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-celo-green">
            <Sparkles className="h-3.5 w-3.5" />
            Discover beta
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Find and join the right savings circle faster.</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Join through invite code, launch from proven group templates, and jump to your most urgent contribution action.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Join with invite code</p>
          <form onSubmit={handleInviteSubmit} className="mt-3 space-y-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Paste invite code
              <input
                value={inviteCodeInput}
                onChange={(event) => setInviteCodeInput(event.target.value)}
                placeholder="0x..."
                className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-celo-green"
              />
            </label>
            {inviteError ? <p className="text-sm font-medium text-rose-600">{inviteError}</p> : null}
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <UserPlus2 className="h-4 w-4" aria-hidden="true" />
              Open invite
            </button>
            <p className="text-xs text-slate-500">Tip: invite codes start with 0x and can be pasted directly from WhatsApp or copied links.</p>
          </form>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recommended next step</p>
          {isConnected ? (
            <div className="mt-3 space-y-3">
              <p className="text-lg font-semibold text-slate-950">
                {isGroupsLoading
                  ? "Loading your group insights..."
                  : activeGroupCount > 0
                    ? `You have ${activeGroupCount} active ${activeGroupCount === 1 ? "group" : "groups"}`
                    : "You are ready to start your first active circle"}
              </p>
              <p className="text-sm leading-6 text-slate-600">
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
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  Open next action
                </Link>
              ) : (
                <Link
                  href="/create"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                  Create a new group
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-lg font-semibold text-slate-950">Connect your wallet for personalized discovery</p>
              <p className="text-sm leading-6 text-slate-600">We will recommend the right next action based on your active contributions and group cycle status.</p>
              <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
            </div>
          )}
        </article>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(16,42,44,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick-start templates</p>
            <p className="mt-1 text-sm text-slate-600">Launch common contribution patterns with one tap.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TEMPLATES.map((template) => (
            <article key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-base font-semibold text-slate-950">{template.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{template.subtitle}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{template.details}</p>
              <Link
                href={`/create?template=${template.id}`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
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
