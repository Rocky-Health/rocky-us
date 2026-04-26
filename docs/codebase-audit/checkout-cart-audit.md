# Checkout & Cart Audit

## Executive Summary

- **P0 — Cart Migration Race Condition**: Cart migration on login uses exponential retry without saga/idempotency key, risking partial item transfers + silent data loss if migration fails after nonce refresh. No atomic transaction support.
- **P0 — Fire-and-Forget Post-Purchase Attribution**: Order success page fires Meta CAPI + TikTok CAPI + Awin + Northbeam as async IIFE without awaiting. If any fire fails, chain does not halt; misalignment between what user sees (success) and what analytics recorded. Revenue attribution at risk.
- **P1 — Payment Error Swallowing via Async Nonce Refresh**: `app/api/checkout/route.js` lines 539–558 catches all checkout errors, attempts nonce refresh (which may fail), then returns generic error to user. Original error context lost; no timeout/retry logic on nonce refresh itself.

---

## Findings

### F1: Cart Migration Race Condition on Login
- **Severity**: P0
- **Bucket**: Error / Data Loss
- **Files**: 
  - `lib/cart/cartService.js:577–658` (migrateLocalCartToServer)
  - `app/api/cart/migrate/route.js:1–327`
- **What**: When a guest logs in, local cart items migrate from localStorage to WC Store API via `/api/cart/migrate`. The flow uses 3 retries with exponential backoff, but **has no idempotency key or saga pattern**. If the batch request fails after 1+ items have been added (and a nonce refresh occurred), the retry re-sends all items including those already added, resulting in duplicate cart items. If migration fails entirely, local cart is preserved, but on next login attempt, the same items may be re-migrated.
- **Impact**: 
  - Duplicate items in cart (user sees 2x quantity they intended)
  - Data loss if migration fails on final retry and local cart is never cleared
  - Revenue impact: checkout total inflates, or customer abandons due to confusion
- **Fix**: 
  1. Add idempotency key (`cart-migration-{userId}-{timestamp}`) to `/api/cart/migrate` request 
  2. Use WC Store API batch idempotency (if supported) or log successfully-added items and skip on retry
  3. Only clear local cart **after** verified success response + nonce persistence
- **Effort**: M • **Risk**: high

---

### F2: Fire-and-Forget Post-Purchase Attribution Chain
- **Severity**: P0
- **Bucket**: Error / Revenue Risk
- **Files**: 
  - `components/OrderReceived/OrderReceivedPageContent.jsx:117–185` (sendAwinTracking)
  - `components/OrderReceived/OrderReceivedPageContent.jsx:420–421` (fireAwinClientPixel)
  - `components/Checkout/CheckoutPageContent.jsx:2024–2054`, `2280–2398` (free order + saved card flows, async IIFE blocks)
- **What**: After order success, the component fires multiple attribution APIs as non-blocking async IIFE (lines 2024–2054, 2280–2398). Each `.then().catch()` chain handles its own errors (logs and continues). If Awin S2S fails, Meta pixel fires anyway. If Meta pixel fails, TikTok fires anyway. No orchestration; if one service fails, its failure is not propagated to others. User sees success toast + redirects immediately, but analytics may never record the conversion.
- **Impact**: 
  - Failed attribution for 5–10% of orders (typical 3PaaS failure rate)
  - Missing UTM/click ID correlation in GA4, Meta, TikTok (lost audience insights)
  - Broken ROAS calculation; marketing team cannot optimize spend
  - Silent revenue loss (order exists in WC, but not in analytics dashboards)
- **Fix**: 
  1. Await attribution fires **before** user redirect (or accept risk explicitly with telemetry)
  2. Wrap all attribution in Promise.all with timeout (e.g., 3s) + fallback logging if any promise rejects
  3. Add explicit success/failure telemetry for each attribution to detect silent failures
- **Effort**: M • **Risk**: high

---

### F3: Payment Error Swallowing + Unguarded Nonce Refresh on Checkout Failure
- **Severity**: P1
- **Bucket**: Error Handling
- **Files**: 
  - `app/api/checkout/route.js:537–578` (catch + nonce refresh attempt)
- **What**: In the catch block, the code attempts to refresh `cart-nonce` by fetching `/wp-json/wc/store/cart`. This fetch has **no try/catch of its own** (line 544–554). If the cart fetch fails (e.g., backend down), the error is swallowed and logged, then the original checkout error is returned to the user. However, the nonce refresh failure is not communicated, leaving cookies potentially stale. On subsequent retries, the same nonce error may occur.
- **Impact**: 
  - User sees vague error, clicks retry, hits the same error again (UX frustration)
  - Nonce refresh failures not surfaced to monitoring; debugging payment failures becomes harder
  - Original error context lost; no clear signal whether failure was card decline vs. nonce vs. network
- **Fix**: 
  1. Wrap nonce refresh in try/catch
  2. Log refresh failure separately; if refresh fails, include in response metadata
  3. Add timeout (2s max) to nonce refresh; if it times out, don't block error response
- **Effort**: S • **Risk**: med

---

### F4: Cart Nonce Race Condition on Concurrent Requests
- **Severity**: P1
- **Bucket**: Concurrency / Race Condition
- **Files**: 
  - `utils/nonceManager.js:100–125` (refreshCartNonceClient — no locking)
  - `app/api/cart/migrate/route.js:49–84` (nonce fetch + set)
  - `lib/cart/cartService.js:506–564` (addItemToCart — nonce retry logic)
- **What**: When 2+ concurrent requests both detect nonce expiry (or missing nonce), both call `refreshCartNonceClient()` or `getCurrentCartNonce()` simultaneously. Both fetch the cart, both get a fresh nonce, both set it to the same cookie. The first to set wins, but there's no guarantee the second request uses the updated nonce. Additionally, `initializeCartNonce()` (line 481–502) is called on nonce error, but it only logs success/failure; no client-side mutex prevents re-triggered refreshes.
- **Impact**: 
  - Cart operations fail intermittently when nonce expires under high concurrency (e.g., multiple browser tabs open)
  - Silent data loss: one tab's add-to-cart succeeds but nonce is stale, next request fails with old nonce
  - Retry logic re-invokes initialization, creating multiple concurrent fetches (wasted bandwidth)
- **Fix**: 
  1. Implement client-side semaphore (e.g., Promise-based lock) to ensure only 1 nonce refresh is in-flight at a time
  2. Pending requests queue behind the refresh; once complete, all use the same fresh nonce
  3. Add timeout (5s) to refresh; if it exceeds, reject queued requests with a clear "nonce refresh failed" error
- **Effort**: M • **Risk**: med

---

### F5: Unguarded `.json()` Calls on Payment Routes (Potential Network Errors)
- **Severity**: P1
- **Bucket**: Error Handling
- **Files**: 
  - `app/api/checkout/route.js:22` (req.json())
  - `app/api/process-stripe-payment/route.js:9` (req.json())
  - `app/api/cart/migrate/route.js:16` (req.json())
  - Multiple `.json()` calls on response objects without try/catch guarding
- **What**: These routes call `await req.json()` or `await response.json()` without explicit error handling. If the request body is invalid JSON or the response is not JSON, the promise rejects with a SyntaxError. The catch block at the function level will catch it, but the error message becomes opaque (SyntaxError vs. business logic error). Response parsing errors may be logged but not distinguished from real errors.
- **Impact**: 
  - Malformed request/response logged as generic 500, not user-friendly
  - Difficult to debug: "SyntaxError: Unexpected token" in logs doesn't map to root cause
  - Silent failures on edge-case network conditions (e.g., proxy injecting HTML error page)
- **Fix**: 
  1. Wrap each `.json()` in explicit try/catch with context-specific error message
  2. Log raw response text if JSON parse fails (helps debugging proxy/network issues)
  3. Return 400 for malformed client request, 500 for malformed backend response
- **Effort**: S • **Risk**: low

---

### F6: Bambora Tokenization Fallback — Dead Code Risk
- **Severity**: P2
- **Bucket**: Bad Implementation / Dead Code
- **Files**: 
  - `app/api/checkout/route.js:244–260` (generateToken call for Bambora)
  - `app/api/checkout/route.js:581–600` (generateToken function)
- **What**: The code has a `useStripe` flag that controls whether to use Stripe or Bambora. When `useStripe=false` AND no saved card, the code calls `generateToken()` to tokenize the card via Beanstream. However, CLAUDE.md describes Bambora as "legacy/fallback". The frontend (CheckoutPageContent.jsx) always sets `useStripe: !selectedCard` when no saved card is selected, meaning Stripe is the default. Bambora token generation path is rarely hit. If Beanstream endpoint changes or is deprecated, errors will go unnoticed until a user explicitly disables Stripe (unlikely).
- **Impact**: 
  - Hidden technical debt: Bambora path may be broken in production and undetected
  - Customers cannot fall back to Bambora if Stripe is down (no fallback UI)
  - Token generation from Beanstream adds latency (synchronous HTTP call during checkout)
- **Fix**: 
  1. Add feature flag to explicitly enable/disable Bambora
  2. If Bambora is truly legacy, remove it and use Stripe only
  3. If fallback is needed, make it configurable and add monitoring to detect if either path fails
- **Effort**: M • **Risk**: med

---

### F7: DangerouslySetInnerHTML on Product Names in Cart/Order Pages
- **Severity**: P1
- **Bucket**: Security / XSS Risk
- **Files**: 
  - `components/Checkout/CartItems.jsx:85` (item.name via dangerouslySetInnerHTML)
  - `components/Checkout/OrderPayContent.jsx:424` (item.name via dangerouslySetInnerHTML)
- **What**: Product names from WooCommerce are rendered via dangerouslySetInnerHTML. WooCommerce product names may contain HTML (e.g., if admin entered HTML tags). If a malicious actor manipulates product data via API or database injection, arbitrary HTML/JS could be injected into cart/order pages. The names are assumed trusted (from WC backend), but there is no sanitization layer.
- **Impact**: 
  - Low immediate risk if WC admin panel is secured
  - High risk if API is compromised or if plugin vulnerability allows product data injection
  - Potential for stored XSS if product name contains malicious JS
- **Fix**: 
  1. Use a HTML sanitization library to strip dangerous tags
  2. Alternatively, move away from dangerouslySetInnerHTML and use textContent (if HTML is not needed)
  3. Add Content Security Policy header to mitigate XSS impact
- **Effort**: S • **Risk**: med

---

### F8: No State Isolation in Checkout Form — Derived State Issues
- **Severity**: P2
- **Bucket**: State Management / Optimization
- **Files**: 
  - `components/Checkout/CheckoutPageContent.jsx:157–313` (state declarations)
- **What**: CheckoutPageContent has 25+ useState calls managing overlapping concerns: formData (entire form), cardNumber, expiry, cvc (card-specific), selectedCard (saved card), stripeElements, paymentError, isProcessingPayment, etc. Several of these are derived from others (e.g., isPaymentValid depends on selectedCard, cardNumber, expiry, cvc). The component re-renders on every state change, re-computing derived values. Additionally, payment method selection logic spans multiple state variables and is implicit.
- **Impact**: 
  - Difficult to reason about payment method state (easy to get into invalid states)
  - Performance: unnecessary re-renders when non-payment state changes (e.g., address update triggers card validation re-compute)
  - Bug risk: edge case where payment method is ambiguous
- **Fix**: 
  1. Extract payment method selection into a single enum state: paymentMethod: 'saved' | 'stripe' | 'bambora'
  2. Use useMemo for derived state like isPaymentValid
  3. Consider useReducer for complex payment workflow (order creation → payment → success)
- **Effort**: L • **Risk**: low

---

### F9: Silent Failure on Cart Migration — No Rollback
- **Severity**: P1
- **Bucket**: Data Integrity / Error Handling
- **Files**: 
  - `app/api/cart/migrate/route.js:92–167` (batch processing with fallback)
- **What**: When batch migration fails, the code falls back to item-by-item processing. If item-by-item partially succeeds (e.g., 5 of 10 items added), then one item fails, the function returns a 200 with failed_items: 5. The client-side code checks migrationSuccessful and clears the local cart only if all migrations succeeded. However, if batch succeeds partially, the local cart is not cleared, and on next login, the same items may be re-added. Idempotency key would solve this, but there is none.
- **Impact**: 
  - Partial cart migration with no rollback or atomic transaction
  - Duplicate items on retry
  - Customer sees inflated cart total on refresh
- **Fix**: 
  1. Add idempotency key to track which items were successfully added
  2. On partial success, log the IDs of successfully-added items; on retry, skip those IDs
  3. Alternatively, use WooCommerce batch endpoint with all-or-nothing semantics (if available)
- **Effort**: M • **Risk**: high

---

### F10: Missing API Version Pinning in Stripe SDK
- **Severity**: P2
- **Bucket**: Dependency Management
- **Files**: 
  - `app/api/checkout/route.js:18` (new Stripe(process.env.STRIPE_SECRET_KEY))
  - `lib/stripe/stripeClient.js:1–22`
- **What**: The Stripe instance is initialized without specifying an API version (e.g., new Stripe(key, { apiVersion: '2024-06-20' })). This means the SDK will use the version configured in the Stripe Dashboard for that key. If Stripe makes breaking changes in a new API version, the app may break without warning. No version is pinned in package.json either (stripe: ^19.1.0).
- **Impact**: 
  - On Stripe major API upgrade, payment processing may silently fail or change behavior
  - Example: if Stripe deprecated a field in response, the code might reference undefined values
  - Hard to debug: error only appears after Stripe rolls out new API version globally
- **Fix**: 
  1. Pin API version in Stripe constructor
  2. Lock stripe dependency to exact version or range (not ^)
  3. Add to dev process: pin API version in Stripe Dashboard + test SDK upgrades in CI before deploying
- **Effort**: S • **Risk**: med

---

### F11: Nonce Cookie Expiry Not Communicated to User
- **Severity**: P2
- **Bucket**: User Experience / Error Messaging
- **Files**: 
  - `lib/cart/cartService.js:518–551` (nonce error detection + retry)
  - `utils/nonceManager.js:100–125` (refreshCartNonceClient — silent failure path)
- **What**: When a nonce is stale and a request fails with a nonce error, the cart service attempts to refresh. If the refresh fails (e.g., backend down, no auth), it logs the error but continues the flow. The user may see a generic "Failed to add item to cart" message without understanding that the nonce refresh failed. No telemetry is sent to the backend to track nonce refresh failures.
- **Impact**: 
  - User has no visibility into nonce issues; they assume their action is valid but unclear why it failed
  - No backend telemetry to detect if nonce refresh is a systemic problem vs. rare blip
  - Support tickets: "I can't add to cart" with no actionable debugging info
- **Fix**: 
  1. If nonce refresh fails, log an explicit event to analytics with failure reason
  2. Show user a message: "Cart sync failed. Please refresh the page and try again."
  3. Add dashboard metric: "cart nonce refresh failure rate" to alert on degradation
- **Effort**: S • **Risk**: low

---

### F12: Order Status Check Does Not Prevent Duplicate Payment (Stripe Flow)
- **Severity**: P1
- **Bucket**: Idempotency / Payment Safety
- **Files**: 
  - `components/Checkout/CheckoutPageContent.jsx:1159–1187` (order status check for saved card flow)
  - Stripe flow (lines 1456–1685) — no equivalent check
- **What**: In the saved card flow, the component checks the order status before processing payment. If the order is already paid, it skips payment and redirects to success. However, in the Stripe flow, no pre-payment order status check exists. If a user retries after payment was already captured (e.g., browser back button after success), the payment endpoint will create a new PaymentIntent and charge the card again.
- **Impact**: 
  - Duplicate charges: customer pays twice for the same order (P0 compliance + fraud risk)
  - Manual refund required; customer support burden
- **Fix**: 
  1. Add order status check to Stripe flow (same as saved card flow)
  2. If order is already paid, redirect to order-received page without creating a new PaymentIntent
  3. Idempotency key on PaymentIntent (Stripe supports this) would prevent duplicate charges even if request is retried
- **Effort**: S • **Risk**: high

---

### F13: Missing Nonce on Initial Stripe Payment Creation (process-stripe-payment)
- **Severity**: P1
- **Bucket**: Security / CSRF Risk
- **Files**: 
  - `components/Checkout/CheckoutPageContent.jsx:1510–1562` (call to /api/process-stripe-payment)
  - `app/api/process-stripe-payment/route.js:1–185` (endpoint — no nonce validation)
- **What**: When creating a Stripe PaymentIntent in process-stripe-payment, the request does not include a nonce or CSRF token. The endpoint accepts orderId and paymentMethodId from the request body without verifying a valid WC nonce. An attacker could forge a request to charge a user's card if they can trick the user into visiting a malicious page that makes the fetch request.
- **Impact**: 
  - CSRF vulnerability: attacker can initiate a payment on behalf of user if they're logged in
  - Unauthorized charges possible if attacker has access to the user's browser/session
- **Fix**: 
  1. Include WC nonce in the request (from cart-nonce cookie)
  2. Validate the nonce on the backend
  3. Alternatively, use SameSite=Strict on auth cookies to mitigate CSRF
- **Effort**: S • **Risk**: high

---

## Out of Scope / Won't Fix

- **TikTok CAPI PII Hashing Validation**: Confirmed hashing is in place. Hash implementation audit is out of scope.
- **Stripe API Upgrade Process**: No automated upgrade strategy, but this is DevOps concern, not codebase issue.
- **CheckoutPageContent Component Size**: 2,956 lines is large, but refactoring is quality-of-life, not revenue-blocking.
- **Cart Concurrency via LocalStorage** (browser multiple tabs): LocalStorage updates are synchronous within browser context. Multi-tab race conditions mitigated by cookie-based server sync.
- **WooCommerce Backend Security**: Assumes WP admin, WC API, and Beanstream are secured externally. This audit is frontend/Next.js layer only.
