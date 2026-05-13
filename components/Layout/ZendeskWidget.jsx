"use client";

import { useRef, useState } from "react";
import { logger } from "@/utils/devLogger";

const ZENDESK_KEY =
  process.env.NEXT_PUBLIC_ZENDESK_KEY || "51c9f4e2-65bd-4b2d-a1bf-ecbe181728cf";
const ZENDESK_SNIPPET_URL = `https://static.zdassets.com/ekr/snippet.js?key=${ZENDESK_KEY}`;
const TOOLTIP_DISMISS_STORAGE_KEY = "zendeskTooltipDismissed";

/**
 * ZendeskWidget — lazy launcher.
 * Renders a placeholder chat button (with greeting tooltip) on every page;
 * the Zendesk snippet, /api/zendesk/get-jwt call, and Sunco WebSocket only
 * fire after the user clicks the placeholder.
 */
export default function ZendeskWidget() {
  const [phase, setPhase] = useState("idle"); // idle | loading | ready
  const [tooltipVisible, setTooltipVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(TOOLTIP_DISMISS_STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const launchStartedRef = useRef(false);

  async function fetchJwt() {
    try {
      const response = await fetch("/api/zendesk/get-jwt", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!data.success || !data.token) return null;
      return data.token;
    } catch (error) {
      logger.error("Zendesk: Error fetching JWT:", error);
      return null;
    }
  }

  async function initializeAndOpen() {
    if (typeof window === "undefined" || typeof window.zE !== "function") {
      logger.error("Zendesk: zE object not found after script load");
      return;
    }

    const token = await fetchJwt();
    if (token) {
      window.zE("messenger", "loginUser", function (callback) {
        callback(token);
      });
    }

    try {
      window.zE("messenger", "open");
    } catch (error) {
      logger.error("Zendesk: failed to open messenger:", error);
    }
  }

  function injectSnippet() {
    if (typeof document === "undefined") return;
    if (document.getElementById("ze-snippet")) return;

    const script = document.createElement("script");
    script.id = "ze-snippet";
    script.src = ZENDESK_SNIPPET_URL;
    script.async = true;
    script.onload = () => {
      setPhase("ready");
      initializeAndOpen();
    };
    script.onerror = (error) => {
      logger.error("Zendesk: Failed to load snippet:", error);
      launchStartedRef.current = false;
      setPhase("idle");
    };
    document.body.appendChild(script);
  }

  function handleLaunch() {
    if (launchStartedRef.current) return;
    launchStartedRef.current = true;
    setPhase("loading");
    injectSnippet();
  }

  function dismissTooltip() {
    setTooltipVisible(false);
    try {
      window.localStorage.setItem(TOOLTIP_DISMISS_STORAGE_KEY, "1");
    } catch {
      // localStorage may be unavailable (private browsing, etc.) — ignore
    }
  }

  // Once Zendesk is loaded, its own launcher iframe takes over.
  if (phase === "ready") {
    return (
      <style jsx global>{`
        .livechat_button {
          display: none !important;
        }
      `}</style>
    );
  }

  return (
    <>
      <div
        id="zendesk-launcher-placeholder"
        className="zendesk-launcher-placeholder"
        role="group"
        aria-label="Chat support"
      >
        {tooltipVisible && (
          <>
            <button
              type="button"
              className="zendesk-launcher-placeholder__close"
              aria-label="Dismiss chat greeting"
              onClick={dismissTooltip}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className="zendesk-launcher-placeholder__tooltip"
              onClick={handleLaunch}
              disabled={phase === "loading"}
            >
              Hi. Need any help?
            </button>
          </>
        )}
        <button
          type="button"
          className="zendesk-launcher-placeholder__button"
          aria-label="Open chat"
          onClick={handleLaunch}
          disabled={phase === "loading"}
        >
          {phase === "loading" ? (
            <span
              aria-hidden="true"
              className="zendesk-launcher-placeholder__spinner"
            />
          ) : (
            <svg
              width="30"
              height="22"
              viewBox="0 0 40 28"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M8 2 H32 C36.4 2 40 5.6 40 10 V14 C40 18.4 36.4 22 32 22 H26 L22 28 L20 22 H8 C3.6 22 0 18.4 0 14 V10 C0 5.6 3.6 2 8 2 Z"
                fill="#2A2424"
              />
            </svg>
          )}
        </button>
      </div>
      <style jsx global>{`
        .livechat_button {
          display: none !important;
        }
        .zendesk-launcher-placeholder {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .zendesk-launcher-placeholder__close {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background-color: #ffffff;
          color: #2a2424;
          border: 1px solid #e6e1da;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .zendesk-launcher-placeholder__tooltip {
          background-color: #ffffff;
          color: #2a2424;
          border: none;
          border-radius: 9999px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }
        .zendesk-launcher-placeholder__tooltip:disabled {
          cursor: wait;
          opacity: 0.85;
        }
        .zendesk-launcher-placeholder__button {
          width: 64px;
          height: 64px;
          border-radius: 9999px;
          background-color: #b5a089;
          color: #2a2424;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        }
        .zendesk-launcher-placeholder__button:disabled {
          cursor: wait;
          opacity: 0.85;
        }
        .zendesk-launcher-placeholder__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(42, 36, 36, 0.25);
          border-top-color: #2a2424;
          border-radius: 50%;
          animation: zendesk-launcher-placeholder-spin 0.8s linear infinite;
        }
        @keyframes zendesk-launcher-placeholder-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 480px) {
          .zendesk-launcher-placeholder {
            right: 12px;
            bottom: 12px;
            gap: 8px;
          }
          .zendesk-launcher-placeholder__button {
            width: 56px;
            height: 56px;
          }
          .zendesk-launcher-placeholder__close {
            width: 32px;
            height: 32px;
          }
          .zendesk-launcher-placeholder__tooltip {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
