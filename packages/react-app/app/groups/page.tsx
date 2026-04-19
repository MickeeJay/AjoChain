"use client";

import { lazy, Suspense, useState } from "react";
import { GroupsListSkeleton } from "@/components/groups/GroupsListSkeleton";
import { useMiniPay } from "@/hooks/useMiniPay";

const MyGroupsList = lazy(() => import("@/components/groups/MyGroupsList"));

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"my-groups" | "discover">("my-groups");
  const { isConnected } = useMiniPay();

  return (
    <section className="flex flex-col gap-4 text-slate-900">
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
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Connect your wallet to view your groups.
          </section>
        )
      ) : (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Discover will list all public savings groups in a future release.
        </section>
      )}
    </section>
  );
}
