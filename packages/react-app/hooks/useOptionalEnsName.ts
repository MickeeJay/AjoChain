"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";

export function useOptionalEnsName(address: Address | undefined) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ["optional-ens-name", publicClient?.chain?.id, address],
    enabled: Boolean(publicClient && address),
    staleTime: 60_000,
    queryFn: async () => {
      if (!publicClient || !address) {
        return null;
      }

      try {
        return await publicClient.getEnsName({ address });
      } catch {
        return null;
      }
    },
  });

  return {
    ensName: query.data ?? null,
    isLoading: query.isLoading,
  };
}
