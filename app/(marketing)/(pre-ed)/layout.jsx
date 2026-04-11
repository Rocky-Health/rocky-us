import "@/app/globals.css";
import { Inter } from "next/font/google";

import LoadingOverlay from "@/components/utils/LoadingBar";
import "react-toastify/dist/ReactToastify.css";
import EdNavbar from "@/components/PreLanders/EdNavbar";
import EdFooter from "@/components/PreLanders/EdFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MyRocky - Your Health Partner",
  description: "Get professional healthcare advice and treatment online",
  openGraph: {
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
  twitter: {
    card: "Get professional healthcare advice and treatment online",
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
};

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
