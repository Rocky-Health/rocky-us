/**
 * Session Expired Modal
 * Custom styled popup to inform users their session has expired
 * Supports different expiry reasons (inactivity, session expiry, etc.)
 */

"use client";

import { useEffect } from "react";
import { IoClose, IoTimeOutline } from "react-icons/io5";

export default function SessionExpiredModal({
  isOpen,
  onConfirm,
  reason = "session_expired",
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-200"
        onClick={onConfirm}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-200 scale-100 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <IoTimeOutline className="w-6 h-6 text-orange-600" />
              </div>

              {/* Title */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reason === "inactivity"
                    ? "Logged Out Due to Inactivity"
                    : "Session Expired"}
                </h3>
              </div>

              {/* Close button */}
              <button
                onClick={onConfirm}
                className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <IoClose className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-gray-600 text-base leading-relaxed">
              {reason === "inactivity"
                ? "You have been logged out due to inactivity. Please sign in to continue shopping."
                : "Your session has expired. Please sign in to continue shopping."}
            </p>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Don&apos;t worry!</span> Your cart
                items are saved and will be waiting for you after you log back
                in.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-black text-white py-3 px-6 rounded-full font-medium text-base hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
