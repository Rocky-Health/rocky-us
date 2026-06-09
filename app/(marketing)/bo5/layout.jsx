import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  noindex: true,
});

export default function Bo5Layout({ children }) {
  return <>{children}</>;
}
