import { Suspense } from "react";
import AcneQuiz from "@/components/SkincareConsultation/AcneQuiz/AcneQuiz";

export default function AcneConsultationQuiz() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          #launcher {
            display: none !important;
          }
        `,
        }}
      />
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-[#AE7E56] animate-spin" />
              <p className="mt-4 text-gray-600 font-medium">
                Loading your consultation...
              </p>
            </div>
          </div>
        }
      >
        <AcneQuiz />
      </Suspense>
    </>
  );
}
