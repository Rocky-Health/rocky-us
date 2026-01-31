"use client";

import React from "react";
import BOSimplifiedFlow from "@/components/WLPreConsultationQuizV2/BOSimplified/BOSimplifiedFlow";

// Dedicated route for BO pre-consultation
// This is completely independent from /wl-pre-consultation
export default function BOPreConsultationPage() {
  return (
    <main>
      <BOSimplifiedFlow />
    </main>
  );
}
