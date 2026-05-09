# CAPI Events Stopped Showing in Vercel Logs After May 3, 2026

**Investigation date:** 2026-05-06
**Symptom:** All Meta CAPI and TikTok CAPI events stopped appearing in Vercel logs after May 3, 2026.

## TL;DR

The codebase itself was not broken between Apr 26 and May 5. The dispatch path is intact and well-instrumented with `console.log`. The most plausible root cause is **environmental** — most likely a rotation, expiry, or accidental deletion of `FB_ACCESS_TOKEN_*` and/or TikTok access-token environment variables on Vercel — because:

- The CAPI route silently returns HTTP 400 with **no log line** when `gatewayConfig.accessToken` is falsy (`app/api/meta-capi/purchase/route.js:199`).
- This is the only code path that produces zero log output while still returning a structured response — which exactly matches "events entirely stopped showing."

Two secondary hypotheses are below; the first action item gives the user a one-grep test that distinguishes them in seconds.

---

## CAPI Architecture Map

### Server-side endpoints
| Route | File | Sends to |
|---|---|---|
| Meta CAPI Purchase | `app/api/meta-capi/purchase/route.js` | `https://graph.facebook.com/v18.0/{pixelId}/events` |
| TikTok CAPI Purchase | `app/api/tiktok-capi/purchase/route.js` | TikTok Events API |
| Awin Order Tracking | `app/api/awin/track-order/route.js` | Awin (separate channel) |

### Multi-gateway routing (`utils/metaCapiConfig.js:29`)
Six gateways: `ED`, `WL`, `HL`, `SMOKING`, `SKINCARE`, `OTHERS`. Each has its own `pixelId` and `accessToken` (env var). Cryptic event names `RKY_TNT` (ED), `RKY_FLW` (WL), `RKY_VBE` (HL), etc.

### Trigger flow (single call site)
```
components/OrderReceived/OrderReceivedPageContent.jsx:398
  → analyticsService.trackPurchase(data)
      → utils/analytics/analyticsService.js:300
        → dynamic import utils/metaCapiPurchase.js
          → fetch('/api/meta-capi/purchase')              ← server log line: middleware.js:23
            → app/api/meta-capi/purchase/route.js:199     ← guard: accessToken
            → app/api/meta-capi/purchase/route.js:377     ← log "[Meta CAPI] Sending event…"
            → app/api/meta-capi/purchase/route.js:435     ← log "[Meta CAPI] ✅ Success"
```

### The three silent-return points (no log emitted)
1. `utils/analytics/analyticsService.js:212` — `if (!order || !order.id) return;`
2. `components/OrderReceived/OrderReceivedPageContent.jsx:383` — `if (data && data.id) {…}` (gates the entire CAPI block)
3. `app/api/meta-capi/purchase/route.js:198-203` — missing or empty `accessToken` returns 400 with no `console.log`

Any one of these triggering for every order would produce exactly the observed symptom (zero `[Meta CAPI]` log lines).

---

## Git activity in the suspect window (Apr 25 – May 6)

### Merges to `main` between the last known-good window and May 5
| Date | Hash | PR | Notes |
|---|---|---|---|
| 2026-04-26 | `345c784` | #543 | TK-423 (FBPixelLoader.jsx only) — merged to development |
| 2026-04-26 | `aef765b` | #544 | development → main, brought TK-423 to prod |
| 2026-04-29 | `63d2e5d` | #546 | development → main |
| 2026-04-30 | `6df5936` | #548 | development → main |
| 2026-05-01 | `7e0eaf7` | #549 | **Vercel auto-PR: Next.js 16.0.7 → 16.0.10 (CVE patch)** |
| 2026-05-01 | `64fbfab` | #550 | development → main |
| **(May 2 – May 4: nothing merged to main)** | | | |
| 2026-05-05 | `4a1327a` | #552 | bo3-b → main |
| 2026-05-05 | `5575103` | #558 | development → main |

**Key implication:** between May 1 night and May 5, **nothing merged to `main`.** If Vercel deploys on push to `main`, prod was unchanged across the May 3 transition. The breakage line crosses an interval where no code shipped — strong evidence the cause is **not** a code change.

### Commits touching CAPI-related code in the window
| Hash | Date | File | Effect |
|---|---|---|---|
| `5940140` | Apr 26 | `components/FBPixelLoader.jsx` | Browser-side pixel init only. **Does not touch CAPI dispatch.** |
| `fc3e208` | May 4 | `utils/metaBrowserEventConfig.js` | One-line addition: `"bo-simplified-2": "WL"`. Purely additive, cannot break anything. Also did not reach `main` until May 5. |
| `9ebfb8f` | Apr 24 | `lib/meta/paramBuilderHelper.js` (FLOW_ID_MAP) | Pre-window. Aliases short flow codes — additive only. |

### Files unchanged since well before April 25
- `app/api/meta-capi/purchase/route.js`
- `app/api/tiktok-capi/purchase/route.js`
- `utils/analytics/analyticsService.js`
- `utils/metaCapiPurchase.js`
- `utils/tiktokCapiPurchase.js`
- `utils/metaCapiConfig.js`
- `utils/enrichOrderData.js`
- `app/api/order/route.js`
- `components/OrderReceived/OrderReceivedPageContent.jsx` (last touch: Apr 17, unrelated WL link fix)
- `middleware.js`

There is no commit that removed a `console.log`, added a try/catch swallow, added an early return, or otherwise silenced CAPI dispatch.

---

## Root-cause hypothesis ranking

### H1 — Meta/TikTok access tokens in Vercel env are missing or expired (HIGH confidence)
**Why it fits the symptom exactly:**
- `route.js:198-203`:
  ```js
  const gatewayConfig = getGatewayConfig(gateway);
  if (!gatewayConfig || !gatewayConfig.accessToken) {
    return NextResponse.json({ error: ... }, { status: 400 });
  }
  ```
  No `console.log` precedes this guard. If `process.env.FB_ACCESS_TOKEN_ED/WL/HL/...` is empty, the route returns 400 silently — **the request hits Vercel, but no `[Meta CAPI]` line ever prints.**
- Meta system-user tokens commonly expire on a fixed cadence (60 days) unless extended. Token revocation/expiry on a specific date is the canonical signature for "all events stopped on day X."
- This is invisible to git because env vars live in the Vercel dashboard.
- Affects all gateways simultaneously → matches "ALL CAPI events" stopped (not just one category).

### H2 — `/api/order/` started returning a payload without `.id` (MEDIUM confidence)
**Why it fits:**
- `OrderReceivedPageContent.jsx:383` gates ALL post-purchase tracking on `if (data && data.id)`. If the order API began returning `{ order: {...} }` (envelope) or an error object, **nothing** in the analytics block runs — including the middleware log for `/api/meta-capi/purchase`, because no fetch is ever issued.
- WordPress / WooCommerce backend changes are also invisible to git.
- Distinguishes from H1 by absence of *any* CAPI-related Vercel log lines, including middleware request logs.

### H3 — Next.js 16.0.10 patch (`e7353a4`, May 1) silenced something (LOW confidence)
**Why it's unlikely:**
- 16.0.10 is a CVE security patch. A patch release silently breaking `console.log` in API routes would be a major Next.js regression that other users would also be reporting. Worth checking the Next.js 16.0.10 release notes for any logging-related changes, but unlikely.
- Doesn't explain why TikTok CAPI stopped at the same instant unless the patch broke something in the runtime universally.

### H4 — TK-423 (`5940140`, Apr 26) indirect effect (RULED OUT)
**Why it doesn't fit:**
- Diff is scoped to `components/FBPixelLoader.jsx` only. CAPI dispatch is a separate, server-side path that does not import or depend on that file.
- Already deployed Apr 26. The user reports working CAPI through May 3, which would be a 7-day false negative if TK-423 had broken it.

---

## Recommended diagnostic order (fastest to longest)

1. **One-grep test in Vercel logs (under 60 seconds)**
   - Search Vercel runtime logs (Apr 30 baseline AND May 4 broken) for the literal string `POST /api/meta-capi/purchase`. This comes from the middleware (`middleware.js:23`).
   - **If present in both:** the request is reaching the route. Cause is H1 (access token gate). Move to step 2.
   - **If present Apr 30 but absent May 4:** the trigger isn't firing. Cause is H2 (order API). Skip to step 4.

2. **Check Vercel env vars** (most likely root cause)
   - In Vercel dashboard → project → Settings → Environment Variables (Production). Confirm presence + non-empty values for:
     - `FB_ACCESS_TOKEN_ED`, `FB_ACCESS_TOKEN_WL`, `FB_ACCESS_TOKEN_HL`, `FB_ACCESS_TOKEN_SMOKING`, `FB_ACCESS_TOKEN_SKINCARE`, `FB_ACCESS_TOKEN_OTHERS`
     - All TikTok CAPI access tokens referenced in `utils/tiktokCapiConfig.js`
   - Check Meta Business Manager → Events Manager → Conversions API → confirm system-user tokens are not expired/revoked.

3. **Tail Vercel logs and trigger a test purchase**
   - Place a real $0+ test order. Then in Vercel logs, search the request ID for both `[API] POST /api/meta-capi/purchase` and `[Meta CAPI] Sending event…`. The presence/absence of each pinpoints the failing layer.

4. **If step 1 shows trigger isn't firing**
   - Hit `/api/order/?order_id=<known_order>&order_key=<key>` directly and inspect the response shape. Confirm `.id` is at the top level (not wrapped). If wrapped, a WP/WC change is the cause; either revert the WP change or extract correctly client-side.

5. **Defense-in-depth follow-up (after the immediate fix)**
   - Add a `console.error` BEFORE the `accessToken` guard in `app/api/meta-capi/purchase/route.js:198` so this class of failure is observable next time:
     ```js
     if (!gatewayConfig || !gatewayConfig.accessToken) {
       console.error(`[Meta CAPI] Missing accessToken for gateway ${gateway}`);
       return NextResponse.json(...);
     }
     ```
   - Same for the silent returns at `analyticsService.js:212` and `OrderReceivedPageContent.jsx:383`.
   - Add a startup sanity check (or healthcheck endpoint) that verifies all six `FB_ACCESS_TOKEN_*` env vars are non-empty.

---

## What was ruled out by code/git evidence

- Code change in the suspect window broke CAPI (no relevant code change merged to `main` between May 1 and May 5).
- TK-423 indirectly affected server-side dispatch (scope verified to `FBPixelLoader.jsx` only).
- A try/catch was added that swallows CAPI errors (no such commit exists).
- Logs were removed from the CAPI route (route file unchanged).
- Middleware started blocking `/api/meta-capi/purchase` (`middleware.js` unchanged; matcher includes `/api/:path*` and only adds tracing headers).
- Cart/checkout flow changes broke the trigger (`OrderReceivedPageContent.jsx` last edited Apr 17, unrelated link fix).
