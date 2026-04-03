"use client";

import { formatPrice } from "@/utils/priceFormatter";
import { getCompoundedPlanInfo } from "./CartItems";
import CustomImage from "@/components/utils/CustomImage";

/** trimrx-style mobile palette */
const NAVY = "#003b5c";
const ACCENT_GREEN = "#2ed296";
const LABEL_MUTED = "#5c6f7a";

/** Local hero art (same as GLP1 offer); avoids remote Woo URLs without dimensions */
const GLP2_CHECKOUT_HERO = {
  semaglutide: "/products/glp1-vial.png",
  tirzepatide: "/products/glp1-gip-vial.png",
};

function glp2CheckoutHeroSrc(primary) {
  const name = stripHtml(primary?.name || "").toLowerCase();
  if (name.includes("tirzepatide")) return GLP2_CHECKOUT_HERO.tirzepatide;
  return GLP2_CHECKOUT_HERO.semaglutide;
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function pickPrimaryMedicationItem(items) {
  if (!items?.length) return null;
  const skip = (name) =>
    String(name || "")
      .toLowerCase()
      .includes("body optimization program");
  return items.find((i) => i?.name && !skip(i.name)) || items[0];
}

function subscriptionVariationLabel(item) {
  const v = item?.variation;
  if (!Array.isArray(v)) return null;
  const sub = v.find(
    (x) =>
      String(x?.attribute || "")
        .toLowerCase()
        .includes("subscription") ||
      String(x?.attribute || "")
        .toLowerCase()
        .includes("frequency"),
  );
  return sub?.value || null;
}

function PriceTagIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428l2.848-1.899a1.5 1.5 0 00.122-2.322L8.226 5.322a1.5 1.5 0 00-1.06-.439H5.25zM6.375 6a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * GLP2 checkout: trimrx-style treatment summary (mobile-first), data from cart API.
 */
const Glp2TreatmentCheckoutSummary = ({ cartItems }) => {
  const items = cartItems?.items || [];
  const primary = pickPrimaryMedicationItem(items);
  const currencySymbol =
    primary?.prices?.currency_symbol ||
    cartItems?.totals?.currency_symbol ||
    "$";

  const compounded = primary ? getCompoundedPlanInfo(primary) : null;
  const lineSubtotalCents = primary?.totals?.line_subtotal
    ? Number(primary.totals.line_subtotal)
    : 0;
  const lineSubtotalDollars = lineSubtotalCents / 100;

  const medicationName = primary ? stripHtml(primary.name) : "Your treatment";

  const deliveryPlan =
    compounded?.plan || subscriptionVariationLabel(primary) || "Subscription";

  const totalDiscountCents = Number(cartItems?.totals?.total_discount || 0);
  const savingsDisplay =
    totalDiscountCents > 0
      ? `${currencySymbol}${formatPrice(totalDiscountCents / 100)}`
      : null;

  const coupons = cartItems?.coupons || [];
  const totalPriceCents = Number(cartItems?.totals?.total_price || 0);
  const totalPriceDisplay = `${currencySymbol}${formatPrice(totalPriceCents / 100)}`;

  const totalItemsCents = Number(cartItems?.totals?.total_items || 0);
  const showOrderTotalStrike =
    totalItemsCents > totalPriceCents && totalPriceCents >= 0;

  let monthlyStrike = null;
  let monthlyCurrent = null;
  if (compounded && compounded.months > 0) {
    const orig = compounded.originalPrice?.replace(/[^0-9.]/g, "") || "";
    const origNum = parseFloat(orig);
    if (!Number.isNaN(origNum)) {
      monthlyStrike = `${currencySymbol}${formatPrice(origNum)}/mo`;
    }
    monthlyCurrent = `${currencySymbol}${formatPrice(
      lineSubtotalDollars / compounded.months,
    )}/mo`;
  } else if (primary) {
    monthlyCurrent = `${currencySymbol}${formatPrice(lineSubtotalDollars)}/mo`;
  }

  const thumb =
    primary?.images?.[0]?.thumbnail || primary?.images?.[0]?.src || "";

  const shippingFree = (() => {
    const rates = cartItems?.shipping_rates;
    if (!rates?.length) return true;
    for (const pkg of rates) {
      const selected = pkg.shipping_rates?.find((r) => r.selected);
      if (selected && Number(selected.price) > 0) return false;
    }
    return true;
  })();

  return (
    <section
      className="w-full mb-5 md:mb-6"
      aria-labelledby="glp2-treatment-summary-heading "
    >
      <h2
        id="glp2-treatment-summary-heading"
        className="hidden md:block text-xl md:text-[22px] mx-auto text-center font-bold tracking-tight mb-4 px-0.5"
        style={{ color: NAVY }}
      >
        Your Treatment Details
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        {thumb ? (
          <>
            <div className="relative w-full rounded-2xl overflow-hidden flex items-start justify-center aspect-video md:w-1/4 md:aspect-square">
              {/* Native img: trim-style crop (h-[135%]) is simpler than Next/Image here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <CustomImage
                src={thumb}
                alt={medicationName}
                className="h-[135%] w-auto max-w-none mt-1 pointer-events-none select-none"
                fill
              />
              {/* <img
            src={thumb}
            alt={medicationName}
            className="h-[135%] w-auto max-w-none mt-1 pointer-events-none select-none"
            loading="lazy"
            decoding="async"
          /> */}
            </div>
            <h2
              id="glp2-treatment-summary-heading"
              className="md:hidden text-xl md:text-[22px] mx-auto text-center font-bold tracking-tight px-0.5"
              style={{ color: NAVY }}
            >
              Your Treatment Details
            </h2>
          </>
        ) : null}

        <div className="rounded-2xl px-4 py-5 md:px-5 md:py-6 shadow-sm border border-black/5 flex-1 w-full bg-[#eceaea]">
          <div className="space-y-3 text-sm md:text-[15px]">
            <SummaryRow label="Medication" value={medicationName} />
            <SummaryRow label="Delivery plan" value={deliveryPlan} />
            {savingsDisplay ? (
              <SummaryRow
                label="Total savings"
                value={savingsDisplay}
                valueClassName="font-bold"
                valueStyle={{ color: ACCENT_GREEN }}
              />
            ) : null}
            <SummaryRow
              label="Shipping"
              value={shippingFree ? "FREE" : "Calculated at checkout"}
              valueClassName={shippingFree ? "font-bold" : ""}
              valueStyle={shippingFree ? { color: ACCENT_GREEN } : undefined}
            />
            {(monthlyStrike || monthlyCurrent) && (
              <div className="flex justify-between gap-3 pt-2 border-t border-[#003b5c]/10">
                <span className="shrink-0" style={{ color: LABEL_MUTED }}>
                  Monthly price
                </span>
                <span className="text-right font-semibold">
                  {monthlyStrike ? (
                    <span
                      className="line-through text-[13px] md:text-sm mr-2"
                      style={{ color: LABEL_MUTED }}
                    >
                      {monthlyStrike}
                    </span>
                  ) : null}
                  {compounded && monthlyCurrent ? (
                    <span style={{ color: ACCENT_GREEN }}>
                      {monthlyCurrent}
                    </span>
                  ) : (
                    <span style={{ color: NAVY }}>{monthlyCurrent}</span>
                  )}
                </span>
              </div>
            )}
            {/* <div className="flex justify-between gap-3 items-baseline">
              <span
                className="shrink-0 font-medium"
                style={{ color: LABEL_MUTED }}
              >
                Total if prescribed
              </span>
              <span className="text-right font-bold" style={{ color: NAVY }}>
                {showOrderTotalStrike ? (
                  <span
                    className="line-through text-[13px] md:text-sm font-medium mr-2 opacity-80"
                    style={{ color: LABEL_MUTED }}
                  >
                    {currencySymbol}
                    {formatPrice(totalItemsCents / 100)}
                  </span>
                ) : null}
                {totalPriceDisplay}
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {savingsDisplay && coupons.length > 0 ? (
        <p
          className="mt-4 text-sm text-center px-1 leading-relaxed"
          style={{ color: NAVY }}
        >
          You are saving{" "}
          <strong style={{ color: ACCENT_GREEN }}>{savingsDisplay}</strong> vs
          monthly with your exclusive plan.
        </p>
      ) : savingsDisplay ? (
        <p className="mt-4 text-sm text-center px-1" style={{ color: NAVY }}>
          You are saving{" "}
          <strong style={{ color: ACCENT_GREEN }}>{savingsDisplay}</strong> on
          your order.
        </p>
      ) : null}

      {coupons.length > 0 ? (
        <div
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: NAVY }}
        >
          <PriceTagIcon className="h-5 w-5 shrink-0 opacity-95" />
          <span>
            CODE APPLIED:{" "}
            {coupons.map((c) => String(c.code || "").toUpperCase()).join(", ")}
          </span>
        </div>
      ) : null}

      <ul
        className="mt-5 space-y-2.5 text-[13px] md:text-sm px-0.5"
        style={{ color: NAVY }}
      >
        <li className="flex gap-2.5 items-start">
          <CheckIcon className="mt-0.5 shrink-0" />
          <span>Same Price. All Dosage Levels.</span>
        </li>
        <li className="flex gap-2.5 items-start">
          <CheckIcon className="mt-0.5 shrink-0" />
          <span>Prescribed &amp; shipped within 48 hours</span>
        </li>
        <li className="flex gap-2.5 items-start">
          <CheckIcon className="mt-0.5 shrink-0" />
          <span>UNLIMITED doctor calls 7 days a week</span>
        </li>
      </ul>

      <div className="mt-5 rounded-2xl bg-[#2ed296] text-white text-center py-4 px-4 shadow-sm">
        <div className="font-bold text-base md:text-lg">$0 Due Today!</div>
        <div className="text-xs md:text-sm font-normal mt-1 leading-snug opacity-[0.98]">
          Only charged if your prescription is approved.
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003b5c]/15 bg-white py-3 px-4 text-sm font-semibold shadow-sm">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: ACCENT_GREEN }}
        >
          ✓
        </span>
        <span style={{ color: NAVY }}>HSA/FSA Eligible</span>
      </div>
    </section>
  );
};

function CheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 ${className || ""}`}
      aria-hidden
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryRow({ label, value, valueClassName = "", valueStyle }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0" style={{ color: LABEL_MUTED }}>
        {label}
      </span>
      <span
        className={`text-right font-bold ${valueClassName}`}
        style={{ color: NAVY, ...valueStyle }}
      >
        {value}
      </span>
    </div>
  );
}

export default Glp2TreatmentCheckoutSummary;
