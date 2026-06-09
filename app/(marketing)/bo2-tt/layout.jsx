import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  noindex: true,
});

export default function Bo2ttLayout({ children }) {
  return <>{children}</>;
}
