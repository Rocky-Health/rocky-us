---
title: Northbeam Order-Tag Overhaul — split lifecycle / origin / mode into three axes
status: Proposed (pending Aba sign-off + Tymour approval)
owner: Frontend / Growth Engineering
date: 2026-04-26
related-files:
  - utils/northbeamEvents.js
  - app/api/northbeam/orders/route.js
  - app/api/northbeam/backfill/route.js
  - app/api/northbeam/backfill-auto/route.js
  - app/api/update-order-status/route.js
  - app/api/order/route.js
related-tickets:
  - TK-422 (epic)
  - TK-435 (post-purchase Promise.allSettled — blocks deployment ordering, not scope)
  - TK-443 (TikTok phone-country alignment — sibling tracking-integrity ticket)
---

# Northbeam Order-Tag Overhaul

## Summary

The current Northbeam `order_tags` lifecycle tag conflates three independent concepts (customer lifecycle, order origin, purchase mode) into a single overloaded value with three possible outputs: `Subscription First Order`, `Subscription Recurring`, `OTC`. This makes it impossible in Northbeam to cleanly separate **acquisition vs retention**, **new orders vs auto-renewals**, or **subscription vs one-time-purchase revenue**.

The proposal: emit three **independent** tags per order — one per axis — and run them alongside the existing tags for 2–4 weeks before migrating dashboards and removing the legacy tag. Zero risk if rolled out as additive first.

This was identified during the 2026-04-26 codebase audit but has been a known issue for ~1 year (Northbeam themselves confirmed the conflation). Holding it back was a deliberate risk-management call while the rest of NB tracking stabilized; that stability has now been achieved, so the overhaul is unblocked.

---

## 1. Current implementation

### 1a. The single-tag function

`getLifecycleTag()` is defined **twice** with identical logic:

- `utils/northbeamEvents.js:96–114`
- `app/api/northbeam/orders/route.js:89–107`

```js
const getLifecycleTag = (order) => {
  const hasSubscription = order.line_items?.some(
    (item) =>
      item.product_type === "subscription" ||
      item.name?.toLowerCase().includes("subscription")
  );

  if (order.is_recurring_order || hasSubscription) {
    if (order.is_first_order) {
      return "Subscription First Order";
    }
    return "Subscription Recurring";
  }

  return "OTC";
};
```

Output is appended to `order_tags` once per order (`utils/northbeamEvents.js:259`, `app/api/northbeam/orders/route.js:296`).

### 1b. Where the input flags come from

`is_first_order` and `is_recurring_order` are already computed server-side and propagate through 6 endpoints — the data needed for the proposed split is **already present** on every order payload:

| Endpoint | Provenance |
|---|---|
| `app/api/order/route.js:97` | Live order create — sets `is_recurring_order` |
| `app/api/update-order-status/route.js:71,120` | Status updates — both flags |
| `app/api/northbeam/orders/route.js:98–100,327` | Live NB push — consumes both |
| `app/api/northbeam/backfill/route.js:150,198` | Historic backfill — both flags |
| `app/api/northbeam/backfill-auto/route.js:130,177` | Cron backfill — both flags |

No upstream data work is needed; this is a pure tag-emit refactor.

---

## 2. Why the current shape is broken

### 2a. `Subscription Recurring` is overloaded

The branch fires for **two semantically distinct events**:

1. A **returning customer placing a brand-new subscription** (`is_recurring_order=false`, `is_first_order=false`, cart contains a subscription line item) — this is **acquisition revenue**, just from a known customer.
2. An **actual auto-renewal** of an existing subscription (`is_recurring_order=true`) — this is **retention revenue**.

Northbeam cannot distinguish these because the tag is the same. Acquisition cohort math is wrong by exactly the count of returning-customer-new-subscription orders.

### 2b. `OTC` is misleading

Despite the name, the tag means "no subscription line item" — which mixes **product category** (over-the-counter pharmaceutical) with **purchase mode** (one-time payment). Concretely:

- Some OTC products **are** sold on subscription (recurring fulfillment of an OTC SKU) → would mis-tag as `OTC` despite being a subscription.
- Some OTP (one-time-purchase) products are **not** OTC (e.g. one-time RX refills) → also mis-tagged.

The product-category lookup already lives in `getProductTypeTags()` and emits `item-category-N:*` tags — that's where category info belongs. `OTC` should never have been a lifecycle tag.

### 2c. Missing segmentation

There is no clean Northbeam filter today for:

- **First-time customers regardless of product** (acquisition cohort, all SKUs)
- **Renewals regardless of product type** (retention revenue, all subscription types)
- **Subscription signups** (returning customer, new subscription, distinct from renewals)

These are the three primary growth-marketing dimensions and they are all blocked by the conflated tag.

---

## 3. Proposed solution — three independent axes

Each order receives **one tag per axis**, all three appended to `order_tags`. Tags are independent and orthogonal.

| Axis | Possible values | Determined by |
|---|---|---|
| **Customer lifecycle** | `First Order` / `Returning` | `is_first_order === true` |
| **Order origin** | `New Order` / `Renewal` | `is_recurring_order === true` |
| **Purchase mode** | `Subscription` / `OTP` | At least one subscription line item present |

### 3a. Mixed-cart rule

If an order contains **both** subscription and OTP line items, classify it as `Subscription` for the purchase-mode axis. Rationale: subscription is the higher-LTV signal, and Northbeam's revenue attribution should weight toward the recurring component. This is the one judgment-call rule in the proposal and is flagged for explicit Aba sign-off.

### 3b. Worked examples

| Scenario | lifecycle | origin | mode |
|---|---|---|---|
| Brand-new customer, single subscription product | `First Order` | `New Order` | `Subscription` |
| Returning customer, OTP order | `Returning` | `New Order` | `OTP` |
| Auto-renewal of existing subscription | `Returning` | `Renewal` | `Subscription` |
| Brand-new customer, single OTP order | `First Order` | `New Order` | `OTP` |
| Returning customer adding a 2nd new subscription | `Returning` | `New Order` | `Subscription` |
| Mixed cart (subscription + OTP), returning, new order | `Returning` | `New Order` | `Subscription` (mixed-cart rule) |

### 3c. Filter recipes in Northbeam

Once the new tags are live, common dashboard filters become trivial:

- **Acquisition only** → exclude `Renewal`
- **Retention only** → include `Renewal`
- **New customer cohort** → include `First Order`
- **All subscription revenue** → include `Subscription`
- **Subscription signups only** → include `Subscription` AND `New Order`
- **OTP revenue** → include `OTP`

Product-level filtering continues to work via the existing `item-category-*` tags emitted by `getProductTypeTags()`.

---

## 4. Rollout plan (zero-risk, additive-first)

### Phase 1 — emit new tags alongside existing (2–4 weeks)

Append all three new axis tags to `order_tags` while continuing to emit the legacy `Subscription First Order` / `Subscription Recurring` / `OTC` tag. Nothing breaks; all current dashboards and pixels continue to function. Verification window confirms the new tags populate as expected on real orders.

### Phase 2 — migrate dashboards and filters

Switch Northbeam dashboards, audiences, and saved filters to consume the new three-axis tags. No code change required for this phase.

### Phase 3 — remove the legacy tag

Once nothing in Northbeam depends on the legacy lifecycle tag, delete it from both code paths. Single small PR.

---

## 5. Code changes

Both files **must be updated together** to keep client-emitted and server-emitted payloads consistent (the API route currently re-derives the tag server-side and de-dupes against client tags — see `app/api/northbeam/orders/route.js:289–307`):

### 5a. `utils/northbeamEvents.js`

- Replace `getLifecycleTag(order)` with `getOrderAxisTags(order)` returning `[lifecycle, origin, mode]`.
- During Phase 1: also emit the legacy single tag (additive).
- Spread the array into `order_tags` at lines 257–262 and 400–405 (both call sites).

### 5b. `app/api/northbeam/orders/route.js`

- Mirror the same `getOrderAxisTags()` implementation (or, better, **DRY this up** — see §7 below).
- Update `buildOrderTags()` at lines 295–307 to emit the three new tags as part of the `primary` array and de-dupe against any client tags as today.

### 5c. Backfill endpoints

`app/api/northbeam/backfill/route.js` and `app/api/northbeam/backfill-auto/route.js` build their own NB payloads and currently rely on the same `is_first_order` / `is_recurring_order` flags. They **do not currently emit** the lifecycle tag — they only set `is_recurring_order` on the payload. Decision needed: backfill historic orders with the new tags or accept that historic NB data uses the legacy tag only. Recommended: backfill on a forward-looking basis only (Phase 1 forward), to avoid rewriting NB history.

---

## 6. Open questions for the Aba meeting

1. **Tag naming sign-off.** Are the proposed values (`First Order`, `Returning`, `New Order`, `Renewal`, `Subscription`, `OTP`) acceptable, or does Aba want different wording? Mixed-case strings are consistent with the existing tag style.
2. **Mixed-cart rule.** Confirm that a sub+OTP cart should classify as `Subscription` for the mode axis. Alternative is a dedicated `Mixed` value, but this loses simplicity in Northbeam filters.
3. **Backfill scope.** Forward-only (recommended) vs full historic backfill of the new axis tags.
4. **Phase 1 duration.** 2 weeks vs 4 weeks of dual-tagging before Phase 2 migration. Depends on how many NB dashboards need updating and on Aba's reporting cadence.
5. **Timing.** Two viable windows:
   - Weekend ship: code + review in <1 hour, live by Sunday, results visible next week.
   - Monday-after-meeting ship: discuss, decide, ship same week with full alignment.

---

## 7. Sibling concerns surfaced during this audit

These are not blockers but are worth filing as smaller follow-ups:

- **Duplicate `getLifecycleTag` implementations** (`utils/northbeamEvents.js:96–114` ≈ `app/api/northbeam/orders/route.js:89–107`). Same drift risk as the duplicated `convertToISO3166Alpha3` country map (also duplicated across the two files). Extract to a shared `utils/northbeamTags.js` module while we're already touching this code.
- **`convertToISO3166Alpha3` country map duplicated** in the same two files. Default values diverge (`"CAN"` in `utils`, `"USA"` in API route) — a hidden US-vs-CA defaulting bug that the audit's Tracking F2 finding (now TK-443) also flags from a different angle.
- **`trackNorthbeamCustomEvent` is a stub** (`utils/northbeamEvents.js:437–463`) — already captured under Tracking F5; not in scope here.

---

## 8. Cross-references

- **TK-435** (Post-purchase attribution: `Promise.allSettled` with timeout) — ships independently; this overhaul does not change the await pattern, only what tags get sent.
- **TK-443** (TikTok phone-country alignment + `hashServerSide` US default) — sibling tracking-integrity ticket; touches `northbeamEvents.js` country-default behavior tangentially. Coordinate landing order to avoid conflicts.
- **`docs/codebase-audit/tracking-analytics-audit.md`** — Tracking F1/F2/F3/F5/F10 are the five Northbeam-related findings already captured; this overhaul is **not** one of those (it was held back deliberately) and should be tracked as its own ticket under the epic.
