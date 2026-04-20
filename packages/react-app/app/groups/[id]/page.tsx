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
import type { TransactionStatusItem } from "@/types";

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
  const {
    groupState,
    startGroup,
    contribute,
    dismissContributionStatus,
    allowance,
    contributionAmount,
    contributionFlowStep,
    contributionConfirmations,
    requiredConfirmations,
    approveTxHash,
    contributeTxHash,
    lastPayoutRecipient,
    isStarting,
    isContributing,
    error,
  } = useAjoGroup(groupAddress);

  const drawerStatusItem: TransactionStatusItem | null = (() => {
    if (contributionFlowStep === "idle") {
      return null;
    }

    if (contributionFlowStep === "approving") {
      return {
        id: "approval",
        label: "Approving cUSD allowance",
        state: "pending",
        txHash: approveTxHash,
      };
    }

    if (contributionFlowStep === "contributing") {
      return {
        id: "contribution-pending",
        label: "Submitting contribution",
        state: "pending",
        txHash: contributeTxHash,
      };
    }

    if (contributionFlowStep === "confirming") {
      return {
        id: "contribution-confirming",
        label: "Contribution is confirming",
        state: "confirming",
        txHash: contributeTxHash,
        confirmations: contributionConfirmations,
        requiredConfirmations,
      };
    }

    if (contributionFlowStep === "success") {
      return {
        id: "contribution-success",
        label: lastPayoutRecipient ? `Payout executed to ${lastPayoutRecipient}` : "Contribution confirmed",
        state: "success",
        txHash: contributeTxHash,
      };
    }

    return {
      id: "contribution-failed",
      label: "Contribution failed",
      state: "failed",
      txHash: contributeTxHash ?? approveTxHash,
      errorMessage: error ?? "Unable to complete contribution.",
    };
  })();

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
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">Loading group state...</div>
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
          allowance={allowance}
          contributionAmount={contributionAmount}
          isStarting={isStarting}
          isContributing={isContributing}
          contributionFlowStep={contributionFlowStep}
          approveTxHash={approveTxHash}
          contributeTxHash={contributeTxHash}
          lastPayoutRecipient={lastPayoutRecipient}
          onStartGroup={onStartGroup}
          onContribute={onContribute}
          canDownloadCertificate={isMember}
          certificateHref="/profile"
        />

        {groupState.status === "FORMING" ? <InviteActions inviteCode={groupState.inviteCode} /> : null}
        {error && contributionFlowStep === "idle" ? <TransactionStatus status="error" label={error} /> : null}

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

      <TransactionStatus mode="drawer" open={Boolean(drawerStatusItem)} item={drawerStatusItem} onClose={dismissContributionStatus} />
    </section>
  );
}
