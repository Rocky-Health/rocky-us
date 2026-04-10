"use client";

import React, { useEffect, useMemo, useState } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import CustomImage from "@/components/utils/CustomImage";
import Loader from "@/components/Loader";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import { WLProducts } from "../../data/PreConsultationProductsData";
import Glp2TreatmentCard from "./Glp2TreatmentCard";
import useDailyPatientCounter from "../hooks/useDailyPatientCounter";
import { trackMetaProductSelection } from "@/utils/metaQuestionnaireTracking";

const ALLOWED_PRODUCT_IDS = ["489798", "489523"];
const COUNTER_BASE_BY_PRODUCT = {
  489798: 872, // Semaglutide
  489523: 621, // Tirz
};
const COUNTER_ANCHOR_DATE = "2026-04-03";

const WEIGHT_LOSS_PRODUCT_IDS = [
  "489523",
  "489798",
  "142975",
  "160468",
  "250827",
  "369618",
];

const TreatmentCardWithCounter = ({
  product,
  title,
  subtitle,
  badge,
  baseCount,
  onSelect,
  isSelected,
}) => {
  const { displayCount } = useDailyPatientCounter(
    COUNTER_ANCHOR_DATE,
    baseCount,
  );

  return (
    <Glp2TreatmentCard
      product={product}
      title={title}
      subtitle={subtitle}
      badge={badge}
      counterText={`${displayCount.toLocaleString()} patients chose this today`}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};

const Glp2RecommendationStep = ({
  recommended,
  alternatives,
  selectedProduct,
  setSelectedProduct,
  onContinue,
  onBeforeCheckout,
  onNavigateToPlanStep,
}) => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const router = useRouter();

  const fallbackProducts = useMemo(
    () => [
      WLProducts.COMPOUNDED_TIRZEPATIDE,
      WLProducts.COMPOUNDED_SEMAGLUTIDE,
    ],
    [],
  );

  const cardMetaById = useMemo(
    () => ({
      489798: {
        title: "Semaglutide",
        subtitle: "Proven, effective, more affordable.",
        badge: "🪙 More Affordable",
      },
      489523: {
        title: "Tirzepatide",
        subtitle: "Faster results, dual-action, but more expensive.",
        badge: "⚡ Fastest Results",
      },
    }),
    [],
  );

  const productsToRender = useMemo(() => {
    const source = [recommended, ...(alternatives || [])].filter(Boolean);
    const byId = new Map();

    source.forEach((product) => {
      const id = String(product?.id || "");
      if (ALLOWED_PRODUCT_IDS.includes(id)) byId.set(id, product);
    });

    fallbackProducts.forEach((product) => {
      const id = String(product?.id || "");
      if (ALLOWED_PRODUCT_IDS.includes(id) && !byId.has(id))
        byId.set(id, product);
    });

    return ALLOWED_PRODUCT_IDS.map((id) => byId.get(id)).filter(Boolean);
  }, [recommended, alternatives, fallbackProducts]);

  useEffect(() => {
    if (!productsToRender.length) return;
    const semaProduct =
      productsToRender.find((p) => String(p?.id || "") === "489798") ||
      productsToRender[0];

    if (!selectedProduct) {
      setSelectedProduct(semaProduct);
      return;
    }

    if (
      selectedProduct &&
      !ALLOWED_PRODUCT_IDS.includes(String(selectedProduct.id || ""))
    ) {
      setSelectedProduct(semaProduct);
    }
  }, [productsToRender, selectedProduct, setSelectedProduct]);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    if (showLoader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [showLoader]);

  const handleCheckout = async () => {
    if (!selectedProduct) return;

    try {
      trackMetaProductSelection({
        flow_id: "weight-loss",
        questionnaire_id: "glp2-pre-consultation",
        content_id: String(selectedProduct.id || ""),
        selection_type: "product",
        selection_value: selectedProduct.id || "",
      });
    } catch (_) {}

    if (
      typeof onBeforeCheckout === "function" &&
      onBeforeCheckout(selectedProduct)
    ) {
      if (typeof onNavigateToPlanStep === "function") onNavigateToPlanStep();
      return;
    }

    try {
      setIsCheckoutLoading(true);

      const mainProductForCheckout = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        isSubscription: selectedProduct.isSubscription || false,
      };

      if (WEIGHT_LOSS_PRODUCT_IDS.includes(String(selectedProduct.id))) {
        addRequiredConsultation(selectedProduct.id, "wl-flow");
      }

      const result = await wlFlowAddToCart(mainProductForCheckout, [], {
        requireConsultation: true,
        checkoutQueryParams: { "glp2-checkout": "1" },
      });

      if (result.success) {
        if (typeof window !== "undefined" && result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        router.push(result.redirectUrl);
        if (typeof onContinue === "function") onContinue();
      } else {
        logger.error("GLP2 cart addition failed:", result.error);
        alert("There was an issue processing your checkout. Please try again.");
      }
    } catch (error) {
      logger.error("Error during GLP2 checkout:", error);
      alert("There was an issue processing your checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (!productsToRender.length) {
    return (
      <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6">
        <div className="text-center">
          Loading your personalized recommendations...
        </div>
      </div>
    );
  }

  const isContinueEnabled = selectedProduct !== null;

  return (
    <div className="w-full mx-auto px-[16px] md:px-0 flex flex-col min-h-screen relative pb-32">
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}

      {showLoader && (
        <div className="fixed inset-0 z-[20000] bg-white flex justify-center items-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg
              className="absolute w-24 h-24 animate-[spin_5.5s_linear_infinite]"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="2 10"
                opacity="0.85"
              />
            </svg>
            <div className="relative text-2xl font-bold text-black">
              <CustomImage
                src="https://myrocky.b-cdn.net/WP%20Images/convert_test/reloader.png"
                width="30"
                height="30"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="w-full md:w-[520px] mx-auto">
          <div className="progress-indicator mb-2 text-[#A7885A] font-medium">
            <span className="text-sm">Here's what we recommended</span>
          </div>
          <div className="progress-bar-wrapper w-full block h-[8px] my-1 rounded-[10px] bg-gray-200">
            <div
              style={{ width: "100%" }}
              className="progress-bar bg-[#A7885A] rounded-[10px] block float-left h-[8px]"
            />
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <h2 className="subheadres-font tracking-tighter leading-[115%] text-[32px] font-[400] text-[#000000] mb-[30px] text-center">
          Choose your treatment
        </h2>

        <div className="mb-8 space-y-3 w-full md:w-[580px] mx-auto">
          {productsToRender.map((product) => (
            <TreatmentCardWithCounter
              key={product.id ?? product.name}
              product={product}
              title={cardMetaById[String(product.id)]?.title || product.name}
              subtitle={
                cardMetaById[String(product.id)]?.subtitle ||
                product.description
              }
              badge={cardMetaById[String(product.id)]?.badge || ""}
              baseCount={COUNTER_BASE_BY_PRODUCT[String(product.id)] || 621}
              onSelect={(picked) => setSelectedProduct(picked)}
              isSelected={selectedProduct?.id === product.id}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-4 flex items-center justify-center z-50 bg-white">
        <div className="w-[335px] md:w-[520px] max-w-xl flex flex-col gap-3">
          <button
            className={`w-full py-3 rounded-full font-medium ${
              isContinueEnabled
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={isContinueEnabled ? handleCheckout : undefined}
            disabled={!isContinueEnabled || isCheckoutLoading}
          >
            {isCheckoutLoading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2RecommendationStep;
