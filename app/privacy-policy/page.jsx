import PrivacyPolicyContent from "@/components/PrivacyPolicy/PrivacyPolicyContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How MyRocky collects, uses, and protects your personal and health information across our US telehealth platform.",
  path: "/privacy-policy",
  caPath: "/privacy-policy",
});

export default function privacyPolicy() {
  return <PrivacyPolicyContent />;
}
