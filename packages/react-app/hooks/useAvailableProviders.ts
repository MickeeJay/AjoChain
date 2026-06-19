"use client";

import { useEffect, useState } from "react";
import { getProviders } from "next-auth/react";

type ProviderId = string;

/**
 * Fetches the list of configured NextAuth providers at runtime.
 * Returns a Set of provider IDs (e.g. "google", "twitter").
 */
export function useAvailableProviders() {
  const [providerIds, setProviderIds] = useState<Set<ProviderId>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProviders().then((result) => {
      if (cancelled) return;
      setProviderIds(new Set(result ? Object.keys(result) : []));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { providerIds, isLoading };
}
