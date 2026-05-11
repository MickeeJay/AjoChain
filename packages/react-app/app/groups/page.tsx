"use client";

import { lazy, Suspense, useState } from "react";
import { GroupsDiscoverBeta } from "@/components/groups/GroupsDiscoverBeta";
import { GroupsListSkeleton } from "@/components/groups/GroupsListSkeleton";
import { NetworkMismatchNotice } from "@/components/shared/NetworkMismatchNotice";
import { WalletRequiredCard } from "@/components/shared/WalletRequiredCard";
import { useMiniPay } from "@/hooks/useMiniPay";

const MyGroupsList = lazy(() => import("@/components/groups/MyGroupsList"));

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"my-groups" | "discover">("my-groups");
  const { isConnected, isMiniPay } = useMiniPay();

  return (
    <section className="flex flex-col gap-4 text-slate-900">
      <NetworkMismatchNotice />
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
          My groups
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Your rotating savings circles.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
          Track each group cycle, contribution progress, and payout order with on-chain group state.
        </p>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab("my-groups")}
          className={[
            "min-h-10 rounded-xl px-4 text-sm font-semibold transition",
            activeTab === "my-groups" ? "bg-celo-green text-white" : "text-slate-600 hover:bg-slate-50",
          ].join(" ")}
        >
          My Groups
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("discover")}
          className={[
            "min-h-10 rounded-xl px-4 text-sm font-semibold transition",
            activeTab === "discover" ? "bg-celo-green text-white" : "text-slate-600 hover:bg-slate-50",
          ].join(" ")}
        >
          Discover
        </button>
      </div>

      {activeTab === "my-groups" ? (
        isConnected ? (
          <Suspense fallback={<GroupsListSkeleton />}>
            <MyGroupsList />
          </Suspense>
        ) : (
          <WalletRequiredCard
            title="Connect your wallet to view your groups"
            description="Your groups and contribution history are linked to your wallet address."
            className="bg-white"
            buttonClassName="w-fit"
            fullWidthButton={false}
          />
        )
      ) : (
        <GroupsDiscoverBeta isConnected={isConnected} isMiniPay={isMiniPay} />
      )}
    </section>
  );
}
