"use client";

import { useEffect } from "react";

const ProductNotAvailablePopup = ({ isOpen, onClose, productName = "this" }) => {
    // Close popup when Escape key is pressed
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Prevent body scroll when popup is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Popup Content */}
                <div
                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <span className="text-xl font-bold">&times;</span>
                    </button>

                    {/* Content */}
                    <div className="text-center pt-4">
                        {/* Warning Icon - Circular with white fill, black outline, triangle with exclamation */}
                        <div className="mx-auto mb-6 w-16 h-16 bg-white border border-gray-800 rounded-full flex items-center justify-center relative">
                            <svg
                                className="w-10 h-10 text-gray-800"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Product Not Available
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                            Sorry, {productName} product is currently not available in your
                            selected state.
                        </p>

                        {/* Action Button - Large, rounded, black background, white bold text */}
                        <button
                            onClick={onClose}
                            className="w-full bg-black text-white py-4 px-6 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductNotAvailablePopup;

