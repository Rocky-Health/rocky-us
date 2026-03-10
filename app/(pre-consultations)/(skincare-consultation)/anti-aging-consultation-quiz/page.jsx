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
        iframe[title="Close message"] {
          display: none !important;
        }
        iframe[title="Message from company"] {
          display: none !important;
        }
        `,
        }}
      />
      <AntiAgingQuiz />
    </>
  );
}
