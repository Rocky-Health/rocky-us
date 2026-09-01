"use client";

import React, { useState } from "react";
import Image from "next/image";
import { identifyCustomerioProfile } from "@/utils/customerioEvents";

const SubscribeForm = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (!email) {
      setOverlayMessage({
        type: "error",
        text: "Please enter an email address",
      });
      return;
    }

    setIsLoading(true);
    setOverlayMessage(null);

    try {
      const response = await fetch(`/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Customer.io lead identify. Fire and forget, independent of the Attentive
        // subscription above; the relay decides whether Customer.io is live.
        identifyCustomerioProfile({ email });

        setIsSubscribed(true);
        setOverlayMessage({
          type: "success",
          text: "Thank you for subscribing!",
        });
        e.target.reset();
      } else {
        const errorText = data.error?.includes("No valid creative found")
          ? "Subscription is currently unavailable. Please try again later."
          : data.error || "Subscription failed. Please try again.";
        setOverlayMessage({ type: "error", text: errorText });
      }
    } catch (error) {
      setOverlayMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeOverlay = () => setOverlayMessage(null);

  return (
    <div className="md:w-1/2 md:order-2 order-3">
      <div className="hidden md:block">
        <h2 className="text-3xl headers-font font-medium mb-2 leading-[115%">
          Never Miss An Episode!
        </h2>
        <p className="text-base mb-6 text-[#000000A6]">
          Stay updated with the latest episodes and health tips!
        </p>
      </div>

      <form
        className="flex flex-col md:flex-row gap-3"
        onSubmit={handleSubscribe}
      >
        <input
          type="email"
          name="email"
          placeholder="Enter your email address"
          className="px-6 py-3 text-[#00000080] text-sm placeholder:text-sm rounded-full border border-[#E2E2E1] w-full outline-none focus:outline-none bg-white"
          aria-label="Email address"
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-black text-white py-3 px-8 rounded-full flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
          aria-label="Subscribe to podcast updates"
          disabled={isLoading}
        >
          <span className="text-sm font-medium">
            {isLoading ? "Subscribing..." : "Subscribe"}
          </span>
          <Image
            src="/podcast/subscribe-arrow.svg"
            alt="Arrow right"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </button>
      </form>

      {/* Overlay Message */}
      {overlayMessage && (
        <div className="fixed inset-0 bg-black/30 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-[300px] text-center p-4 pt-6 pb-6">
            <div className="flex justify-center mx-auto mb-2">
              {overlayMessage.type === "success" ? (
                <svg
                  className="fill-[#814b00] text-3xl"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.371 0 0 5.371 0 12c0 6.629 5.371 12 12 12s12-5.371 12-12C24 5.371 18.629 0 12 0zm-1.2 18l-5.2-5.2 1.4-1.4 3.8 3.8 7.8-7.8 1.4 1.4L10.8 18z" />
                </svg>
              ) : (
                <svg
                  className="fill-red-500 text-3xl"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.371 0 0 5.371 0 12c0 6.629 5.371 12 12 12s12-5.371 12-12C24 5.371 18.629 0 12 0zm5 15.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                </svg>
              )}
            </div>
            <p className="text-black">{overlayMessage.text}</p>
            <button
              aria-label="Close"
              onClick={closeOverlay}
              className="mt-4 px-8 py-2 bg-[#814b00] text-white rounded-lg font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribeForm;
