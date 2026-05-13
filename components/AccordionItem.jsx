"use client";
import CustomImage from "@/components/utils/CustomImage";
import CustomContainImage from "@/components/utils/CustomContainImage";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const AccordionItem = ({ item, isOpen, onClick, isFirst }) => {
  return (
    <div>
      <li
        className={`text-md md:text-[20px] leading-[28px] font-[400] py-5 cursor-pointer ${
          isFirst ? "" : "border-t border-[#E2E2E1]"
        }`}
        onClick={onClick}
      >
        {item.subtitle && (
          <p className="block text-[#814B00] text-[12px] md:text-[14px]">
            {item.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-2">
            {item.icon && (
              <div className="relative overflow-hidden min-h-[24px] h-[24px] min-w-[24px] w-[24px]">
                <CustomImage src={item.icon} fill />
              </div>
            )}
            <p className="text-[18px] md:text-[24px]">{item.title}</p>
          </div>
          <span
            className={`transform transition-transform duration-300 flex items-center justify-center ${
              isOpen ? "rotate-[270deg]" : "rotate-90"
            }`}
          >
            &gt;
          </span>
        </div>
      </li>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-[14px] md:text-[16px] pb-4">
          {/* {item.content} */}
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}></div>
          {item.image && (
            <div className="relative overflow-hidden rounded-[16px] w-full h-[250px] md:hidden ">
              <CustomContainImage src={item.image} alt={item.title} fill />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
