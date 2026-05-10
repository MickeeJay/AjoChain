"use client";

import { useSession } from "next-auth/react";

export function useAuthStatus() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const userLabel = session?.user?.name ?? session?.user?.email ?? "Signed in";

  return {
    session,
    status,
    isSignedIn,
    userLabel,
  };
}
