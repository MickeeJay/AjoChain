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

  // Derive user label (prefer email, fallback to wallet address, fallback to user id)
  let userLabel = "Signed in";
  if (user) {
    if (user.email?.address) {
      userLabel = user.email.address;
    } else if (user.wallet?.address) {
      const addr = user.wallet.address;
      userLabel = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
    logout,
  };
}
