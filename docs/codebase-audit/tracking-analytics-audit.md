# Tracking & Analytics Audit

## Executive Summary

- **P1: Phone Normalization Mismatch between Meta & TikTok CAPI** — Different default country codes (US vs CA) break PII matching and dedup. Meta uses billing country dynamically, TikTok hardcodes 'CA', causing hashes to diverge. **Impact: Attribution data loss**.
- **P1: Northbeam Default Country Code is USA, but HashServerSide defaults to CA** — Inconsistent normalization across integrations. hashPhone defaults to 'CA' but northbeamEvents.js calls getNorthbeamSourceTags() without explicit country context. Potential hidden mismatch if billing.country is missing.
- **P2: Synchronous Await Chain in analyticsService.trackPurchase** — Meta CAPI, TikTok CAPI, and Northbeam are all awaited sequentially in the trackPurchase method (lines 301, 311, 320), blocking the event loop. If any CAPI route is slow (e.g., network timeout), entire purchase tracking chain stalls. On order-received page, this delays GTM visibility and next pageview.

## Findings

### F1: Phone Number Hashing Divergence — Meta CAPI vs TikTok CAPI
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: 
  - `/app/api/meta-capi/purchase/route.js:284`
  - `/app/api/tiktok-capi/purchase/route.js:89`
  - `/utils/analytics/hashServerSide.js:16, 54`
- **What**: Meta CAPI uses the order's billing country to normalize phone (line 284: `hashPhone(userPhone, country)`), while TikTok CAPI hardcodes 'CA' (line 89: `hashPhone(userPhone, 'CA')`). For customers in US with US-formatted phone numbers, Meta hashes with +1XXX (US), TikTok hashes with +1XXX (CA). Same digits, different normalization rules—dedup keys diverge.
- **Impact**: PII matching fails in TikTok's backend. Duplicate conversions or mismatched user records. Attribution to the wrong audience segment.
- **Fix**: TikTok CAPI should use the same dynamic country as Meta CAPI (extract from order.billing.country or default to order.customer_iso_country if available). Pass country param to hashPhone call: `hashPhone(userPhone, country || 'US')`.
- **Effort**: S • **Risk**: low

### F2: Inconsistent Phone Normalization Defaults Across Server-Side Hashing
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: `/utils/analytics/hashServerSide.js:16, 54`
- **What**: hashServerSide.js defaults `defaultCountry='CA'` for normalizePhone and hashPhone. Meta CAPI route does NOT pass a country (it defaults to 'CA'), but on line 284 it does pass country. This creates two code paths: one explicit (Meta with country override), one implicit (TikTok with CA fallback). Future CAPI integrations that forget the country param will silently normalize as CA.
- **Impact**: If a new CAPI integration forgets to pass country, hidden hash divergence occurs. Silent attribution mismatch that is hard to debug.
- **Fix**: Change hashServerSide.js default from 'CA' to 'US' (platform default), or make country mandatory with no default (explicit > implicit). Document that all server-side phone hashing MUST pass country.
- **Effort**: S • **Risk**: low

### F3: Synchronous Await Chain Blocks TTI on Order-Received Page
- **Severity**: P2
- **Bucket**: Perf
- **Files**: `/utils/analytics/analyticsService.js:301, 311, 320-324`
- **What**: analyticsService.trackPurchase() awaits three async operations sequentially:
  - Line 301: await trackMetaCapiPurchase (HTTP POST to /api/meta-capi/purchase)
  - Line 311: await trackTikTokCapiPurchase (HTTP POST to /api/tiktok-capi/purchase)
  - Line 320: await trackNorthbeamPurchase (HTTP POST to /api/northbeam/orders)
  
  All three are awaited with no Promise.allSettled or fire-and-forget. If any CAPI route times out (10s default), the entire chain hangs. On order-received page (OrderReceivedPageContent.jsx:398), this blocks GTM dataLayer and next pageview until all three resolve or error.
- **Impact**: User sees blank page during CAPI roundtrips. GA4 pageview and Northbeam event fire late. Browser paint delayed. TTI extends 3-5s per slow CAPI endpoint.
- **Fix**: Use Promise.allSettled() to parallelize Meta + TikTok + Northbeam. Wrapped in try-catch to isolate failures:
  ```javascript
  const results = await Promise.allSettled([
    meta ? trackMetaCapiPurchase(...) : Promise.resolve(),
    tiktok ? trackTikTokCapiPurchase(...) : Promise.resolve(),
    nb ? trackNorthbeamPurchase(...) : Promise.resolve()
  ]);
  ```
- **Effort**: M • **Risk**: med (need to verify error handling still works)

### F4: Missing `keepalive: true` in TikTok CAPI Fetch When Called from Purchase Event
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `/utils/tiktokCapiPurchase.js:92-97`
- **What**: TikTok CAPI purchase tracking uses `keepalive: true` (line 96), but the caller chain (analyticsService.trackPurchase → trackTikTokCapiPurchase → fetch) is awaited. If the order-received page redirects or navigates before the response completes, keepalive prevents the request from being cancelled—correct. However, there's no explicit timeout or retry on network error (unlike Meta CAPI which has retry logic on lines 416-419).
- **Impact**: Slow TikTok endpoint can hang the entire purchase chain (see F3). No fallback if network fails silently.
- **Fix**: Add explicit timeout and retry logic to TikTok CAPI, matching Meta CAPI pattern:
  ```javascript
  const sendWithRetry = async (attempt = 1) => {
    // timeout: 10s, retry once on 5xx/429
    // see /app/api/meta-capi/purchase/route.js:391-456
  };
  ```
- **Effort**: M • **Risk**: med

### F5: Northbeam Custom Event Tracking Not Implemented
- **Severity**: P3
- **Bucket**: Bad Impl
- **Files**: `/utils/northbeamEvents.js:437-463`
- **What**: trackNorthbeamCustomEvent is exported but not implemented. Line 449 logs "Custom event tracking not yet implemented". If downstream code calls this (e.g., for custom events like "engaged_with_questionnaire"), the call silently fails with only a logger.warn. No explicit error or fallback.
- **Impact**: Custom Northbeam events (if planned) will not fire. Developer debugging may be hard since there's no error thrown.
- **Fix**: Either implement the feature (if needed), or remove the stub function and update all callers, or throw NotImplementedError.
- **Effort**: S | M (depends on scope) • **Risk**: low

### F6: Empty String Hash Risk — All Hashing Functions Return Empty String on Validation Failure
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: 
  - `/utils/analytics/hashServerSide.js:3-8, 11-14, 48-52, 54-58`
  - `/utils/analytics/hash.js:89-92, 101-104`
- **What**: normalizeEmail, normalizePhone, hashEmail, hashPhone all return `''` on null/undefined/invalid input. When you hash an empty string with SHA-256, you get a known hash (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`). If a customer record lacks email/phone, all such records hash to the same value. This creates a collision: all customers with missing data appear as the same person to Meta/TikTok.
- **Impact**: Silent data corruption. Attribution groups customers without email into one profile. Audience matching breaks.
- **Fix**: Never hash empty strings. Instead, omit the field from user_data (Meta) or userContext (TikTok) if empty. Already done correctly in `/app/api/meta-capi/purchase/route.js:320-330` (checks `if (email)` before adding to userData). Verify all callers follow same pattern.
- **Effort**: S • **Risk**: low (check existing code path coverage)

### F7: No Event ID Deduplication for TikTok CAPI Client-Side Purchase Event
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: `/utils/tiktokEvents.js:213, 215-228`
- **What**: TikTok client-side purchase tracking generates a unique event_id on EVERY call (line 213: `const purchaseEventId = 'purchase_${order.id || "na"}_${Date.now()}'`), then passes it to trackTikTokEvent. However, TikTok's client-side pixel does NOT support dedup keys like Meta's. This means if the page is reloaded or analyticsService.trackPurchase is called twice (due to race condition), two DISTINCT events fire with different event_ids. No way to deduplicate on TikTok's side.
- **Impact**: TikTok receives duplicate purchase events (one from browser pixel, one from CAPI). Double-counts conversions. Artificially inflates ROAS.
- **Fix**: Use a stable event_id derived from order.id + gateway, NOT Date.now(). Align with CAPI event_id format: `purchase_${order.id}_${gateway}`. For TikTok's browser pixel (ttq.track), pass the same event_id so CAPI dedup can work:
  ```javascript
  const eventId = `purchase_${order.id}_tiktok_browser`;
  ttq.track('Purchase', { event_id: eventId, ... });
  ```
  Then CAPI uses the same event_id when called server-side (already does, line 137 `/app/api/tiktok-capi/purchase/route.js`).
- **Effort**: M • **Risk**: med (need to verify ttq.track accepts event_id field)

### F8: AWIN Server-Side Tracking Already Fired Check Is Weak
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `/app/api/awin/track-order/route.js:160-172`
- **What**: Idempotency check (line 161-163) only checks for exact key `_awin_s2s_code` with value '200'. If Awin returns non-200 (e.g., 201, 204), the check fails and the endpoint will re-fire on next call. No retry-after logic or backoff. Additionally, the check is done AFTER fetching order data, so if the fetch fails, the check is skipped and tracking is attempted again.
- **Impact**: Awin conversion may fire multiple times if status code is not exactly 200 or if there are transient network errors. Over-attribution to Awin.
- **Fix**: Accept any 2xx status code as idempotent. Store the timestamp of last attempt and implement exponential backoff for retries (don't re-fire within 5 minutes).
- **Effort**: M • **Risk**: med

### F9: No Explicit Error Logging / Swallowed Errors in Order-Received Post-Purchase Chain
- **Severity**: P2
- **Bucket**: Error
- **Files**: `/components/OrderReceived/OrderReceivedPageContent.jsx:419-422, 424-438`
- **What**: 
  - Line 419-422: AWIN tracking wrapped in async IIFE with no .catch(), so errors are silent.
  - Line 424-438: Heatmap.com conversion snippet loaded via script tag with no onerror handler.
  - Line 400-416: Convert.com revenue tracking wrapped in try-catch but the catch just logs error without re-throw. If tracking fails, user never knows.
  
  Multiple tracking integrations fire simultaneously with no error aggregation or fallback. If one fails silently, there's no mechanism to signal that the order-received page is partially degraded.
- **Impact**: Silent attribution gaps. If Heatmap script fails to load, conversion is missed. If AWIN fails, no fallback to client pixel. Developers have no visibility into partial failures.
- **Fix**: Centralize error logging. Create a post-purchase tracking health check that reports failures. Log all errors to a tracking-errors dataLayer event (viewable in GTM Tag Assistant). Implement fallback: if S2S fails, fire client pixel.
- **Effort**: M • **Risk**: low

### F10: Northbeam Penny Reconciliation Adds Difference to Largest Gateway Without Bounds Check
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `/utils/metaCapiPurchase.js:181-205`
- **What**: reconcilePennyDifferences() calculates the difference between WooCommerce total and sum of all gateway splits (line 183-184). If there's a penny difference (line 186: `Math.abs(difference) <= 0.05`), it adds the entire difference to the largest gateway's net_subtotal (line 198-200). This is correct for reconciliation, BUT the difference is added AFTER costs have already been allocated. If the largest gateway has $0 net_subtotal (e.g., 100% discount), the penny difference is still added, making the gateway's total negative or wrong.
- **Impact**: For $0 orders (100% discount), reconciliation can create negative values or tax/shipping misallocations. Northbeam receives incorrect cost breakdown.
- **Fix**: Only reconcile if the difference is non-zero AND each split has a non-zero net_subtotal. Skip reconciliation if all splits are $0.
- **Effort**: S • **Risk**: low

### F11: Meta CAPI / TikTok CAPI Order Enrichment Can Cause Duplicate Requests to WooCommerce
- **Severity**: P2
- **Bucket**: Perf
- **Files**: 
  - `/utils/metaCapiPurchase.js:224-243`
  - `/utils/tiktokCapiPurchase.js:26-45`
  - `/app/api/meta-capi/purchase/route.js:231-240`
  - `/app/api/tiktok-capi/purchase/route.js:60-70`
- **What**: Both trackMetaCapiPurchase and trackTikTokCapiPurchase call enrichOrderWithProductData() independently. Each enrichment function fetches product details for each line item. Then, if the CAPI route handler receives incomplete order data, it AGAIN fetches from WooCommerce (lines 220-229 in Meta, 60-70 in TikTok). This results in 2x product detail fetches for the same order.
- **Impact**: Duplicate WooCommerce API calls during peak orders. Increased latency and API quota usage.
- **Fix**: Ensure client-side analyticsService.trackPurchase() always passes complete order_data (including line items + categories) to CAPI routes. Remove the re-fetch fallback in CAPI routes if client-side enrichment is guaranteed.
- **Effort**: M • **Risk**: med

### F12: Meta CAPI event_id Does Not Include Timestamp or Uniqueness Guarantor
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: `/app/api/meta-capi/purchase/route.js:308`
- **What**: event_id is generated as `purchase_${order_id}_${gateway}` (line 308). This is stable per order-per-gateway, which is correct for dedup. However, if the same order is sent to Meta twice within the dedup window (e.g., due to a race in analyticsService.trackPurchase or a manual re-fire), Meta will deduplicate and only count once. This is CORRECT behavior. However, there's NO mechanism to prevent a developer from accidentally calling trackPurchase(order) twice in the same session. setOnce() guards this in analyticsService (lines 215-218), but only per session. If the process restarts or a new tab opens, setOnce is bypassed.
- **Impact**: Low risk in practice due to setOnce guard, but the event_id design is fragile. If setOnce is ever removed or bypassed, Meta will silently deduplicate without logging.
- **Fix**: Document that event_id is stable and relies on setOnce guard. Alternatively, include a timestamp in event_id: `purchase_${order_id}_${gateway}_${Math.floor(Date.now()/1000)}`. Trade-off: loses dedup but gains visibility into re-fires.
- **Effort**: S • **Risk**: low

## Out of Scope / Won't Fix

- **Meta Pixel multi-init pattern (TK-423)** — Already covered in separate audit.
- **`beforeInteractive` script timing for AWIN/GTM (TK-424)** — Already covered.
- **Telemetry tail / 5.8-min request train (TK-428)** — Already covered.
- **GoogleOAuthProvider/InactivityTimeoutHandler gating (TK-429)** — Out of analytics scope.
- **Client-side FBPixelLoader multi-init (TK-423)** — Already audited; not retouching.
- **GA4 engagement event dedup via client_id** — GA4 measurement protocol is correct; not in scope.

---

**Audit Date**: 2026-04-26  
**Auditor**: Haiku 4.5 (Max Reasoning)  
**Status**: Complete
