import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about MyRocky — consultations, prescriptions, shipping, billing, and how online telehealth works.",
  path: "/faqs",
  caPath: "/faqs",
});

export default function FaqsLayout({ children }) {
  return <>{children}</>;
}
