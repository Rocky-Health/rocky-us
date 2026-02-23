"use client";

import { Suspense } from "react";
import { useAutoApplyCoupon } from "@/lib/hooks/useAutoApplyCoupon";

function CouponCaptureInner() {
  useAutoApplyCoupon();
  return null;
}

export default function CouponCapture() {
  return (
    <Suspense fallback={null}>
      <CouponCaptureInner />
    </Suspense>
  );
}
