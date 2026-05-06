import dynamic from "next/dynamic";
import PrEdQuiz2FlowLoading from "@/components/PreLanders/ed-1/pr-ed-quiz-2/components/PrEdQuiz2FlowLoading";

const PrEdQuiz2Flow = dynamic(
  () => import("@/components/PreLanders/ed-1/pr-ed-quiz-2/components/PrEdQuiz2Flow"),
  { loading: () => <PrEdQuiz2FlowLoading /> },
);

export default function PrEdQuiz2Page() {
  return <PrEdQuiz2Flow destinationHref="/ed-pre-consultation-quiz" />;
}
