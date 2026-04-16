import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string) {
  if (!address) {
    return "0x0000...0000";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
