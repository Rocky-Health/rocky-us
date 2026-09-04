/**
 * WHICH ORDERS THE BACKFILL IS ALLOWED TO LOOK AT, NOW THAT IT IS AN AUDITOR.
 *
 * TK-1027 made the WordPress Relay the single canonical writer. This module is
 * what stops the backfill competing with it.
 *
 * THE PROBLEM THIS EXISTS TO PREVENT
 *
 * The backfill selects completed orders that carry no sync meta and pushes them
 * to Northbeam. Before the cutover that was the only server-side writer for a
 * whole class of orders, so it had to push. After the cutover it is a second
 * writer aimed at the same rows, and Northbeam's upsert is last-write-wins, so
 * every push it makes can only overwrite something the canonical writer already
 * got right.
 *
 * Demoting it to an auditor means it reports gaps rather than filling them by
 * default. But an auditor pointed at all of history is worse than useless: on
 * its first run it would report every order the Relay never sent because the
 * Relay's purchase path had never run, which is most of a year of orders. That
 * is an alert nobody reads by the second day, and a muted alert is the same as
 * no alert.
 *
 * THE HARD CUTOFF
 *
 * So the auditor only examines orders from the canonical era: those paid at or
 * after the instant this region's canonical writer went live. Before that
 * instant the Relay was not the writer and its silence proves nothing, so a
 * missing order there is not a gap the auditor can reason about. Those orders
 * belong to the historical reconciliation on TK-1031, which owns mutation of
 * the vendor account and is not authorised to run yet.
 *
 * Consequence, stated so it is a known limit rather than a surprise: for the
 * first day after cutover the auditor legitimately reports nothing, because no
 * order is old enough to have settled. That is correct, not broken.
 *
 * THE 365 DAY BLIND SPOT
 *
 * The lookback is one year and always has been. Anything older than that is
 * never examined, before or after this change, so the auditor cannot report
 * clean on it and never claims to. Today the cutover is far more recent than a
 * year, so the cutover is the binding constraint and the lookback is dormant.
 * It becomes binding again a year after cutover, at which point the auditor's
 * coverage silently starts at now minus 365 days. Left in deliberately, because
 * an unbounded query against a table this size is its own outage.
 *
 * THE DAY ANCHOR IS THE PAID INSTANT
 *
 * `date_paid_gmt`, matching the canonical writer and the TK-1032 reconciliation
 * cohort. The vendor keys the day on payment: 71 of 75 sampled records that fall
 * outside their creation day match `date_paid_gmt`, 63 of them to the second.
 * Creation time is deliberately NOT used as a fallback to make an order fit a
 * window. An order that qualifies on every other count but carries no usable
 * paid instant is reported as an anomaly under its own reason, never quietly
 * re-anchored onto its creation day and never pushed.
 */

/**
 * The instant this region's canonical writer went live, measured at promotion
 * rather than estimated.
 *
 * UNITED STATES. This storefront went canonical at 16:18:22Z, but the US Relay
 * did not land until 17:48:02Z, and the Relay is the canonical writer. So the
 * US boundary is the LATER of the two. Orders paid in the hour and a half
 * between them carry a mixed picture: this storefront on the new taxonomy, the
 * Relay still on the old single tag payload. Treating them as canonical would
 * mean auditing an era in which the writer being audited was not yet running.
 *
 * The Canadian boundary is 2026-09-04T16:18:36Z and is NOT interchangeable with
 * this one. Canada had no equivalent gap beyond about three minutes, because its
 * Relay landed first. Each repository carries only its own region's instant.
 */
export const NB_CANONICAL_CUTOVER_ISO = "2026-09-04T17:48:02Z";

/**
 * Hours an order is given to settle before the auditor will call it a gap.
 *
 * NOT arbitrary. The Relay enqueues its push as a background action and retries
 * with a backoff ladder reaching six hours, so an order that has not arrived at
 * the vendor yet may still be legitimately in flight. Reporting inside that
 * ladder would generate false gaps for orders that go on to deliver themselves,
 * which is the fastest way to teach everyone to ignore the report.
 *
 * Twenty four hours is four times the longest retry, and it is well inside the
 * hourly cadence the ticket asks for: a gap becomes visible on the first run
 * after the order settles, not a week later.
 *
 * The previous value was seven DAYS, inherited from the era when the backfill
 * was the writer and needed to stay clear of the browser fire. An auditor that
 * takes a week to notice a missing order is not an auditor.
 */
export const NB_AUDIT_SETTLE_HOURS = 24;

/** The permanent lookback ceiling. See the blind spot note above. */
export const NB_AUDIT_LOOKBACK_DAYS = 365;

/** What the auditor may do with the orders it selects. */
export const NB_AUDIT_MODE = {
  /** Report gaps. Write nothing to the vendor. The default. */
  AUDIT: "audit",
  /** Push true gaps through the canonical payload path. Opt in only. */
  REPAIR: "repair",
};

/** Why an order is not eligible for audit. */
export const NB_AUDIT_INELIGIBLE = {
  PRE_CUTOVER: "pre_cutover",
  BEYOND_LOOKBACK: "beyond_lookback",
  NOT_SETTLED: "not_settled",
  NO_PAID_DATE: "no_paid_date",
};

/**
 * Resolve the cutover instant, in epoch milliseconds.
 *
 * `NORTHBEAM_CANONICAL_CUTOVER` overrides it so the window can be tested and so
 * a corrected measurement does not need a code change. An unparseable override
 * falls back to the measured constant rather than to zero: falling back to zero
 * would silently open the auditor onto all of history, which is precisely the
 * failure this module exists to prevent.
 *
 * @returns {number} epoch ms
 */
export function canonicalCutoverMs() {
  const override = process.env.NORTHBEAM_CANONICAL_CUTOVER;
  if (override) {
    const parsed = Date.parse(override);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.parse(NB_CANONICAL_CUTOVER_ISO);
}

/** @returns {number} the settle window in ms, from env or the default. */
export function auditSettleMs() {
  const raw = Number(process.env.NORTHBEAM_AUDIT_SETTLE_HOURS);
  const hours = Number.isFinite(raw) && raw >= 0 ? raw : NB_AUDIT_SETTLE_HOURS;
  return hours * 60 * 60 * 1000;
}

/**
 * Parse a WooCommerce `_gmt` timestamp as UTC.
 *
 * Woo returns these as bare strings with no offset. Left to the runtime they
 * resolve against its local timezone, which is the defect TK-1033 closed. The
 * `Z` is appended explicitly for the same reason here.
 *
 * @param {string|null|undefined} value
 * @returns {number|null} epoch ms, or null if unusable
 */
function parseGmtMs(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)
    ? trimmed
    : `${trimmed.replace(" ", "T")}Z`;
  const ms = Date.parse(withZone);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The order's paid instant, or null.
 *
 * Deliberately only the paid fields. `date_created_gmt` is NOT consulted: using
 * it would let an unpaid or manually created order borrow a day it never earned,
 * which is the exact substitution the TK-1032 anchor ruling forbids.
 *
 * @param {object} order a WooCommerce REST order
 * @returns {number|null} epoch ms
 */
export function orderPaidMs(order) {
  return parseGmtMs(order?.date_paid_gmt);
}

/**
 * Is this order inside the auditor's window?
 *
 * Order of the checks is deliberate. The missing paid date is reported before
 * the window comparisons, because an order with no paid instant cannot be
 * placed on either side of the cutover and calling it `pre_cutover` would be a
 * guess presented as a fact.
 *
 * @param {object} order a WooCommerce REST order
 * @param {{ nowMs?: number, cutoverMs?: number, settleMs?: number }} [opts]
 *   injected so the window is testable without moving the clock
 * @returns {{ eligible: boolean, reason: string, paidMs: number|null }}
 */
export function evaluateAuditWindow(order, opts = {}) {
  const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
  const cutoverMs = Number.isFinite(opts.cutoverMs)
    ? opts.cutoverMs
    : canonicalCutoverMs();
  const settleMs = Number.isFinite(opts.settleMs) ? opts.settleMs : auditSettleMs();

  const paidMs = orderPaidMs(order);

  if (paidMs === null) {
    return {
      eligible: false,
      reason: NB_AUDIT_INELIGIBLE.NO_PAID_DATE,
      paidMs: null,
    };
  }

  if (paidMs < cutoverMs) {
    return {
      eligible: false,
      reason: NB_AUDIT_INELIGIBLE.PRE_CUTOVER,
      paidMs,
    };
  }

  const lookbackFloorMs = nowMs - NB_AUDIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  if (paidMs < lookbackFloorMs) {
    return {
      eligible: false,
      reason: NB_AUDIT_INELIGIBLE.BEYOND_LOOKBACK,
      paidMs,
    };
  }

  if (paidMs > nowMs - settleMs) {
    return {
      eligible: false,
      reason: NB_AUDIT_INELIGIBLE.NOT_SETTLED,
      paidMs,
    };
  }

  return { eligible: true, reason: "", paidMs };
}

/**
 * Normalise the requested mode.
 *
 * Anything unrecognised, absent or misspelled resolves to AUDIT. Repair is a
 * write to the vendor, so it has to be asked for exactly; a typo must never be
 * the thing that turns writing back on.
 *
 * @param {string|null|undefined} raw
 * @returns {string} one of NB_AUDIT_MODE
 */
export function normalizeAuditMode(raw) {
  return String(raw || "").trim().toLowerCase() === NB_AUDIT_MODE.REPAIR
    ? NB_AUDIT_MODE.REPAIR
    : NB_AUDIT_MODE.AUDIT;
}
