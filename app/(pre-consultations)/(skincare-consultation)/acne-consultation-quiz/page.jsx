import { Suspense } from "react";
import AcneQuiz from "@/components/SkincareConsultation/AcneQuiz/AcneQuiz";
import SkincareQuizLoader from "@/components/SkincareConsultation/components/SkincareQuizLoader";

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
      <Suspense fallback={<SkincareQuizLoader />}>
        <AcneQuiz />
      </Suspense>
    </>
  );
}
