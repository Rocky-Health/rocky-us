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
      <AcneQuiz />
    </>
  );
}
