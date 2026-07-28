// Unique id per user-initiated payment attempt. Sent to the payment APIs so
// Stripe idempotency keys dedupe duplicate submits of the same attempt while
// a deliberate retry gets a fresh key.
export function newPaymentAttemptId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
