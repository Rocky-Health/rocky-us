# Payment Integration Changes Documentation

This document outlines all the payment-related changes made to fix customer ID tracking, payment method saving, and subscription automatic renewals.

## Overview

The changes ensure that:
- ✅ Stripe Customer ID is properly sent to WordPress/WooCommerce
- ✅ Payment method tokens are saved and sent for renewals
- ✅ Payment intent IDs are tracked
- ✅ Payment methods are set as default for customers
- ✅ Subscriptions are configured for automatic renewals instead of manual

---

## Changes Summary

### Files Modified
1. `app/api/create-payment-intent/route.js`
2. `app/api/update-order-status/route.js`
3. `components/Checkout/CheckoutPageContent.jsx`

---

## Change 1: Return Stripe Customer ID from Payment Intent API

**File:** `app/api/create-payment-intent/route.js`

### Purpose
Return the Stripe customer ID in the payment intent response so it can be passed to WordPress.

### Changes Required

**Location:** Around lines 225-252 (in all response cases)

**Before:**
```javascript
return NextResponse.json({
  success: true,
  paymentIntent: paymentIntent,
  chargeId: chargeId,
});
```

**After:**
```javascript
return NextResponse.json({
  success: true,
  paymentIntent: paymentIntent,
  chargeId: chargeId,
  stripeCustomerId: stripeCustomerId || null, // ADD THIS
});
```

**Apply to all three response cases:**
- `requires_capture` (line ~225)
- `requires_action` (line ~234)
- `succeeded` (line ~245)

---

## Change 2: Set Payment Method as Default for Customer

**File:** `app/api/create-payment-intent/route.js`

### Purpose
Set the payment method as the default for the customer in Stripe, which is required for WooCommerce to use it for subscription renewals.

### Changes Required

**Location:** After attaching payment method to customer (around line 165)

**Add this code after `logger.log("✅ Payment method attached to customer successfully");`:**

```javascript
// Set as default payment method for customer (required for WooCommerce renewals)
try {
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
  logger.log("✅ Set payment method as default for customer");
} catch (defaultError) {
  logger.warn(
    "Failed to set default payment method:",
    defaultError.message
  );
  // Continue anyway - not critical for initial payment, but may affect renewals
}
```

**Also update the error handling for already-attached payment methods (around line 184):**

**Before:**
```javascript
if (attachError.code === "resource_already_exists") {
  logger.log("Payment method already attached to a customer");
}
```

**After:**
```javascript
if (attachError.code === "resource_already_exists") {
  logger.log("Payment method already attached to a customer");
  
  // Still try to set as default even if already attached
  try {
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    logger.log("✅ Set existing payment method as default for customer");
  } catch (defaultError) {
    logger.warn(
      "Failed to set default payment method:",
      defaultError.message
    );
  }
}
```

---

## Change 3: Add Customer ID and Payment Method Metadata to Order Update

**File:** `app/api/update-order-status/route.js`

### Purpose
Send Stripe customer ID and payment method metadata to WordPress so WooCommerce can track payments and process renewals.

### Changes Required

**Step 3.1: Add `stripeCustomerId` to request parameters**

**Location:** Around line 13-24 (request data destructuring)

**Add:**
```javascript
const {
  orderId,
  status,
  paymentIntentId,
  chargeId,
  paymentMethodId,
  paymentMethod,
  currency,
  cardBrand,
  cardLast4,
  errorMessage,
  stripeCustomerId, // ADD THIS
} = requestData;
```

**Step 3.2: Add logging for customer ID**

**Location:** Around line 33-40 (logging section)

**Add:**
```javascript
logger.log("Stripe Customer ID:", stripeCustomerId);
```

**Step 3.3: Add customer ID to metadata**

**Location:** Around line 43 (after `const metaData = [];`)

**Add:**
```javascript
// Add Stripe customer ID - CRITICAL for linking payment to customer
if (stripeCustomerId) {
  metaData.push({ key: "_stripe_customer_id", value: stripeCustomerId });
  logger.log("✅ Added Stripe customer ID:", stripeCustomerId);
}
```

**Step 3.4: Add payment intent ID with new key name**

**Location:** Around line 44-46 (existing payment intent ID code)

**Update:**
```javascript
// Add payment intent ID with both key names for compatibility
if (paymentIntentId) {
  metaData.push({ key: "_stripe_intent_id", value: paymentIntentId });
  metaData.push({ key: "_payment_intent_id", value: paymentIntentId }); // ADD THIS
  logger.log("✅ Added Payment Intent ID:", paymentIntentId);
}
```

**Step 3.5: Add payment method token**

**Location:** Around line 53-57 (existing payment method ID code)

**Update:**
```javascript
// CRITICAL: PaymentMethod ID is required for WooCommerce to capture
// Add with both key names for compatibility
if (paymentMethodId) {
  metaData.push({ key: "_stripe_source_id", value: paymentMethodId });
  metaData.push({ key: "_payment_method_token", value: paymentMethodId }); // ADD THIS
  logger.log("✅ Added PaymentMethod ID for capture:", paymentMethodId);
}
```

---

## Change 4: Pass Customer ID from Frontend to Order Update

**File:** `components/Checkout/CheckoutPageContent.jsx`

### Purpose
Extract the customer ID from the payment intent response and pass it when updating the order status.

### Changes Required

**Location:** Around line 2109-2155 (after payment intent is created)

**Step 4.1: Extract customer ID from response**

**After:**
```javascript
const paymentIntent = intentResult.paymentIntent;
```

**Add:**
```javascript
const stripeCustomerId = intentResult.stripeCustomerId || null;
```

**Step 4.2: Add logging for customer ID**

**After:**
```javascript
logger.log("✅ PaymentIntent created and confirmed:", paymentIntent.id);
```

**Add:**
```javascript
if (stripeCustomerId) {
  logger.log("✅ Stripe Customer ID:", stripeCustomerId);
}
```

**Step 4.3: Add customer ID to update-order-status call**

**Location:** Around line 2143 (in the `body: JSON.stringify` call)

**Add `stripeCustomerId` to the payload:**
```javascript
body: JSON.stringify({
  orderId,
  status: "on-hold",
  paymentIntentId: paymentIntent?.id || intentResult.paymentIntentId,
  chargeId: chargeId,
  paymentMethodId: paymentMethodId,
  stripeCustomerId: stripeCustomerId, // ADD THIS
  paymentMethod: "stripe_cc",
  currency: currency,
  cardBrand: cardBrand,
  cardLast4: cardLast4,
}),
```

---

## Change 5: Update Subscriptions with Payment Method Information

**File:** `app/api/update-order-status/route.js`

### Purpose
Update all subscriptions associated with an order to include payment method information, enabling automatic renewals instead of manual renewal.

### Changes Required

**Location:** After order is updated, before adding order note (around line 147)

**Add this entire block:**

```javascript
// Update associated subscriptions with payment method information
// This enables automatic renewals instead of manual renewal
if (stripeCustomerId && paymentMethodId && paymentMethod === "stripe_cc") {
  try {
    logger.log("Updating subscriptions with payment method information...");
    
    // Get subscriptions for this order
    const subscriptionsResponse = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/subscriptions`,
      {
        params: {
          parent: orderId,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${CONSUMER_KEY}:${CONSUMER_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const subscriptions = subscriptionsResponse.data || [];

    if (subscriptions.length > 0) {
      logger.log(
        `Found ${subscriptions.length} subscription(s) to update with payment method`
      );

      // Update each subscription with payment method info
      const subscriptionUpdatePromises = subscriptions.map(
        async (subscription) => {
          const subscriptionUpdateData = {
            payment_method: "stripe_cc",
            payment_method_title: "Stripe",
            meta_data: [
              {
                key: "_stripe_customer_id",
                value: stripeCustomerId,
              },
              {
                key: "_payment_method_token",
                value: paymentMethodId,
              },
              {
                key: "_stripe_source_id",
                value: paymentMethodId,
              },
            ],
          };

          // Add payment intent ID if available
          if (paymentIntentId) {
            subscriptionUpdateData.meta_data.push({
              key: "_payment_intent_id",
              value: paymentIntentId,
            });
          }

          logger.log(
            `Updating subscription ${subscription.id} with payment method`
          );

          return axios.put(
            `${BASE_URL}/wp-json/wc/v3/subscriptions/${subscription.id}`,
            subscriptionUpdateData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(
                  `${CONSUMER_KEY}:${CONSUMER_SECRET}`
                ).toString("base64")}`,
              },
            }
          );
        }
      );

      await Promise.all(subscriptionUpdatePromises);
      logger.log(
        "✅ All subscriptions updated with payment method information"
      );
    } else {
      logger.log("No subscriptions found for this order");
    }
  } catch (subscriptionError) {
    logger.error(
      "Failed to update subscriptions with payment method:",
      subscriptionError.response?.data || subscriptionError.message
    );
    // Don't fail the order update if subscription update fails
  }
}
```

---

## Metadata Keys Added

The following metadata keys are now sent to WordPress/WooCommerce:

| Key | Description | Location |
|-----|-------------|----------|
| `_stripe_customer_id` | Stripe customer ID | Order & Subscription metadata |
| `_payment_intent_id` | Payment intent ID | Order & Subscription metadata |
| `_payment_method_token` | Payment method token/ID | Order & Subscription metadata |
| `_stripe_source_id` | Payment method ID (legacy) | Order & Subscription metadata |

---

## Testing Checklist

After applying these changes, verify:

- [ ] Customer ID is present in order metadata in WordPress
- [ ] Payment method token is present in order metadata
- [ ] Payment intent ID is present in order metadata
- [ ] Payment method is set as default in Stripe customer
- [ ] Subscriptions show "Automatic Renewal" instead of "Manual Renewal"
- [ ] Subscription metadata contains customer ID and payment method token
- [ ] Payment can be captured successfully
- [ ] Renewals can be processed automatically

---

## Notes

1. **Error Handling**: All changes include proper error handling that won't break the payment flow if something fails.

2. **Backward Compatibility**: Existing metadata keys (`_stripe_intent_id`, `_stripe_source_id`) are kept alongside new ones for compatibility.

3. **Subscription Updates**: Subscription updates happen after order updates and won't fail the order update if they fail.

4. **Default Payment Method**: Setting the default payment method is important for WooCommerce to know which payment method to use for renewals when a customer has multiple saved cards.

---

## Questions or Issues?

If you encounter any issues when applying these changes:

1. Check the logs for error messages
2. Verify all environment variables are set correctly (`BASE_URL`, `CONSUMER_KEY`, `CONSUMER_SECRET`)
3. Ensure WooCommerce Subscriptions plugin is active
4. Verify Stripe API keys are correct
5. Check that the WooCommerce REST API is accessible

---

**Last Updated:** Session changes from payment integration fixes
**Version:** 1.0

