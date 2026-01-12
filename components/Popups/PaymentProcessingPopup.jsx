"use client";

import { useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

const PaymentProcessingModal = ({
  isOpen,
  onClose,
  isProcessing,
  error,
  onRetry,
  orderId,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="text-center">
            {isProcessing && !error && (
              <>
                {/* Spinner */}
                <div className="flex justify-center mb-4">
                  <FaSpinner className="animate-spin text-4xl text-[#03A670]" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-2">
                  Processing Payment
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-4">
                  Order Created Successfully
                  <br />
                  Please wait while we process your payment. This may take a few
                  seconds...
                </p>
              </>
            )}

            {error && !isProcessing && (
              <>
                {/* Error Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-3xl text-red-600">✕</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-2 text-red-600">
                  Payment Failed
                </h2>

                {/* Error Message */}
                <p className="text-gray-700 mb-6 break-words">
                  {error}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onRetry}
                    className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentProcessingModal;

