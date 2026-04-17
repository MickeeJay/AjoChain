"use client";

import type { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const CUSD_ADDRESSES: Record<42220 | 44787, Address> = {
  42220: (process.env.NEXT_PUBLIC_CUSD_ADDRESS ?? ZERO_ADDRESS) as Address,
  44787: (process.env.NEXT_PUBLIC_CUSD_ALFAJORES ?? ZERO_ADDRESS) as Address,
};

type UseCUSDParams = {
  owner?: Address;
  chainId?: 42220 | 44787;
};

export function useCUSD({ owner, chainId }: UseCUSDParams = {}) {
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

  return {
    balance,
    tokenAddress,
    chainId: resolvedChainId,
    isConfigured: tokenAddress !== ZERO_ADDRESS,
  };
}
