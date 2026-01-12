"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureMetaParameters } from "@/utils/metaPixelHelper";

export default function MetaCookieInitializer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureMetaParameters();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Cookie Init] Initialized on:', pathname);
    }
  }, [pathname, searchParams]);

  return null;
}

