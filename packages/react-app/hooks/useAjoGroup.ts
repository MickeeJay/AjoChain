"use client";

import type { Abi, Address } from "viem";
import { useReadContract, useWriteContract } from "wagmi";

type UseAjoGroupParams = {
  groupAddress?: Address;
  groupAbi?: Abi;
};

export function useAjoGroup({ groupAddress, groupAbi }: UseAjoGroupParams) {
  const enabled = Boolean(groupAddress && groupAbi);
  const contractAddress = (groupAddress ?? "0x0000000000000000000000000000000000000000") as Address;
  const contractAbi = (groupAbi ?? []) as Abi;
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: memberCount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "memberCount",
    query: { enabled },
  });
  const { data: currentRound } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "currentRound",
    query: { enabled },
  });
  const { data: canExecutePayout } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "canExecutePayout",
    query: { enabled },
  });
  const { data: currentPayoutRecipient } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "currentPayoutRecipient",
    query: { enabled },
  });
  const { data: status } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "status",
    query: { enabled },
  });
  const { data: isCompleted } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isCompleted",
    query: { enabled },
  });
  const { data: remainingTime } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getRemainingTime",
    query: { enabled },
  });

  const startGroup = async () => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "startGroup",
    });
  };

  const contribute = async () => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "contribute",
    });
  };

  const executePayout = async () => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "executePayout",
    });
  };

  const pauseRound = async (pause: boolean) => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "pauseRound",
      args: [pause],
    });
  };

  const voteOnPause = async (pause: boolean) => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "voteOnPause",
      args: [pause],
    });
  };

  const emergencyExit = async () => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "emergencyExit",
    });
  };

  return {
    memberCount,
    currentRound,
    currentCycle: currentRound,
    canExecutePayout,
    currentPayoutRecipient,
    status,
    isCompleted,
    remainingTime,
    startGroup,
    contribute,
    executePayout,
    pauseRound,
    voteOnPause,
    emergencyExit,
    isPending,
  };
}
