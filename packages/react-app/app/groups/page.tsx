"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { GroupsDiscoverBeta } from "@/components/groups/GroupsDiscoverBeta";
import { GroupsListSkeleton } from "@/components/groups/GroupsListSkeleton";
import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { NetworkMismatchNotice } from "@/components/shared/NetworkMismatchNotice";
import { WalletRequiredCard } from "@/components/shared/WalletRequiredCard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useMiniPay } from "@/hooks/useMiniPay";

const MyGroupsList = lazy(() => import("@/components/groups/MyGroupsList"));

export default function GroupsPage() {
  const { isConnected, isMiniPay } = useMiniPay();
  const [activeTab, setActiveTab] = useState<"my-groups" | "discover">("discover");
  const [hasSetDefaultTab, setHasSetDefaultTab] = useState(false);
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();

  useEffect(() => {
    if (isConnected && !hasSetDefaultTab) {
      setActiveTab("my-groups");
      setHasSetDefaultTab(true);
    }
  }, [isConnected, hasSetDefaultTab]);

  const isMyGroupsTab = activeTab === "my-groups";

  const headerLabel = isMyGroupsTab ? "My groups" : "Discover";
  const headerTitle = isMyGroupsTab ? "Your savings groups." : "Find a group that matches your savings goal.";
  const headerDescription = isMyGroupsTab
    ? "See your contribution progress, upcoming payouts, and group activity."
    : "Join with an invite code from a friend, or start from a ready-made template.";

  return (
    <section className="flex flex-col gap-4 text-slate-900 dark:text-slate-100">
      <NetworkMismatchNotice />
      {!isConnected ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Viewing in Preview Mode. Connect a wallet to start saving, join groups, or create a new one.</span>
        </div>
      ) : null}
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
          {headerLabel}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-slate-100">{headerTitle}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7 dark:text-slate-400">
          {headerDescription}
        </p>
        {status !== "loading" && isSignedIn ? (
          <AuthStatusPill className="w-fit" userLabel={userLabel} userImage={userImage} />
        ) : null}
      </div>

      <div
        className="flex w-full sm:inline-flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950/90"
        role="tablist"
        aria-label="Groups view"
      >
        <button
          type="button"
          onClick={() => setActiveTab("my-groups")}
          role="tab"
          id="tab-my-groups"
          aria-selected={isMyGroupsTab}
          aria-controls="panel-my-groups"
          className={[
            "flex-1 sm:flex-none min-h-10 rounded-xl px-4 text-sm font-semibold transition",
            activeTab === "my-groups"
              ? "bg-celo-green text-white"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900",
          ].join(" ")}
        >
          My Groups
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("discover")}
          role="tab"
          id="tab-discover"
          aria-selected={!isMyGroupsTab}
          aria-controls="panel-discover"
          className={[
            "flex-1 sm:flex-none min-h-10 rounded-xl px-4 text-sm font-semibold transition",
            activeTab === "discover"
              ? "bg-celo-green text-white"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900",
          ].join(" ")}
        >
          Discover
        </button>
      </div>

      {activeTab === "my-groups" ? (
        isConnected ? (
          <Suspense fallback={<GroupsListSkeleton />}>
            <div role="tabpanel" id="panel-my-groups" aria-labelledby="tab-my-groups">
              <MyGroupsList />
            </div>
          </Suspense>
        ) : (
          <div role="tabpanel" id="panel-my-groups" aria-labelledby="tab-my-groups">
            <WalletRequiredCard
              title="Connect your wallet to view your groups"
              description="Your groups and contribution history are linked to your wallet address."
              className="bg-white dark:bg-slate-950/90"
              buttonClassName="w-fit"
              fullWidthButton={false}
            />
          </div>
        )
      ) : (
        <div role="tabpanel" id="panel-discover" aria-labelledby="tab-discover">
          <GroupsDiscoverBeta isConnected={isConnected} isMiniPay={isMiniPay} />
        </div>
      )}
    </section>
  );
}
