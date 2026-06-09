import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  noindex: true,
});

export default function Bo4Layout({ children }) {
  return <>{children}</>;
}
