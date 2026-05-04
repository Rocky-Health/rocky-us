# PR: Consistent two-decimal price display (`formatPriceUI`) on ED, Hair, and WL flows

## Summary

Introduces **`formatPriceUI`** in `utils/priceFormatter.js` so customer-facing prices always show **two decimal places** (e.g. `29` → `29.00`, `29.1` → `29.10`). It accepts **numbers** and **numeric strings**, strips a leading **`$`** and **commas**, rounds with existing **`toMoney`** semantics, and leaves **`formatPrice`** unchanged for checkout/cart and other contexts.

## Changes

### Utility

- **`utils/priceFormatter.js`**: Add **`formatPriceUI`** (always `*.XX`; invalid/empty → `0.00`).

### ED

- **`components/EDPreConsultationQuiz/EdProductCards.jsx`** — Select / Selected button amounts
- **`components/EDPlans/EdProductCard.jsx`** — Primary CTA price
- **`components/EDPlans/BrandGenericModal.jsx`** — Generic vs brand comparison
- **`components/EDPlans/CrossSellModal.jsx`** — Addon line items
- **`components/ChewalisPage/EdTreatment.jsx`** — Select CTA

### Hair

- **`components/Hair/HairProductCard.jsx`** — Add to cart (sale + regular when applicable)
- **`components/HairPreConsultationQuiz/ProductRecommendationCard.jsx`** — Recommended card price
- **`components/HairPreConsultationQuiz/popups/CrossSellPopups/HairCrossSellPopup.jsx`** — Addon prices

### WL — legacy questionnaire (`WLPreConsultationQuiz`)

- **`components/MHPreConsultationQuiz/WLProductCard.jsx`** — Card price
- **`components/WLPreConsultationQuiz/steps/ProductRecommendationsStep.jsx`** — Proceed sticky CTA
- **`components/WLPreConsultationQuiz/popups/CrossSellPopups/CrossSellPopupBase.jsx`** — Addon prices

### WL — V2 pre-consultation (`WLPreConsultationQuizV2`)

- **`components/WLPreConsultationQuizV2/components/WLProductCard.jsx`** — “From $…” badge
- **`components/WLPreConsultationQuizV2/BOSimplified/components/BOSimplifiedPlanSelectionStep.jsx`** — Plan tiles, order summary, Due today, Proceed
- **`components/WLPreConsultationQuizV2/Glp2PreConsultation/components/Glp2PlanSelectionStep.jsx`** — Same pattern as BO simplified plan step
- **`components/WLPreConsultationQuizV2/Glp2PreConsultation/components/Glp2PlanOptionsSection.jsx`** — Plan option tiles
- **`components/WLPreConsultationQuizV2/components/GenericRecommendationStep.jsx`** — Proceed label when showing price
- **`components/WLPreConsultationQuizV2/WLOffer/WLOfferRecommendationStep.jsx`** — Proceed label when showing price

## How to test

Spot-check formatted amounts on:

| Area      | Routes (examples)                                                                 |
| --------- | --------------------------------------------------------------------------------- |
| ED        | `/ed`, `/sex`, `/ed-flow`, `/chewalis`, `/ed-pre-consultation-quiz`               |
| Hair      | `/hair`, `/hairloss`, `/hair-flow`, `/hair-products`, `/hair-pre-consultation-quiz` (+ cross-sell after add to cart) |
| WL legacy | `/wl-pre-cf1`                                                                     |
| WL V2     | `/wl-pre-consultation`, `/wl-offer-pre-consultation`, `/glp2-pre-consultation`, `/glp2-pre-consultation-2` |

Confirm integers show **`.00`**, one-decimal values show **`.X0`**, and strings like **`$359`** render as **`$359.00`** where applied.

## Out of scope

- **`formatPrice`** behavior unchanged (cart, checkout, many other surfaces still use existing formatting).
- **`WeightQuestionnaire`** routes (`/wl-consultation`, `/old-wl-consultation`) unchanged—they do not use **`formatPriceUI`**.

## Suggested PR title

**feat(ui): consistent two-decimal price display (`formatPriceUI`) on ED, Hair, and WL flows**
