"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "pending_coupon_code";

/**
 * Hook that captures `apply_coupon` from the URL query string
 * and persists it in localStorage for later use at checkout.
 *
 * @returns {boolean} Whether a coupon was captured from the URL on this visit.
 */
export function useAutoApplyCoupon() {
  const hasSavedRef = useRef(false);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    if (hasSavedRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const coupon = searchParams.get("apply_coupon");
    if (coupon) {
      const trimmed = coupon.trim();
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY, trimmed);
        hasSavedRef.current = true;
        setCaptured(true);
      }
    }
  }, []);

  return captured;
}

export function getPendingCouponCode() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function clearPendingCouponCode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
