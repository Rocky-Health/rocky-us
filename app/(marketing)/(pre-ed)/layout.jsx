import "@/app/globals.css";
import { Inter } from "next/font/google";

import LoadingOverlay from "@/components/utils/LoadingBar";
import "react-toastify/dist/ReactToastify.css";
import EdNavbar from "@/components/PreLanders/EdNavbar";
import EdFooter from "@/components/PreLanders/EdFooter";
import { buildMetadata } from "@/lib/seo/metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata = buildMetadata({
  title: "Online ED Care for Men",
  description:
    "Confidential ED consultations with licensed clinicians — discreet prescriptions delivered across the US by MyRocky.",
  vertical: "ed",
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
