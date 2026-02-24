"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SKIP_PATHS = ["/ed-consultation-quiz", "/wl-pre-consultation", "/ed-pre-consultation", "/hair-flow", "/mh-pre-quiz"];

function LoadingBarContent() {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const loadingRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const shouldSkip = SKIP_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (shouldSkip) {
      setLoading(false);
      setShowLoader(false);
      loadingRef.current = false;
      return;
    }

    let timeoutId;
    let delayLoaderTimeout;

    setLoading(true);
    loadingRef.current = true;

    delayLoaderTimeout = setTimeout(() => {
      if (loadingRef.current) {
        setShowLoader(true);
      }
    }, 150);

    timeoutId = setTimeout(() => {
      setLoading(false);
      setShowLoader(false);
      loadingRef.current = false;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(delayLoaderTimeout);
    };
  }, [pathname, searchParamsString, shouldSkip]);

  if (shouldSkip) {
    return null;
  }

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}

export default function LoadingOverlay() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={null}>
        <LoadingBarContent />
      </Suspense>
    </div>
  );
}
