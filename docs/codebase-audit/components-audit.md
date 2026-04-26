# Components & Layout Audit

## Executive Summary
- **F1–F3** cover missing setInterval/setTimeout cleanup in 3 components (GlobalQuebecPopup, CrossSellModal, ReviewsSection), creating potential memory leaks and stale state mutations.
- **F4–F5** flag 15+ components using `key={index}` in dynamically rendered lists, risking reconciliation bugs when items reorder.
- **F6–F8** identify raw HTML injection via `dangerouslySetInnerHTML` in 40+ components with weak or no sanitization, exposing XSS risk especially in blog/article content.

## Findings

### F1: Missing setInterval cleanup in GlobalQuebecPopup.jsx
- **Severity**: P1
- **Bucket**: Error
- **Files**: components/GlobalQuebecPopup.jsx:57–72
- **What**: `setInterval()` called at line 57 but cleanup is conditional on `isOpen`. If component unmounts while interval is active, the interval persists and keeps checking localStorage every 500ms indefinitely.
- **Impact**: Memory leak + unnecessary CPU polling; effects compound with component remounts (e.g., navigation).
- **Fix**: Refactor so interval is always tracked and cleared in the cleanup function, regardless of `isOpen` state. Store interval reference at the component level and ensure cleanup runs unconditionally.
- **Effort**: S • **Risk**: low

### F2: setTimeout callback without closure capture in CrossSellModal.jsx
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: components/EDPlans/CrossSellModal.jsx:41, 183
- **What**: Multiple `setTimeout()` calls (line 41: `setTimeout(() => onClose(), 0)`; line 183: `const intervalId = setInterval(updateRemainingTime, 1000)`) without ensuring cleanup in all code paths. Line 41 uses `setTimeout(fn, 0)` as a hacky way to defer a callback — this can interfere with React batching and make timing unpredictable. Interval at line 183 is cleaned up, but the antipattern at line 41 suggests lack of clarity about timing.
- **Impact**: Race conditions in modal closure; potential state mutations after unmount if user closes modal while timeout fires.
- **Fix**: Replace `setTimeout(() => onClose(), 0)` with direct call (if valid) or use a proper cleanup pattern. If the setTimeout is needed to defer closing, document why. Verify all async operations complete before unmount.
- **Effort**: S • **Risk**: med

### F3: useEffect deps array includes state that triggers re-run, preventing cleanup of timeouts
- **Severity**: P1
- **Bucket**: Error
- **Files**: components/ReviewsSection.jsx:82 and components/BodyOptimization/bo3/NewReviewsSection.jsx:82
- **What**: `useEffect` runs with deps `[isScriptLoaded, hasError]`. Inside the effect, these state vars are set (e.g., `setIsScriptLoaded(true)` at line 40). This triggers the effect again, which sets a new `fallbackTimeout`, and the old timeout may not be cleared if the early return path is hit. At line 82, the cleanup function clears `fallbackTimeout`, but a race exists: if the effect runs again before the callback fires, multiple timeouts accumulate.
- **Impact**: Multiple "timeout reached" handlers may fire, causing duplicate fallback renders or console errors.
- **Fix**: Extract script initialization logic into a separate `useEffect` with no deps (or only initial setup). Keep a ref for `fallbackTimeout` to ensure only one is active. Or split: one effect for setup (empty deps), one for script-loaded state (deps: [isScriptLoaded]).
- **Effort**: M • **Risk**: med

### F4: key={index} in dynamic lists (15+ components)
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: components/AccordionList.jsx:21, components/FaqsSection.jsx, components/ButtonsSection.jsx, components/FeaturesNotAnimated.jsx, components/ListWithNumbers.jsx, components/ListWithIcons.jsx, components/PageCover.jsx, components/RockyInTheNews.jsx, components/RockyFeatures.jsx, components/RockyBlog.jsx, components/RockyInTheNews2.jsx
- **What**: `.map((item, index) => <Component key={index} ... />)` used in lists that may be reordered, filtered, or have items inserted/deleted. React uses `key` for reconciliation; `index` means "whatever is at position 0" not "this specific item", so reordering causes component state to follow the wrong item.
- **Impact**: Form inputs lose focus/values after reorder; animations glitch; internal component state becomes desynchronized with visible content.
- **Fix**: Use a unique, stable identifier for each item (e.g., `item.id`). If items don't have IDs, generate them at data load time, not at render time. For static lists (hero sections, marketing pages), `index` is acceptable with a comment noting the list is static.
- **Effort**: M • **Risk**: med

### F5: Inline event handlers passed to memoized children on every render
- **Severity**: P2
- **Bucket**: Optimization
- **Files**: components/Navbar.jsx (passes `menuItems` as inline object), components/EDPlans/CrossSellModal.jsx:346 (`() => handleItemClick(index, item.image)`)
- **What**: Parent components create new function references or object literals on every render and pass them to `React.memo()` children. Example: `<AccordionItem key={index} ... onClick={() => handleItemClick(index, item.image)} />` creates a new function each render, negating memoization. Also, `menuItems` object in Navbar.jsx is redefined on every render even though it's static data.
- **Impact**: Memoized children re-render unnecessarily, defeating optimization; small perf hit on complex lists.
- **Fix**: Move static data outside component (e.g., `menuItems`). Use `useCallback` for dynamic handlers or useMemo for inline objects. At minimum, memoize the `menuItems` object.
- **Effort**: M • **Risk**: low

### F6: Unvalidated dangerouslySetInnerHTML in FaqItem.jsx and Article components
- **Severity**: P0
- **Bucket**: Security
- **Files**: components/FaqItem.jsx:21, 37; components/AccordionItem.jsx; components/Article/HtmlContent.jsx:307; components/PageCover.jsx; components/ListWithNumbers.jsx
- **What**: Multiple components use `dangerouslySetInnerHTML={{ __html: data }}` without sanitization. Example: `FaqItem.jsx` line 21 renders `question` and line 37 renders `answer` directly into the DOM. These values come from WordPress/WooCommerce REST API. If API is compromised or a user edits FAQ content via admin, malicious HTML/JS can execute.
- **Impact**: XSS vulnerability; attacker can inject `<script>` tags, event handlers (`onmouseover`), or iframes. Affects all users viewing the FAQ/article.
- **Fix**: Use a sanitization library like DOMPurify or sanitize-html before rendering. Whitelist allowed tags (e.g., `<b>`, `<em>`, `<a>`, `<img>`). Example: `const clean = DOMPurify.sanitize(question); <span dangerouslySetInnerHTML={{ __html: clean }} />`. Or, migrate to a safe markdown/rich-text library that parses and validates.
- **Effort**: M • **Risk**: high

### F7: HtmlContent.jsx regex-based HTML parsing vulnerable to edge cases
- **Severity**: P1
- **Bucket**: Bad Impl
- **Files**: components/Article/HtmlContent.jsx:25–290
- **What**: Component uses regex to strip shortcodes and clean HTML (lines 25–40). Regex-based HTML parsing is fragile: `\[vc_row[^\]]*\]` doesn't handle escaped `]` or nested brackets correctly. The heading ID generation (lines 260–286) assumes regex matches produce safe content, but if WordPress stores malformed HTML, the regex may fail or produce unexpected output. Additionally, `processedHtml` is passed raw to `dangerouslySetInnerHTML` at line 307 with no final validation.
- **Impact**: Malformed HTML may render incorrectly or silently lose content. If regex fails to strip a shortcode, stale `[vc_row]` text appears on page. No sanitization post-processing, so injected `<script>` in the original content still executes.
- **Fix**: Replace regex HTML parsing with a proper HTML parser (e.g., jsdom for server-side, or cheerio for Node). Use DOMPurify as a final step before rendering. Consider moving blog content processing to a build-time or server-side step (via API route) rather than client-side.
- **Effort**: L • **Risk**: high

### F8: dangerouslySetInnerHTML in Bo4/Bo5 MarketingHeroSection with unvetted content
- **Severity**: P1
- **Bucket**: Security
- **Files**: components/Bo4/MarketingHeroSection.jsx; components/Bo5/MarketingHeroSection.jsx; components/Bo5/ComparingTable.jsx
- **What**: These components render structured content (titles, descriptions) from data objects via `dangerouslySetInnerHTML`. Example: `<div dangerouslySetInnerHTML={{ __html: title }} />`. If title or item content comes from an API or is editable via admin, XSS is possible. No sanitization before render.
- **Impact**: XSS in marketing pages; affects user trust and potential compliance issues (GDPR, if PII is leaked via injected scripts).
- **Fix**: Sanitize with DOMPurify or whitelist the set of allowed HTML tags (e.g., `<br>`, `<strong>` only). Example: `DOMPurify.sanitize(title, { ALLOWED_TAGS: ['br', 'strong'] })`.
- **Effort**: M • **Risk**: high

### F9: Missing cleanup of event listeners in Navbar subcomponents
- **Severity**: P2
- **Bucket**: Error
- **Files**: components/Navbar/* (subcomponents require inspection)
- **What**: Navbar.jsx imports subcomponents (Logo, Navlinks, etc.) that likely attach event listeners (e.g., click handlers for dropdown menus) but may not clean them up in useEffect return. If subcomponents use `window.addEventListener()` without cleanup, unmounting parent causes listeners to persist.
- **Impact**: Memory leak; click handlers fire even after navigation away; potential double-event-firing if component re-mounts.
- **Fix**: Audit all Navbar subcomponents for `addEventListener()`. Ensure each is paired with `removeEventListener()` in a useEffect cleanup function. Use React event props (`onClick`, `onMouseEnter`) instead of `addEventListener()` where possible.
- **Effort**: M • **Risk**: med

### F10: Stale closure in InactivityTimeoutHandler.jsx
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: components/InactivityTimeoutHandler.jsx:41
- **What**: `handleTimeout` callback uses `hasLoggedOut` in its logic, but is created with `useCallback` deps `[hasLoggedOut]`. If `hasLoggedOut` changes (set to true at line 30), the old callback is stale and won't run again. However, the hook `useInactivityTimeout` may cache the callback. If the hook calls the callback twice, the second call uses a stale reference. Additionally, `logout()` at line 34 is called inside `setTimeout`, which can fire after unmount if user navigates away during the 2-second delay.
- **Impact**: Inactivity timeout handler may double-fire; logout may be called on a stale context after unmount, causing console errors or race conditions.
- **Fix**: Ensure `useInactivityTimeout` hook receives updated callbacks. Wrap `logout()` call in an abort signal or check if component is still mounted before firing. Use `useRef` to track mounted state.
- **Effort**: M • **Risk**: med

### F11: Image priority="true" on non-LCP images
- **Severity**: P2
- **Bucket**: Optimization
- **Files**: components/ReviewsSection.jsx:124, components/EDPlans/EdProductCard.jsx, components/GLP1Offer/GLP1ExtendedTestimonials.jsx
- **What**: Multiple components set `priority={true}` on images that are not Largest Contentful Paint (LCP) candidates. Example: ReviewsSection logos and testimonial images are far down the page or conditionally rendered. Setting `priority=true` pre-loads these images, wasting bandwidth and delaying LCP of the actual hero image.
- **Impact**: Slower page load; LCP regresses because resources are wasted on below-fold images.
- **Fix**: Remove `priority={true}` from non-LCP images. Only the hero/above-fold image should have priority. If an image is conditionally shown (e.g., fallback if script fails), leave `priority=false` (default).
- **Effort**: S • **Risk**: low

### F12: Derived state calculated on every render in AccordionList.jsx and similar
- **Severity**: P2
- **Bucket**: Optimization
- **Files**: components/AccordionList.jsx:8, components/RockyFeatures.jsx:27
- **What**: `const dataToUse = cards ? cards : rockyFeaturesCards;` (line 27) recalculates on every render. Not expensive, but pattern suggests lack of clarity. `selectedImage` state at AccordionList line 8 is derived from data; when `data` changes, `selectedImage` should be re-derived via `useEffect`, not reset manually. This is a derived-state-in-effect anti-pattern waiting to happen.
- **Impact**: Subtle bugs if `data` prop updates without re-initializing `selectedImage`; accidental state divergence.
- **Fix**: Use `useMemo` for `dataToUse`. For `selectedImage`, initialize it from data at mount, then update via `useEffect` if data changes. Or lift state to parent if data is truly the source of truth.
- **Effort**: S • **Risk**: low

### F13: Inconsistent error handling in form submission (LoginRegisterPage/Login.jsx)
- **Severity**: P2
- **Bucket**: Bad Impl
- **Files**: components/LoginRegisterPage/Login.jsx:50–56
- **What**: When user types, error is cleared (lines 50–56). But if the same field error re-occurs (e.g., field was filled, then emptied, then submitted again), the error UI may flash or not appear if clearing logic interferes with state transitions. Also, no try-catch around form submission likely means network errors surface uncaught in console.
- **Impact**: Poor UX; potential error not surfacing to user; unhandled promise rejections.
- **Fix**: Use a validation state machine or clear errors only on form submission, not on keystroke. Wrap submission in try-catch and set error state explicitly on failure.
- **Effort**: M • **Risk**: low

### F14: setTimeout(fn, 0) in BlogsPage.jsx for scroll behavior
- **Severity**: P3
- **Bucket**: Optimization
- **Files**: components/Blogs/BlogsPage.jsx:82–84
- **What**: `setTimeout(() => { topRef.current?.scrollIntoView(...) }, 0)` defers scroll until after render. This is a workaround for ensuring DOM is painted before scroll. Better approach is `useLayoutEffect` (fires before paint) or request animation frame.
- **Impact**: Minor; scroll may jank or be delayed. Not a bug, but suboptimal.
- **Fix**: Use `useLayoutEffect` or `requestAnimationFrame()` instead of `setTimeout(..., 0)`. Simpler: defer the scroll logic to a callback ref on the scroll target.
- **Effort**: S • **Risk**: low

### F15: Large inline SVG or base64 images (potential, not fully confirmed in sampling)
- **Severity**: P3
- **Bucket**: Optimization
- **Files**: (Not detected in sampling; likely in Bo4/Bo5 due to complexity, requires full tree search)
- **What**: If large SVGs or inline base64 images are embedded in component JSX, they are not cacheable and bloat the bundle. Example: `<svg>...</svg>` with 50+ lines of path data should be a .svg file or sprite.
- **Impact**: Larger JS bundles; slower on slow networks; SVG not cacheable by browser.
- **Fix**: Extract large SVGs to .svg files, import as React component via next/image or <img>. Use SVG sprites for icons.
- **Effort**: M • **Risk**: low

## Out of Scope / Won't Fix

- **Questionnaire components** (EdQuestionnaire, WeightQuestionnaire, etc.) — covered by separate Quiz audit.
- **Checkout & Cart** — covered by Checkout/Cart audit.
- **Tracking & Analytics** (FBPixelLoader, AttributionTracker, Meta/TikTok CAPI) — covered by TK-422/TK-423/TK-424.
- **GLP-specific components** (GLP1HeroSection, ProductTiers, etc.) — covered by TK-422 epic.
- **Performance tracing** (Core Web Vitals, LCP optimizations beyond Image priority) — covered by TK-425.
