import { useEffect } from "react";
import Image from "next/image";
import { useElements } from "@stripe/react-stripe-js";
import StripeCardInput from "./StripeCardInput";
import StripeSavedCards from "./StripeSavedCards";

const Payment = ({
  setFormData,
  onStripeReady, // Callback for Stripe Elements
  formData, // Get form data to pass customer info
  /** When true, omit lg max-width so the card spans the column (e.g. GLP2 checkout). */
  fullWidth = false,
  // Saved-card picker state (owned by CheckoutPageContent)
  selectedCard = null,
  setSelectedCard,
}) => {
  const elements = useElements(); // Get Stripe Elements instance

  // Call onStripeReady when elements is ready
  useEffect(() => {
    if (elements && onStripeReady) {
      onStripeReady(elements);
    }
  }, [elements, onStripeReady]);

  // A saved card hides the new-card form. We keep the Payment Element mounted
  // (just CSS-hidden) so Stripe stays initialized for "Add a new card".
  const showNewCardForm = !selectedCard;

  return (
    <>
      <div className="my-6">
        <h1 className="text-lg font-semibold text-[#251F20]">Payment</h1>
        <p className="text-gray-700 text-sm">
          All transactions are secure and encrypted.
        </p>
      </div>

      {/* TK-586: id anchors the payment section-view smart event; data-hm-ignore
          blocks heatmaps/recordings from capturing card details. */}
      <div
        id="checkout-section-payment"
        data-hm-ignore
        className={`bg-white w-full p-4 md:p-6 rounded-[16px] shadow-[0px_1px_1px_0px_#E2E2E1] border border-[#E2E2E1] ${
          fullWidth ? "" : "lg:max-w-[512px]"
        }`}
      >
        {/* Card Information header with the accepted-card logos */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm text-[#251F20]">
            Card Information
          </span>
          <div className="h-8 w-[50%] relative">
            <Image
              fill
              sizes="256px"
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/payment-methods.png"
              alt="Accepted payment methods"
              className="object-contain"
            />
          </div>
        </div>

        {/* Saved cards picker — renders nothing if the user has none */}
        <StripeSavedCards
          selectedCardId={selectedCard?.id}
          onSelectCard={(card) => setSelectedCard?.(card)}
          onAddNewCard={() => setSelectedCard?.(null)}
          disabled={!elements}
        />

        {/* New card form stays mounted (CSS-hidden) so Stripe stays initialized */}
        <div className={`mt-4 ${showNewCardForm ? "" : "hidden"}`}>
          <StripeCardInput
            customerData={{
              name: `${formData.billing_address.first_name || ""} ${
                formData.billing_address.last_name || ""
              }`.trim(),
              email: formData.billing_address.email || "",
              phone: formData.billing_address.phone || "",
            }}
          />
        </div>

        <p className="mt-4 text-xs text-gray-600 flex items-center gap-1">
          <svg
            className="w-4 h-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Secure payment powered by Stripe
        </p>
      </div>
    </>
  );
};

export default Payment;
