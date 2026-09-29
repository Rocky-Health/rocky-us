import CustomImage from "@/components/utils/CustomImage";
import Link from "next/link";
import ListWithIcons from "@/components/ListWithIcons";
import { FaArrowRightLong } from "react-icons/fa6";
import ProudPartner from "./ProudPartner";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const PageCover = ({ data, items, priority = false }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-20 items-center">
      <div>
        {data.title && (
          <h6 className="text-[16px] md:text-[20px] leading-[16px] md:leading-[30px] md:tracking-[-0.02em] mb-2 font-[400] font-poppins">
            {data.title}
          </h6>
        )}

        {data.subtitle && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.subtitle) }}
            className="text-[32px] lg:text-[48px] headers-font leading-[36.8px] md:leading-[53.52px] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-4 md:mb-8 capitalize"
          ></div>
        )}
        {data.upperNote && (
          <div
            className="text-[14px] md:text-[16px] md:tracking-[-0.02em] mb-[24px] md:mb-[40px] w-[300px] md:w-[390px] h-[58px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.upperNote) }}
          ></div>
        )}
        {items && <ListWithIcons items={items} />}

        <div className="flex flex-col lg:flex-row gap-2">
          {data.buttons.map((button, index) => (
            <Link
              key={button.href ?? index}
              href={button.href}
              className={`h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center ${
                button.width || "w-full"
              } ${
                button.color
                  ? `${button.color} hover:bg-gray-800 text-white`
                  : button.primary
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-white border-solid border border-black text-black hover:bg-gray-100"
              }`}
            >
              <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
                {button.text}
              </span>
              <FaArrowRightLong />
            </Link>
          ))}
        </div>
        {data.note && (
          <div
            className="text-[12px] text-center mt-5 w-full md:w-[310px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.note) }}
          ></div>
        )}
        <div className="hidden md:block">
          {data.proudPartner && (
            <>
              <br />
              <br />
              <ProudPartner section />
            </>
          )}
        </div>
      </div>
      <div
        className={`relative overflow-hidden rounded-[16px] w-full h-[335px] ${
          data.imageHeight || "md:h-[696px]"
        } `}
      >
        <CustomImage src={data.image} alt={data.title} fill sizes="(max-width: 767px) 100vw, 592px" priority={priority} />
      </div>
      <div className=" md:hidden ">
        {data.proudPartner && <ProudPartner section />}
      </div>
    </div>
  );
};

export default PageCover;
