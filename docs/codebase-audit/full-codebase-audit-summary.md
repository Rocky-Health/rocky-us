---
title: Full Codebase Audit — myrocky-front (US)
status: Proposed (tickets filed 2026-04-26)
date: 2026-04-26
epic: TK-422 — "US Code Full Audit & Optimizations"
auditors: 7 parallel Haiku 4.5 sub-agents (read-only static analysis)
related-tickets:
  - TK-422 (epic — umbrella for everything below)
  - TK-423 (Meta Pixel multi-init — pre-audit, separate spec; **shipped 2026-04-26**)
  - TK-424–430 (GLP LP performance audit — pre-audit, separate spec)
  - TK-431–445 (this audit — 15 tickets, see "Proposed Tickets" table below)
  - TK-446 (Northbeam order_tags overhaul — post-audit addition, see §"Post-audit additions")
---

# Full Codebase Audit — Summary

This document consolidates findings from a comprehensive static-analysis audit of the myrocky-front Next.js 16 + React 19 codebase (1,083 source files, ~164K LOC, 72 API routes, 774 components). Seven domain-specific audits ran in parallel; this summary aggregates and prioritizes their output.

**Scope excluded** (already covered by prior audits — do not duplicate when filing tickets):
- GLP-1 / GLP-2 LP performance — TK-422 epic (TK-424 vendor scripts, TK-425 image priority, TK-426 fonts, TK-427 route-gate vendors, TK-428 telemetry tail, TK-429 unused-component gating, TK-430 LP cache revalidate)
- Meta Pixel multi-init — TK-423

## Per-Domain Audit Index

| # | Domain | Doc | Findings | Lines |
|---|--------|-----|----------|-------|
| 1 | Quiz / Questionnaire mega-components | [`quiz-components-audit.md`](./quiz-components-audit.md) | 14 | 615 |
| 2 | Checkout & Cart critical path | [`checkout-cart-audit.md`](./checkout-cart-audit.md) | 13 | 266 |
| 3 | API Routes layer (72 routes) | [`api-routes-audit.md`](./api-routes-audit.md) | 14 | 143 |
| 4 | Tracking / Analytics | [`tracking-analytics-audit.md`](./tracking-analytics-audit.md) | 12 | 169 |
| 5 | Components & Layout (non-quiz, non-GLP) | [`components-audit.md`](./components-audit.md) | 15 | 151 |
| 6 | Marketing pages + site-wide cache sweep | [`marketing-cache-audit.md`](./marketing-cache-audit.md) | 12 | 308 |
| 7 | Cross-cutting code quality | [`code-quality-audit.md`](./code-quality-audit.md) | 16 | 207 |
| | **Total** | | **96** | **1,859** |

## Severity & Bucket Distribution (approximate)

| Severity | Count |
|----------|-------|
| **P0** — production bug, data loss, payment break, security/PII leak | **9** |
| **P1** — perf regression >15%, compliance risk, broken error handling on critical path | **24** |
| **P2** — quality, minor perf, dev velocity drag | **44** |
| **P3** — refactor / nice-to-have | **19** |

| Bucket | Count |
|--------|-------|
| Perf | 28 |
| Error / Error Handling | 24 |
| Bad Impl | 32 |
| Optimization | 12 |

## Top P0 Findings (file these first)

### 1. GA4-details endpoint exposes order PII without auth check
- **Doc:** API Routes F2 — `app/api/order/ga4-details/[id]/route.js:73–130`
- **Why P0:** any user can enumerate order IDs and scrape billing email, phone, full names, addresses, product list, totals.
- **Fix:** add `authToken` cookie verification + `userId` ownership check before returning data; 403 on mismatch.

### 2. Cart migration race condition on login
- **Doc:** Checkout & Cart F1 — `lib/cart/cartService.js:577–658`, `app/api/cart/migrate/route.js`
- **Why P0:** exponential retry without idempotency key → duplicate cart items or silent data loss on partial failure.
- **Fix:** add idempotency key per migration attempt; only clear local cart after verified success.

### 3. Fire-and-forget post-purchase attribution chain
- **Doc:** Checkout & Cart F2 — `components/OrderReceived/OrderReceivedPageContent.jsx:117–185`, `components/Checkout/CheckoutPageContent.jsx:2024–2398`
- **Why P0:** Meta CAPI / TikTok CAPI / Awin / Northbeam fire as async IIFE; user redirects before any complete. 5–10% of conversions silently lost from analytics → broken ROAS, lost audience signal.
- **Fix:** wrap in `Promise.allSettled` with timeout; await before redirect or accept risk explicitly with telemetry.

### 4. Unguarded `.json()` calls (~64 of 69)
- **Doc:** Code Quality F1 — sample sites: `app/api/address-autocomplete/route.js:21`, `app/api/cart/route.js:15`, `app/api/checkout/route.js:22`
- **Why P0:** if backend returns HTML (502, Cloudflare interstitial) → unhandled `SyntaxError` crashes the handler. Hits payment paths.
- **Fix:** add `if (!response.ok) throw …` guard; pattern exists at `app/sitemap.js:74` — copy it.

### 5. Raw-HTML injection without sanitization (40+ instances)
- **Doc:** Components F6 — `components/FaqItem.jsx:21,37`, `AccordionItem.jsx`, `Bo4/MarketingHeroSection.jsx`, `Bo5/ComparingTable.jsx`; Code Quality F5
- **Why P0:** content sourced from WordPress REST API rendered via raw-HTML inject without sanitization. WP admin compromise or content-injection bug → site-wide XSS.
- **Fix:** integrate DOMPurify; whitelist allowed tags; standardize on a single safe `<HtmlContent>` component.

### 6. Homepage `cookies()` without `revalidate` defeats edge cache
- **Doc:** Marketing F1 — `app/page.jsx:26–29`
- **Why P0:** highest-traffic page hits origin on every request — 50–100ms TTFB hit, costs add up.
- **Fix:** export `revalidate = 0` for ISR or `dynamic = 'force-static'` if auth check moves client-side.

### 7. Product slug page missing `metadataBase`
- **Doc:** Marketing F5 — `app/product/[slug]/page.jsx:42–70`
- **Why P0:** social share previews show no image (broken `og:image`); CTR drop on Meta/Twitter/LinkedIn shares.
- **Fix:** set `metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL)` in root layout.

### 8. State explosion in quiz mega-components (40–54 useState per quiz)
- **Doc:** Quiz F1 — `EDConsultationQuiz.jsx:134–177`, `HairConsultationQuiz.jsx:37–129`, `WeightConsultationQuiz.jsx:185–248`
- **Why classified P0 by agent:** every keystroke triggers cascade re-render across 40+ setters + immediate localStorage write. **Note:** this is severe but borderline P0/P1 — recommend reclassifying to **P1** (perf, not data loss). Still highest-impact UX bug in the quiz path.
- **Fix:** consolidate via custom hooks (`useWarningPopups`, `useSyncQueue`, `useQuizFlow`); see `MentalHealthQuestionnaire.jsx:70–108` for already-refactored example.

### 9. ADMIN_TOKEN fallback enables privilege escalation
- **Doc:** API Routes F4 — `app/api/checkout/route.js:155,211`, `cart/route.js:108`, `create-payment-intent/route.js:234`, +14 more
- **Why P0/P1:** mutating endpoints use `ADMIN_TOKEN || userAuth` fallback. Inverts least-privilege. If ADMIN_TOKEN ever leaks, attacker can mutate any user's cart, place orders, modify profiles.
- **Fix:** remove ADMIN_TOKEN fallback on all mutation routes; reserve it for setup/batch operations only.

## High-Signal P1 Themes (cluster these into tickets)

### Caching across the stack
- **Marketing F2** — 7 marketing pages declared `'use client'` with no SSG (`/about-us`, `/faqs`, `/reviews`, `/how-it-works`, `/ed`, `/body-optimization`, `/service-coverage`)
- **Marketing F3** — `/blog` and `/blog/category/[slug]` are `force-dynamic` (should be ISR)
- **Marketing F4** — `/blog/[slug]` is `'use client'` with client-side fetch — defeats SSG entirely
- **API Routes F1** — zero routes declare `revalidate` or `dynamic`; 30-min in-memory product cache wasted on Vercel cold-starts
- **Marketing F10** — sitemap lists blocked routes (`/skincare`, `/merch`, `/zonnic`) → wasted crawl budget

### Auth & abuse surface
- **API Routes F3** — login/register/forgot-password/reset-password lack rate-limiting (brute-force feasible)
- **API Routes F4** — ADMIN_TOKEN fallback (above)
- **API Routes F6** — `update-customer-profile` doesn't verify userId ownership against cookie

### Tracking integrity (post-TK-423/TK-424)
- **Tracking F1** — Meta CAPI uses billing-country dynamic phone hashing; TikTok CAPI hardcodes `'CA'` → identical phones produce different hashes → PII matching fails on TikTok
- **Tracking F2** — `hashServerSide.js` defaults to `'CA'` (project is US-only) — silent matching divergence for any future integration that forgets to pass country
- **Tracking F3** — `analyticsService.trackPurchase` awaits Meta + TikTok + Northbeam **sequentially** on order-received page; should be `Promise.allSettled`

### Money-path error handling
- **Checkout F3** — checkout error handler swallows nonce-refresh failures; original error context lost
- **Checkout F4** — concurrent cart requests race the nonce refresh; no client-side mutex
- **Checkout F8** — Stripe SDK API version not pinned; future SDK major could break checkout silently

### Component hygiene
- **Components F1–F3** — missing `setInterval` / `setTimeout` cleanup in `GlobalQuebecPopup`, `CrossSellModal`, `ReviewsSection` (memory leaks on remount)
- **Components F4** — `key={index}` in 15+ dynamic lists (focus loss / state desync on reorder)
- **Components F7** — `HtmlContent.jsx` regex-based shortcode stripping; fragile and unsanitized

### Bundle bloat
- **Code Quality F2** — `aws-sdk` v2 (~50 MB, deprecated EOL Nov 2024) → migrate to `@aws-sdk/client-s3` v3 (~5 MB)
- **Code Quality F3** — `react-input-mask` AND `react-input-mask-next` both unused per `depcheck`
- **Code Quality F4** — 3 unused runtime deps + 5 unused devDeps per `depcheck`
- **Quiz F7** — `framer-motion` bundled into all 5 quizzes for transitions that could be CSS

## Cross-Domain Overlaps (dedupe before filing tickets)

| Theme | Domains that flagged it | Recommendation |
|---|---|---|
| Raw-HTML injection without sanitization | Components F6–F8, Code Quality F5 | **One** ticket spanning both — systemic issue, single fix (centralize on DOMPurify). |
| Unguarded `.json()` | Code Quality F1, Checkout F (implicit), API Routes F8 | **One** ticket — codemod-able with grep-replace + manual verification on payment paths. |
| Cache exports missing on routes/pages | API Routes F1, Marketing F1–F4, F12 | Split: one ticket for marketing pages (refactor `'use client'` boundaries), one for API routes (add `revalidate`). |
| Sequential awaits that should parallelize | API Routes (sample), Checkout F2, Tracking F3 | **One** ticket — sweep `await x; await y` patterns on hot paths. |
| `console.log` in production | API Routes F7, Code Quality | **One** ticket — codemod to `devLogger.log`. |

## Proposed Tickets — filed under TK-422 epic

15 tickets across the 7 domains, batched by fix coherence rather than 1-per-finding. **All filed 2026-04-26**, status To Do, assigned to Tymour:

| Ticket | Title | Severity | Domain(s) | Effort |
|---|-------|----------|-----------|--------|
| **TK-431** | Add auth check to `/api/order/ga4-details/[id]` | P0 | API | S |
| **TK-432** | Remove `ADMIN_TOKEN` fallback from all mutation routes | P0 | API | M |
| **TK-433** | Sanitize all raw-HTML inject sites via DOMPurify (centralized) | P0 | Components + Code Quality | M |
| **TK-434** | Cart migration: add idempotency key + clear local only after verified success | P0 | Checkout | M |
| **TK-435** | Post-purchase attribution: `Promise.allSettled` with timeout | P0 | Checkout + Tracking | M |
| **TK-436** | Add response.ok guard before all `.json()` calls (~64 sites) | P0 | Code Quality | M |
| **TK-437** | Set `metadataBase` site-wide; fix homepage `revalidate` | P0/P1 | Marketing | S |
| **TK-438** | Migrate 7 marketing pages from `'use client'` to Server Components | P1 | Marketing | L |
| **TK-439** | Convert `/blog/[slug]` to Server Component + `generateStaticParams` | P1 | Marketing | L |
| **TK-440** | Convert `/blog` and `/blog/category/[slug]` from `force-dynamic` to ISR | P1 | Marketing | S |
| **TK-441** | Rate-limit login / register / forgot-password / reset-password | P1 | API | M |
| **TK-442** | Quiz state consolidation: extract shared hooks (`useQuizFlow`, `useWarningPopups`, `useSyncQueue`) | P1 | Quiz | L |
| **TK-443** | Tracking: align TikTok CAPI phone-country with Meta CAPI; default `hashServerSide` to `US` | P1 | Tracking | S |
| **TK-444** | Replace `aws-sdk` v2 with `@aws-sdk/client-s3` v3; remove unused deps from `depcheck` | P1 | Code Quality | M |
| **TK-445** | Component cleanup pass: setInterval/setTimeout cleanup, `key={index}` → stable IDs | P2 | Components | M |

**Estimated total effort:** ~35 days of engineering, with the P0 cluster (TK-431 → TK-437) hitting ~12 days and clearing the highest-risk surface.

## Post-audit additions

These tickets are tracked under the same TK-422 epic but were **not** part of the 96 static-analysis findings above. They surfaced separately and are recorded here so this doc remains the single navigation index for the epic.

### TK-447–453 — May 2026 HAR audit gap tickets

- **Source spec:** [`har-audit-gap-tickets.md`](./har-audit-gap-tickets.md)
- **Severity:** mix of P1 (TK-447, TK-448, TK-449, TK-450, TK-452) and P2 (TK-451, TK-453)
- **Domain:** Performance, Security/Compliance, Tracking
- **Effort:** ~7 days total (5× S + 1× M + 1 QA day)
- **Source:** Full-funnel HAR capture May 2026 (1,015 requests, 28 MB third-party)
- **Why not in the April audit:** April audit was static analysis only. HAR capture surfaced
  runtime behavior (triple video download, event firing frequency, checkout vendor load) that
  static analysis cannot detect.

| Ticket | Title | Severity |
|--------|-------|----------|
| TK-447 | Mask PII fields from Heatmap.com on checkout (`data-hm-ignore`) | P1 compliance | **DONE** ✓ |
| TK-448 | Remove BugHerd entirely (all files + both API keys rotated) | P1 security | **DONE** ✓ |
| TK-449 | Migrate Canadian S3 video to BunnyCDN; fix triple-load | P1 perf |
| TK-450 | Checkout vendor gating: remove Convert + AWIN; defer Stripe | P1 perf |
| TK-451 | Make `update-order-status` non-blocking on Place Order | P2 UX |
| TK-452 | QA and confirm RKY_FLW_SC fires end-to-end in WL funnel | P1 tracking |
| TK-453 | Fix `source_data_captured` firing 12× per session | P2 analytics |

---

### TK-446 — Northbeam `order_tags` overhaul

- **Source spec:** [`northbeam-tagging-overhaul.md`](./northbeam-tagging-overhaul.md)
- **Severity:** P1 (analytics integrity / acquisition-vs-retention reporting accuracy — not data loss / payment break)
- **Domain:** Tracking
- **Effort:** S–M (dual-emit code change ≈ 1 day; Phase 2 dashboard migration is operational, not engineering)
- **Status:** Pending Aba sign-off on tag naming + mixed-cart rule before implementation
- **Why it wasn't in the audit findings:** known issue for ~1 year (Northbeam confirmed the conflation); deliberately held back while the rest of NB tracking stabilized. That stability is now achieved, so the overhaul is unblocked.
- **What:** splits the single overloaded lifecycle tag (`Subscription First Order` / `Subscription Recurring` / `OTC`) into three independent axes — customer lifecycle, order origin, purchase mode — appended to `order_tags`. Zero-risk additive Phase 1 (dual-emit) before Phase 2 dashboard migration and Phase 3 legacy-tag removal.
- **Coordination:** TK-443 also touches `utils/northbeamEvents.js` — land in coordinated order to avoid conflicts. The `getLifecycleTag` and `convertToISO3166Alpha3` duplicates between `utils/northbeamEvents.js` and `app/api/northbeam/orders/route.js` are folded into TK-446's scope (already-drifted defaults: `CAN` vs `USA`).

## Out of Scope / Won't Fix (explicit)

- Already covered by TK-422 epic and TK-423 (see header)
- Backend WordPress / WooCommerce / CRM source code
- Runtime performance measurement (no Lighthouse / HAR / browser profiling — purely static analysis)
- Migration to first-party server-side GTM (strategic, not tactical)
- Behavior changes — this audit is discovery-only; fixes ship as separate tickets

## Verification

When fixing each ticket, the per-domain doc has the file:line refs, suggested fix shape, and effort/risk estimates. The seven docs are the source of truth — this summary is a navigation index.
