"use client";

import Loader from "@/components/Loader";
import { logger } from "@/utils/devLogger";
import CheckoutSkeleton from "@/components/ui/skeletons/CheckoutSkeleton";
import { useEffect, useRef, useState } from "react";
import BillingAndShipping from "./BillingAndShipping";
import CartAndPayment from "./CartAndPayment";
import Glp2TreatmentCheckoutSummary from "./Glp2TreatmentCheckoutSummary";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import {
  processUrlCartParameters,
  cleanupCartUrlParameters,
} from "@/utils/urlCartHandler";
import {
  transformPaymentError,
  isWordPressCriticalError,
  handlePaymentResponse,
  isSuccessfulOrderStatus,
} from "@/utils/paymentErrorHandler";
import {
  isPaymentMethodValid,
  getPaymentValidationMessage,
} from "@/utils/cardValidation";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { getRequiredConsultations } from "@/utils/requiredConsultation";
import {
  checkQuebecZonnicRestriction,
  getQuebecRestrictionMessage,
} from "@/utils/zonnicQuebecValidation";
import useCheckoutValidation from "@/lib/hooks/useCheckoutValidation";
import { checkAgeRestriction } from "@/utils/ageValidation";
import {
  trackFunnelEvent,
  trackFunnelEventOnce,
} from "@/utils/clarityFunnelEvents";
import QuebecRestrictionPopup from "../Popups/QuebecRestrictionPopup";
import AgeRestrictionPopup from "../Popups/AgeRestrictionPopup";
import ProductNotAvailablePopup from "../Popups/ProductNotAvailablePopup";
import PaymentProcessingModal from "../Popups/PaymentProcessingPopup";
import {
  isRestrictedCartItem,
  isEdStateRestricted,
  isWlStateRestricted,
  isRestrictedEdCartItem,
  isRestrictedWlCartItem,
} from "@/utils/edShippingRestrictions";
import { getAwinFromUrlOrStorage } from "@/utils/awin";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { hashEmail, hashPhone } from "@/utils/analytics/hash";
import { getOrCreateSessionId } from "@/utils/dataLayerHelper";
import { getAttributionData, deriveSourceName } from "@/utils/sourceAttribution";
import {
  trackMetaStartCheckout,
  logMetaTrackingError,
} from "@/utils/metaQuestionnaireTracking";
import StripeElementsPayment from "./StripeElementsPayment";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripeClient";
import { useAddressManager } from "@/lib/hooks/useAddressManager";
import { debugAddressData } from "@/utils/addressDebugger";
import {
  useAutoApplyCoupon,
  getPendingCouponCode,
  clearPendingCouponCode,
} from "@/lib/hooks/useAutoApplyCoupon";

// Shared singleton so Stripe.js (and shared-ffa.js) loads once app-wide.
const stripePromise = getStripe();

// Wrapper component to provide Stripe context
const CheckoutPageWrapper = () => {
  // Amount (in cents) advertised to Stripe Elements. This drives the total
  // shown in the Apple Pay / Google Pay wallet sheets, so it must reflect the
  // real cart total. It starts as a placeholder and is updated by
  // CheckoutPageContent once the cart (and its totals) has loaded.
  // react-stripe-js calls elements.update({ amount }) when this option changes.
  const [stripeAmount, setStripeAmount] = useState(1000);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment", // Setup mode for Payment Element
        amount: stripeAmount, // Synced with the real cart total (cents)
        currency: "usd",
        appearance: {
          theme: "stripe",
        },
        paymentMethodCreation: "manual", // Required for createPaymentMethod with PaymentElement
        paymentMethodTypes: ["card"],
      }}
    >
      <CheckoutPageContent onStripeAmountChange={setStripeAmount} />
    </Elements>
  );
};

const CheckoutPageContent = ({ onStripeAmountChange }) => {
  const stripe = useStripe(); // Get the Stripe instance from context
  const router = useRouter();
  const searchParams = useSearchParams();
  useAutoApplyCoupon();
  const isEdFlow = searchParams.get("ed-flow") === "1";
  const isSmokingFlow = searchParams.get("smoking-flow") === "1";
  const onboardingAddToCart = searchParams.get("onboarding-add-to-cart");
  const isGlp2CheckoutLayout = searchParams.get("glp2-checkout") === "1";

  // Keep track of various flow parameters to preserve them after checkout
  const flowParams = {
    "ed-flow": searchParams.get("ed-flow"),
    "wl-flow": searchParams.get("wl-flow"),
    "hair-flow": searchParams.get("hair-flow"),
    "mh-flow": searchParams.get("mh-flow"),
    "smoking-flow": searchParams.get("smoking-flow"),
    "skincare-flow": searchParams.get("skincare-flow"),
    "longevity-flow": searchParams.get("longevity-flow"),
  };

  // Build flow query string to append to redirects
  const buildFlowQueryString = () => {
    const params = [];
    Object.entries(flowParams).forEach(([key, value]) => {
      if (value) {
        params.push(`${key}=${value}`);
      }
    });
    return params.length > 0 ? `&${params.join("&")}` : "";
  };

  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState();
  const [isProcessingUrlParams, setIsProcessingUrlParams] = useState(false);
  const beginCheckoutFiredRef = useRef(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoadingSavedCards, setIsLoadingSavedCards] = useState(false);

  // Stripe Elements state (for embedded payment form)
  const [stripeElements, setStripeElements] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);

  // Payment processing modal state
  const [showPaymentProcessingPopup, setShowPaymentProcessingPopup] =
    useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Store payment retry data
  const [retryPaymentData, setRetryPaymentData] = useState(null);

  // Initialize checkout validation hook
  const {
    validationErrors,
    isValidating,
    validateForm,
    clearErrors,
    hasErrors,
    getFieldError,
  } = useCheckoutValidation();

  // Initialize address manager hook
  const {
    isLoadingAddresses,
    populateAddressData,
    saveAddressData,
    clearStoredAddresses,
    fetchProfileData,
  } = useAddressManager();

  // Keep the Stripe Elements amount in sync with the real cart total so the
  // Apple Pay / Google Pay wallet sheets display the correct order total
  // instead of the $10 ($1000 cents) placeholder set on the Elements provider.
  useEffect(() => {
    const totals = cartItems?.totals;
    if (!totals || typeof onStripeAmountChange !== "function") {
      return;
    }

    let cents = 0;
    if (totals.total_price) {
      // WC Store API exposes total_price already in minor units (cents).
      cents = Math.round(parseFloat(totals.total_price));
    } else if (totals.total) {
      // Fallback: a formatted string like "$120.00" -> dollars -> cents.
      cents = Math.round(
        parseFloat(String(totals.total).replace(/[^0-9.]/g, "")) * 100
      );
    }

    if (cents > 0) {
      onStripeAmountChange(cents);
    }
  }, [cartItems?.totals, onStripeAmountChange]);

  useEffect(() => {
    if (
      beginCheckoutFiredRef.current ||
      !cartItems?.items?.length ||
      window.location.pathname.includes("order-received")
    ) {
      return;
    }
    beginCheckoutFiredRef.current = true;

    (async () => {
      try {
        const items = cartItems.items.map((item) => ({
          product: {
            id: String(item.id || item.product_id || ""),
            sku: String(item.id || item.product_id || ""),
            name: item.name || "",
            price:
              parseFloat(item.prices?.price || item.totals?.line_total || 0) /
              100,
            categories: [],
            attributes: [],
          },
          quantity: item.quantity || 1,
        }));
        const sessionId = getOrCreateSessionId();
        const cartHash = cartItems.items
          .map((i) => i.id)
          .sort()
          .join("-");

        // TK-560: attach hashed identity to begin_checkout so Attentive can tie
        // the cart to a subscriber and enter the abandoned-cart journey. The
        // Attentive GTM tag reads order_data.billing_email_hash/phone_hash on
        // begin_checkout; without this the cart arrives anonymous and no SMS fires.
        const billingEmail = cartItems.billing_address?.email || "";
        const billingPhone =
          cartItems.billing_address?.phone ||
          cartItems.shipping_address?.phone ||
          "";
        const [billing_email_hash, billing_phone_hash] = await Promise.all([
          hashEmail(billingEmail),
          hashPhone(billingPhone, "US"),
        ]);
        const identity =
          billing_email_hash || billing_phone_hash
            ? { order_data: { billing_email_hash, billing_phone_hash } }
            : {};

        analyticsService.trackBeginCheckout(items, {
          event_id: `begin_checkout_${sessionId}_${cartHash}_${Date.now()}`,
          ...identity,
        });
      } catch (_) {
        // non-blocking
      }
    })();
  }, [cartItems]);

  // TK-633: fire the Meta "Start Checkout" milestone (RKY_<cat>_SC) on the
  // ACTUAL checkout page load — not on the upstream /wl-pre-consultation page.
  // The premature fires were removed from utils/flowCartHandler.js; this covers
  // ALL flows (WL/ED/Hair/etc.) by reading the flow query param. The server-side
  // CAPI mirror follows automatically because it is driven off the
  // `meta_start_checkout` dataLayer push that this same call emits.
  const startCheckoutFiredRef = useRef(false);
  useEffect(() => {
    if (
      startCheckoutFiredRef.current ||
      !cartItems?.items?.length ||
      window.location.pathname.includes("order-received")
    ) {
      return;
    }

    // Map the checkout flow query param -> the flow_id the Meta tracker expects
    // (drives category/pixel resolution: wl -> WL/RKY_FLW, ed -> ED/RKY_TNT...).
    const FLOW_PARAM_TO_FLOW_ID = {
      "wl-flow": "wl",
      "ed-flow": "ed",
      "hair-flow": "hair",
      "smoking-flow": "smoking",
      "skincare-flow": "skincare",
      "mh-flow": "mh",
      // NAD+ checkout arrives as ?longevity-flow=1. NAD+ is merged into the
      // LONGEVITY pixel, so flow_id "nad" resolves to LONGEVITY and fires
      // RKY_AEN_SC (browser + server CAPI mirror), tagged rky_cat:'NAD'.
      "longevity-flow": "nad",
    };
    const flowEntry = Object.entries(FLOW_PARAM_TO_FLOW_ID).find(
      ([param]) => searchParams.get(param) === "1",
    );
    if (!flowEntry) return; // not a flow-driven checkout — don't fire
    const flowType = flowEntry[1];

    // Fire once per flow per tab session: survives SPA nav, refresh and
    // back-nav; a genuinely new session re-fires. Falls back to the per-mount
    // ref guard if sessionStorage is unavailable (Meta dedups on event_id).
    const guardKey = `rky_start_checkout_fired_${flowType}`;
    try {
      if (sessionStorage.getItem(guardKey)) {
        startCheckoutFiredRef.current = true;
        return;
      }
      sessionStorage.setItem(guardKey, "1");
    } catch (_) {
      // sessionStorage unavailable — rely on the ref guard for this mount
    }
    startCheckoutFiredRef.current = true;

    try {
      const primary = cartItems.items[0];
      // Mirror the prior payload: primary (main) product id + its unit price.
      const value =
        parseFloat(primary?.prices?.price || primary?.totals?.line_total || 0) /
        100;
      trackMetaStartCheckout({
        flow_id: flowType,
        content_id: String(primary?.id || primary?.product_id || ""),
        value,
        currency: "USD",
      });
    } catch (err) {
      logMetaTrackingError(err, {
        flow_id: flowType,
        milestone: "START_CHECKOUT",
        context: "checkout_page_load",
      });
    }
  }, [cartItems, searchParams]);

  const [formData, setFormData] = useState({
    additional_fields: [],
    shipping_address: {},
    billing_address: {},
    extensions: {
      "checkout-fields-for-blocks": {
        _meta_discreet: true,
        _meta_mail_box: true,
      },
    },
    payment_method: "bambora_credit_card",
    payment_data: [
      {
        key: "wc-bambora-credit-card-js-token",
        value: "",
      },
      {
        key: "wc-bambora-credit-card-account-number",
        value: "",
      },
      {
        key: "wc-bambora-credit-card-card-type",
        value: "",
      },
      {
        key: "wc-bambora-credit-card-exp-month",
        value: "",
      },
      {
        key: "wc-bambora-credit-card-exp-year",
        value: "",
      },
    ],
  });

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardType, setCardType] = useState("");

  // Payment validation state
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [paymentValidationMessage, setPaymentValidationMessage] = useState("");

  // Retry mechanism state for saved card payments
  const [shouldUseDirectPayment, setShouldUseDirectPayment] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState("");
  const [savedOrderKey, setSavedOrderKey] = useState("");

  // Validate payment method whenever payment state changes
  useEffect(() => {
    // For NEW CARD payments with Stripe Elements, always consider valid
    // (Stripe Elements handles validation internally on submit)
    if (!selectedCard) {
      setIsPaymentValid(true);
      setPaymentValidationMessage("");
      return;
    }

    // For SAVED CARD payments, validate normally
    const paymentState = {
      selectedCard,
      cardNumber,
      expiry,
      cvc,
    };

    const isValid = isPaymentMethodValid(paymentState);
    const message = getPaymentValidationMessage(paymentState);

    setIsPaymentValid(isValid);
    setPaymentValidationMessage(message);
  }, [selectedCard, cardNumber, expiry, cvc]);

  const [showQuebecPopup, setShowQuebecPopup] = useState(false);
  const [showAgePopup, setShowAgePopup] = useState(false);
  const [ageValidationFailed, setAgeValidationFailed] = useState(false);
  const [showEdRestrictionPopup, setShowEdRestrictionPopup] = useState(false);
  const [restrictedProductName, setRestrictedProductName] = useState("");
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  // Handle province change for real-time Quebec validation and shipping updates
  const handleProvinceChange = async (
    newProvince,
    addressType = "billing",
    shouldClearFields = true,
  ) => {
    logger.log("🔄 HANDLE PROVINCE CHANGE CALLED");
    logger.log("newProvince:", newProvince);
    logger.log("addressType:", addressType);
    logger.log("shouldClearFields:", shouldClearFields);
    logger.log(
      "Current formData.billing_address.address_1:",
      formData.billing_address?.address_1,
    );
    if (cartItems && cartItems.items) {
      // const restriction = checkQuebecZonnicRestriction(
      //   cartItems.items,
      //   newProvince,
      //   newProvince
      // );

      // if (restriction.blocked) {
      //   setShowQuebecPopup(true);
      //   return;
      // }

      // Check age restriction for Zonnic products
      if (hasZonnicProducts(cartItems.items)) {
        // First check form data (user might have changed date of birth)
        let dateOfBirthToCheck = formData.billing_address.date_of_birth;

        // If no form data, fall back to profile API
        if (!dateOfBirthToCheck) {
          try {
            const response = await fetch("/api/profile");
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.success && profileData.date_of_birth) {
                dateOfBirthToCheck = profileData.date_of_birth;
              }
            }
          } catch (error) {
            logger.log(
              "Could not fetch user profile for age validation (province change):",
              error,
            );
          }
        }

        // Now validate the date of birth
        if (dateOfBirthToCheck) {
          logger.log(
            "Checking age validation for date (province change):",
            dateOfBirthToCheck,
          );
          const ageCheck = checkAgeRestriction(dateOfBirthToCheck, 19);
          logger.log("Age validation result (province change):", ageCheck);
          if (ageCheck.blocked) {
            logger.log(
              "User is too young, showing age popup (province change)",
            );
            setAgeValidationFailed(true);
            setShowAgePopup(true);
            return;
          } else {
            logger.log(
              "User meets age requirement (province change):",
              ageCheck.age,
            );
            setAgeValidationFailed(false);
          }
        } else {
          logger.log(
            "No date of birth found in form or profile data (province change)",
          );
        }
      }
    }

    // Update shipping rates when province changes
    try {
      setIsUpdatingShipping(true);

      // Check if user has enabled "Ship to a different address"
      const hasShipToDifferentAddress = Boolean(
        formData.shipping_address.ship_to_different_address,
      );

      logger.log("🚚 Province change handler:", {
        hasShipToDifferentAddress,
        addressType,
        newProvince,
        currentShippingState: formData.shipping_address.state,
        currentBillingState: formData.billing_address.state,
      });

      // If "Ship to a different address" is checked AND we're changing billing address,
      // do NOT update shipping address at all - it should remain completely independent
      if (hasShipToDifferentAddress && addressType === "billing") {
        logger.log(
          "🛡️🛡️🛡️ EARLY RETURN - Ship to different address is enabled",
        );
        logger.log(
          "🛡️ Shipping state will NOT be updated. Current shipping state:",
          formData.shipping_address.state,
        );
        logger.log("🛡️ Billing state being changed to:", newProvince);
        setIsUpdatingShipping(false);
        return; // Exit early, don't update shipping
      }

      // Prepare address data based on whether we should clear fields
      let addressData;

      if (shouldClearFields) {
        // Create a basic address with province and country to trigger shipping calculation
        // Only use billing address fallbacks if user hasn't checked "ship to different address"
        // or if we're changing the shipping address directly
        const useBillingFallback =
          !hasShipToDifferentAddress || addressType === "shipping";
        const preserveShippingState =
          hasShipToDifferentAddress && addressType === "billing";

        addressData = {
          first_name:
            formData.shipping_address.first_name ||
            (useBillingFallback ? formData.billing_address.first_name : "") ||
            "",
          last_name:
            formData.shipping_address.last_name ||
            (useBillingFallback ? formData.billing_address.last_name : "") ||
            "",
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: preserveShippingState
            ? formData.shipping_address.state || ""
            : newProvince,
          postcode: "",
          country: "US",
          ship_to_different_address: hasShipToDifferentAddress || false, // PRESERVE THE FLAG!
        };
      } else {
        // Keep existing address data when province changes due to address selection
        // If user has checked "ship to different address" AND we're changing billing address,
        // preserve shipping address without fallback to billing
        const preserveShippingAsIs =
          hasShipToDifferentAddress && addressType === "billing";

        addressData = {
          first_name:
            formData.shipping_address.first_name ||
            (!preserveShippingAsIs
              ? formData.billing_address.first_name
              : "") ||
            "",
          last_name:
            formData.shipping_address.last_name ||
            (!preserveShippingAsIs ? formData.billing_address.last_name : "") ||
            "",
          company: formData.shipping_address.company || "",
          address_1: formData.shipping_address.address_1 || "",
          address_2: formData.shipping_address.address_2 || "",
          city: formData.shipping_address.city || "",
          state: preserveShippingAsIs
            ? formData.shipping_address.state || ""
            : newProvince,
          postcode: formData.shipping_address.postcode || "",
          country: "US",
          ship_to_different_address: hasShipToDifferentAddress || false, // PRESERVE THE FLAG!
        };
      }

      logger.log("🚚 Address data prepared:", {
        addressDataState: addressData.state,
        ship_to_different_address: addressData.ship_to_different_address,
        willPreserveShipping:
          hasShipToDifferentAddress && addressType === "billing",
      });

      // Prepare customer data for API call
      const customerData = {
        billing_address: {
          first_name: formData.billing_address.first_name || "",
          last_name: formData.billing_address.last_name || "",
          company: formData.billing_address.company || "",
          address_1:
            addressType === "billing" && shouldClearFields
              ? ""
              : formData.billing_address.address_1 || "",
          address_2:
            addressType === "billing" && shouldClearFields
              ? ""
              : formData.billing_address.address_2 || "",
          city:
            addressType === "billing" && shouldClearFields
              ? ""
              : formData.billing_address.city || "",
          state:
            addressType === "billing"
              ? newProvince
              : formData.billing_address.state || newProvince,
          postcode:
            addressType === "billing" && shouldClearFields
              ? ""
              : formData.billing_address.postcode || "",
          country: "US",
          email: formData.billing_address.email || "",
          phone: formData.billing_address.phone || "",
        },
        shipping_address: addressData,
      };

      // Also update form data to sync UI only if we should clear fields
      if (shouldClearFields) {
        logger.log(
          "🚨 CLEARING FIELDS - This might be causing address truncation!",
        );
        logger.log("shouldClearFields:", shouldClearFields);
        logger.log("addressType:", addressType);
        logger.log(
          "Current billing address_1 before clearing:",
          formData.billing_address?.address_1,
        );
        logger.log("🚨 WARNING: This will clear the address fields!");

        // IMPORTANT: Only clear fields if we're not in the middle of an address autocomplete selection
        // Check if the current address looks like it was just populated (has meaningful data)
        const hasRecentAddressData =
          formData.billing_address?.address_1 &&
          formData.billing_address?.city &&
          formData.billing_address?.postcode;

        if (hasRecentAddressData) {
          logger.log(
            "🛡️ PREVENTING FIELD CLEARING - Recent address data detected!",
          );
          logger.log("🛡️ Keeping existing address data intact");
          return; // Don't clear fields if we have recent address data
        }

        // Check if user has enabled "Ship to a different address"
        const hasShipToDifferentAddress = Boolean(
          formData.shipping_address.ship_to_different_address,
        );

        setFormData((prev) => {
          // If user has checked "ship to different address" AND we're changing billing,
          // preserve the shipping address as-is
          const shouldPreserveShipping =
            hasShipToDifferentAddress && addressType === "billing";

          const updatedData = {
            ...prev,
            billing_address: {
              ...prev.billing_address,
              ...(addressType === "billing"
                ? {
                    address_1: "",
                    address_2: "",
                    city: "",
                    postcode: "",
                    country: "US",
                  }
                : {}),
              state:
                addressType === "billing"
                  ? newProvince
                  : prev.billing_address.state || newProvince,
            },
            shipping_address: shouldPreserveShipping
              ? prev.shipping_address
              : addressData,
          };

          logger.log("FormData after clearing fields:", {
            billing_address_1: updatedData.billing_address.address_1,
            shipping_address_1: updatedData.shipping_address.address_1,
            shipping_state: updatedData.shipping_address.state,
            ship_to_different_address:
              updatedData.shipping_address.ship_to_different_address,
            shouldPreserveShipping: shouldPreserveShipping,
          });

          return updatedData;
        });
      }

      // Log the customer data being sent
      logger.log(
        "Sending customer data to update-customer API:",
        JSON.stringify(customerData, null, 2),
      );

      // Specifically log the address_1 field to debug truncation
      logger.log("=== ADDRESS DEBUG ===");
      logger.log(
        "Billing address_1 being sent:",
        `"${customerData.billing_address.address_1}"`,
      );
      logger.log(
        "Billing address_1 length:",
        customerData.billing_address.address_1?.length || 0,
      );
      logger.log(
        "Shipping address_1 being sent:",
        `"${customerData.shipping_address.address_1}"`,
      );
      logger.log(
        "Shipping address_1 length:",
        customerData.shipping_address.address_1?.length || 0,
      );
      logger.log(
        "FormData billing address_1:",
        `"${formData.billing_address.address_1}"`,
      );
      logger.log(
        "FormData shipping address_1:",
        `"${formData.shipping_address.address_1}"`,
      );
      logger.log("=== END ADDRESS DEBUG ===");

      // Call the update customer API
      const response = await fetch("/api/cart/update-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const updatedCart = await response.json();

      if (response.ok && !updatedCart.error) {
        logger.log("✅ Cart updated from API. Checking shipping address:", {
          shipping_state: updatedCart.shipping_address?.state,
          ship_to_different_address:
            updatedCart.shipping_address?.ship_to_different_address,
        });
        // Update cart state with new shipping rates
        setCartItems(updatedCart);
      } else {
        logger.error("Error updating shipping rates:", updatedCart.error);
        toast.error("Failed to update shipping rates. Please try again.");
      }
    } catch (error) {
      logger.error("Error updating shipping rates:", error);
      toast.error("Failed to update shipping rates. Please try again.");
    } finally {
      setIsUpdatingShipping(false);
    }
  };

  // Function to check if cart contains Zonnic products
  const hasZonnicProducts = (cartItems) => {
    if (!cartItems || !cartItems.items || !Array.isArray(cartItems.items)) {
      return false;
    }

    return cartItems.items.some((item) => {
      // Check if the product name contains "zonnic" (case insensitive)
      return (
        item &&
        item.name &&
        typeof item.name === "string" &&
        item.name.toString().toLowerCase().includes("zonnic")
      );
    });
  };

  // Function to update URL with smoking-flow parameter
  const updateUrlWithSmokingFlow = () => {
    // Only update if smoking-flow parameter is not already present
    if (!isSmokingFlow) {
      // Create a new URLSearchParams instance from the current search params
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("smoking-flow", "1");

      // Update the URL without triggering a page reload
      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);

      // Update the flowParams object
      flowParams["smoking-flow"] = "1";
    }
  };

  // Function to fetch cart items
  // updateFormData: whether to update billing/shipping addresses in form (default: true)
  const fetchCartItems = async (updateFormData = true) => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();

      // Log cart items to debug what products are actually being added
      logger.log("Cart items received from API:", data.items);

      // If we're coming from ED flow with specific products, verify the products are correct
      if (onboardingAddToCart) {
        const expectedProducts = onboardingAddToCart
          .split("%2C")
          .map((id) => id.trim());
        logger.log("Expected product IDs from URL:", expectedProducts);

        // Check if products match what we expect
        if (data.items && data.items.length > 0) {
          logger.log("First product in cart:", {
            id: data.items[0].id,
            name: data.items[0].name,
            product_id: data.items[0].product_id,
          });
        }
      }

      // Update cart items
      setCartItems(data);

      // --- FLOW CHECKING LOGIC BASED ON LOCALSTORAGE ---
      if (typeof window !== "undefined") {
        const requiredConsultation = getRequiredConsultations();
        if (
          Array.isArray(requiredConsultation) &&
          requiredConsultation.length > 0 &&
          data.items &&
          Array.isArray(data.items)
        ) {
          logger.log("required consultation", requiredConsultation);
          // For each cart item, check if it matches a required consultation
          for (const item of data.items) {
            logger.log("item", item);
            const match = requiredConsultation.find(
              (rc) =>
                String(rc.productId) === String(item.id) ||
                String(rc.productId) === String(item.product_id),
            );
            if (match && match.flowType && !searchParams.get(match.flowType)) {
              // Add the flowType=1 to the URL if not present
              const newParams = new URLSearchParams(window.location.search);
              newParams.set(match.flowType, "1");
              const newUrl = `${
                window.location.pathname
              }?${newParams.toString()}`;
              window.history.replaceState({ path: newUrl }, "", newUrl);
              // Only add the first found flow, break
              break;
            }
          }
        }
      }
      // --- END FLOW CHECKING LOGIC ---

      // Check if personal info fields are empty in cart data and fetch from profile if needed
      // This ensures first_name, last_name, phone, and date_of_birth are populated
      // Check both billing and shipping addresses
      if (updateFormData) {
        const hasEmptyPersonalInfo =
          !data.billing_address?.first_name ||
          !data.billing_address?.last_name ||
          !data.billing_address?.phone ||
          !data.billing_address?.date_of_birth ||
          !data.shipping_address?.first_name ||
          !data.shipping_address?.last_name ||
          !data.shipping_address?.phone ||
          !data.shipping_address?.date_of_birth;

        if (hasEmptyPersonalInfo) {
          logger.log(
            "=== CART HAS EMPTY PERSONAL INFO (BILLING OR SHIPPING), FETCHING FROM PROFILE ===",
          );
          // Fetch profile data and merge only the missing personal fields
          const profileData = await fetchProfileData();
          if (profileData && profileData.success) {
            logger.log("=== PROFILE DATA FETCHED, MERGING PERSONAL INFO ===", {
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone,
              date_of_birth:
                profileData.date_of_birth ||
                profileData.raw_profile_data?.custom_meta?.date_of_birth,
            });

            // Fill in only the empty personal info fields in billing address
            data.billing_address = {
              ...data.billing_address,
              first_name:
                data.billing_address?.first_name ||
                profileData.first_name ||
                "",
              last_name:
                data.billing_address?.last_name || profileData.last_name || "",
              email:
                data.billing_address?.email || profileData.email || "",
              phone: data.billing_address?.phone || profileData.phone || "",
              date_of_birth:
                data.billing_address?.date_of_birth ||
                profileData.date_of_birth ||
                profileData.raw_profile_data?.custom_meta?.date_of_birth ||
                "",
            };

            // Fill in only the empty personal info fields in shipping address
            data.shipping_address = {
              ...data.shipping_address,
              first_name:
                data.shipping_address?.first_name ||
                profileData.first_name ||
                "",
              last_name:
                data.shipping_address?.last_name || profileData.last_name || "",
              phone: data.shipping_address?.phone || profileData.phone || "",
              date_of_birth:
                data.shipping_address?.date_of_birth ||
                profileData.date_of_birth ||
                profileData.raw_profile_data?.custom_meta?.date_of_birth ||
                "",
            };

            logger.log("=== PERSONAL INFO MERGED INTO CART DATA ===", {
              billing_first_name: data.billing_address.first_name,
              billing_last_name: data.billing_address.last_name,
              billing_phone: data.billing_address.phone,
              billing_date_of_birth: data.billing_address.date_of_birth,
              shipping_first_name: data.shipping_address.first_name,
              shipping_last_name: data.shipping_address.last_name,
              shipping_phone: data.shipping_address.phone,
              shipping_date_of_birth: data.shipping_address.date_of_birth,
            });

            // Immediately save the merged data to localStorage to prevent it from being overwritten
            saveAddressData(data.billing_address, data.shipping_address);
            logger.log("=== SAVED MERGED DATA TO LOCALSTORAGE ===");
          } else {
            logger.log("=== NO PROFILE DATA AVAILABLE TO MERGE ===");
          }
        }
      }

      // Update form data with shipping and billing addresses from cart only if requested
      // This serves as a fallback for guest checkout on initial load
      // For logged-in users, fetchUserProfile will override this with fresh data
      // When refreshing cart (e.g., after adding products), we don't want to overwrite profile data
      if (updateFormData) {
        logger.log("=== SETTING FORM DATA FROM CART ===", {
          billing_address_1: data.billing_address?.address_1,
          billing_city: data.billing_address?.city,
          billing_state: data.billing_address?.state,
        });
        setFormData((prev) => {
          return {
            ...prev,
            billing_address: data.billing_address || prev.billing_address,
            shipping_address: data.shipping_address || prev.shipping_address,
          };
        });
      } else {
        logger.log("=== SKIPPING FORM DATA UPDATE FROM CART ===");
      }

      return data;
    } catch (error) {
      logger.error("Error fetching cart items:", error);
      return null;
    }
  };

  // Effect to save address data when formData changes
  useEffect(() => {
    if (formData.billing_address || formData.shipping_address) {
      saveAddressData(formData.billing_address, formData.shipping_address);
    }
  }, [formData.billing_address, formData.shipping_address, saveAddressData]);

  // Effect to populate address data after initial load
  useEffect(() => {
    // Only run this after the initial cart and profile data have been loaded
    if (cartItems && !isProcessingUrlParams && !isLoadingAddresses) {
      const timer = async () => {
        logger.log("=== POPULATING ADDRESS DATA WITH HOOK ===");
        logger.log("Current formData before population:", {
          billing_address_1: formData.billing_address?.address_1,
          billing_city: formData.billing_address?.city,
          billing_postcode: formData.billing_address?.postcode,
          billing_date_of_birth: formData.billing_address?.date_of_birth,
        });

        const updatedFormData = await populateAddressData(formData);

        // Use deep comparison to check if data actually changed
        const hasChanges =
          JSON.stringify(updatedFormData) !== JSON.stringify(formData);

        if (hasChanges) {
          logger.log("✅ FormData will be updated with address data:", {
            billing_address_1: updatedFormData.billing_address?.address_1,
            billing_city: updatedFormData.billing_address?.city,
            billing_postcode: updatedFormData.billing_address?.postcode,
            billing_date_of_birth:
              updatedFormData.billing_address?.date_of_birth,
          });
          setFormData(updatedFormData);

          // Debug localStorage after update
          setTimeout(() => {
            debugAddressData();
          }, 500);
        } else {
          logger.log("ℹ️ No address data changes detected");
          // Still debug to see what's in localStorage
          debugAddressData();
        }
      }; // Small delay to ensure other data loading is complete
      timer();

      // return () => clearTimeout(timer);
    }
  }, [isProcessingUrlParams]);

  // Function to fetch saved payment cards
  const fetchSavedCards = async () => {
    try {
      setIsLoadingSavedCards(true);
      logger.log("Fetching saved cards from API...");

      // Explicitly wait for the fetch to complete
      const res = await fetch("/api/payment-methods", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) {
        logger.error("API returned error status:", res.status);
        throw new Error(`API error: ${res.status}`);
      }

      // Log the raw response
      logger.log("API response status:", res.status);

      // Parse the response
      const data = await res.json();

      logger.log("Saved cards API full response:", data);

      if (
        data.success &&
        data.cards &&
        Array.isArray(data.cards) &&
        data.cards.length > 0
      ) {
        logger.log("Setting saved cards in state:", data.cards);
        setSavedCards(data.cards);

        // Set the default card as selected if available
        const defaultCard = data.cards.find((card) => card.is_default);
        if (defaultCard) {
          logger.log("Setting default card as selected:", defaultCard);
          // Store the card object to have access to both id and token
          setSelectedCard(defaultCard);
        }
      } else {
        logger.log("No saved cards found in API response or invalid format");
        setSavedCards([]);
      }
    } catch (error) {
      logger.error("Error fetching saved cards:", error);
      setSavedCards([]);
    } finally {
      setIsLoadingSavedCards(false);
    }
  };

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    try {
      // Always fetch fresh data from API for checkout to ensure latest billing info
      // Get user name from cookies if available
      const cookies = document.cookie.split(";").reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split("=");
        cookies[name] = value;
        return cookies;
      }, {});

      // Decode cookie values to prevent URL encoding issues
      const storedFirstName = decodeURIComponent(cookies.displayName || "");
      const storedUserName = decodeURIComponent(cookies.userName || "");

      // Fetch fresh profile data without caching - add timestamp to prevent any caching
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/profile?t=${timestamp}`, {
        // Prevent browser caching
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const data = await res.json();

      logger.log("=== PROFILE DATA FETCHED ===", {
        timestamp: new Date().toISOString(),
        billing_address_1: data.billing_address_1,
        billing_city: data.billing_city,
        billing_state: data.billing_state,
        billing_postcode: data.billing_postcode,
      });

      if (data.success) {
        const profileData = data;

        // Update form data with user profile information
        // BUT: Only override cart data if profile has data and cart doesn't (priority to cart)
        logger.log("=== SETTING FORM DATA FROM PROFILE ===");
        setFormData((prev) => {
          // Create updated billing address with user data
          // IMPORTANT: Use prev data (from cart) if it exists, profile as fallback
          const updatedBillingAddress = {
            ...prev.billing_address,
            // Prioritize existing form data (from cart), then cookies, then profile
            first_name:
              prev.billing_address.first_name ||
              storedFirstName ||
              profileData.first_name ||
              "",
            last_name:
              prev.billing_address.last_name ||
              (storedUserName
                ? decodeURIComponent(storedUserName)
                    .replace(storedFirstName, "")
                    .trim()
                : profileData.last_name || ""),
            email: prev.billing_address.email || profileData.email || "",
            phone: prev.billing_address.phone || profileData.phone || "",
            address_1:
              prev.billing_address.address_1 ||
              profileData.billing_address_1 ||
              "",
            address_2:
              prev.billing_address.address_2 ||
              profileData.billing_address_2 ||
              "",
            city: prev.billing_address.city || profileData.billing_city || "",
            state:
              prev.billing_address.state ||
              profileData.billing_state ||
              profileData.province ||
              "",
            postcode:
              prev.billing_address.postcode ||
              profileData.billing_postcode ||
              "",
            country:
              prev.billing_address.country ||
              profileData.billing_country ||
              "US",
            // Add the date of birth field to billing address
            date_of_birth:
              profileData.date_of_birth ||
              profileData.raw_profile_data?.custom_meta?.date_of_birth ||
              "",
          };

          // Create updated shipping address with user data
          // IMPORTANT: Prioritize existing form data (from cart), then profile
          const updatedShippingAddress = {
            ...prev.shipping_address,
            // Prioritize existing form data (from cart), then cookies, then profile
            first_name:
              prev.shipping_address.first_name ||
              storedFirstName ||
              profileData.first_name ||
              "",
            last_name:
              prev.shipping_address.last_name ||
              (storedUserName
                ? decodeURIComponent(storedUserName)
                    .replace(storedFirstName, "")
                    .trim()
                : profileData.last_name || ""),
            phone: prev.shipping_address.phone || profileData.phone || "",
            address_1:
              prev.shipping_address.address_1 ||
              profileData.shipping_address_1 ||
              profileData.billing_address_1 ||
              "",
            address_2:
              prev.shipping_address.address_2 ||
              profileData.shipping_address_2 ||
              profileData.billing_address_2 ||
              "",
            city:
              prev.shipping_address.city ||
              profileData.shipping_city ||
              profileData.billing_city ||
              "",
            state:
              prev.shipping_address.state ||
              profileData.shipping_state ||
              profileData.billing_state ||
              profileData.province ||
              "",
            postcode:
              prev.shipping_address.postcode ||
              profileData.shipping_postcode ||
              profileData.billing_postcode ||
              "",
            country:
              prev.shipping_address.country ||
              profileData.shipping_country ||
              "US",
            // Add the date of birth field to shipping address
            date_of_birth:
              profileData.date_of_birth ||
              profileData.raw_profile_data?.custom_meta?.date_of_birth ||
              "",
          };

          logger.log(
            "Updated billing address (prioritizing cart data):",
            updatedBillingAddress,
          );
          logger.log(
            "Previous billing address (from cart):",
            prev.billing_address,
          );
          logger.log("Profile billing address:", {
            address_1: profileData.billing_address_1,
            city: profileData.billing_city,
            state: profileData.billing_state,
          });

          return {
            ...prev,
            billing_address: updatedBillingAddress,
            shipping_address: updatedShippingAddress,
            // Also add date_of_birth at the form data root level for accessibility
            date_of_birth:
              profileData.date_of_birth ||
              profileData.raw_profile_data?.custom_meta?.date_of_birth ||
              "",
          };
        });
      } else {
        logger.log("No user profile data available or user not logged in");
      }
    } catch (error) {
      logger.error("Error fetching user profile:", error);
    }
  };

  // Initial loading of cart and processing URL parameters
  useEffect(() => {
    // Reset retry mechanism state on page load/refresh
    setShouldUseDirectPayment(false);
    setSavedOrderId("");
    setSavedOrderKey("");

    // Initialize loading
    const loadCheckoutData = async () => {
      try {
        logger.log("=== STARTING CHECKOUT DATA LOAD ===");

        // STEP 1: Load cart first and WAIT for it to complete
        const cartData = await fetchCartItems(true); // true = update form data with cart data
        setCartItems(cartData);
        logger.log("=== CART LOADED ===");

        // Process URL parameters if needed
        if (onboardingAddToCart) {
          setIsProcessingUrlParams(true);

          try {
            const result = await processUrlCartParameters(searchParams);

            if (result.status === "success") {
              // Refresh cart after adding products
              // Don't update form data to avoid overwriting profile data
              const updatedCart = await fetchCartItems(false); // false = don't update form
              setCartItems(updatedCart);
              toast.success("Products added to your cart!");

              // Clean up URL parameters - use the detected flow type from result
              cleanupCartUrlParameters(
                result.flowType ||
                  (isEdFlow
                    ? "ed"
                    : flowParams["hair-flow"]
                      ? "hair"
                      : flowParams["wl-flow"]
                        ? "wl"
                        : flowParams["mh-flow"]
                          ? "mh"
                          : flowParams["skincare-flow"]
                            ? "skincare"
                            : "general"),
              );
            } else if (result.status === "error") {
              toast.error(result.message || "Failed to add products to cart.");
            }
          } finally {
            setIsProcessingUrlParams(false);
          }
        }

        // STEP 2: Apply coupon ONLY from the auto-apply URL param
        // (or its persisted value captured earlier by useAutoApplyCoupon).
        // No flow/product-based auto-application — manual entry is handled
        // separately in the checkout summary.
        const couponToApply =
          searchParams.get("apply_coupon") || getPendingCouponCode();

        if (couponToApply) {
          try {
            logger.log(`[Checkout] Applying coupon from URL: ${couponToApply}`);
            const couponRes = await fetch("/api/coupons", {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({ code: couponToApply }),
            });
            const couponData = await couponRes.json();

            if (couponData.error) {
              toast.error(`Coupon "${couponToApply}" could not be applied.`);
            } else {
              setCartItems(couponData);
              toast.success(`Coupon "${couponToApply}" applied.`, {
                autoClose: 8000,
              });
            }
          } catch (couponErr) {
            logger.error("[Checkout] Error applying coupon:", couponErr);
            toast.error("Failed to apply coupon.");
          } finally {
            clearPendingCouponCode();
          }
        }

        logger.log("=== ADDRESS DATA ALREADY POPULATED IN FETCHCARTITEMS ===");

        // Saved cards are loaded by the StripeSavedCards picker itself
        // (via /api/stripe-saved-cards). The old /api/payment-methods call was
        // the legacy Bambora token endpoint and is no longer used.
      } catch (error) {
        logger.error("Error loading checkout data:", error);
        toast.error(
          "There was an issue loading your checkout data. Please refresh the page.",
        );
      }
    };

    loadCheckoutData();
  }, []);

  // Reusable function to process Stripe payment (from step 2 onwards - after order creation)
  const processStripePayment = async (
    orderId,
    orderKey,
    amountInCents,
    dataToSend,
    savedPaymentMethodId = null,
  ) => {
    try {
      // Don't call elements.submit() here. It opens the Apple Pay sheet, and
      // Apple Pay only allows that straight off the user's tap — by this point
      // we've already awaited the order creation, so it'd blow up with an
      // IntegrationError. The callers run submit() inside the click instead.

      // Resolve the payment method id. A saved Stripe card hands us its id
      // directly; a new card gets tokenized from the Payment Element.
      let paymentMethodToUse;
      if (savedPaymentMethodId) {
        paymentMethodToUse = savedPaymentMethodId;
        logger.log("Using saved Stripe card:", paymentMethodToUse);
      } else {
        logger.log("Getting payment method from PaymentElement...");
        const { error: pmError, paymentMethod } =
          await stripe.createPaymentMethod({
            elements: stripeElements,
            params: {
              billing_details: {
                name: `${dataToSend.firstName} ${dataToSend.lastName}`,
                email: dataToSend.email,
                phone: dataToSend.phone,
                address: {
                  line1: dataToSend.addressOne,
                  line2: dataToSend.addressTwo || "",
                  city: dataToSend.city,
                  state: dataToSend.state,
                  postal_code: dataToSend.postcode,
                  country: dataToSend.country,
                },
              },
            },
          });

        if (pmError) {
          throw new Error(pmError.message);
        }

        if (!paymentMethod) {
          throw new Error("Failed to create payment method");
        }

        paymentMethodToUse = paymentMethod.id;
        logger.log("✅ Payment method created:", paymentMethodToUse);
      }

      // Step 3: Create PaymentIntent with manual capture using the payment method
      logger.log("Creating PaymentIntent with manual capture...");
      const intentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: amountInCents,
          paymentMethodId: paymentMethodToUse,
          customerEmail: dataToSend.email,
          customerName: `${dataToSend.firstName} ${dataToSend.lastName}`,
        }),
      });

      const intentResult = await intentResponse.json();

      // Initialize paymentIntent variable
      let paymentIntent = null;
      const stripeCustomerId = intentResult.stripeCustomerId || null;

      // Check if payment requires 3D Secure authentication
      if (intentResult.requiresAction && intentResult.clientSecret) {
        logger.log(
          "⚠️ Payment requires 3D Secure authentication - showing 3DS modal",
        );

        // Run the 3DS challenge. A saved card has no Payment Element to confirm
        // with, so trigger the next action directly; a new card confirms via
        // the Payment Element.
        const { error: confirmError, paymentIntent: confirmedIntent } =
          savedPaymentMethodId
            ? await stripe.handleNextAction({
                clientSecret: intentResult.clientSecret,
              })
            : await stripe.confirmPayment({
                elements: stripeElements,
                clientSecret: intentResult.clientSecret,
                confirmParams: {
                  return_url: `${window.location.origin}/checkout/order-received/${orderId}?key=${orderKey}${buildFlowQueryString()}`,
                },
                redirect: "if_required", // Only redirect if absolutely necessary
              });

        if (confirmError) {
          // User cancelled or 3DS failed
          logger.error(
            "❌ 3D Secure authentication failed:",
            confirmError.message,
          );
          throw new Error(
            confirmError.message ||
              "3D Secure authentication failed. Please try again.",
          );
        }

        // Check if payment is now authorized after 3DS completion
        if (!confirmedIntent) {
          throw new Error(
            "Payment authentication incomplete. Please try again.",
          );
        }

        // Use the confirmed paymentIntent
        paymentIntent = confirmedIntent;

        // Verify payment is authorized
        if (
          paymentIntent.status !== "requires_capture" &&
          paymentIntent.status !== "succeeded"
        ) {
          logger.warn(
            "⚠️ PaymentIntent status after 3DS:",
            paymentIntent.status,
          );
          throw new Error(
            `Payment authentication incomplete. Status: ${paymentIntent.status}`,
          );
        }

        logger.log("✅ 3D Secure authentication completed successfully");
      } else if (intentResult.requiresAction) {
        // requiresAction but no clientSecret - this shouldn't happen
        logger.error("❌ Payment requires 3DS but no clientSecret provided");
        throw new Error(
          "3D Secure authentication is required but could not be initiated. Please try again.",
        );
      } else {
        // No 3DS required - use paymentIntent from response
        // Check if payment is incomplete (3DS started but not completed)
        if (intentResult.paymentIntent?.status === "incomplete") {
          logger.error(
            "❌ Payment is incomplete - 3DS authentication was not completed",
          );
          throw new Error(
            "Payment incomplete. 3D Secure authentication was not completed. Please try again.",
          );
        }

        if (!intentResult.success) {
          throw new Error(
            intentResult.error || "Failed to create payment intent",
          );
        }

        paymentIntent = intentResult.paymentIntent;

        // Only log success if payment is actually authorized
        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          logger.log(
            "✅ PaymentIntent created and authorized:",
            paymentIntent.id,
          );
        } else {
          logger.warn(
            "⚠️ PaymentIntent created but not authorized. Status:",
            paymentIntent.status,
          );
          throw new Error(
            `Payment not authorized. Status: ${paymentIntent.status}`,
          );
        }
      }

      // Ensure paymentIntent is set
      if (!paymentIntent) {
        throw new Error("Payment intent not available. Please try again.");
      }

      if (stripeCustomerId) {
        logger.log("✅ Stripe Customer ID:", stripeCustomerId);
      }

      // Extract payment details for WooCommerce metadata
      const paymentMethodId = paymentIntent?.payment_method;
      const chargeId = paymentIntent?.latest_charge;
      const currency = paymentIntent?.currency?.toUpperCase() || "USD";

      // Try to get card details if available
      const cardBrand = paymentIntent?.payment_method_details?.card?.brand;
      const cardLast4 = paymentIntent?.payment_method_details?.card?.last4;

      logger.log("Payment details for WooCommerce:", {
        paymentIntentId: paymentIntent?.id,
        chargeId,
        paymentMethodId,
        currency,
        cardBrand,
        cardLast4,
        stripeCustomerId,
      });

      // Hide payment processing modal and show success
      setIsProcessingPayment(false);
      setShowPaymentProcessingPopup(false);
      setPaymentError(null);
      setRetryPaymentData(null); // Clear retry data on success

      // Show success toast
      toast.success("Payment successful!");

      // ========================================
      // ASYNC: Update customer profile in WooCommerce AFTER payment success (non-blocking)
      // This saves billing/shipping to the WordPress user profile permanently
      // Runs independently - does NOT depend on cart update
      // ========================================
      (async () => {
        try {
          logger.log("Updating customer profile permanently (non-blocking)...");
          const useShippingAddress =
            formData.shipping_address.ship_to_different_address;

          const billingAddress = {
            first_name: formData.billing_address.first_name || "",
            last_name: formData.billing_address.last_name || "",
            company: formData.billing_address.company || "",
            address_1: formData.billing_address.address_1 || "",
            address_2: formData.billing_address.address_2 || "",
            city: formData.billing_address.city || "",
            state: formData.billing_address.state || "",
            postcode: formData.billing_address.postcode || "",
            country: formData.billing_address.country || "US",
            email: formData.billing_address.email || "",
            phone: formData.billing_address.phone || "",
          };

          const shippingAddress = useShippingAddress
            ? {
                first_name: formData.shipping_address.first_name || "",
                last_name: formData.shipping_address.last_name || "",
                company: formData.shipping_address.company || "",
                address_1: formData.shipping_address.address_1 || "",
                address_2: formData.shipping_address.address_2 || "",
                city: formData.shipping_address.city || "",
                state: formData.shipping_address.state || "",
                postcode: formData.shipping_address.postcode || "",
                country: formData.shipping_address.country || "US",
                phone: formData.shipping_address.phone || "",
              }
            : { ...billingAddress };

          const profileData = {
            billing_address: billingAddress,
            shipping_address: shippingAddress,
            date_of_birth:
              formData.billing_address.date_of_birth ||
              formData.date_of_birth ||
              "",
          };

          logger.log("Profile update data:", {
            billing_city: profileData.billing_address?.city,
            billing_state: profileData.billing_address?.state,
            billing_postcode: profileData.billing_address?.postcode,
            shipping_city: profileData.shipping_address?.city,
            date_of_birth: profileData.date_of_birth,
            phone: profileData.billing_address?.phone,
          });

          const profileUpdateResponse = await fetch(
            "/api/update-customer-profile",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(profileData),
            },
          );

          const profileUpdateResult = await profileUpdateResponse.json();

          // logger.log("=== PROFILE UPDATE API RESPONSE (async) ===", {
          //     status: profileUpdateResponse.status,
          //     ok: profileUpdateResponse.ok,
          //     success: profileUpdateResult.success,
          //     error: profileUpdateResult.error || null,
          // });

          if (profileUpdateResponse.ok && profileUpdateResult.success) {
            logger.log("✅ Customer profile updated permanently (async) ✓");

            if (profileUpdateResult.metadata_update) {
              logger.log(
                "Metadata update status:",
                profileUpdateResult.metadata_update,
              );
            }
          } else {
            logger.error(
              "❌ Failed to update customer profile (async):",
              profileUpdateResult.error || "Unknown error",
            );
          }
        } catch (profileError) {
          logger.error(
            "❌ Error updating customer profile (async):",
            profileError,
          );
          // Don't throw - non-critical operation
        }
      })(); // End of async IIFE - fire and forget

      // Step 5: Update order status asynchronously (non-blocking)
      logger.log("Updating order status asynchronously...");
      fetch("/api/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "on-hold", // Keep as on-hold for manual capture
          paymentIntentId: paymentIntent?.id || intentResult.paymentIntentId,
          chargeId: chargeId,
          paymentMethodId: paymentMethodId, // Critical for WC to capture
          stripeCustomerId: stripeCustomerId, // Stripe customer ID
          paymentMethod: "stripe_cc",
          currency: currency,
          cardBrand: cardBrand,
          cardLast4: cardLast4,
        }),
      })
        .then((updateResponse) => updateResponse.json())
        .then((updateResult) => {
          if (updateResult.success) {
            logger.log("✅ Order updated successfully");
          } else {
            logger.error("Failed to update order status:", updateResult.error);
            // Don't block user flow - order was created and payment processed
          }
        })
        .catch((updateError) => {
          logger.error("Error updating order status:", updateError);
          // Don't block user flow - order was created and payment processed
        });

      // Empty cart
      try {
        const { emptyCart } = await import("@/lib/cart/cartService");
        await emptyCart();
        logger.log("Cart emptied successfully");
      } catch (error) {
        logger.error("Error emptying cart:", error);
      }

      // Redirect to success page
      router.push(
        `/checkout/order-received/${orderId}?key=${orderKey}${buildFlowQueryString()}`,
      );
    } catch (error) {
      logger.error("❌ Stripe payment processing error:", error);
      // Store retry data for retry functionality
      setRetryPaymentData({
        orderId,
        orderKey,
        amountInCents,
        dataToSend,
        savedPaymentMethodId,
      });
      // Show error in modal
      setIsProcessingPayment(false);
      setPaymentError(error.message || "Payment failed. Please try again.");
      setSubmitting(false);
      // Keep modal open to show error and retry option
      throw error; // Re-throw to be caught by caller
    }
  };

  // Shapes this storefront's session-scoped attribution (utils/sourceAttribution.js)
  // into what lib/northbeam/sourceAttribution.js's buildSourceAttributionMeta expects,
  // so the order carries the utm params, referrer and landing page that only ever
  // existed in this browser session.
  //
  // This module keeps one clickId plus a clickIdType label rather than one field
  // per vendor, and the label is many to one (gclid, gbraid and wbraid all report
  // "Google Ads"), so the original parameter name cannot be recovered from it. The
  // pair is passed through as is and the seam records it under its own reserved
  // keys. gbraid and wbraid are the exception: this module stores those two
  // separately under their real names, so they map across directly.
  //
  // Whole body is guarded because this runs inside the payment submit path. Losing
  // attribution on an order is recoverable; failing the checkout is not.
  // This storefront stores the landing page as a full absolute URL while the
  // Canadian one stores pathname plus query. Same _nb_landing_page key, two
  // different value contracts, so one of them has to give. Reduced to path plus
  // query to match, since the host is already implied by the region.
  const normalizeLandingPage = (value) => {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return "";
    try {
      const parsed = new URL(raw, "https://www.myrocky.com");
      return `${parsed.pathname}${parsed.search}`;
    } catch (_) {
      return raw;
    }
  };

  const buildSourceAttributionPayload = () => {
    try {
      const attribution = getAttributionData();

      let referrerDomain = "";
      if (attribution.referrer) {
        try {
          referrerDomain = new URL(attribution.referrer).hostname;
        } catch (_) {
          referrerDomain = "";
        }
      }

      return {
        utm_source: attribution.source || "",
        utm_medium: attribution.medium || "",
        utm_campaign: attribution.campaign || "",
        utm_term: attribution.term || "",
        utm_content: attribution.content || "",
        referrer: attribution.referrer || "",
        referrer_domain: referrerDomain,
        landing_page: normalizeLandingPage(attribution.landingPage),
        source_name: deriveSourceName(attribution) || "",
        session_id: getOrCreateSessionId() || "",
        gbraid: attribution.gbraid || "",
        wbraid: attribution.wbraid || "",
        click_id: attribution.clickId || "",
        click_id_type: attribution.clickIdType || "",
      };
    } catch (_) {
      return {};
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Express Checkout (Apple Pay / Google Pay) — wallet buttons above the card
  // form. Returning Link consumers don't get wallet tabs inside the Payment
  // Element, so the Express Checkout Element gives them one. It reuses the same
  // order + payment pipeline as the new-card path; only the trigger differs.
  // ────────────────────────────────────────────────────────────────────────

  // Same payload the new-card path builds in handleSubmit, but always a new
  // payment (no saved card). Keep this in sync with the dataToSend object below.
  const buildWalletCheckoutData = () => {
    const useShippingAddress =
      formData.shipping_address.ship_to_different_address;
    const { awc: awinAwc, channel: awinChannel } = getAwinFromUrlOrStorage();

    return {
      firstName: formData.billing_address.first_name,
      lastName: formData.billing_address.last_name,
      addressOne: formData.billing_address.address_1,
      addressTwo: formData.billing_address.address_2,
      city: formData.billing_address.city,
      state: formData.billing_address.state,
      postcode: formData.billing_address.postcode,
      country: formData.billing_address.country,
      phone: formData.billing_address.phone,
      email: formData.billing_address.email,

      shipToAnotherAddress: useShippingAddress || false,
      shippingFirstName: useShippingAddress
        ? formData.shipping_address.first_name
        : formData.billing_address.first_name,
      shippingLastName: useShippingAddress
        ? formData.shipping_address.last_name
        : formData.billing_address.last_name,
      shippingAddressOne: useShippingAddress
        ? formData.shipping_address.address_1
        : formData.billing_address.address_1,
      shippingAddressTwo: useShippingAddress
        ? formData.shipping_address.address_2
        : formData.billing_address.address_2,
      shippingCity: useShippingAddress
        ? formData.shipping_address.city
        : formData.billing_address.city,
      shippingState: useShippingAddress
        ? formData.shipping_address.state
        : formData.billing_address.state,
      shippingPostCode: useShippingAddress
        ? formData.shipping_address.postcode
        : formData.billing_address.postcode,
      shippingCountry: useShippingAddress
        ? formData.shipping_address.country
        : formData.billing_address.country || "CA",
      shippingPhone: useShippingAddress
        ? formData.shipping_address.phone
        : formData.billing_address.phone,

      discreet:
        formData.extensions["checkout-fields-for-blocks"]._meta_discreet,
      toMailBox:
        formData.extensions["checkout-fields-for-blocks"]._meta_mail_box,
      customerNotes: formData.customer_note,

      // Wallet payments never use a saved card or raw card fields — Stripe
      // hands us the payment method from the wallet.
      cardNumber: "",
      cardType: "",
      cardExpMonth: "",
      cardExpYear: "",
      cardCVD: "",
      savedCardToken: null,
      savedCardId: null,
      useSavedCard: false,
      useStripe: true,

      totalAmount:
        cartItems.totals && cartItems.totals.total_price
          ? parseFloat(cartItems.totals.total_price) / 100
          : cartItems.totals && cartItems.totals.total
            ? parseFloat(cartItems.totals.total.replace(/[^0-9.]/g, ""))
            : 0,

      isEdFlow: isEdFlow,
      awin_awc: awinAwc || "",
      awin_channel: awinChannel || "other",
      source_attribution: buildSourceAttributionPayload(),
      cartItems: cartItems?.items || [],
      appliedCoupons: cartItems?.coupons || [],
    };
  };

  // Runs on the wallet tap. Has to be synchronous — Apple Pay only opens its
  // sheet straight off the user's gesture, so no awaits before we resolve.
  // Mirrors the synchronous guards in handleSubmit (form + age + ED/WL state).
  // Returns true to open the wallet sheet, false to cancel it.
  const handleExpressWalletClick = () => {
    if (!stripe || !stripeElements) {
      toast.error("Payment is still loading. Please try again in a moment.");
      return false;
    }

    const validationResult = validateForm({
      billing_address: formData.billing_address,
      shipping_address: formData.shipping_address,
      cardNumber: "dummy", // card fields don't apply to the wallet path
      cardExpMonth: "12",
      cardExpYear: "30",
      cardCVD: "123",
      useSavedCard: false,
    });

    if (!validationResult.isValid) {
      toast.error(
        validationResult.formattedMessage ||
          "Please complete your details above before using express checkout.",
      );
      return false;
    }

    if (ageValidationFailed) {
      setShowAgePopup(true);
      return false;
    }

    if (cartItems?.items) {
      if (hasZonnicProducts(cartItems.items)) {
        const dob = formData.billing_address.date_of_birth;
        if (!dob) {
          // We can't verify age without a fetch (not allowed off the gesture),
          // so send them to the card form which runs the full async check.
          toast.error("Please use the card form below to complete this order.");
          return false;
        }
        if (checkAgeRestriction(dob, 19).blocked) {
          setAgeValidationFailed(true);
          setShowAgePopup(true);
          return false;
        }
      }

      const useShip = formData.shipping_address.ship_to_different_address;
      const stateToCheck =
        (useShip
          ? formData.shipping_address.state
          : formData.billing_address.state) || formData.billing_address.state;

      const restrictedEdItem = cartItems.items.find(isRestrictedEdCartItem);
      if (restrictedEdItem && stateToCheck && isEdStateRestricted(stateToCheck)) {
        setRestrictedProductName(restrictedEdItem.name || "this");
        setShowEdRestrictionPopup(true);
        return false;
      }

      const restrictedWlItem = cartItems.items.find(isRestrictedWlCartItem);
      if (restrictedWlItem && stateToCheck && isWlStateRestricted(stateToCheck)) {
        setRestrictedProductName(restrictedWlItem.name || "this");
        setShowEdRestrictionPopup(true);
        return false;
      }
    }

    return true;
  };

  // Runs after the customer authorizes in the wallet sheet. The gesture rule is
  // already satisfied (the sheet opened off the tap), so we can do async work
  // here. submit() collects the wallet's data (not the empty card field), then
  // we hand off to the same order + payment pipeline the card flow uses.
  const handleExpressWalletConfirm = async () => {
    // Tracks whether we've handed off to the processing modal yet — once we
    // have, processStripePayment owns error display, so we don't also toast.
    let modalShown = false;
    try {
      setSubmitting(true);

      const { error: submitError } = await stripeElements.submit();
      if (submitError) {
        logger.error("Express checkout submit failed:", submitError.message);
        toast.error(
          submitError.message || "Could not complete the wallet payment.",
        );
        setSubmitting(false);
        return;
      }

      const dataToSend = buildWalletCheckoutData();

      logger.log("Creating pending order (express checkout)...");
      const orderResponse = await fetch("/api/create-pending-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      const orderId = orderResult.data.id;
      const orderKey = orderResult.data.order_key;

      let amountInCents = 0;
      const orderTotal = orderResult.data.total;
      if (typeof orderTotal === "string") {
        amountInCents = Math.round(
          parseFloat(orderTotal.replace(/[^0-9.]/g, "")) * 100,
        );
      } else if (typeof orderTotal === "number") {
        amountInCents = Math.round(orderTotal * 100);
      }

      if (amountInCents <= 0) {
        // A $0 order shouldn't reach a wallet, but guard so we never try to
        // charge nothing.
        throw new Error("This order can't be paid with a wallet.");
      }

      setShowPaymentProcessingPopup(true);
      setIsProcessingPayment(true);
      setPaymentError(null);
      modalShown = true;

      await processStripePayment(orderId, orderKey, amountInCents, dataToSend);
    } catch (error) {
      logger.error("❌ Express checkout payment error:", error);
      // processStripePayment shows its own error in the modal. For failures
      // before it runs (submit / order creation) surface a toast instead.
      if (!modalShown) {
        toast.error(error.message || "Wallet payment failed. Please try again.");
      }
      // Don't offer the card-form retry for a wallet failure — it'd validate the
      // empty card fields. Clearing it lets the modal just close so the user can
      // tap the wallet again.
      setRetryPaymentData(null);
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // TK-586: "Place Order button clicked" — fires on every attempt (before
      // validation) so the click-to-success drop-off on /checkout is measurable.
      trackFunnelEvent("checkout_place_order_clicked", {
        clarity: {
          checkout_item_count: cartItems?.items?.length ?? "",
        },
        data: { item_count: cartItems?.items?.length ?? 0 },
      });

      // Validate form data before processing
      // For NEW CARD payments with Stripe Elements, skip card validation
      // (Stripe Elements handles card validation internally)
      const validationResult = validateForm({
        billing_address: formData.billing_address,
        shipping_address: formData.shipping_address,
        cardNumber: selectedCard ? cardNumber : "dummy", // Skip validation for Stripe Elements
        cardExpMonth: selectedCard ? expiry?.split("/")[0] : "12", // Skip validation for Stripe Elements
        cardExpYear: selectedCard ? expiry?.split("/")[1] : "30", // Skip validation for Stripe Elements
        cardCVD: selectedCard ? cvc : "123", // Skip validation for Stripe Elements
        useSavedCard: !!selectedCard,
      });

      if (!validationResult.isValid) {
        logger.log("Form validation failed:", validationResult.errors);
        toast.error(
          validationResult.formattedMessage ||
            "Please check your form data and try again.",
        );
        setSubmitting(false);
        return;
      }

      // Soft address warning: nudge the user but let the order proceed.
      if (validationResult.formattedWarning) {
        logger.log("Form validation warnings:", validationResult.warnings);
        toast.warn(
          `${validationResult.formattedWarning}. Please double-check your address.`,
        );
      }

      logger.log("Form validation passed, proceeding with checkout");

      // Check if age validation has previously failed and prevent order
      if (ageValidationFailed) {
        logger.log("Age validation previously failed, preventing order");
        setSubmitting(false);
        return;
      }

      // Quebec restriction removed - now allowing Quebec users to purchase Zonnic products
      // Age restrictions remain intact below
      if (cartItems && cartItems.items) {
        // const shippingProvince = formData.shipping_address.state;
        // const billingProvince = formData.billing_address.state;

        // const restriction = checkQuebecZonnicRestriction(
        //   cartItems.items,
        //   shippingProvince,
        //   billingProvince
        // );

        // if (restriction.blocked) {
        //   setShowQuebecPopup(true);
        //   setSubmitting(false);
        //   return;
        // }

        // Check age restriction for Zonnic products
        if (hasZonnicProducts(cartItems.items)) {
          // First check form data (user might have changed date of birth)
          let dateOfBirthToCheck = formData.billing_address.date_of_birth;

          // If no form data, fall back to profile API
          if (!dateOfBirthToCheck) {
            try {
              const response = await fetch("/api/profile");
              if (response.ok) {
                const profileData = await response.json();
                if (profileData.success && profileData.date_of_birth) {
                  dateOfBirthToCheck = profileData.date_of_birth;
                }
              }
            } catch (error) {
              logger.log(
                "Could not fetch user profile for age validation:",
                error,
              );
            }
          }

          // Now validate the date of birth
          if (dateOfBirthToCheck) {
            logger.log("Checking age validation for date:", dateOfBirthToCheck);
            const ageCheck = checkAgeRestriction(dateOfBirthToCheck, 19);
            logger.log("Age validation result:", ageCheck);
            if (ageCheck.blocked) {
              logger.log("User is too young, showing age popup");
              setAgeValidationFailed(true);
              setShowAgePopup(true);
              setSubmitting(false);
              return;
            } else {
              logger.log("User meets age requirement:", ageCheck.age);
              setAgeValidationFailed(false);
            }
          } else {
            logger.log("No date of birth found in form or profile data");
          }
        }

        // Check for product shipping restrictions (ED and WL products)
        const useShippingAddressForCheck =
          formData.shipping_address.ship_to_different_address;
        const shippingState = useShippingAddressForCheck
          ? formData.shipping_address.state
          : formData.billing_address.state;
        const billingState = formData.billing_address.state;
        const stateToCheck = shippingState || billingState;

        // Check for restricted ED products (sildenafil/tadalafil)
        const restrictedEdItem = cartItems.items.find((item) =>
          isRestrictedEdCartItem(item),
        );

        if (
          restrictedEdItem &&
          stateToCheck &&
          isEdStateRestricted(stateToCheck)
        ) {
          logger.log(
            `ED product shipping restricted for state: ${stateToCheck}`,
            restrictedEdItem,
          );
          setRestrictedProductName(restrictedEdItem.name || "this");
          setShowEdRestrictionPopup(true);
          setSubmitting(false);
          return;
        }

        // Check for restricted WL products (Ozempic/Mounjaro/Wegovy/Rybelsus)
        const restrictedWlItem = cartItems.items.find((item) =>
          isRestrictedWlCartItem(item),
        );

        if (
          restrictedWlItem &&
          stateToCheck &&
          isWlStateRestricted(stateToCheck)
        ) {
          logger.log(
            `WL product shipping restricted for state: ${stateToCheck}`,
            restrictedWlItem,
          );
          setRestrictedProductName(restrictedWlItem.name || "this");
          setShowEdRestrictionPopup(true);
          setSubmitting(false);
          return;
        }
      }

      // Check if shipping address fields are empty, if so, use billing address
      const useShippingAddress =
        formData.shipping_address.ship_to_different_address;

      // Create the data object to send
      const { awc: awinAwc, channel: awinChannel } = getAwinFromUrlOrStorage();

      const dataToSend = {
        // Billing Details
        firstName: formData.billing_address.first_name,
        lastName: formData.billing_address.last_name,
        addressOne: formData.billing_address.address_1,
        addressTwo: formData.billing_address.address_2,
        city: formData.billing_address.city,
        state: formData.billing_address.state,
        postcode: formData.billing_address.postcode,
        country: formData.billing_address.country,
        phone: formData.billing_address.phone,
        email: formData.billing_address.email,

        // Shipping Details - use billing address if shipping address is not explicitly specified
        shipToAnotherAddress: useShippingAddress || false,
        shippingFirstName: useShippingAddress
          ? formData.shipping_address.first_name
          : formData.billing_address.first_name,
        shippingLastName: useShippingAddress
          ? formData.shipping_address.last_name
          : formData.billing_address.last_name,
        shippingAddressOne: useShippingAddress
          ? formData.shipping_address.address_1
          : formData.billing_address.address_1,
        shippingAddressTwo: useShippingAddress
          ? formData.shipping_address.address_2
          : formData.billing_address.address_2,
        shippingCity: useShippingAddress
          ? formData.shipping_address.city
          : formData.billing_address.city,
        shippingState: useShippingAddress
          ? formData.shipping_address.state
          : formData.billing_address.state,
        shippingPostCode: useShippingAddress
          ? formData.shipping_address.postcode
          : formData.billing_address.postcode,
        shippingCountry: useShippingAddress
          ? formData.shipping_address.country
          : formData.billing_address.country || "CA",
        shippingPhone: useShippingAddress
          ? formData.shipping_address.phone
          : formData.billing_address.phone,

        // Delivery Details
        discreet:
          formData.extensions["checkout-fields-for-blocks"]._meta_discreet,
        toMailBox:
          formData.extensions["checkout-fields-for-blocks"]._meta_mail_box,
        customerNotes: formData.customer_note,

        // Payment Details
        cardNumber: selectedCard ? "" : cardNumber,
        cardType: selectedCard
          ? ""
          : formData.payment_data.find(
              (d) => d.key === "wc-bambora-credit-card-card-type",
            )?.value,
        cardExpMonth: selectedCard ? "" : expiry.slice(0, 2),
        cardExpYear: selectedCard ? "" : expiry.slice(3),
        cardCVD: selectedCard ? "" : cvc,

        // If using a saved card, include the token and id
        savedCardToken: selectedCard ? selectedCard.token : null,
        savedCardId: selectedCard ? selectedCard.id : null,
        useSavedCard: !!selectedCard,

        // NEW: Use Stripe for new card payments
        useStripe: !selectedCard, // Use Stripe only when NOT using a saved card

        // Add total amount for saved card payments
        totalAmount:
          cartItems.totals && cartItems.totals.total_price
            ? parseFloat(cartItems.totals.total_price) / 100
            : cartItems.totals && cartItems.totals.total
              ? parseFloat(cartItems.totals.total.replace(/[^0-9.]/g, ""))
              : 0,

        // ED Flow parameter
        isEdFlow: isEdFlow,

        // AWIN affiliate metadata (frontend-sourced)
        awin_awc: awinAwc || "",
        awin_channel: awinChannel || "other",

        // Session-scoped marketing source attribution (TK-1026)
        source_attribution: buildSourceAttributionPayload(),

        // OPTIMIZATION: Pass cart items to avoid server-side fetch (saves 500-1000ms)
        cartItems: cartItems?.items || [],
        appliedCoupons: cartItems?.coupons || [],
      };

      // ========================================
      // NOTE: Stripe tokenization happens on BACKEND
      // Frontend Stripe.js doesn't allow raw card data even with API setting enabled
      // Backend Stripe SDK respects the "Raw card data APIs" setting
      // ========================================

      // Enhanced client-side logging
      logger.log("=== PAYMENT METHOD DEBUG ===");
      logger.log("selectedCard:", selectedCard);
      logger.log("useStripe:", !selectedCard);
      logger.log("useSavedCard:", !!selectedCard);
      logger.log("willTokenizeOnBackend:", !selectedCard && !!cardNumber);
      logger.log("===========================");

      logger.log("Client-side checkout data:", {
        ...dataToSend,
        cardNumber: dataToSend.cardNumber ? "[REDACTED]" : "",
        cardCVD: dataToSend.cardCVD ? "[REDACTED]" : "",
        cartTotals: cartItems.totals,
        selectedCardId: selectedCard,
        totalAmount: dataToSend.totalAmount,
      });

      // Legacy WooCommerce-token saved cards used a dedicated charge endpoint.
      // Stripe-native saved cards (from /api/stripe-saved-cards) have no token,
      // so they skip this and flow through the unified Stripe branch below.
      if (selectedCard && selectedCard.token && cartItems.totals) {
        try {
          logger.log(`Processing checkout with saved card: ${selectedCard.id}`);

          let orderId = savedOrderId;
          let orderKey = savedOrderKey;

          // Check if we should use direct payment (retry scenario)
          if (shouldUseDirectPayment && savedOrderId) {
            logger.log(
              `Using direct payment for existing order: ${savedOrderId}`,
            );
          } else {
            // Step 1: Create order without payment processing
            const checkoutResponse = await fetch("/api/create-pending-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToSend),
            });

            const checkoutResult = await checkoutResponse.json();
            logger.log("Order creation result:", checkoutResult);

            // Check if order was created successfully
            if (checkoutResult.success && checkoutResult.data?.id) {
              orderId = checkoutResult.data.id;
              orderKey = checkoutResult.data.order_key || "";
              logger.log(
                `✅ Order created successfully with ID: ${orderId}, checking order amount...`,
              );

              // Check if order is FREE (100% discount)
              let orderAmountInCents = 0;
              const orderTotal = checkoutResult.data.total;

              if (typeof orderTotal === "string") {
                const numericTotal = parseFloat(
                  orderTotal.replace(/[^0-9.]/g, ""),
                );
                orderAmountInCents = Math.round(numericTotal * 100);
              } else if (typeof orderTotal === "number") {
                orderAmountInCents = Math.round(orderTotal * 100);
              }

              // Handle FREE orders (100% discount, total is $0)
              if (orderAmountInCents <= 0) {
                logger.log(
                  "✅ FREE ORDER detected (100% discount applied) - saved card flow",
                );

                // Show payment processing modal
                setShowPaymentProcessingPopup(true);
                setIsProcessingPayment(true);
                setPaymentError(null);

                // Hide payment processing modal and show success
                setIsProcessingPayment(false);
                setShowPaymentProcessingPopup(false);
                setPaymentError(null);

                // Show success toast
                toast.success("Order placed successfully!");

                // ========================================
                // ASYNC: Update order status (non-blocking)
                // ========================================
                fetch("/api/update-order-status", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    orderId,
                    status: "processing",
                    paymentMethod: "free_order",
                    errorMessage: "Free order - 100% discount applied",
                  }),
                })
                  .then((updateResponse) => updateResponse.json())
                  .then((updateResult) => {
                    if (updateResult.success) {
                      logger.log(
                        "✅ Free order status updated successfully (async)",
                      );
                    } else {
                      logger.warn(
                        "Failed to update free order status (async):",
                        updateResult.error,
                      );
                    }
                  })
                  .catch((updateError) => {
                    logger.error(
                      "Error updating free order status (async):",
                      updateError,
                    );
                  });

                // ========================================
                // ASYNC: Update customer profile in WooCommerce (non-blocking)
                // ========================================
                (async () => {
                  try {
                    logger.log(
                      "Updating customer profile for free order - saved card flow (async)...",
                    );
                    const useShippingAddress =
                      formData.shipping_address.ship_to_different_address;

                    const billingAddress = {
                      first_name: formData.billing_address.first_name || "",
                      last_name: formData.billing_address.last_name || "",
                      company: formData.billing_address.company || "",
                      address_1: formData.billing_address.address_1 || "",
                      address_2: formData.billing_address.address_2 || "",
                      city: formData.billing_address.city || "",
                      state: formData.billing_address.state || "",
                      postcode: formData.billing_address.postcode || "",
                      country: formData.billing_address.country || "US",
                      email: formData.billing_address.email || "",
                      phone: formData.billing_address.phone || "",
                    };

                    const shippingAddress = useShippingAddress
                      ? {
                          first_name:
                            formData.shipping_address.first_name || "",
                          last_name: formData.shipping_address.last_name || "",
                          company: formData.shipping_address.company || "",
                          address_1: formData.shipping_address.address_1 || "",
                          address_2: formData.shipping_address.address_2 || "",
                          city: formData.shipping_address.city || "",
                          state: formData.shipping_address.state || "",
                          postcode: formData.shipping_address.postcode || "",
                          country: formData.shipping_address.country || "US",
                          phone: formData.shipping_address.phone || "",
                        }
                      : { ...billingAddress };

                    const profileData = {
                      billing_address: billingAddress,
                      shipping_address: shippingAddress,
                      date_of_birth:
                        formData.billing_address.date_of_birth ||
                        formData.date_of_birth ||
                        "",
                    };

                    const profileUpdateResponse = await fetch(
                      "/api/update-customer-profile",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(profileData),
                      },
                    );

                    const profileUpdateResult =
                      await profileUpdateResponse.json();

                    if (
                      profileUpdateResponse.ok &&
                      profileUpdateResult.success
                    ) {
                      logger.log(
                        "✅ Customer profile updated for free order - saved card flow (async)",
                      );
                    } else {
                      logger.error(
                        "❌ Failed to update customer profile for free order:",
                        profileUpdateResult.error,
                      );
                    }
                  } catch (profileError) {
                    logger.error(
                      "❌ Error updating customer profile for free order:",
                      profileError,
                    );
                  }
                })();

                // Empty cart
                try {
                  const { emptyCart } = await import("@/lib/cart/cartService");
                  await emptyCart();
                  logger.log("Cart emptied successfully");
                } catch (error) {
                  logger.error("Error emptying cart:", error);
                }

                // Redirect to success page immediately (non-blocking)
                router.push(
                  `/checkout/order-received/${orderId}?key=${orderKey}${buildFlowQueryString()}`,
                );
                return;
              }

              logger.log(
                "Order has payment amount, proceeding with saved card payment...",
              );

              // Before processing payment, check the order status to avoid duplicate payments
              try {
                const orderCheckResponse = await fetch(
                  `/api/order/status?id=${orderId}`,
                );
                const orderStatus = await orderCheckResponse.json();

                if (
                  isSuccessfulOrderStatus(orderStatus.status) ||
                  orderStatus.success === false
                ) {
                  logger.log(
                    "Order is already paid or being processed, skipping payment",
                  );
                  toast.success("Order is already being processed!");

                  // Redirect to order received page
                  router.push(
                    `/checkout/order-received/${orderId}?key=${orderKey}${buildFlowQueryString()}`,
                  );
                  return;
                } else if (orderStatus.status === "failed") {
                  logger.log("Order payment failed, allowing retry");
                  // Continue with payment to retry
                }
              } catch (orderCheckError) {
                logger.log("Error checking order status:", orderCheckError);
                // Continue with payment if we can't check the status
              }
            } else if (checkoutResult.error) {
              // Something else went wrong
              toast.error(checkoutResult.error || "Failed to create order");
              setSubmitting(false);
              return;
            }
          }

          // Step 2: Process the payment with the saved card
          const paymentResponse = await fetch(
            "/api/pay-order-with-saved-card",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: orderId,
                savedCardToken: selectedCard.token,
                cardId: selectedCard.id,
                cvv: "",
                // Include billing address for address verification
                billing_address: {
                  first_name: formData.billing_address.first_name,
                  last_name: formData.billing_address.last_name,
                  address_1: formData.billing_address.address_1,
                  address_2: formData.billing_address.address_2 || "",
                  city: formData.billing_address.city,
                  state: formData.billing_address.state,
                  postcode: formData.billing_address.postcode,
                  country: formData.billing_address.country || "US",
                  email: formData.billing_address.email,
                  phone: formData.billing_address.phone,
                },
              }),
            },
          );

          // Use centralized payment response handler
          const paymentResult = await handlePaymentResponse(
            paymentResponse,
            orderId,
            orderKey,
          );
          logger.log("Payment result:", paymentResult);

          if (!paymentResult.success) {
            // Store order details for retry mechanism
            setSavedOrderId(orderId);
            setSavedOrderKey(orderKey);
            setShouldUseDirectPayment(true);

            // Transform the error message if it's a WordPress critical error
            const errorMessage =
              paymentResult.message ||
              "Payment failed. Please try another payment method.";

            // Extract meaningful error message from complex objects
            let errorString;
            if (typeof errorMessage === "string") {
              errorString = errorMessage;
            } else if (errorMessage && typeof errorMessage === "object") {
              // Try to extract meaningful message from object
              errorString =
                errorMessage.message ||
                errorMessage.error?.message ||
                errorMessage.toString();
            } else {
              errorString = String(errorMessage || "Unknown error occurred");
            }

            const userFriendlyMessage = isWordPressCriticalError(errorString)
              ? transformPaymentError(errorString)
              : errorString;

            toast.error(userFriendlyMessage);
            setSubmitting(false);
            return;
          }

          // Successfully created order and processed payment
          // Reset retry mechanism state on success
          setShouldUseDirectPayment(false);
          setSavedOrderId("");
          setSavedOrderKey("");

          toast.success("Order created and payment processed successfully!");

          // ========================================
          // ASYNC: Update customer data AFTER payment success (non-blocking)
          // These updates happen in the background and don't block user flow
          // ========================================
          (async () => {
            try {
              logger.log(
                "Updating customer data asynchronously (non-blocking)...",
              );
              const useShippingAddress =
                formData.shipping_address.ship_to_different_address;

              const customerUpdateData = {
                billing_address: {
                  first_name: formData.billing_address.first_name || "",
                  last_name: formData.billing_address.last_name || "",
                  company: formData.billing_address.company || "",
                  address_1: formData.billing_address.address_1 || "",
                  address_2: formData.billing_address.address_2 || "",
                  city: formData.billing_address.city || "",
                  state: formData.billing_address.state || "",
                  postcode: formData.billing_address.postcode || "",
                  country: formData.billing_address.country || "US",
                  email: formData.billing_address.email || "",
                  phone: formData.billing_address.phone || "",
                },
                shipping_address: useShippingAddress
                  ? {
                      first_name: formData.shipping_address.first_name || "",
                      last_name: formData.shipping_address.last_name || "",
                      company: formData.shipping_address.company || "",
                      address_1: formData.shipping_address.address_1 || "",
                      address_2: formData.shipping_address.address_2 || "",
                      city: formData.shipping_address.city || "",
                      state: formData.shipping_address.state || "",
                      postcode: formData.shipping_address.postcode || "",
                      country: formData.shipping_address.country || "US",
                      phone: formData.shipping_address.phone || "",
                    }
                  : {
                      first_name: formData.billing_address.first_name || "",
                      last_name: formData.billing_address.last_name || "",
                      company: formData.billing_address.company || "",
                      address_1: formData.billing_address.address_1 || "",
                      address_2: formData.billing_address.address_2 || "",
                      city: formData.billing_address.city || "",
                      state: formData.billing_address.state || "",
                      postcode: formData.billing_address.postcode || "",
                      country: formData.billing_address.country || "US",
                      phone: formData.billing_address.phone || "",
                    },
              };

              const updateResponse = await fetch("/api/cart/update-customer", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(customerUpdateData),
              });

              const updateResult = await updateResponse.json();

              if (updateResponse.ok && !updateResult.error) {
                logger.log(
                  "✅ Customer cart data updated successfully (async)",
                );

                // Also update the customer's permanent profile in WooCommerce
                try {
                  logger.log(
                    "Updating customer profile permanently (async)...",
                  );

                  // Include date_of_birth in the profile update
                  const profileData = {
                    ...customerUpdateData,
                    date_of_birth:
                      formData.billing_address.date_of_birth ||
                      formData.date_of_birth ||
                      "",
                  };

                  const profileUpdateResponse = await fetch(
                    "/api/update-customer-profile",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(profileData),
                    },
                  );

                  const profileUpdateResult =
                    await profileUpdateResponse.json();

                  if (profileUpdateResponse.ok && profileUpdateResult.success) {
                    logger.log(
                      "✅ Customer profile updated permanently (async) ✓",
                    );
                  } else {
                    logger.warn(
                      "Failed to update customer profile (async):",
                      profileUpdateResult.error,
                    );
                  }
                } catch (profileError) {
                  logger.error(
                    "Error updating customer profile (async):",
                    profileError,
                  );
                }
              } else {
                logger.warn(
                  "Failed to update customer data (async):",
                  updateResult.error,
                );
              }
            } catch (error) {
              logger.error("Error updating customer data (async):", error);
            }
          })(); // End of async IIFE - fire and forget

          // Get the order ID and key from the payment result
          const paymentOrderId = paymentResult.order_id;
          const paymentOrderKey = paymentResult.order_key || "";

          // Empty the cart after successful checkout
          try {
            logger.log("Emptying cart after successful checkout...");
            const { emptyCart } = await import("@/lib/cart/cartService");
            await emptyCart();
            logger.log("Cart emptied successfully after checkout");
          } catch (emptyError) {
            logger.error("Error emptying cart after checkout:", emptyError);
            // Don't block the redirect if cart emptying fails
          }

          // Debugging logs
          logger.log(
            `Redirecting to order received page: /checkout/order-received/${paymentOrderId}?key=${paymentOrderKey}`,
          );

          // Redirect to order received page with the correct order details
          router.push(
            `/checkout/order-received/${paymentOrderId}?key=${paymentOrderKey}${buildFlowQueryString()}`,
          );
          return;
        } catch (error) {
          logger.error("Error processing order with saved card:", error);
          // Transform the error message if it's a WordPress critical error
          const errorMessage =
            error.message ||
            "Unable to process payment with saved card. Please try another payment method.";

          // Extract meaningful error message from complex objects
          let errorString;
          if (typeof errorMessage === "string") {
            errorString = errorMessage;
          } else if (errorMessage && typeof errorMessage === "object") {
            // Try to extract meaningful message from object
            errorString =
              errorMessage.message ||
              errorMessage.error?.message ||
              errorMessage.toString();
          } else {
            errorString = String(errorMessage || "Unknown error occurred");
          }

          const userFriendlyMessage = isWordPressCriticalError(errorString)
            ? transformPaymentError(errorString)
            : errorString;

          toast.error(userFriendlyMessage);
          setSubmitting(false);
          return;
        }
      }

      // For NEW CARD payments with Stripe Elements (embedded in form)
      if (selectedCard || dataToSend.useStripe) {
        try {
          logger.log("Processing Stripe payment...");

          if (!stripe) {
            toast.error(
              "Payment system is not loaded. Please refresh and try again.",
            );
            setSubmitting(false);
            return;
          }

          // New cards validate + tokenize via the Payment Element. A saved card
          // already has a payment method, so skip the element validation.
          if (!selectedCard) {
            if (!stripeElements) {
              toast.error(
                "Payment form is not ready. Please wait and try again.",
              );
              setSubmitting(false);
              return;
            }

            // Validate that card details are entered before creating order
            logger.log("Validating card details are entered...");
            const { error: submitError } = await stripeElements.submit();

            if (submitError) {
              // Card validation failed - DO NOT create order
              logger.error(
                "Card validation failed - no order created:",
                submitError.message,
              );
              toast.error(
                submitError.message || "Please enter valid card details.",
              );
              setSubmitting(false);
              return;
            }

            logger.log(
              "✅ Card details validated - proceeding with order creation",
            );
          }

          // Step 1: Create pending order (card details are validated)
          logger.log("Creating pending order...");
          const orderResponse = await fetch("/api/create-pending-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
          });

          const orderResult = await orderResponse.json();

          if (!orderResult.success) {
            // Don't show popup if order creation fails
            setShowPaymentProcessingPopup(false);
            throw new Error(orderResult.error || "Failed to create order");
          }

          const orderId = orderResult.data.id;
          const orderKey = orderResult.data.order_key;
          logger.log("✅ Pending order created:", orderId);

          // Show payment processing modal after successful order creation
          setShowPaymentProcessingPopup(true);
          setIsProcessingPayment(true);
          setPaymentError(null);

          // Parse amount
          let amountInCents = 0;
          const orderTotal = orderResult.data.total;

          if (typeof orderTotal === "string") {
            const numericTotal = parseFloat(orderTotal.replace(/[^0-9.]/g, ""));
            amountInCents = Math.round(numericTotal * 100);
          } else if (typeof orderTotal === "number") {
            amountInCents = Math.round(orderTotal * 100);
          }

          logger.log("Order amount in cents:", amountInCents);

          // Handle FREE orders (100% discount, total is $0)
          if (amountInCents <= 0) {
            logger.log("✅ FREE ORDER detected (100% discount applied)");

            // Hide payment processing modal and show success
            setIsProcessingPayment(false);
            setShowPaymentProcessingPopup(false);
            setPaymentError(null);

            // Show success toast
            toast.success("Order placed successfully!");

            // ========================================
            // ASYNC: Update order status (non-blocking)
            // ========================================
            fetch("/api/update-order-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                status: "processing",
                paymentMethod: "free_order",
                errorMessage: "Free order - 100% discount applied",
              }),
            })
              .then((updateResponse) => updateResponse.json())
              .then((updateResult) => {
                if (updateResult.success) {
                  logger.log(
                    "✅ Free order status updated successfully (async)",
                  );
                } else {
                  logger.warn(
                    "Failed to update free order status (async):",
                    updateResult.error,
                  );
                }
              })
              .catch((updateError) => {
                logger.error(
                  "Error updating free order status (async):",
                  updateError,
                );
              });

            // ========================================
            // ASYNC: Update customer profile in WooCommerce (non-blocking)
            // ========================================
            (async () => {
              try {
                logger.log(
                  "Updating customer profile for free order (async)...",
                );
                const useShippingAddress =
                  formData.shipping_address.ship_to_different_address;

                const billingAddress = {
                  first_name: formData.billing_address.first_name || "",
                  last_name: formData.billing_address.last_name || "",
                  company: formData.billing_address.company || "",
                  address_1: formData.billing_address.address_1 || "",
                  address_2: formData.billing_address.address_2 || "",
                  city: formData.billing_address.city || "",
                  state: formData.billing_address.state || "",
                  postcode: formData.billing_address.postcode || "",
                  country: formData.billing_address.country || "US",
                  email: formData.billing_address.email || "",
                  phone: formData.billing_address.phone || "",
                };

                const shippingAddress = useShippingAddress
                  ? {
                      first_name: formData.shipping_address.first_name || "",
                      last_name: formData.shipping_address.last_name || "",
                      company: formData.shipping_address.company || "",
                      address_1: formData.shipping_address.address_1 || "",
                      address_2: formData.shipping_address.address_2 || "",
                      city: formData.shipping_address.city || "",
                      state: formData.shipping_address.state || "",
                      postcode: formData.shipping_address.postcode || "",
                      country: formData.shipping_address.country || "US",
                      phone: formData.shipping_address.phone || "",
                    }
                  : { ...billingAddress };

                const profileData = {
                  billing_address: billingAddress,
                  shipping_address: shippingAddress,
                  date_of_birth:
                    formData.billing_address.date_of_birth ||
                    formData.date_of_birth ||
                    "",
                };

                const profileUpdateResponse = await fetch(
                  "/api/update-customer-profile",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profileData),
                  },
                );

                const profileUpdateResult = await profileUpdateResponse.json();

                if (profileUpdateResponse.ok && profileUpdateResult.success) {
                  logger.log(
                    "✅ Customer profile updated for free order (async)",
                  );
                } else {
                  logger.error(
                    "❌ Failed to update customer profile for free order:",
                    profileUpdateResult.error,
                  );
                }
              } catch (profileError) {
                logger.error(
                  "❌ Error updating customer profile for free order:",
                  profileError,
                );
              }
            })();

            // Empty cart
            try {
              const { emptyCart } = await import("@/lib/cart/cartService");
              await emptyCart();
              logger.log("Cart emptied successfully");
            } catch (error) {
              logger.error("Error emptying cart:", error);
            }

            // Redirect to success page immediately (non-blocking)
            router.push(
              `/checkout/order-received/${orderId}?key=${orderKey}${buildFlowQueryString()}`,
            );
            return;
          }

          // Process payment using reusable function. Pass the saved card's
          // Stripe payment-method id when one is selected; new cards tokenize
          // inside processStripePayment.
          await processStripePayment(
            orderId,
            orderKey,
            amountInCents,
            dataToSend,
            selectedCard?.id || null,
          );
          return;
        } catch (error) {
          logger.error("❌ Stripe payment error:", error);
          // Error is already handled in processStripePayment
          return;
        }
      }

      // Continue with WooCommerce Store API checkout (for Bambora or non-Stripe payments)
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      // Use centralized payment response handler for regular checkout
      // Note: For regular checkout, we don't have an orderId yet, so pass null
      const data = await handlePaymentResponse(res, null);

      if (data.error) {
        // Extract meaningful error message from complex objects
        let errorString;
        if (typeof data.error === "string") {
          errorString = data.error;
        } else if (data.error && typeof data.error === "object") {
          // Try to extract meaningful message from object
          errorString =
            data.error.message ||
            data.error.error?.message ||
            data.error.toString();
        } else {
          errorString = String(data.error || "Unknown error occurred");
        }

        // Transform the error message if it's a WordPress critical error
        const userFriendlyMessage = isWordPressCriticalError(errorString)
          ? transformPaymentError(errorString)
          : errorString;

        toast.error(userFriendlyMessage);
        // Reload the page after showing error for new card payments
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2000); // Wait 2 seconds to show the error message
        return;
      }

      if (data.success) {
        toast.success("Order created successfully!");
        const order_id = data.data.id || data.data.order_id;
        const order_key = data.data.order_key || "";

        // Empty the cart after successful checkout
        try {
          logger.log("Emptying cart after successful checkout...");
          const { emptyCart } = await import("@/lib/cart/cartService");
          await emptyCart();
          logger.log("Cart emptied successfully after checkout");
        } catch (emptyError) {
          logger.error("Error emptying cart after checkout:", emptyError);
          // Don't block the redirect if cart emptying fails
        }

        router.push(
          `/checkout/order-received/${order_id}?key=${order_key}${
            buildFlowQueryString() ? buildFlowQueryString() : ""
          }`,
        );
      }
    } catch (error) {
      logger.error("Checkout Error:", error);

      // Transform the error message if it's a WordPress critical error
      const errorMessage =
        error.message ||
        "There was an error processing your order. Please try again.";

      // Extract meaningful error message from complex objects
      let errorString;
      if (typeof errorMessage === "string") {
        errorString = errorMessage;
      } else if (errorMessage && typeof errorMessage === "object") {
        // Try to extract meaningful message from object
        errorString =
          errorMessage.message ||
          errorMessage.error?.message ||
          errorMessage.toString();
      } else {
        errorString = String(errorMessage || "Unknown error occurred");
      }

      const userFriendlyMessage = isWordPressCriticalError(errorString)
        ? transformPaymentError(errorString)
        : errorString; // Use the actual error message, not the generic fallback

      toast.error(userFriendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading indicator if cart is not yet loaded or URL parameters are being processed
  // ---- TK-586: per-section Clarity smart events ------------------------
  // /checkout is PHI-blocked from heatmaps (data-hm-ignore), so named smart
  // events are the only way to segment the load-then-leave rate by section.

  // Section "viewed" — IntersectionObserver on the section anchors. Each fires
  // once when it scrolls into view. Runs after the real form renders (gated on
  // cartItems) since the skeleton above returns before these anchors exist.
  const sectionViewFiredRef = useRef({});
  useEffect(() => {
    if (!cartItems || isProcessingUrlParams) return;
    if (typeof IntersectionObserver === "undefined") return;

    const sections = [
      { id: "checkout-section-contact", event: "checkout_contact_viewed" },
      { id: "checkout-section-payment", event: "checkout_payment_viewed" },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => s.id === entry.target.id);
          if (!match || sectionViewFiredRef.current[match.event]) return;
          sectionViewFiredRef.current[match.event] = true;
          trackFunnelEvent(match.event);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [cartItems, isProcessingUrlParams]);

  // Section "completed" — derived from form state. Contact = identity fields,
  // shipping = the delivery address fields (billing address is the default
  // ship-to), payment = Stripe element valid. Each fires once.
  const contactCompleteRef = useRef(false);
  const shippingCompleteRef = useRef(false);
  const paymentCompleteRef = useRef(false);

  useEffect(() => {
    const b = formData?.billing_address || {};
    const contactDone =
      b.first_name && b.last_name && b.phone && b.date_of_birth;
    if (contactDone) {
      trackFunnelEventOnce(contactCompleteRef, "checkout_contact_completed");
    }
    const addressDone = b.address_1 && b.city && b.state && b.postcode;
    if (addressDone) {
      trackFunnelEventOnce(shippingCompleteRef, "checkout_shipping_completed");
    }
  }, [formData]);

  useEffect(() => {
    if (isPaymentValid) {
      trackFunnelEventOnce(paymentCompleteRef, "checkout_payment_completed");
    }
  }, [isPaymentValid]);

  if (!cartItems || isProcessingUrlParams) {
    return <CheckoutSkeleton />;
  }

  const billingShippingProps = {
    setFormData,
    formData,
    onProvinceChange: handleProvinceChange,
    cartItems,
    isUpdatingShipping,
    onAgeValidation: () => {
      setShowAgePopup(true);
      setAgeValidationFailed(true);
    },
    onAgeValidationReset: () => setAgeValidationFailed(false),
  };

  const cartPaymentProps = {
    items: cartItems.items,
    cartItems,
    setCartItems,
    setFormData,
    formData,
    handleSubmit,
    cardNumber,
    isUpdatingShipping,
    setCardNumber,
    expiry,
    setExpiry,
    cvc,
    setCvc,
    cardType,
    setCardType,
    isEdFlow,
    savedCards,
    setSavedCards,
    selectedCard,
    setSelectedCard,
    isLoadingSavedCards,
    ageValidationFailed,
    isPaymentValid,
    paymentValidationMessage,
    onStripeReady: setStripeElements,
    onWalletClick: handleExpressWalletClick,
    onWalletConfirm: handleExpressWalletConfirm,
  };

  return (
    <>
      <QuestionnaireNavbar />
      {isGlp2CheckoutLayout ? (
        <div className="min-h-[calc(100vh-100px)] w-full overflow-x-hidden bg-[#f7f7f7]  border-t max-w-full">
          {submitting && <Loader />}
          <div className="max-w-[620px] mx-auto w-full px-3 sm:px-4 pt-5 md:pt-6 pb-40">
            <div className="pb-4">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/glp2-pre-consultation";
                  }
                }}
                className="flex gap-2 items-center cursor-pointer w-fit text-[#003b5c]"
              >
                <span className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#003b5c]/20 bg-white flex items-center justify-center shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M15 7L10 12L15 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-600 text-center mb-3">
              This transaction is a pre-authorization. <br /> Your card is only
              charged if your prescription is approved.
            </p>
            <Glp2TreatmentCheckoutSummary
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
            <BillingAndShipping {...billingShippingProps} variant="glp2" />
            <CartAndPayment {...cartPaymentProps} layoutVariant="glp2" />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-100px)] border-t overflow-hidden max-w-full">
          {submitting && <Loader />}
          <BillingAndShipping {...billingShippingProps} />
          <CartAndPayment {...cartPaymentProps} />
        </div>
      )}

      {/* Quebec Restriction Popup */}
      <QuebecRestrictionPopup
        isOpen={showQuebecPopup}
        onClose={() => setShowQuebecPopup(false)}
        message={getQuebecRestrictionMessage()}
      />

      {/* Age Restriction Popup */}
      <AgeRestrictionPopup
        isOpen={showAgePopup}
        onClose={() => {
          setShowAgePopup(false);
          // Don't reset ageValidationFailed here - it should only reset when user enters valid age
        }}
        message="Sorry, you must be at least 19 years old to purchase this product."
      />

      {/* ED Product Shipping Restriction Popup */}
      <ProductNotAvailablePopup
        isOpen={showEdRestrictionPopup}
        onClose={() => setShowEdRestrictionPopup(false)}
        productName={restrictedProductName}
      />

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={showPaymentProcessingPopup}
        onClose={() => {
          setShowPaymentProcessingPopup(false);
          setPaymentError(null);
          setIsProcessingPayment(false);
          setSubmitting(false);
        }}
        isProcessing={isProcessingPayment}
        error={paymentError}
        onRetry={async () => {
          // Retry payment processing if we have retry data
          if (retryPaymentData && stripe && stripeElements) {
            try {
              logger.log("🔄 Retrying payment...");

              // submit() has to run here, off the actual click, so Apple Pay can
              // open its sheet. processStripePayment doesn't do it for us.
              // Skip it for a saved card — there's no Payment Element to validate.
              if (!retryPaymentData.savedPaymentMethodId) {
                const { error: submitError } = await stripeElements.submit();
                if (submitError) {
                  logger.error(
                    "Card validation failed on retry:",
                    submitError.message,
                  );
                  setPaymentError(
                    submitError.message || "Please enter valid card details.",
                  );
                  setIsProcessingPayment(false);
                  setSubmitting(false);
                  return;
                }
              }

              // Clear error and show processing state
              setPaymentError(null);
              setIsProcessingPayment(true);
              setSubmitting(true);

              // Retry payment processing
              await processStripePayment(
                retryPaymentData.orderId,
                retryPaymentData.orderKey,
                retryPaymentData.amountInCents,
                retryPaymentData.dataToSend,
                retryPaymentData.savedPaymentMethodId || null,
              );
            } catch (error) {
              // Error is already handled in processStripePayment
              logger.error("❌ Retry failed:", error);
            }
          } else {
            // No retry data available - close modal and let user try from form
            logger.warn("No retry data available, closing modal");
            setPaymentError(null);
            setIsProcessingPayment(false);
            setShowPaymentProcessingPopup(false);
            setSubmitting(false);
          }
        }}
      />
    </>
  );
};

export default CheckoutPageWrapper;
