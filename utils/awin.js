/**
 * Check if Awin tracking is enabled
 * @returns {boolean} True if Awin tracking is enabled, false otherwise
 */
export function isAwinTrackingEnabled() {
  if (typeof window !== "undefined") {
    // Client-side: check NEXT_PUBLIC_AWIN_ENABLED (defaults to true for backward compatibility)
    const enabled = process.env.NEXT_PUBLIC_AWIN_ENABLED;
    return enabled === undefined || enabled === "" || enabled === "true" || enabled === "1";
  }
  // Server-side: check AWIN_ENABLED (defaults to true for backward compatibility)
  const enabled = process.env.AWIN_ENABLED;
  return enabled === undefined || enabled === "" || enabled === "true" || enabled === "1";
}

/**
 * AWIN helper: capture `awc` from URL once and persist to localStorage + cookie.
 * Safe to call multiple times and on SSR.
 * Only sets cookies/storage if Awin tracking is enabled.
 */
export function getAwinFromUrlOrStorage() {
  if (typeof window === "undefined") {
    return { awc: "", channel: "other" };
  }

  try {
    const params = new URLSearchParams(window.location.search || "");
    const awcFromUrl = params.get("awc");

    // Only set cookies/storage if Awin tracking is enabled
    if (awcFromUrl && isAwinTrackingEnabled()) {
      try {
        window.localStorage.setItem("awin_awc", awcFromUrl);
      } catch (_) {}
      try {
        // Set cookies without explicit domain for broad compatibility
        // Use a more defensive approach for localhost vs production
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          // Localhost: allow non-secure, Lax
          document.cookie = `awc=${awcFromUrl};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
          document.cookie = `_awin_awc=${awcFromUrl};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
        } else {
          // Production: set cross-site capable cookies
          document.cookie = `awc=${awcFromUrl};path=/;max-age=${60 * 60 * 24 * 365};SameSite=None;Secure`;
          document.cookie = `_awin_awc=${awcFromUrl};path=/;max-age=${60 * 60 * 24 * 365};SameSite=None;Secure`;
        }
      } catch (error) {
        console.warn("Failed to set Awin cookie:", error);
      }
    }

    let awc = awcFromUrl || "";
    if (!awc) {
      try {
        awc = window.localStorage.getItem("awin_awc") || "";
      } catch (_) {}
    }

    // Fallback to cookie if still not found
    if (!awc) {
      try {
        const cookieString = document.cookie || "";
        const cookies = cookieString.split(";").map((c) => c.trim());
        for (const c of cookies) {
          if (c.startsWith("awc=")) {
            awc = c.substring(4);
            // Sync to localStorage for future reads
            try {
              window.localStorage.setItem("awin_awc", awc);
            } catch (_) {}
            break;
          }
        }
      } catch (_) {}
    }

    return {
      awc,
      channel: awc ? "aw" : "other",
    };
  } catch (_) {
    return { awc: "", channel: "other" };
  }
}
