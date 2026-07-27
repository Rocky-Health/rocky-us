import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About MyRocky",
  description:
    "MyRocky is an online clinic built for men — clinician-led, discreet, and designed around the way men want to access healthcare in the US.",
  path: "/about-us",
  caPath: "/about-us",
});

export default function AboutUsLayout({ children }) {
  return <>{children}</>;
}
