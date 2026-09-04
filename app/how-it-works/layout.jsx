import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "How MyRocky Works",
  description:
    "From online consultation to clinician-prescribed treatment delivered to your door — see how MyRocky makes healthcare in the US simple and discreet.",
  path: "/how-it-works",
  caPath: "/how-it-works",
});

export default function HowItWorksLayout({ children }) {
  return <>{children}</>;
}
