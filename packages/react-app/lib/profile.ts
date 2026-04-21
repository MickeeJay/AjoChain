import { formatUnits } from "viem";

export function getReputationTierLabel(score: bigint) {
  if (score <= 2n) {
    return "New Saver";
  }

  if (score <= 5n) {
    return "Trusted Member";
  }

  return "Master Saver";
}

export function formatCredentialCompletionDate(timestamp: bigint) {
  if (timestamp <= 0n) {
    return "Unknown";
  }

  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCusdCurrency(value: bigint) {
  const amount = Number(formatUnits(value, 18));

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
