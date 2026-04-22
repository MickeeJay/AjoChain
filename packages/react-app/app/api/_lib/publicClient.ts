import { createPublicClient, http, isAddress, zeroAddress } from "viem";
import { celoAlfajores, celoMainnet } from "@/lib/celo";
import { addresses } from "@/lib/contracts/addresses";

type SupportedChainId = 42220 | 44787;

export function resolveApiChainId(): SupportedChainId {
  return process.env.NEXT_PUBLIC_CELO_CHAIN_ID === "44787" ? 44787 : 42220;
}

export function createCeloPublicClient() {
  const chainId = resolveApiChainId();
  const chain = chainId === 44787 ? celoAlfajores : celoMainnet;

  const client = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });

  return { chainId, client };
}

export function resolveFactoryAddress() {
  const chainId = resolveApiChainId();
  const factoryAddress = addresses[chainId].factory;

  if (!isAddress(factoryAddress) || factoryAddress === zeroAddress) {
    return null;
  }

  return factoryAddress;
}
