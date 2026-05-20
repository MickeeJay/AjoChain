"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { parseAbiItem, type Address, zeroAddress } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { AJO_CREDENTIAL_ABI, AJO_FACTORY_ABI, AJO_GROUP_ABI } from "@/lib/contracts/abis";
import { addresses } from "@/lib/contracts/addresses";
import type { ActivityItem, GroupStatus, UserGroupDashboardItem } from "@/types";

const GROUP_STATUSES: GroupStatus[] = ["FORMING", "ACTIVE", "COMPLETED", "PAUSED"];

function resolveNetworkId(chainId: number | undefined): 42220 | 44787 {
  return chainId === 44787 ? 44787 : 42220;
}

function resolveGroupStatus(status: bigint | number): GroupStatus {
  const resolved = GROUP_STATUSES[Number(status)];
  return resolved ?? "FORMING";
}

function toReadableAddress(address: string) {
  return address.toLowerCase();
}

interface RawActivityItem {
  id: string;
  label: string;
  groupAddress: string;
  timestamp: number;
}

export function useDashboardData() {
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const networkId = resolveNetworkId(chainId);
  const factoryAddress = addresses[networkId].factory;
  const hasFactory = factoryAddress !== zeroAddress;

  const { data: userGroupIdsData, isLoading: isUserGroupsLoading } = useReadContract({
    address: factoryAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "getUserGroups",
    args: accountAddress ? [accountAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(accountAddress && hasFactory),
      staleTime: 20_000,
    },
  });

  const userGroupIds = useMemo(() => {
    return (userGroupIdsData as bigint[]) ?? [];
  }, [userGroupIdsData]);

  const { data: groupStateResults, isLoading: isGroupStateLoading } = useReadContracts({
    contracts: userGroupIds.map((groupId) => ({
      address: factoryAddress,
      abi: AJO_FACTORY_ABI,
      functionName: "getGroupInfo",
      args: [groupId],
      chainId,
    })),
    query: {
      enabled: userGroupIds.length > 0,
      staleTime: 20_000,
    },
  });

  const groupAddresses = useMemo(() => {
    if (!groupStateResults) {
      return [];
    }

    return groupStateResults
      .map((result) => result.result as Address)
      .filter((address): address is Address => Boolean(address && address !== zeroAddress));
  }, [groupStateResults]);

  const { data: groupDetailsResults, isLoading: isGroupDetailsLoading } = useReadContracts({
    contracts: groupAddresses.map((address) => ({
      address,
      abi: AJO_GROUP_ABI,
      functionName: "getGroupState",
      chainId,
    })),
    query: {
      enabled: groupAddresses.length > 0,
      staleTime: 10_000,
    },
  });

  const { data: memberResults, isLoading: isMemberDetailsLoading } = useReadContracts({
    contracts: groupAddresses.map((address) => ({
      address,
      abi: AJO_GROUP_ABI,
      functionName: "getMemberInfo",
      args: accountAddress ? [accountAddress] : [zeroAddress],
      chainId,
    })),
    query: {
      enabled: Boolean(accountAddress && groupAddresses.length > 0),
      staleTime: 10_000,
    },
  });

  const credentialAddress = addresses[networkId].credential;
  const hasCredential = credentialAddress !== zeroAddress;

  const { data: cyclesCompletedData, isLoading: isCyclesLoading } = useReadContract({
    address: credentialAddress,
    abi: AJO_CREDENTIAL_ABI,
    functionName: "getUserReputation",
    args: accountAddress ? [accountAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(accountAddress && hasCredential),
      staleTime: 30_000,
    },
  });

  const userGroups = useMemo(() => {
    if (!groupDetailsResults) {
      return [];
    }

    return groupAddresses.map((groupAddress, index) => {
      const stateResult = groupDetailsResults[index];

      if (stateResult.status !== "success") {
        return {
          groupId: 0n,
          groupAddress,
          name: "Savings Circle",
          status: "FORMING" as GroupStatus,
          memberCount: 0,
          maxMembers: 0,
          contributionAmount: 0n,
          currentRound: 0n,
          totalRounds: 0n,
          memberOrder: [] as Address[],
          remainingTime: 0,
          needsContribution: false,
          nextPayoutTo: zeroAddress,
          userTotalContributed: 0n,
        };
      }

      const groupState = stateResult.result as {
        status: number;
        factory: Address;
        creator: Address;
        cUSDToken: Address;
        name: string;
        contributionAmount: bigint;
        frequencyInDays: bigint;
        maxMembers: bigint;
        currentRound: bigint;
        roundStartTime: bigint;
        payoutIndex: bigint;
        inviteCode: `0x${string}`;
        memberOrder: readonly Address[];
        activeMembers: readonly Address[];
        pauseSupportVotes: bigint;
        pauseOppositionVotes: bigint;
        remainingTime: bigint;
      };

      const memberOrder = [...(groupState.memberOrder ?? [])];
      const totalRounds = memberOrder.length > 0 ? BigInt(memberOrder.length) : groupState.maxMembers;
      const status = resolveGroupStatus(groupState.status);
      const memberCount = groupState.activeMembers?.length ?? 0;
      const nextPayoutTo = memberOrder[Number(groupState.payoutIndex)] ?? zeroAddress;

      const memberInfoResult = memberResults?.[index];
      const memberRecord = memberInfoResult?.result as [Address, boolean, boolean, bigint, bigint] | undefined;
      const isActiveMember = memberRecord?.[1] ?? false;
      const hasContributedThisRound = memberRecord?.[2] ?? false;

      return {
        groupId: userGroupIds[index] ?? 0n,
        groupAddress,
        name: groupState.name,
        status,
        memberCount,
        maxMembers: Number(groupState.maxMembers),
        contributionAmount: groupState.contributionAmount,
        currentRound: groupState.currentRound,
        totalRounds,
        memberOrder,
        remainingTime: Number(groupState.remainingTime ?? 0n),
        needsContribution: status === "ACTIVE" && isActiveMember && !hasContributedThisRound,
        nextPayoutTo,
        userTotalContributed: memberRecord?.[3] ?? 0n,
      };
    });
  }, [groupAddresses, groupDetailsResults, memberResults, userGroupIds]);

  const groupNameByAddress = useMemo(() => {
    return userGroups.reduce<Record<string, string>>((accumulator, group) => {
      accumulator[toReadableAddress(group.groupAddress)] = group.name;
      return accumulator;
    }, {});
  }, [userGroups]);

  const activityQuery = useQuery<RawActivityItem[]>({
    queryKey: ["dashboard-activity", chainId, accountAddress, groupAddresses],
    enabled: Boolean(accountAddress && publicClient && groupAddresses.length > 0),
    staleTime: 15_000,
    queryFn: async () => {
      if (!publicClient || groupAddresses.length === 0) {
        return [] as RawActivityItem[];
      }

      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > 120_000n ? latestBlock - 120_000n : 0n;

      const [contributionLogs, roundLogs, groupCompletedLogs] = await Promise.all([
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event ContributionReceived(address member, uint256 round, uint256 amount)"),
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event RoundCompleted(uint256 round, address recipient, uint256 amount)"),
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event GroupCompleted(uint256 totalCycles, uint256 completedAt)"),
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      const mergedLogs = [
        ...contributionLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          logIndex: log.logIndex ?? 0,
          groupAddress: toReadableAddress(log.address),
          label:
            log.args.member && accountAddress && toReadableAddress(log.args.member) === toReadableAddress(accountAddress)
              ? "You contributed"
              : "Contribution received",
        })),
        ...roundLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          logIndex: log.logIndex ?? 0,
          groupAddress: toReadableAddress(log.address),
          label: "Round completed",
        })),
        ...groupCompletedLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          logIndex: log.logIndex ?? 0,
          groupAddress: toReadableAddress(log.address),
          label: "Cycle complete",
        })),
      ]
        .sort((left, right) => {
          if (left.blockNumber !== right.blockNumber) {
            return Number(right.blockNumber - left.blockNumber);
          }

          return right.logIndex - left.logIndex;
        })
        .slice(0, 5);

      const uniqueBlocks = Array.from(new Set(mergedLogs.map((entry) => entry.blockNumber.toString()))).map((value) => BigInt(value));
      const blocks = await Promise.all(uniqueBlocks.map((blockNumber) => publicClient.getBlock({ blockNumber })));
      const blockTimestampByNumber = blocks.reduce<Record<string, number>>((accumulator, block) => {
        accumulator[block.number.toString()] = Number(block.timestamp);
        return accumulator;
      }, {});

      return mergedLogs.map((entry) => ({
        id: entry.id,
        label: entry.label,
        groupAddress: entry.groupAddress,
        timestamp: blockTimestampByNumber[entry.blockNumber.toString()] ?? 0,
      }));
    },
  });

  const activity = useMemo(() => {
    const rawItems = activityQuery.data ?? [];
    return rawItems.map((item) => ({
      id: item.id,
      label: item.label,
      groupName: groupNameByAddress[item.groupAddress] ?? "Savings group",
      timestamp: item.timestamp,
    }));
  }, [activityQuery.data, groupNameByAddress]);

  const activeGroups = userGroups.filter((group) => group.status === "ACTIVE");
  const nextActionGroup = activeGroups.find((group) => group.needsContribution) ?? activeGroups[0];

  return {
    hasFactory,
    userGroups,
    isGroupsLoading:
      isUserGroupsLoading ||
      isGroupStateLoading ||
      isGroupDetailsLoading ||
      isMemberDetailsLoading,
    isActivityLoading: activityQuery.isLoading,
    isCyclesLoading,
    activeGroupCount: activeGroups.length,
    totalSaved: userGroups.reduce((total, group) => total + group.userTotalContributed, 0n),
    cyclesCompleted: cyclesCompletedData ?? 0n,
    nextActionGroup,
    activity,
  };
}
