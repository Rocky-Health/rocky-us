---
title: GLP LP Performance Audit (US)
status: Proposed
owner: Frontend / Performance
priority: 1
date: 2026-04-26
epic: TK-422
child-tickets:
  - TK-424 (F1 — beforeInteractive vendors)
  - TK-425 (F2 — above-fold image priority)
  - TK-426 (F3 — Fellix WOFF→WOFF2)
  - TK-430 (F4 — edge cache no-store)
  - TK-427 (F5 — vendor pruning on cold LPs)
  - TK-428 (F6 — persistent telemetry tail)
  - TK-429 (F7 — 775 KiB unused JS)
related-files:
  - app/layout.jsx
  - app/(marketing)/glp1-offer-hero/page.jsx
  - app/(marketing)/glp2-offer-hero/page.jsx
  - components/GLP1Offer/GLP1HeroSection.jsx
  - components/RockyInTheNews.jsx
  - components/BodyOptimization/bo3/NewProudPartner.jsx
  - components/GLP1Offer/GLP1ProductTiers.jsx
  - components/GLP1Offer/GLP1TestimonialsShowcase.jsx
  - components/Layout/ZendeskWidget.jsx
  - components/Footer/Footer.jsx
  - components/FBPixelLoader.jsx
  - components/Layout/AttributionTracker.jsx
  - components/Layout/InactivityTimeoutHandler.jsx
  - components/Layout/GoogleOAuthProvider.jsx
  - components/Layout/GlobalQuebecPopup.jsx
  - components/Layout/MetaCookieInitializer.jsx
  - middleware.js
  - next.config.mjs
  - vercel.json
  - fonts/Fellix-Medium.woff
  - fonts/Fellix-SemiBold.woff
---

# GLP LP Performance Audit (US)

## Context

Six PageSpeed Insights (PSI) mobile runs and a HAR capture were performed against the GLP-1 paid landing page (`https://www.myrocky.com/glp1-offer-hero`). The findings rank as **priority 1** because this LP receives paid traffic and its current state directly affects conversion economics.

Source data:

- **PSI mobile runs:** scores 33, 37, 38, 50, 54, 55. LCP between **4.7 s and 14.2 s** ("good" is <2.5 s). The **22-point variance** across identical runs is the smoking gun — it means the bottleneck is main-thread contention from racing vendor scripts, not TTFB or asset weight alone, and different users are getting materially different experiences.
- **HAR file:** **218 requests, 4 MB transferred** on cold mobile load. **60–65% of requests and 2.3 MB of weight come from vendor scripts**, not first-party code or images. **20+ vendors** on a single LP. PSI flags GTM alone consuming **982 ms of main-thread time**. GTM, Convert.com, and Heatmap all load with `beforeInteractive`, which blocks hydration.
- **Industry comparison:** Hims's GLP-1 LP runs **7 vendors total** with first-party server-side GTM. We're at 20+ with client-side GTM.

GLP-2 (`/glp2-offer-hero`) shares the root layout and ~95% of components with GLP-1, so most fixes apply to both LPs from the same edit. The two pages are tracked together throughout this audit.

This document is the canonical source for the GLP LP performance audit. Each `## N. F_N` section below corresponds to one Jira child of [TK-422](https://myrocky.atlassian.net/browse/TK-422). Implementation status, owner, and progress live on the Jira tickets; design rationale and root-cause analysis live here.

---

## Scope

**In scope** (priority-1 LPs for this audit):

- `app/(marketing)/glp1-offer-hero/page.jsx` → `/glp1-offer-hero`
- `app/(marketing)/glp2-offer-hero/page.jsx` → `/glp2-offer-hero`

**Implicitly affected** (because changes touch shared infrastructure):

- Site-wide root layout: `app/layout.jsx` (vendor scripts, fonts)
- Site-wide font assets: `fonts/Fellix-*.woff`
- Site-wide global components mounted in `ClientLayoutProvider`
- Other marketing LPs likely share the same `no-store` / cache-bypass issue (F4) — flagged as a follow-up sweep.

**Out of scope:**

- Migration to first-party server-side GTM (a strategic shift; flagged as a follow-up vs. the Hims comparison).
- Backend WordPress/WooCommerce changes.
- CRM portal (`crm.myrocky.com`) and patient portal (`account.myrocky.com`).
- The metadata title bug on `/glp2-offer-hero` (it currently says "GLP-1 Weight Loss Program" — a copy issue, not a perf finding; track separately if it matters).

---

## Investigation summary (already done)

For F4 specifically, the codebase was audited end-to-end for the source of `Cache-Control: no-store`. None of the usual suspects are at fault:

- The LP page files do **not** export `dynamic`, `revalidate`, `fetchCache`, or `runtime`. They don't use `cookies()`, `headers()`, or `searchParams`.
- `middleware.js` does **not** set any cache header on these routes.
- `next.config.mjs` has no `headers()` function.
- `vercel.json` has no `headers` array.
- No `(marketing)/layout.js` exists; the only parent layout is the root `app/layout.jsx`, which doesn't force dynamic.

The most plausible cause is a Next.js 16 default: an `async` Server Component with no `revalidate` export defaults to dynamic rendering, which Vercel responds to with `no-store`. See F4 below.

---

## 1. F1 — Move blocking vendor scripts off `beforeInteractive`

> **Jira:** [TK-424](https://myrocky.atlassian.net/browse/TK-424)
> **Files:** `app/layout.jsx`
> **LPs:** Both (root layout — affects every page)

### Summary

Four vendor scripts in the root layout use `strategy="beforeInteractive"`, which blocks hydration on every page. PSI flags GTM alone consuming **982 ms of main-thread time** on the GLP-1 LP. These four scripts explain most of the 22-point PSI variance (33→55) observed across six identical mobile runs.

### Root cause

In `app/layout.jsx`:

| Line | Vendor | Strategy |
| --- | --- | --- |
| L101–119 | AWIN MasterTag | `beforeInteractive` |
| L122–130 | Google Tag Manager | `beforeInteractive` |
| L140–144 | Convert.com Experiences | `beforeInteractive` |
| L172–174 | Heatmap.com | `beforeInteractive` |

`beforeInteractive` blocks hydration until the script finishes. With four of them racing on every cold load, the page renders but isn't interactive until they all settle — hence the LCP variance.

### Proposed fix

Two options, in order of preference:

1. **Route-gate on cold paid LPs.** Move script mounting into a child component that reads `usePathname()` (or read pathname from headers server-side) and skips loading these four scripts when the path matches `/glp1-offer-hero`, `/glp2-offer-hero`, or any future `*-offer-hero` LP.
2. **Downgrade strategy site-wide.** Change `beforeInteractive` → `lazyOnload` for all four. Validate that page-level GTM `dataLayer` pushes still register correctly — they'll queue against the placeholder `dataLayer` array and replay once GTM loads.

Convert.com and Heatmap.com on cold paid traffic are worth a separate gut-check — see F5.

### Expected impact

- Eliminate the 982 ms GTM main-thread block on cold load.
- Collapse the 22-point PSI variance (the racing-script hypothesis is what produces it).
- LCP improvement toward <2.5 s.

### Verification

1. Re-run PSI mobile against `/glp1-offer-hero` and `/glp2-offer-hero`; expect score >75, LCP <2.5 s, variance <10 points across 5 runs.
2. Network panel on a cold load: confirm GTM/AWIN/Convert/Heatmap requests fire AFTER `DOMContentLoaded`, not before.
3. Confirm GTM-driven events (PageView, AddToCart, Purchase, etc.) still fire correctly — replay the LP → quiz → checkout funnel and check GTM debug + Events Manager.

### Out of scope for F1

- Migration to first-party server-side GTM (strategic; flagged as audit follow-up vs. Hims comparison).
- Removing Convert.com / Heatmap.com from cold-LP traffic entirely (F5).

---

## 2. F2 — Set `priority` on above-fold images

> **Jira:** [TK-425](https://myrocky.atlassian.net/browse/TK-425)
> **Files:** `components/GLP1Offer/GLP1HeroSection.jsx`, `components/RockyInTheNews.jsx`, `components/BodyOptimization/bo3/NewProudPartner.jsx`, `components/GLP1Offer/GLP1ProductTiers.jsx`, `components/GLP1Offer/GLP1TestimonialsShowcase.jsx`, `components/CustomImage.jsx` (and the `CustomContainImage` wrapper)
> **LPs:** Both (shared components)

### Summary

Eight above-the-fold images on the GLP LPs are set to lazy-load by default. PSI flags **~1 MB of savings** if these are switched to eager priority load. This is the single largest no-risk transfer-size win in the audit.

### Affected images (above-fold on cold mobile)

| File | Component / lines | Image set | Status |
| --- | --- | --- | --- |
| `components/GLP1Offer/GLP1HeroSection.jsx` | `BeforeAfterStrip` L61–84 | 4 before/after pairs = **8 images** in the hero strip | No `priority`, `unoptimized fill` ❌ |
| `components/GLP1Offer/GLP1TestimonialsShowcase.jsx` | L48–54 | Vial product image | No `priority` ❌ (rendered absolute, may fall below mobile fold) |
| `components/RockyInTheNews.jsx` | L59–64 | 9 news-logo images via `CustomContainImage` | No `priority` ❌ |
| `components/BodyOptimization/bo3/NewProudPartner.jsx` | L27–65 | 4–5 partner logos via `CustomContainImage` | No `priority` ❌ |
| `components/GLP1Offer/GLP1ProductTiers.jsx` | L15–20 | Product tier images via `CustomImage` | No `priority` ❌ |
| `components/Glp2OfferHeader.jsx` | L10–17 | MyRocky logo | `priority` ✅ already set |

### Root cause

Above-fold images use `CustomImage` and `CustomContainImage` wrappers around `next/image`. The wrappers don't pass `priority` through, and callers don't set it. Default behavior is lazy.

### Proposed fix

1. **Wrappers:** Verify `CustomImage` and `CustomContainImage` accept and forward a `priority` prop to the underlying `next/image`. Add the pass-through if missing.
2. **Hero strip:** Add `priority` to the 8 `<Image>` tags in `BeforeAfterStrip` (`components/GLP1Offer/GLP1HeroSection.jsx` L61–84).
3. **First-row logos:** Add `priority` to the first 3–4 `RockyInTheNews` logos (above the fold on mobile) and the `NewProudPartner` logos that render in the hero checklist area on the GLP-2 LP.
4. **Product tiers and testimonial vial:** Verify whether they're truly above-fold on mobile (375 px viewport). If yes, add `priority`. If no, leave as lazy.

Be specific — don't blanket-add `priority` everywhere or you'll flood the network with parallel image requests.

### Expected impact

- ~1 MB transfer savings on cold mobile load (PSI estimate).
- LCP improvement (LCP element on this LP is likely one of the hero strip images or the product image).

### Verification

1. PSI mobile: "Defer offscreen images" callout drops the 8 hero images.
2. Re-capture HAR on cold mobile load: priority images should fire in the first network wave (before `DOMContentLoaded`), not after the page becomes idle.
3. LCP element in PSI report should resolve to a known above-fold image.

### Out of scope for F2

- Migrating images to next/image-optimized URLs (some currently use `unoptimized` against `myrocky.b-cdn.net`). Separate ticket if needed.
- Image size/format optimization (AVIF/WebP). PSI may flag separately.

---

## 3. F3 — Migrate Fellix fonts WOFF → WOFF2

> **Jira:** [TK-426](https://myrocky.atlassian.net/browse/TK-426)
> **Files:** `app/layout.jsx` (L26–45), `fonts/Fellix-Medium.woff`, `fonts/Fellix-SemiBold.woff`
> **Affected pages:** Site-wide. Surfaced via the GLP LP audit.

### Summary

Fellix Medium and Fellix SemiBold are loaded as WOFF only. WOFF2 is ~30% smaller for the same font data and is supported by 99%+ of modern browsers. PSI flags **~36 KB of savings** when fonts ship as WOFF2.

### Root cause

`app/layout.jsx` L26–45:

```js
const fellixMedium = localFont({
  src: "../fonts/Fellix-Medium.woff",
  variable: "--font-fellix",
  display: "swap",
});

const fellixSemiBold = localFont({
  src: "../fonts/Fellix-SemiBold.woff",
  variable: "--font-fellix-bold",
  display: "swap",
});
```

The `fonts/` directory only contains WOFF files. Poppins (loaded via `next/font/google`) already serves WOFF2 — only Fellix is affected.

### Proposed fix

1. Source WOFF2 versions of Fellix Medium and Fellix SemiBold (regenerate from the original TTF/OTF if available, or use `woff2_compress` against the existing WOFF).
2. Add the WOFF2 files to `fonts/` alongside the existing WOFF.
3. Update `app/layout.jsx` to point `localFont({ src: ... })` at an array with WOFF2 first, WOFF as fallback:

```js
const fellixMedium = localFont({
  src: [
    { path: "../fonts/Fellix-Medium.woff2", style: "normal" },
    { path: "../fonts/Fellix-Medium.woff", style: "normal" },
  ],
  variable: "--font-fellix",
  display: "swap",
});
```

4. Confirm `next/font/local` is preloading the WOFF2 (it should by default — check the rendered `<link rel="preload">` in HTML source).
5. Once WOFF2 is verified in production, decide whether to delete the WOFF fallbacks (browser support for WOFF2 is universal in modern browsers — see `caniuse.com/woff2`).

### Expected impact

- ~36 KB transfer savings per cold pageview (across both fonts combined).
- Marginal but consistent LCP improvement on font-heavy LPs.
- Affects every page on the site, not just the GLP LPs.

### Verification

1. PSI: "Use modern image/font formats" callout no longer flags Fellix.
2. Network panel on cold load: font requests are `.woff2` URLs and Content-Type is `font/woff2`.
3. Visual regression check: open the GLP LPs, homepage, product pages, checkout — confirm typography hasn't shifted.

### Out of scope for F3

- Replacing Fellix entirely (hosted/licensed font; not changing).
- Tuning `display: swap` behavior or adding a `fontDisplay: optional` strategy. Separate ticket if FOUC becomes an issue.

---

## 4. F4 — Restore edge cache (no-store / Vercel cache MISS)

> **Jira:** [TK-430](https://myrocky.atlassian.net/browse/TK-430)
> **Files:** `app/(marketing)/glp1-offer-hero/page.jsx`, `app/(marketing)/glp2-offer-hero/page.jsx`
> **LPs:** Both (likely many other marketing pages too — see "Follow-up")

### Summary

Both GLP LPs respond with a `no-store` cache directive and `X-Vercel-Cache: MISS` on every request. The Vercel edge cache is being bypassed and the HTML document is regenerated on every visit — including every cold click-through from SMS, email, and paid ads.

### Investigation findings

See "Investigation summary" at the top of this doc. The codebase has been audited end-to-end and none of the usual sources of `no-store` are present. Specifically:

- LP page files do not export `dynamic`, `revalidate`, `fetchCache`, or `runtime`, and don't use `cookies()` / `headers()` / `searchParams`.
- `middleware.js`, `next.config.mjs`, and `vercel.json` do not set cache headers on these routes.

### Root cause hypothesis

In Next.js 16, an `async` Server Component without an explicit `revalidate` export defaults to dynamic rendering, which Vercel responds to with the `no-store` cache directive. Both LP pages are declared `export default async function` but do no actual data fetching — Next.js still classifies them as dynamic by default.

### Proposed fix

**Preferred — minimal change:**

Add `export const revalidate = 3600;` (or another sane TTL — 1 hour is reasonable for a paid LP that doesn't change between deploys) to:

- `app/(marketing)/glp1-offer-hero/page.jsx`
- `app/(marketing)/glp2-offer-hero/page.jsx`

This opts the page into ISR. After the first request regenerates the HTML, subsequent requests hit the edge cache until the TTL expires or a deploy invalidates it.

**Alternative — Cache Components (Next.js 16):**

Migrate to Cache Components using the `'use cache'` directive on the page or its sections, with `cacheTag('glp-lp')` for tag-based invalidation. This gives finer-grained control (e.g., personalized header above a cached body). Out of scope for the first pass unless personalization is needed.

### Expected impact

- Vercel cache reports HIT for repeat traffic (which is most paid LP traffic, since SMS/email blasts hit the same URL repeatedly).
- TTFB drops from regenerate-time to single-digit ms once the cache is warm.
- Compounds with the script-loading and image-priority fixes — a cached HTML doc that also doesn't block on `beforeInteractive` scripts is fundamentally different from the current state.

### Verification

1. After deploy, fetch the LP twice with HEAD requests (e.g. via `curl`).
   - First call: Vercel cache MISS is acceptable (cache warming).
   - Second call: Vercel cache HIT. Response should NOT carry the `no-store` directive.
2. Repeat for both `/glp1-offer-hero` and `/glp2-offer-hero`.
3. PSI: TTFB should drop on subsequent runs from regenerate-time to under 100 ms.

### Out of scope for F4

- Auditing every other marketing page for the same issue (flagged as a follow-up sweep — see end of doc).
- Edge personalization (separate ticket if needed; would push toward Cache Components or middleware-driven personalization).
- Cache invalidation strategy on deploys (Vercel handles this automatically by default — confirm during verification that a re-deploy clears the LP cache).

---

## 5. F5 — Gate Zendesk, BugHerd, and Heatmap.com off cold paid LPs

> **Jira:** [TK-427](https://myrocky.atlassian.net/browse/TK-427)
> **Files:** `components/Layout/ZendeskWidget.jsx`, `components/Footer/Footer.jsx`, `app/layout.jsx`
> **LPs:** Both (likely all `*-offer-hero` paid LPs)

### Summary

Three vendor scripts ship on cold paid LP traffic that have no business being there:

- **Zendesk** chat widget — ~286 KiB, on cold traffic that won't engage with chat
- **BugHerd** — ~46 KiB, internal QA tool preloaded for every public visitor
- **Heatmap.com** — ~80 KiB, session-replay vendor whose insight value should be re-validated

Together they account for **~412 KiB of avoidable third-party weight** on the LP.

### Source signals

| Vendor | Size | Currently mounted at |
| --- | --- | --- |
| Zendesk Web Widget | 286 KiB | `components/Layout/ZendeskWidget.jsx` L94–105 (`lazyOnload`, mounted in root layout via `ClientLayoutProvider`) |
| BugHerd | 46 KiB | `components/Footer/Footer.jsx` L407–410 (`afterInteractive`, ships with footer site-wide) |
| Heatmap.com | 80 KiB | `app/layout.jsx` L172–174 (`beforeInteractive`) |

Heatmap.com is also covered by F1 (timing). F5 asks the orthogonal question: should it ship at all on paid LPs?

### Why each one is questionable on cold paid LPs

- **Zendesk:** Cold paid traffic is not the audience for chat support. Chat helps logged-in customers and pre-purchase questions on product pages. A visitor on `/glp1-offer-hero` who isn't ready to buy isn't going to open chat — they bounce.
- **BugHerd:** Internal QA tool for the engineering/QA team. It should not load for production paid traffic at all. Every cold visitor is paying 46 KiB to run a QA sidebar they will never see.
- **Heatmap.com:** Question for product/growth: is this producing real, actionable insight that Microsoft Clarity (also installed) doesn't already produce? If not, kill it everywhere. If yes, decide whether the GLP LP specifically needs it (Clarity gives you the same heatmap data).

### Proposed fix

1. **BugHerd:** Wrap the `<Script>` in `Footer.jsx` L407–410 with an env-or-cookie gate. Load only if `NEXT_PUBLIC_ENABLE_BUGHERD === 'true'` (preview/staging), or only for an internal-team cookie. Don't ship to production paid traffic.
2. **Zendesk:** Add a route gate in `ZendeskWidget.jsx` (the widget already controls itself, so add a `usePathname()` check that skips initialization on `*-offer-hero` paths and any other cold paid LP paths). Keep it loading on `/checkout`, `/cart`, `/my-account`, product pages.
3. **Heatmap.com:** Decision required from product/growth before this ships. Options:
   - Kill it site-wide if not producing unique value vs. Clarity.
   - Keep it but route-gate on cold paid LPs only.
   - Keep it as is. (No change.)

   Until the decision lands, do nothing here — F1 already handles the immediate timing-blocking concern.

### Expected impact

- ~286 KiB savings on the LP from removing Zendesk.
- ~46 KiB savings from removing BugHerd.
- ~80 KiB additional savings if Heatmap.com is also pulled.
- Cumulative: up to **~412 KiB of vendor weight off paid LPs**.
- Reduces total third-party request count meaningfully (Zendesk alone fires multiple requests).

### Verification

1. Cold-load `/glp1-offer-hero` and `/glp2-offer-hero` in an incognito window.
2. Network panel: confirm no requests to `static.zdassets.com`, `bugherd.com`, or (if pulled) `heatmap.com`.
3. Cold-load `/checkout` and `/product/cialis`: confirm Zendesk DOES still load (regression check).
4. Re-run PSI mobile against the GLP LPs: confirm "Reduce third-party impact" callout drops these vendors.

### Out of scope for F5

- Replacing Zendesk with a different chat vendor.
- Removing Microsoft Clarity (`app/layout.jsx` L161–169). Clarity is `afterInteractive` and produces useful insight — leave it unless the Heatmap.com decision says we have duplicate session-replay tooling.
- Convert.com on paid LPs — Convert is an A/B-testing framework that may legitimately need to run on the LP for live experiments. Different decision than session replay.

---

## 6. F6 — Stop persistent 5.8+ minute telemetry tail

> **Jira:** [TK-428](https://myrocky.atlassian.net/browse/TK-428)
> **Files:** `app/layout.jsx`, `components/FBPixelLoader.jsx`, `components/Layout/AttributionTracker.jsx`, `utils/ga4Events.js`, `utils/tiktokEvents.js`, `components/Layout/ZendeskWidget.jsx`
> **LPs:** Both

### Summary

The GLP-1 LP never goes "quiet" — telemetry continues firing for **5.8+ minutes after page load**. **45 of 218** requests in the HAR fire >5 seconds after page load. This is bad for battery life on mobile, bad for users on metered connections, and inflates analytics noise without producing usable insight.

### Source signal

HAR capture against `/glp1-offer-hero`, cold mobile load:

- 218 total network requests over the capture window.
- 45 of those (~21%) fire later than 5 s after `loadEventEnd`.
- The tail extends past 5 minutes, suggesting interval-based telemetry pings rather than user-event-driven tracking.

### Likely contributors

This requires investigation in DevTools, but the prime suspects given the codebase are:

| Suspect | Source | Behavior |
| --- | --- | --- |
| **Heatmap.com** | `app/layout.jsx` L172–174 | Session replay typically pings on a heartbeat (every 5–30 s) for as long as the tab is open. |
| **Microsoft Clarity** | `app/layout.jsx` L161–169 | Same — session-replay heartbeat. |
| **Meta Pixel re-fires** | `components/FBPixelLoader.jsx` | If `disablePushState` ever flips off or any effect re-runs, can re-fire PageView on the (incorrectly-multi-init'd) pixels. (Cross-references TK-423.) |
| **Attribution Tracker** | `components/Layout/AttributionTracker.jsx` | Pushes to `dataLayer` on every route change; on a static LP shouldn't be the culprit but worth confirming. |
| **Zendesk** | `components/Layout/ZendeskWidget.jsx` | Maintains a long-poll/WebSocket channel even when the widget is closed. |
| **GA4 / TikTok engagement events** | `utils/ga4Events.js`, `utils/tiktokEvents.js` | `engagement_time_msec` heartbeats fire every ~10–15 s by GA4 default. |

### Proposed fix

This is more diagnostic than prescriptive. The right unit of work is:

1. **Reproduce in DevTools.** Open `/glp1-offer-hero` on a cold profile, open Network panel, sort by Time. After 1 minute idle, classify every request that fired post-`load` by domain → vendor.
2. **Quantify.** Build a small table: vendor → request count in 0–60 s window, request count in 60–360 s window. Identify the top 3 contributors to the tail.
3. **Decide per-vendor what's acceptable.**
   - Session-replay heartbeats from Clarity / Heatmap are by design — but **only if we're actually using the recordings**. If we are: keep. If we aren't: kill.
   - GA4 `engagement_time_msec` heartbeat is by design and correlates to actual reporting. Generally keep.
   - Anything else firing post-`load` should justify itself or get gated.
4. **Implementation.** Once the top contributors are identified, the fix is likely: gate session-replay vendors on cold paid LPs (overlaps with F5), and audit `setInterval` / `setTimeout` usage in our own analytics utils for stuck loops.

### Expected impact

- Lower battery drain and data usage for mobile users on the LP.
- Cleaner analytics — fewer noise events when the user is idle or has the tab in the background.
- Compounds with F5: gating Zendesk / Heatmap removes a meaningful chunk of the tail by itself.

### Verification

1. Re-capture HAR on cold mobile load. Filter to requests with `Time > 60 s`. Expect <10 requests in this window (down from 45+).
2. Confirm the vendors that remain are intentional (GA4 heartbeat, Vercel Speed Insights pings, etc.).
3. No regression in the analytics that the product team actually uses (purchase events, attribution, funnel reports).

### Out of scope for F6

- Removing GA4 entirely (the heartbeat is by design).
- Switching to a session-replay-free analytics stack (strategic, not tactical).
- Server-side tracking migration (Northbeam, Meta CAPI, TikTok CAPI are server-side and already handled correctly).

---

## 7. F7 — Reduce 775 KiB unused JS shipped on cold paid LPs

> **Jira:** [TK-429](https://myrocky.atlassian.net/browse/TK-429)
> **Files:** `app/layout.jsx`, `components/FBPixelLoader.jsx`, `components/Layout/ZendeskWidget.jsx`, `components/Layout/MetaCookieInitializer.jsx`, `components/Layout/InactivityTimeoutHandler.jsx`, `components/Layout/GoogleOAuthProvider.jsx`, `components/Layout/GlobalQuebecPopup.jsx`, `components/Footer/Footer.jsx`
> **LPs:** Both

### Summary

PSI Coverage analysis flags **~775 KiB of JavaScript** shipped to the GLP-1 LP that doesn't execute on this page. The waste comes from two sources:

1. **Code-side:** Globally-mounted feature components in the root layout that aren't needed on a cold paid LP (account session handlers, OAuth provider, popups, FBPixelLoader for non-LP categories).
2. **GTM-config-side:** Tags configured in the GTM container for other pages (checkout, account, blog) that still ship in the container payload, but don't fire on this URL.

This finding scopes the code-side. The GTM-config-side is managed in the GTM UI and is flagged as a follow-up.

### Code-side contributors (audited)

`app/layout.jsx` and `ClientLayoutProvider` mount these on every page:

| Component | Cost on cold LP | Justification on cold LP |
| --- | --- | --- |
| `FBPixelLoader` | Loads `connect.facebook.net/en_US/fbevents.js` (Meta Pixel SDK ~80 KiB gzipped) + 6 pixel inits | Needed (it's a paid LP). But TK-423 already plans to fix the multi-init bug. |
| `ZendeskWidget` | ~286 KiB | **Not needed on cold LP** — see F5. |
| `MetaCookieInitializer` | Sets up `_fbp` / `_fbc` cookies | Needed (paid traffic, attribution). |
| `InactivityTimeoutHandler` | Logs out idle users | **Not needed for guests** — guards `authToken` cookie holders only. Should be no-op gated. |
| `GoogleOAuthProvider` | `@react-oauth/google` library | **Not needed on LP** — only used on auth flows. |
| `GlobalQuebecPopup` | ~small | **Not needed on US** — Quebec is a CA concern. Shouldn't ship in the US bundle. |
| `AttributionTracker` | Pushes UTM/click IDs to `dataLayer` | Needed (paid traffic). |
| `BugHerd (Footer)` | ~46 KiB | **Not needed in production** — see F5. |

### Proposed fix

1. **Audit `ClientLayoutProvider` for guest-vs-auth gating.** `InactivityTimeoutHandler` should be a no-op (or unmounted entirely) when there's no `authToken` cookie. Same for any account-only components.
2. **`GoogleOAuthProvider`:** Move from root layout to a per-route boundary (`/login`, `/signup`, account flows). Use `dynamic(() => import('...'), { ssr: false })` or simply mount the provider inside `app/(auth)/layout.jsx` instead of the root.
3. **`GlobalQuebecPopup`:** If this is CA-only, conditionally render based on locale/site flag. In the US bundle it shouldn't ship at all. Confirm with product whether it's intentionally in the US codebase (e.g., for cross-border visitors) — if not, remove from `app/layout.jsx`.
4. **`ZendeskWidget` and `BugHerd`:** Covered by F5. Don't double-implement.
5. **Cross-reference TK-423.** Fixing the Meta Pixel multi-init drops 5 unnecessary pixel inits and the auto-PageView traffic, but doesn't remove the SDK itself (which is still needed). Leave that work in TK-423.
6. **GTM container slim-down (out of scope here, log as follow-up).** Open the GTM container for `GTM-K9PC394B` and audit which tags fire only on non-LP routes — ideally split into a dedicated container for paid LPs or use trigger conditions to keep them out of the LP payload.

### Expected impact

- Realistic code-side savings: **~100–200 KiB** of unused JS off the LP after gating `InactivityTimeoutHandler`, `GoogleOAuthProvider`, and `GlobalQuebecPopup`.
- Combined with F5 (~412 KiB) and the GTM container slim-down follow-up (~250+ KiB), realistic cumulative: **600–800 KiB** of unused JS removed from cold paid LP loads.

### Verification

1. PSI Coverage analysis on cold-loaded `/glp1-offer-hero` after each change. Track the "Reduce unused JavaScript" total — expect to drop from 775 KiB toward <250 KiB.
2. Bundle analyzer (`@next/bundle-analyzer`) before/after to confirm the chunks containing the gated components are no longer in the LP route's first-load JS.
3. Regression checks: `/checkout`, `/login`, `/my-account`, `/cart` still work as expected (Inactivity timeout fires, OAuth still mounts on login, account flows unchanged).

### Out of scope for F7

- The GTM container audit and slim-down (managed in GTM UI, not git). Track separately under TK-422 once this code-side work lands.
- Migrating to first-party server-side GTM (strategic; cross-referenced in F1).
- Code-splitting refactor of the broader `ClientLayoutProvider`. The targeted gating above is sufficient for this audit; a deeper refactor can come later.

---

## End-to-end verification (after all 7 land)

Standard end-to-end test for the full audit, run after each finding ships and again after all seven have landed:

1. **PSI mobile** against `/glp1-offer-hero` and `/glp2-offer-hero`. Expect:
   - Score >75 (up from 33–55).
   - LCP <2.5 s (down from 4.7–14.2 s).
   - Variance <10 points across 5 runs (down from 22).
2. **Cache headers.** `curl`-style HEAD request to each LP twice. First MISS is acceptable (warming); second should HIT and the response should not carry `no-store`.
3. **HAR re-capture** on cold mobile load. Expect:
   - Vendor request count <80 (down from 218).
   - Total transfer <2 MB (down from 4 MB).
   - No requests >5 s after load (excluding intentional engagement events).
4. **Funnel regression check.** Replay LP → quiz → checkout on both LPs. Confirm GTM events, Meta CAPI dedup, GA4 conversions, and Northbeam attribution all still fire correctly.

---

## Follow-ups (not yet ticketed)

- **Cache audit, site-wide.** Once F4's pattern is verified on the GLP LPs, audit every other marketing page (`/`, blog, FAQ, product pages) for the same `no-store` / cache-bypass issue. The Next.js 16 default likely affects all of them.
- **GTM container slim-down.** Open `GTM-K9PC394B` and audit which tags fire only on non-LP routes. Ideally split into a dedicated container for paid LPs or use trigger conditions to keep tags out of the LP payload.
- **First-party server-side GTM migration.** Strategic shift to match the Hims approach (7 vendors, server-side GTM).

---

## Cross-references

- **TK-422** — parent epic: _US Code Full Audit and Optimizations_.
- **TK-423** — _Meta Pixel Multi-Init Fix (US)_. F6 and F7 both reference it: F6 because pixel re-fires may contribute to the telemetry tail; F7 because fixing the multi-init drops 5 unnecessary pixel inits per LP load. Doc: [`docs/codebase-audit/meta-pixel-multi-init-fix.md`](./meta-pixel-multi-init-fix.md).
