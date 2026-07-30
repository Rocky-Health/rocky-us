"use client";

import { useMemo, useState } from "react";
import { ExpressCheckoutElement } from "@stripe/react-stripe-js";

// Map WooCommerce Store API shipping rates (cartItems.shipping_rates: an array
// of packages, each exposing its own rate choices with prices already in minor
// units) into the shape Stripe's ExpressCheckoutElement expects:
// { id, displayName, amount } with amount in cents. The WC-selected rate is
// listed first so the wallet defaults to the same rate the checkout summary shows.
const mapWooShippingRates = (packages) => {
  if (!Array.isArray(packages)) return [];
  const rates = [];
  const seen = new Set();
  for (const pkg of packages) {
    for (const rate of pkg?.shipping_rates || []) {
      if (!rate?.rate_id || seen.has(rate.rate_id)) continue;
      seen.add(rate.rate_id);
      rates.push({
        id: rate.rate_id,
        displayName: rate.name || "Shipping",
        amount: Math.round(Number(rate.price) || 0),
        selected: !!rate.selected,
      });
    }
  }
  rates.sort((a, b) => Number(b.selected) - Number(a.selected));
  return rates.map(({ selected, ...rate }) => rate);
};

// Apple Pay / Google Pay buttons. Lives at the top of the checkout page so the
// wallet sheet collects name/email/billing/shipping and the user can skip the
// manual form entirely (TK-839). Link stays in the Payment Element below, so
// here we only surface the wallets.
const EXPRESS_CHECKOUT_OPTIONS = {
  buttonHeight: 44,
  // Collect the full order details from the wallet sheet so the order can be
  // built from the wallet instead of the manual form.
  billingAddressRequired: true,
  emailRequired: true,
  shippingAddressRequired: true,
  allowedShippingCountries: ["US"],
  paymentMethods: {
    applePay: "auto", // "auto" only shows the button when it actually works on
    googlePay: "auto", // the device. Switch to "always" to force it (Apple Pay
    link: "never", // on desktop Chromium needs "always" + macOS).
    paypal: "never",
    amazonPay: "never",
  },
  layout: { maxColumns: 2, maxRows: 1, overflow: "auto" },
};

/**
 * @param {() => boolean} onWalletClick - synchronous guard run on the tap; return
 *   true to open the wallet sheet. Must stay sync so Apple Pay opens off the gesture.
 * @param {(event) => Promise<void>} onWalletConfirm - runs after the user authorizes.
 */
export default function ExpressCheckoutWallet({
  onWalletClick,
  onWalletConfirm,
  wcShippingRates,
}) {
  // Hidden until onReady tells us a wallet is actually available on this device.
  const [visible, setVisible] = useState(false);

  // TK-839: real WooCommerce shipping rates for the current cart + address (the
  // same rates the checkout summary renders), mapped to the Stripe shape. For
  // ExpressCheckoutElement these are supplied when the sheet opens (onClick
  // resolve) and re-offered on address change, not as a static element option.
  const shippingRates = useMemo(
    () => mapWooShippingRates(wcShippingRates),
    [wcShippingRates],
  );

  const handleReady = (event) => {
    const apm = event?.availablePaymentMethods;
    setVisible(!!apm && (apm.applePay || apm.googlePay));
  };

  // The wallet lets the user change their shipping address; re-offer the same
  // WC-computed rates so Stripe keeps the sheet open.
  const handleShippingAddressChange = (event) => {
    event.resolve({ shippingRates });
  };

  const handleClick = (event) => {
    // Validate synchronously, then open (resolve) or cancel (reject) the sheet —
    // both have to happen within ~1s of the tap, so no awaits in here.
    const ok = onWalletClick ? onWalletClick() : true;
    if (ok) {
      // TK-839: hand Stripe the initial shipping rates as the sheet opens; it
      // requires them up front when shippingAddressRequired is on.
      event.resolve({ shippingRates });
    } else if (typeof event.reject === "function") {
      event.reject();
    }
  };

  // The element is always mounted (never display:none) so Stripe can render it
  // and fire onReady — when no wallet is available it just renders empty/no
  // height. Only the label and divider are gated on `visible`.
  return (
    <div className="express-checkout-wallet">
      {visible && (
        <p className="text-sm font-medium text-[#251F20] mt-8 mb-3">
          Express checkout
        </p>
      )}
      <ExpressCheckoutElement
        options={EXPRESS_CHECKOUT_OPTIONS}
        onReady={handleReady}
        onClick={handleClick}
        onShippingAddressChange={handleShippingAddressChange}
        onConfirm={(event) => onWalletConfirm && onWalletConfirm(event)}
        onLoadError={() => setVisible(false)}
      />
      {visible && (
        <div className="flex items-center gap-3 mt-6">
          <span className="h-px bg-[#E2E2E1] flex-1" />
          <span className="text-xs text-gray-500">Or pay with a card</span>
          <span className="h-px bg-[#E2E2E1] flex-1" />
        </div>
      )}
    </div>
  );
}
