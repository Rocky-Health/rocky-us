import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Sexual Health Treatment & Solutions",
  description:
    "Get professional sexual health treatment and solutions online with MyRocky. Discreet consultations and medication delivery across US.",
  path: "/sex",
  vertical: "ed",
});

export default function SexLayout({ children }) {
  return <>{children}</>;
}
