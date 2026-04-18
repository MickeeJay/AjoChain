import type { ContractAddresses, NetworkId, NetworkConfig } from "@/types";
import { zeroAddress } from "viem";

export const addresses = {
  42220: {
    factory: zeroAddress,
    credential: zeroAddress,
    cUSD: zeroAddress,
  },
  44787: {
    factory: zeroAddress,
    credential: zeroAddress,
    cUSD: zeroAddress,
  },
} satisfies Record<NetworkId, ContractAddresses>;

export const contractAddresses = addresses;

export const networkConfigs = {
  42220: {
    chainId: 42220,
    name: "Celo",
    addresses: addresses[42220],
  },
  44787: {
    chainId: 44787,
    name: "Alfajores",
    addresses: addresses[44787],
  },
} satisfies Record<NetworkId, NetworkConfig>;
