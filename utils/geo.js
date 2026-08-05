// Resolve the visitor's country for the geo-redirect popup / geo-aware logic.
//
// Fallback order (documented intentionally):
//   1. cf-ipcountry (Cloudflare) - PRIMARY. Cloudflare sits in front of Vercel,
//      so Vercel's x-vercel-ip-country reflects the Cloudflare PoP (e.g. a US
//      edge like ORD/Chicago), NOT the real visitor. Cloudflare's cf-ipcountry
//      is visitor-accurate. Cloudflare placeholder codes are ignored:
//        - "XX": country unknown / could not be determined
//        - "T1": Tor exit node
//   2. x-vercel-ip-country (Vercel) - fallback, used only when Cloudflare's
//      header is absent or a placeholder (e.g. if Cloudflare is ever bypassed).
//
// Returns an ISO-3166 alpha-2 code (e.g. "CA", "US") or "" when none can be
// determined. Callers MUST delete the geo-country cookie on "" so a stale value
// never persists. (US middleware additionally allows a ?geo= query override for
// local testing, applied by the caller after this resolver.)
const CF_PLACEHOLDER_COUNTRIES = new Set(["XX", "T1"]);

export function resolveCountry(req) {
  const cfCountry = req.headers.get("cf-ipcountry") || "";
  if (cfCountry && !CF_PLACEHOLDER_COUNTRIES.has(cfCountry)) {
    return cfCountry;
  }
  return req.headers.get("x-vercel-ip-country") || "";
}
