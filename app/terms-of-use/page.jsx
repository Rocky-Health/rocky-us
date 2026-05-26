import SimpleTermsContent from "@/components/TermsOfUse/SimpleTermsContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description:
    "Terms governing your use of MyRocky's telehealth platform, prescriptions, and services in the US.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return <SimpleTermsContent />;
}
