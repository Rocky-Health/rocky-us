import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";

const MoreQuestions = ({
  title,
  link,
  buttonText,
  buttonWidth = "sm:w-[172px]",
  bg = "bg-[#F5F4EF] "
}) => {
  return (
    <div className={` block sm:h-[80px] mt-[40px] sm:mt-[96px] p-4 sm:px-[24px] sm:py-[18px] ${bg} flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between items-center rounded-[16px] mx-auto border-[0.5px] border-solid border-[#E2E2E1]`}>
      <h1 className="text-[20px] md:text-[24px] leading-[23px] md:leading-[24px] font-[500] md:font-[450] max-w-[280px] md:max-w-full text-center md:headers-font">
        {title || "Have more questions? We’ve got answers."}
      </h1>
      <Link
        href={link || "/faqs"}
        className={`inline-flex items-center justify-center ${buttonWidth} py-3 px-4 h-[44px] border border-solid border-[#000000] text-[14px] leading-[19.6px] font-[500] rounded-[64px] text-[#FFFFFF] bg-black hover:bg-gray-800 duration-100`}
        prefetch={true}
      >
        <span>{buttonText || "See All FAQs"}</span>
        <FaLongArrowAltRight className="ml-2" />
      </Link>
    </div>
  );
};

export default MoreQuestions;
