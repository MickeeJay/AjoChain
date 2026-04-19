import { formatUnits } from "viem";

export function formatCusdAmount(formatted?: string) {
  const amount = Number(formatted ?? "0");

  if (!Number.isFinite(amount)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCusdFromWei(amount?: bigint) {
  const normalized = Number(formatUnits(amount ?? 0n, 18));

  if (!Number.isFinite(normalized)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized);
}

export function formatCountdown(secondsLeft: number) {
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = Math.floor(secondsLeft % 60);

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}