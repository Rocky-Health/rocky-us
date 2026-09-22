"use client";

import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { logger } from "@/utils/devLogger";

const NotifyMePopup = ({ isOpen, onClose, size, productName }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual notification API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      logger.error("Error submitting notification request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-2xl shadow-lg w-full h-[354px] mx-4  md:h-[354px] md:w-[440px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-[#111111] leading-[130%] tracking-[0%]">Notify me</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8  flex items-center justify-center text-black"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="">
          {!isSubmitted ? (
            <>
              <p className="text-black mb-8 text-[16px] font-normal leading-[140%] tracking-[0%]">
                Would you like to be notified when the size <strong>{size}</strong> is available?
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full h-11 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                    className="w-full h-12 bg-black text-white font-bold px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Notify me"}
                </button>
              </form>

              <p className="text-xs text-[#000000B2]  text-left">
                By requesting an availability notification, you confirm that you have read the{" "}
                <a href="/privacy-policy" className="underline hover:text-gray-700">
                  Privacy Policy
                </a>
                .
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Success!</h3>
              <p className="text-gray-600">
                We'll notify you when size <strong>{size}</strong> becomes available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotifyMePopup;
