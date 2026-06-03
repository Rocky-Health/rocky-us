"use client";

import { Suspense } from "react";
import LongevityQuiz from "@/components/LongevityConsultation/LongevityQuiz";
import { quizConfig } from "@/components/LongevityConsultation/nad/config";

function NadQuizWithSuspense() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mb-4 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <LongevityQuiz config={quizConfig} />
      </Suspense>
    </>
  );
}

export default function NadConsultationQuiz() {
  return (
    <main className="min-h-screen">
      <NadQuizWithSuspense />
    </main>
  );
}
