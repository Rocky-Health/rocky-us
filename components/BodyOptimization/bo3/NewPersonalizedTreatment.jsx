import ImageWithList from "@/components/ImageWithList";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

const PersonalizedTreatment = () => {
  return (
    <ImageWithList
      image="https://myrocky.b-cdn.net/WP%20Images/bo3/new/PersonalizedWeightLoss.jpg"
      imagePosition="left"
      mobileImagePosition="bottom"
    >
      {/* Heading */}
      <div className="w-full">
        <div>
          <p className="headers-font text-[#000] text-[36px] md:text-[48px] max-w-[281px] md:max-w-none font-[550] mb-4 md:mb-6 leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px]  md:capitalize not-italic">
            Personalized Weight Loss
          </p>
          <p className=" text-[#AE7E56] text-[24px] md:text-[28px] leading-normal font-[500] tracking-[-0.48px] md:tracking-[-0.56px] not-italic max-w-[228px] md:max-w-none mb-6 md:mb-8">
            No More Waiting, No More Judgment
          </p>
          <p className="poppins-font text-[#000] text-[16px] md:text-[18px] font-[400] leading-[140%] not-italic mb-6 md:mb-8 md:max-w-[488px]">
            Track lab results and progress, gain insights, manage appointments,
            treatments, and more—all from your all-in-1 Rocky Health portal.
          </p>
        </div>
        {/* Button */}
        <div className="w-full md:w-[186px]">
          <Link
            href="/wl-pre-consultation/"
            className="flex h-[48px] px-8 items-center justify-center gap-2 self-stretch md:self-auto w-full md:w-[186px] rounded-[64px] transition bg-[#013D3D] text-white hover:bg-gray-800"
          >
            <span className="poppins-font text-[#FFF] text-[16px] leading-[140%] not-italic">
              Learn more
            </span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </ImageWithList>
  );
};

export default PersonalizedTreatment;
