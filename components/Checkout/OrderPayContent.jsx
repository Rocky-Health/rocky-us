"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { logger } from "@/utils/devLogger";
import { newPaymentAttemptId } from "@/utils/paymentAttemptId";
import { formatPriceUI } from "@/utils/priceFormatter";
import {
  transformPaymentError,
  isWordPressCriticalError,
} from "@/utils/paymentErrorHandler";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import Payment from "./Payment";
import Loader from "@/components/Loader";
import CheckoutSkeleton from "@/components/ui/skeletons/CheckoutSkeleton";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripeClient";

// Shared singleton so Stripe.js (and shared-ffa.js) loads once app-wide.
const stripePromise = getStripe();

function OrderPayForm({
  orderId,
  orderKey,
  order,
  onSuccess,
  onError,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeElements, setStripeElements] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const billing = order?.billing || {};
  const formData = {
    billing_address: {
      first_name: billing.first_name || "",
      last_name: billing.last_name || "",
      email: billing.email || "",
      phone: billing.phone || "",
      address_1: billing.address_1 || "",
      address_2: billing.address_2 || "",
      city: billing.city || "",
      state: billing.state || "",
      postcode: billing.postcode || "",
      country: billing.country || "US",
    },
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting || !order || !orderKey || !stripe || !elements) return;

      const orderTotal = parseFloat(order.total) || 0;
      if (orderTotal <= 0) {
        toast.info("This order has no amount to pay.");
        return;
      }

      setSubmitting(true);
      try {
        if (!stripeElements) {
          toast.error("Payment form is not ready. Please wait and try again.");
          setSubmitting(false);
          return;
        }

        const { error: submitError } = await stripeElements.submit();
        if (submitError) {
          toast.error(submitError.message || "Please complete your payment details.");
          setSubmitting(false);
          return;
        }

        const billingDetails = {
          name: [billing.first_name, billing.last_name].filter(Boolean).join(" ").trim(),
          email: billing.email || "",
          phone: billing.phone || "",
          address: {
            line1: billing.address_1 || "",
            line2: billing.address_2 || "",
            city: billing.city || "",
            state: billing.state || "",
            postal_code: billing.postcode || "",
            country: (billing.country || "US").toUpperCase(),
          },
        };

        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          elements: stripeElements,
          params: { billing_details: billingDetails },
        });

        if (pmError) throw new Error(pmError.message);
        if (!paymentMethod) throw new Error("Failed to create payment method");

        const amountInCents = Math.round(orderTotal * 100);
        const intentResponse = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: amountInCents,
            paymentMethodId: paymentMethod.id,
            customerEmail: billingDetails.email,
            customerName: billingDetails.name,
            paymentAttemptId: newPaymentAttemptId(),
          }),
        });

        const intentResult = await intentResponse.json();
        let paymentIntent = intentResult.paymentIntent;
        let stripeCustomerId = intentResult.stripeCustomerId || null;

        if (intentResult.requiresAction && intentResult.clientSecret) {
          const { error: confirmError, paymentIntent: confirmedIntent } =
            await stripe.confirmPayment({
              elements: stripeElements,
              clientSecret: intentResult.clientSecret,
              confirmParams: {
                return_url: `${window.location.origin}/checkout/order-received/${orderId}?key=${orderKey}`,
              },
              redirect: "if_required",
            });

          if (confirmError) throw new Error(confirmError.message);
          if (!confirmedIntent) throw new Error("Payment authentication incomplete.");
          paymentIntent = confirmedIntent;
        } else if (!intentResult.success) {
          throw new Error(intentResult.error || "Failed to create payment intent");
        }

        if (
          paymentIntent.status !== "requires_capture" &&
          paymentIntent.status !== "succeeded"
        ) {
          throw new Error(`Payment not authorized. Status: ${paymentIntent.status}`);
        }

        const chargeId = paymentIntent?.latest_charge || null;
        const paymentMethodId = paymentIntent?.payment_method || paymentMethod?.id;
        const cardBrand = paymentIntent?.payment_method_details?.card?.brand;
        const cardLast4 = paymentIntent?.payment_method_details?.card?.last4;

        const updateResponse = await fetch("/api/update-order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            status: "on-hold",
            paymentIntentId: paymentIntent?.id,
            chargeId,
            paymentMethodId,
            stripeCustomerId,
            paymentMethod: "stripe_cc",
            currency: (order.currency || "usd").toUpperCase(),
            cardBrand,
            cardLast4,
          }),
        });

        const updateResult = await updateResponse.json();
        if (!updateResponse.ok || !updateResult.success) {
          toast.error(updateResult?.error || "Failed to update order status.");
          setSubmitting(false);
          return;
        }

        toast.success("Payment authorized successfully!");
        onSuccess?.();
        window.location.href = `/checkout/order-received/${orderId}?key=${orderKey}`;
      } catch (err) {
        logger.error("Error processing payment:", err);
        const msg = isWordPressCriticalError(err.message)
          ? transformPaymentError(err.message)
          : err.message || "An error occurred while processing your payment";
        toast.error(msg);
        onError?.(err);
      } finally {
        setSubmitting(false);
      }
    },
    [
      order,
      orderId,
      orderKey,
      billing,
      stripe,
      stripeElements,
      submitting,
      onSuccess,
      onError,
    ]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Payment
        setFormData={() => {}}
        formData={formData}
        onStripeReady={setStripeElements}
      />
      <button
        type="submit"
        disabled={submitting}
        className={`bg-black text-white text-sm font-semibold h-[44px] flex items-center justify-center rounded-full w-full lg:max-w-[512px] mt-6 transition ${
          submitting ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1"
        }`}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Processing Payment...
          </span>
        ) : (
          `Pay ${order?.currency_symbol || "$"}${formatPriceUI(parseFloat(order?.total || 0))}`
        )}
      </button>
      <p className="text-[10px] text-gray-700 mt-4 text-center w-full lg:max-w-[512px]">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

const OrderPayContent = ({ orderId }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderKey, setOrderKey] = useState("");
  const [isSubscriptionRenewal, setIsSubscriptionRenewal] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const key = searchParams.get("key");
    const payForOrder = searchParams.get("pay_for_order");

    if (!key || payForOrder !== "true") {
      setError("Invalid payment link");
      setLoading(false);
      return;
    }
    setOrderKey(key);
    setIsSubscriptionRenewal(searchParams.get("subscription_renewal") === "true");
  }, [searchParams]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !orderKey) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/order?order_id=${orderId}&order_key=${encodeURIComponent(orderKey)}&validate_key=true`
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error || "Failed to load order details");
          setLoading(false);
          return;
        }
        setOrder(data);
      } catch (err) {
        logger.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderKey]);

  if (loading) return <CheckoutSkeleton />;

  if (error) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-white flex items-center justify-center px-4">
          <div className="bg-white rounded-[16px] border border-[#E2E2E1] shadow-sm p-6 md:p-8 max-w-md w-full text-center">
            <h2 className="text-[20px] md:text-[24px] font-[500] text-[#251F20] mb-2">
              Unable to Load Order
            </h2>
            <p className="text-[14px] text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-black text-white text-sm font-semibold h-[44px] flex items-center justify-center rounded-full w-full hover:-translate-y-1 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const orderTotal = parseFloat(order?.total) || 0;
  const currencySymbol = order?.currency_symbol || "$";

  if (orderTotal <= 0) {
    return (
      <div className="min-h-[calc(100vh-100px)] bg-white flex items-center justify-center px-4">
        <div className="bg-white rounded-[16px] border border-[#E2E2E1] shadow-sm p-6 md:p-8 max-w-md w-full text-center">
          <h2 className="text-[20px] md:text-[24px] font-[500] text-[#251F20] mb-2">
            No Payment Required
          </h2>
          <p className="text-[14px] text-gray-600 mb-6">
            This order has no amount to pay.
          </p>
          <button
            onClick={() =>
              router.push(`/checkout/order-received/${orderId}?key=${orderKey}`)
            }
            className="bg-black text-white text-sm font-semibold h-[44px] flex items-center justify-center rounded-full w-full hover:-translate-y-1 transition"
          >
            View Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-100px)] border-t overflow-hidden max-w-full">
        <div className="w-full lg:max-w-[640px] h-full justify-self-end px-4 mt-8 lg:mt-0 lg:pr-[80px] lg:pt-[50px] overflow-x-hidden pb-10">
          <div className="pb-[16px] md:pb-[32px]">
            <button
              onClick={() => router.push("/")}
              className="flex gap-[8px] items-center cursor-pointer w-fit"
            >
              <span className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full border border-[#E2E2E1] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 7L10 12L15 17"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-[14px] font-[500] text-[#212121]">Back to Home</p>
            </button>
          </div>
          <h1 className="text-[24px] md:text-[32px] leading-tight text-[#251F20] font-[450] pb-[16px] border-b border-[#E2E2E1] md:border-none">
            {isSubscriptionRenewal ? "Subscription Renewal" : "Payment"}
          </h1>
          <p className="text-[14px] text-gray-600 mt-2 mb-4">Order #{orderId}</p>
          {order?.status && (
            <p className="text-[12px] text-gray-500 mb-4">
              Status: <span className="capitalize">{order.status}</span>
            </p>
          )}

          <div className="bg-white w-full lg:max-w-[512px] p-4 md:p-6 rounded-[16px] shadow-sm border border-[#E2E2E1]">
            <OrderItemsDisplay order={order} />
            <OrderTotals order={order} />
            <BillingAndShippingInfo order={order} />
          </div>
        </div>

        <div className="bg-[#f7f7f7] h-full justify-self-start w-full px-4 mt-8 lg:mt-0 lg:pl-[80px] lg:pt-[50px] pb-10 overflow-x-hidden">
          <h2 className="hidden lg:block text-[20px] leading-[24px] text-[#251F20] font-[500] mb-[24px]">
            Payment Details
          </h2>
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: Math.round(orderTotal * 100),
              currency: (order?.currency || "usd").toLowerCase(),
              appearance: { theme: "stripe" },
              paymentMethodCreation: "manual",
              paymentMethodTypes: ["card"],
            }}
          >
            <OrderPayForm
              orderId={orderId}
              orderKey={orderKey}
              order={order}
            />
          </Elements>
        </div>
      </div>
    </>
  );
};

function OrderItemsDisplay({ order }) {
  if (!order?.line_items?.length) return null;
  return (
    <div className="w-full">
      {order.line_items.map((item) => (
        <div key={item.id}>
          <OrderItemDisplay item={item} />
          <hr />
        </div>
      ))}
    </div>
  );
}

function OrderItemDisplay({ item }) {
  const itemTotal = item.totals?.line_total != null
    ? item.totals.line_total / 100
    : parseFloat(item.total || 0);
  const currencySymbol = item.prices?.currency_symbol || "$";

  return (
    <div className="flex gap-4 py-4 w-full">
      {item.image?.src && (
        <Image
          width={65}
          height={65}
          src={item.image.src}
          alt={item.name}
          className="rounded-md min-w-[65px] min-h-[65px] object-cover"
        />
      )}
      <div className="text-[14px] font-semibold">
        <h5>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.name) }} />
        </h5>
        <p className="text-[12px]">
          {currencySymbol}
          {formatPriceUI(itemTotal)}
        </p>
        <p className="text-gray-500 mt-1 font-thin text-[12px]">
          Quantity: {item.quantity}
        </p>
      </div>
    </div>
  );
}

function OrderTotals({ order }) {
  if (!order) return null;
  const currencySymbol = order.currency_symbol || "$";
  const subtotal =
    parseFloat(order.total) -
    (parseFloat(order.total_tax) || 0) -
    (parseFloat(order.shipping_total) || 0);

  return (
    <div className="border-t border-[#E2E2E1] pt-4 mt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#212121]">Subtotal</span>
          <span className="font-medium text-[#212121]">
            {currencySymbol}
            {formatPriceUI(subtotal)}
          </span>
        </div>
        {parseFloat(order.shipping_total || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#212121]">Shipping</span>
            <span className="font-medium text-[#212121]">
              {currencySymbol}
              {formatPriceUI(order.shipping_total)}
            </span>
          </div>
        )}
        {parseFloat(order.discount_total || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#212121]">Discount</span>
            <span className="font-medium text-green-600">
              -{currencySymbol}
              {formatPriceUI(order.discount_total)}
            </span>
          </div>
        )}
        {parseFloat(order.total_tax || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#212121]">Tax</span>
            <span className="font-medium text-[#212121]">
              {currencySymbol}
              {formatPriceUI(order.total_tax)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold border-t border-[#E2E2E1] pt-2 mt-2">
          <span className="text-[#212121]">Total</span>
          <span className="text-[#212121]">
            {currencySymbol}
            {formatPriceUI(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function BillingAndShippingInfo({ order }) {
  if (!order) return null;
  const b = order.billing || {};
  const s = order.shipping || {};

  return (
    <div className="border-t border-[#E2E2E1] pt-4 mt-4">
      <h3 className="text-[16px] font-[500] text-[#251F20] mb-4">
        Billing & Shipping Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-[14px] font-[500] text-[#251F20] mb-2">
            Billing Address
          </h4>
          <div className="text-[12px] text-[#212121] space-y-1">
            <p className="font-medium">
              {b.first_name} {b.last_name}
            </p>
            <p>{b.address_1}</p>
            {b.address_2 && <p>{b.address_2}</p>}
            <p>
              {b.city}, {b.state} {b.postcode}
            </p>
            <p>{b.country}</p>
            {b.email && <p className="text-[#AE7E56] font-medium">{b.email}</p>}
            {b.phone && <p className="text-gray-600">{b.phone}</p>}
          </div>
        </div>
        {s?.address_1 && (
          <div>
            <h4 className="text-[14px] font-[500] text-[#251F20] mb-2">
              Shipping Address
            </h4>
            <div className="text-[12px] text-[#212121] space-y-1">
              <p className="font-medium">
                {s.first_name} {s.last_name}
              </p>
              <p>{s.address_1}</p>
              {s.address_2 && <p>{s.address_2}</p>}
              <p>
                {s.city}, {s.state} {s.postcode}
              </p>
              <p>{s.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPayContent;
