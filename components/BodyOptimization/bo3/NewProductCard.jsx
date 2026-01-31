import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";

const NewProductCard = ({ product, btnColor = null, consultationHref = "/wl-pre-consultation" }) => {
  return (
    <div className="relative rounded-[16px] overflow-hidden w-[288px] h-[400px] border border-solid border-[#E2E2E1] bg-white shadow-md">
      {/* Product Image */}
      <div className="relative w-full h-full">
        <CustomImage
          src={product.image}
          alt={product.name}
          fill
          className="!object-contain !object-center"
        />
      </div>

      {/* Top Content - Title and Badges */}
      <div className="absolute top-0 left-0 w-full p-6 z-10">
        <h3 className="text-3xl w-fit mb-4 relative">
          {product.name}
          {product.prescription && product.prescription ? (
            <span className="text-lg font-bold absolute right-[-25px] top-[-7px]">
              ℞
            </span>
          ) : (
            <span className="text-[40px] font-bold absolute right-[-25px] top-[-7px]">
              ®
            </span>
          )}
        </h3>
        <div className="flex flex-row gap-2">
          <div
            className={`flex h-6 px-2 items-center justify-center gap-[6px] rounded ${
              product.supplyStatus.toLowerCase().includes("limited")
                ? "border border-orange-500 bg-white"
                : "border border-[#34A853] bg-white"
            }`}
          >
            {product.supplyStatus.toLowerCase().includes("limited") ? (
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            )}
            <span className="poppins-font text-[#000] text-[12px] font-[400] leading-[140%] not-italic">
              {product.supplyStatus}
            </span>
          </div>
          <div className="flex h-6 px-2 items-center justify-center gap-[6px] rounded border border-gray-300 bg-white">
            <span className="poppins-font text-[#000] text-[12px] font-[400] leading-[140%] not-italic">
              {product.ingredient}
            </span>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom with Buttons */}
      <div className="absolute bottom-0 left-0 w-full h-[106px] flex flex-col justify-end items-start gap-4 p-6 z-20">
        <div className="flex gap-2 w-full justify-between items-center">
          <Link
            href={consultationHref}
            prefetch={true}
            className="bg-[#013D3D] text-white py-3 px-3 rounded-[64px] flex items-center justify-center text-sm cursor-pointer w-[118px]"
          >
            <span>Get Started</span>
          </Link>
          <Link
            href={product.link}
            className="bg-white border border-gray-400 text-black py-3 px-3 rounded-[64px] flex items-center justify-center text-sm cursor-pointer w-[118px]"
            prefetch={true}
          >
            <span>Learn More</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewProductCard;
