# Cross-Cutting Code Quality Audit

## Executive Summary
- **P0 — Unguarded `.json()` calls (64/69 unprotected)**: 92% of response.json() calls lack response.ok checks, risking SyntaxError crashes on non-JSON responses (Cloudflare errors, 502 HTML).
- **P1 — Package bloat & unused dependencies**: `aws-sdk` v2 (~50MB, deprecated), `react-input-mask` + `react-input-mask-next` (duplicate), 3 unused runtime deps, 5 unused devDeps; missing `prop-types` causes implicit fallback.
- **P2 — HTML injection without consistent sanitization**: 65+ dangerouslySetInnerHTML instances; HtmlContent sanitizes regex-based, but AccordionItem/FaqItem/ListWithNumbers inject unsanitized item.content from server config/API.

## depcheck output (raw)

```
Unused dependencies
* react-input-mask
* react-input-mask-next
* react-tailwindcss-datepicker

Unused devDependencies
* autoprefixer
* postcss
* tailwindcss
* depcheck
* eslint-plugin-unused-imports

Missing dependencies
* prop-types: ./components/Product/body-optimization/BodyOptimizationProductPageContent.jsx
```

## Findings

### F1: Unguarded .json() calls on HTTP responses
- **Severity**: P0
- **Bucket**: Error
- **Files**: 
  - app/api/address-autocomplete/route.js:21–29 (2 calls, no response.ok check)
  - app/api/cart/route.js:15, 24 (2 calls)
  - app/api/checkout/route.js:22 (1 call)
  - app/sitemap.js:74 (wrapped with response.ok check ✓ — good pattern)
  - 60+ more in app/api/* routes
- **What**: Approximately 64 out of 69 `await response.json()` calls lack `if (!response.ok)` guard. If backend returns HTML error page (502, Cloudflare interstitial) or malformed JSON, the parser throws unhandled SyntaxError, crashing the handler.
- **Impact**: User-facing: checkout flow, cart mutations, questionnaire handlers crash silently. Business: revenue-blocking bugs, no error logs (unhandled promise rejection).
- **Fix**: Add pre-flight check before every .json(): `if (!response.ok) { throw new Error(...); }` or wrap in try/catch. Use sitemap.js as pattern. Rollout: grep-replace with manual verification in 5 highest-traffic APIs first (cart, checkout, auth).
- **Effort**: M • **Risk**: low (defensive check, no logic change)

### F2: Deprecated aws-sdk v2 (~50MB) still in use
- **Severity**: P1
- **Bucket**: Perf
- **Files**: 
  - package.json:18 ("aws-sdk": "^2.1692.0")
  - app/api/s3/presigned-url/route.js:1 (import AWS)
  - utils/s3/index.js:1 (import AWS)
- **What**: AWS SDK v2 is officially deprecated (EOL Nov 2024). It bundles 50MB+ with heavy transitive deps (request, har-validator). v3 modular @aws-sdk/client-s3 is 5MB, tree-shakeable, and maintained.
- **Impact**: Bundle size: ~10MB added to Vercel cold starts. Security: v2 no longer receives security patches.
- **Fix**: Migrate to @aws-sdk/client-s3 (v3). Update route.js and utils/s3/index.js to use new client API. Remove aws-sdk from package.json. Estimated impact: -40MB bundle, faster cold start.
- **Effort**: M • **Risk**: med (API change, needs integration test for S3 presigned URLs)

### F3: Duplicate input masking libraries
- **Severity**: P1
- **Bucket**: Optimization
- **Files**: package.json:28–29 (react-input-mask ^2.0.4, react-input-mask-next ^3.0.0-alpha.12)
- **What**: Both libs provide phone/card masking. depcheck reports both unused (0 imports found). They add ~30KB gz to bundle for zero functionality.
- **Impact**: Bundle bloat; conditional logic needed if masking is required elsewhere.
- **Fix**: Remove both from package.json and npm. If phone/card masking is needed later, adopt one standard or implement HTML5 inputmode + native validation. Verify no undocumented dynamic imports via grep.
- **Effort**: S • **Risk**: low (confirm grep -r for dynamic requires; likely safe)

### F4: Unused and dev-only packages
- **Severity**: P2
- **Bucket**: Optimization
- **Files**: package.json (devDeps section)
- **What**: Unused devDeps: autoprefixer, postcss, tailwindcss, depcheck, eslint-plugin-unused-imports. Likely auto-installed as transitive deps or legacy remnants. Unused runtime: react-tailwindcss-datepicker (30KB).
- **Impact**: npm install footprint, CI cache size, confusion for contributors (why is Tailwind listed if not used?).
- **Fix**: Verify none are called via next.config.mjs or build scripts. Remove from package.json. If Tailwind CSS classes are used, keep in config. Run npm audit post-cleanup.
- **Effort**: S • **Risk**: low (safe to test locally first)

### F5: HTML injection without consistent sanitization
- **Severity**: P1
- **Bucket**: Error
- **Files**:
  - components/AccordionItem.jsx:44 (dangerouslySetInnerHTML with item.content)
  - components/FaqItem.jsx:34, 37 (question/answer from props)
  - components/ListWithNumbers.jsx:13 (item HTML string)
  - components/Article/HtmlContent.jsx:307 (has sanitization via regex ✓)
  - components/PageCover.jsx (subtitle, note from config)
- **What**: 65+ dangerouslySetInnerHTML instances total. HtmlContent.jsx applies regex sanitization (strips shortcodes, cleans empty tags). But AccordionItem, FaqItem, ListWithNumbers inject raw HTML from props without validation. If props come from server config (safe) vs. WP REST (untrusted), risk varies.
- **Impact**: XSS if item.content or question/answer contain user input or unvalidated WP REST content. Malicious actors could inject event handlers via FAQ admin panel or product data.
- **Fix**: Create sanitizeHtml() utility (DOMPurify or simple allowlist). Apply before all dangerouslySetInnerHTML. Audit: which sources are trusted (static config) vs. untrusted (WP API)? Add CSP header script-src 'self' to block inline injection. Mark trusted config sources with comments.
- **Effort**: L • **Risk**: high (requires careful source audit; risk of over-sanitizing)

### F6: Missing response.ok check pattern (94% of fetch calls)
- **Severity**: P1
- **Bucket**: Error
- **Files**: app/api/* (across 60+ route handlers)
- **What**: Only sitemap.js checks response.ok before .json(). Standard pattern missing. Failed fetch (timeout, 5xx, Cloudflare block) returns response object; caller assumes JSON and calls .json() on error HTML, causing SyntaxError.
- **Impact**: Cart mutations, checkout, questionnaires fail silently. User sees blank page or hangs.
- **Fix**: Establish codified pattern: check response.ok → throw descriptive error → caller catches via error boundary. Add to lib/api.js as reusable helper. Apply via grep-replace + manual review.
- **Effort**: M • **Risk**: low (pattern is straightforward)

### F7: Middleware logs every API call to console
- **Severity**: P2
- **Bucket**: Perf
- **Files**: middleware.js:23–25
- **What**: console.log fires for every API request with session/request ID. In production, adds 1–2ms per request, fills logs with noise (thousands per day).
- **Impact**: Log ingestion cost (if metered), harder to spot real errors, slight latency on every API call.
- **Fix**: Move to debug-mode only (check process.env.DEBUG_MIDDLEWARE). Keep x-request-id propagation for tracing. Verify Vercel captures request metadata via X-Vercel-Request-Id.
- **Effort**: S • **Risk**: low (removes noise only; tracing unaffected)

### F8: localStorage accessed in render path without SSR guard
- **Severity**: P2
- **Bucket**: Error
- **Files**: lib/hooks/useAutoApplyCoupon.js:20–30 (useEffect safe ✓; getPendingCouponCode exported for use)
- **What**: getPendingCouponCode() calls localStorage.getItem() directly without typeof window guard. If called in render or server context, throws "localStorage is not defined". useAddressManager has proper guards (good pattern).
- **Impact**: Potential SSR mismatch if getPendingCouponCode called during page generation or non-browser context.
- **Fix**: Audit call sites of getPendingCouponCode() to confirm client-side only. Add JSDoc: Client-side only; call after hydration.
- **Effort**: S • **Risk**: low (mostly defensive)

### F9: JSON.parse without try/catch (8+ locations)
- **Severity**: P2
- **Bucket**: Error
- **Files**:
  - lib/cart/cartService.js (JSON.parse on localCart)
  - lib/hooks/useAddressManager.js:14–18 (wrapped ✓)
  - utils/crossSellCheckout.js (JSON.parse on saved)
  - utils/dosageCookieManager.js (JSON.parse)
  - utils/requiredConsultation.js (JSON.parse on localStorage)
  - utils/addressDebugger.js (JSON.parse on stored)
- **What**: JSON.parse(value) without try/catch. If localStorage corrupted or contains invalid JSON, parse throws SyntaxError → app crashes.
- **Impact**: User stranded with corrupted storage; no graceful fallback.
- **Fix**: Wrap all JSON.parse in try/catch; return null or default on error. useAddressManager shows good pattern; apply to others.
- **Effort**: S • **Risk**: low (straightforward wrapping)

### F10: Unused eslint-disable without justification
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: lib/hooks/useQuestionnaireStepTracking.js:136 (exhaustive-deps disabled)
- **What**: eslint-disable-next-line react-hooks/exhaustive-deps on useEffect. Rule suppressed without clear explanation. If deps logic changes, rule won't catch bugs.
- **Impact**: Hides potential bugs; reduces lint enforcement.
- **Fix**: Add inline comment explaining why deps are omitted. Or refactor to satisfy rule naturally (useCallback wrapping, useMemo).
- **Effort**: S • **Risk**: low (clarification, not code change)

### F11: "use client" directive over-applied
- **Severity**: P2
- **Bucket**: Optimization
- **Files**: ~344 .js/.jsx files contain "use client"
- **What**: Next.js 16 defaults to Server Components unless marked "use client". 344 instances suggest most files are Client Components. If many could be Server Components (data fetches, secrets), code leaks to client bundle.
- **Impact**: Potential bundle bloat if server-only code (secrets, axios) bundled to browser. But if all are interactive, no issue.
- **Fix**: Audit top-level components in app/. Are API calls and secrets in Server Components or leaked? Move secrets to lib/api routes; keep "use client" to interactive UI only.
- **Effort**: L • **Risk**: med (requires architectural review)

### F12: next.config.mjs lacks experimental optimizations
- **Severity**: P3
- **Bucket**: Optimization
- **Files**: next.config.mjs
- **What**: No experimental.optimizePackageImports for react-icons, framer-motion, swiper. These are tree-shakeable but need Next.js config.
- **Impact**: Bundle includes unused icon/animation variants even if only 2–3 are used.
- **Fix**: Add experimental: { optimizePackageImports: ['react-icons', 'framer-motion', 'swiper'] }
- **Effort**: S • **Risk**: low (Next.js feature, tested upstream)

### F13: Stripe client lazy init with no error recovery
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: lib/stripe/stripeClient.js:9–22
- **What**: getStripe() returns null if publishable key missing. Caller doesn't check for null, proceeds with undefined Stripe → runtime error. Better pattern: throw immediately.
- **Impact**: Silent failure at payment time; user sees cryptic error instead of friendly message.
- **Fix**: Throw error immediately: if (!publishableKey) { throw new Error(...); }. Force callers to handle via try/catch or error boundary.
- **Effort**: S • **Risk**: low (improves error visibility)

### F14: Regex compiled in middleware handler scope
- **Severity**: P3
- **Bucket**: Perf
- **Files**: middleware.js:43, 237 (regex in helper functions)
- **What**: If complex regex patterns used in shouldProtectRoute/isBlockedRoute, they recompile per-request.
- **Impact**: Negligible on modern V8; not a bottleneck. Best practice: move to module scope.
- **Fix**: Precompile regex at top of middleware.js if added.
- **Effort**: S • **Risk**: low (cosmetic)

### F15: ProductFactory and CategoryHandlerFactory use if/else chains
- **Severity**: P3
- **Bucket**: Bad Impl
- **Files**:
  - lib/models/ProductFactory.js:16–44 (if isBundle/isSubscription chain)
  - lib/models/CategoryHandlerFactory.js:31–45 (if hasCategory chain)
- **What**: Factories use if/else instead of registry/lookup maps. Adding new type requires modifying factory.
- **Impact**: Violates open/closed principle; merge conflict risk when parallel features add types. Current code is readable; refactoring optional.
- **Fix**: Refactor to registry map: const HANDLERS = { ed: EdHandler, hair: HairHandler, ... }; return HANDLERS[type] || default.
- **Effort**: M • **Risk**: low (no behavior change)

### F16: console.error used but no centralized error reporting
- **Severity**: P3
- **Bucket**: Bad Impl
- **Files**: 49 console.error calls across codebase
- **What**: Errors logged to console but not sent to error monitoring (Sentry, LogRocket, etc.). In production, logs disappear on refresh; no post-mortem.
- **Impact**: Hard to debug user-reported crashes in production.
- **Fix**: Integrate error boundary + error reporter (Vercel analytics, Sentry). Non-blocking; can be staged.
- **Effort**: L • **Risk**: low (integration layer)

## Out of Scope / Won't Fix
- **TK-422 (GLP LP perf audit)**: Lighthouse scores, image optimization. This audit focuses on code patterns, not landing page perf.
- **TK-423 (Meta pixel multi-init fix)**: Already tracked separately.
- **Cart/Checkout-specific audit**: urlCartHandler.js, flowCartHandler.js covered separately.
- **Analytics audit**: utils/analytics/* covered in separate Tracking audit.
- **lib/meta/\***: Meta CAPI covered in TK-423.

## Summary by Severity
| Severity | Count | Focus |
|----------|-------|-------|
| P0 | 1 | Unguarded .json() (64/69) |
| P1 | 5 | aws-sdk, input libs, HTML injection, response.ok pattern, localStorage SSR |
| P2 | 7 | JSON.parse, eslint-disable, use client, console noise, Stripe init, regex, factories |
| P3 | 2 | next.config, error reporting |
