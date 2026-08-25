# Layout Components

Client-side components mounted from the root layout (`app/layout.jsx`).

- **ClientLayoutProvider**: Wraps page content; mounts LayoutDetector, SessionInit, and AttributionTracker.
- **LayoutDetector**: Keeps the `data-layout` attribute on `<html>` in sync on client-side navigation (minimal vs full layout).
- **SessionInit**: Installs a fetch interceptor that adds `x-session-id` / `x-request-id` headers to `/api/*` calls.
- **AttributionTracker**: Pushes UTM params and click IDs to the dataLayer for attribution.
- **MetaCookieInitializer**: Sets up `_fbp` / `_fbc` cookies for Meta attribution.
- **ZendeskWidget**: Support chat widget. Disabled on US (TK-693) until the bot's routing/focus-trap is fixed; kept in source to re-enable.

Removed integrations: BugHerd (provider and Footer script) and the global GoogleOAuthProvider (TK-482; the Google Identity script now lazy-loads from `GoogleSignInButton`).
