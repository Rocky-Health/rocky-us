"use client";
import { formatPriceUI } from "@/utils/priceFormatter";

const BrandGenericModal = ({
  isOpen,
  onClose,
  onSwitchToGeneric,
  onContinueWithBrand,
  genericPrice,
  brandPrice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="py-[40px] pb-[20px] px-4 shadow-xl w-full max-w-[360px] bg-white rounded-2xl relative">
        <h2 className="text-[26px] text-center">
          Switch to Generic and{" "}
          <span className="text-[#AE7E56]">Save up to 50%</span>
        </h2>
        <h4 className="mb-[30px] text-sm text-center tracking-normal">
          (You'll get more bang for your buck, literally)
        </h4>

        <ul className="text-sm">
          <li className="flex items-center">
            <strong className="min-w-[40%]">Active ingredient:</strong>
            <span>Exact same in both</span>
          </li>
          <li className="flex items-center">
            <strong className="min-w-[40%]">Effectiveness:</strong>
            <span>100% as effective as brand</span>
          </li>
          <li className="flex items-center">
            <strong className="min-w-[40%]">Interchangeable:</strong>
            <span>FDA-Approved</span>
          </li>
        </ul>

        <div className="pricing-box my-2 p-2 px-4 border border-solid border-gray-200 rounded-xl">
          <div className="flex items-center justify-between w-full">
            <p>Price</p>
            <div>
              <span className="text-[24px] fond-semibold text-[#AE7E56]">
                ${formatPriceUI(genericPrice)}
              </span>
              &nbsp;
              <del className="text-[18px] text-gray-400">
                ${formatPriceUI(brandPrice)}
              </del>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToGeneric}
          className="bg-[#AE7E56] text-white block w-full text-center py-2 rounded-3xl"
        >
          Switch to Generic
        </button>

        <button
          onClick={onContinueWithBrand}
          className="text-black block w-full text-center mt-2"
        >
          No Thanks
        </button>

        <button
          onClick={onClose}
          className="absolute p-2 px-4 top-2 left-2 text-black"
        >
          &lt;
        </button>
      </div>
    </div>
  );
};

export default BrandGenericModal;
