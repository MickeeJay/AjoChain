"use client";

import { GroupCard } from "@/components/groups/GroupCard";
import { GroupsEmptyState } from "@/components/groups/GroupsEmptyState";
import { GroupsListSkeleton } from "@/components/groups/GroupsListSkeleton";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function MyGroupsList() {
  const { userGroups, isGroupsLoading } = useDashboardData();

  if (isGroupsLoading) {
    return <GroupsListSkeleton />;
  }

  if (userGroups.length === 0) {
    return <GroupsEmptyState />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {userGroups.map((group) => (
        <GroupCard
          key={group.groupAddress}
          groupAddress={group.groupAddress}
          name={group.name}
          status={group.status}
          memberCount={group.memberCount}
          maxMembers={group.maxMembers}
          contributionAmount={group.contributionAmount}
          currentRound={Number(group.currentRound)}
          totalRounds={Number(group.totalRounds)}
          memberOrder={group.memberOrder}
          nextPayoutTo={group.nextPayoutTo}
          needsContribution={group.needsContribution}
        />
      ))}
    </section>
  );
}
