"use client";
import CustomContainImage from "@/components/utils/CustomContainImage";
import { useState } from "react";
import AccordionItem from "@/components/AccordionItem";

const AccordionList = ({ data }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(data[0].image);

  const handleItemClick = (index, image) => {
    setOpenIndex(openIndex === index ? null : index);
    if (image) setSelectedImage(image);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-4 lg:gap-[117px] items-center">
      <div className="w-full md:w-[483px]">
        <ul className="mb-5 text-base font-normal max-w-[550px]">
          {data.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              isFirst={index === 0}
              onClick={() => handleItemClick(index, item.image)}
            />
          ))}
        </ul>
      </div>
      {selectedImage && (
        <div className="relative overflow-hidden rounded-[16px] hidden md:flex w-full md:w-[552px] h-[335px] md:h-[640px] justify-center lg:justify-start">
          <CustomContainImage src={selectedImage} fill priority sizes="(max-width: 768px) 1px, 552px" />
        </div>
      )}
    </div>
  );
};

export default AccordionList;
