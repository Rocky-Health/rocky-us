import React, { useState, useEffect } from "react";
import SkincareQuizLoader from "./SkincareQuizLoader";
import { logger } from "@/utils/devLogger";

const ThankYouStep = ({
    submitFormData,
    onComplete,
    quizType = "skincare"
}) => {
    const [isApiComplete, setIsApiComplete] = useState(false);

    useEffect(() => {
        const handleFinalSubmission = async () => {
            try {
                // Call API with 100% completion and full state
                await submitFormData({
                    completion_percentage: 100,
                    completion_state: "Full"
                });
                setIsApiComplete(true);
            } catch (error) {
                logger.error("Error submitting final completion:", error);
                // Still proceed even if API fails
                setIsApiComplete(true);
            }
        };

        // Start API call immediately
        handleFinalSubmission();

        // Show thank you page for 4 seconds then proceed to recommendations
        const timer = setTimeout(() => {
            onComplete?.();
        }, 4000);

        return () => clearTimeout(timer);
    }, [submitFormData, onComplete]);

    return (
        <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6">
            <div className="text-center">
                {/* Thank you icon */}
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-[#C19A6B] rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Thank you message */}
                <h1 className="mb-4 headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%] text-[#C19A6B]">
                    Thank You for Completing Your Consultation!
                </h1>

                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    We're analyzing your responses to find the perfect {quizType} treatment for your unique needs.
                </p>

                {/* Show loading animation while API is being called */}
                {!isApiComplete && (
                    <div className="flex justify-center space-x-1 mb-6">
                        <div className="w-2 h-2 bg-[#C19A6B] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#C19A6B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#C19A6B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                )}

                {/* Show completion status when API call is done */}
                {isApiComplete && (
                    <div className="text-green-600 mb-4">
                        <p className="font-medium">✓ Complete! Preparing your personalized recommendations...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThankYouStep;
