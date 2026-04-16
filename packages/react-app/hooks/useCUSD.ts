"use client";

import { formatUnits, parseUnits } from "viem";

const CUSD_DECIMALS = 18;

export function useCUSD() {
  const formatCUSD = (amount: bigint) => `${formatUnits(amount, CUSD_DECIMALS)} cUSD`;
  const parseCUSD = (amount: string) => parseUnits(amount || "0", CUSD_DECIMALS);

  return {
    formatCUSD,
    parseCUSD,
    symbol: "cUSD",
    decimals: CUSD_DECIMALS,
  };
}
