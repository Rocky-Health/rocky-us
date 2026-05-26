import "@/app/globals.css";
import { Inter } from "next/font/google";

import LoadingOverlay from "@/components/utils/LoadingBar";
import "react-toastify/dist/ReactToastify.css";
import EdNavbar from "@/components/PreLanders/EdNavbar";
import EdFooter from "@/components/PreLanders/EdFooter";
import { buildMetadata } from "@/lib/seo/metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata = buildMetadata({
  title: "Online Healthcare for Men",
  description:
    "Discreet, clinician-led care from MyRocky — ED, hair loss, weight management and more, prescribed online and delivered across the US.",
});

export default function palendarLayout({ children }) {
  return (
    <>
      <LoadingOverlay />
      <EdNavbar />
      {children}
      <EdFooter />
    </>
  );
}
