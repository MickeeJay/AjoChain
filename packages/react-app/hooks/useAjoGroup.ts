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
  const { data: currentCycle } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "currentCycle",
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
  const { data: isCompleted } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isCompleted",
    query: { enabled },
  });

  const joinGroup = async () => {
    if (!enabled) {
      throw new Error("Group contract is not configured.");
    }

    return writeContractAsync({
      address: groupAddress as Address,
      abi: groupAbi as Abi,
      functionName: "joinGroup",
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

  return {
    memberCount,
    currentCycle,
    canExecutePayout,
    currentPayoutRecipient,
    isCompleted,
    joinGroup,
    contribute,
    executePayout,
    isPending,
  };
}
