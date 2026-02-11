import { useState } from "react";
import { useWLOfferStepNavigation } from "./useWLOfferStepNavigation";
import { useWLOfferQuizData } from "./useWLOfferQuizData";
import { wlOfferConfig } from "../config/wlOfferConfig";
import { logger } from "@/utils/devLogger";
import { addItemToCart } from "@/lib/cart/cartService";

export const useWLOfferFlow = () => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const {
        currentStep,
        progressPercent,
        goToStep,
        handleContinue: baseHandleContinue,
        handleBack,
        resetQuiz,
    } = useWLOfferStepNavigation(wlOfferConfig);

    const {
        userData,
        setUserData,
        activePopup,
        selectedProduct,
        setSelectedProduct,
        handleAction: baseHandleAction,
        closePopup,
        handleRecommendationContinue: baseHandleRecommendationContinue,
        clearQuizData,
    } = useWLOfferQuizData();

    // Handle checkout redirect with offer product
    const redirectToCheckout = async () => {
        try {
            setIsAddingToCart(true);
            logger.log("[WLOffer] Redirecting to checkout with offer product");

            // Offer product: [GLP-1] Buy 2 Get 1 Free (ID: 489780)
            // Add as normal product (not ed or wl flow)
            const offerProductData = {
                productId: "489780",
                quantity: 1,
                name: "[GLP-1] Buy 2 Get 1 Free",
                price: 0, // Price will be fetched from product data
                product_type: "simple",
                variation: [],
            };

            logger.log("🛒 Adding offer product (489780) to cart as normal product");

            // Add product to cart as normal product (not flow-specific)
            await addItemToCart(offerProductData);

            logger.log("✅ WL Offer product added to cart successfully");

            // Clear all localStorage keys used in WL flow before redirecting
            try {
                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.removeItem("wl_flow2_quiz_data");
                    logger.log("✓ Cleared WL flow localStorage key before redirect");
                }
            } catch (e) {
                logger.error("Error clearing localStorage:", e);
            }

            // Redirect to checkout (normal checkout, no flow parameters)
            if (typeof window !== "undefined") {
                window.location.href = "/checkout";
                return;
            }
        } catch (error) {
            logger.error("Error during WL Offer checkout redirect:", error);
            alert("There was an issue processing your checkout. Please try again.");
            setIsAddingToCart(false);
        }
    };

    // Prevent repeated popups by tracking which popups have been shown in userData
    const handleContinue = () => {
        const stepConfig = wlOfferConfig.steps[currentStep];
        const nextStep = wlOfferConfig.navigation[currentStep];

        // If next step is checkout, redirect instead of continuing
        if (nextStep === "checkout") {
            redirectToCheckout();
            return;
        }

        // Only show popup if not already shown for this step
        if (stepConfig && stepConfig.showPopupAfterStep && !userData[`popupShown_${currentStep}`]) {
            setUserData({ ...userData, [`popupShown_${currentStep}`]: true });
            baseHandleAction("showPopup", stepConfig.showPopupAfterStep, () => {
                baseHandleContinue(userData);
            });
        } else {
            baseHandleContinue(userData);
        }
    };

    const handleAction = (action, payload) => {
        if (action === "navigate") {
            logger.log("[WLOffer] Navigating from step", currentStep, "to step", payload);
            goToStep(payload);
        } else if (action === "redirectToCheckout") {
            redirectToCheckout();
        } else {
            baseHandleAction(action, payload, handleContinue);
        }
    };

    const handleRecommendationContinue = () => {
        baseHandleRecommendationContinue();
        // After product selection, route to checkout
        // Data is kept in localStorage for checkout process
        logger.log("[WLOffer] Product selected, ready for checkout");
    };

    return {
        currentStep,
        progressPercent,
        userData,
        setUserData,
        selectedProduct,
        setSelectedProduct,
        activePopup,
        handleContinue,
        handleBack,
        handleAction,
        closePopup,
        handleRecommendationContinue,
        clearQuizData,
        resetQuiz,
        isAddingToCart,
    };
};
