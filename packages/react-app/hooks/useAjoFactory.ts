"use client";

import type { Abi, Address } from "viem";
import { useReadContract, useWriteContract } from "wagmi";

type UseAjoFactoryParams = {
  factoryAddress?: Address;
  factoryAbi?: Abi;
};

export function useAjoFactory({ factoryAddress, factoryAbi }: UseAjoFactoryParams) {
  const enabled = Boolean(factoryAddress && factoryAbi);
  const { data: totalGroups } = useReadContract({
    address: (factoryAddress ?? "0x0000000000000000000000000000000000000000") as Address,
    abi: (factoryAbi ?? []) as Abi,
    functionName: "totalGroups",
    query: { enabled },
  });
  const { writeContractAsync, isPending } = useWriteContract();

  const createGroup = async (args: {
    name: string;
    token: Address;
    contributionAmount: bigint;
    maxMembers: bigint;
    cycleDuration: bigint;
  }) => {
    if (!enabled) {
      throw new Error("Factory contract is not configured.");
    }

    return writeContractAsync({
      address: factoryAddress as Address,
      abi: factoryAbi as Abi,
      functionName: "createGroup",
      args: [args.name, args.token, args.contributionAmount, args.maxMembers, args.cycleDuration],
    });
  };

  return {
    totalGroups,
    createGroup,
    isPending,
  };
}
