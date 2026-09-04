import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Prescription Skincare for Americans",
  description:
    "Personalized prescription skincare from MyRocky — acne, anti-aging, and hyperpigmentation treatments formulated for your unique needs, delivered across the US.",
  vertical: "skincare",
});

export default function SkincareLpsLayout({ children }) {
  return <>{children}</>;
}
