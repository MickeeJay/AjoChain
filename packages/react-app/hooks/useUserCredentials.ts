"use client";

import { useMemo } from "react";
import { type Address, zeroAddress } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useCredentialContract } from "@/hooks/useCredentialContract";
import { AJO_CREDENTIAL_ABI } from "@/lib/contracts/abis";
import type { UserCredential } from "@/types";

type CredentialRecord = readonly [Address, Address, bigint, bigint, bigint, string];

export function useUserCredentials() {
  const { address } = useAccount();
  const { credentialAddress, chainId, isLoading: isCredentialAddressLoading, error } = useCredentialContract();

  const { data: tokenIdsData, isLoading: isTokenIdsLoading } = useReadContract({
    address: credentialAddress,
    abi: AJO_CREDENTIAL_ABI,
    functionName: "getCredentials",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: Boolean(address && credentialAddress !== zeroAddress),
      staleTime: 15_000,
    },
  });

  const tokenIds = useMemo(() => Array.from(tokenIdsData ?? []), [tokenIdsData]);

  const credentialContracts = useMemo(
    () =>
      tokenIds.map((tokenId) => ({
        address: credentialAddress,
        abi: AJO_CREDENTIAL_ABI,
        functionName: "credentials" as const,
        args: [tokenId],
        chainId,
      })),
    [chainId, credentialAddress, tokenIds],
  );

  const { data: credentialRecords, isLoading: isCredentialRecordsLoading } = useReadContracts({
    contracts: credentialContracts,
    query: {
      enabled: credentialContracts.length > 0,
      staleTime: 15_000,
    },
  });

  const credentials = useMemo<UserCredential[]>(() => {
    return tokenIds
      .map((tokenId, index) => {
        const record = credentialRecords?.[index]?.result as CredentialRecord | undefined;
        if (!record) {
          return null;
        }

        const [recipient, groupContract, cyclesCompleted, totalSaved, completedAt, groupName] = record;
        return {
          tokenId,
          recipient,
          groupContract,
          groupName,
          cyclesCompleted,
          totalSaved,
          completedAt,
        };
      })
      .filter((credential): credential is UserCredential => Boolean(credential))
      .sort((left, right) => Number(right.completedAt - left.completedAt));
  }, [credentialRecords, tokenIds]);

  return {
    credentials,
    isLoading: isCredentialAddressLoading || isTokenIdsLoading || isCredentialRecordsLoading,
    error,
  };
}
