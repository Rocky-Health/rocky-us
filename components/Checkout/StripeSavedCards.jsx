"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/utils/devLogger";

const CARD_BRAND_NAMES = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
  unknown: "Card",
};

const StripeSavedCards = ({
  onSelectCard,
  onAddNewCard,
  selectedCardId,
  disabled = false,
}) => {
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchSavedCards = useCallback(
    async (shouldAutoSelect = false) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/stripe-saved-cards");
        const data = await response.json();

        if (response.ok && data.success) {
          setSavedCards(data.cards || []);

          // Auto-select the default card on first load.
          if (shouldAutoSelect && data.cards?.length > 0) {
            const defaultCard =
              data.cards.find((c) => c.is_default) || data.cards[0];
            onSelectCard?.(defaultCard);
          }
        } else if (response.status === 401) {
          setSavedCards([]); // guest — show the new-card form
        } else {
          logger.warn("Failed to fetch saved cards:", data.message);
          setSavedCards([]);
        }
      } catch (err) {
        logger.error("Error fetching saved cards:", err);
        setError("Unable to load saved cards");
        setSavedCards([]);
      } finally {
        setLoading(false);
      }
    },
    [onSelectCard]
  );

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      fetchSavedCards(!selectedCardId);
    }
  }, [hasInitialized, fetchSavedCards, selectedCardId]);

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation();
    if (deletingCardId) return;
    if (!window.confirm("Are you sure you want to remove this card?")) return;

    try {
      setDeletingCardId(cardId);
      const response = await fetch("/api/stripe-saved-cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: cardId }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
        if (selectedCardId === cardId) {
          onAddNewCard?.();
        }
      } else {
        setError(data.message || "Failed to delete card");
      }
    } catch (err) {
      logger.error("Error deleting card:", err);
      setError("Failed to delete card");
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleSetDefault = async (cardId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/stripe-saved-cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: cardId, makeDefault: true }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSavedCards((prev) =>
          prev.map((c) => ({ ...c, is_default: c.id === cardId }))
        );
      } else {
        setError(data.message || "Failed to set default card");
      }
    } catch (err) {
      logger.error("Error setting default card:", err);
      setError("Failed to set default card");
    }
  };

  const getBrandName = (brand) =>
    CARD_BRAND_NAMES[(brand || "unknown").toLowerCase()] ||
    CARD_BRAND_NAMES.unknown;

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  // No saved cards — render nothing so the new-card form shows on its own.
  if (savedCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {savedCards.map((card) => {
        const brandName = getBrandName(card.brand);
        const isSelected = selectedCardId === card.id;
        const isDeleting = deletingCardId === card.id;

        return (
          <div
            key={card.id}
            onClick={() => !disabled && !isDeleting && onSelectCard?.(card)}
            className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            } ${disabled || isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-black" : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                )}
              </div>

              <div className="w-10 h-7 relative flex items-center justify-center bg-gray-50 rounded">
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {brandName.slice(0, 4)}
                </span>
              </div>

              <div>
                <p className="font-medium text-sm">
                  {brandName} •••• {card.last4}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {String(card.exp_month).padStart(2, "0")}/
                  {String(card.exp_year).slice(-2)}
                  {card.is_default && (
                    <span className="ml-2 text-green-600 font-medium">
                      Default
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!card.is_default && (
                <button
                  type="button"
                  onClick={(e) => handleSetDefault(card.id, e)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                  disabled={disabled || isDeleting}
                >
                  Set default
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleDeleteCard(card.id, e)}
                className="text-xs text-red-500 hover:text-red-700 p-1"
                disabled={disabled || isDeleting}
                title="Remove card"
              >
                {isDeleting ? (
                  <span className="inline-block w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Add a new card */}
      <div
        onClick={() => !disabled && onAddNewCard?.()}
        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
          !selectedCardId
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-300 bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            !selectedCardId ? "border-black" : "border-gray-300"
          }`}
        >
          {!selectedCardId && (
            <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
          )}
        </div>

        <div className="w-10 h-7 flex items-center justify-center bg-gray-100 rounded">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>

        <p className="font-medium text-sm">Add a new card</p>
      </div>
    </div>
  );
};

export default StripeSavedCards;
