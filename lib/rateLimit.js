import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/utils/devLogger";

// Shared Upstash Redis client — built only when credentials are present. If the
// store is not provisioned (local dev / preview without env vars) we FAIL OPEN:
// every check returns success so auth keeps working and legitimate users are
// never blocked. Throttling activates automatically once the env vars are set.
// Accepts either the plain names or the Vercel/Upstash integration names.
const UPSTASH_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const UPSTASH_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

const redis =
  UPSTASH_URL && UPSTASH_TOKEN
    ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
    : null;

// Sliding-window limiter, or null when Redis is absent (fail-open).
const make = (limit, window, prefix) =>
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        analytics: true,
        prefix: `rl:${prefix}`,
      })
    : null;

// Per-endpoint limiters (TK-441). Throttle by IP and by identifier.
export const limiters = {
  loginEmail: make(5, "1 m", "login:email"),
  loginIp: make(20, "1 m", "login:ip"),
  registerIp: make(20, "1 h", "register:ip"),
  pwEmail: make(3, "1 h", "pw:email"),
  pwIp: make(10, "1 h", "pw:ip"),
};

// Best-effort client IP from standard proxy headers (Vercel sets these).
export function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Normalize an identifier so "A@X.com " and "a@x.com" share one bucket.
export function normalizeId(value) {
  return (value ?? "").toString().trim().toLowerCase() || "anonymous";
}

/**
 * Run one or more limiters. `checks` is an array of [limiter, key] pairs.
 * Fails open when a limiter is null (store not configured) or errors.
 * Returns { ok, retryAfter } — retryAfter is seconds until the tightest reset.
 * `route` is logged (no PII) so 429 spikes are visible in telemetry.
 */
export async function checkLimits(checks, route) {
  let retryAfter = 0;
  for (const [limiter, key] of checks) {
    if (!limiter || key == null) continue;
    try {
      const res = await limiter.limit(String(key));
      if (!res.success) {
        const secs = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
        if (secs > retryAfter) retryAfter = secs;
      }
    } catch (err) {
      // Never let the limiter take down auth — log and allow.
      logger.error("Rate limiter error:", err?.message);
    }
  }
  if (retryAfter > 0) {
    logger.warn(`[rate-limit] 429 route=${route} retryAfter=${retryAfter}s`);
    return { ok: false, retryAfter };
  }
  return { ok: true, retryAfter: 0 };
}

// Standard 429 response with a Retry-After header (seconds).
export function tooManyRequests(retryAfter) {
  return NextResponse.json(
    {
      success: false,
      error: "Too many attempts. Please wait a moment and try again.",
      message: "Too many attempts. Please wait a moment and try again.",
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
