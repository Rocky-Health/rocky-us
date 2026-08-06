import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";

// Get storage keys for new BO pre-quiz
const getStorageKeys = () => {
  return {
    STORAGE_KEY: "new-bo-preqiz-data",
    ESSENTIAL_CONSUL_KEY: "new-bo-essential-consul",
  };
};

export const useBOQuizData = () => {
  const { STORAGE_KEY, ESSENTIAL_CONSUL_KEY } = getStorageKeys();

  // Answers start empty and are rehydrated from the secure cookie on mount
  // (see the /api/wl/pre-state hydration effect below). No PHI is read from or
  // written to localStorage in the BO pre-consult anymore.
  const [userData, setUserData] = useState({});

  const [activePopup, setActivePopup] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [history, setHistory] = useState([]);
  const cookieTimer = useRef(null);

  // Primary secure store: persist the pre-consult answers to a server-encrypted
  // httpOnly cookie via /api/wl/pre-state (debounced). The client never sees the
  // plaintext or the key. Password is stripped before sending.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dataToSave = { ...userData };
    delete dataToSave.password;
    if (cookieTimer.current) clearTimeout(cookieTimer.current);
    cookieTimer.current = setTimeout(() => {
      fetch("/api/wl/pre-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData: dataToSave, selectedProduct }),
      }).catch((e) => logger.warn("pre-state cookie sync failed:", e.message));
    }, 800);
  }, [userData, selectedProduct]);

  // Hydrate from the secure cookie on mount (server-side read + decrypt), used
  // when localStorage did not seed initial state (e.g. cleared / new device).
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Clear any stale localStorage copies from before the cookie migration so no
    // PHI lingers for the BO pre-consult; the secure cookie is the only store now.
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ESSENTIAL_CONSUL_KEY);
    } catch (e) {}
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wl/pre-state");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data) return;
        if (data.userData && Object.keys(data.userData).length > 0) {
          setUserData((prev) =>
            Object.keys(prev).length ? prev : data.userData
          );
        }
        if (data.selectedProduct) {
          setSelectedProduct((prev) => prev || data.selectedProduct);
        }
      } catch (e) {
        logger.warn("pre-state hydrate failed:", e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    logger.log("🛒 New BO - Proceeding with selected product:", selectedProduct);

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
        // Also clear the secure server-encrypted cookie.
        fetch("/api/wl/pre-state", { method: "DELETE" }).catch(() => {});
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
