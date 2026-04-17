import type { Address } from "viem";

export const DEPLOYED_CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: "0xAb672F162220ebB17B82bBcf8823Cd0f141515b9",
    cusd: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  },
  44787: {
    factory: "0x0000000000000000000000000000000000000000",
    cusd: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
  },
};

export const CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[42220].factory) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[42220].cusd) as Address,
  },
  44787: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[44787].factory) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ALFAJORES ?? DEPLOYED_CONTRACT_ADDRESSES[44787].cusd) as Address,
  },
};

export function getContractAddresses(chainId: number) {
  const resolvedChainId = chainId === 42220 || chainId === 44787 ? chainId : 44787;
  return CONTRACT_ADDRESSES[resolvedChainId];
}
