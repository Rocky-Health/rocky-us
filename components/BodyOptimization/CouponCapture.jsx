"use client";

import { useAutoApplyCoupon } from "@/lib/hooks/useAutoApplyCoupon";

// TK-438: client island — auto-applies a coupon from the URL. Rendered inside a
// <Suspense> boundary on the (server) body-optimization page.
export default function CouponCapture() {
  useAutoApplyCoupon();
  return null;
}
