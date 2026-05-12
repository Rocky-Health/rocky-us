import React from "react";
import { formatPriceUI } from "@/utils/priceFormatter";

const WLProductCard = ({ product, isRecommended, onSelect, isSelected }) => {
  return (
    <div
      className="border-[0.5px] bg-white border-solid border-[#E2E2E1] shadow-[0px_1px_1px_0px_#E2E2E1] rounded-[16px] p-[16px] md:p-[24px] cursor-pointer"
      onClick={() => onSelect && onSelect(product)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
            {isRecommended && (
              <div className="w-5 h-5 rounded-full border-2 border-[#814B00] flex-shrink-0">
                {isSelected && (
                  <div className="w-3 h-3 bg-[#814B00] rounded-full m-[3px]" />
                )}
              </div>
            )}
          </div>
          <div className="mt-2">
            <p className="text-lg font-semibold">
              ${formatPriceUI(product.price)}
            </p>
            <p className="text-sm text-gray-600 mt-1">{product.details}</p>
            {product.supplyAvailable && (
              <span className="inline-block text-[#098C60] mt-2 px-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded-full">
                Supply available
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WLProductCard;
