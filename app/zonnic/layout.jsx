import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Smoking Cessation with Zonnic",
  description:
    "Discover effective smoking cessation solutions with Zonnic by MyRocky. Professional support and nicotine replacement therapy to help you quit smoking for good.",
  path: "/zonnic",
  vertical: "smoking",
});

export default function ZonnicLayout({ children }) {
  return <>{children}</>;
}
