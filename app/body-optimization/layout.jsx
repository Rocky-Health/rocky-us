import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Body Optimization & Weight Management",
  description:
    "Discover personalized body optimization and weight management solutions with MyRocky. Professional healthcare advice and effective treatments delivered across US.",
  path: "/body-optimization",
  vertical: "wl",
});

export default function BodyOptimizationLayout({ children }) {
  return <>{children}</>;
}
