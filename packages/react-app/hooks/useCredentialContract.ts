"use client";

import { useMemo } from "react";
import { type Address, zeroAddress } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { AJO_FACTORY_ABI } from "@/lib/contracts/abis";
import { addresses } from "@/lib/contracts/addresses";

function resolveNetworkId(chainId: number | undefined): 42220 | 44787 {
  return chainId === 44787 ? 44787 : 42220;
}

export function useCredentialContract() {
  const chainId = useChainId();
  const networkId = resolveNetworkId(chainId);
  const factoryAddress = addresses[networkId].factory;

  const { data: credentialFromFactory, isLoading, error } = useReadContract({
    address: factoryAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "credentialContract",
    chainId,
    query: {
      enabled: factoryAddress !== zeroAddress,
      staleTime: 15_000,
    },
  });

  const credentialAddress = useMemo(() => {
    if (credentialFromFactory && credentialFromFactory !== zeroAddress) {
      return credentialFromFactory as Address;
    }

    return addresses[networkId].credential;
  }, [credentialFromFactory, networkId]);

  return {
    credentialAddress,
    chainId,
    isLoading,
    error,
  };
}
