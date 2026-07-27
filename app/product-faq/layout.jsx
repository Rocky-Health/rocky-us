import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Product FAQs",
  description:
    "Find answers to frequently asked questions about our products including medications for sexual health, hair loss treatments, and hair care products.",
  path: "/product-faq",
  caPath: "/product-faq",
});

export default function ProductFaqLayout({ children }) {
  return <>{children}</>;
}
