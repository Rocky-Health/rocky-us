import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";

const getStorageKeys = () => ({
  STORAGE_KEY: "new-bo-preqiz-data",
  ESSENTIAL_CONSUL_KEY: "new-bo-essential-consul",
});

export const useGlp1PreConsultation3QuizData = () => {
  const { STORAGE_KEY, ESSENTIAL_CONSUL_KEY } = getStorageKeys();

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : {};

        const dataToSave = { ...userData };
        delete dataToSave.password;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            userData: dataToSave,
            selectedProduct,
          }),
        );

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
    logger.log(
      "🛒 GLP1 pre-consultation v3 - Proceeding with selected product:",
      selectedProduct,
    );

    setUserData((prev) => ({
      ...prev,
      selectedProduct: selectedProduct,
    }));
  };

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
