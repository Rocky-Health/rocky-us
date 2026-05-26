import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Checkout",
  description:
    "Complete your MyRocky consultation and treatment order securely. Discreet delivery across the US.",
  noindex: true,
});

export default function FlowsLayout({ children }) {
  return <>{children}</>;
}
