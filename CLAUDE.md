# Rocky Health US - Headless E-Commerce Frontend

## What This Is

Telemedicine e-commerce platform for men's health (ED, hair loss, weight loss). Next.js frontend consuming WordPress + WooCommerce REST APIs. Patients complete medical questionnaires, get assessed, and receive treatments shipped to their door.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: JavaScript (ES6+) — no TypeScript
- **Styling**: Tailwind CSS 3.4 + custom fonts (Poppins, Fellix)
- **Payments**: Stripe (primary), Bambora (legacy/fallback)
- **Backend**: WordPress + WooCommerce REST API (headless)
- **Auth**: Cookie-based Basic Auth derived from WordPress JWT
- **Deployment**: Vercel serverless
- **Analytics**: GA4, Meta CAPI, TikTok CAPI, Northbeam, Awin, Clarity, Heatmap.com

## Project Structure

```
app/                    # Next.js App Router pages & API routes
  api/                  # ~70+ serverless API routes (proxy to WP/WC)
  (marketing)/          # Public marketing pages
  (flows)/              # Questionnaire flows
  checkout/             # Checkout page (protected)
  cart/                 # Cart page (protected)
  product/[slug]/       # Dynamic product pages
  my-account/           # User account (redirects to CRM portal)
components/             # ~80+ React components
lib/                    # Backend logic, hooks, models, services
  woocommerce.js        # WooCommerce REST client with 30-min caching
  cart/                 # Cart service & hooks
  hooks/                # Custom React hooks
  models/               # Product/category factories
  stripe/               # Stripe client
  constants/            # Static data (states, product types, FAQs)
  meta/                 # Meta CAPI parameter builder
utils/                  # ~40+ utility modules (analytics, validation, etc.)
config/                 # JSON product configs (edProducts, hairProducts, etc.)
middleware.js           # Route protection, redirects, blocked routes
```

## Key Patterns

### API Routes
- All in `app/api/*/route.js` — server-side only, never expose secrets
- Use Axios for server-to-server calls to WordPress/WooCommerce
- Auth via `ADMIN_TOKEN` (Basic auth) for elevated endpoints
- WooCommerce nonce (`cart-nonce` cookie) for cart/checkout CSRF

### Authentication
- Login: POST to WP JWT endpoint → extract user ID → store Basic Auth in `authToken` cookie
- Cookies: `authToken`, `userId`, `userEmail`, `displayName`, `stripeCustomerId`, `cart-nonce`
- Protected routes enforced in `middleware.js`

### Cart
- Dual storage: localStorage for guests, WC Store API for authenticated users
- Cart migrated to server on login
- Nonce auto-refreshed via `nonceManager.js`

### Products
- WooCommerce products with complex variations (strength, brand, quantity, frequency)
- Product configs in `config/*.json`
- `ProductFactory` and `CategoryHandlerFactory` in `lib/models/`
- 30-min in-memory cache for products and variations

### Checkout
- Stripe PaymentIntent with manual capture
- Bambora tokenization via Beanstream as fallback
- Post-purchase: fires Meta CAPI, TikTok CAPI, Northbeam, Awin attribution (async)

### Tracking
- Multi-gateway Meta pixels (different pixel per product category: ED, WL, Hair)
- Cryptic event names (e.g., `RKY_TNT`) to bypass health ad restrictions
- Server-side PII hashing (SHA256) before sending to Meta/TikTok
- Source attribution: UTM params + click IDs stored in localStorage/cookies

## Route Protection

**Protected** (require `authToken` cookie): `/checkout`, `/cart`, `/profile`, `/my-account`, questionnaire routes

**Blocked** (US version): mental health, smoking, skincare, merch, compounded tirzepatide/semaglutide

## Commands

```bash
npm run dev        # next dev --turbopack
npm run build      # next build
npm start          # next start
npm run lint       # next lint
```

## Path Alias

`@/*` maps to project root (`./`) — configured in `jsconfig.json`

## Important Notes

- No TypeScript — all `.js` / `.jsx` files
- No test framework configured
- `.env` contains live Stripe keys and AWS credentials — never commit
- WooCommerce base URL: `https://myrocky.com`
- CRM portal: `https://crm.myrocky.com`
- Patient portal: `https://account.myrocky.com`
