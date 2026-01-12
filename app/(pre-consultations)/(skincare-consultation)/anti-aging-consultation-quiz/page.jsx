import AntiAgingQuiz from "@/components/SkincareConsultation/AntiAgingQuiz/AntiAgingQuiz";

export default function AntiAgingQuizPage() {
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
      <AntiAgingQuiz />
    </>
  );
}
