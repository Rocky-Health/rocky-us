"use client";

import { useState } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CustomImage from "../utils/CustomImage";
import CustomContainImage from "../utils/CustomContainImage";
import BrandGenericModal from "../EDPlans/BrandGenericModal";
import DosageSelectionModal from "../EDPlans/DosageSelectionModal";
import CrossSellModal from "../EDPlans/CrossSellModal";
import { edFlowAddToCart } from "@/utils/flowCartHandler";
import { formatPriceUI } from "@/utils/priceFormatter";

const EdTreatment = () => {
  const router = useRouter();
  const [selectedFrequency, setSelectedFrequency] = useState("monthly-supply");
  const [selectedPillCount, setSelectedPillCount] = useState(8);

  // State for modals
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [dosageModalOpen, setDosageModalOpen] = useState(false);
  const [crossSellModalOpen, setCrossSellModalOpen] = useState(false);
  const [selectedDose, setSelectedDose] = useState("10mg");

  // Loading state for checkout
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const pillOptions = {
    "monthly-supply": [
      { count: 8, price: 138, variationId: "219484" },
      { count: 12, price: 202, variationId: "278229" },
    ],
    "quarterly-supply": [
      { count: 12, price: 202, variationId: "278230" },
      { count: 24, price: 394, variationId: "278231" },
      { count: 36, price: 586, variationId: "219488" },
    ],
  };

  const currentPills = pillOptions[selectedFrequency];
  const selectedPillOption =
    currentPills.find((p) => p.count === selectedPillCount) || currentPills[1];
  const currentPrice = selectedPillOption?.price || 0;

  // Handle product selection
  const handleProductSelect = () => {
    setDosageModalOpen(true);
  };

  // Handle dosage selection
  const handleDosageContinue = () => {
    setDosageModalOpen(false);
    setCrossSellModalOpen(true);
  };

  // Note: getCheckoutUrl() function removed - now using direct cart addition

  // Handle checkout
  const handleCheckout = async (addons = []) => {
    try {
      logger.log("Chewalis checkout with addons:", addons);
      setIsCheckoutLoading(true);

      // Create main product data
      const mainProduct = {
        id: selectedPillOption.variationId,
        name: "Chewalis",
        price: currentPrice,
        quantity: 1,
        isSubscription: selectedFrequency === "monthly-supply",
        variationId: selectedPillOption.variationId,
      };

      logger.log("Chewalis main product:", mainProduct);
      logger.log("Chewalis addons:", addons);

      // Use the new direct cart handler
      const result = await edFlowAddToCart(mainProduct, addons, {
        requireConsultation: true,
      });

      if (result.success) {
        logger.log("🎉 Chewalis - SUCCESS! Result:", result);
        setCrossSellModalOpen(false);
        setIsCheckoutLoading(false);

        // Use Next.js navigation instead of window.location.href
        router.push(result.redirectUrl);
      } else {
        logger.error("❌ Chewalis - FAILED! Error:", result.error);
        setIsCheckoutLoading(false);
        alert(
          result.error ||
            "There was an issue processing your checkout. Please try again.",
        );
      }
    } catch (error) {
      logger.error("Error during Chewalis checkout:", error);
      setIsCheckoutLoading(false);
      alert("There was an issue processing your checkout. Please try again.");
    }
  };

  // Prepare selected product data for checkout
  const selectedProductData = {
    name: "Chewalis",
    activeIngredient: "Tadalafil",
    preference: "generic",
    frequency: selectedFrequency,
    pills: selectedPillOption.count,
    price: currentPrice,
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/chewalis-ed.webp",
    dosage: selectedDose,
    productIds: selectedPillOption.variationId,
  };

  return (
    <div className="mx-auto w-full md:flex md:flex-col md:items-center">
      {/* Header */}
      <div className="text-3xl lg:text-[48px] md:leading-[48px] font-[550] mb-8 headers-font text-center">
        ED Treatments,
        <br />
        on your own terms
      </div>

      {/* Feature List */}
      <ul className="mb-8 space-y-4 text-sm md:text-lg">
        {features.map((item, index) => (
          <li key={index} className="flex items-center space-x-3">
            <Image src={item.icon} alt={item.alt} width={24} height={24} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {/* Product Card */}
      <div className="bg-gradient-to-b from-[#ffffff00] to-[#f3f2ed] rounded-3xl p-6 text-center h-full w-full max-w-[380px]">
        <p className="text-2xl font-semibold">Chewalis</p>
        <p className="text-sm text-[#212121]">"The weekender"</p>

        {/* Image */}
        <div className="relative  mt-6 w-[160px] h-[130px] mx-auto">
          <CustomContainImage
            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/chewalis-ed.webp"
            alt="Chewalis"
            fill
          />
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/canada-approved-300x300-1.webp"
            alt="US Approved"
            width={32}
            height={32}
            className="absolute -top-3 -left-3"
          />
        </div>

        <p className="text-sm font-semibold mt-6 text-[#212121]">
          Lasts up to: 24–36 hours
        </p>
        <p className="text-sm font-semibold text-[#212121]">
          Available in: <span className="font-normal">10mg & 20mg</span>
        </p>

        {/* Frequency */}
        <p className="mt-4 font-semibold text-left">Select frequency</p>
        <div className="flex gap-2">
          {Object.entries(frequencies).map(([key, label]) => (
            <div
              key={key}
              className={`border-2 text-black text-center py-1 rounded-[8px] w-full text-sm cursor-pointer ${
                selectedFrequency === key
                  ? "border-[#A55255]"
                  : "border-[#CECECE]"
              }`}
              onClick={() => {
                setSelectedFrequency(key);
                setSelectedPillCount(pillOptions[key][0].count); // default to first option
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Pills */}
        <p className="mt-2 font-semibold text-left">How many pills?</p>
        <div className="flex gap-2">
          {currentPills.map((pill) => (
            <div
              key={pill.count}
              className={`border-2 text-black text-center py-1 rounded-[8px] w-full text-sm cursor-pointer ${
                selectedPillCount === pill.count
                  ? "border-[#A55255]"
                  : "border-[#CECECE]"
              }`}
              onClick={() => setSelectedPillCount(pill.count)}
            >
              {pill.count}
            </div>
          ))}
        </div>

        {/* Button */}
        <p
          className="py-3 mt-6 font-semibold text-center text-white bg-black rounded-full cursor-pointer product-select"
          onClick={handleProductSelect}
        >
          ${formatPriceUI(currentPrice)} - Select
        </p>
        <p className="mt-4 mb-2 text-xs text-gray-500">
          *Dose request can be made during questionnaire
        </p>
      </div>

      {/* Logo */}
      <div className="hidden justify-center mt-6 w-full md:w-1/4 md:flex">
        <Image src="/OCP-IMGS.webp" alt="Logos" width={315} height={48} />
      </div>

      {/* Modals */}
      <BrandGenericModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
      />
      <DosageSelectionModal
        isOpen={dosageModalOpen}
        onClose={() => setDosageModalOpen(false)}
        onContinue={handleDosageContinue}
        selectedDose={selectedDose}
        setSelectedDose={setSelectedDose}
        product={{ name: "Chewalis" }} // Pass a simple product object with name for the modal to work properly
      />
      <CrossSellModal
        isOpen={crossSellModalOpen}
        onClose={() => setCrossSellModalOpen(false)}
        selectedProduct={selectedProductData}
        onCheckout={handleCheckout}
        isLoading={isCheckoutLoading}
      />
    </div>
  );
};

export default EdTreatment;

// Data
const features = [
  {
    icon: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/hospital%201.png",
    alt: "Hospital",
    text: "Prescribed online by licensed providers",
  },
  {
    icon: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/stethoscope%201.png",
    alt: "Support",
    text: "Unlimited 1:1 Medical support",
  },
  {
    icon: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/dns-services%201.png",
    alt: "Discreet",
    text: "Discreet packaging & shipping",
  },
];

const frequencies = {
  "monthly-supply": "One Month",
  "quarterly-supply": "Three Months",
};
