/**
 * What actually happened to a backfill send, as opposed to what HTTP said.
 *
 * THE DEFECT THIS EXISTS TO CLOSE, measured rather than theorised.
 *
 * `backfill-auto/route.js` marked an order `_northbeam_backfilled = yes` on
 * `res.ok` alone. But `/api/northbeam/orders` answers **HTTP 200** with a body
 * of `{ success: true, skipped: true, reason }` for four distinct deliberate
 * refusals:
 *
 *   follow-up consultation   the WL manual payment link product (180694)
 *   internal_coupon          a code in NORTHBEAM_EXCLUDED_COUPONS
 *   zero_value_order         what a 100% off internal coupon produces
 *   non_production_environment
 *
 * So an order the route deliberately refused to send was recorded as delivered.
 * `checkIfAlreadySynced()` reads that same marker, so every future run skips the
 * order: the miss is not one a later run recovers, it is one the run itself
 * seals. On one measured Canadian day, 21 paid completed non-renewal orders
 * worth $6,435 are absent from the vendor across an eleven day window, and five
 * of seven sampled carry the marker with a timestamp more than a day old.
 *
 * A success marker must therefore mean one thing only: **the vendor accepted
 * this order**. Three outcomes, and the caller must handle them differently:
 *
 *   ACCEPTED  Northbeam has it. Mark it, stop retrying.
 *   REFUSED   we decided not to send it, on a permanent business rule. Record
 *             that under a key that is not the delivery marker, so it is never
 *             read as delivery and never silently retried forever either.
 *   FAILED    something went wrong. Do NOT mark. Stay retryable.
 *
 * The distinction that matters is REFUSED versus ACCEPTED. Collapsing them is
 * the bug; collapsing REFUSED into FAILED would merely be wasteful.
 */

export const NB_SYNC_OUTCOME = {
  ACCEPTED: "accepted",
  REFUSED: "refused",
  FAILED: "failed",
};

/** Meta keys. The delivery marker is unchanged; the refusal keys are new. */
export const NB_SYNC_META = {
  DELIVERED: "_northbeam_backfilled",
  DELIVERED_AT: "_northbeam_backfilled_at",
  REFUSED: "_northbeam_backfill_refused",
  REFUSED_REASON: "_northbeam_backfill_refused_reason",
  REFUSED_AT: "_northbeam_backfill_refused_at",
  LAST_ATTEMPT: "_northbeam_last_backfill_attempt",
  ATTEMPTS: "_northbeam_backfill_attempts",
};

/**
 * Classify one response from the internal `/api/northbeam/orders` call.
 *
 * @param {object} args
 * @param {boolean} args.ok  the fetch Response.ok
 * @param {number} [args.status] the HTTP status
 * @param {object|null} [args.body] the parsed JSON body, or null if unparseable
 * @returns {{ outcome: string, reason: string }}
 */
export function classifySyncResponse({ ok, status = 0, body = null } = {}) {
  if (!ok) {
    return { outcome: NB_SYNC_OUTCOME.FAILED, reason: `http_${status || "error"}` };
  }

  // A 200 whose body could not be parsed is NOT proof of delivery. The route
  // always answers JSON on the success path, so an unreadable body means
  // something unexpected sat in front of it.
  if (!body || typeof body !== "object") {
    return { outcome: NB_SYNC_OUTCOME.FAILED, reason: "unreadable_response_body" };
  }

  if (body.skipped === true) {
    return {
      outcome: NB_SYNC_OUTCOME.REFUSED,
      reason: String(body.reason || "skipped"),
    };
  }

  // The route sets success:true on both the delivered and the skipped paths, so
  // success alone proves nothing; it is the absence of `skipped` above that
  // does. Requiring it explicitly still guards against a future shape that
  // reports failure inside a 200.
  if (body.success === true) {
    return { outcome: NB_SYNC_OUTCOME.ACCEPTED, reason: "" };
  }

  return { outcome: NB_SYNC_OUTCOME.FAILED, reason: "no_success_flag" };
}

/**
 * The meta WooCommerce should carry after a send, given its outcome.
 *
 * Returns null for FAILED: a failed send writes no state beyond the attempt
 * counter the caller already maintains, which is what keeps it retryable.
 *
 * @param {{outcome: string, reason: string}} classified
 * @param {string} timestamp ISO instant, injected so it is testable
 * @returns {Array<{key: string, value: string}>|null}
 */
export function syncOutcomeMeta(classified, timestamp) {
  const stamp = String(timestamp || new Date().toISOString());

  if (classified?.outcome === NB_SYNC_OUTCOME.ACCEPTED) {
    return [
      { key: NB_SYNC_META.DELIVERED, value: "yes" },
      { key: NB_SYNC_META.DELIVERED_AT, value: stamp },
      { key: NB_SYNC_META.LAST_ATTEMPT, value: stamp },
    ];
  }

  if (classified?.outcome === NB_SYNC_OUTCOME.REFUSED) {
    // Deliberately NOT the delivery marker. This order was never sent, and a
    // later reader must be able to tell the difference between "Northbeam has
    // it" and "we chose not to send it". The reason is recorded because the
    // four refusal reasons need different follow-up: an internal coupon is
    // correct and final, a non-production environment is a deployment fact.
    return [
      { key: NB_SYNC_META.REFUSED, value: "yes" },
      { key: NB_SYNC_META.REFUSED_REASON, value: String(classified.reason || "skipped") },
      { key: NB_SYNC_META.REFUSED_AT, value: stamp },
      { key: NB_SYNC_META.LAST_ATTEMPT, value: stamp },
    ];
  }

  return null;
}
