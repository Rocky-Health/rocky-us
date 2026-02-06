import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";

// Get storage keys for wl-offer pre-quiz
// Using same naming as bo-pre-consultation
const getStorageKeys = () => {
  return {
    STORAGE_KEY: "new-bo-preqiz-data",
    ESSENTIAL_CONSUL_KEY: "new-bo-essential-consul",
  };
};

export const useWLOfferQuizData = () => {
  const { STORAGE_KEY, ESSENTIAL_CONSUL_KEY } = getStorageKeys();

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

  const [history, setHistory] = useState([]);

  // Save to localStorage whenever userData or selectedProduct changes
  // IMPORTANT: Password is excluded from localStorage and only kept in memory (PasswordContext)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : {};
        
        // Exclude password from localStorage - it's stored in memory only via PasswordContext
        const dataToSave = { ...userData };
        delete dataToSave.password;
        
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            userData: dataToSave,
            selectedProduct,
          })
        );

        // Save to essential-consul for transfer to post-checkout questionnaire
        localStorage.setItem(ESSENTIAL_CONSUL_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        logger.error("Failed to save to localStorage:", e);
      }
    }
  }, [userData, selectedProduct, STORAGE_KEY, ESSENTIAL_CONSUL_KEY]);

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
    logger.log("🛒 WL Offer - Proceeding with selected product:", selectedProduct);

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
        localStorage.removeItem(ESSENTIAL_CONSUL_KEY);
        setUserData({});
        setSelectedProduct(null);
        setActivePopup(null);
        setHistory([]);
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
    history,
    setHistory,
    handleAction,
    closePopup,
    handleRecommendationContinue,
    clearQuizData,
  };
};
