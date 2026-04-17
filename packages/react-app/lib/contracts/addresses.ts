import type { NetworkId } from "@/types";
import { zeroAddress } from "viem";

type ContractAddresses = {
  factory: `0x${string}`;
  credential: `0x${string}`;
  cUSD: `0x${string}`;
};

export const contractAddresses = {
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
