"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getOrCreateSessionId,
  getRequestId,
  isSessionStable,
} from "@/utils/requestIds";

function installFetchInterceptor() {
  if (typeof window === "undefined") return;
  if (window.__rkFetchPatched) return;

  const originalFetch = window.fetch;
  window.__rkFetchPatched = true;

  window.fetch = function patchedFetch(input, init) {
    try {
      const url = typeof input === "string" ? input : input?.url ?? "";
      const isApiCall =
        url.startsWith("/api/") ||
        (typeof window !== "undefined" &&
          url.startsWith(window.location.origin + "/api/"));

      if (isApiCall) {
        const existingHeaders = new Headers(init?.headers);

        if (!existingHeaders.has("x-session-id")) {
          existingHeaders.set("x-session-id", getOrCreateSessionId());
        }
        if (!existingHeaders.has("x-request-id")) {
          existingHeaders.set("x-request-id", getRequestId());
        }

        return originalFetch.call(this, input, {
          ...init,
          headers: existingHeaders,
        });
      }
    } catch (_) {
      /* never block a fetch call due to tracing failure */
    }

    return originalFetch.call(this, input, init);
  };
}

function installAxiosInterceptor() {
  if (typeof window === "undefined") return;
  if (window.__rkAxiosInterceptorInstalled) return;

  try {
    const axios = require("axios");
    axios.interceptors.request.use(
      (config) => {
        try {
          const url = config.url ?? "";
          const isApiCall =
            url.startsWith("/api/") ||
            url.startsWith(window.location.origin + "/api/");

          if (isApiCall) {
            config.headers = config.headers || {};
            if (!config.headers["x-session-id"]) {
              config.headers["x-session-id"] = getOrCreateSessionId();
            }
            if (!config.headers["x-request-id"]) {
              config.headers["x-request-id"] = getRequestId();
            }
          }
        } catch (_) {
          /* never block request due to tracing */
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    window.__rkAxiosInterceptorInstalled = true;
  } catch (_) {
    /* axios not available — that's fine */
  }
}

function runAnalyticsBridge(sessionId) {
  if (!sessionId || !isSessionStable()) return;

  const defer = typeof queueMicrotask === "function" ? queueMicrotask : (fn) => setTimeout(fn, 0);

  defer(() => {
    try {
      if (typeof window.clarity === "function") {
        window.clarity("set", "rk_session_id", sessionId);
      }
    } catch (_) {
      /* Clarity unavailable or threw */
    }

    try {
      window.dataLayer?.push({
        event: "rk_session_initialized",
        rk_session_id: sessionId,
      });
    } catch (_) {
      /* dataLayer unavailable */
    }

    if (process.env.NEXT_PUBLIC_QS_TRACK_DEBUG === "1") {
      try {
        console.debug("[SessionTrace] session initialized:", sessionId);
      } catch (_) {}
    }
  });
}

export default function SessionInit() {
  const analyticsFired = useRef(false);
  const pathname = usePathname();

  // Mount: init session, install interceptors, run analytics bridge
  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    installFetchInterceptor();
    installAxiosInterceptor();

    if (!analyticsFired.current && sessionId) {
      analyticsFired.current = true;
      runAnalyticsBridge(sessionId);
    }
  }, []);

  // SPA navigation: refresh cookie sliding window (throttled inside requestIds)
  useEffect(() => {
    getOrCreateSessionId();
  }, [pathname]);

  return null;
}
