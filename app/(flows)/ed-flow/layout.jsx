import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "ED",
  description:
    "Start your MyRocky erectile dysfunction (ED) consultation and treatment online. Discreet delivery across the US.",
  noindex: true,
});

export default function EdFlowLayout({ children }) {
  return <>{children}</>;
}
