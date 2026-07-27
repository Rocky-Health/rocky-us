import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Online ED Treatment in the US — Discreet Care",
  description:
    "Get prescription ED treatment online from licensed clinicians. Confidential consultations and discreet delivery of sildenafil, tadalafil and more from MyRocky.",
  path: "/ed",
  caPath: "/ed",
  vertical: "ed",
});

export default function EdLayout({ children }) {
  return <>{children}</>;
}
