import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";

/**
 * Mint a userId session cookie from a portal continuation link that carries
 * ?userId= plus the patient-portal token, then bounce to the cleaned URL.
 * Middleware redirects here. US stores userId as plain text (same as the login
 * route), so no encryption is applied.
 *
 * SECURITY: the userId is taken from the URL and is NOT validated against the
 * patient-token here (the CRM does not yet expose a token -> wp_user_id lookup).
 * The patient-token is required only as a coarse gate so a bare ?userId= cannot
 * mint a session. Swap in token-validated resolution when the CRM endpoint
 * exists (see /api/questionnaire-filled-answers, whose CRM response already
 * returns wp_user_id).
 */
export async function GET(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "";
  const patientToken = url.searchParams.get("patient-token") || "";
  const redirect = url.searchParams.get("redirect") || "/";

  // Same-origin path only, never an absolute URL.
  const target = redirect.startsWith("/") ? redirect : "/";
  const res = NextResponse.redirect(new URL(target, url.origin));

  // Gate: require the patient-token and a real positive-integer userId.
  if (!patientToken || !/^\d+$/.test(userId) || Number(userId) <= 0) {
    return res;
  }

  try {
    // Never overwrite an existing session.
    if (!req.cookies.get("userId")?.value) {
      res.cookies.set("userId", userId, { path: "/" });
    }
  } catch (e) {
    logger.error("adopt-user-session error:", e);
  }

  return res;
}
