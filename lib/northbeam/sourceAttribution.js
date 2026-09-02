/**
 * Turns front end source attribution into WooCommerce order meta.
 *
 * Why this exists: utm parameters, the click ids, the landing page and the
 * original referrer only ever existed in the shopper's browser session. No
 * server side writer could see them, so every server side push to Northbeam was
 * blind to attribution, and a re-push overwrote whatever the browser had sent
 * with a payload carrying no source tags at all. That is the structural cause of
 * the tag loss, and persisting the data on the order is what closes it.
 *
 * The keys follow the `_nb_` convention this integration already uses for its
 * own meta, alongside the `_rocky_*` keys TK-1022 established on the same
 * `meta_data` array and the older `_awin_*` pair. Three prefixes on one array is
 * deliberate rather than accidental: `_awin_*` is an affiliate contract,
 * `_rocky_*` is request provenance, `_nb_*` is marketing attribution.
 *
 * TWO LESSONS LIFTED FROM TK-1022, both of which cost real time there:
 *
 * 1. A populated field is not a correct field. That integration ran for fifteen
 *    months looking healthy while capturing our own infrastructure addresses, so
 *    it now records WHERE a value came from. The same failure mode applies here:
 *    an own domain referrer recorded as the traffic source looks identical to a
 *    real one. Excluding it is necessary but not sufficient, so
 *    `_nb_source_provenance` makes the origin detectable rather than merely
 *    prevented.
 * 2. A capture timestamp matters because WooCommerce Subscriptions copies parent
 *    order data onto renewals. Without `_nb_source_captured_at`, a signup's
 *    attribution can be presented as a renewal's own, up to eighteen months
 *    stale, with nothing to reveal it.
 */

/** Meta key prefix for everything this module writes. */
export const NB_SOURCE_META_PREFIX = "_nb_";

/**
 * Click id cookies this integration recognises, matching what the browser
 * captures in `utils/sourceTracking.js`. Read server side from the request
 * cookies so that a caller which forgets to send its session payload still
 * produces the paid-traffic half of the attribution.
 */
export const NB_CLICK_ID_COOKIES = [
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
  "twclid",
  "gbraid",
  "wbraid",
  "epik",
  "_epik",
];

/** utm fields carried through, in a fixed order so the meta array is stable. */
export const NB_UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Where the attribution came from. Recorded on every order so a value can be
 * judged rather than trusted.
 *
 * `client_session` the browser supplied the session scoped fields
 * `server_cookie`  only cookies were readable, the caller sent nothing
 * `mixed`          both contributed
 * `none`           nothing was available, and the order says so explicitly
 */
export const NB_SOURCE_PROVENANCE = {
  CLIENT_SESSION: "client_session",
  SERVER_COOKIE: "server_cookie",
  MIXED: "mixed",
  NONE: "none",
};

/** Lowercase, trim, and drop a leading `www.` so comparisons are stable. */
function normalizeHost(host) {
  if (typeof host !== "string") return "";
  return host.trim().toLowerCase().replace(/^www\./, "").replace(/:\d+$/, "");
}

/**
 * The registrable-ish base of a host: its last two labels.
 *
 * Deliberately not a public suffix list. Both storefronts sit on a two label
 * apex (`myrocky.ca`, `myrocky.com`), so two labels is exactly right here and a
 * suffix list would be a dependency bought for nothing. If a storefront ever
 * moves to a multi part suffix such as `co.uk`, this is the one function to
 * revisit, which is why it is named and separate rather than inlined.
 */
function registrableBase(host) {
  const normalized = normalizeHost(host);
  if (!normalized) return "";
  const labels = normalized.split(".");
  return labels.length <= 2 ? normalized : labels.slice(-2).join(".");
}

/**
 * Whether a referrer is one of our own surfaces rather than real traffic.
 *
 * Covers the apex, every subdomain of it, and preview deployments, which is
 * where the reported `source:www.myrocky.ca` came from: the browser stores
 * `document.referrer` on the first page of a session without checking whose
 * domain it is, so an internal navigation can become the recorded source.
 *
 * @param {string} referrerDomain hostname taken from the stored referrer
 * @param {string} requestHost the host serving this request
 */
export function isOwnDomainReferrer(referrerDomain, requestHost) {
  const referrer = normalizeHost(referrerDomain);
  if (!referrer) return false;

  // Preview and local surfaces are never real traffic.
  if (referrer.endsWith(".vercel.app") || referrer === "vercel.app") return true;
  if (referrer === "localhost" || referrer === "127.0.0.1") return true;

  const base = registrableBase(requestHost);
  if (!base) return false;

  return referrer === base || referrer.endsWith(`.${base}`);
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Builds the `_nb_*` meta entries for an order.
 *
 * Returns entries for every key it owns, including empty values, so the shape of
 * an order's meta does not depend on what a shopper's session happened to hold.
 * A missing key and an empty key are different diagnoses, and only one of them
 * is distinguishable later.
 *
 * @param {object} args
 * @param {object} [args.source] the browser payload, shaped like getCurrentSourceData()
 * @param {object} [args.cookies] request cookies as a plain name to value object
 * @param {string} [args.requestHost] host serving the request, for the own domain test
 * @param {string} [args.capturedAt] ISO instant, injected so it is testable
 * @returns {Array<{key: string, value: string}>}
 */
export function buildSourceAttributionMeta({
  source = {},
  cookieSource = {},
  cookies = {},
  requestHost = "",
  capturedAt = new Date().toISOString(),
} = {}) {
  const src = source && typeof source === "object" ? source : {};
  const cookieSrc =
    cookieSource && typeof cookieSource === "object" ? cookieSource : {};
  const jar = cookies && typeof cookies === "object" ? cookies : {};

  let sawClientField = false;
  let sawCookieField = false;

  // Prefer what the browser sent, then what a server side cookie read
  // recovered, and record WHICH of the two actually supplied the value.
  //
  // cookieSource exists because the two storefronts persist attribution under
  // different cookie names. This module cannot hold either region's names
  // without stopping being shared, so the region's own route translates its
  // cookies into this shape and passes them here. Passing them as `source`
  // instead would work and would also be a lie: the seam would report
  // client_session provenance for data no browser sent on this request, which
  // is the exact failure _nb_source_provenance exists to make visible.
  const pick = (field) => {
    const fromClient = cleanString(src[field]);
    if (fromClient) {
      sawClientField = true;
      return fromClient;
    }
    const fromCookie = cleanString(cookieSrc[field]);
    if (fromCookie) {
      sawCookieField = true;
      return fromCookie;
    }
    return "";
  };

  const utm = {};
  for (const field of NB_UTM_FIELDS) utm[field] = pick(field);

  // Click ids: prefer what the browser sent, fall back to the request cookies.
  // The fallback is the reason a caller that forgets its payload still records
  // paid traffic rather than nothing.
  const clickIds = {};
  for (const name of NB_CLICK_ID_COOKIES) {
    const fromClient = cleanString(src[name]);
    const fromCookie = cleanString(jar[name]);
    const value = fromClient || fromCookie;
    if (value) {
      // `_epik` and `epik` are the same Pinterest id under two names.
      const key = name === "_epik" ? "epik" : name;
      if (!clickIds[key]) clickIds[key] = value;
      if (fromClient) sawClientField = true;
      else sawCookieField = true;
    }
  }

  // Some storefronts record only "one click id, plus which vendor it came from"
  // rather than one field per vendor. The US storefront is built that way, under
  // its own `traffic_click_id` keys, so none of the cookie names above ever match
  // there and its paid traffic would otherwise land here as nothing at all.
  //
  // Its label is deliberately many to one: gclid, gbraid and wbraid all report
  // "Google Ads". So the original parameter name is NOT recoverable from it, and
  // writing a `gclid` key from a "Google Ads" label would be inventing a fact
  // rather than recording one. The pair is carried through verbatim instead,
  // under two reserved keys that no vendor cookie uses, so a generic id can
  // never be misread later as a specific vendor's.
  // The type is only consulted when there is an id to attach it to. `pick` marks
  // provenance as a side effect, so reading a bare type would report that a
  // client field arrived while recording nothing at all from it.
  const genericClickId = pick("click_id");
  if (genericClickId) {
    clickIds.click_id = genericClickId;
    const genericClickIdType = pick("click_id_type");
    if (genericClickIdType) clickIds.click_id_type = genericClickIdType;
  }

  const referrer = pick("referrer");
  const referrerDomain = pick("referrer_domain");
  const landingPage = pick("landing_page");
  const sessionId = pick("session_id");

  const ownDomain = isOwnDomainReferrer(referrerDomain, requestHost);

  // An own domain referrer is dropped rather than recorded, and the fact that it
  // was dropped is itself recorded. `source_name` is dropped with it, because
  // determineSourceName falls through to the referrer domain when nothing else
  // matched, which is exactly how our own host became a traffic source.
  const keptReferrer = ownDomain ? "" : referrer;
  const keptReferrerDomain = ownDomain ? "" : referrerDomain;
  const rawSourceName = pick("source_name");
  const keptSourceName =
    ownDomain && rawSourceName && normalizeHost(rawSourceName) === normalizeHost(referrerDomain)
      ? ""
      : rawSourceName;

  let provenance = NB_SOURCE_PROVENANCE.NONE;
  if (sawClientField && sawCookieField) provenance = NB_SOURCE_PROVENANCE.MIXED;
  else if (sawClientField) provenance = NB_SOURCE_PROVENANCE.CLIENT_SESSION;
  else if (sawCookieField) provenance = NB_SOURCE_PROVENANCE.SERVER_COOKIE;

  const meta = [];
  const put = (suffix, value) =>
    meta.push({ key: `${NB_SOURCE_META_PREFIX}${suffix}`, value: value || "" });

  for (const field of NB_UTM_FIELDS) put(field, utm[field]);
  put("source_name", keptSourceName);
  put("referrer", keptReferrer);
  put("referrer_domain", keptReferrerDomain);
  put("landing_page", landingPage);
  put("session_id", sessionId);
  put("click_ids", Object.keys(clickIds).length ? JSON.stringify(clickIds) : "");
  put("referrer_excluded", ownDomain ? "own_domain" : "");
  put("source_provenance", provenance);
  put("source_captured_at", capturedAt);

  return meta;
}
