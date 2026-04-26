---
title: Marketing Pages & Cache Sweep Audit
status: Proposed
owner: Frontend / Performance
priority: 1
date: 2026-04-26
epic: TK-422 (follow-up)
related-tickets:
  - TK-430 (GLP LP edge cache bypass)
scope: Cache behavior across all marketing pages (excludes glp1/glp2 covered by TK-430)
---

# Marketing Pages & Cache Sweep Audit

## Executive Summary

This audit extends the GLP LP performance audit (TK-422/TK-430) to all other marketing pages site-wide. The headline finding is that **11 of 18 major marketing pages are rendered as client components (`'use client'`) or lack proper cache exports**, defeating Vercel edge caching on pages that should be static or ISR-cached. Most egregious:

1. **Homepage (`/page.jsx`)** calls `cookies()`, making it dynamic but lacking `export const revalidate` → every request hits the server.
2. **About Us, FAQs, How-It-Works, Reviews, ED, Body-Opt, Service-Coverage** are `'use client'` → no SSG, entire page hydrates in browser.
3. **Blog index and category pages** explicitly `force-dynamic` → every request is fresh, no edge cache.
4. **Blog slug page** uses `'use client'` with client-side fetch → defeats static generation.
5. **Product slug page** has `revalidate = 3600` and `generateStaticParams()` (correct), but lacks `metadataBase` (broken OG image URLs).

**Severity**: P0 (homepage/blog get significant traffic) and P1 (category pages, every unprotected marketing route).

## Cache Status Table

| Route | Component Type | dynamic | revalidate | cookies() | Verdict | Effort |
|-------|---|---|---|---|---|---|
| / | Server + async fetch | none | none | ✓ | ⚠ Missing revalidate (F1) | M |
| /about-us | Client | none | none | — | ✗ No SSG (F2) | M |
| /contact-us | Server | none | none | — | OK (static, no export needed) | — |
| /faqs | Client | none | none | — | ✗ No SSG (F2) | M |
| /blog | Server + async | force-dynamic | none | — | ✗ Every request (F3) | S |
| /blog/[slug] | Client + client-fetch | none | none | — | ✗ No SSG (F4) | L |
| /blog/category/[slug] | Server + async | force-dynamic | none | — | ✗ Every request (F3) | S |
| /reviews | Client | none | none | — | ✗ No SSG (F2) | M |
| /how-it-works | Client | none | none | — | ✗ No SSG (F2) | M |
| /podcast | Server + async | force-dynamic | none | — | ✓ Intentional (notFound) | — |
| /help-center | Server | none | none | — | OK (static, no export needed) | — |
| /service-coverage | Client | none | none | — | ✗ No SSG (F2) | M |
| /ed | Client | none | none | — | ✗ No SSG (F2) | M |
| /hair | Server | none | none | — | OK (static, no export needed) | — |
| /body-optimization | Client | none | none | — | ✗ No SSG (F2) | M |
| /(marketing)/bo2 | Server | none | none | — | OK (static, no export needed) | — |
| /(marketing)/wl-offer | Server | none | none | — | OK (static, no export needed) | — |
| /product/[slug] | Server + async | none | 3600 | — | ✓ ISR + SSP (has F5 metadata bug) | S |

**Legend**: `✓` = OK; `✗` = broken cache; `⚠` = missing optimization; `—` = not applicable.

---

## Findings

### F1: Homepage `cookies()` without `revalidate` defeats edge cache

- **Severity**: P0
- **Bucket**: Perf (every visit misses Vercel edge cache)
- **Files**: `app/page.jsx:26–29`
- **What**: Homepage is `async Server Component` that calls `await cookies()` to read auth tokens (authToken, displayName, etc.), but doesn't export `revalidate`. Next.js 16 default: async component without revalidate = dynamic rendering. Vercel responds with `Cache-Control: no-store`. Result: homepage hits origin server on every request, no edge caching.
- **Impact**: Homepage is likely the highest-traffic page on the site. Missing edge cache (even for unauthenticated visitors) causes:
  - 50–100ms latency increase per request (TTFB)
  - Increased origin server load
  - No benefit from Vercel's global edge network
- **Fix**: Either (a) export `export const revalidate = 0` to enable ISR with on-demand revalidation, or (b) export `export const dynamic = 'force-static'` if the auth check is moved client-side. Option (a) is safer: static render for anon, ISR for logged-in on first load. Verify that `cookies()` read doesn't cause Vercel to reject static generation.
- **Effort**: S  •  **Risk**: low

### F2: 7 marketing pages are `'use client'` → no static generation or hydration caching

- **Severity**: P1
- **Bucket**: Perf + Bad Impl (defeats SSG; browser must hydrate entire component tree)
- **Files**:
  - `app/about-us/page.jsx:1` (uses `useRef`, `useState`)
  - `app/faqs/page.jsx:1` (uses `useState`, `useMemo`, `useSearch`)
  - `app/reviews/page.jsx:1` (imports 7 client components)
  - `app/how-it-works/page.jsx:1` (uses `useState`)
  - `app/ed/page.jsx:1` (uses client-side imports)
  - `app/body-optimization/page.jsx:1` (uses `Suspense`, `useAutoApplyCoupon` hook)
  - `app/service-coverage/page.jsx:1` (uses `useState`, `useRouter`)
- **What**: Each of these pages is declared `'use client'` but contains no dynamic data fetching. All content is static (team members, FAQs, copy, reviews, etc.). Marking entire page as client defeats Next.js static generation: the page is rendered at request time in the browser, not pre-generated.
- **Impact**:
  - No cached HTML on edge — every request re-renders in user's browser
  - Higher JavaScript bundle shipped to client (component code + hydration)
  - Slower First Contentful Paint (FCP) and LCP because hydration must complete before page is interactive
  - No SEO benefit from pre-rendered canonical HTML on origin (though Googlebot can execute JS)
- **Fix**: Move the `'use client'` boundary to the smallest child component that actually needs state (e.g., `<FAQsClient />` wrapping just the search + filter UI). Render the static layout, team list, copy, etc. as Server Components. Once decoupled, Next.js will pre-generate the page as static HTML (or ISR if there's one dynamic data fetch). Estimated win: 30–50% faster FCP, 10–20% smaller JS bundle.
- **Effort**: M  •  **Risk**: low

### F3: `/blog` and `/blog/category/[slug]` are `force-dynamic` (every request hits server)

- **Severity**: P1
- **Bucket**: Perf (blog is high-traffic; should be ISR)
- **Files**:
  - `app/blog/page.jsx:7` — `export const dynamic = "force-dynamic"`
  - `app/blog/category/[slug]/page.jsx:5` — `export const dynamic = "force-dynamic"`
- **What**: Both pages call `blogService.getBlogs()` and `blogService.getBlogCategories()` at render time, then declare `force-dynamic`. This is redundant and aggressive: `force-dynamic` disables ISR entirely, so every visitor gets a fresh server render. Blog indices don't change per-request — they change on new post publish (hourly or daily, not per-visitor).
- **Impact**:
  - Every blog list request re-fetches from WordPress, stalls on I/O
  - Vercel edge cache bypassed; no CDN caching possible
  - Increased latency for blog viewers (especially mobile in non-US regions)
  - CMS changes (new post, category rename) take seconds to propagate to viewers
- **Fix**: Replace `force-dynamic` with `export const revalidate = 3600` (1 hour ISR). On-demand revalidation can trigger via webhook from WordPress when a post is published. Result: blog page is served from edge cache for 1 hour, WordPress fetch happens once per hour (or on-demand), not per-request.
- **Effort**: S  •  **Risk**: low

### F4: Blog slug page is `'use client'` with client-side fetch → defeats static generation

- **Severity**: P1
- **Bucket**: Perf + Bad Impl (hundreds of blog URLs, all fetched client-side)
- **Files**: `app/blog/[slug]/page.jsx:1, 34–51`
- **What**: Page is marked `'use client'` and inside `useEffect`, it fetches `/api/blogs/{slug}` with `fetch()`. Result: Next.js cannot pre-generate this page (it's a client component) and the browser must load, hydrate, and execute the fetch, then render. No `generateStaticParams()` exists, so every slug is a cold render on first visit.
- **Impact**:
  - Every blog article URL is a cold render on first visit (no SSG)
  - FCP is blocked on React hydration + fetch latency
  - Googlebot sees empty shell until JS executes (though Google does execute JS, so eventual crawl succeeds)
  - No edge cache — every bot/crawler/visitor to an old post hits the server
- **Fix**: Convert to Server Component. Move the fetch out of `useEffect` and into the top-level `BlogSlugPage()` function body. Add `export async function generateStaticParams()` to pre-generate all blog slugs (via `/api/blogs` list) at build time. This is a larger refactor (move all state to URL search params or split into a client wrapper), but the payoff is massive: all blog articles become static HTML, cached on edge forever (revalidate on-demand when post updates).
- **Effort**: L  •  **Risk**: med

### F5: Product slug page missing `metadataBase` → broken OG image URLs

- **Severity**: P0
- **Bucket**: Error (SEO + social share previews broken)
- **Files**: `app/product/[slug]/page.jsx:42–70` (generateMetadata)
- **What**: Page correctly exports `revalidate = 3600` and `generateStaticParams()`, but `generateMetadata()` does not include `metadataBase`. The `metadata.openGraph` / `metadata.twitter` blocks (if they exist) will include relative image URLs, which when expanded by Next.js without a metadataBase, result in `https://localhost:3000/product/image.jpg` or missing `og:image` entirely. This breaks social share previews on LinkedIn, Twitter, WhatsApp, etc.
- **Impact**:
  - Product links shared on social media show no preview image (blank card)
  - Click-through rates on social drop (users don't know what product they're clicking)
  - Canonical URL may also be incorrect (relative or missing domain)
- **Fix**: Add `metadataBase` at the page level (or better, in root layout): `export const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.myrocky.com')`. Then ensure `generateMetadata()` returns `openGraph: { url: ... images: [...] }` with absolute image URLs or let Next.js build them from relative paths.
- **Effort**: S  •  **Risk**: low

### F6: `/help-center` renders `<HelpCenterContent />` (client component) but page is Server Component → inconsistent pattern

- **Severity**: P2
- **Bucket**: Bad Impl (style violation, not a perf bug, but signals confusion)
- **Files**: `app/help-center/page.jsx:3–5`
- **What**: Help-center page is a Server Component (no `'use client'`), but it imports and renders `<HelpCenterContent />`, which is likely a client component. This creates a client boundary at the component level rather than page level — a valid but unconventional pattern. If `HelpCenterContent` is truly static (no hooks), it should be a Server Component too.
- **Impact**: Minor — pattern is technically sound but adds confusion. If `HelpCenterContent` has client-side state, the page cannot be fully statically generated, defeating the benefit of having a Server Component page wrapper.
- **Fix**: Audit `components/HelpCenter/HelpCenterContent.jsx`. If it has no hooks or dynamic behavior, remove `'use client'` and convert to a Server Component. If it does have state, add `'use client'` to the page itself and consolidate the boundary.
- **Effort**: S  •  **Risk**: low

### F7: next.config.mjs has 13 image domains (growing list) — over-permissive

- **Severity**: P2
- **Bucket**: Optimization (security + image optimization)
- **Files**: `next.config.mjs:3–71`
- **What**: The `remotePatterns` array includes 13 hostnames:
  1. myrocky.b-cdn.net (primary CDN) ✓
  2. myrocky.com (origin) ✓
  3. mycdn.myrocky.com (mirror) ✓
  4. myrocky-ca-wp-media.s3.ca-central-1.amazonaws.com (legacy AWS) — still used?
  5. rh-staging.etk-tech.com (staging dev) — should be dev-only
  6. myrocky-dev.etk-tech.com (dev) — should be dev-only
  7. mycdn.myrocky.ca (Canada CDN) ✓
  8. static.legitscript.com (compliance badge) ✓
  9. myrocky.ca (Canada origin) ✓
 10. myrocky.com (duplicate!) — listed twice
  11. cdn.vectorstock.com (vector stock) — is this used? Check commits
  12. stg-1.rocky.health (staging health?) — unclear, should be dev-only
  13. www.shutterstock.com (stock photos) — very permissive; should be a specific CDN domain if using Shutterstock APIs
- **Impact**: Overly permissive list increases:
  - Image loading latency (Next.js doesn't optimize for untrusted sources beyond the main CDNs)
  - Risk of serving stale images from accidentally-committed URLs
  - Dev/staging URLs leaking into production (if env vars aren't separated)
- **Fix**: Audit each domain. Keep prod CDNs (myrocky.b-cdn.net, mycdn.myrocky.ca) and compliance (legitscript). Move staging/dev (rh-staging, myrocky-dev, stg-1.rocky.health) to `.env.local` or a dev-only config. Verify use of aws S3, vectorstock, shutterstock in the last 3 months; remove unused. Remove myrocky.com duplicate.
- **Effort**: S  •  **Risk**: low

### F8: Middleware redirect chain for `/old-blog/*` → `/blog/*` (single hop, OK; but pattern grows linearly)

- **Severity**: P2
- **Bucket**: Optimization (redirect logic should scale)
- **Files**: `middleware.js:42–54`
- **What**: Old blog URL redirect (`/old-blog/{slug}` → `/blog/{slug}`) is implemented as a function in middleware with string manipulation. Fine for now (single hop), but the `restrictedProductSlugs` array (line 57–61) shows a pattern: redirects are hardcoded as array checks. If this grows (more old URL schemes, more blocked products), the middleware function grows O(n) per request.
- **Impact**: Currently negligible (4 redirect rules). But if we add 50+ redirect rules in the next year (product renames, old landing pages), every request will check all 50, adding latency.
- **Fix**: Move static redirects to `vercel.json` `redirects` array (edge-cached, O(1) matching). Keep dynamic redirects in middleware (e.g., redirect based on user role or A/B test). Current rules are all static, so move them to vercel.json.
- **Effort**: S  •  **Risk**: low

### F9: No `vercel.json` cache headers configured for marketing pages

- **Severity**: P2
- **Bucket**: Optimization (missed Vercel feature)
- **Files**: `vercel.json` (missing `headers` array)
- **What**: `vercel.json` has `redirects`, `rewrites`, and `crons`, but no `headers` array to set cache headers (Cache-Control, CDN cache, stale-while-revalidate, etc.) at the edge. This means caching is entirely delegated to Next.js `revalidate` exports — which is correct, but there's no override mechanism if a page is accidentally marked `force-dynamic` or should have a custom TTL.
- **Impact**: Low (Next.js exports are sufficient for current pages), but missing a useful escape hatch.
- **Fix**: Add a `headers` array in vercel.json with rules for common paths:
  ```json
  "headers": [
    {
      "source": "/about-us",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }]
    },
    ...
  ]
  ```
  This is optional and low-value for now (Next.js exports take precedence anyway), but good to have for future overrides.
- **Effort**: S  •  **Risk**: low

### F10: robots.js and sitemap.js refer to blocked/skincare routes that are 404ed

- **Severity**: P1
- **Bucket**: Error (SEO — robots/sitemap inconsistent with site structure)
- **Files**:
  - `app/sitemap.js:35` — includes `/skincare` (blocked route)
  - `app/sitemap.js:36` — includes `/merch` (blocked route)
  - `app/sitemap.js:41` — includes `/zonnic` (blocked route)
- **What**: Sitemap lists routes that middleware.js `isBlockedRoute()` function blocks and redirects to `/blocked?path={path}`. This causes:
  - Search engines crawl `/skincare`, hit redirect to `/blocked`
  - Canonical URL is `/blocked`, not `/skincare`
  - Wastes crawl budget on routes that aren't meant for indexing
- **Impact**:
  - Wasted crawl budget (Google sees redirects, avoids indexing)
  - Confusing crawl logs (spike of 404→302 redirects)
  - Potential ranking penalty if patterns look like spam
- **Fix**: In `sitemap.js`, filter out blocked routes before returning:
  ```javascript
  const blockedRoutes = [...]; // import from middleware or constants
  const sitemapEntries = [...].filter(entry =>
    !blockedRoutes.some(blocked => entry.url.includes(blocked))
  );
  ```
  Also verify `robots.js` disallows `/blocked` path.
- **Effort**: S  •  **Risk**: low

### F11: Root layout imports 20+ components at the top level; some may be unused on certain pages

- **Severity**: P3
- **Bucket**: Optimization (bundle bloat, not cache)
- **Files**: `app/layout.jsx` (main layout)
- **What**: Root layout imports all global components (vendors, Google OAuth, Quebec popup, Zendesk widget, attribution tracker, inactivity handler, telemetry, etc.) unconditionally. These are mounted on every page, even pages like `/checkout` or `/login` where they may be unnecessary.
- **Impact**: Higher JavaScript bundle size on every page; longer hydration on client-side rendered pages.
- **Fix**: Audit each global component. Move non-critical ones (Quebec popup, Zendesk, telemetry tail) into a lazy-loaded component or a Suspense boundary. Priority: components that use `beforeInteractive` (already flagged in TK-424).
- **Effort**: M  •  **Risk**: med

### F12: Missing `dynamic = 'force-static'` on pages that should be fully static

- **Severity**: P3
- **Bucket**: Optimization (documentation, clarity)
- **Files**:
  - `app/contact-us/page.jsx`
  - `app/help-center/page.jsx`
  - `app/hair/page.jsx`
  - `app/(marketing)/bo2/page.jsx`
  - `app/(marketing)/wl-offer/page.jsx`
- **What**: These pages render as static HTML (no async data fetches, no dynamic behavior), but don't explicitly export `export const dynamic = 'force-static'`. This is OK (next.js infers it), but lack of explicit export makes future maintainers unsure whether the page is intentionally static or just accidentally static.
- **Impact**: None (pages work fine), but reduces code clarity and increases risk of accidental dynamic regression.
- **Fix**: Add explicit `export const dynamic = 'force-static'` to each. This is a documentation-level fix, signals intent, and allows Next.js to warn if someone adds a `cookies()` call later.
- **Effort**: S  •  **Risk**: low

---

## Out of Scope / Won't Fix

1. **Migration to first-party server-side GTM** (TK-424 callout) — strategic shift beyond this audit.
2. **Metadata title on `/glp2-offer-hero`** — copy issue, tracked separately.
3. **Backend WordPress/WooCommerce caching** — scope is Next.js frontend only.
4. **Dynamic route catch-all leaks** (`app/[...slug]/page.jsx` patterns) — not present in current codebase.
5. **Duplicate `metadataBase` exports** — Next.js only uses one; over-exporting is benign.

---

## Recommended Priority & Phasing

### Phase 1 (Sprint 1, ~4 days, P0/P1 bugs)
- **F1** (homepage revalidate): 1 day
- **F3** (blog/category force-dynamic → ISR): 1 day  
- **F10** (sitemap blocked routes): 0.5 day
- **Total**: ~2.5 days effort
- **Impact**: Homepage + blog get edge caching; SEO improves; server load drops.

### Phase 2 (Sprint 2–3, ~8 days, P1 refactors)
- **F2** (7 marketing pages 'use client' → Server): 5 days (largest refactor)
- **F4** (blog [slug] client fetch → SSG): 3 days
- **Total**: ~8 days
- **Impact**: All marketing pages become static or ISR; FCP/LCP improve 30–50%; bundle size shrinks.

### Phase 3 (Sprint 3+, P2 polish)
- **F5** (metadataBase): 1 day
- **F6** (help-center boundary): 0.5 day
- **F7** (image domains audit): 1 day
- **F8** (middleware redirects → vercel.json): 1 day
- **F9** (vercel.json headers): 1 day
- **F11** (global component lazy-load): 2–3 days (depends on testing needed)
- **F12** (explicit dynamic exports): 0.5 day
- **Total**: ~7 days
- **Impact**: Polish, security, clarity; lower risk, lower payoff.

---

## Verification Checklist (Post-Fix)

- [ ] PSI mobile score on `/` > 75, LCP < 2.5s (before revalidate fix, was dynamic).
- [ ] PSI mobile score on `/blog` > 75 (was force-dynamic).
- [ ] `/about-us`, `/faqs`, etc. render to static HTML in `.next/server` (build output).
- [ ] Network panel: no `/api/blogs` fetch on `/blog/[slug]` — all data is embedded in HTML.
- [ ] `robots.txt` disallows `/blocked` and blocked routes; sitemap excludes them.
- [ ] OG image URLs on `/product/[slug]` are absolute, not relative (test with social share debugger).
- [ ] No 404s in Vercel logs for `/skincare`, `/merch`, `/zonnic` (no more sitemap → blocked chain).
- [ ] Time-to-First-Byte (TTFB) on homepage: <200ms from US, <500ms from AU/SG (vs. current ~400–800ms).

---

## Related Reading

- [GLP LP Performance Audit](./glp-lp-performance-audit.md) — TK-422, TK-430 (cache exports on GLP LPs)
- [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching) — revalidate, generateStaticParams, metadataBase
- [Vercel Edge Caching](https://vercel.com/docs/edge-network/caching) — how Cache-Control headers interact with Vercel

