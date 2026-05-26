import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mental Health Treatment & Support",
  description:
    "Access professional mental health treatment and support online with MyRocky. Personalized care and effective solutions delivered discreetly across US.",
  path: "/mental-health",
  vertical: "mental-health",
});

export default function MentalHealthLayout({ children }) {
  return <>{children}</>;
}
