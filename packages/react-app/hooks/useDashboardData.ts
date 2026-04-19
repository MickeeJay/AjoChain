"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { parseAbiItem, type Address, zeroAddress } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { AJO_CREDENTIAL_ABI, AJO_FACTORY_ABI, AJO_GROUP_ABI } from "@/lib/contracts/abis";
import { addresses } from "@/lib/contracts/addresses";
import type { ActivityItem, GroupStatus, UserGroupDashboardItem } from "@/types";

type UseDashboardDataOptions = {
  suspense?: boolean;
};

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

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { suspense = false } = options;
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const networkId = resolveNetworkId(chainId);
  const factoryAddress = addresses[networkId].factory;
  const hasFactory = factoryAddress !== zeroAddress;

  const { data: userGroupIdsData } = useReadContract({
    address: factoryAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "getUserGroups",
    args: accountAddress ? [accountAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(accountAddress && hasFactory),
      staleTime: 15_000,
      suspense,
    },
  });

  const userGroupIds = useMemo(() => Array.from(userGroupIdsData ?? []), [userGroupIdsData]);

  const groupInfoContracts = useMemo(
    () =>
      userGroupIds.map((groupId) => ({
        address: factoryAddress,
        abi: AJO_FACTORY_ABI,
        functionName: "getGroupInfo" as const,
        args: [groupId],
        chainId,
      })),
    [chainId, factoryAddress, userGroupIds],
  );

  const { data: groupInfoResults } = useReadContracts({
    contracts: groupInfoContracts,
    query: {
      enabled: groupInfoContracts.length > 0,
      staleTime: 15_000,
      suspense,
    },
  });

  const groupAddresses = useMemo(() => {
    return (groupInfoResults ?? [])
      .map((result) => result.result)
      .filter((groupAddress): groupAddress is Address => Boolean(groupAddress && groupAddress !== zeroAddress));
  }, [groupInfoResults]);

  const groupStateContracts = useMemo(
    () =>
      groupAddresses.map((groupAddress) => ({
        address: groupAddress,
        abi: AJO_GROUP_ABI,
        functionName: "getGroupState" as const,
        chainId,
      })),
    [chainId, groupAddresses],
  );

  const { data: groupStateResults } = useReadContracts({
    contracts: groupStateContracts,
    query: {
      enabled: groupStateContracts.length > 0,
      staleTime: 15_000,
      suspense,
    },
  });

  const memberContracts = useMemo(() => {
    if (!accountAddress) {
      return [];
    }

    return groupAddresses.map((groupAddress) => ({
      address: groupAddress,
      abi: AJO_GROUP_ABI,
      functionName: "members" as const,
      args: [accountAddress],
      chainId,
    }));
  }, [accountAddress, chainId, groupAddresses]);

  const { data: memberResults } = useReadContracts({
    contracts: memberContracts,
    query: {
      enabled: Boolean(accountAddress && memberContracts.length > 0),
      staleTime: 15_000,
      suspense,
    },
  });

  const { data: credentialFromFactory } = useReadContract({
    address: factoryAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "credentialContract",
    chainId,
    query: {
      enabled: hasFactory,
      staleTime: 15_000,
      suspense,
    },
  });

  const credentialAddress = (credentialFromFactory ?? addresses[networkId].credential) as Address;

  const { data: cyclesCompletedData } = useReadContract({
    address: credentialAddress,
    abi: AJO_CREDENTIAL_ABI,
    functionName: "getUserReputation",
    args: accountAddress ? [accountAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(accountAddress && credentialAddress !== zeroAddress),
      staleTime: 15_000,
      suspense,
    },
  });

  const userGroups = useMemo<UserGroupDashboardItem[]>(() => {
    return groupAddresses.map((groupAddress, index) => {
      const groupId = userGroupIds[index] ?? 0n;
      const groupState = groupStateResults?.[index]?.result;
      const memberRecord = memberResults?.[index]?.result as
        | readonly [Address, boolean, boolean, bigint, bigint]
        | undefined;

      if (!groupState) {
        return {
          groupId,
          groupAddress,
          name: `Group ${Number(groupId) + 1}`,
          status: "FORMING",
          memberCount: 0,
          maxMembers: 0,
          contributionAmount: 0n,
          currentRound: 0n,
          totalRounds: 0n,
          memberOrder: [],
          remainingTime: 0,
          needsContribution: false,
          nextPayoutTo: zeroAddress,
          userTotalContributed: 0n,
        };
      }

      const status = resolveGroupStatus(groupState.status);
      const memberOrder = [...groupState.memberOrder];
      const payoutIndex = Number(groupState.payoutIndex ?? 0n);
      const nextPayoutTo = memberOrder[payoutIndex] ?? zeroAddress;
      const memberCount = groupState.activeMembers.length;
      const totalRounds = BigInt(memberOrder.length > 0 ? memberOrder.length : Number(groupState.maxMembers));
      const hasContributedThisRound = memberRecord?.[1] ?? false;
      const isActiveMember = memberRecord?.[2] ?? false;

      return {
        groupId,
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
  }, [groupAddresses, groupStateResults, memberResults, userGroupIds]);

  const groupNameByAddress = useMemo(() => {
    return userGroups.reduce<Record<string, string>>((accumulator, group) => {
      accumulator[toReadableAddress(group.groupAddress)] = group.name;
      return accumulator;
    }, {});
  }, [userGroups]);

  const activityQuery = useQuery({
    queryKey: ["dashboard-activity", chainId, accountAddress, groupAddresses],
    enabled: Boolean(accountAddress && publicClient && groupAddresses.length > 0),
    staleTime: 15_000,
    suspense,
    queryFn: async () => {
      if (!publicClient || groupAddresses.length === 0) {
        return [] as ActivityItem[];
      }

      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > 120_000n ? latestBlock - 120_000n : 0n;

      const [contributionLogs, roundLogs, groupCompletedLogs] = await Promise.all([
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event ContributionReceived(address indexed member, uint256 indexed round, uint256 indexed amount)"),
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event RoundCompleted(uint256 indexed round, address indexed recipient, uint256 indexed amount)"),
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: groupAddresses,
          event: parseAbiItem("event GroupCompleted(uint256 indexed totalCycles, uint256 indexed completedAt)"),
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
        groupName: groupNameByAddress[entry.groupAddress] ?? "Savings group",
        timestamp: blockTimestampByNumber[entry.blockNumber.toString()] ?? 0,
      }));
    },
  });

  const activeGroups = userGroups.filter((group) => group.status === "ACTIVE");
  const nextActionGroup = activeGroups.find((group) => group.needsContribution) ?? activeGroups[0];

  return {
    hasFactory,
    userGroups,
    activeGroupCount: activeGroups.length,
    totalSaved: userGroups.reduce((total, group) => total + group.userTotalContributed, 0n),
    cyclesCompleted: cyclesCompletedData ?? 0n,
    nextActionGroup,
    activity: activityQuery.data ?? [],
  };
}
