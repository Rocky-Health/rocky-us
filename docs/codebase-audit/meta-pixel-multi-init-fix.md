---
title: Meta Pixel Multi-Init Fix (US)
status: Implemented (2026-04-26)
ticket: TK-423
owner: Frontend / Growth Engineering
related-files:
  - components/FBPixelLoader.jsx
  - middleware.js
  - utils/metaCapiConfig.js
  - utils/metaBrowserEventConfig.js
---

# Meta Pixel Multi-Init Fix (US)

## Summary

Every Rocky US landing page is currently firing PageView events on **all 6 Meta pixels in the codebase**, regardless of which product category the visitor is on. Three of those pixels are tied to product categories that are not offered on the US site at all (Smoking Cessation, Skincare, Mental Health), meaning US visitor data is being sent to pixels that should not exist in the US deployment.

This document captures the root cause, the impact, and the proposed fix.

---

## 1. Background — How Pixel Selection Is Supposed to Work

Rocky operates a multi-pixel Meta setup, with one pixel per product category. The intent is:

- A visitor on `/glp1-offer-hero` (Weight Loss LP) should fire a PageView on the *Weight Loss* pixel only.
- A visitor on `/product/cialis` (ED product page) should fire a PageView on the *ED* pixel only.
- A visitor on `/blog` or the homepage should fire on a single appropriate fallback pixel.

The category-routing logic for this lives in [components/FBPixelLoader.jsx](../components/FBPixelLoader.jsx) — `getPixelKeyForPath()` correctly resolves the category for the current route via prefix matching, product-keyword matching, and (for `/product/*` routes) async category lookup.

That part works. The problem is what happens *before* the category is resolved.

---

## 2. The 6 Pixels Currently Firing

Identified from the network trace shared by the Meta team (network panel filtered by `facebook` on a `/glp1-offer-hero` LP):

| Pixel ID | Category Constant | Notes |
|---|---|---|
| `522677764108011` | ED | Active in US |
| `1451450365779499` | Weight Loss | Active in US |
| `754893718769214` | Hair Loss | Active in US |
| `1311848663202831` | Smoking Cessation | **Should not exist in US bundle** |
| `1843271713209245` | Skincare | **Should not exist in US bundle** |
| `799609076328562` | Others / Mental Health (catch-all) | **Likely not registered in US Events Manager — needs confirmation** |

---

## 3. Root Cause

The pixel loader initializes **all pixels in the map at module load time**, before any category resolution happens. As soon as `fbevents.js` finishes loading, Meta automatically fires a `PageView` for every initialized pixel.

The category-aware `trackSingle("PageView", ...)` call that runs afterward is *additive* — it sends a second, targeted PageView to the correct pixel. It does **not** suppress the auto-PageViews that the other 5 pixels emit on init.

Net effect: 6 PageViews per LP load, on 6 different pixels, instead of 1 PageView on 1 pixel.

A secondary consequence is that the stub-and-init logic runs at module scope (top-level), not inside the React effect, so the auto-PageViews fire *before* the component even mounts and *before* path-based routing has a chance to choose the correct pixel.

---

## 4. Why This Is Worse Than Just Noise

### 4.1 Attribution and ROAS pollution

Every pixel sees every visitor, regardless of intent. Per-pixel:

- Audience definitions (e.g. "visited a WL LP") become meaningless — every pixel saw every visitor.
- Funnel and conversion-path analysis is corrupted.
- Per-category ROAS reporting in Meta Ads Manager cannot be trusted.

### 4.2 CAPI deduplication is at risk

Server-side Meta CAPI events are sent with a single resolved pixel ID and an `event_id`. Meta dedup pairs the browser pixel + server CAPI on `(pixel_id, event_id)`. Today the browser is firing the same event from up to 6 pixels — only one of those will dedupe against the CAPI counterpart. The other 5 register as standalone duplicate browser events.

### 4.3 US compliance — pixels firing for product categories not offered in the US

Three of the six pixels are tied to product categories that are explicitly not offered on the US storefront:

- **Smoking Cessation** (`1311848663202831`) — Zonnic and the smoking program are Canada-only. Zonnic is a Health Canada-authorized product (see zonnic.ca) and is not part of the US offering.
- **Skincare** (`1843271713209245`) — acne, anti-aging, and hyperpigmentation creams are not offered on the US storefront. There is no skincare entry in the US navbar, sitemap, or product index on myrocky.com. URLs like `myrocky.com/skincare`, `myrocky.com/acne-cream`, `myrocky.com/anti-aging-cream`, and `myrocky.com/hyper-pigmentation-cream` redirect to `/blocked`.
- **Mental Health / Others** (`799609076328562`) — mental-health treatments are not offered in the US. URLs like `myrocky.com/mental-health`, `myrocky.com/mh-pre-quiz`, and `myrocky.com/mh-quiz` redirect to `/blocked`. Mental-health product pages (`/product/bupropion`, `/product/sertraline`, etc.) likewise redirect to `/blocked`.

There is no path on the US site where a Smoking, Skincare, or Mental-Health pixel should ever record a PageView, yet all three are firing on every LP today.

---

## 5. Proposed Fix

### 5.1 Stop initializing pixels that don't apply to the US bundle

Remove the `SMOKING`, `SKINCARE`, and `OTHERS` entries from the US `PIXEL_IDS` map. These categories are blocked at the middleware level — there is no scenario in which their pixels should be present in the US deployment.

This single change resolves:

- The "unknown 6th pixel" question (`799609076328562` will no longer load).
- The compliance concern (no Smoking/Skincare/MH pixel data leaving the US site).
- A portion of the dedup and attribution pollution.

The corresponding `ROUTE_PREFIXES`, `CATEGORY_SLUGS`, and `PRODUCT_KEYWORDS` keys for those categories should also be removed for consistency. The `OTHERS` fallback, where used for genuine non-categorized pages (homepage, blog), should fall through to the most appropriate remaining pixel — to be decided with the Meta team. A reasonable default is the highest-volume pixel (Weight Loss) so that homepage traffic isn't lost, but this is a Meta-team call.

### 5.2 Stop initializing all pixels at module load

Replace the "init all pixel IDs at module load" pattern with a strategy that only initializes the pixel for the resolved current route.

Two implementation options:

**Option A — Single-pixel init (preferred for US)**

After removing the three non-US pixels, the US bundle has 3 active pixels (ED, WL, HL). Initialize *only* the resolved pixel for the current route. On client-side navigation between categories, init the new pixel lazily the first time the visitor enters that category in the session, then continue using it for that category.

**Option B — Per-page init reset**

Defer the `init` call into the same effect that fires `trackSingle("PageView", ...)`. This guarantees init and PageView happen as a paired action on the correct pixel only.

Option A is preferred because it matches how Meta's multi-pixel guidance recommends handling per-category routing and avoids re-init churn during SPA navigation.

### 5.3 Audit `disablePushState` and the fbq stub

The current code sets `window.fbq.disablePushState = true;` at module scope to prevent Meta from auto-firing PageViews on `pushState` (Next.js client navigation). This behavior should be retained — we want PageView firing to be controlled exclusively by our `trackSingle` effect, not by Meta's auto-PushState handler.

The early-stub creation at module scope (so that `fbq("trackSingleCustom", ...)` calls from child effects are queued before the SDK loads) should also be retained — only the `init` loop is being changed.

### 5.4 Verification plan

After deploy, in DevTools network panel filtered by `facebook`:

1. Cold-load `/` (homepage) — verify *only* the resolved fallback pixel fires PageView.
2. Cold-load a WL LP (`/glp1-*`) — verify only `1451450365779499` fires.
3. Cold-load an ED page (`/product/cialis`) — verify only `522677764108011` fires.
4. Cold-load a Hair page (`/product/finasteride`) — verify only `754893718769214` fires.
5. SPA navigate between categories within a session — verify the previously-init'd pixel does not re-fire on the new page; the newly-resolved pixel fires once.
6. Confirm none of `1311848663202831`, `1843271713209245`, or `799609076328562` appear anywhere in the network log.
7. Compare against server CAPI logs (`app/api/meta-capi/*`) — `event_id` for each browser PageView should match exactly one CAPI counterpart in Meta Events Manager's *Test Events* and *Diagnostics* views.

---

## 6. Open Questions for the Meta Team

1. **Confirm `799609076328562` is not registered in the US Events Manager.** If it is, share which Business Manager / Ad Account it belongs to so we can decide whether to keep or remove it.
2. **Decide the fallback pixel for non-categorized US pages** (homepage, blog, FAQ, etc.). Default proposal: Weight Loss (highest volume).
3. **Decide whether Smoking, Skincare, and Mental Health pixels should be retired entirely on the US side**, or merely removed from the US bundle while remaining live for the CA deployment.

---

## 7. Out of Scope

- Changes to the CA deployment of the same loader (CA still legitimately uses all categories).
- Changes to server-side CAPI routing in `app/api/meta-capi/*` — those are already category-aware and route to a single pixel. Once the browser is fixed, dedup will fall into place automatically.
- Refactoring the broader analytics dispatch layer (`utils/analytics/analyticsService.js`) — out of scope for this fix; can be addressed separately if the Meta team's other findings point that way.

---

## 8. Rollout

1. Implement on a feature branch with the changes scoped to `components/FBPixelLoader.jsx`.
2. Verify in preview deploy using the verification plan above.
3. Coordinate with the Meta team to monitor Events Manager for ~48 hours post-deploy:
   - Confirm dropoff on the three retired pixels.
   - Confirm no regression in event volume on ED / WL / HL.
   - Confirm CAPI dedup rate improves to expected levels.

---

## 9. Implementation notes (2026-04-26)

Shipped scoped to `components/FBPixelLoader.jsx` per §8 step 1. No other files modified. Concrete changes:

- **`PIXEL_IDS` reduced from 6 → 3**: removed `SMOKING`, `SKINCARE`, `OTHERS`. Only `ED` / `WL` / `HL` remain.
- **`ROUTE_PREFIXES`, `CATEGORY_SLUGS`, `PRODUCT_KEYWORDS`, `FLOW_QUERY_MAP` reduced consistently** to ED/WL/HL — no dead lookups left to mis-route.
- **`getPixelKeyForPath` fallback changed from `"OTHERS"` → `"WL"`** via a new `FALLBACK_PIXEL_KEY` constant. Both `syncPixelId` and the async `/product/*` resolver use the same constant, so a future change of fallback is a one-line edit.
- **Module-level `ALL_PIXEL_IDS.forEach((id) => fbq("init", id))` loop removed.** Pixels now init lazily inside the PageView effect, gated by a module-scope `Set` (`initializedPixels`). First time a category is visited in the session, that category's pixel is init'd (which fires its auto-PageView for the correct pixel only); subsequent visits to the same category re-use the existing init and only fire `trackSingle("PageView")`. Different categories within the same session each init exactly once.
- **fbq stub creation and `disablePushState = true` retained at module scope** per §5.3 — needed so child useEffects calling `trackSingleCustom` (e.g. from `useQuestionnaireStepTracking`) don't lose calls before mount, and so SPA navigations don't double-fire via Meta's pushState handler.

### Out of scope for this PR (verified with grep)

The following references to `SMOKING` / `SKINCARE` / `OTHERS` pixel keys still exist in the US codebase. They were intentionally left untouched:

- **`utils/metaCapiConfig.js:60–86`** — server-side CAPI gateways. Out of scope per §7. These never fire on the US side because middleware blocks the routes that would route orders to those gateways.
- **`utils/metaBrowserEventConfig.js:20,22,23`** — duplicate `CATEGORY_PIXEL_MAP` for quiz/funnel events (consumed by `metaQuestionnaireTracking.js:68` with an `OTHERS` fallback). Spec scoped the fix to `PIXEL_IDS` in the loader; touching this file would need a deliberate replacement of the OTHERS safety-net fallback with WL, which is a separate, smaller cleanup.
- **`utils/tiktokCapiConfig.js`** — TikTok CAPI, unrelated to Meta.
- **`middleware.js`** flow params (`mh-flow`, `skincare-flow`) — unreachable on US (the routes that set them are blocked) but harmless to leave in place; cleanup is a separate concern.

### Verification status

- **Local:** structural review + `next build` pass (no lint setup in repo on Next.js 16; `next lint` removed upstream and there's no flat `eslint.config.js`).
- **Pre-deploy:** verification §5.4 steps 1–6 to be re-run on the preview deploy.
- **Post-deploy:** verification step 7 (CAPI dedup) to be confirmed with the Meta team during the ~48 h Events Manager soak per §8 step 3.
