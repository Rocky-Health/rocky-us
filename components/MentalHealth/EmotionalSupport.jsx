import ImageWithList from "@/components/ImageWithList";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

const EmotionalSupport = () => {
  return (
    <>
      <div className="text-start mb-[32px] md:mb-[56px]">
        <h2 className="text-[32px] md:text-[48px] leading-[115%] mb-[12px] md:mb-[16px] tracking-[-0.01em] md:tracking-[-0.02em] headers-font">
          Emotional Support
        </h2>
        <p className="text-[16px] md:text-[20px] leading-[140%]">
          Whenever, Wherever.
        </p>
      </div>
      <ImageWithList
        image="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/image-1-new.webp"
        imagePosition="right"
        mobileImagePosition="bottom"
      >
        {/* Heading */}
        <div className="w-full">
          <div>
            <p className="text-[32px] md:text-[48px] text-[000000D9] leading-[35.68px] md:leading-[53.52px] tracking-[-0.01em] md:tracking-[-0.02em] mb-[24px] h-[74px] md:h-[117px] headers-font">
              Your Mental Health Matters:
            </p>
            <p className="text-[20px] leading-[24px] md:leading-[30px] text-[#535353] md:text-[#000000A6] tracking-[-0.02em] md:h[142px] mb-[24px] md:mb-[45px] md:h-[123px] md:w-[551px] subheaders-font md:poppins-font">
              At MyRocky, we deeply value your mental health as a crucial part of
              overall well-being. Providing access to the tools and support you
              need when you need them is our top priority. We are here to help
              you.
            </p>
          </div>
          {/* Button */}
          <div className="">
            <Link
              href="/mh-pre-quiz/"
              className="h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center w-full md:w-fit  bg-black text-white hover:bg-gray-800"
            >
              <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
                Find Your Treatment
              </span>
              <FaArrowRightLong />
            </Link>
          </div>
        </div>
      </ImageWithList>
    </>
  );
};

export default EmotionalSupport;
