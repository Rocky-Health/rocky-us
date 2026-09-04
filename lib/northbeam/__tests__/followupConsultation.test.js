import { describe, it, expect } from "vitest";

import { checkIfAlreadySynced } from "@/lib/northbeam/orderGuards";

/**
 * Acceptance for TK-1030's follow-up consultation gate (product 180694).
 *
 * The route (app/api/northbeam/orders/route.js) is not imported directly
 * here: it is a Next.js route handler, awkward to invoke outside a request
 * context, and importing it would test the transport rather than the rule
 * that actually matters. The rule that matters is the string contract: the
 * refusal reason the route writes must be the exact literal
 * "follow-up consultation", because that literal is what
 * PERMANENT_REFUSAL_REASONS in lib/northbeam/orderGuards.js matches against,
 * and it is also what the WordPress backfill plugin's selection query
 * excludes on. Any other spelling makes checkIfAlreadySynced() decide the
 * refusal is not permanent, so the order gets re-selected and re-refused on
 * every run forever.
 *
 * Driving checkIfAlreadySynced() with a refused order proves the exact string
 * is load bearing rather than decorative: change one character and the second
 * test flips from refused:true to refused:false.
 */

function refusedOrder(reason) {
  return {
    meta_data: [
      { key: "_northbeam_backfill_refused", value: "yes" },
      { key: "_northbeam_backfill_refused_reason", value: reason },
    ],
  };
}

describe("checkIfAlreadySynced: the follow-up consultation refusal reason is permanent", () => {
  it("treats the exact literal 'follow-up consultation' as a permanent refusal", () => {
    const result = checkIfAlreadySynced(refusedOrder("follow-up consultation"));
    expect(result.synced).toBe(false);
    expect(result.refused).toBe(true);
    expect(result.refused_reason).toBe("follow-up consultation");
  });

  it("does NOT treat a misspelled reason as permanent, proving the exact string matters", () => {
    const result = checkIfAlreadySynced(refusedOrder("follow_up_consultation"));
    expect(result.synced).toBe(false);
    expect(result.refused).toBe(false);
  });
});
