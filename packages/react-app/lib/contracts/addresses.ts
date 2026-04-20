import type { ContractAddresses, NetworkId, NetworkConfig } from "@/types";
import { isAddress, zeroAddress } from "viem";

function resolveAddress(rawAddress: string | undefined): `0x${string}` {
  if (!rawAddress || !isAddress(rawAddress)) {
    return zeroAddress;
  }

  return rawAddress;
}

const mainnetFactoryAddress = resolveAddress(process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS);
const mainnetCredentialAddress = resolveAddress(process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS);
const mainnetCusdAddress = resolveAddress(process.env.NEXT_PUBLIC_CUSD_ADDRESS);

const alfajoresFactoryAddress = resolveAddress(
  process.env.NEXT_PUBLIC_FACTORY_ALFAJORES_CONTRACT_ADDRESS ?? process.env.NEXT_PUBLIC_FACTORY_TESTNET_CONTRACT_ADDRESS,
);
const alfajoresCredentialAddress = resolveAddress(
  process.env.NEXT_PUBLIC_CREDENTIAL_ALFAJORES_CONTRACT_ADDRESS ?? process.env.NEXT_PUBLIC_CREDENTIAL_TESTNET_CONTRACT_ADDRESS,
);
const alfajoresCusdAddress = resolveAddress(process.env.NEXT_PUBLIC_CUSD_ALFAJORES);

export const addresses = {
  42220: {
    factory: mainnetFactoryAddress,
    credential: mainnetCredentialAddress,
    cUSD: mainnetCusdAddress,
  },
  44787: {
    factory: alfajoresFactoryAddress,
    credential: alfajoresCredentialAddress,
    cUSD: alfajoresCusdAddress,
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
