"use client";

import Link from "next/link";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { GroupActionPanel } from "@/components/groups/GroupActionPanel";
import { GroupDetailHeader } from "@/components/groups/GroupDetailHeader";
import { GroupProgress } from "@/components/groups/GroupProgress";
import { InviteActions } from "@/components/groups/InviteActions";
import { MemberList } from "@/components/groups/MemberList";
import { RoundCountdown } from "@/components/groups/RoundCountdown";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { useAjoGroup } from "@/hooks/useAjoGroup";
import { formatCusdFromWei } from "@/lib/formatters";

const MIN_GROUP_SIZE = 3;

type GroupDetailPageProps = {
  params: {
    id: string;
  };
};

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { address: accountAddress } = useAccount();
  const inputAddress = params.id;
  const isValidGroupAddress = isAddress(inputAddress);
  const groupAddress = (isValidGroupAddress ? inputAddress : "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const { groupState, startGroup, contribute, isStarting, isContributing, error } = useAjoGroup(groupAddress);

  if (!isValidGroupAddress) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 text-slate-900 lg:px-10">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
          <p className="text-sm font-semibold text-rose-600">Invalid group address.</p>
          <Link href="/groups" className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Back to groups
          </Link>
        </section>
      </main>
    );
  }

  if (!groupState) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 text-slate-900 lg:px-10">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
          <TransactionStatus status="pending" label="Loading group state" />
        </section>
      </main>
    );
  }

  const memberCount = groupState.members.length;
  const hasRequiredMembers = memberCount >= MIN_GROUP_SIZE;
  const isCreator = Boolean(accountAddress && accountAddress.toLowerCase() === groupState.creator.toLowerCase());
  const connectedMember = groupState.members.find((member) => member.wallet.toLowerCase() === accountAddress?.toLowerCase());
  const isMember = Boolean(connectedMember?.isActive);
  const hasContributedThisRound = Boolean(connectedMember?.hasContributedThisRound);
  const paidCount = groupState.members.filter((member) => member.hasContributedThisRound).length;
  const totalRounds = groupState.memberOrder.length > 0 ? groupState.memberOrder.length : Number(groupState.maxMembers);
  const contributionLabel = `$${formatCusdFromWei(groupState.contributionAmount)}`;

  const onStartGroup = () => {
    void startGroup();
  };

  const onContribute = () => {
    void contribute();
  };

  return (
    <section className="flex flex-col gap-4 text-slate-900">
      <div className="space-y-4 rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <GroupDetailHeader
          name={groupState.name}
          status={groupState.status}
          creator={groupState.creator}
          isCreator={isCreator}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-400">Current round</p>
            <p className="mt-2 text-3xl font-semibold">{Number(groupState.currentRound) + 1}</p>
          </div>
          <div className="rounded-3xl bg-emerald-600 p-5 text-white">
            <p className="text-sm text-emerald-100">Contributions received</p>
            <p className="mt-2 text-3xl font-semibold">{paidCount} / {memberCount}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 p-5 text-slate-900">
            <p className="text-sm text-slate-500">Contribution amount</p>
            <p className="mt-2 text-2xl font-semibold">{contributionLabel}</p>
          </div>
        </div>

        <GroupProgress
          currentRound={Number(groupState.currentRound)}
          totalRounds={Math.max(totalRounds, 1)}
          memberOrder={groupState.memberOrder}
          nextPayoutTo={groupState.memberOrder[Number(groupState.payoutIndex)]}
        />

        <RoundCountdown secondsLeft={groupState.remainingTime} />

        <GroupActionPanel
          status={groupState.status}
          isCreator={isCreator}
          isMember={isMember}
          minMembersMet={hasRequiredMembers}
          memberCount={memberCount}
          requiredMembers={MIN_GROUP_SIZE}
          hasContributedThisRound={hasContributedThisRound}
          contributionLabel={contributionLabel}
          isStarting={isStarting}
          isContributing={isContributing}
          onStartGroup={onStartGroup}
          onContribute={onContribute}
          certificateHref="/profile"
        />

        {groupState.status === "FORMING" ? <InviteActions inviteCode={groupState.inviteCode} /> : null}
        {error ? <TransactionStatus status="error" label={error} /> : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Members</p>
          <MemberList
            members={groupState.members.map((member) => ({
              address: member.wallet,
              contributed: Boolean(member.hasContributedThisRound),
            }))}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/groups" className="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Back to groups
          </Link>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";
import { ContributeButton } from "@/components/groups/ContributeButton";
import { MemberList } from "@/components/groups/MemberList";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

const members = [
  { name: "Mina", paid: true },
  { name: "Ayo", paid: true },
  { name: "Grace", paid: false },
];

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const paidCount = members.filter((member) => member.paid).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8 text-slate-900 lg:px-10">
      <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_20px_80px_rgba(16,42,44,0.12)] backdrop-blur">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Group detail
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{params.id}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Monitor who has contributed, who is next in line, and whether the payout condition is ready to execute.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-400">Current cycle</p>
            <p className="mt-2 text-3xl font-semibold">1</p>
          </div>
          <div className="rounded-3xl bg-emerald-600 p-5 text-white">
            <p className="text-sm text-emerald-100">Contributions received</p>
            <p className="mt-2 text-3xl font-semibold">{paidCount} / {members.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 p-5 text-slate-900">
            <p className="text-sm text-slate-500">Next payout recipient</p>
            <p className="mt-2 text-2xl font-semibold">Mina</p>
          </div>
        </div>

        <TransactionStatus status="success" label="Payout ready when wallet approves" />

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Members</p>
          <MemberList members={members} />
        </div>

        <div className="flex flex-wrap gap-3">
          <ContributeButton onClick={() => undefined} />
          <Link href="/groups" className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Back to groups
          </Link>
        </div>
      </div>
    </main>
  );
}
