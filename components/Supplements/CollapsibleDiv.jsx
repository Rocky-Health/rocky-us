"use client";

import { IoIosArrowDown } from "react-icons/io";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const CollapsibleDiv = ({ title, description, show = false, onToggle }) => {
  const toggleOpen = () => {
    if (onToggle) {
      onToggle(!show);
    }
  };

  return (
    <div onClick={toggleOpen} className="cursor-pointer">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[14px] font-[POPPINS] font-medium leading-[140%] tracking-[0px]">
          {title}
        </h2>
        <IoIosArrowDown
          className={
            show
              ? "rotate-[180deg] transition-transform"
              : "rotate-0 transition-transform"
          }
        />
      </div>
      {show && (
        <div
          className="text-[14px] transition-transform mb-[12px] font-[POPPINS] font-normal leading-[140%] tracking-[0px] text-[#000000CC]"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      )}
      <hr className="mt-[16px] mb-[16px] border-[#D9D9D5]" />
    </div>
  );
};

export default CollapsibleDiv;
