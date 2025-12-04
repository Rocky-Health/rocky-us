import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";

const STORAGE_KEY = "wl_flow2_quiz_data";

export const useQuizData = () => {
  // Initialize from localStorage if available
  const [userData, setUserData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.userData || {};
        }
      } catch (e) {
        logger.error("Failed to load userData from localStorage:", e);
      }
    }
    return {};
  });

  const [activePopup, setActivePopup] = useState(null);
  
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.selectedProduct || null;
        }
      } catch (e) {
        logger.error("Failed to load selectedProduct from localStorage:", e);
      }
    }
    return null;
  });

  // Save to localStorage whenever userData or selectedProduct changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : {};
        
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            userData,
            selectedProduct,
          })
        );
      } catch (e) {
        logger.error("Failed to save to localStorage:", e);
      }
    }
  }, [userData, selectedProduct]);

  const handleAction = (action, payload, onContinue) => {
    switch (action) {
      case "showPopup":
        setActivePopup(payload);
        break;
      case "openPopup":
        setActivePopup(payload);
        break;
      case "navigate":
        // This will be handled by the composed hook
        break;
      case "continue":
        setActivePopup(null);
        onContinue();
        break;
      default:
        logger.log("Unknown action:", action, payload);
    }
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const handleRecommendationContinue = () => {
    logger.log("🛒 Proceeding with selected product:", selectedProduct);

    setUserData((prev) => ({
      ...prev,
      selectedProduct: selectedProduct,
    }));

    // Navigation will be handled by the composed hook
  };

  // Utility to clear quiz data (call when quiz is completed or reset)
  const clearQuizData = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setUserData({});
        setSelectedProduct(null);
        setActivePopup(null);
      } catch (e) {
        logger.error("Failed to clear quiz data:", e);
      }
    }
  };

  return {
    userData,
    setUserData,
    activePopup,
    selectedProduct,
    setSelectedProduct,
    handleAction,
    closePopup,
    handleRecommendationContinue,
    clearQuizData,
  };
};
