"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { logger } from "@/utils/devLogger";
import { formatPriceUI } from "@/utils/priceFormatter";

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Card Element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true, // We already collect this in billing address
};

// Payment Form Component
function PaymentForm({ orderId, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Get CardElement
      const cardElement = elements.getElement(CardElement);

      // Create PaymentMethod
      logger.log("Creating Stripe PaymentMethod...");
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        logger.error("Stripe PaymentMethod error:", error);
        toast.error(error.message);
        if (onError) onError(error);
        setProcessing(false);
        return;
      }

      logger.log("PaymentMethod created:", paymentMethod.id);

      // Process payment on backend
      const response = await fetch("/api/process-stripe-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentMethodId: paymentMethod.id,
          amount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Payment failed");
      }

      logger.log("Payment successful:", result);

      // Update order status
      const updateResponse = await fetch("/api/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "on-hold", // For manual capture
          paymentIntentId: result.paymentIntentId,
          chargeId: result.chargeId,
          paymentMethod: "stripe_cc",
          cardBrand: paymentMethod.card?.brand,
          cardLast4: paymentMethod.card?.last4,
        }),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok || !updateResult.success) {
        throw new Error("Failed to update order status");
      }

      logger.log("Order updated successfully");
      toast.success("Payment successful!");

      if (onSuccess) {
        onSuccess(updateResult.order);
      }
    } catch (err) {
      logger.error("Payment error:", err);
      toast.error(err.message || "Payment failed. Please try again.");
      if (onError) onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="card-element-container">
        <label className="card-element-label">Card Details</label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="submit-payment-btn"
      >
        {processing ? "Processing..." : `Pay $${formatPriceUI(amount / 100)}`}
      </button>

      <style jsx>{`
        .stripe-payment-form {
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-element-container {
          margin-bottom: 20px;
        }

        .card-element-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #32325d;
        }

        .card-element-container :global(.StripeElement) {
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
        }

        .card-element-container :global(.StripeElement--focus) {
          border-color: #5469d4;
          box-shadow: 0 0 0 1px #5469d4;
        }

        .card-element-container :global(.StripeElement--invalid) {
          border-color: #fa755a;
        }

        .submit-payment-btn {
          width: 100%;
          padding: 12px;
          background: #5469d4;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-payment-btn:hover:not(:disabled) {
          background: #3f51b5;
        }

        .submit-payment-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}

// Main Component with Elements Provider
export default function StripeElementsPayment({
  orderId,
  amount,
  onSuccess,
  onError,
}) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
