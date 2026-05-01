import React, { useState, useEffect } from "react";
import CustomImage from "../utils/CustomImage";
import CustomContainImage from "../utils/CustomContainImage";
import { formatPriceUI } from "@/utils/priceFormatter";

const EdProductCards = ({
  product,
  isRecommended = false,
  onSelect,
  isSelected = false,
}) => {
  const {
    name,
    tagline,
    image,
    activeIngredient,
    strengths,
    preferences,
    frequencies,
    pillOptions,
  } = product;

  // If product comes with a selected preference, use it, otherwise default to "generic"
  const [selectedPreference, setSelectedPreference] = useState(
    product.selectedPreference || "generic"
  );
  const [selectedFrequency, setSelectedFrequency] = useState("monthly-supply");
  const [selectedPills, setSelectedPills] = useState(
    pillOptions[selectedFrequency][0]
  );

  // Only auto-select the recommended product on initial render
  useEffect(() => {
    if (isRecommended && onSelect && !isSelected) {
      // This will only run once when the component is initially mounted
      // to set the initial recommended product
      handleCardSelect();
    }
    // Empty dependency array means this only runs once on initial mount
  }, []);

  useEffect(() => {
    // Automatically select the first available pill option when frequency changes
    setSelectedPills(pillOptions[selectedFrequency][0]);
  }, [selectedFrequency, pillOptions]);

  // Handle card selection
  const handleCardSelect = () => {
    if (onSelect) {
      // Calculate the correct price based on preference
      const price =
        selectedPreference === "generic"
          ? selectedPills.genericPrice
          : selectedPills.brandPrice;

      // Get the correct variation ID based on preference
      const variationId =
        selectedPreference === "generic"
          ? selectedPills.genericVariationId
          : selectedPills.brandVariationId;

      // Add price and variationId to the options object
      onSelect(product, {
        preference: selectedPreference,
        frequency: selectedFrequency,
        pills: selectedPills,
        pillCount: selectedPills.count,
        price: price,
        variationId: variationId,
      });
    }
  };

  return (
    <div className="relative">
      {/* {isRecommended && (
                // <div className="absolute -top-0.5 left-0 right-0 z-10">
                //     <div className="h-[32px] bg-[#B0855B] text-white flex items-center justify-center rounded-t-[16px]">
                //         <span className="text-[12px] font-medium">Recommended</span>
                //     </div>
                // </div>
            )} */}

      <div
        className={`border-[0.5px] bg-white border-solid ${
          isSelected ? "border-[#A55255] border-2" : "border-[#E2E2E1]"
        } shadow-[0px_1px_1px_0px_#E2E2E1]  rounded-[16px] p-[16px] md:p-[24px] text-center h-full w-full min-w-[280px] md:min-w-[380px] ${
          isRecommended
            ? "pt-[32px] md:shadow-[0px_0px_16px_0px_#00000040]"
            : ""
        } cursor-pointer`}
        onClick={handleCardSelect}
      >
        <div className="flex justify-between items-start">
          <p className="text-[18px] font-[500] leading-[115%] mb-[4px] text-left">
            {name}
          </p>
          {/* Radio button indicator */}
          <div className="w-6 h-6 rounded-full border-2 border-[#B0855B] flex items-center justify-center">
            {isSelected && (
              <div className="w-4 h-4 rounded-full bg-[#B0855B]"></div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        <p className="text-[14px] font-[400] leading-[140%] mb-[4px] text-[#212121] text-left">
          {tagline}
        </p>

        <div className="relative overflow-hidden rounded-[16px] w-[248px] h-[140px] md:h-[130px] mx-auto">
          <CustomContainImage src={image} fill alt={name} />
        </div>

        <div className="min-h-[80px] md:min-h-[60px]">
          <p className="text-sm font-semibold text-[#212121]">
            Active ingredient:{" "}
            <span className="font-base font-normal">{activeIngredient}</span>
          </p>
          <p className="text-sm font-semibold text-[#212121]">
            Available in:{" "}
            <span className="font-base font-normal">
              {strengths.join(" & ")}
            </span>
          </p>
        </div>

        <p className="mt-[24px] text-[14px] leading-[140%] font-[500] text-left">
          Select preference
        </p>
        <p className="text-[10px] md:text-[12px] font-[400] leading-[140%] tracking-[-0.01em] md:tracking-[0] text-left mb-[12px] md:mb-[16px]">
          Generic is as effective as Brand, but costs less.
        </p>
        <div className="flex gap-[4px] md:gap-2">
          {preferences.map((pref) => (
            <p
              key={pref}
              className={`border-[1.5px] border-solid ${
                selectedPreference === pref
                  ? "border-[#A55255]"
                  : "border-[#CECECE]"
              } text-black text-center py-[6px] leading-[140%] rounded-[8px] w-full h-[32px] text-[14px] cursor-pointer shadow-[0px_1px_1px_0px_#E2E2E1]`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking preference
                setSelectedPreference(pref);
              }}
            >
              {pref.charAt(0).toUpperCase() + pref.slice(1)}
            </p>
          ))}
        </div>

        <p className="mt-[12px] md:mt-[16px] mb-[8px] text-[14px] leading-[140%] font-[500] text-left">
          Select frequency
        </p>
        <div className="flex gap-[4px] md:gap-2">
          {Object.keys(frequencies).map((freq) => (
            <p
              key={freq}
              className={`border-[1.5px] border-solid ${
                selectedFrequency === freq
                  ? "border-[#A55255]"
                  : "border-[#CECECE]"
              } text-black text-center py-[6px] leading-[140%] rounded-[8px] w-full h-[32px] text-[14px] cursor-pointer shadow-[0px_1px_1px_0px_#E2E2E1]`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking frequency
                setSelectedFrequency(freq);
              }}
            >
              {frequencies[freq]}
            </p>
          ))}
        </div>

        <p className="mt-[12px] md:mt-[16px] mb-[8px] text-[14px] leading-[140%] font-[500] text-left">
          How many pills?
        </p>
        <div className="flex gap-[4px] md:gap-2">
          {pillOptions[selectedFrequency].map((pill) => (
            <p
              key={pill.count}
              className={`border-[1.5px] border-solid ${
                selectedPills.count === pill.count
                  ? "border-[#A55255]"
                  : "border-[#CECECE]"
              } text-black text-center py-[6px] leading-[140%] rounded-[8px] w-full h-[32px] text-[14px] cursor-pointer shadow-[0px_1px_1px_0px_#E2E2E1]`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking pill count
                setSelectedPills(pill);
              }}
            >
              {pill.count}
            </p>
          ))}
        </div>

        <button
          className="bg-black transition hover:bg-gray-900 text-white font-semibold text-center py-3 rounded-full mt-[16px] md:mt-[24px] cursor-pointer w-full"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double handling
            handleCardSelect();
          }}
        >
          {isSelected
            ? `Selected - $${formatPriceUI(
                selectedPreference === "generic"
                  ? selectedPills.genericPrice
                  : selectedPills.brandPrice,
              )}`
            : `Select - $${formatPriceUI(
                selectedPreference === "generic"
                  ? selectedPills.genericPrice
                  : selectedPills.brandPrice,
              )}`}
        </button>
        <p className="text-[10px] md:text-[12px] leading-[140%] font-[400] mt-[8px]">
          *Dose request can be made during questionnaire
        </p>
      </div>
    </div>
  );
};

export default EdProductCards;
