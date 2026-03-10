import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";

export default function ContactUsDetails() {
  return (
    <div className="relative flex flex-col md:flex-row overflow-hidden rounded-[16px] w-full h-[984px] md:h-[906px] z-0">
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <CustomImage
          src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/contact-us-cover-m.webp"
          alt="cover-image"
          fill
          className="md:hidden"
        />
        <CustomImage
          src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/contact-us-cover-d.webp"
          alt="cover-image"
          fill
          className="hidden md:block "
        />
      </div>
      {/* Overlay Content */}
      <div className="z-10 p-6 md:px-20 md:py-[94.5px] flex flex-col  ">
        {/* Contact Us Heading */}
        <h2 className="text-[32px] md:text-[48px] leading-[115%] tracking-[-0.01em] md:tracking-[-0.02em] mb-[4px] headers-font">
          Contact Us
        </h2>
        <p className="text-[#814B00] text-[16px] md:text-[20px] font-[400] leading-[140%] mb-[21px] md:mb-14">
          We're here for you.
        </p>

        {/* Contact Details */}
        <div className="space-y-[18px] md:space-y-[33px]">
          <div>
            <p className="text-[16px] md:text-[24px] tracking-[-0.02em] leading-[110%] mb-3 md:mb-4  capitalize headers-font">
              For customer care inquiries:
            </p>
            <Link
              href="mailto:contact@myrocky.com"
              className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  "
            >
              contact@myrocky.com
            </Link>
          </div>

          <div>
            <p className="text-[16px] md:text-[24px] tracking-[-0.02em] leading-[110%] mb-3 md:mb-4  capitalize headers-font">
              For clinical inquiries:
            </p>
            <Link
              href="mailto:clinic@myrocky.com"
              className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  "
            >
              clinic@myrocky.com
            </Link>
          </div>

          <div className="space-y-2 md:space-y-4">
            <p className="text-[16px] md:text-[24px] tracking-[-0.02em] leading-[110%] mb-3 md:mb-4  capitalize headers-font">
              For pharmacy inquiries:
            </p>
            <div>
              <Link
                href="mailto:info@myrocky.com"
                className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  "
              >
                pharmacy@myrocky.com
              </Link>
            </div>

            <div>
              <p className="text-[14px] md:text-[16px] font-[500] leading-[140%] mb-1">
                Fax:
              </p>

              <Link
                href="tel:+12892761173"
                className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  "
              >
                +1 (289) 276-1173
              </Link>
            </div>
            {/* <div>
              <p className="text-[14px] md:text-[16px] font-[500] leading-[140%] mb-1">
                Pharmacy address:
              </p>
              <p className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  ">
                15 - 5270 Solar Dr. <br /> Mississauga, ON L4W 5M8
              </p>
            </div>
            <div>
              <p className="text-[14px] md:text-[16px] font-[500] leading-[140%] mb-1">
                Hours:
              </p>
              <p className="text-[14px] md:text-[16px] leading-[140%] font-[600] text-[#814b00] hover:text-[#4e340fec]  ">
                Mon-Fri 6-8pm EST
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
