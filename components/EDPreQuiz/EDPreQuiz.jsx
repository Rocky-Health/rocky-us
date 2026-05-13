"use client";
import CoverSection from "@/components/utils/CoverSection";
import CustomImage from "@/components/utils/CustomImage";
import Link from "next/link";
import ListWithIcons from "@/components/ListWithIcons";
import { FaArrowRightLong } from "react-icons/fa6";
import ProudPartner from "@/components/ProudPartner";
import { CiClock1 } from "react-icons/ci";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const EDPreQuiz = ({
  headerText = "Take our 1-minute quiz.",
  subtitle,
  upperNote,
  features,
  buttons = [],
  note,
  image,
  imageHeight = "md:h-[696px]",
  showProudPartner = false,
}) => {
  return (
    <CoverSection>
      <div className="grid md:grid-cols-2 gap-6 md:gap-20 items-center">
        {/* Left Content */}
        <div>
          {/* Header with clock */}
          <div className="flex items-center space-x-2 mb-3">
            <CiClock1 />
            <span>{headerText}</span>
          </div>

          {/* Title */}
          {subtitle && (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(subtitle) }}
              className="text-[32px] lg:text-[48px] headers-font leading-[36.8px] md:leading-[53.52px] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-4 md:mb-8 capitalize"
            />
          )}

          {/* Upper Note */}
          {upperNote && (
            <div
              className="text-[14px] md:text-[16px] md:tracking-[-0.02em] mb-[24px] md:mb-[40px] w-[300px] md:w-[390px] h-[58px]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(upperNote) }}
            />
          )}

          {/* Features List */}
          {features && <ListWithIcons items={features} />}

          {/* Buttons */}
          {buttons.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-2">
              {buttons.map((button, index) => (
                <Link
                  key={index}
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
                  aria-label={button.ariaLabel}
                >
                  <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
                    {button.text}
                  </span>
                  <FaArrowRightLong />
                </Link>
              ))}
            </div>
          )}

          {/* Note */}
          {note && (
            <div
              className="text-[12px] text-center mt-5 w-full md:w-[310px]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(note) }}
            />
          )}

          {/* Desktop ProudPartner */}
          {showProudPartner && (
            <div className="hidden md:block">
              <br />
              <br />
              <ProudPartner section />
            </div>
          )}
        </div>

        {/* Right Image */}
        <div
          className={`relative overflow-hidden rounded-[16px] w-full h-[335px] ${imageHeight}`}
        >
          <CustomImage src={image} alt={subtitle || "Quiz image"} fill />
        </div>

        {/* Mobile ProudPartner */}
        {showProudPartner && (
          <div className="md:hidden">
            <br />
            <br />
            <ProudPartner section />
          </div>
        )}
      </div>
    </CoverSection>
  );
};

export default EDPreQuiz;
