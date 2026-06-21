"use client";

import { usePrivy } from "@privy-io/react-auth";

export function useAuthStatus() {
  const { ready, authenticated, user, logout } = usePrivy();

  const isSignedIn = authenticated;
  const status = !ready
    ? "loading"
    : authenticated
    ? "authenticated"
    : "unauthenticated";

  // Derive the embedded wallet address from Privy user object
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;

  // Derive user display label (prefer email, fallback to truncated wallet, fallback to user id)
  let userLabel = "Signed in";
  if (user) {
    if (user.email?.address) {
      userLabel = user.email.address;
    } else if (walletAddress) {
      userLabel = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    } else {
      userLabel = user.id.slice(0, 10);
    }
  }

  // Derive user image (we can use a placeholder or null)
  const userImage = null;

  return {
    ready,
    user,
    status,
    isSignedIn,
    userLabel,
    userImage,
    walletAddress,
    logout,
  };
}
