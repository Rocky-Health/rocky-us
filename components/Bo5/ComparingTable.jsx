"use client";
import { FaCheckCircle, FaRegTimesCircle, FaTimesCircle } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const ComparingTable = ({
  title,
  sec_title,
  third_title,
  desc = null,
  img,
  f_col = [],
  sec_col = [],
  third_col = [],
  fourth_col = [],
  section_bg = "bg-white",
  unique_col_bg = "",
}) => {
  // Define the gradient style
  const gradientStyle = {
    background: unique_col_bg ??
      "linear-gradient(348.23deg, #AE7E56 -6.68%, #F7EBE4 51.89%, #EFE2D7 88.25%)",
  };

  return (
    <div className={`w-full  mx-auto  ${section_bg}`}>
      {/* Title Section */}
      <div className="py-5 flex lg:hidden flex-col justify-center items-start gap-1">
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="w-full text-center md:text-left">
            <span className="text-black  text-[32px] font-[550] tracking-[-1%] leading-[115%]  text-center max-w-[265px] mx-auto">
             <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}></div>
            </span>
          </div>
          {desc && (
            <div className="w-full text-center md:text-left text-black text-base font-normal leading-relaxed">
              {desc}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex flex-row overflow-x-auto lg:overflow-x-hidden scrollbar-hide">
        {/* Features Column */}
        <div
          className={
            fourth_col.length >= 1 ? `w-1/3 lg:w-2/5` : `w-1/3 lg:w-[550px]`
          }
        >
          <div className="lg:h-[200px] h-[96px] border-b border-black flex items-center">
            {/* Empty space to align with other columns */}
            <div className="lg:flex hidden flex-col justify-start items-start gap-2">
              <div className="w-full text-center md:text-left md:py-[0px] py-[29px]">
                <span className="text-black font-[550] headers-font text-[46px] leading-[115%] tracking-[-2%]">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}></div>
                </span>
              </div>
              {desc && (
                <div className="w-full text-center md:text-left text-black text-base font-normal leading-relaxed">
                  {desc}
                </div>
              )}
            </div>
          </div>
          {f_col.map((item, index) => (
            <div
              key={index}
              className="lg:h-[80px] h-[96px] border-b border-black flex items-center lg:px-[6px]"
            >
              <div className="text-black text-[14px] md:text-[16px] lg:text-[16px] leading-[120%] font-semibold text-left">
                {item}
              </div>
            </div>
          ))}
          <div className="lg:h-14 h-[96px]"></div>
        </div>

        {/* Product Column */}
        <div
          className={
            fourth_col.length >= 1
              ? `w-1/3 lg:w-1/5 min-w-[90px] rounded-lg md:rounded-2xl`
              : `w-1/3 min-w-[90px] rounded-lg md:rounded-2xl`
          }
          style={gradientStyle}
        >
          <div className="lg:h-[200px] h-[96px] border-b border-black/95 flex justify-center items-center">
            <CustomImage
              src={img}
              width={125}
              height={125}
              className="md:w-[116px] md:h-[40px] w-[83px] h-[28px] object-contain"
            />
          </div>
          {sec_col.map((item, index) => (
            <div
              key={index}
              className="lg:h-[80px] flex-1 h-[96px] lg:px-2 px-1 border-b border-black/95 flex  md:justify-left  items-center"
            >
              <div className="flex flex-col w-full lg:w-auto lg:flex-row items-center justify-center md:justify-left  gap-1 lg:pl-[42px]">
                {item ? (
                  <>
                    <FaCheckCircle className="text-[#AE7E56] text-lg md:text-xl" /> <span className="text-[14px] md:text-[16px] font-[500] text-center md:text-left"><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}></div></span>
                  </>
                ) : (
                  <><FaRegTimesCircle className="text-black text-lg md:text-xl" /> <span className="text-[14px] md:text-[16px] font-[500] text-center md:text-left"><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}></div></span></>
                )}
              </div>
            </div>
          ))}
          <div className="lg:h-14 h-[96px]"></div>
        </div>

        {/* Second Column */}
        <div
          className={
            fourth_col.length >= 1
              ? `w-1/3 lg:w-1/5 min-w-[90px] rounded-lg md:rounded-2xl`
              : `w-1/3 min-w-[90px] rounded-lg md:rounded-2xl`
          }
        >
          <div className="lg:h-[200px] h-[96px] border-b border-black flex justify-center items-center">
            <div
              className={`text-black text-center text-[12px] lg:text-[18px] font-[POPPINS] font-medium leading-[120%] ${
                sec_title.length >= 20 ? `p-12` : `p-20`
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec_title) }}></div>
            </div>
          </div>
          {third_col.map((item, index) => (
            <div
              key={index}
              className="lg:h-[80px] flex-1 h-[96px] lg:px-2 px-1 border-b border-black/95 flex  md:justify-left  items-center"
            >
              <div className="flex flex-col w-full lg:w-auto lg:flex-row items-center justify-center md:justify-left  gap-1 lg:pl-[42px]">
                  <><FaRegTimesCircle className="text-black text-lg md:text-xl" /> <span className="text-[14px] md:text-[16px] font-[500] text-center md:text-left">{item}</span></>
              </div>
            </div>
          ))}
          <div className="lg:h-14 h-[96px]"></div>
        </div>

        {fourth_col.length >= 1 && (
          <>
            {/* third Column */}
            <div className="w-1/3 lg:w-1/4 min-w-[90px]">
              <div className="lg:h-[200px] h-[96px] border-b border-black flex justify-center items-center">
                <div
                  className={`text-black text-center text-[12px] lg:text-[18px] font-[POPPINS] font-medium leading-[120%] ${
                    third_title.length >= 20 ? `p-12` : `p-20`
                  }`}
                >
                  {third_title}
                </div>
              </div>
              {fourth_col.map((item, index) => (
                <div
                  key={index}
                  className="lg:h-[80px] flex-1 h-[96px] lg:px-2 px-1 border-b border-black/95 flex justify-center items-center"
                >
                  <div className="flex flex-col w-full lg:w-auto lg:flex-row items-center justify-center lg:gap-2 gap-1 lg:px-3">
                    {item ? (
                      <FaCheckCircle className="text-black text-lg md:text-xl" />
                    ) : (
                      <FaRegTimesCircle className="text-black text-lg md:text-xl" />
                    )}
                  </div>
                </div>
              ))}
              <div className="lg:h-14 h-[96px]"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparingTable;
