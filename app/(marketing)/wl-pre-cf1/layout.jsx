import { buildMetadata } from "@/lib/seo/metadata";
import QuestionnaireChrome from "./QuestionnaireChrome";

export const metadata = buildMetadata({
  noindex: true,
});

export default function WLPreQuestionnaireLayout({ children }) {
  return (
    <div className="ed-questionnaire-layout">
      <QuestionnaireChrome />
      {children}
    </div>
  );
}
