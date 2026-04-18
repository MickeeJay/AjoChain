"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { type Address, type Hash, type TransactionReceipt, zeroAddress } from "viem";
import { AJO_GROUP_ABI, IERC20_ABI } from "@/lib/contracts/abis";
import type { GroupState, GroupStatus, MemberInfo } from "@/types";

type ReceiptResolver = {
  resolve: (value: TransactionReceipt) => void;
  reject: (reason: Error) => void;
};

const GROUP_STATUSES: GroupStatus[] = ["FORMING", "ACTIVE", "COMPLETED", "PAUSED"];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected contract error occurred.";
}

function toGroupStatus(status: bigint | number): GroupStatus {
  const resolvedStatus = GROUP_STATUSES[Number(status)];
  return resolvedStatus ?? "FORMING";
}

function toMemberInfo(wallet: Address): MemberInfo {
  return {
    wallet,
    isActive: true,
  };
}

function toLoadedMemberInfo(
  wallet: Address,
  memberRecord:
    | {
        result?: readonly [Address, boolean, boolean, bigint, bigint] | undefined;
      }
    | undefined,
): MemberInfo {
  if (!memberRecord?.result) {
    return toMemberInfo(wallet);
  }

  const [recordedWallet, hasContributedThisRound, isActive, totalContributed, roundsCompleted] = memberRecord.result;

  return {
    wallet: recordedWallet,
    hasContributedThisRound,
    isActive,
    totalContributed,
    roundsCompleted,
  };
}

export function useAjoGroup(groupAddress: `0x${string}`) {
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [approveHash, setApproveHash] = useState<Hash | undefined>();
  const [contributeHash, setContributeHash] = useState<Hash | undefined>();
  const [startHash, setStartHash] = useState<Hash | undefined>();
  const [pendingAction, setPendingAction] = useState<"contribute" | "start" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const approveResolverRef = useRef<ReceiptResolver | null>(null);
  const contributeResolverRef = useRef<ReceiptResolver | null>(null);
  const startResolverRef = useRef<ReceiptResolver | null>(null);

  const {
    data: groupStateData,
    refetch: refetchGroupState,
    error: groupStateError,
  } = useReadContract({
    address: groupAddress,
    abi: AJO_GROUP_ABI,
    functionName: "getGroupState",
    chainId,
    query: {
      enabled: Boolean(groupAddress),
      staleTime: 10_000,
    },
  });

  const tokenAddress = groupStateData?.cUSDToken ?? zeroAddress;
  const contributionAmount = groupStateData?.contributionAmount ?? 0n;

  const {
    data: allowanceData,
    refetch: refetchAllowance,
    error: allowanceError,
  } = useReadContract({
    address: tokenAddress,
    abi: IERC20_ABI,
    functionName: "allowance",
    args: accountAddress ? [accountAddress, groupAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(accountAddress && groupStateData?.cUSDToken && tokenAddress !== zeroAddress),
      staleTime: 10_000,
    },
  });

  const memberContracts = useMemo(
    () =>
      (groupStateData?.activeMembers ?? []).map((memberAddress) => ({
        address: groupAddress,
        abi: AJO_GROUP_ABI,
        functionName: "members" as const,
        args: [memberAddress],
        chainId,
      })),
    [chainId, groupAddress, groupStateData?.activeMembers],
  );

  const { data: memberDetails } = useReadContracts({
    contracts: memberContracts,
    query: {
      enabled: memberContracts.length > 0,
      staleTime: 10_000,
    },
  });

  const approveReceipt = useWaitForTransactionReceipt({
    hash: approveHash,
    chainId,
    query: {
      enabled: Boolean(approveHash),
      staleTime: 10_000,
    },
  });

  const contributeReceipt = useWaitForTransactionReceipt({
    hash: contributeHash,
    chainId,
    query: {
      enabled: Boolean(contributeHash),
      staleTime: 10_000,
    },
  });

  const startReceipt = useWaitForTransactionReceipt({
    hash: startHash,
    chainId,
    query: {
      enabled: Boolean(startHash),
      staleTime: 10_000,
    },
  });

  useEffect(() => {
    if (!approveReceipt.data || !approveResolverRef.current) {
      return;
    }

    approveResolverRef.current.resolve(approveReceipt.data);
    approveResolverRef.current = null;
    setApproveHash(undefined);
  }, [approveReceipt.data]);

  useEffect(() => {
    if (!contributeReceipt.data || !contributeResolverRef.current) {
      return;
    }

    contributeResolverRef.current.resolve(contributeReceipt.data);
    contributeResolverRef.current = null;
    setContributeHash(undefined);
  }, [contributeReceipt.data]);

  useEffect(() => {
    if (!startReceipt.data || !startResolverRef.current) {
      return;
    }

    startResolverRef.current.resolve(startReceipt.data);
    startResolverRef.current = null;
    setStartHash(undefined);
  }, [startReceipt.data]);

  useEffect(() => {
    if (!approveReceipt.error || !approveResolverRef.current) {
      return;
    }

    approveResolverRef.current.reject(new Error(getErrorMessage(approveReceipt.error)));
    approveResolverRef.current = null;
    setApproveHash(undefined);
  }, [approveReceipt.error]);

  useEffect(() => {
    if (!contributeReceipt.error || !contributeResolverRef.current) {
      return;
    }

    contributeResolverRef.current.reject(new Error(getErrorMessage(contributeReceipt.error)));
    contributeResolverRef.current = null;
    setContributeHash(undefined);
  }, [contributeReceipt.error]);

  useEffect(() => {
    if (!startReceipt.error || !startResolverRef.current) {
      return;
    }

    startResolverRef.current.reject(new Error(getErrorMessage(startReceipt.error)));
    startResolverRef.current = null;
    setStartHash(undefined);
  }, [startReceipt.error]);

  const groupState: GroupState | undefined = useMemo(() => {
    if (!groupStateData) {
      return undefined;
    }

    return {
      name: groupStateData.name,
      contributionAmount: groupStateData.contributionAmount,
      frequencyInDays: groupStateData.frequencyInDays,
      maxMembers: groupStateData.maxMembers,
      currentRound: groupStateData.currentRound,
      roundStartTime: groupStateData.roundStartTime,
      payoutIndex: groupStateData.payoutIndex,
      status: toGroupStatus(groupStateData.status),
      members: groupStateData.activeMembers.map((wallet, index) => toLoadedMemberInfo(wallet, memberDetails?.[index])),
      memberOrder: [...groupStateData.memberOrder],
      inviteCode: groupStateData.inviteCode,
      remainingTime: Number(groupStateData.remainingTime ?? 0n),
      factory: groupStateData.factory,
      creator: groupStateData.creator,
      cUSDToken: groupStateData.cUSDToken,
      pauseSupportVotes: groupStateData.pauseSupportVotes,
      pauseOppositionVotes: groupStateData.pauseOppositionVotes,
    };
  }, [groupStateData, memberDetails]);

  const getRemainingTime = () => groupState?.remainingTime ?? 0;

  const contribute = async () => {
    if (!accountAddress) {
      throw new Error("Connect a wallet before contributing.");
    }

    if (!groupStateData) {
      throw new Error("Group state is not ready yet.");
    }

    try {
      setPendingAction("contribute");
      const currentAllowance = allowanceData ?? 0n;

      if (currentAllowance < contributionAmount) {
        const approveTxHash = await writeContractAsync({
          address: tokenAddress,
          abi: IERC20_ABI,
          functionName: "approve",
          args: [groupAddress, contributionAmount],
          chainId,
        });

        setApproveHash(approveTxHash);

        await new Promise<TransactionReceipt>((resolve, reject) => {
          approveResolverRef.current = { resolve, reject };
        });

        void refetchAllowance();
      }

      const contributeTxHash = await writeContractAsync({
        address: groupAddress,
        abi: AJO_GROUP_ABI,
        functionName: "contribute",
        chainId,
      });

      setContributeHash(contributeTxHash);

      await new Promise<TransactionReceipt>((resolve, reject) => {
        contributeResolverRef.current = { resolve, reject };
      });

      void refetchGroupState();
      void refetchAllowance();
      setActionError(null);
      setPendingAction(null);

      return contributeTxHash;
    } catch (error) {
      setPendingAction(null);
      const message = getErrorMessage(error);
      setActionError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  const startGroup = async () => {
    if (!accountAddress) {
      throw new Error("Connect a wallet before starting the group.");
    }

    if (groupStateData?.creator && groupStateData.creator !== accountAddress) {
      throw new Error("Only the group creator can start the group.");
    }

    try {
      setPendingAction("start");
      const startTxHash = await writeContractAsync({
        address: groupAddress,
        abi: AJO_GROUP_ABI,
        functionName: "startGroup",
        chainId,
      });

      setStartHash(startTxHash);

      await new Promise<TransactionReceipt>((resolve, reject) => {
        startResolverRef.current = { resolve, reject };
      });

      void refetchGroupState();
      setActionError(null);
      setPendingAction(null);

      return startTxHash;
    } catch (error) {
      setPendingAction(null);
      const message = getErrorMessage(error);
      setActionError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  return {
    groupState,
    getRemainingTime,
    contribute,
    startGroup,
    isContributing: pendingAction === "contribute" || approveReceipt.isLoading || contributeReceipt.isLoading || Boolean(approveHash || contributeHash),
    isStarting: pendingAction === "start" || startReceipt.isLoading || Boolean(startHash),
    error: actionError ?? groupStateError?.message ?? allowanceError?.message ?? null,
  };
}
