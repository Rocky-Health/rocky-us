import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ChangingResults = () => {
  return (
    <>
      <div className="bg-[#F0EEEA] md:py-[72px] overflow-x-hidden">
        <div className="text-center md:mb-[48px]">
          <h2 className="md:text-[48px] subheaders-font font-medium leading-[115%] tracking-tight ">
            <span className="text-[#AE7E56] block">Join 350,000+ Members</span>{" "}
            Achieving Life-Changing Results.
          </h2>
        </div>

        <div className="hidden md:flex justify-center flex-col items-center gap-[16px] my-[48px]">
          <CustomImage
            src={`/bo4/album_1.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
          <CustomImage
            src={`/bo4/album_3.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
          <CustomImage
            src={`/bo4/album_2.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
        </div>

        <div>
          <div className="flex justify-center items-center gap-[10px]">
            <Link
              href={"/wl-pre-consultation"}
              className="md:text-[18px] leading-[140%] font-medium bg-black px-[24px] rounded-full text-white py-[10px] mt-[32px] inline-block"
            >
              Start Your Weight Loss Journey{" "}
              <FaArrowRight className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangingResults;
