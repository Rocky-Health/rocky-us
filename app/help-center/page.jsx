import HelpCenterContent from "@/components/HelpCenter/HelpCenterContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Help Center",
  description:
    "Find answers about MyRocky treatments, consultations, shipping, prescriptions, and your account. Browse FAQs or reach our care team directly.",
  path: "/help-center",
  caPath: "/help-center",
});

export default function HelpCenterPage() {
  return <HelpCenterContent />;
}
