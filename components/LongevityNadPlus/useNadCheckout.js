"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { logger } from "@/utils/devLogger";
import { addToCartDirectly } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";

// US cart-first checkout for /longevity-nad-lp. Mirrors the proven US NAD+
// quiz flow (components/WLPreConsultationQuizV2/NadPlusQuiz/hooks/
// useNadPlusQuizFlow.js -> handlePlanStepCheckout) instead of CA's
// cartService.addItemToCart. Drops the standalone NAD+ SKU (490785) into the
// cart via flowCartHandler, marks the required consultation, then routes to
// /checkout?longevity-flow=1 (longevity-flow drives the Start Checkout
// pixel/CAPI fire).
export function useNadCheckout() {
    const [isAdding, setIsAdding] = useState(false);

    const goToCheckout = async () => {
        if (isAdding) return;
        setIsAdding(true);

        try {
            // US standalone NAD+ SKU: $199/month subscription (product 490785).
            const mainProduct = {
                id: "490785",
                name: "NAD+",
                price: "$199",
                isSubscription: true,
                variationId: "490785",
            };

            // Mark the required clinician consultation for this flow before
            // adding to cart (synchronous localStorage write; the await is a
            // no-op but keeps ordering explicit and matches the quiz flow).
            await addRequiredConsultation("490785", "longevity-flow");

            const result = await addToCartDirectly(
                mainProduct,
                [],
                "longevity",
                {
                    requireConsultation: true,
                    preserveExistingCart: false,
                    subscriptionPeriod: "1_month",
                },
            );

            if (result?.success) {
                if (typeof window !== "undefined") {
                    // longevity-flow drives the Start Checkout pixel/CAPI fire.
                    window.location.href =
                        result.redirectUrl || "/checkout?longevity-flow=1";
                }
                return;
            }

            logger.error("NAD+ add-to-cart failed:", result?.error);
            toast.error("Failed to add to cart. Please try again.");
        } catch (error) {
            logger.error("NAD+ add-to-cart failed:", error);
            toast.error("Failed to add to cart. Please try again.");
        } finally {
            setIsAdding(false);
        }
    };

    return { goToCheckout, isAdding };
}
