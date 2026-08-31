import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Shared secret guard for the Northbeam backfill endpoints.
 *
 * The WordPress backfill plugin authenticates with an `X-API-Key` header
 * carrying NORTHBEAM_SYNC_API_KEY. The Next.js routes historically accepted the
 * header without ever validating it, which left /api/northbeam/backfill and
 * /api/northbeam/backfill-auto writable by anyone on the internet.
 *
 * Behaviour matches the CRON_SECRET handling in
 * app/api/northbeam/auto-retry/route.js: when the secret is not configured the
 * route rejects every request rather than falling open.
 *
 * Escape hatch: set NORTHBEAM_SYNC_AUTH_MODE=observe to log the outcome of each
 * check without rejecting anything. That mode is for confirming the plugin is
 * sending a matching key before enforcement is switched on, and doubles as an
 * instant rollback that does not need a revert deploy.
 */

const OBSERVE_MODE = "observe";

function digest(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

/**
 * Constant-time comparison. Both sides are hashed first so that operands are
 * always the same length and the comparison never leaks the secret's length.
 */
function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  return timingSafeEqual(digest(provided), digest(expected));
}

/**
 * @param {Request} req
 * @param {string} routeLabel used only in logs
 * @param {{ log: Function, warn: Function, error: Function }} log
 * @returns {NextResponse|null} a response to short-circuit with, or null when
 *   the request is allowed to proceed
 */
export function requireSyncApiKey(req, routeLabel, log) {
  const observeOnly =
    String(process.env.NORTHBEAM_SYNC_AUTH_MODE || "").toLowerCase() ===
    OBSERVE_MODE;
  const expected = process.env.NORTHBEAM_SYNC_API_KEY;
  const provided = req.headers.get("x-api-key");

  if (!expected) {
    log.error(
      `[${routeLabel}] NORTHBEAM_SYNC_API_KEY not configured, rejecting request for security`
    );
    if (observeOnly) {
      log.warn(
        `[${routeLabel}] observe mode: allowing an unauthenticated request through`
      );
      return null;
    }
    return NextResponse.json(
      { error: "Unauthorized - NORTHBEAM_SYNC_API_KEY must be configured" },
      { status: 401 }
    );
  }

  if (!secretsMatch(provided, expected)) {
    log.error(
      `[${routeLabel}] Rejected request: ${
        provided ? "X-API-Key did not match" : "no X-API-Key header"
      }`
    );
    if (observeOnly) {
      log.warn(
        `[${routeLabel}] observe mode: allowing a request through that would have been rejected`
      );
      return null;
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
