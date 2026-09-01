/**
 * Customer.io Pipelines identify relay.
 *
 * Two cases, one route:
 *  - A known customer. Identity comes from the identity cookies, so `userId` is the WooCommerce
 *    customer ID and the body is ignored for email and phone. Those cookies are unsigned on this
 *    repo, so they are a claim rather than proof; see lib/customerio/identity.js.
 *  - A lead with no account yet. There is no cookie to read, so the email arrives in the body
 *    from the form the person just filled in. It is format-checked and nothing else is taken.
 *    The profile is addressed by an anonymous key and carries the email as a trait, which is
 *    what lets Customer.io multi-identifier merge converge it with the Woo-ID profile later.
 *
 * As with the event relay, 400 only for a malformed body. Everything else is 200.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import { normalizePhoneToE164 } from "@/utils/analytics/hash";
import { resolveCustomerioIdentity, resolveRequestContext } from "@/lib/customerio/identity";
import { identifyCustomerioProfile } from "@/lib/customerio/server";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const bodyEmail = typeof payload?.email === "string" ? payload.email.trim() : "";
    const bodyPhone = typeof payload?.phone === "string" ? payload.phone.trim() : "";
    const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : "";

    const cookieStore = await cookies();
    const cookieIdentity = resolveCustomerioIdentity(cookieStore);

    // The cookie wins over the body, matching Canada. Both are browser-supplied here (the
    // cookies are unsigned on this repo), so this is a precedence rule, not a trust boundary.
    const email = cookieIdentity.email || (isValidEmail(bodyEmail) ? bodyEmail : "");
    const phone = cookieIdentity.phone || normalizePhoneToE164(bodyPhone, "US") || "";

    if (!cookieIdentity.wooCustomerId && !email) {
      return NextResponse.json({ ok: false, error: "Missing identity" }, { status: 400 });
    }

    const result = await identifyCustomerioProfile({
      wooCustomerId: cookieIdentity.wooCustomerId,
      email,
      phone,
      anonymousId: sessionId,
      // One identify per identity per session is enough; a remount must not create a second.
      dedupeKey: `${cookieIdentity.wooCustomerId || email}|${sessionId}`,
      context: resolveRequestContext(req),
    });

    return NextResponse.json({
      ok: !!result.ok,
      status: result.status ?? undefined,
      skipped: result.skipped,
      error: result.error,
    });
  } catch (error) {
    logger.warn("[Customer.io identify] error:", error?.message || error);
    return NextResponse.json({ ok: false, error: "internal" });
  }
}
