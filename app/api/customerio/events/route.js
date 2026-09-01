/**
 * Customer.io Pipelines event relay.
 *
 * First-party relay: the browser POSTs behaviour here, this route attaches identity from the
 * identity cookies and forwards to Customer.io with the server-only write key. No Customer.io
 * credential ever reaches the client bundle, and the browser never sends PII. On this repo those
 * cookies are unsigned, so the identity is a claim rather than proof; lib/customerio/identity.js
 * documents why that is acceptable for marketing events and what closing it would take.
 *
 * Only storefront-owned events are accepted. `Order Completed` is not one of them: Woo and the
 * backend own purchase and subscription lifecycle, and a storefront copy would double-trigger
 * every journey.
 *
 * Failure contract, matching the Attentive relay: 400 only for a malformed body. Every other
 * outcome is 200, so a disabled integration, a missing key, a Customer.io outage or a timeout
 * cannot fail a cart or a checkout, and the client sender never retries into a loop.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import { resolveCustomerioIdentity, resolveRequestContext } from "@/lib/customerio/identity";
import { trackCustomerioEvent } from "@/lib/customerio/server";

export async function POST(req) {
  try {
    const payload = await req.json();
    const { event, ecommerce, url, sessionId, dedupeKey } = payload || {};

    if (typeof event !== "string" || !event) {
      return NextResponse.json({ ok: false, error: "Missing event" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const { wooCustomerId, email } = resolveCustomerioIdentity(cookieStore);

    const result = await trackCustomerioEvent({
      event,
      ecommerce,
      url,
      wooCustomerId,
      email,
      anonymousId: typeof sessionId === "string" ? sessionId : "",
      dedupeKey: typeof dedupeKey === "string" ? dedupeKey : "",
      context: resolveRequestContext(req),
    });

    if (result.error === "unsupported-event") {
      return NextResponse.json({ ok: false, error: "Unsupported event" }, { status: 400 });
    }

    return NextResponse.json({
      ok: !!result.ok,
      status: result.status ?? undefined,
      skipped: result.skipped,
      error: result.error,
    });
  } catch (error) {
    logger.warn("[Customer.io events] error:", error?.message || error);
    // 200 so the client sender never retries or spams on our own errors.
    return NextResponse.json({ ok: false, error: "internal" });
  }
}
