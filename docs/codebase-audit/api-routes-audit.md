# API Routes Layer Audit

## Executive Summary

- **72 API routes** with significant gaps in Next.js caching declarations, auth boundary enforcement, and baseline protections (rate limiting, request timeouts). No route declares `export const revalidate` or `export const dynamic`, leaving all endpoints on default dynamic behavior with potential cascading cold-start overhead on Vercel serverless.
- **Critical auth vector**: GA4-details endpoint (`/order/ga4-details/[id]`) exposes order PII (email, phone, full names, products, totals) by order ID without any auth check; any user can enumerate orders and download GA4 tracking data.
- **Privilege escalation risk**: Common pattern across 20+ routes uses `process.env.ADMIN_TOKEN || encodedCredentials.value` fallback, enabling user-supplied auth to escalate permissions if the user token is broader than expected; 2–3 routes fetch customer data with ADMIN_TOKEN when they should use user's own auth.

## Findings

### F1: Missing Caching Declarations on All API Routes (72 affected)
- **Severity**: P1
- **Bucket**: Perf
- **Files**: `app/api/**/route.js` (all files, 0 have `export const revalidate` or `export const dynamic`)
- **What**: Every API route defaults to `dynamic: 'auto'` in Next.js. On Vercel serverless, this means each cold-start (function init) recomputes without leveraging process-local caches (30-min product cache in `lib/woocommerce.js` becomes useless). Read-heavy endpoints like `/api/products/[slug]`, `/api/ed`, `/api/hair` should declare `export const dynamic = 'force-dynamic'` or `export const revalidate = 3600` (1-hour server cache) to signal intent and reduce function init overhead.
- **Impact**: Product and category listing endpoints re-fetch from WordPress on every cold-start; 30-min in-memory cache only helps within a single function instance lifetime. On low traffic, nearly every request is a cold-start.
- **Fix**: Add 1-line declarations to top of route files: `export const dynamic = 'force-dynamic'` for auth-required endpoints (cart, checkout); `export const revalidate = 1800` (30 min) for static reads (products, categories); `export const revalidate = 60` (1 min) for near-real-time (order status, checkout validation).
- **Effort**: S • **Risk**: low

### F2: GA4-Details Endpoint Exposes Order PII Without Auth Check
- **Severity**: P0
- **Bucket**: Bad Impl
- **Files**: `app/api/order/ga4-details/[id]/route.js:73–130`
- **What**: Route accepts any integer `id` parameter (order ID) and returns full order details: billing email, phone, full name, product list with prices, shipping address—all without verifying that the authenticated user owns the order. No cookie check for `authToken` or `userId` comparison.
- **Impact**: Attacker can enumerate all orders (try IDs 1, 2, 3…) and scrape customer PII and order history. API is read-only but exposes sensitive customer data that should be protected.
- **Fix**: Add auth check at top of GET handler: verify `authToken` cookie exists and matches WooCommerce customer ID (`userId`) with requested order's customer ID before returning data. Return 403 if mismatch.
- **Effort**: S • **Risk**: low

### F3: Login/Register Routes Missing Rate Limiting
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: `app/api/login/route.js`, `app/api/register/route.js`, `app/api/forgot-password/route.js`, `app/api/reset-password/route.js`
- **What**: No rate limiting, IP throttling, or email-based throttling on authentication endpoints. An attacker can brute-force credentials or enumerate valid emails by submitting 1000s of requests per minute.
- **Impact**: Credential stuffing / brute-force attacks feasible; enumeration of registered emails possible; password reset can be used for denial-of-service (spam reset links to target email).
- **Fix**: Implement rate limiting middleware or Vercel Edge middleware using `Ratelimit` from `@vercel/kv` or similar. Throttle by IP + email: max 5 login attempts per email per minute, max 20 register requests per IP per hour, max 3 forgot-password per email per hour.
- **Effort**: M • **Risk**: med

### F4: ADMIN_TOKEN Fallback Pattern Enables Privilege Escalation
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: `app/api/checkout/route.js:155`, `app/api/checkout/route.js:211`, `app/api/cart/route.js:108`, `app/api/create-payment-intent/route.js:234`, `app/api/login/route.js:126`, `app/api/google-login/route.js:134` (and 14 more)
- **What**: Widespread pattern: `Authorization: process.env.ADMIN_TOKEN || encodedCredentials.value`. If `ADMIN_TOKEN` is unset in production, routes fall back to user's auth cookie; if it is set but user auth cookie is also present, code prefers ADMIN_TOKEN. This inverts the principle of least privilege: mutating operations (checkout, cart update, customer profile) should ALWAYS use user's own auth, never ADMIN_TOKEN (which has full WooCommerce access).
- **Impact**: If ADMIN_TOKEN env var is accidentally exposed or if a route erroneously uses ADMIN_TOKEN for user mutation, an unauthenticated attacker with knowledge of the admin token could mutate any user's cart, place orders on behalf of others, or modify customer profiles.
- **Fix**: Remove ADMIN_TOKEN fallback on all mutation routes. Use ADMIN_TOKEN only for setup/batch operations (fetch categories, product mapping, etc.). User mutations use `encodedCredentials.value` exclusively. Add code review rule: grep for `ADMIN_TOKEN` in checkout, cart, order routes and flag as error.
- **Effort**: M • **Risk**: high

### F5: Missing Auth Boundary on Cart Add-Item When Unauthenticated
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `app/api/cart/add-item/route.js:24–44`
- **What**: Route returns mock success for unauthenticated users with hard-coded test data instead of requiring authentication. Comment says "allow testing without authentication," but this bypasses the protected route check in middleware and confuses client state (client thinks item was added to server cart when it wasn't).
- **Impact**: Low severity (feature works on frontend via localStorage fallback), but creates inconsistency: some cart routes require auth (GET /api/cart), others accept guests and return fake success. Client-side cart sync logic becomes fragile.
- **Fix**: Remove mock success logic. Return 401 for unauthenticated POST requests. For testing, use a dedicated `/api/cart-test` endpoint or feature flag, never the production endpoint.
- **Effort**: S • **Risk**: low

### F6: No Auth Verification on Order/Customer Data Mutations
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `app/api/update-customer-profile/route.js:11–23`
- **What**: Route checks for `authToken` and `userId` cookies but does not verify that the `userId` from the cookie matches the intended customer ID being updated. If an attacker can predict or steal another user's `authToken` cookie, they can update that user's profile (name, address, phone, DOB).
- **Impact**: If a session token leaks (e.g., via XSS or accidental log exposure), attacker can modify target user's profile data. Severity reduced because customer data is not financial, but still a data integrity issue.
- **Fix**: Compare `userId` from cookie with the customer ID embedded in the request or WooCommerce response. Fail with 403 if mismatch. Example: `if (userId.value !== response.data.id) throw new Error("Unauthorized").`
- **Effort**: S • **Risk**: med

### F7: Console.log / Console.error Statements in Production Code
- **Severity**: P2
- **Bucket**: Error
- **Files**: `app/api/awin/track-order/route.js:30`, `app/api/meta-capi/purchase/route.js:13`, `app/api/tiktok-capi/purchase/route.js:25`, `app/api/checkout/route.js:64–70` (and 19 more)
- **What**: 24 instances of `console.log()` and `console.error()` directly in route handlers. In production, these logs may echo sensitive data (order IDs, customer names, emails, error responses from WordPress). Example: `console.log("[Meta CAPI] Sending event for order ${order_id} to ${gateway}:", {...})` may log PII.
- **Impact**: Logs visible in Vercel deployment logs; if logs are aggregated to a third-party service, sensitive customer data could leak. Lower severity than code-level leaks, but still a risk.
- **Fix**: Replace with `logger.log()` (already imported from `@/utils/devLogger`). Audit `devLogger` to ensure it redacts PII (email, phone, full names) in production. Remove all direct `console.log` statements.
- **Effort**: S • **Risk**: low

### F8: Inconsistent Error Response Envelopes
- **Severity**: P2
- **Bucket**: Error
- **Files**: `app/api/checkout/route.js:107–114`, `app/api/cart/route.js:82–92`, `app/api/register/route.js:51–57`, `app/api/order/ga4-details/[id]/route.js:105–115`
- **What**: Routes return varying response shapes: some use `{ error: '...' }`, others `{ success: false, message: '...' }`, others `{ error: '...', details: {...} }`. Inconsistency forces client to handle multiple response patterns, increasing bug risk. Example: checkout validation fails with `{ error: 'Validation failed', details: [...], message: '...' }` (3 fields), but login fails with `{ error: '...', code: '...' }` (2 fields).
- **Impact**: Client error handling code must switch on response shape; easy to miss one variant and show generic error. Reduces developer experience.
- **Fix**: Standardize on single envelope: `{ success: boolean, error?: string, code?: string, data?: any }`. Create wrapper: `function errorResponse(message, code, status) { return NextResponse.json({ success: false, error: message, code }, { status }); }` and use consistently across all routes.
- **Effort**: M • **Risk**: low

### F9: Sequential Awaits on Independent Operations
- **Severity**: P2
- **Bucket**: Perf
- **Files**: `app/api/login/route.js:103–117`, `app/api/register/route.js:150+` (multi-step fetch pattern)
- **What**: Routes make multiple independent API calls to WordPress sequentially: fetch user profile, then fetch Stripe customer, then fetch order history—each awaited one at a time. Example in login: `await wpResponse; await customerResponse` where both are independent HTTP calls to different endpoints.
- **Impact**: On checkout (2-3 sequential fetches), adds 200–400ms latency. Could be parallelized with `Promise.all()` to reduce to 100–150ms.
- **Fix**: Identify independent fetches. Wrap in `Promise.all([fetch1, fetch2]).then(([r1, r2]) => ...)`. Already done in some routes (`cart/route.js:98`); make it standard pattern.
- **Effort**: S • **Risk**: low

### F10: Process-Local Cache Not Tenant-Scoped (Memory Leak Risk)
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `lib/woocommerce.js:64–68`
- **What**: `productCache` and `variationsCache` are global `Map` objects in module scope. On Vercel serverless, each function instance gets its own memory space, so no cross-user data leaks across instances. However, on long-running servers (self-hosted), cache is never invalidated—memory grows unbounded. No cache eviction policy, no size limit, no TTL check on old entries.
- **Impact**: On Vercel (ephemeral functions), not an issue. On self-hosted Node servers, maps grow indefinitely, causing memory exhaustion after days/weeks.
- **Fix**: If self-hosting, add LRU cache library (e.g., `lru-cache` npm package) with max size 500 items. On Vercel, leave as-is (acceptable). Add code comment explaining assumption.
- **Effort**: M • **Risk**: low

### F11: Axios Timeout Defaults to 5 Minutes, Some Routes Don't Set Timeout
- **Severity**: P2
- **Bucket**: Perf
- **Files**: `lib/woocommerce.js:24`, `app/api/checkout/route.js` (implicit default), `app/api/create-payment-intent/route.js` (implicit default)
- **What**: `lib/woocommerce.js` sets global Axios timeout to 300s (5 min), which is long for serverless functions. Some routes (like checkout) don't override and rely on this default. If WordPress is slow or hung, Vercel function will wait 5 minutes before failing, exceeding Vercel's function timeout (10s for hobby plan, 60s for pro).
- **Impact**: On Vercel, function killed before Axios timeout triggers. On self-hosted, slow WordPress requests hang the process.
- **Fix**: Reduce default to 30s in `lib/woocommerce.js`. Override per-route: checkout 10s (critical path), product fetch 5s (cache anyway), write operations 15s.
- **Effort**: S • **Risk**: med

### F12: No Nonce Validation on Cart Write Operations
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: `app/api/cart/add-item/route.js`, `app/api/cart/add-items-batch/route.js`, `app/api/cart/empty/route.js` (no nonce check in request body)
- **What**: Routes read `cart-nonce` from cookies and send it in headers to WordPress, but never validate that client sent the same nonce in the POST request. CSRF protection depends on nonce being checked server-side (WordPress does this), but Next.js API doesn't re-validate client-sent nonce.
- **Impact**: Low severity (WordPress validates), but violates defense-in-depth. If WordPress nonce check is weak or skipped for some reason, cart mutations could be CSRF-vulnerable.
- **Fix**: Add nonce validation: extract nonce from request headers, compare with `cookieStore.get('cart-nonce').value`. Fail if mismatch.
- **Effort**: S • **Risk**: low

### F13: HTTPS Agent with Disabled Certificate Validation
- **Severity**: P3
- **Bucket**: Bad Impl
- **Files**: `app/api/check-questionnaire/route.js:85–86`
- **What**: One route creates Axios instance with `httpsAgent: new https.Agent({ rejectUnauthorized: false })`, disabling SSL certificate validation. This is a debugging leftover and should not reach production.
- **Impact**: On Vercel with SSL termination, not an issue. On self-hosted with self-signed certs or MITM, could leak data.
- **Fix**: Remove `httpsAgent` config or wrap in `if (process.env.NODE_ENV === 'development')` check. Prefer DNS/CA setup over disabling validation.
- **Effort**: S • **Risk**: low

### F14: Middleware Logs All API Calls with Session ID in Production
- **Severity**: P3
- **Bucket**: Error
- **Files**: `middleware.js:23–25`
- **What**: `console.log()` on every API request: `[API] ${req.method} ${pathname} | session=${sessionId} | request=${requestId}`. Session ID is stored in cookies, so logs may be aggregated and expose session identifiers.
- **Impact**: Session IDs in logs could be used to correlate requests and infer user activity patterns. Low severity on Vercel (logs not public), but higher on self-hosted.
- **Fix**: Replace `console.log()` with `logger.log()` and ensure logger is configured for production (no session ID in structured logs, or log to secure sink only).
- **Effort**: S • **Risk**: low

## Out of Scope / Won't Fix

- **Stripe SDK usage**: audit deferred to payment-processing specialist (Stripe API calls are industry standard, not app-specific bugs).
- **WordPress REST API security**: outside scope (WP backend's responsibility to enforce auth, nonce, capabilities).
- **TLS/HTTPS config**: deployment-level, covered by Vercel.
- **DNS/CA certificate**: deployment-level.
- **Existing documented findings**: TK-422 (vendor-script timing, font formats, LP cache revalidate) and TK-423 (meta-pixel multi-init) already audited.
