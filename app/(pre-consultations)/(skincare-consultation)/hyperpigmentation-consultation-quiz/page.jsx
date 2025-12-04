import HyperpigmentationQuiz from "@/components/SkincareConsultation/HyperpigmentationQuiz/HyperpigmentationQuiz";

const HyperpigmentationQuizPage = () => {
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
      />{" "}
      <HyperpigmentationQuiz />
    </>
  );
};

export default HyperpigmentationQuizPage;
