/**
 * Customer.io event vocabulary.
 *
 * Its own module with no imports, so the browser helper can name events without pulling the
 * server-only payload builder (and node:crypto) into the client bundle.
 *
 * These are the Customer.io Pipelines semantic ecommerce names, chosen so the storefront and
 * Mayu's WooCommerce integration describe the same actions identically.
 *
 * `Order Completed` is deliberately absent: Woo and the backend own purchase and subscription
 * lifecycle. There is no `cart_abandoned` either, because abandonment is a state Customer.io
 * derives by waiting for a backend Order Completed that never arrives, not an action a browser
 * can observe.
 */
export const CUSTOMERIO_EVENTS = {
  PRODUCT_VIEWED: "Product Viewed",
  PRODUCT_ADDED: "Product Added",
  CHECKOUT_STARTED: "Checkout Started",
};
