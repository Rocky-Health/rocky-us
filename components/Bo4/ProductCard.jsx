import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaCheck, FaCheckCircle } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const activeIngredient =
    product.activeIngredient || product.activeIngeredient;

  return (
    <div
      className={`bg-white relative md:max-w-[370px] border border-gray-200 rounded-[16px] overflow-hidden w-full `}
    >
      {/* Image */}
      <div className="relative">
        <CustomImage
          src={product.image}
          width={370}
          height={210}
          alt={product.name}
          className="md:h-[210px] md:w-[370px] h-[180px] w-[335px] object-cover"
        />
        {product.label && (
          <div className="absolute top-[10px] left-[10px] bg-white px-[8px] py-[1.5px] rounded-[6px]">
            <span className="text-black text-[11px] font-medium leading-[140%] tracking-normal">
              {product.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-[16px] min-h-[270px]`}>
        {activeIngredient && (
          <p className="text-[14px] font-normal leading-[140%] tracking-normal text-black">
            {activeIngredient}
          </p>
        )}
        <h3 className="text-[24px] font-medium leading-[140%] tracking-[-0.02em] mt-[4px] text-black mb-[4px]">
          {product.name}
        </h3>
        <p className="text-[14px] font-normal leading-[140%] tracking-normal mt-[4px] text-black">
          {product.description}
        </p>

        <div className="mt-[16px]">
          {product.hasSale && (
            <p className="text-[14px] font-normal leading-[140%] text-black">
              Only
            </p>
          )}
          <div className="flex items-baseline gap-[12px] mt-[2px]">
            {product.hasSale && (
              <span className="text-[26px] font-medium line-through text-black">
                ${product.oldPrice}
              </span>
            )}
            <span className="text-[24px] font-medium text-black">
              ${product.price}
              <span className="text-[16px] font-normal text-black">/mo</span>
            </span>
          </div>
          {/* {product.WLPrograme && (
            <p className={`text-[14px] font-normal leading-[140%] text-black mt-[6px] `}>
              + $99/mo <span className={`${product.features ? 'underline' : ''}`}>Program Membership</span>
            </p>
          )} */}

          {product.features && (
            <div className="mb-[55px]">
              <hr className="mt-[16px] mb-[16px]" />
              <div className="flex flex-col gap-[12px] mb-[8px]">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex justify-start items-start gap-[12px]"
                  >
                    <FaCheckCircle className="text-[#AE7E56] shrink-0 text-[17px] mt-[2px]" />
                    <span className="text-[13px] font-normal leading-[140%] text-black">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="md:hidden block">
            {product.MobileFeatures && (
              <div className="mb-[55px]">
                <hr className="mb-[32px]" />
                <div className="flex flex-col gap-[12px] mb-[8px]">
                  {product.MobileFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex justify-start items-start gap-[12px]"
                    >
                      <FaCheckCircle className="text-[#AE7E56] shrink-0 text-[17px] mt-[2px]" />
                      <span className="text-[13px] font-normal leading-[140%] text-black">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                {product.UpperBtnLabel && (
                  <p className="text-center text-[12px] leading-[140%] font-medium mb-[47px] mt-[27px]">
                    {product.UpperBtnLabel}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <Link
          href="/wl-pre-consultation"
          className="bg-black absolute bottom-[16px] left-[16px] right-[16px] text-white text-[16px]  h-[44px] rounded-full flex items-center justify-center gap-[8px]"
        >
          Select {product.name} →
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
