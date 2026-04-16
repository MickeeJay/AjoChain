import type { Address } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? ZERO_ADDRESS) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ADDRESS ?? ZERO_ADDRESS) as Address,
  },
  44787: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? ZERO_ADDRESS) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ALFAJORES ?? ZERO_ADDRESS) as Address,
  },
};

export function getContractAddresses(chainId: number) {
  const resolvedChainId = chainId === 42220 || chainId === 44787 ? chainId : 44787;
  return CONTRACT_ADDRESSES[resolvedChainId];
}
