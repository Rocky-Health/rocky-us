"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import StripeCardInput from "./StripeCardInput";
import StripeSavedCards from "./StripeSavedCards";

const Payment = ({
  setFormData,
  formData,
  onStripePaymentReady,
  onStripePaymentChange,
  onStripePaymentError,
  registerStripePaymentHandler,
  isStripePaymentActive = false,
  // Saved cards props
  onSavedCardSelect,
  selectedSavedCard,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  // State to track if user wants to add a new card vs use saved card
  const [useNewCard, setUseNewCard] = useState(false);

  // Prepare billing details from formData for Stripe
  const stripeBillingDetails = useMemo(() => {
    const billing = formData?.billing_address || {};
    const clean = (value) =>
      typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : undefined;
    const fullName = [clean(billing.first_name), clean(billing.last_name)]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      name: fullName || undefined,
      email: clean(billing.email),
      phone: clean(billing.phone),
      address: {
        line1: clean(billing.address_1),
        line2: clean(billing.address_2),
        city: clean(billing.city),
        state: clean(billing.state),
        postal_code: clean(billing.postcode),
        country: (billing.country || "US").toUpperCase(),
      },
    };
  }, [formData]);

  const stripePaymentElementOptions = useMemo(() => {
    return {
      layout: {
        type: "tabs",
        defaultCollapsed: false,
      },
      fields: {
        billingDetails: {
          name: "auto",
          email: "auto",
          phone: "auto",
          address: {
            country: "never", // We collect this separately
            postalCode: "never", // We collect this separately
          },
        },
      },
      wallets: {
        applePay: "auto",
        googlePay: "auto",
        link: "never", // Disable Stripe Link
      },
      defaultValues: {
        billingDetails: stripeBillingDetails,
      },
    };
  }, [stripeBillingDetails]);

  const [isStripeElementReady, setIsStripeElementReady] = useState(false);
  const [isStripeElementComplete, setIsStripeElementComplete] = useState(false);

  useEffect(() => {
    setFormData((prev) => {
      // All payments now use Stripe
      return {
        ...prev,
        payment_method: "stripe",
        payment_data: [],
      };
    });
  }, [setFormData, isStripePaymentActive]);

  useEffect(() => {
    if (!isStripePaymentActive) {
      setIsStripeElementReady(false);
      setIsStripeElementComplete(false);
      onStripePaymentReady?.(false);
      onStripePaymentChange?.(false);
      onStripePaymentError?.("");
    }
  }, [
    isStripePaymentActive,
    onStripePaymentReady,
    onStripePaymentChange,
    onStripePaymentError,
  ]);

  // Handle saved card selection
  const handleSelectSavedCard = useCallback(
    (card) => {
      setUseNewCard(false);
      onSavedCardSelect?.(card);
      // When saved card is selected, mark payment as ready and complete
      onStripePaymentReady?.(true);
      onStripePaymentChange?.(true);
      onStripePaymentError?.("");
    },
    [
      onSavedCardSelect,
      onStripePaymentReady,
      onStripePaymentChange,
      onStripePaymentError,
    ]
  );

  // Handle switching to new card
  const handleAddNewCard = useCallback(() => {
    setUseNewCard(true);
    onSavedCardSelect?.(null);
    // Reset Stripe element state - will be updated when element is ready
    onStripePaymentReady?.(isStripeElementReady);
    onStripePaymentChange?.(isStripeElementComplete);
  }, [
    onSavedCardSelect,
    onStripePaymentReady,
    onStripePaymentChange,
    isStripeElementReady,
    isStripeElementComplete,
  ]);

  const createStripePaymentMethod = useCallback(
    async (billingDetails) => {
      if (!stripe || !elements) {
        return {
          error: new Error(
            "Stripe has not finished loading. Please try again."
          ),
        };
      }

      // Step 1: Submit the Elements form to validate it
      const { error: submitError } = await elements.submit();
      if (submitError) {
        return {
          error: submitError,
        };
      }

      // Step 2: Create payment method after successful validation
      return stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: billingDetails,
        },
      });
    },
    [stripe, elements]
  );

  const handleStripeNextAction = useCallback(
    async (clientSecret) => {
      if (!stripe) {
        return {
          error: new Error("Stripe is not ready to handle authentication."),
        };
      }

      // Use handleCardAction for manual confirmation_method
      // This works with PaymentIntents that have confirmation_method: "manual"
      return stripe.handleCardAction(clientSecret);
    },
    [stripe]
  );

  useEffect(() => {
    if (!registerStripePaymentHandler) {
      return;
    }

    // Determine if using saved card or new card
    const usingSavedCard = selectedSavedCard && !useNewCard;

    registerStripePaymentHandler({
      isReady: usingSavedCard ? true : isStripeElementReady,
      isComplete: usingSavedCard ? true : isStripeElementComplete,
      createPaymentMethod: createStripePaymentMethod,
      handleNextAction: handleStripeNextAction,
      // Add saved card info
      usingSavedCard,
      savedCardPaymentMethodId: usingSavedCard ? selectedSavedCard.id : null,
    });
  }, [
    registerStripePaymentHandler,
    createStripePaymentMethod,
    handleStripeNextAction,
    isStripeElementReady,
    isStripeElementComplete,
    selectedSavedCard,
    useNewCard,
  ]);

  const handleStripeReady = useCallback(() => {
    setIsStripeElementReady(true);
    // Only notify parent if we're using new card
    if (useNewCard || !selectedSavedCard) {
      onStripePaymentReady?.(true);
    }
  }, [onStripePaymentReady, useNewCard, selectedSavedCard]);

  const handleStripeChange = useCallback(
    (event) => {
      const isComplete = !!event?.complete;
      setIsStripeElementComplete(isComplete);
      // Only notify parent if we're using new card
      if (useNewCard || !selectedSavedCard) {
        onStripePaymentChange?.(isComplete, event);
      }
    },
    [onStripePaymentChange, useNewCard, selectedSavedCard]
  );

  const handleStripeError = useCallback(
    (message) => {
      onStripePaymentError?.(message || "");
    },
    [onStripePaymentError]
  );

  // Determine if we should show the new card form
  const showNewCardForm = useNewCard || !selectedSavedCard;

  return (
    <>
      <div className="my-6">
        <h1 className="text-lg font-semibold">Payment</h1>
        <p className="text-gray-700 text-sm">
          All transactions are secure and encrypted.
        </p>
      </div>

      <div className="bg-white w-full lg:max-w-[512px] p-6 rounded-[16px] shadow-sm border border-gray-300">
        <h1 className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm">Card Information</span>
          <div className="h-8 w-[50%] relative">
            <Image
              fill
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/payment-methods.png"
              alt="payment-methods"
              className="object-contain"
            />
          </div>
        </h1>

        {/* Saved Cards Section */}
        <StripeSavedCards
          onSelectCard={handleSelectSavedCard}
          onAddNewCard={handleAddNewCard}
          selectedCardId={!useNewCard ? selectedSavedCard?.id : null}
          disabled={!stripe}
        />

        {/* New Card Form */}
        <div className={`mt-4 ${!showNewCardForm ? "hidden" : ""}`}>
          {!stripe ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Stripe payment is not configured
              </p>
              <p className="text-xs text-yellow-700">
                Please check your browser console for detailed debugging
                information.
              </p>
              <details className="text-xs">
                <summary className="cursor-pointer text-yellow-800 font-medium">
                  Troubleshooting steps
                </summary>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-yellow-700">
                  <li>
                    Ensure .env has:
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
                  </li>
                  <li>No spaces around the = sign</li>
                  <li>No quotes around the key value</li>
                  <li>Restart dev server after adding the key</li>
                  <li>Check browser console for [Stripe Debug] messages</li>
                </ol>
              </details>
            </div>
          ) : (
            <>
              <StripeCardInput
                disabled={!stripe}
                onReady={handleStripeReady}
                onChange={handleStripeChange}
                onError={handleStripeError}
                paymentElementOptions={stripePaymentElementOptions}
                customerData={stripeBillingDetails}
              />
            </>
          )}
        </div>

        {/* Secure payment notice */}
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
