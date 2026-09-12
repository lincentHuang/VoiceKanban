/**
 * Lightweight in-memory rate limiting for API routes.
 *
 * Deliberately dependency-free so the project stays on free hosting tiers: no Redis,
 * no database writes, no extra bill. The trade-off is that counters live inside a single
 * serverless instance, so a burst spread across many cold instances can exceed the limit
 * by a small multiple. That is fine for the goal here — stopping scripted abuse that would
 * otherwise drain the Cloudflare R2 / Gemini quotas — but it is not an accounting-grade quota.
 */

interface Bucket {
  used: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drop expired buckets so a long-lived instance cannot grow without bound. */
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** How much of the allowance is left after this call. */
  remaining: number;
  /** Seconds until the window resets — suitable for a Retry-After header. */
  retryAfterSec: number;
}

/**
 * Consume `amount` from a fixed window bucket. Counting requests means `amount: 1`;
 * counting bytes means passing the payload size. Nothing is consumed when the call
 * would exceed `limit`, so a rejected request does not extend the lockout.
 */
export function consumeQuota(
  key: string,
  limit: number,
  windowMs: number,
  amount: number = 1
): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 5000) sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { used: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  if (bucket.used + amount > limit) {
    return { ok: false, remaining: Math.max(0, limit - bucket.used), retryAfterSec };
  }

  bucket.used += amount;
  return { ok: true, remaining: limit - bucket.used, retryAfterSec };
}

/** Identifies the caller for IP-based limits. Vercel populates x-forwarded-for. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
