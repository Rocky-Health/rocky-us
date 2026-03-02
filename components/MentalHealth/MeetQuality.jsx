import ImageWithList from "@/components/ImageWithList";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

const MeetQuality = () => {
  return (
    <ImageWithList
      image="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/Group 1171275481.webp"
      imagePosition="left"
      mobileImagePosition="bottom"
    >
      {/* Heading */}
      <div className="w-full">
        <div>
          <p className="text-[32px] md:text-[48px] text-[000000D9] leading-[35.68px] md:leading-[53.52px] tracking-[-0.01em] md:tracking-[-0.02em] mb-[24px]  headers-font">
            Life, meet quality.
          </p>
          <p className="text-[20px] md:text-[30px] leading-[24px] md:leading-[100%] text-[#000000A6] md:text-[#535353] tracking-[-0.02em] h-[73px] md:h[76px] mb-[24px] md:mb-[40px] md:w-[551px] subheaders-font">
            Start living a life of convenience, comfort, and control with MyRocky.
          </p>
        </div>
        {/* Button */}
        <div>
          <Link
            href="/mh-pre-quiz/"
            className="h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center w-full md:w-fit  bg-black text-white hover:bg-gray-800"
          >
            <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
              Get Treatment
            </span>
            <FaArrowRightLong />
          </Link>
        </div>
      </div>
    </ImageWithList>
  );
};

export default MeetQuality;
