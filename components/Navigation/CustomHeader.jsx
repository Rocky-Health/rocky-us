"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * A customizable header component that can be used across different flows
 *
 * @param {Object} props Component props
 * @param {string} props.logoUrl URL to the logo image
 * @param {string} props.logoAlt Alt text for the logo
 * @param {number} props.logoWidth Width of the logo in pixels
 * @param {number} props.logoHeight Height of the logo in pixels
 * @param {string} props.linkUrl URL the logo links to
 * @param {string} props.className Additional classes for the header
 * @returns {JSX.Element} Header component
 */
const CustomHeader = ({
  logoUrl = "https://wpbe.myrocky.com/wp-content/uploads/2022/03/Rocky-Mens-Wellness-copy-4-1-300x120-1.png",
  logoAlt = "MyRocky",
  logoWidth = 90,
  logoHeight = 50,
  linkUrl = "/",
  className = "",
}) => {
  return (
    <header
      className={`bg-[#C5B9AC] py-1 ${className}`}
    >
      <div className="max-w-[1224px] mx-auto px-5 flex justify-center">
        <Link href={linkUrl}>
          <Image
            src={logoUrl}
            alt={logoAlt}
            width={logoWidth}
            height={logoHeight}
            
            priority
          />
        </Link>
      </div>
    </header>
  );
};

export default CustomHeader;
