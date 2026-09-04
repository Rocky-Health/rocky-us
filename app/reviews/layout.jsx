import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "MyRocky Patient Reviews",
  description:
    "Real reviews from Americans using MyRocky for ED, hair loss, weight management, mental health, and more. Verified Trustpilot ratings and testimonials.",
  path: "/reviews",
  caPath: "/reviews",
});

export default function ReviewsLayout({ children }) {
  return <>{children}</>;
}
