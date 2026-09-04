"use client";

import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/devLogger";

const GSI_SRC = "https://accounts.google.com/gsi/client";

const GoogleSignInButton = ({ onSuccess, onError, disabled, isLoading }) => {
  const buttonRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const codeClientRef = useRef(null);
  const warmedRef = useRef(false);
  const [isPreparing, setIsPreparing] = useState(false);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // TK-482: fetch the Google Identity Services library (~258 KB) only when the
  // user actually clicks "Continue with Google" — not on page entry and not on
  // mount. Resolves once window.google.accounts.oauth2 is ready.
  const ensureGsiLoaded = () =>
    new Promise((resolve, reject) => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        reject(new Error("Google Sign-In unavailable outside the browser"));
        return;
      }
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      const poll = (deadline) => {
        if (window.google?.accounts?.oauth2) {
          resolve();
        } else if (Date.now() > deadline) {
          reject(new Error("Google Identity Services failed to initialize"));
        } else {
          setTimeout(() => poll(deadline), 50);
        }
      };

      const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
      if (existing) {
        poll(Date.now() + 5000);
        return;
      }

      const gsiScript = document.createElement("script");
      gsiScript.src = GSI_SRC;
      gsiScript.async = true;
      gsiScript.defer = true;
      gsiScript.onload = () => poll(Date.now() + 5000);
      gsiScript.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(gsiScript);
    });

  // Lazily build the OAuth2 Code Client. Reused across clicks once created.
  const getCodeClient = () => {
    if (codeClientRef.current) return codeClientRef.current;

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "699900977641-9tnb16c0lkeu6acrktirpfu2r90bevhq.apps.googleusercontent.com";

    if (!clientId) {
      logger.error("Google Client ID is missing");
      return null;
    }

    try {
      // OAuth2 Code Client gives a proper popup flow that works in incognito
      // and always shows the account chooser.
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response) => {
          if (response.code) {
            logger.log("Google authorization code received");

            try {
              // Exchange authorization code for ID token
              const exchangeResponse = await fetch(
                "/api/google-exchange-token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    code: response.code,
                  }),
                }
              );

              const exchangeData = await exchangeResponse.json();

              if (exchangeData.id_token) {
                logger.log("ID token received from exchange");
                onSuccessRef.current({ credential: exchangeData.id_token });
              } else {
                logger.error(
                  "Failed to get ID token from exchange:",
                  exchangeData
                );
                onErrorRef.current?.();
              }
            } catch (err) {
              logger.error("Error exchanging authorization code:", err);
              onErrorRef.current?.();
            }
          } else if (response.error) {
            logger.error("Google OAuth error:", response.error);
            // Don't call onError for user cancellation
            if (
              response.error !== "user_closed_popup" &&
              response.error !== "popup_closed_by_user"
            ) {
              onErrorRef.current?.();
            }
          }
        },
        error_callback: (error) => {
          logger.error("Google OAuth error callback:", error);
          onErrorRef.current?.();
        },
      });

      logger.log("Google OAuth Code Client initialized");
      return codeClientRef.current;
    } catch (error) {
      logger.error("Error initializing Google Sign-In:", error);
      return null;
    }
  };

  const openFlow = () => {
    const codeClient = getCodeClient();
    if (!codeClient) {
      onErrorRef.current?.();
      return;
    }
    try {
      // Request authorization code with account selection popup.
      codeClient.requestCode();
    } catch (error) {
      logger.error("Error triggering Google Sign-In:", error);
      onErrorRef.current?.();
    }
  };

  // Safari/iOS has no hover and only a tiny gap between touch and click, so a
  // cold first tap can "do nothing" while the ~258 KB SDK downloads. Warm it up
  // on hover / first touch / focus so the real click hits the synchronous path
  // and the popup opens instantly. Fire-and-forget, runs at most once, and
  // stays silent (no loading state).
  const warmUp = () => {
    if (warmedRef.current || disabled || isLoading) return;
    if (window.google?.accounts?.oauth2) return;
    warmedRef.current = true;
    ensureGsiLoaded()
      .then(() => getCodeClient())
      .catch((error) => {
        // Let the click retry from scratch if the warm-up fetch fails.
        warmedRef.current = false;
        logger.warn("Google Sign-In warm-up failed:", error);
      });
  };

  const handleClick = async () => {
    if (disabled || isLoading || isPreparing) return;

    // Warm path: library already loaded from a prior click — open the popup
    // synchronously so it stays inside the user gesture and isn't blocked.
    if (window.google?.accounts?.oauth2) {
      openFlow();
      return;
    }

    // Cold path: fetch the SDK on demand, then open the flow.
    setIsPreparing(true);
    try {
      await ensureGsiLoaded();
      openFlow();
    } catch (error) {
      logger.error("Google Sign-In library failed to load:", error);
      onErrorRef.current?.();
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerEnter={warmUp}
      onTouchStart={warmUp}
      onFocus={warmUp}
      disabled={disabled || isLoading || isPreparing}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-[12.5px] rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isLoading ? (
        <span>Signing in...</span>
      ) : isPreparing ? (
        <span>Loading...</span>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.8055 10.2292C19.8055 9.55558 19.7501 8.9764 19.6393 8.37402H10.2002V11.845H15.6014C15.3761 13.0903 14.6569 14.1389 13.5487 14.8403V17.3542H16.8156C18.713 15.6806 19.8055 13.2014 19.8055 10.2292Z"
              fill="#4285F4"
            />
            <path
              d="M10.2002 19.8194C12.8535 19.8194 15.0763 18.9764 16.8156 17.3542L13.5487 14.8403C12.6158 15.4333 11.4444 15.7917 10.2002 15.7917C7.64206 15.7917 5.47559 14.1042 4.64731 11.7292H1.27148V14.3125C3.00761 17.6736 6.37037 19.8194 10.2002 19.8194Z"
              fill="#34A853"
            />
            <path
              d="M4.64731 11.7292C4.45177 11.1361 4.34095 10.5014 4.34095 9.84723C4.34095 9.19306 4.45177 8.55834 4.64731 7.96529V5.38196H1.27148C0.580966 6.73612 0.180664 8.24584 0.180664 9.84723C0.180664 11.4486 0.580966 12.9583 1.27148 14.3125L4.64731 11.7292Z"
              fill="#FBBC05"
            />
            <path
              d="M10.2002 3.90278C11.5573 3.90278 12.7704 4.36806 13.7283 5.27084L16.6322 2.4375C15.0763 1.03472 12.8535 0.180557 10.2002 0.180557C6.37037 0.180557 3.00761 2.32639 1.27148 5.68751L4.64731 8.27084C5.47559 5.89584 7.64206 3.90278 10.2002 3.90278Z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
