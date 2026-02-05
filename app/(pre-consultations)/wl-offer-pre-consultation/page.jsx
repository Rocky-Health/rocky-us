"use client";

import React from "react";
import WLOfferPreConsultationFlow from "@/components/WLPreConsultationQuizV2/WLOffer/WLOfferPreConsultationFlow";

// Dedicated route for wl-offer pre-consultation
// This is completely isolated from /wl-pre-consultation and uses its own config
// with isolated recommendation step (WLOfferRecommendationStep) that doesn't use GenericRecommendationStep
// This allows for custom features specific to this flow
export default function WLOfferPreConsultationPage() {
  return (
    <main>
      <WLOfferPreConsultationFlow />
    </main>
  );
}
