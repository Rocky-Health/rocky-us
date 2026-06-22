"use client";

import { useState } from "react";
import { ExpressCheckoutElement } from "@stripe/react-stripe-js";

// Apple Pay / Google Pay buttons. Lives above the Payment Element so returning
// Link consumers (who see saved cards and no wallet tab in the Payment Element)
// still get a wallet option. Link stays in the Payment Element below, so here we
// only surface the wallets.
const EXPRESS_CHECKOUT_OPTIONS = {
  buttonHeight: 44,
  // The checkout form already collects the address, so don't make the wallet
  // sheet ask for it again — keep the wallet a quick payment authorization.
  billingAddressRequired: false,
  emailRequired: false,
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
}) {
  // Hidden until onReady tells us a wallet is actually available on this device.
  const [visible, setVisible] = useState(false);

  const handleReady = (event) => {
    const apm = event?.availablePaymentMethods;
    setVisible(!!apm && (apm.applePay || apm.googlePay));
  };

  const handleClick = (event) => {
    // Validate synchronously, then open (resolve) or cancel (reject) the sheet —
    // both have to happen within ~1s of the tap, so no awaits in here.
    const ok = onWalletClick ? onWalletClick() : true;
    if (ok) {
      event.resolve();
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
