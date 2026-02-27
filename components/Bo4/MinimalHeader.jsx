import Link from "next/link";
import Logo from "../Navbar/Logo";
import { FaArrowRight } from "react-icons/fa";

const MinimalHeader = ({
  CTA = "/wl-pre-consultation",
  BorderBottom = false,
  CustomLinkText = "Get Started",
}) => {
  return (
    <div
      className={`max-w-[1140px] mx-auto flex justify-between items-center ${BorderBottom ? "border-b" : ""}`}
    >
      <Logo />

      <Link
        href={CTA}
        className="md:text-[14px] leading-[140%]  font-medium bg-black px-[24px] rounded-full text-white py-[6px]"
      >
        {CustomLinkText} <FaArrowRight className="inline ml-1" />
      </Link>
    </div>
  );
};

export default MinimalHeader;
