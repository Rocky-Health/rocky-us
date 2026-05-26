import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Hair Loss Treatment & Solutions",
  description:
    "Get professional hair loss treatment and solutions online with MyRocky. Effective medications and hair care products delivered discreetly across US.",
  path: "/hairloss",
  vertical: "hair",
});

export default function HairlossLayout({ children }) {
  return <>{children}</>;
}
