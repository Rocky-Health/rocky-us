"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "geo-redirect-dismissed";
const CA_SITE_URL = "https://www.myrocky.ca";

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)"),
  );
  return match ? match[2] : null;
}

export default function GeoRedirectPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const country = getCookie("geo-country");
    if (country === "CA") {
      const timer = setTimeout(() => {
        setIsOpen(true);
        requestAnimationFrame(() => setIsVisible(true));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleRedirect = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    window.location.href = CA_SITE_URL;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={dismiss}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-[400px] w-full mx-auto transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="geo-redirect-title"
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <span className="text-xl font-bold">&times;</span>
        </button>

        <div className="px-8 pt-10 pb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-[32px] leading-none">&#127482;&#127480;</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-black/30"
            >
              <path
                d="M3 8h10M10 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[32px] leading-none">&#127464;&#127462;</span>
          </div>

          <h2
            id="geo-redirect-title"
            className="helvetica-display-font text-[18px] md:text-[20px] leading-[1.25] tracking-[-0.3px] text-black mb-2"
          >
            Would you like to be redirected to our Canadian website?
          </h2>

          <p className="helvetica-text-font text-[12px] md:text-[13px] leading-[1.5] text-black/50 mb-8">
            It looks like you may be visiting from Canada.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRedirect}
              className="dm-mono-font w-full bg-black text-white py-3 px-6 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Yes, take me there
            </button>
            <button
              onClick={dismiss}
              className="dm-mono-font w-full py-3 px-6 rounded-full border border-gray-200 bg-white text-black text-sm font-medium hover:bg-gray-50 transition-colors uppercase tracking-wide"
            >
              Continue in the US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
