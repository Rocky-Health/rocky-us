"use client";

import React, { useEffect, useMemo, useState } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import { WLProducts } from "../../data/PreConsultationProductsData";
import Glp2TreatmentCard from "./Glp2TreatmentCard";
import Glp2PlanOptionsSection from "./Glp2PlanOptionsSection";
import useDailyPatientCounter from "../hooks/useDailyPatientCounter";
import {
  trackMetaPlanSelection,
  trackMetaProductSelection,
  logMetaTrackingError,
} from "@/utils/metaQuestionnaireTracking";

const ALLOWED_PRODUCT_IDS = ["489799", "489523"];
const COUNTER_BASE_BY_PRODUCT = {
  489799: 872,
  489523: 621,
};
const COUNTER_ANCHOR_DATE = "2026-04-03";

const WEIGHT_LOSS_PRODUCT_IDS = [
  "489523",
  "489799",
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

const Glp2TreatmentAndPlanStep = ({
  recommended,
  alternatives,
  selectedProduct,
  setSelectedProduct,
  planOptionsByProduct,
  onContinue,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
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
      489799: {
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
      productsToRender.find((p) => String(p?.id || "") === "489799") ||
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

  const planValues = useMemo(() => {
    if (!selectedProduct) return [];
    const productPlans =
      planOptionsByProduct?.[String(selectedProduct.id)] || {};
    const preferredOrder = ["monthly", "3month", "6month", "12month"];
    return preferredOrder.map((key) => productPlans[key]).filter(Boolean);
  }, [selectedProduct, planOptionsByProduct]);

  useEffect(() => {
    if (!selectedProduct) {
      setSelectedPlan(null);
      return;
    }
    if (!planValues.length) return;
    const defaultPlan = planValues.find((p) => p.isDefault) || planValues[0];
    setSelectedPlan(defaultPlan);
  }, [planValues, selectedProduct]);

  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = showLoader ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [showLoader]);

  const proceedWithPlan = async (plan) => {
    if (!selectedProduct || !plan || isCheckoutLoading) return;
    try {
      setIsCheckoutLoading(true);
      setSelectedPlan(plan);

      // Product selection fires before plan selection — this is the combined
      // UI's substitute for a standalone product step. Idempotency on the
      // utility side prevents double-counting if the user re-enters the flow.
      try {
        trackMetaProductSelection({
          flow_id: "weight-loss",
          questionnaire_id: "glp1-pre-consultation-3",
          content_id: String(selectedProduct.id || ""),
          selection_type: "product",
          selection_value: String(selectedProduct.id || ""),
        });
      } catch (err) {
        logMetaTrackingError(err, { flow_id: "weight-loss", questionnaire_id: "glp1-pre-consultation-3", milestone: "PRODUCT_SELECTION" });
      }

      try {
        trackMetaPlanSelection({
          flow_id: "weight-loss",
          questionnaire_id: "glp1-pre-consultation-3",
          content_id: String(selectedProduct.id || ""),
          selection_type: "plan",
          selection_value: plan?.id || "",
        });
      } catch (err) {
        logMetaTrackingError(err, { flow_id: "weight-loss", questionnaire_id: "glp1-pre-consultation-3", milestone: "PLAN_SELECTION" });
      }

      if (typeof onContinue === "function") {
        await onContinue(plan);
        return;
      }

      const mainProductForCheckout = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: plan?.price || selectedProduct.price,
        quantity: 1,
        isSubscription: selectedProduct.isSubscription || false,
      };
      if (WEIGHT_LOSS_PRODUCT_IDS.includes(String(selectedProduct.id))) {
        addRequiredConsultation(selectedProduct.id, "wl-flow");
      }
      const result = await wlFlowAddToCart(mainProductForCheckout, [], {
        requireConsultation: true,
        checkoutQueryParams: { "glp1-pc3-checkout": "1" },
      });
      if (result.success) {
        if (typeof window !== "undefined" && result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        router.push(result.redirectUrl);
      } else {
        logger.error("GLP2 checkout failed:", result.error);
      }
    } catch (error) {
      logger.error("Error during GLP2 checkout:", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 md:px-0 flex flex-col min-h-screen relative pb-10">
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}

      {showLoader && (
        <div className="fixed inset-0 z-[20000] bg-white flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="mx-auto mb-8 mt-10 w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-[#A7885A] text-white text-sm font-semibold px-3 py-1">
            Step 1
          </span>
          <h2 className="subheadres-font text-xl md:text-[32px] leading-[115%] font-[400] text-[#000000]">
            Select Treatment
          </h2>
        </div>

        <div className="space-y-3">
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

      {selectedProduct ? (
        <Glp2PlanOptionsSection
          planValues={planValues}
          selectedPlan={selectedPlan}
          onSelectPlan={(plan) => void proceedWithPlan(plan)}
          disabled={isCheckoutLoading}
        />
      ) : null}
    </div>
  );
};

export default Glp2TreatmentAndPlanStep;
