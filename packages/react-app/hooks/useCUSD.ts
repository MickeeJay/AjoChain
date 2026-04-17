"use client";

import type { Address } from "viem";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { IERC20_ABI } from "@/lib/contracts/abis";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const CUSD_ADDRESSES: Record<42220 | 44787, Address> = {
  42220: (process.env.NEXT_PUBLIC_CUSD_ADDRESS ?? ZERO_ADDRESS) as Address,
  44787: (process.env.NEXT_PUBLIC_CUSD_ALFAJORES ?? ZERO_ADDRESS) as Address,
};

type UseCUSDParams = {
  owner?: Address;
  spender?: Address;
  chainId?: 42220 | 44787;
};

export function useCUSD({ owner, spender, chainId }: UseCUSDParams = {}) {
  const { address: connectedAddress, chainId: connectedChainId } = useAccount();
  const resolvedOwner = owner ?? connectedAddress;
  const resolvedChainId = chainId ?? (connectedChainId === 44787 ? 44787 : 42220);
  const tokenAddress = CUSD_ADDRESSES[resolvedChainId];

  const { data: balance } = useBalance({
    address: resolvedOwner,
    token: tokenAddress,
    chainId: resolvedChainId,
    query: {
      enabled: Boolean(resolvedOwner && tokenAddress !== ZERO_ADDRESS),
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: IERC20_ABI,
    functionName: "allowance",
    args: resolvedOwner && spender ? [resolvedOwner, spender] : undefined,
    chainId: resolvedChainId,
    query: {
      enabled: Boolean(resolvedOwner && spender && tokenAddress !== ZERO_ADDRESS),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const approve = async (amount: bigint, spenderOverride?: Address) => {
    const resolvedSpender = spenderOverride ?? spender;

    if (!spender) {
      throw new Error("Spender address is not configured.");
    }

    if (tokenAddress === ZERO_ADDRESS) {
      throw new Error("cUSD address is not configured.");
    }

    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: IERC20_ABI,
      functionName: "approve",
      args: [resolvedSpender, amount],
    });

    void refetchAllowance();

    return hash;
  };

  return {
    balance,
    allowance,
    approve,
    isApproving: isPending,
    tokenAddress,
    chainId: resolvedChainId,
    isConfigured: tokenAddress !== ZERO_ADDRESS,
    refetchAllowance,
  };
}
