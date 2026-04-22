import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "@/app/api/_lib/constants";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    return firstIp.trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function enforceRateLimit(headers: Headers) {
  const key = getClientIp(headers);
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const nextEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };

    rateLimitStore.set(key, nextEntry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: nextEntry.resetAt,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: Math.max(RATE_LIMIT_MAX_REQUESTS - existing.count, 0),
    resetAt: existing.resetAt,
  };
}
