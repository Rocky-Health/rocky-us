// components/TeamMemberCard.jsx
import { useState } from "react";
import CustomImage from "../utils/CustomImage";
import CustomContainImage from "../utils/CustomContainImage";

const TeamCard = ({
  name,
  title,
  subtitle,
  description,
  imageSrc,
  CoverImage,
  index,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleReadMore = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className="text-center">
        <div className="relative rounded-2xl overflow-hidden w-[284px] md:w-[384px] h-[310px] md:h-[420px] mb-6">
          <CustomImage
            fill
            src={CoverImage}
            alt={name}
            className={` ${
              index === 0
                ? "!object-[-2px_52px] md:!object-[13px_40px]"
                : "object-[center_60px]"
            }`}
          />
        </div>

        <p className="text-[22px] md:text-[30px] headers-font mb-4">{name}</p>
        <p className="text-[14px] md:text-[16px] leading-[140%] text-[#212121] mb-1">
          {title}
        </p>
        <p className="text-[14px] md:text-[16px] leading-[140%] text-[#757575] mb-2 md:mb-4">{subtitle}</p>
        <div
          className="text-[#212121] text-[14px]  font-normal underline leading-tight cursor-pointer"
          onClick={handleReadMore}
        >
          Read more
        </div>
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center md:items-end md:justify-end z-[999]">
          <div className="bg-white px-5 py-10 md:max-w-lg w-full relative h-full overflow-y-auto md:overflow-y-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex flex-col items-start md:mt-12">
                <h2 className="text-[22px] md:text-[30px] leading-[115%] md:leading-[110%] mb-1 headers-font">
                  {name}
                </h2>
                {name !== title && (
                  <p className="text-[16px] leading-[140%] font-[400] text-[#757575] mb-1">
                    {title}
                  </p>
                )}
                <p className="text-[16px] leading-[140%] font-[400] text-[#757575] mb-1">
                  {subtitle}
                </p>
              </div>
              <button
                className="text-gray-700 text-2xl bg-[#E2E2E1] rounded-full h-10 w-10 flex items-center justify-center"
                onClick={handleClosePopup}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10 ">
              <p className="text-start text-[16px] leading-[140%] font-[400] text-[#212121] md:w-[240px]">
                {description}
              </p>
              <div className="relative rounded-2xl overflow-hidden w-full h-[335] md:w-[200px] md:h-[200px]">
                <CustomImage src={imageSrc} alt={name} fill />
              </div>
              {/* <img
                className="w-full aspect-[1] md:w-[200px] md:h-[200px] rounded-2xl mx-auto object-cover "
                src={imageSrc}
                alt={name}
              /> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamCard;
